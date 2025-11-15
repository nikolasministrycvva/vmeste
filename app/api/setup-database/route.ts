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

    return NextResponse.json(
      { 
        message: 'Database tables created successfully',
        tables: ['User', 'Trainer', 'WorkoutType', 'Session', 'Booking']
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error setting up database:', error)
    
    // Если таблицы уже существуют, это не критично
    if (error.message?.includes('already exists') || error.code === '42P07') {
      return NextResponse.json(
        { 
          message: 'Tables already exist or partially created',
          warning: error.message
        },
        { status: 200 }
      )
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

