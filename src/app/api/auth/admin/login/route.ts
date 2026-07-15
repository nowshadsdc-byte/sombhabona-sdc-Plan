import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createAdminSession } from '@/lib/auth'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { email, password } = body ?? {}

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 },
    )
  }

  const admin = await db.admin.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  })
  if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await createAdminSession(admin.id)

  const { passwordHash, ...safe } = admin
  return NextResponse.json({ admin: safe })
}
