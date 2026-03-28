import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addMinutes, startOfDay, endOfDay, isAfter } from 'date-fns'
import { sendBookingEmail } from '@/lib/email'
import { revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'

const getBookingsCached = unstable_cache(
  async (userId: string) => {
    return prisma.booking.findMany({
      where: { userId },
      include: { eventType: true },
      orderBy: { startTime: 'desc' },
    })
  },
  ['api-bookings-by-user'],
  { revalidate: 30, tags: ['bookings'] }
)

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const bookings = await getBookingsCached(userId)

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
    }) as any

    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    const end = addMinutes(start, eventType.duration)

    // Double-booking check within a transaction for MySQL
    // Note: Prisma 5+ transaction isolation needs to be set properly for SERIALIZABLE if needed
    // or use explicit raw queries for FOR UPDATE.
    const booking = await prisma.$transaction(async (tx) => {
      const txAny = tx as any

      // 1. Check for overlapping active bookings (buffer-aware)
      const activeBookings = await txAny.booking.findMany({
        where: {
          userId: eventType.userId,
          status: 'active',
        },
        include: {
          eventType: {
            select: {
              bufferAfterMinutes: true,
            },
          },
        },
      })

      const requestedEndWithBuffer = addMinutes(end, eventType.bufferAfterMinutes)

      const overlaps = activeBookings.filter((existing: any) => {
        const existingEndWithBuffer = addMinutes(
          existing.endTime,
          existing.eventType.bufferAfterMinutes
        )

        return start < existingEndWithBuffer && requestedEndWithBuffer > existing.startTime
      })

      if (overlaps.length > 0) {
        throw new Error('Slot already booked')
      }

      // 2. Insert new booking
      return txAny.booking.create({
        data: {
          eventTypeId,
          userId: eventType.userId,
          bookerName,
          bookerEmail,
          startTime: start,
          endTime: end,
          status: 'active',
        },
        include: {
          eventType: {
            select: {
              title: true,
            },
          },
        },
      })
    }, {
      // Using SERIALIZABLE isolation to ensure the "check and insert" is atomic for MySQL
       isolationLevel: 'Serializable',
    })

    try {
      await sendBookingEmail({
        type: 'created',
        to: booking.bookerEmail,
        eventTitle: booking.eventType.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookerName: booking.bookerName,
      })
    } catch (emailError) {
      console.error('Booking created but email failed:', emailError)
    }

    revalidateTag('bookings', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bookings error:', error)
    if (error.message === 'Slot already booked') {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
