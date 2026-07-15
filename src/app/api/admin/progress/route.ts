import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const childId = url.searchParams.get('childId')
  const womanId = url.searchParams.get('womanId')
  const where: any = {}
  if (childId) where.childId = childId
  if (womanId) where.womanId = womanId

  const updates = await db.progressUpdate.findMany({
    where,
    include: {
      child: { select: { name: true } },
      woman: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(updates)
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { childId, womanId, title, content, milestone, photoColor } = body ?? {}

  if (!title || !content) {
    return NextResponse.json(
      { error: 'title and content are required' },
      { status: 400 },
    )
  }
  if (!childId && !womanId) {
    return NextResponse.json(
      { error: 'Either childId or womanId is required' },
      { status: 400 },
    )
  }
  if (childId && womanId) {
    return NextResponse.json(
      { error: 'Provide only one of childId or womanId' },
      { status: 400 },
    )
  }

  const update = await db.progressUpdate.create({
    data: {
      childId: childId || null,
      womanId: womanId || null,
      title: String(title),
      content: String(content),
      milestone: Boolean(milestone),
      photoColor: photoColor ? String(photoColor) : '#14b8a6',
    },
  })

  return NextResponse.json(update, { status: 201 })
}
