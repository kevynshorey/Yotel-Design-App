import { NextRequest, NextResponse } from 'next/server'

const ACCESS_CODE = process.env.ACCESS_CODE ?? 'aces'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password === ACCESS_CODE) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('studio-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'Invalid' }, { status: 401 })
}
