import { NextResponse } from 'next/server'
import { COOKIE_NAME, AUTH_COOKIE_NAME } from '@/lib/auth'
import { SIG_COOKIE } from '@/lib/auth-signature'
import { logSecurityAuditEvent } from '@/lib/security-audit'

export async function POST() {
  logSecurityAuditEvent({ type: 'logout' })

  const res = NextResponse.json({ ok: true })

  // Clear all three auth cookies
  res.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  res.cookies.set(SIG_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return res
}
