import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'

export async function DELETE(
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

    const now = new Date()
    const isUpcomingActive = existing.status === 'active' && existing.startTime > now
    if (isUpcomingActive) {
      return NextResponse.json(
        { error: 'Cannot remove an upcoming active booking. Cancel it first.' },
        { status: 400 }
      )
    }

    await prisma.booking.delete({ where: { id } })

    revalidateTag('bookings', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/bookings/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
