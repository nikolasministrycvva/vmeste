/**
 * API Route for Test Users
 * 
 * GET /api/test-users - Get list of test users for development
 * 
 * NOTE: This is a temporary endpoint for development/testing.
 * In production, this will be removed and replaced with real authentication.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/types'

/**
 * GET /api/test-users
 * 
 * Returns: List of test users with their IDs and roles
 */
export async function GET() {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { telegramId: 'admin-telegram-id' },
    })

    // Get client user
    const client = await prisma.user.findUnique({
      where: { telegramId: 'client-telegram-id' },
    })

    // Get trainer Anna
    const trainerAnnaUser = await prisma.user.findFirst({
      where: {
        telegramId: 'anna-telegram-id',
        role: Role.TRAINER,
      },
    })

    let trainerAnna = null
    if (trainerAnnaUser) {
      const trainerProfile = await prisma.trainer.findUnique({
        where: { userId: trainerAnnaUser.id },
        select: {
          id: true,
        },
      })
      trainerAnna = {
        user: trainerAnnaUser,
        trainerProfile,
      }
    }

    const testUsers = []

    if (admin) {
      testUsers.push({
        id: admin.id,
        name: admin.name,
        role: admin.role,
        type: 'admin',
      })
    }

    if (client) {
      testUsers.push({
        id: client.id,
        name: client.name,
        role: client.role,
        type: 'client',
      })
    }

    if (trainerAnna && trainerAnna.user) {
      testUsers.push({
        id: trainerAnna.user.id,
        name: trainerAnna.user.name,
        role: trainerAnna.user.role,
        trainerId: trainerAnna.trainerProfile?.id,
        type: 'trainer',
      })
    }

    return NextResponse.json(testUsers, { status: 200 })
  } catch (error) {
    console.error('Error fetching test users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test users' },
      { status: 500 }
    )
  }
}

