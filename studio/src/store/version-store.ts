import type { DesignOption } from '@/engine/types'

export interface SavedVersion {
  id: string
  name: string
  timestamp: string
  option: DesignOption
}

const STORAGE_KEY = 'yotel-saved-versions'

export function saveVersion(
  option: DesignOption,
  name?: string,
): SavedVersion {
  const versions = getVersions()
  const version: SavedVersion = {
    id: `v-${Date.now()}`,
    name:
      name ||
      `${option.form} ${option.metrics.totalKeys}keys — ${new Date().toLocaleTimeString()}`,
    timestamp: new Date().toISOString(),
    option,
  }
  versions.unshift(version) // newest first
  if (versions.length > 20) versions.pop() // cap at 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
  return version
}

export function getVersions(): SavedVersion[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function deleteVersion(id: string): void {
  const versions = getVersions().filter((v) => v.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
}

export function loadVersion(id: string): DesignOption | null {
  const version = getVersions().find((v) => v.id === id)
  return version?.option ?? null
}
