import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    
    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        eventType: {
          select: {
            title: true,
          },
        },
      },
    })

    try {
      await sendBookingEmail({
        type: 'cancelled',
        to: updated.bookerEmail,
        eventTitle: updated.eventType.title,
        startTime: updated.startTime,
        endTime: updated.endTime,
        bookerName: updated.bookerName,
      })
    } catch (emailError) {
      console.error('Booking cancelled but email failed:', emailError)
    }

    revalidateTag('bookings', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/bookings/[id]/cancel error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
