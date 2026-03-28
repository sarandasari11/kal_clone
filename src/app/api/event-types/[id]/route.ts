import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, duration, slug } = body

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        title,
        description,
        duration: duration ? parseInt(duration) : undefined,
        slug,
      },
    })

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
    const { id } = await params
    await prisma.eventType.delete({
      where: { id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/event-types/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
