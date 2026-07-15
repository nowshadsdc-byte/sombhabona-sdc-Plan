import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const children = await db.child.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(children)
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
    gender,
    grade,
    school,
    location,
    background,
    dream,
    photoColor,
    status,
    progressPercent,
  } = body ?? {}

  if (!name || age === undefined || !grade) {
    return NextResponse.json(
      { error: 'name, age, and grade are required' },
      { status: 400 },
    )
  }

  const child = await db.child.create({
    data: {
      name: String(name),
      age: Number(age),
      gender: gender ? String(gender) : 'female',
      grade: String(grade),
      school: school ? String(school) : '',
      location: location ? String(location) : '',
      background: background ? String(background) : '',
      dream: dream ? String(dream) : '',
      photoColor: photoColor ? String(photoColor) : '#f59e0b',
      status: status ? String(status) : 'AVAILABLE',
      progressPercent:
        progressPercent !== undefined ? Number(progressPercent) : 0,
    },
  })

  return NextResponse.json(child, { status: 201 })
}
