import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'

const getDateOverridesCached = unstable_cache(
  async (userId: string) => {
    const prismaAny = prisma as any
    return prismaAny.dateOverride.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })
  },
  ['api-date-overrides-by-user'],
  { revalidate: 120, tags: ['date-overrides'] }
)

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const overrides = await getDateOverridesCached(userId)

    return NextResponse.json(overrides)
  } catch (error) {
    console.error('GET /api/date-overrides error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const prismaAny = prisma as any

    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, startTime, endTime, isBlocked } = body

    if (!date) {
      return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
    }

    const normalizedDate = new Date(`${date}T00:00:00.000Z`)
    if (Number.isNaN(normalizedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    const blocked = Boolean(isBlocked)

    if (!blocked && (!startTime || !endTime)) {
      return NextResponse.json({ error: 'startTime and endTime are required for custom hours' }, { status: 400 })
    }

    const existing = await prismaAny.dateOverride.findFirst({
      where: {
        userId,
        date: normalizedDate,
      },
    })

    const data = {
      userId,
      date: normalizedDate,
      isBlocked: blocked,
      startTime: blocked ? null : new Date(`1970-01-01T${startTime}:00Z`),
      endTime: blocked ? null : new Date(`1970-01-01T${endTime}:00Z`),
    }

    const override = existing
      ? await prismaAny.dateOverride.update({
          where: { id: existing.id },
          data,
        })
      : await prismaAny.dateOverride.create({ data })

    revalidateTag('date-overrides', 'max')
    revalidateTag('slots', 'max')

    return NextResponse.json(override)
  } catch (error) {
    console.error('POST /api/date-overrides error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
