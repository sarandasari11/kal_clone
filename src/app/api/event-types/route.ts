import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'

const getEventTypesCached = unstable_cache(
  async (userId: string) => {
    return prisma.eventType.findMany({
      where: { userId },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['api-event-types-by-user'],
  { revalidate: 60, tags: ['event-types'] }
)

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const eventTypes = await getEventTypesCached(userId)

    return NextResponse.json(eventTypes)
  } catch (error) {
    console.error('GET /api/event-types error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, duration, slug, bufferAfterMinutes } = body

    if (!title || !duration || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedSlug = String(slug).trim().toLowerCase()
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return NextResponse.json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }, { status: 400 })
    }

    // Check if slug is already taken for this user
    const existing = await prisma.eventType.findUnique({
      where: {
        userId_slug: { userId, slug: normalizedSlug },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const newEventType = await prisma.eventType.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        bufferAfterMinutes: Number.isFinite(Number(bufferAfterMinutes)) ? Number(bufferAfterMinutes) : 0,
        slug: normalizedSlug,
        userId,
      },
    })

    revalidateTag('event-types', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(newEventType, { status: 201 })
  } catch (error) {
    console.error('POST /api/event-types error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
