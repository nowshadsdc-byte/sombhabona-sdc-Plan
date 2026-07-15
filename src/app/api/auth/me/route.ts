import { NextResponse } from 'next/server'
import { getCurrentDonor, getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const donor = await getCurrentDonor()
  const admin = await getCurrentAdmin()
  return NextResponse.json({ donor, admin })
}
