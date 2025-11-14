/**
 * Prisma Seed Script
 * 
 * This script populates the database with initial data.
 * 
 * How to run:
 *   npx prisma db seed
 * 
 * Or directly:
 *   npx tsx prisma/seed.ts
 * 
 * The seed script will:
 * - Create 1 admin user
 * - Create 3 trainer users with Trainer profiles
 * - Create 3 workout types
 */

import { PrismaClient } from '@prisma/client'
import { Role } from '../lib/types'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  console.log('Creating admin user...')
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
  console.log('Creating client user...')
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
  console.log('Creating trainer users...')
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
  console.log('Creating workout types...')
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

  console.log('🎉 Seed completed successfully!')
  console.log(`   - 1 admin user`)
  console.log(`   - 1 client user`)
  console.log(`   - ${createdTrainers.length} trainer users`)
  console.log(`   - ${workoutTypes.length} workout types`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

