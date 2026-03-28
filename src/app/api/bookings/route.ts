import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addMinutes, startOfDay, endOfDay, isAfter } from 'date-fns'

export async function GET() {
  try {
    const user = await prisma.user.findFirst()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { eventType: true },
      orderBy: { startTime: 'desc' },
    })

    const now = new Date()
    const upcoming = bookings.filter((b) => isAfter(b.startTime, now) && b.status === 'active')
    const past = bookings.filter((b) => !isAfter(b.startTime, now) || b.status === 'cancelled')

    return NextResponse.json({ upcoming, past })
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventTypeId, startTime, bookerName, bookerEmail } = body

    if (!eventTypeId || !startTime || !bookerName || !bookerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const start = new Date(startTime)
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    const end = addMinutes(start, eventType.duration)

    // Double-booking check within a transaction for MySQL
    // Note: Prisma 5+ transaction isolation needs to be set properly for SERIALIZABLE if needed
    // or use explicit raw queries for FOR UPDATE.
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Check for overlapping active bookings
      const overlaps = await tx.booking.findMany({
        where: {
          userId: eventType.userId,
          status: 'active',
          OR: [
            {
              startTime: { lte: start },
              endTime: { gt: start },
            },
            {
              startTime: { lt: end },
              endTime: { gte: end },
            },
            {
              startTime: { gte: start },
              endTime: { lte: end },
            },
          ],
        },
      })

      if (overlaps.length > 0) {
        throw new Error('Slot already booked')
      }

      // 2. Insert new booking
      return tx.booking.create({
        data: {
          eventTypeId,
          userId: eventType.userId,
          bookerName,
          bookerEmail,
          startTime: start,
          endTime: end,
          status: 'active',
        },
      })
    }, {
      // Using SERIALIZABLE isolation to ensure the "check and insert" is atomic for MySQL
       isolationLevel: 'Serializable',
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bookings error:', error)
    if (error.message === 'Slot already booked') {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
