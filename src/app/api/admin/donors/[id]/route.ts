import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin, hashPassword } from '@/lib/auth'

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
  const strFields = ['name', 'phone', 'country', 'city', 'bio', 'avatarColor']
  for (const f of strFields) {
    if (body[f] !== undefined) {
      data[f] = body[f] === null ? null : String(body[f])
    }
  }
  if (body.email !== undefined) {
    data.email = String(body.email).toLowerCase().trim()
  }
  if (body.isPublic !== undefined) data.isPublic = Boolean(body.isPublic)
  if (body.password) {
    data.passwordHash = hashPassword(String(body.password))
  }

  const updated = await db.donor.update({ where: { id }, data })
  const { passwordHash, ...safe } = updated
  return NextResponse.json(safe)
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
  await db.donor.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
