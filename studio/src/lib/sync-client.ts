'use client'

/**
 * Client-side cloud sync helper.
 *
 * Provides fire-and-forget helpers to push/pull data from the /api/sync
 * endpoint.  All operations are optional — the app works fully offline
 * with just IndexedDB + localStorage.
 */

// ── Debounce tracking ───────────────────────────────────────────────────────

const MIN_INTERVAL_MS = 5_000 // Don't sync the same key more than once per 5s
const lastSyncTime = new Map<string, number>()

function shouldSync(key: string): boolean {
  const now = Date.now()
  const last = lastSyncTime.get(key) ?? 0
  if (now - last < MIN_INTERVAL_MS) return false
  lastSyncTime.set(key, now)
  return true
}

// ── Core helpers ────────────────────────────────────────────────────────────

/**
 * Push a key/value pair to the cloud sync endpoint.
 * Silently fails if offline or rate-limited — this is best-effort.
 */
export async function syncToCloud(key: string, data: unknown): Promise<void> {
  if (!shouldSync(key)) return
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
      credentials: 'same-origin',
    })
  } catch {
    /* offline or network error — silently ignore */
  }
}

/**
 * Fetch a value from the cloud sync endpoint.
 * Returns `null` if not found, offline, or any error occurs.
 */
export async function fetchFromCloud<T = unknown>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/sync?key=${encodeURIComponent(key)}`, {
      credentials: 'same-origin',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: T }
    return json.data ?? null
  } catch {
    return null
  }
}

// ── Auto-sync ───────────────────────────────────────────────────────────────

let autoSyncInterval: ReturnType<typeof setInterval> | null = null

/**
 * Periodically sync the given localStorage keys to the cloud.
 * Reads from localStorage (the canonical sync source) and pushes to /api/sync.
 *
 * @param keys       localStorage keys to sync
 * @param intervalMs How often to run (default 30 000 ms = 30 s)
 * @returns A cleanup function that stops the auto-sync
 */
export function enableAutoSync(
  keys: string[],
  intervalMs: number = 30_000,
): () => void {
  // Clear any previous auto-sync
  if (autoSyncInterval !== null) {
    clearInterval(autoSyncInterval)
  }

  const tick = () => {
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key)
        if (raw !== null) {
          const parsed: unknown = JSON.parse(raw)
          // fire-and-forget
          void syncToCloud(key, parsed)
        }
      } catch {
        /* corrupt data or missing key — skip */
      }
    }
  }

  // Run once immediately, then on interval
  tick()
  autoSyncInterval = setInterval(tick, intervalMs)

  return () => {
    if (autoSyncInterval !== null) {
      clearInterval(autoSyncInterval)
      autoSyncInterval = null
    }
  }
}
