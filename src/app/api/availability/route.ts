import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'

const getAvailabilityCached = unstable_cache(
  async (userId: string) => {
    return prisma.availability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' },
    })
  },
  ['api-availability-by-user'],
  { revalidate: 120, tags: ['availability'] }
)

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const availability = await getAvailabilityCached(userId)

    return NextResponse.json(availability)
  } catch (error) {
    console.error('GET /api/availability error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { days } = body // Expects an array of availability objects

    if (!Array.isArray(days)) {
      return NextResponse.json({ error: 'Invalid payload: days should be an array' }, { status: 400 })
    }

    // Use a transaction to update availability efficiently
    await prisma.$transaction(
      days.map((d: any) =>
        prisma.availability.upsert({
          where: {
            userId_dayOfWeek: {
              userId,
              dayOfWeek: parseInt(d.dayOfWeek),
            },
          },
          update: {
            startTime: new Date(`1970-01-01T${d.startTime}:00Z`),
            endTime: new Date(`1970-01-01T${d.endTime}:00Z`),
            isAvailable: d.isAvailable ?? true,
          },
          create: {
            userId,
            dayOfWeek: parseInt(d.dayOfWeek),
             startTime: new Date(`1970-01-01T${d.startTime}:00Z`),
            endTime: new Date(`1970-01-01T${d.endTime}:00Z`),
            isAvailable: d.isAvailable ?? true,
          },
        })
      )
    )

    const updatedAvailability = await prisma.availability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' },
    })

    revalidateTag('availability', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(updatedAvailability)
  } catch (error) {
    console.error('PUT /api/availability error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
