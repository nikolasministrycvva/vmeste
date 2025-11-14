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

// Use POSTGRES_PRISMA_URL for runtime (connection pooling, optimized for Prisma)
// Falls back to POSTGRES_URL_NON_POOLING or DATABASE_URL
const databaseUrl = 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING || 
  process.env.DATABASE_URL

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

