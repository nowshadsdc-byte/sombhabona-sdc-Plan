import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const existing = await db.donation.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  }

  const data: any = {}
  if (body.paymentStatus !== undefined) {
    data.paymentStatus = String(body.paymentStatus)
  }
  if (body.transactionId !== undefined) {
    data.transactionId = body.transactionId ? String(body.transactionId) : null
  }
  if (body.amountUSD !== undefined) data.amountUSD = Number(body.amountUSD)
  if (body.amountBDT !== undefined) data.amountBDT = Number(body.amountBDT)
  if (body.donorMessage !== undefined) {
    data.donorMessage = body.donorMessage ? String(body.donorMessage) : null
  }
  if (body.anonymous !== undefined) data.anonymous = Boolean(body.anonymous)
  if (body.paymentMethod !== undefined) data.paymentMethod = String(body.paymentMethod)
  if (body.childId !== undefined) data.childId = body.childId || null
  if (body.womanId !== undefined) data.womanId = body.womanId || null

  const updated = await db.donation.update({ where: { id }, data })

  // If status transitioned to COMPLETED, promote the linked beneficiary
  if (
    body.paymentStatus === 'COMPLETED' &&
    existing.paymentStatus !== 'COMPLETED'
  ) {
    if (updated.childId) {
      await db.child.updateMany({
        where: { id: updated.childId, status: 'AVAILABLE' },
        data: { status: 'SUPPORTED' },
      })
    }
    if (updated.womanId) {
      await db.woman.updateMany({
        where: { id: updated.womanId, status: 'AVAILABLE' },
        data: { status: 'SUPPORTED' },
      })
    }
  }

  return NextResponse.json(updated)
}
