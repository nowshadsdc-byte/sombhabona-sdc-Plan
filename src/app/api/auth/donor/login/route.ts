import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createDonorSession } from '@/lib/auth'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { email, password } = body ?? {}

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 },
    )
  }

  const donor = await db.donor.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  })
  if (!donor || !verifyPassword(String(password), donor.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await createDonorSession(donor.id)

  const { passwordHash, ...safe } = donor
  return NextResponse.json({ donor: safe })
}
