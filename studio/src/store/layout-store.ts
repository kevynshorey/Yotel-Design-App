/**
 * Shared Layout Override Store
 *
 * Bridges the Konva interactive planner and the 3D viewer.
 * When the planner modifies element positions, adds user elements, or removes
 * engine elements, it writes the canonical override list here.  The 3D viewer
 * listens for the `layout-overrides-changed` CustomEvent and re-renders.
 *
 * Data is persisted to localStorage (sync, immediate reads) AND IndexedDB
 * (async, larger quota) so overrides survive page refreshes.
 */

import type { PlacedElement } from '@/engine/site-layout'
import { storage } from '@/store/persistence'

// ── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'yotel-layout-overrides-v2'

// ── CustomEvent name ─────────────────────────────────────────────────────────
export const LAYOUT_CHANGED_EVENT = 'layout-overrides-changed'

// ── Stored shape ─────────────────────────────────────────────────────────────
export interface LayoutOverridePayload {
  /** Engine elements whose position/size was modified by the user. */
  modified: PlacedElement[]
  /** Brand-new elements added by the user (source = 'user' in the planner). */
  added: PlacedElement[]
  /** IDs of engine elements the user deleted. */
  removedIds: string[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyPayload(): LayoutOverridePayload {
  return { modified: [], added: [], removedIds: [] }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Persist layout overrides and notify listeners. */
export function saveLayoutOverrides(payload: LayoutOverridePayload): void {
  if (typeof window === 'undefined') return

  // Synchronous localStorage write for immediate UI reads
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch { /* quota exceeded — silently ignore */ }

  // Async IndexedDB write (non-blocking background task)
  void storage.set(STORAGE_KEY, payload)

  window.dispatchEvent(new CustomEvent(LAYOUT_CHANGED_EVENT))
}

/** Read the current layout overrides (returns empty payload if none). */
export function getLayoutOverrides(): LayoutOverridePayload {
  if (typeof window === 'undefined') return emptyPayload()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LayoutOverridePayload>
      return {
        modified: Array.isArray(parsed.modified) ? parsed.modified : [],
        added: Array.isArray(parsed.added) ? parsed.added : [],
        removedIds: Array.isArray(parsed.removedIds) ? parsed.removedIds : [],
      }
    }
  } catch { /* corrupt data — ignore */ }
  return emptyPayload()
}

/** Clear all layout overrides and notify listeners. */
export function clearLayoutOverrides(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY)

  // Async IndexedDB delete (non-blocking)
  void storage.delete(STORAGE_KEY)

  window.dispatchEvent(new CustomEvent(LAYOUT_CHANGED_EVENT))
}
