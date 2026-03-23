// ── Auth — shared between server (API routes) and client (components) ──
// NO 'use client' directive — this file is importable from both contexts.
// React hooks are dynamically imported only on the client side.

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

// ── Server-side helper (used in API routes) ────────────────────────────

export function authenticatePassword(password: string): AppUser | null {
  const entry = USERS.find((u) => u.password === password)
  return entry?.user ?? null
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
