import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, type AppUser } from '@/lib/auth'
import { verifySignature, SIG_COOKIE } from '@/lib/auth-signature'
import { logSecurityAuditEvent } from '@/lib/security-audit'

export async function GET(req: NextRequest) {
  const userRaw = req.cookies.get(COOKIE_NAME)?.value
  const signature = req.cookies.get(SIG_COOKIE)?.value

  if (!userRaw || !signature) {
    return NextResponse.json(
      { user: null },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (!verifySignature(userRaw, signature)) {
    logSecurityAuditEvent({
      type: 'session_invalid',
      metadata: { reason: 'signature_mismatch' },
    })
    return NextResponse.json(
      { user: null },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const user = JSON.parse(userRaw) as AppUser
    if (!user.name || !user.role) {
      return NextResponse.json(
        { user: null },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    logSecurityAuditEvent({
      type: 'session_verified',
      metadata: { userName: user.name },
    })

    return NextResponse.json(
      { user },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json(
      { user: null },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
