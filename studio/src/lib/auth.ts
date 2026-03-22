'use client'

import { useEffect, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'viewer'

export interface AppUser {
  name: string
  role: UserRole
}

// ── User database (hardcoded for this personal app) ────────────────────

export const USERS: { password: string; user: AppUser }[] = [
  { password: 'kevyn2026', user: { name: 'Kevyn', role: 'admin' } },
  { password: 'caro2026', user: { name: 'Caro', role: 'admin' } },
  { password: 'guest', user: { name: 'Guest', role: 'viewer' } },
  // backward compat: legacy password "aces" → guest
  { password: 'aces', user: { name: 'Guest', role: 'viewer' } },
]

export const COOKIE_NAME = 'yotel-user'
export const AUTH_COOKIE_NAME = 'studio-auth'

// ── Permission checks ──────────────────────────────────────────────────

export function canEdit(user: AppUser | null): boolean {
  return user?.role === 'admin'
}

export function canExport(user: AppUser | null): boolean {
  return user?.role === 'admin'
}

export function canUseAI(user: AppUser | null): boolean {
  return user?.role === 'admin'
}

export function canGenerate(user: AppUser | null): boolean {
  return user?.role === 'admin'
}

export function canView(user: AppUser | null): boolean {
  return user !== null
}

// ── Client-side: read user from cookie ─────────────────────────────────

function parseCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : undefined
}

export function getUserFromCookie(): AppUser | null {
  const raw = parseCookie(COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AppUser
    if (parsed.name && parsed.role) return parsed
  } catch {
    // ignore malformed cookie
  }
  return null
}

/** React hook — reads user from cookie on mount and after login events */
export function useUser(): AppUser | null {
  const [user, setUser] = useState<AppUser | null>(null)

  useEffect(() => {
    setUser(getUserFromCookie())

    const handler = () => setUser(getUserFromCookie())
    window.addEventListener('user-changed', handler)
    return () => window.removeEventListener('user-changed', handler)
  }, [])

  return user
}

// ── Server-side helper (used in API routes) ────────────────────────────

export function authenticatePassword(password: string): AppUser | null {
  const entry = USERS.find((u) => u.password === password)
  return entry?.user ?? null
}
