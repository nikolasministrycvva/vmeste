/**
 * API Route for getting Trainer ID by User ID
 * 
 * GET /api/trainers/by-user/[userId]
 * 
 * NOTE: This is a temporary endpoint for development/testing.
 * In production, this will be replaced with proper authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/trainers/by-user/[userId]
 * 
 * Returns: Trainer ID for the given user ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const trainer = await prisma.trainer.findUnique({
      where: { userId: userId },
      select: {
        id: true,
      },
    })

    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trainerId: trainer.id }, { status: 200 })
  } catch (error) {
    console.error('Error fetching trainer ID:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainer ID' },
      { status: 500 }
    )
  }
}




