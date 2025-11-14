/**
 * API Route for Workout Types
 * 
 * GET /api/workout-types - Get all workout types
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/workout-types
 * 
 * Returns: List of all workout types
 */
export async function GET() {
  try {
    const workoutTypes = await prisma.workoutType.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(workoutTypes, { status: 200 })
  } catch (error) {
    console.error('Error fetching workout types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout types' },
      { status: 500 }
    )
  }
}




