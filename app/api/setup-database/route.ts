/**
 * API Route for setting up database tables
 * 
 * GET /api/setup-database - Create all tables in PostgreSQL database
 * 
 * WARNING: This is a temporary endpoint for first-time setup.
 * Should be removed or protected after database is set up.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/types'

async function seedDatabase() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { telegramId: 'admin-telegram-id' },
    update: {},
    create: {
      name: 'Admin',
      telegramId: 'admin-telegram-id',
      role: Role.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.name)

  // Create client user
  const client = await prisma.user.upsert({
    where: { telegramId: 'client-telegram-id' },
    update: {},
    create: {
      name: 'Client 1',
      telegramId: 'client-telegram-id',
      role: Role.CLIENT,
      isActive: true,
    },
  })
  console.log('✅ Client user created:', client.name)

  // Create trainer users
  const trainers = [
    {
      name: 'Anna',
      telegramId: 'anna-telegram-id',
      description: 'Experienced functional training specialist with 5+ years of experience. Focuses on improving mobility and overall fitness.',
    },
    {
      name: 'Max',
      telegramId: 'max-telegram-id',
      description: 'Strength and conditioning coach. Helps clients build muscle and increase power through progressive overload.',
    },
    {
      name: 'Olga',
      telegramId: 'olga-telegram-id',
      description: 'Yoga and stretching instructor. Specializes in flexibility, relaxation, and body awareness.',
    },
  ]

  const createdTrainers = []
  for (const trainerData of trainers) {
    const user = await prisma.user.upsert({
      where: { telegramId: trainerData.telegramId },
      update: {},
      create: {
        name: trainerData.name,
        telegramId: trainerData.telegramId,
        role: Role.TRAINER,
        isActive: true,
      },
    })

    const trainer = await prisma.trainer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        description: trainerData.description,
      },
    })

    createdTrainers.push({ user, trainer })
    console.log(`✅ Trainer created: ${user.name}`)
  }

  // Create workout types
  const workoutTypes = [
    {
      name: 'Functional',
      description: 'Functional training focuses on movements that prepare your body for daily activities.',
    },
    {
      name: 'Strength',
      description: 'Strength training builds muscle mass and increases overall power.',
    },
    {
      name: 'Stretching',
      description: 'Stretching sessions improve flexibility, reduce muscle tension, and enhance mobility.',
    },
  ]

  for (const workoutTypeData of workoutTypes) {
    const workoutType = await prisma.workoutType.upsert({
      where: { name: workoutTypeData.name },
      update: {},
      create: {
        name: workoutTypeData.name,
        description: workoutTypeData.description,
      },
    })
    console.log(`✅ Workout type created: ${workoutType.name}`)
  }

  return {
    admin: 1,
    client: 1,
    trainers: createdTrainers.length,
    workoutTypes: workoutTypes.length,
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up database tables...')

    // SQL для создания таблиц в PostgreSQL
    const sql = `
      -- CreateTable User
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "telegramId" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- CreateTable Trainer
      CREATE TABLE IF NOT EXISTS "Trainer" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- CreateTable WorkoutType
      CREATE TABLE IF NOT EXISTS "WorkoutType" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- CreateTable Session
      CREATE TABLE IF NOT EXISTS "Session" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "trainerId" TEXT NOT NULL,
          "workoutTypeId" TEXT NOT NULL,
          "startAt" TIMESTAMP(3) NOT NULL,
          "endAt" TIMESTAMP(3) NOT NULL,
          "maxClients" INTEGER NOT NULL DEFAULT 10,
          "status" TEXT NOT NULL DEFAULT 'PLANNED',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Session_workoutTypeId_fkey" FOREIGN KEY ("workoutTypeId") REFERENCES "WorkoutType"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- CreateTable Booking
      CREATE TABLE IF NOT EXISTS "Booking" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "cancelledAt" TIMESTAMP(3),
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Booking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `

    // Выполняем SQL
    await prisma.$executeRawUnsafe(sql)

    console.log('Database tables created successfully')

    // Автоматически заполняем базу данных тестовыми данными
    console.log('Starting to seed database...')
    const seedResult = await seedDatabase()
    console.log('Database seeded successfully')

    return NextResponse.json(
      { 
        message: 'Database setup completed successfully!',
        tables: ['User', 'Trainer', 'WorkoutType', 'Session', 'Booking'],
        seed: {
          message: 'Database automatically filled with test data',
          created: seedResult
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error setting up database:', error)
    
    // Если таблицы уже существуют, попробуем заполнить базу данных
    if (error.message?.includes('already exists') || error.code === '42P07') {
      console.log('Tables already exist, trying to seed database...')
      try {
        const seedResult = await seedDatabase()
        return NextResponse.json(
          { 
            message: 'Tables already exist. Database filled with test data.',
            warning: error.message,
            seed: {
              message: 'Database automatically filled with test data',
              created: seedResult
            }
          },
          { status: 200 }
        )
      } catch (seedError: any) {
        return NextResponse.json(
          { 
            message: 'Tables already exist, but seeding failed',
            warning: error.message,
            seedError: seedError.message
          },
          { status: 200 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to setup database',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

