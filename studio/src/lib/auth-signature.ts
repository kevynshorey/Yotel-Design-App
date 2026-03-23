// ── Auth Signature — HMAC-SHA256 cookie signing & verification ──────────
// Used to sign the user payload cookie so it cannot be tampered with on
// the client side. The signature is stored in a separate httpOnly cookie.

import { createHmac, timingSafeEqual } from 'crypto'

/** Name of the httpOnly cookie that holds the HMAC signature */
export const SIG_COOKIE = 'yotel-user-sig'

const SECRET = process.env.AUTH_COOKIE_SECRET || 'dev-fallback-secret'

/**
 * Produce an HMAC-SHA256 hex digest of `payload`.
 */
export function signPayload(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex')
}

/**
 * Constant-time comparison of a payload against a candidate signature.
 * Returns `false` for any malformed or mismatched input — never throws.
 */
export function verifySignature(payload: string, signature: string): boolean {
  try {
    const expected = signPayload(payload)
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')

    // Length mismatch means the signature is structurally invalid
    if (sigBuf.length !== expBuf.length) return false

    return timingSafeEqual(sigBuf, expBuf)
  } catch {
    // Any encoding / buffer error → treat as invalid
    return false
  }
}
