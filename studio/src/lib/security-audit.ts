// ── Security Audit Logger ───────────────────────────────────────────────
// Structured JSON logging for security-relevant events.
// In production this would forward to a SIEM / log aggregator; for now
// it writes to stdout so Vercel / CloudWatch can pick it up.

export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'rate_limited'
  | 'session_verified'
  | 'session_invalid'
  | 'logout'

export interface SecurityAuditEvent {
  type: SecurityEventType
  /** Sanitised metadata — never include passwords or tokens */
  metadata?: Record<string, string | number | boolean | null>
}

/**
 * Emit a structured security audit log line.
 *
 * Metadata values are coerced to primitives and truncated to prevent
 * accidental credential leakage or log injection.
 */
export function logSecurityAuditEvent(event: SecurityAuditEvent): void {
  const sanitised: Record<string, string | number | boolean | null> = {}

  if (event.metadata) {
    for (const [key, value] of Object.entries(event.metadata)) {
      // Strip any control characters that could break structured logs
      const safeKey = String(key).replace(/[\x00-\x1f]/g, '').slice(0, 64)
      if (typeof value === 'string') {
        sanitised[safeKey] = value.replace(/[\x00-\x1f]/g, '').slice(0, 256)
      } else {
        sanitised[safeKey] = value
      }
    }
  }

  const entry = {
    level: 'security',
    timestamp: new Date().toISOString(),
    event: event.type,
    ...sanitised,
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry))
}
