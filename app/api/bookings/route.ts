/**
 * API Routes for Bookings
 * 
 * POST /api/bookings - Create a new booking
 * GET /api/bookings/my - Get current user's bookings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SessionStatus, BookingStatus } from '@/lib/types'

/**
 * Helper function to get current user ID
 * 
 * For now, we get it from the 'x-user-id' header.
 * In production, this should come from authentication (JWT, session, etc.)
 * 
 * Fallback: You can hardcode a user ID for testing by uncommenting the return statement below.
 */
function getCurrentUserId(request: NextRequest): string | null {
  // For testing: uncomment the line below and replace with a real user ID from your database
  // return 'your-user-id-here'
  
  const userId = request.headers.get('x-user-id')
  return userId
}

/**
 * POST /api/bookings
 * 
 * Request body:
 * - sessionId: string
 * - userId: string (client user ID)
 * 
 * Business rules:
 * - Session must exist and have status PLANNED
 * - Current time must be before Session.startAt
 * - Session must not be full (active bookings < maxClients)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userId } = body

    // Validate required fields
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, userId' },
        { status: 400 }
      )
    }

    // Fetch the session with related data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
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

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session status is PLANNED
    if (session.status !== SessionStatus.PLANNED) {
      return NextResponse.json(
        { error: 'Cannot book a session that is not planned' },
        { status: 400 }
      )
    }

    // Check if current time is before session start time
    const now = new Date()
    if (now >= session.startAt) {
      return NextResponse.json(
        { error: 'Cannot book a session that has already started or passed' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active booking for this session
    const existingBooking = await prisma.booking.findFirst({
      where: {
        sessionId: sessionId,
        userId: userId,
        status: BookingStatus.ACTIVE,
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have an active booking for this session' },
        { status: 400 }
      )
    }

    // Count active bookings for this session
    const activeBookingsCount = await prisma.booking.count({
      where: {
        sessionId: sessionId,
        status: BookingStatus.ACTIVE,
      },
    })

    // Check if session is full
    if (activeBookingsCount >= session.maxClients) {
      return NextResponse.json(
        { error: 'Session is full' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        sessionId: sessionId,
        userId: userId,
        status: BookingStatus.ACTIVE,
      },
      include: {
        session: {
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
        },
      },
    })

    // Format response
    const formattedBooking = {
      id: booking.id,
      sessionId: booking.sessionId,
      userId: booking.userId,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      session: {
        id: booking.session.id,
        trainerName: booking.session.trainer.user.name,
        workoutTypeName: booking.session.workoutType.name,
        startAt: booking.session.startAt.toISOString(),
        endAt: booking.session.endAt.toISOString(),
        maxClients: booking.session.maxClients,
      },
    }

    return NextResponse.json(formattedBooking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings/my
 * 
 * Returns all ACTIVE and future bookings for the current user.
 * Includes session details (date, time, trainer, workout type).
 * 
 * Query parameters:
 * - userId: Current user ID (required, can also be provided in x-user-id header)
 * 
 * Headers:
 * - x-user-id: Current user ID (optional, if not provided in query params)
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get userId from query params first, then from header
    const searchParams = request.nextUrl.searchParams
    const userIdFromQuery = searchParams.get('userId')
    const userId = userIdFromQuery || getCurrentUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Provide it in the userId query parameter or x-user-id header.' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const now = new Date()

    // Fetch active bookings and future bookings for this user
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
        status: BookingStatus.ACTIVE,
        session: {
          startAt: {
            gte: now, // Only future sessions
          },
          status: SessionStatus.PLANNED, // Only planned sessions
        },
      },
      include: {
        session: {
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
        },
      },
      orderBy: {
        session: {
          startAt: 'asc',
        },
      },
    })

    // Format response
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      sessionId: booking.sessionId,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      session: {
        id: booking.session.id,
        date: booking.session.startAt.toISOString().split('T')[0],
        startAt: booking.session.startAt.toISOString(),
        endAt: booking.session.endAt.toISOString(),
        trainerName: booking.session.trainer.user.name,
        workoutTypeName: booking.session.workoutType.name,
        maxClients: booking.session.maxClients,
      },
    }))

    return NextResponse.json(formattedBookings, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}




