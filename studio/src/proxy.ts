import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/logout', '/align']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths, static assets, and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for auth cookies
  const authCookie = req.cookies.get('studio-auth')
  const userCookie = req.cookies.get('yotel-user')

  // Must have both: auth token AND valid user cookie
  if (!authCookie?.value || !userCookie?.value) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Validate user cookie is valid JSON with required fields
  try {
    const user = JSON.parse(userCookie.value)
    if (!user.name || !user.role) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
