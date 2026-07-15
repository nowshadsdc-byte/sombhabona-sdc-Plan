import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const childId = url.searchParams.get('childId')
  const womanId = url.searchParams.get('womanId')
  const beneficiaryType = url.searchParams.get('beneficiaryType')
  const beneficiaryId = url.searchParams.get('beneficiaryId')

  const where: any = {}
  if (childId) {
    where.childId = childId
  } else if (beneficiaryType === 'CHILD' && beneficiaryId) {
    where.childId = beneficiaryId
  }
  if (womanId) {
    where.womanId = womanId
  } else if (beneficiaryType === 'WOMAN' && beneficiaryId) {
    where.womanId = beneficiaryId
  }

  const updates = await db.progressUpdate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(updates)
}
