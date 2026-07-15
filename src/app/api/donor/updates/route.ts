import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentDonor } from '@/lib/auth'

export async function GET() {
  const donor = await getCurrentDonor()
  if (!donor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Collect the distinct childIds + womanIds this donor has sponsored
  const donations = await db.donation.findMany({
    where: { donorId: donor.id },
    select: { childId: true, womanId: true },
  })
  const childIds = [...new Set(donations.map((d) => d.childId).filter(Boolean))] as string[]
  const womanIds = [...new Set(donations.map((d) => d.womanId).filter(Boolean))] as string[]

  if (childIds.length === 0 && womanIds.length === 0) {
    return NextResponse.json([])
  }

  // Fetch progress updates for those beneficiaries (use OR across child/woman links)
  const updates = await db.progressUpdate.findMany({
    where: {
      OR: [{ childId: { in: childIds } }, { womanId: { in: womanIds } }],
    },
    include: {
      child: { select: { name: true } },
      woman: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(updates)
}
