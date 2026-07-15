import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const donors = await db.donor.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      avatarColor: true,
      city: true,
      country: true,
      bio: true,
      createdAt: true,
      donations: { select: { id: true, paymentStatus: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const out = donors.map((d) => {
    const donationsCount = d.donations.filter(
      (x) => x.paymentStatus === 'COMPLETED',
    ).length
    const { donations, ...rest } = d
    return { ...rest, donationsCount }
  })

  return NextResponse.json(out)
}
