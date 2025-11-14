/**
 * API Route for seeding database (ONLY FOR FIRST TIME SETUP)
 * 
 * POST /api/seed - Seed the database with initial data
 * 
 * WARNING: This endpoint should be removed or protected after first use!
 * 
 * Usage:
 *   POST /api/seed
 *   Headers: Authorization: Bearer YOUR_SEED_SECRET
 * 
 * Set SEED_SECRET in Vercel environment variables for security.
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  // Check for authorization (optional but recommended)
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.SEED_SECRET
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide Authorization: Bearer YOUR_SEED_SECRET header.' },
      { status: 401 }
    )
  }

  try {
    // Run seed script
    const { stdout, stderr } = await execAsync('npx prisma db seed')
    
    return NextResponse.json(
      { 
        message: 'Database seeded successfully',
        output: stdout,
        errors: stderr || null
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        details: error.message,
        output: error.stdout,
        errors: error.stderr
      },
      { status: 500 }
    )
  }
}

