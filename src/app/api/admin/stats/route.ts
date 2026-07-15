import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    childrenCount,
    womenCount,
    totalDonors,
    publicDonorsCount,
    donationsCount,
    pendingDonations,
    completedDonations,
    childrenSupported,
    womenSupported,
    availableChildren,
    availableWomen,
    aggUSD,
    aggBDT,
  ] = await Promise.all([
    db.child.count(),
    db.woman.count(),
    db.donor.count(),
    db.donor.count({ where: { isPublic: true } }),
    db.donation.count(),
    db.donation.count({ where: { paymentStatus: 'PENDING' } }),
    db.donation.count({ where: { paymentStatus: 'COMPLETED' } }),
    db.child.count({ where: { status: { in: ['SUPPORTED', 'GRADUATED'] } } }),
    db.woman.count({ where: { status: { in: ['SUPPORTED', 'EMPLOYED'] } } }),
    db.child.count({ where: { status: 'AVAILABLE' } }),
    db.woman.count({ where: { status: 'AVAILABLE' } }),
    db.donation.aggregate({
      _sum: { amountUSD: true },
      where: { paymentStatus: 'COMPLETED' },
    }),
    db.donation.aggregate({
      _sum: { amountBDT: true },
      where: { paymentStatus: 'COMPLETED' },
    }),
  ])

  return NextResponse.json({
    childrenCount,
    womenCount,
    totalDonors,
    donorsCount: publicDonorsCount,
    donationsCount,
    pendingDonations,
    completedDonations,
    childrenSupported,
    womenSupported,
    availableChildren,
    availableWomen,
    totalRaisedUSD: aggUSD._sum.amountUSD ?? 0,
    totalRaisedBDT: aggBDT._sum.amountBDT ?? 0,
  })
}
