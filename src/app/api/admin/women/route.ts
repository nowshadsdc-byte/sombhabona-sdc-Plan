import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const women = await db.woman.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(women)
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

  const {
    name,
    age,
    location,
    familyInfo,
    background,
    goal,
    photoColor,
    status,
    progressPercent,
  } = body ?? {}

  if (!name || age === undefined) {
    return NextResponse.json(
      { error: 'name and age are required' },
      { status: 400 },
    )
  }

  const woman = await db.woman.create({
    data: {
      name: String(name),
      age: Number(age),
      location: location ? String(location) : '',
      familyInfo: familyInfo ? String(familyInfo) : '',
      background: background ? String(background) : '',
      goal: goal ? String(goal) : '',
      photoColor: photoColor ? String(photoColor) : '#ec4899',
      status: status ? String(status) : 'AVAILABLE',
      progressPercent:
        progressPercent !== undefined ? Number(progressPercent) : 0,
    },
  })

  return NextResponse.json(woman, { status: 201 })
}
