import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const where = status ? { status } : {}
  const children = await db.child.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(children)
}
