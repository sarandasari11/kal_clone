import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1 default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
    },
  })

  // 3 event types
  const eventTypesData = [
    { title: '15 Min Meeting', slug: '15min', duration: 15, description: 'Quick chat.' },
    { title: '30 Min Meeting', slug: '30min', duration: 30, description: 'Standard meeting.' },
    { title: '1 Hour Meeting', slug: '60min', duration: 60, description: 'Long form discussion.' },
  ]

  for (const et of eventTypesData) {
    await prisma.eventType.upsert({
      where: { userId_slug: { userId: user.id, slug: et.slug } },
      update: {},
      create: { ...et, userId: user.id },
    })
  }

  const firstEvent = await prisma.eventType.findFirst({ where: { userId: user.id } })

  if (firstEvent) {
    // Clear out old generated bookings for idempotency
    await prisma.booking.deleteMany({ where: { userId: user.id } })

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
          userId: user.id,
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
