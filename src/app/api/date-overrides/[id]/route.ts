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

    const existing = await prisma.dateOverride.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    await prisma.dateOverride.delete({
      where: { id },
    })

    revalidateTag('date-overrides', 'max')
    revalidateTag('slots', 'max')

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/date-overrides/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
