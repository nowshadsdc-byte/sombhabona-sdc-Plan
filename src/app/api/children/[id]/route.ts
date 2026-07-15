import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const child = await db.child.findUnique({
    where: { id },
    include: {
      updates: { orderBy: { createdAt: 'desc' } },
      donations: {
        select: {
          id: true,
          createdAt: true,
          amountUSD: true,
          anonymous: true,
          donorMessage: true,
          donor: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }
  return NextResponse.json(child)
}
