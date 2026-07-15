import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.siteContent.findMany()
  const out: Record<string, string> = {}
  for (const r of rows) out[r.key] = r.value
  return NextResponse.json(out)
}

export async function PUT(req: Request) {
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

  const { key, value } = body ?? {}
  if (!key || value === undefined) {
    return NextResponse.json(
      { error: 'key and value are required' },
      { status: 400 },
    )
  }

  await db.siteContent.upsert({
    where: { key: String(key) },
    create: { key: String(key), value: String(value) },
    update: { value: String(value) },
  })

  return NextResponse.json({ key: String(key), value: String(value) })
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

  const { items } = body ?? {}
  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: 'items must be an array' },
      { status: 400 },
    )
  }

  let count = 0
  for (const item of items) {
    if (!item || !item.key || item.value === undefined) continue
    await db.siteContent.upsert({
      where: { key: String(item.key) },
      create: { key: String(item.key), value: String(item.value) },
      update: { value: String(item.value) },
    })
    count++
  }

  return NextResponse.json({ ok: true, count })
}
