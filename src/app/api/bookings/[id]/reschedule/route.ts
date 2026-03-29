import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { addMinutes } from 'date-fns'
import { sendBookingEmail } from '@/lib/email'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { startTime } = body

    if (!startTime) {
      return NextResponse.json({ error: 'startTime is required' }, { status: 400 })
    }

    const nextStart = new Date(startTime)
    if (Number.isNaN(nextStart.getTime())) {
      return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 })
    }

    const current = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
      },
    })

    if (!current) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (current.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    if (current.status !== 'active') {
      return NextResponse.json({ error: 'Only active bookings can be rescheduled' }, { status: 400 })
    }

    const nextEnd = addMinutes(nextStart, current.eventType.duration)

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const activeBookings = await tx.booking.findMany({
        where: {
          userId: current.userId,
          status: 'active',
          NOT: { id: current.id },
        },
        include: {
          eventType: {
            select: {
              bufferAfterMinutes: true,
            },
          },
        },
      })

      const requestedEndWithBuffer = addMinutes(nextEnd, current.eventType.bufferAfterMinutes)

      const overlaps = activeBookings.some((existing: {
        endTime: Date
        startTime: Date
        eventType: { bufferAfterMinutes: number }
      }) => {
        const existingEndWithBuffer = addMinutes(
          existing.endTime,
          existing.eventType.bufferAfterMinutes
        )

        return nextStart < existingEndWithBuffer && requestedEndWithBuffer > existing.startTime
      })

      if (overlaps) {
        throw new Error('Slot already booked')
      }

      return tx.booking.update({
        where: { id },
        data: {
          startTime: nextStart,
          endTime: nextEnd,
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
      isolationLevel: 'Serializable',
    })

    try {
      await sendBookingEmail({
        type: 'rescheduled',
        to: updated.bookerEmail,
        eventTitle: updated.eventType.title,
        startTime: updated.startTime,
        endTime: updated.endTime,
        bookerName: updated.bookerName,
        previousStartTime: current.startTime,
      })
    } catch (emailError) {
      console.error('Booking rescheduled but email failed:', emailError)
    }

    revalidateTag('bookings', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(updated)
  } catch (error: unknown) {
    console.error('PATCH /api/bookings/[id]/reschedule error:', error)
    if (error instanceof Error && error.message === 'Slot already booked') {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
