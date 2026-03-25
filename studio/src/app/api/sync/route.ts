import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

// ── In-memory store (replace with Vercel Blob or a database for production) ─
// NOTE: This Map resets on every cold start.  Suitable only for development
// and light demo use.  For durable persistence swap with Vercel Blob, KV,
// or a real database.
const dataStore = new Map<string, unknown>()

// ── Rate limiter (10 req/min per IP) ────────────────────────────────────────
const requests = new Map<string, number[]>()
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const history = (requests.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  history.push(now)
  requests.set(ip, history)
  return history.length > RATE_LIMIT
}

// ── Input sanitisation helpers ──────────────────────────────────────────────

/** Strip HTML tags, null bytes, enforce max length. */
function sanitizeString(input: unknown, maxLen = 256): string | null {
  if (typeof input !== 'string') return null
  const cleaned = input
    .replace(/\0/g, '')            // null bytes
    .replace(/<[^>]*>/g, '')       // HTML tags
    .trim()
    .slice(0, maxLen)
  return cleaned.length > 0 ? cleaned : null
}

/** Validate that a storage key is safe (alphanumeric + dashes/underscores/dots). */
function isValidKey(key: string): boolean {
  return /^[\w.\-/]{1,256}$/.test(key)
}

// ── Shared guards ───────────────────────────────────────────────────────────

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function checkAuth(req: NextRequest): NextResponse | null {
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!authCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// ── POST /api/sync — save data ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const authErr = checkAuth(req)
  if (authErr) return authErr

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 })
  }

  const { key, data } = body as { key?: unknown; data?: unknown }

  const sanitizedKey = sanitizeString(key)
  if (!sanitizedKey || !isValidKey(sanitizedKey)) {
    return NextResponse.json(
      { error: 'Invalid key — must be 1-256 alphanumeric/dash/underscore/dot characters' },
      { status: 400 },
    )
  }

  if (data === undefined) {
    return NextResponse.json({ error: 'Missing data field' }, { status: 400 })
  }

  dataStore.set(sanitizedKey, data)
  return NextResponse.json({ ok: true, key: sanitizedKey })
}

// ── GET /api/sync?key=… — retrieve data ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const authErr = checkAuth(req)
  if (authErr) return authErr

  const rawKey = req.nextUrl.searchParams.get('key')
  const sanitizedKey = sanitizeString(rawKey)
  if (!sanitizedKey || !isValidKey(sanitizedKey)) {
    return NextResponse.json({ error: 'Invalid or missing key parameter' }, { status: 400 })
  }

  if (!dataStore.has(sanitizedKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ key: sanitizedKey, data: dataStore.get(sanitizedKey) })
}

// ── DELETE /api/sync?key=… — remove data ────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const authErr = checkAuth(req)
  if (authErr) return authErr

  const rawKey = req.nextUrl.searchParams.get('key')
  const sanitizedKey = sanitizeString(rawKey)
  if (!sanitizedKey || !isValidKey(sanitizedKey)) {
    return NextResponse.json({ error: 'Invalid or missing key parameter' }, { status: 400 })
  }

  dataStore.delete(sanitizedKey)
  return NextResponse.json({ ok: true, key: sanitizedKey })
}
