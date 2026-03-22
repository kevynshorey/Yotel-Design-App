'use client'

import { useEffect, useState } from 'react'
import type { AppUser } from './auth'
import { getUserFromCookie } from './auth'

/** React hook — reads user from cookie on mount and after login events.
 *  Initialises eagerly so the very first client render already reflects
 *  the cookie value — prevents a flash of "view-only" state. */
export function useUser(): AppUser | null {
  const [user, setUser] = useState<AppUser | null>(() => {
    if (typeof document !== 'undefined') {
      return getUserFromCookie()
    }
    return null
  })

  useEffect(() => {
    setUser(getUserFromCookie())

    const handler = () => setUser(getUserFromCookie())
    window.addEventListener('user-changed', handler)
    return () => window.removeEventListener('user-changed', handler)
  }, [])

  return user
}
