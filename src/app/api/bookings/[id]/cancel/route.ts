import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/bookings/[id]/cancel error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
