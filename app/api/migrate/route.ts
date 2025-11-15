/**
 * API Route for applying database migrations
 * 
 * GET /api/migrate - Apply Prisma migrations to the database
 * 
 * WARNING: This is a temporary endpoint for first-time setup.
 * Should be removed or protected after migrations are applied.
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    console.log('Starting migrations...')
    
    // Apply migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
    
    console.log('Migrations output:', stdout)
    if (stderr) {
      console.warn('Migrations warnings:', stderr)
    }
    
    return NextResponse.json(
      { 
        message: 'Migrations applied successfully',
        output: stdout,
        warnings: stderr || null
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error applying migrations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to apply migrations',
        details: error.message,
        output: error.stdout,
        errors: error.stderr
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

