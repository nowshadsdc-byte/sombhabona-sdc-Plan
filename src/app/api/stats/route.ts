import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [
    childrenCount,
    womenCount,
    donorsCount,
    donationsCount,
    childrenSupported,
    womenSupported,
    agg,
  ] = await Promise.all([
    db.child.count(),
    db.woman.count(),
    db.donor.count({ where: { isPublic: true } }),
    db.donation.count(),
    db.child.count({ where: { status: { in: ['SUPPORTED', 'GRADUATED'] } } }),
    db.woman.count({ where: { status: { in: ['SUPPORTED', 'EMPLOYED'] } } }),
    db.donation.aggregate({
      _sum: { amountUSD: true },
      where: { paymentStatus: 'COMPLETED' },
    }),
  ])

  return NextResponse.json({
    childrenCount,
    womenCount,
    donorsCount,
    donationsCount,
    childrenSupported,
    womenSupported,
    totalRaisedUSD: agg._sum.amountUSD ?? 0,
  })
}
