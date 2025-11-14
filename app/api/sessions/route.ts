/**
 * API Routes for Sessions
 * 
 * GET /api/sessions - Get list of sessions with optional filters
 * POST /api/sessions - Create a new session
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SessionStatus, BookingStatus } from '@/lib/types'

/**
 * GET /api/sessions
 * 
 * Query parameters:
 * - date (optional): YYYY-MM-DD format to filter by calendar date
 * - trainerId (optional): Filter by trainer ID
 * - userId (optional): Current user ID to check if they booked each session
 * 
 * Returns: List of sessions with trainer name and workout type name
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const trainerId = searchParams.get('trainerId')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: any = {
      status: SessionStatus.PLANNED, // Only show planned sessions by default
    }

    // Filter by date if provided
    if (date) {
      const dateObj = new Date(date)
      const nextDay = new Date(dateObj)
      nextDay.setDate(nextDay.getDate() + 1)

      where.startAt = {
        gte: dateObj,
        lt: nextDay,
      }
    }

    // Filter by trainer if provided
    if (trainerId) {
      where.trainerId = trainerId
    }

    // Fetch sessions with related data
    const sessions = await prisma.session.findMany({
      where,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        workoutType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    })

    // Format response with active bookings count and free spots
    const formattedSessions = await Promise.all(
      sessions.map(async (session) => {
        // Count active bookings for this session
        const activeBookingsCount = await prisma.booking.count({
          where: {
            sessionId: session.id,
            status: BookingStatus.ACTIVE,
          },
        })

        const capacityLeft = Math.max(0, session.maxClients - activeBookingsCount)

        // Check if current user has booked this session
        let isBookedByCurrentUser = false
        if (userId) {
          const userBooking = await prisma.booking.findFirst({
            where: {
              sessionId: session.id,
              userId: userId,
              status: BookingStatus.ACTIVE,
            },
          })
          isBookedByCurrentUser = !!userBooking
        }

        return {
          id: session.id,
          trainerId: session.trainerId,
          trainerName: session.trainer.user.name,
          workoutTypeId: session.workoutTypeId,
          workoutTypeName: session.workoutType.name,
          startAt: session.startAt.toISOString(),
          endAt: session.endAt.toISOString(),
          maxClients: session.maxClients,
          activeBookings: activeBookingsCount,
          capacityLeft: capacityLeft,
          isBookedByCurrentUser: isBookedByCurrentUser,
          status: session.status,
          createdAt: session.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json(formattedSessions, { status: 200 })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * 
 * Request body:
 * - trainerId: string
 * - workoutTypeId: string
 * - startAt: ISO string
 * - endAt: ISO string
 * - maxClients: number
 * 
 * Business rules:
 * - Duration must be between 60 and 120 minutes
 * - maxClients must be between 1 and 10
 * - No overlapping sessions (single-room rule)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trainerId, workoutTypeId, startAt, endAt, maxClients } = body

    // Validate required fields
    if (!trainerId || !workoutTypeId || !startAt || !endAt || maxClients === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: trainerId, workoutTypeId, startAt, endAt, maxClients' },
        { status: 400 }
      )
    }

    // Parse dates
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 }
      )
    }

    // Validate endAt is after startAt
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'endAt must be after startAt' },
        { status: 400 }
      )
    }

    // Validate duration (60-120 minutes)
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    if (durationMinutes < 60 || durationMinutes > 120) {
      return NextResponse.json(
        { error: 'Session duration must be between 60 and 120 minutes' },
        { status: 400 }
      )
    }

    // Validate maxClients (1-10)
    if (typeof maxClients !== 'number' || maxClients < 1 || maxClients > 10) {
      return NextResponse.json(
        { error: 'maxClients must be a number between 1 and 10' },
        { status: 400 }
      )
    }

    // Check for overlapping sessions (single-room rule)
    // A session overlaps if:
    // - It starts before this session ends AND ends after this session starts
    const overlappingSessions = await prisma.session.findMany({
      where: {
        status: SessionStatus.PLANNED, // Only check planned sessions
        startAt: {
          lt: endDate, // Starts before this session ends
        },
        endAt: {
          gt: startDate, // Ends after this session starts
        },
      },
    })

    if (overlappingSessions.length > 0) {
      return NextResponse.json(
        {
          error: 'Session time overlaps with an existing session. The studio can only host one session at a time.',
          overlappingSessionId: overlappingSessions[0].id,
        },
        { status: 400 }
      )
    }

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    })

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      )
    }

    // Verify workout type exists
    const workoutType = await prisma.workoutType.findUnique({
      where: { id: workoutTypeId },
    })

    if (!workoutType) {
      return NextResponse.json(
        { error: 'Workout type not found' },
        { status: 404 }
      )
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        trainerId,
        workoutTypeId,
        startAt: startDate,
        endAt: endDate,
        maxClients,
        status: SessionStatus.PLANNED,
      },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        workoutType: {
          select: {
            name: true,
          },
        },
      },
    })

    // Format response
    const formattedSession = {
      id: session.id,
      trainerId: session.trainerId,
      trainerName: session.trainer.user.name,
      workoutTypeId: session.workoutTypeId,
      workoutTypeName: session.workoutType.name,
      startAt: session.startAt.toISOString(),
      endAt: session.endAt.toISOString(),
      maxClients: session.maxClients,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
    }

    return NextResponse.json(formattedSession, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

