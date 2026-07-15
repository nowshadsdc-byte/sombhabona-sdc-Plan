import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentDonor } from '@/lib/auth'

export async function GET() {
  const donor = await getCurrentDonor()
  if (!donor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const donations = await db.donation.findMany({
    where: { donorId: donor.id },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          photoColor: true,
          grade: true,
          status: true,
          progressPercent: true,
        },
      },
      woman: {
        select: {
          id: true,
          name: true,
          photoColor: true,
          goal: true,
          status: true,
          progressPercent: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(donations)
}
