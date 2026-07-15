import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: any = {}
  if (body.title !== undefined) data.title = String(body.title)
  if (body.content !== undefined) data.content = String(body.content)
  if (body.milestone !== undefined) data.milestone = Boolean(body.milestone)
  if (body.photoColor !== undefined) data.photoColor = String(body.photoColor)
  if (body.childId !== undefined) data.childId = body.childId || null
  if (body.womanId !== undefined) data.womanId = body.womanId || null

  const updated = await db.progressUpdate.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.progressUpdate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
