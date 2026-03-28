import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1 default user
  const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        name: 'Admin User',
      }
    })
    console.log('Admin user updated with password.')
  } else {
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        name: 'Admin User',
        password: hashedPassword,
      },
    })
    console.log('Admin user created with password.')
  }
  
  const finalUser = (await prisma.user.findUnique({ where: { email: 'admin@example.com' } }))!


  // 3 event types
  const eventTypesData = [
    { title: '15 Min Meeting', slug: '15min', duration: 15, bufferAfterMinutes: 0, description: 'Quick chat.' },
    { title: '30 Min Meeting', slug: '30min', duration: 30, bufferAfterMinutes: 10, description: 'Standard meeting.' },
    { title: '1 Hour Meeting', slug: '60min', duration: 60, bufferAfterMinutes: 15, description: 'Long form discussion.' },
  ]

  for (const et of eventTypesData) {
    await prisma.eventType.upsert({
      where: { userId_slug: { userId: finalUser.id, slug: et.slug } },
      update: {},
      create: { ...et, userId: finalUser.id },
    })
  }

  const firstEvent = await prisma.eventType.findFirst({ where: { userId: finalUser.id } })

  if (firstEvent) {
    await prisma.dateOverride.deleteMany({ where: { userId: finalUser.id } })

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    await prisma.dateOverride.create({
      data: {
        userId: finalUser.id,
        date: tomorrow,
        isBlocked: true,
      },
    })

    // Clear out old generated bookings for idempotency
    await prisma.booking.deleteMany({ where: { userId: finalUser.id } })

    // 5 sample bookings with varied statuses
    const now = new Date()
    const bookingsData = [
      {
        bookerName: 'John Doe',
        bookerEmail: 'john@example.com',
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 15 * 60000),
        status: 'active' as const,
      },
      {
        bookerName: 'Jane Smith',
        bookerEmail: 'jane@example.com',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 15 * 60000),
        status: 'cancelled' as const,
      },
      {
        bookerName: 'Bob Ross',
        bookerEmail: 'bob@example.com',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 15 * 60000),
        status: 'active' as const,
      },
      {
        bookerName: 'Alice Wonderland',
        bookerEmail: 'alice@example.com',
        startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
        endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 15 * 60000),
        status: 'active' as const,
      },
      {
        bookerName: 'Charlie Bucket',
        bookerEmail: 'charlie@example.com',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 15 * 60000),
        status: 'cancelled' as const,
      },
    ]

    for (const b of bookingsData) {
      await prisma.booking.create({
        data: {
          ...b,
          userId: finalUser.id,
          eventTypeId: firstEvent.id,
        },
      })
    }
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
