import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentDonor, hashPassword, verifyPassword } from '@/lib/auth'

export async function PUT(req: Request) {
  const donor = await getCurrentDonor()
  if (!donor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { currentPassword, newPassword } = body ?? {}
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'currentPassword and newPassword are required' },
      { status: 400 },
    )
  }

  const full = await db.donor.findUnique({ where: { id: donor.id } })
  if (!full || !verifyPassword(String(currentPassword), full.passwordHash)) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 401 },
    )
  }

  await db.donor.update({
    where: { id: donor.id },
    data: { passwordHash: hashPassword(String(newPassword)) },
  })

  return NextResponse.json({ ok: true })
}
