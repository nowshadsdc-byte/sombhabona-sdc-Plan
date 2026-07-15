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
  const strFields = [
    'name',
    'gender',
    'grade',
    'school',
    'location',
    'background',
    'dream',
    'photoColor',
    'status',
  ]
  for (const f of strFields) {
    if (body[f] !== undefined) {
      data[f] = body[f] === null ? null : String(body[f])
    }
  }
  if (body.age !== undefined) data.age = Number(body.age)
  if (body.progressPercent !== undefined) {
    data.progressPercent = Number(body.progressPercent)
  }

  const updated = await db.child.update({ where: { id }, data })
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
  await db.child.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
