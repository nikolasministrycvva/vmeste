/**
 * API Route for Cancelling a Booking
 * 
 * PATCH /api/bookings/[id]/cancel
 * 
 * Allows a client to cancel their own booking.
 * 
 * Business rules:
 * - Booking must belong to the current user
 * - Session must not have started yet
 * - At least 2 hours must remain before session.startAt
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@/lib/types'

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
 * PATCH /api/bookings/[id]/cancel
 * 
 * Cancels a booking:
 * - Sets booking.status = CANCELLED_BY_CLIENT
 * - Sets cancelledAt = now()
 * 
 * Headers:
 * - x-user-id: Current user ID (required)
 * 
 * Business rules:
 * - Booking must belong to the current user
 * - Session must not have started yet
 * - At least 2 hours must remain before session.startAt
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const userId = getCurrentUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Provide it in the x-user-id header.' },
        { status: 400 }
      )
    }

    // Fetch the booking with session details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check that the booking belongs to the current user
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      )
    }

    // Check that booking is active
    if (booking.status !== BookingStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Booking is already cancelled or inactive' },
        { status: 400 }
      )
    }

    // Check that the session has not started yet
    const now = new Date()
    if (now >= booking.session.startAt) {
      return NextResponse.json(
        { error: 'Cannot cancel a booking for a session that has already started' },
        { status: 400 }
      )
    }

    // Check that there are at least 2 hours remaining before session.startAt
    const hoursUntilSession = (booking.session.startAt.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursUntilSession < 2) {
      return NextResponse.json(
        { error: 'Too late to cancel. You must cancel at least 2 hours before the session starts.' },
        { status: 400 }
      )
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED_BY_CLIENT,
        cancelledAt: now,
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
      id: updatedBooking.id,
      sessionId: updatedBooking.sessionId,
      status: updatedBooking.status,
      cancelledAt: updatedBooking.cancelledAt?.toISOString(),
      session: {
        id: updatedBooking.session.id,
        trainerName: updatedBooking.session.trainer.user.name,
        workoutTypeName: updatedBooking.session.workoutType.name,
        startAt: updatedBooking.session.startAt.toISOString(),
        endAt: updatedBooking.session.endAt.toISOString(),
      },
    }

    return NextResponse.json(
      {
        message: 'Booking cancelled successfully',
        booking: formattedBooking,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}




