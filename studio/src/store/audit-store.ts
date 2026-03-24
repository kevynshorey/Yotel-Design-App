// ── Audit Trail Store ──
// localStorage-backed audit log for design decisions, parameter changes, and approvals.

export type AuditAction =
  | 'option_selected'
  | 'option_generated'
  | 'option_favourited'
  | 'design_exported'
  | 'report_generated'
  | 'setting_changed'
  | 'layout_saved'
  | 'version_saved'
  | 'comparison_made'
  | 'score_viewed'

export interface AuditEntry {
  id: string
  timestamp: string // ISO 8601
  userId: string
  userName: string
  action: AuditAction
  target: string // what was acted on
  before?: string // previous value
  after?: string // new value
  metadata: Record<string, string>
}

const STORAGE_KEY = 'yotel-audit-log'
const MAX_ENTRIES = 500

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readAll(): AuditEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as AuditEntry[]
  } catch {
    return []
  }
}

function writeAll(entries: AuditEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/** Log a new audit entry. Enforces FIFO at MAX_ENTRIES. */
export function logAudit(
  entry: Omit<AuditEntry, 'id' | 'timestamp'>,
): AuditEntry {
  const entries = readAll()
  const record: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...entry,
  }
  entries.push(record)
  // FIFO: trim oldest entries when over max
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES)
  }
  writeAll(entries)
  return record
}

/** Get audit log entries, optionally limited to the most recent N. */
export function getAuditLog(limit?: number): AuditEntry[] {
  const entries = readAll()
  if (limit && limit > 0) {
    return entries.slice(-limit)
  }
  return entries
}

/** Get audit entries filtered by action type. */
export function getAuditByAction(action: AuditAction): AuditEntry[] {
  return readAll().filter((e) => e.action === action)
}

/** Clear the entire audit log. */
export function clearAuditLog(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
