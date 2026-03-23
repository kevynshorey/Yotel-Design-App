import { NextRequest, NextResponse } from 'next/server'
import { authenticatePassword, COOKIE_NAME, AUTH_COOKIE_NAME } from '@/lib/auth'
import { signPayload, SIG_COOKIE } from '@/lib/auth-signature'
import { logSecurityAuditEvent } from '@/lib/security-audit'

// ── Simple in-memory rate limiter (per IP, sliding window) ──────────────
const attempts = new Map<string, number[]>()
const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT = 5 // max attempts per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const history = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  history.push(now)
  attempts.set(ip, history)
  return history.length > RATE_LIMIT
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  // Rate-limit check
  if (isRateLimited(ip)) {
    logSecurityAuditEvent({ type: 'rate_limited', metadata: { ip } })
    return NextResponse.json(
      { error: 'Too many attempts' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const { password } = await req.json()
  const user = authenticatePassword(password)

  if (user) {
    logSecurityAuditEvent({
      type: 'login_success',
      metadata: { userName: user.name, role: user.role, ip },
    })

    const userPayload = JSON.stringify(user)
    const res = NextResponse.json({ ok: true, user })

    // Legacy auth cookie (keeps middleware working)
    res.cookies.set(AUTH_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // User info cookie (readable by client JS for role checks)
    res.cookies.set(COOKIE_NAME, userPayload, {
      httpOnly: false, // needs to be readable by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // HMAC signature of the user payload — httpOnly so it cannot be forged
    res.cookies.set(SIG_COOKIE, signPayload(userPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return res
  }

  logSecurityAuditEvent({
    type: 'login_failure',
    metadata: { ip },
  })

  return NextResponse.json({ error: 'Invalid' }, { status: 401 })
}
