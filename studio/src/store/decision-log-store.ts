// ── Decision Log Store ──
// localStorage-backed per-option decision log

export interface Decision {
  id: number
  title: string
  rationale: string
  impact: string
  timestamp: string // ISO 8601
}

const STORAGE_PREFIX = 'yotel_decisions_'

function storageKey(scopeId: string): string {
  return `${STORAGE_PREFIX}${scopeId}`
}

function readAll(scopeId: string): Decision[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(scopeId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Decision[]
  } catch {
    return []
  }
}

function writeAll(scopeId: string, decisions: Decision[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(scopeId), JSON.stringify(decisions))
}

function nextId(decisions: Decision[]): number {
  if (decisions.length === 0) return 1
  return Math.max(...decisions.map((d) => d.id)) + 1
}

export function addDecision(
  scopeId: string,
  entry: { title: string; rationale: string; impact: string },
): Decision {
  const decisions = readAll(scopeId)
  const decision: Decision = {
    id: nextId(decisions),
    title: entry.title.trim(),
    rationale: entry.rationale.trim(),
    impact: entry.impact.trim(),
    timestamp: new Date().toISOString(),
  }
  decisions.push(decision)
  writeAll(scopeId, decisions)
  return decision
}

export function getDecisions(scopeId: string): Decision[] {
  return readAll(scopeId)
}

export function clearDecisions(scopeId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(scopeId))
}
