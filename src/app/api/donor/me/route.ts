import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentDonor } from '@/lib/auth'

export async function GET() {
  const donor = await getCurrentDonor()
  if (!donor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(donor)
}

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

  const { name, phone, country, city, bio } = body ?? {}
  const data: any = {}
  if (name !== undefined) data.name = String(name)
  if (phone !== undefined) data.phone = phone ? String(phone) : null
  if (country !== undefined) data.country = country ? String(country) : null
  if (city !== undefined) data.city = city ? String(city) : null
  if (bio !== undefined) data.bio = bio ? String(bio) : null

  const updated = await db.donor.update({ where: { id: donor.id }, data })
  const { passwordHash, ...safe } = updated
  return NextResponse.json(safe)
}
