import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addMinutes, startOfDay, endOfDay, isBefore, parseISO } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { unstable_cache } from 'next/cache'

const getSlotsDataCached = unstable_cache(
  async (slug: string, dateStr: string, username: string) => {
    const date = parseISO(dateStr)
    const dayOfWeek = date.getDay()

    // 1. Find the EventType and User
    const eventType = await prisma.eventType.findFirst({
      where: {
        slug,
        ...(username ? { user: { username } } : {}),
      },
      include: { user: true },
    })

    if (!eventType) {
      return { notFound: true as const, slots: [], availabilityDays: [], eventType: null }
    }

    const [availabilityDays, dateOverride, availability] = await Promise.all([
      prisma.availability.findMany({
        where: {
          userId: eventType.userId,
          isAvailable: true,
        },
        select: { dayOfWeek: true },
        orderBy: { dayOfWeek: 'asc' },
      }),
      prisma.dateOverride.findFirst({
        where: {
          userId: eventType.userId,
          date: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      }),
      prisma.availability.findUnique({
        where: {
          userId_dayOfWeek: {
            userId: eventType.userId,
            dayOfWeek,
          },
        },
      }),
    ])

    const availableWeekdays = availabilityDays.map((a) => a.dayOfWeek)

    if (dateOverride?.isBlocked) {
      return {
        notFound: false as const,
        slots: [],
        availabilityDays: availableWeekdays,
        eventType,
      }
    }

    // 2. Check User Availability for this day
    if (!availability || !availability.isAvailable) {
      return {
        notFound: false as const,
        slots: [],
        availabilityDays: availableWeekdays,
        eventType,
      }
    }

    // 3. Generate potential slots
    const slots = []
    const sourceStartTime = dateOverride?.startTime ?? availability.startTime
    const sourceEndTime = dateOverride?.endTime ?? availability.endTime

    const startHour = sourceStartTime.getUTCHours()
    const startMin = sourceStartTime.getUTCMinutes()
    const endHour = sourceEndTime.getUTCHours()
    const endMin = sourceEndTime.getUTCMinutes()

    const ownerTz = eventType.user.timeZone || 'UTC'

    // Construct local time strings for the start and end of availability
    const [year, month, day] = dateStr.split('-')
    
    const startString = `${year}-${month}-${day}T${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`
    const endString = `${year}-${month}-${day}T${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`

    // Convert those local interpretations in the owner's timezone into absolute UTC dates
    let currentSlot = fromZonedTime(startString, ownerTz)
    const endTime = fromZonedTime(endString, ownerTz)

    // 4. Fetch existing active bookings for this day
    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: eventType.userId,
        status: 'active',
        startTime: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      include: {
        eventType: {
          select: {
            bufferAfterMinutes: true,
          },
        },
      },
    })

    while (isBefore(addMinutes(currentSlot, eventType.duration), endTime) ||
           addMinutes(currentSlot, eventType.duration).getTime() === endTime.getTime()) {

      const slotEnd = addMinutes(currentSlot, eventType.duration)
      const slotEndWithBuffer = addMinutes(slotEnd, eventType.bufferAfterMinutes)

      // Check for overlap with existing bookings
      const isOccupied = existingBookings.some((booking) => {
        const bookingEndWithBuffer = addMinutes(
          booking.endTime,
          booking.eventType.bufferAfterMinutes
        )

        return (
          currentSlot < bookingEndWithBuffer &&
          slotEndWithBuffer > booking.startTime
        )
      })

      if (!isOccupied) {
        slots.push(new Date(currentSlot))
      }

      currentSlot = addMinutes(currentSlot, eventType.duration)
    }

    return {
      notFound: false as const,
      slots,
      availabilityDays: availableWeekdays,
      eventType,
    }
  },
  ['api-slots-by-slug-date'],
  { revalidate: 20, tags: ['slots'] }
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const username = searchParams.get('username')

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    const data = await getSlotsDataCached(slug, dateStr, username ?? '')

    if (data.notFound || !data.eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    if (searchParams.get('info') === 'true') {
       return NextResponse.json({
          slots: data.slots,
         availabilityDays: data.availabilityDays,
          eventType: {
            id: data.eventType.id,
            title: data.eventType.title,
            description: data.eventType.description,
            duration: data.eventType.duration,
            bufferAfterMinutes: data.eventType.bufferAfterMinutes,
            slug: data.eventType.slug,
             user: {
                 name: data.eventType.user.name,
                 username: data.eventType.user.username
             }
          }
       })
    }

    return NextResponse.json(data.slots)
  } catch (error) {
    console.error('GET /api/slots error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
