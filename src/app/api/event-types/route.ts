import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Mock session user ID - in a real app, this would come from auth
async function getMockSessionUserId() {
  const user = await prisma.user.findFirst()
  return user?.id
}

export async function GET() {
  try {
    const userId = await getMockSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(eventTypes)
  } catch (error) {
    console.error('GET /api/event-types error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getMockSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, duration, slug } = body

    if (!title || !duration || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug is already taken for this user
    const existing = await prisma.eventType.findUnique({
      where: {
        userId_slug: { userId, slug },
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
        slug,
        userId,
      },
    })

    return NextResponse.json(newEventType, { status: 201 })
  } catch (error) {
    console.error('POST /api/event-types error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
