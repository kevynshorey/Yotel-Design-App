import { NextRequest, NextResponse } from 'next/server'
import { authenticatePassword, COOKIE_NAME, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const user = authenticatePassword(password)

  if (user) {
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
    res.cookies.set(COOKIE_NAME, JSON.stringify(user), {
      httpOnly: false, // needs to be readable by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return res
  }

  return NextResponse.json({ error: 'Invalid' }, { status: 401 })
}
