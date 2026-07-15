import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createDonorSession } from '@/lib/auth'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { name, email, password, phone, country, city } = body ?? {}

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Name, email, and password are required' },
      { status: 400 },
    )
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  const existing = await db.donor.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const donor = await db.donor.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(String(password)),
      phone: phone ? String(phone) : null,
      country: country ? String(country) : null,
      city: city ? String(city) : null,
    },
  })

  await createDonorSession(donor.id)

  const { passwordHash, ...safe } = donor
  return NextResponse.json({ donor: safe }, { status: 201 })
}
