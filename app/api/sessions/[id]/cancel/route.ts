/**
 * API Route for Cancelling a Session
 * 
 * PATCH /api/sessions/[id]/cancel
 * 
 * Cancels a session and all related active bookings.
 * Sets booking status to CANCELLED_BY_TRAINER and cancelledAt timestamp.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SessionStatus, BookingStatus } from '@/lib/types'

/**
 * PATCH /api/sessions/[id]/cancel
 * 
 * Cancels a session:
 * - Sets Session.status = CANCELLED
 * - For all related bookings with status ACTIVE:
 *   - Sets status = CANCELLED_BY_TRAINER
 *   - Sets cancelledAt = now()
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // Find the session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        bookings: {
          where: {
            status: BookingStatus.ACTIVE,
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

    // Check if session is already cancelled
    if (session.status === SessionStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'Session is already cancelled' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update session status
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.CANCELLED,
        },
      })

      // Update all active bookings
      const activeBookings = session.bookings
      if (activeBookings.length > 0) {
        await tx.booking.updateMany({
          where: {
            sessionId: sessionId,
            status: BookingStatus.ACTIVE,
          },
          data: {
            status: BookingStatus.CANCELLED_BY_TRAINER,
            cancelledAt: new Date(),
          },
        })

        // TODO: notify clients via Telegram
        console.log(
          `TODO: Notify ${activeBookings.length} client(s) via Telegram about session cancellation`
        )
      }

      return {
        session: updatedSession,
        cancelledBookingsCount: activeBookings.length,
      }
    })

    return NextResponse.json(
      {
        message: 'Session cancelled successfully',
        sessionId: result.session.id,
        cancelledBookingsCount: result.cancelledBookingsCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error cancelling session:', error)
    return NextResponse.json(
      { error: 'Failed to cancel session' },
      { status: 500 }
    )
  }
}

