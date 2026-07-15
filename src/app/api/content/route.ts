import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const rows = await db.siteContent.findMany()
  const out: Record<string, string> = {}
  for (const r of rows) out[r.key] = r.value
  return NextResponse.json(out)
}
