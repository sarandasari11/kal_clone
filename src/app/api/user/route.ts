import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    return NextResponse.json({ timeZone: user?.timeZone || 'UTC' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body.timeZone) return NextResponse.json({ error: 'Missing timeZone' }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { timeZone: body.timeZone }
    })

    return NextResponse.json({ timeZone: updated.timeZone })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
