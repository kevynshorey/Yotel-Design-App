import { describe, it, expect } from 'vitest'
import { signPayload, verifySignature } from '../auth-signature'

describe('auth-signature', () => {
  const payload = JSON.stringify({ name: 'Kevyn', role: 'admin' })

  it('sign + verify round-trip succeeds', () => {
    const sig = signPayload(payload)
    expect(verifySignature(payload, sig)).toBe(true)
  })

  it('rejects a tampered payload', () => {
    const sig = signPayload(payload)
    const tampered = JSON.stringify({ name: 'Kevyn', role: 'viewer' })
    expect(verifySignature(tampered, sig)).toBe(false)
  })

  it('rejects a tampered signature', () => {
    const sig = signPayload(payload)
    // Flip the last hex character
    const lastChar = sig[sig.length - 1]
    const flipped = lastChar === '0' ? '1' : '0'
    const tampered = sig.slice(0, -1) + flipped
    expect(verifySignature(payload, tampered)).toBe(false)
  })

  it('rejects an empty signature', () => {
    expect(verifySignature(payload, '')).toBe(false)
  })

  it('rejects a non-hex signature', () => {
    expect(verifySignature(payload, 'not-a-valid-hex-signature!!!')).toBe(false)
  })

  it('rejects a signature with wrong length', () => {
    expect(verifySignature(payload, 'abcd')).toBe(false)
  })

  it('produces deterministic signatures', () => {
    const sig1 = signPayload(payload)
    const sig2 = signPayload(payload)
    expect(sig1).toBe(sig2)
  })

  it('produces different signatures for different payloads', () => {
    const sig1 = signPayload('payload-a')
    const sig2 = signPayload('payload-b')
    expect(sig1).not.toBe(sig2)
  })
})
