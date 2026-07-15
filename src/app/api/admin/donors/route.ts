import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin, hashPassword } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const donors = await db.donor.findMany({
    include: {
      donations: {
        select: { id: true, amountUSD: true, paymentStatus: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const out = donors.map((d) => {
    const { passwordHash, donations, ...rest } = d
    const completed = donations.filter((x) => x.paymentStatus === 'COMPLETED')
    return {
      ...rest,
      donationsCount: donations.length,
      completedDonations: completed.length,
      totalDonatedUSD: completed.reduce((s, x) => s + x.amountUSD, 0),
    }
  })

  return NextResponse.json(out)
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

  const { name, email, password, phone, country, city, bio, avatarColor, isPublic } =
    body ?? {}

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'name, email, and password are required' },
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
      bio: bio ? String(bio) : null,
      avatarColor: avatarColor ? String(avatarColor) : '#0d9488',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    },
  })

  const { passwordHash, ...safe } = donor
  return NextResponse.json(safe, { status: 201 })
}
