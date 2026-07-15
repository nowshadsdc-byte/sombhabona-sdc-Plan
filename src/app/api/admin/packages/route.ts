import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const packages = await db.package.findMany({
    orderBy: { priceUSD: 'asc' },
  })
  return NextResponse.json(packages)
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
    description,
    priceUSD,
    priceBDT,
    childBenefit,
    womanBenefit,
    imageColor,
    active,
  } = body ?? {}

  if (!name || priceUSD === undefined || priceBDT === undefined) {
    return NextResponse.json(
      { error: 'name, priceUSD, and priceBDT are required' },
      { status: 400 },
    )
  }

  const pkg = await db.package.create({
    data: {
      name: String(name),
      description: description ? String(description) : '',
      priceUSD: Number(priceUSD),
      priceBDT: Number(priceBDT),
      childBenefit: childBenefit ? String(childBenefit) : '',
      womanBenefit: womanBenefit ? String(womanBenefit) : '',
      imageColor: imageColor ? String(imageColor) : '#0d9488',
      active: active !== undefined ? Boolean(active) : true,
    },
  })

  return NextResponse.json(pkg, { status: 201 })
}
