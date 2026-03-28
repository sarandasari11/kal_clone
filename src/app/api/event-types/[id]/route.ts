import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.eventType.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, duration, slug, bufferAfterMinutes } = body
    const normalizedSlug = slug ? String(slug).trim().toLowerCase() : undefined

    if (normalizedSlug && !/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 })
    }

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        title,
        description,
        duration: duration ? parseInt(duration) : undefined,
        bufferAfterMinutes: bufferAfterMinutes !== undefined ? parseInt(bufferAfterMinutes) : undefined,
        slug: normalizedSlug,
      },
    })

    revalidateTag('event-types', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/event-types/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.eventType.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const bookingsCount = await prisma.booking.count({
      where: { eventTypeId: id },
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event type with existing bookings' },
        { status: 409 }
      )
    }

    await prisma.eventType.delete({
      where: { id },
    })

    revalidateTag('event-types', 'max')
    revalidateTag('slots', 'max')

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return NextResponse.json(
        { error: 'Cannot delete event type with existing bookings' },
        { status: 409 }
      )
    }

    console.error('DELETE /api/event-types/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
