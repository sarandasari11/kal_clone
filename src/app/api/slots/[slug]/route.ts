import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addMinutes, startOfDay, endOfDay, isBefore, parseISO } from 'date-fns'

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
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    const availabilityDays = await prisma.availability.findMany({
      where: {
        userId: eventType.userId,
        isAvailable: true,
      },
      select: { dayOfWeek: true },
      orderBy: { dayOfWeek: 'asc' },
    })

    const availableWeekdays = availabilityDays.map((a) => a.dayOfWeek)

    // 2. Check User Availability for this day
    const availability = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId: eventType.userId,
          dayOfWeek,
        },
      },
    })

    if (!availability || !availability.isAvailable) {
      if (searchParams.get('info') === 'true') {
        return NextResponse.json({
          slots: [],
          availabilityDays: availableWeekdays,
          eventType: {
            id: eventType.id,
            title: eventType.title,
            description: eventType.description,
            duration: eventType.duration,
            slug: eventType.slug,
            user: {
              name: eventType.user.name,
              username: eventType.user.username
            }
          }
        })
      }
      return NextResponse.json([])
    }

    // 3. Generate potential slots
    const slots = []
    const startHour = availability.startTime.getUTCHours()
    const startMin = availability.startTime.getUTCMinutes()
    const endHour = availability.endTime.getUTCHours()
    const endMin = availability.endTime.getUTCMinutes()

    let currentSlot = new Date(date)
    currentSlot.setUTCHours(startHour, startMin, 0, 0)
    
    const endTime = new Date(date)
    endTime.setUTCHours(endHour, endMin, 0, 0)

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
    })

    while (isBefore(addMinutes(currentSlot, eventType.duration), endTime) || 
           addMinutes(currentSlot, eventType.duration).getTime() === endTime.getTime()) {
      
      const slotEnd = addMinutes(currentSlot, eventType.duration)
      
      // Check for overlap with existing bookings
      const isOccupied = existingBookings.some((booking) => {
        return (
          (currentSlot >= booking.startTime && currentSlot < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (currentSlot <= booking.startTime && slotEnd >= booking.endTime)
        )
      })

      if (!isOccupied) {
        slots.push(new Date(currentSlot))
      }

      currentSlot = addMinutes(currentSlot, eventType.duration)
    }

    if (searchParams.get('info') === 'true') {
       return NextResponse.json({
          slots,
         availabilityDays: availableWeekdays,
          eventType: {
            id: eventType.id,
            title: eventType.title,
            description: eventType.description,
            duration: eventType.duration,
            slug: eventType.slug,
             user: {
                 name: eventType.user.name,
                 username: eventType.user.username
             }
          }
       })
    }

    return NextResponse.json(slots)
  } catch (error) {
    console.error('GET /api/slots error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
