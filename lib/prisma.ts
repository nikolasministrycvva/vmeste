import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client singleton for Next.js
 * 
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * 
 * Usage:
 * import { prisma } from '@/lib/prisma'
 * 
 * const users = await prisma.user.findMany()
 * 
 * Learn more: https://pris.ly/d/help/nextjs-best-practices
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Priority order for database URL:
// 1. DATABASE_URL (Supabase direct connection or Vercel Postgres)
// 2. POSTGRES_PRISMA_URL (Vercel Postgres with connection pooling)
// 3. POSTGRES_URL_NON_POOLING (Vercel Postgres direct connection)
//
// For Supabase: Use DATABASE_URL with direct connection (port 5432)
// For Vercel Postgres: Use POSTGRES_PRISMA_URL for runtime, DATABASE_URL for migrations
const databaseUrl = 
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

