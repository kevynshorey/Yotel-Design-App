// ── Design Issues Store ──
// localStorage-backed per-option issue tracker

export type IssuePriority = 'high' | 'medium' | 'low'
export type IssueStatus = 'open' | 'resolved'

export interface DesignIssue {
  id: number
  title: string
  detail: string
  priority: IssuePriority
  status: IssueStatus
  timestamp: string // ISO 8601
}

const STORAGE_PREFIX = 'yotel_issues_'

function storageKey(scopeId: string): string {
  return `${STORAGE_PREFIX}${scopeId}`
}

function readAll(scopeId: string): DesignIssue[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(scopeId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as DesignIssue[]
  } catch {
    return []
  }
}

function writeAll(scopeId: string, issues: DesignIssue[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(scopeId), JSON.stringify(issues))
}

function nextId(issues: DesignIssue[]): number {
  if (issues.length === 0) return 1
  return Math.max(...issues.map((i) => i.id)) + 1
}

export function addIssue(
  scopeId: string,
  entry: { title: string; detail: string; priority: IssuePriority },
): DesignIssue {
  const issues = readAll(scopeId)
  const issue: DesignIssue = {
    id: nextId(issues),
    title: entry.title.trim(),
    detail: entry.detail.trim(),
    priority: entry.priority,
    status: 'open',
    timestamp: new Date().toISOString(),
  }
  issues.push(issue)
  writeAll(scopeId, issues)
  return issue
}

export function getIssues(scopeId: string): DesignIssue[] {
  return readAll(scopeId)
}

export function toggleIssueStatus(scopeId: string, id: number): DesignIssue | null {
  const issues = readAll(scopeId)
  const issue = issues.find((i) => i.id === id)
  if (!issue) return null
  issue.status = issue.status === 'open' ? 'resolved' : 'open'
  writeAll(scopeId, issues)
  return issue
}

export function clearIssues(scopeId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(scopeId))
}
