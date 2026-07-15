import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import {
  hashPassword,
  verifyPassword,
  createDonorSession,
  getCurrentDonor,
} from '@/lib/auth'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    childId,
    womanId,
    packageId,
    amountUSD,
    amountBDT,
    paymentMethod,
    transactionId,
    donorMessage,
    anonymous,
    donor: donorInput,
  } = body ?? {}

  if (amountUSD === undefined || amountBDT === undefined || !paymentMethod) {
    return NextResponse.json(
      { error: 'amountUSD, amountBDT, and paymentMethod are required' },
      { status: 400 },
    )
  }
  if (paymentMethod !== 'ONLINE' && paymentMethod !== 'OFFLINE') {
    return NextResponse.json(
      { error: 'paymentMethod must be ONLINE or OFFLINE' },
      { status: 400 },
    )
  }

  // Validate child / woman references if provided
  if (childId) {
    const c = await db.child.findUnique({ where: { id: childId } })
    if (!c) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }
  }
  if (womanId) {
    const w = await db.woman.findUnique({ where: { id: womanId } })
    if (!w) {
      return NextResponse.json({ error: 'Woman not found' }, { status: 404 })
    }
  }

  // ---------- Resolve donor ----------
  let donorId: string
  let safeDonor: any

  const currentDonor = await getCurrentDonor()
  if (currentDonor) {
    donorId = currentDonor.id
    safeDonor = currentDonor
  } else if (donorInput && donorInput.email) {
    const email = String(donorInput.email).toLowerCase().trim()
    const existing = await db.donor.findUnique({ where: { email } })

    if (existing) {
      if (donorInput.password) {
        if (!verifyPassword(String(donorInput.password), existing.passwordHash)) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 },
          )
        }
        await createDonorSession(existing.id)
      }
      donorId = existing.id
      const { passwordHash, ...safe } = existing
      safeDonor = safe
    } else if (donorInput.password) {
      // Register a new donor on the fly
      const newDonor = await db.donor.create({
        data: {
          name: String(donorInput.name || email.split('@')[0]).trim(),
          email,
          passwordHash: hashPassword(String(donorInput.password)),
          phone: donorInput.phone ? String(donorInput.phone) : null,
          country: donorInput.country ? String(donorInput.country) : null,
          city: donorInput.city ? String(donorInput.city) : null,
        },
      })
      await createDonorSession(newDonor.id)
      donorId = newDonor.id
      const { passwordHash, ...safe } = newDonor
      safeDonor = safe
    } else {
      // Guest donor (no password, email not previously registered)
      const guest = await db.donor.create({
        data: {
          name: String(donorInput.name || 'Anonymous Donor').trim(),
          email: `guest_${randomUUID()}@guest.local`,
          passwordHash: hashPassword(randomUUID()),
          phone: donorInput.phone ? String(donorInput.phone) : null,
          country: donorInput.country ? String(donorInput.country) : null,
          city: donorInput.city ? String(donorInput.city) : null,
          isPublic: false,
        },
      })
      donorId = guest.id
      const { passwordHash, ...safe } = guest
      safeDonor = safe
    }
  } else {
    // No session, no email — create a fully anonymous guest donor
    const guest = await db.donor.create({
      data: {
        name: String(donorInput?.name || 'Anonymous Donor').trim(),
        email: `guest_${randomUUID()}@guest.local`,
        passwordHash: hashPassword(randomUUID()),
        isPublic: false,
      },
    })
    donorId = guest.id
    const { passwordHash, ...safe } = guest
    safeDonor = safe
  }

  // ---------- Create the donation ----------
  const paymentStatus = paymentMethod === 'ONLINE' ? 'COMPLETED' : 'PENDING'

  const donation = await db.donation.create({
    data: {
      donorId,
      childId: childId || null,
      womanId: womanId || null,
      packageId: packageId || null,
      amountUSD: Number(amountUSD),
      amountBDT: Number(amountBDT),
      paymentMethod,
      paymentStatus,
      transactionId: transactionId ? String(transactionId) : null,
      donorMessage: donorMessage ? String(donorMessage) : null,
      anonymous: Boolean(anonymous),
    },
  })

  // ---------- Promote beneficiary to SUPPORTED on completion ----------
  if (paymentStatus === 'COMPLETED') {
    if (childId) {
      await db.child.updateMany({
        where: { id: childId, status: 'AVAILABLE' },
        data: { status: 'SUPPORTED' },
      })
    }
    if (womanId) {
      await db.woman.updateMany({
        where: { id: womanId, status: 'AVAILABLE' },
        data: { status: 'SUPPORTED' },
      })
    }
  }

  return NextResponse.json({ donation, donor: safeDonor }, { status: 201 })
}
