'use client'

import type { Point2D } from '@/engine/types'
import {
  createDefaultLandUseZones,
  LAND_USE_CATEGORY_META,
  migrateLandUseRow,
  type LandUseZone,
} from '@/engine/land-use'

const STORAGE_KEY_V2 = 'yotel-land-uses-v2'
const STORAGE_KEY_V1 = 'yotel-land-uses-v1'

export const LAND_USE_CHANGED_EVENT = 'land-use-changed'

function migrateV1FileIfNeeded(): void {
  if (typeof window === 'undefined') return
  try {
    const v2 = localStorage.getItem(STORAGE_KEY_V2)
    if (v2) return
    const v1 = localStorage.getItem(STORAGE_KEY_V1)
    if (!v1) return
    const parsed = JSON.parse(v1) as unknown[]
    if (!Array.isArray(parsed)) return
    const zones = parsed.map(migrateLandUseRow).filter((z): z is LandUseZone => z !== null)
    if (zones.length > 0) {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(zones))
    }
  } catch {
    /* ignore */
  }
}

function readZones(): LandUseZone[] | null {
  if (typeof window === 'undefined') return null
  migrateV1FileIfNeeded()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return null
    const zones = parsed.map(migrateLandUseRow).filter((z): z is LandUseZone => z !== null)
    return zones
  } catch {
    return null
  }
}

function writeZones(zones: LandUseZone[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(zones))
  window.dispatchEvent(new CustomEvent(LAND_USE_CHANGED_EVENT))
}

export function getLandUseZones(): LandUseZone[] {
  const existing = readZones()
  if (existing !== null) return existing
  const seeded = createDefaultLandUseZones()
  writeZones(seeded)
  return seeded
}

export function setLandUseZones(zones: LandUseZone[]) {
  writeZones(zones)
}

export function resetLandUseZones() {
  writeZones(createDefaultLandUseZones())
}

export function toggleLandUseVisible(id: string) {
  const zones = getLandUseZones()
  const next = zones.map((z) => (z.id === id ? { ...z, visible: !z.visible } : z))
  writeZones(next)
}

export interface AddLandUseLayerInput {
  category: LandUseZone['category']
  layerName: string
  polygons: Point2D[][]
  /** If set, append these rings to an existing zone instead of creating one */
  mergeIntoId?: string
}

export function addLandUseLayer(input: AddLandUseLayerInput) {
  const zones = getLandUseZones()
  const color = LAND_USE_CATEGORY_META[input.category].color

  if (input.mergeIntoId) {
    const next = zones.map((z) => {
      if (z.id !== input.mergeIntoId) return z
      return {
        ...z,
        polygons: [...z.polygons, ...input.polygons],
      }
    })
    writeZones(next)
    return
  }

  const id = `land-${input.category}-${Date.now()}`
  const zone: LandUseZone = {
    id,
    category: input.category,
    layerName: input.layerName.trim() || 'Untitled layer',
    polygons: input.polygons,
    color,
    visible: true,
  }
  writeZones([...zones, zone])
}
