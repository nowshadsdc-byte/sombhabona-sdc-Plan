import { cookies } from 'next/headers'
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { db } from './db'

export const SESSION_COOKIE_DONOR = 'odctl_donor_session'
export const SESSION_COOKIE_ADMIN = 'odctl_admin_session'
const SECRET = process.env.AUTH_SECRET || 'odctl-dev-secret-change-me'

/* ---------- password hashing ---------- */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuf = Buffer.from(hash, 'hex')
  const testBuf = scryptSync(password, salt, 64)
  if (hashBuf.length !== testBuf.length) return false
  return timingSafeEqual(hashBuf, testBuf)
}

/* ---------- session tokens ---------- */
function signToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(body).digest('hex')
  return `${body}.${sig}`
}

function verifyToken<T = Record<string, unknown>>(token: string | undefined): T | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', SECRET).update(body).digest('hex')
  if (sig !== expected) return null
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString()) as T
  } catch {
    return null
  }
}

export async function createDonorSession(donorId: string) {
  const token = signToken({ sub: donorId, role: 'DONOR', t: Date.now() })
  const store = await cookies()
  store.set(SESSION_COOKIE_DONOR, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function createAdminSession(adminId: string) {
  const token = signToken({ sub: adminId, role: 'ADMIN', t: Date.now() })
  const store = await cookies()
  store.set(SESSION_COOKIE_ADMIN, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSessions() {
  const store = await cookies()
  store.delete(SESSION_COOKIE_DONOR)
  store.delete(SESSION_COOKIE_ADMIN)
}

export async function getCurrentDonor() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE_DONOR)?.value
  const payload = verifyToken<{ sub: string; role: string }>(token)
  if (!payload || payload.role !== 'DONOR') return null
  const donor = await db.donor.findUnique({ where: { id: payload.sub } })
  if (!donor) return null
  // never expose passwordHash
  const { passwordHash, ...safe } = donor
  return safe
}

export async function getCurrentAdmin() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE_ADMIN)?.value
  const payload = verifyToken<{ sub: string; role: string }>(token)
  if (!payload || payload.role !== 'ADMIN') return null
  const admin = await db.admin.findUnique({ where: { id: payload.sub } })
  if (!admin) return null
  const { passwordHash, ...safe } = admin
  return safe
}

export type SafeDonor = Awaited<ReturnType<typeof getCurrentDonor>>
export type SafeAdmin = Awaited<ReturnType<typeof getCurrentAdmin>>
