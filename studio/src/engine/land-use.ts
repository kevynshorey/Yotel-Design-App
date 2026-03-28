/**
 * Land use layers — boundaries in site survey coordinates (same as ORIGINAL_BOUNDARY / OFFSET_BOUNDARY).
 * Each layer has a category, a user-facing name, and one or more closed polygon rings.
 */
import { OFFSET_BOUNDARY, ORIGINAL_BOUNDARY, SITE } from '@/config/site'
import type { Point2D } from '@/engine/types'

/** High-level type shown in the UI dropdown */
export type LandUseCategory = 'parking' | 'hotel' | 'buildable_area' | 'site_boundary'

export type DrawTool = 'polygon' | 'line_chain' | 'rectangle' | 'freehand'

export interface LandUseZone {
  id: string
  category: LandUseCategory
  /** User-defined layer name, e.g. "Parking 1" — one logical boundary, may have multiple rings */
  layerName: string
  /** Closed rings; each ring has ≥3 points, first point not repeated at end */
  polygons: Point2D[][]
  color: string
  visible: boolean
}

export const LAND_USE_CATEGORY_META: Record<
  LandUseCategory,
  { label: string; color: string; description: string }
> = {
  parking: {
    label: 'Parking',
    color: '#6366f1',
    description: 'Surface or structured parking',
  },
  hotel: {
    label: 'Hotel',
    color: '#0d9488',
    description: 'Hotel podium, tower, or guest-only pad',
  },
  buildable_area: {
    label: 'Buildable area',
    color: '#3b82f6',
    description: 'Developable footprint after setbacks',
  },
  site_boundary: {
    label: 'Site boundary',
    color: '#dc2626',
    description: 'Legal / survey site limit',
  },
}

/** Suggested names when creating a new layer (dropdown + custom input) */
export const LAYER_NAME_PRESETS: Record<LandUseCategory, string[]> = {
  parking: ['Parking 1', 'Parking 2', 'Visitor parking', 'Service parking'],
  hotel: ['Hotel podium', 'Tower footprint', 'Mission Control'],
  buildable_area: ['Buildable pad A', 'Residual pad', 'Future phase'],
  site_boundary: ['Full site', 'Phase 1', 'Lease line'],
}

function bboxOf(points: Point2D[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  return { minX, maxX, minY, maxY }
}

function rectSite(minX: number, minY: number, maxX: number, maxY: number): Point2D[] {
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ]
}

function seedBuildableBands(): { hotel: Point2D[]; outdoor: Point2D[]; foliage: Point2D[] } {
  const { minX, maxX, minY, maxY } = bboxOf(OFFSET_BOUNDARY)
  const h = (maxY - minY) / 3
  const y0 = minY
  const y1 = minY + h
  const y2 = minY + 2 * h
  const y3 = maxY
  return {
    hotel: rectSite(minX, y0, maxX, y1),
    outdoor: rectSite(minX, y1, maxX, y2),
    foliage: rectSite(minX, y2, maxX, y3),
  }
}

const ENTRANCE_DRIVE_W = 6
const PARALLEL_BAY_W = 2.5
const NUM_BAYS_PER_SIDE = 8
const PARALLEL_BAY_D = 5
const parkingStripLength = NUM_BAYS_PER_SIDE * PARALLEL_BAY_D

function seedParkingRects(): { east: Point2D[]; west: Point2D[] } {
  const swCorner = ORIGINAL_BOUNDARY[0]
  const entranceWorldX = swCorner.x + 5
  const entranceWorldY = swCorner.y
  const entranceX = entranceWorldX - SITE.buildableMinX
  const entranceY = entranceWorldY - SITE.buildableMinY

  const peX = entranceX + ENTRANCE_DRIVE_W + 0.5
  const peY = entranceY
  const pwX = entranceX - PARALLEL_BAY_W - 0.5
  const pwY = entranceY

  function toSite(blx: number, bly: number, bw: number, bd: number): Point2D[] {
    const x0 = SITE.buildableMinX + blx
    const y0 = SITE.buildableMinY + bly
    return [
      { x: x0, y: y0 },
      { x: x0 + bw, y: y0 },
      { x: x0 + bw, y: y0 + bd },
      { x: x0, y: y0 + bd },
    ]
  }

  return {
    east: toSite(peX, peY, PARALLEL_BAY_W, parkingStripLength),
    west: toSite(pwX, pwY, PARALLEL_BAY_W, parkingStripLength),
  }
}

function zone(
  id: string,
  category: LandUseCategory,
  layerName: string,
  polygons: Point2D[][],
  visible = true,
): LandUseZone {
  return {
    id,
    category,
    layerName,
    polygons,
    color: LAND_USE_CATEGORY_META[category].color,
    visible,
  }
}

/** Starter layers aligned with previous defaults (hotel / outdoor / foliage + two parking strips). */
export function createDefaultLandUseZones(): LandUseZone[] {
  const bands = seedBuildableBands()
  const pk = seedParkingRects()

  return [
    zone('land-hotel', 'hotel', 'Hotel band (south)', [bands.hotel]),
    zone('land-outdoor', 'buildable_area', 'Outdoor / pool band', [bands.outdoor]),
    zone('land-foliage', 'buildable_area', 'Foliage band (north)', [bands.foliage]),
    zone('land-parking-1', 'parking', 'Parking 1', [pk.east]),
    zone('land-parking-2', 'parking', 'Parking 2', [pk.west]),
  ]
}

export function polygonAreaSqm(points: Point2D[]): number {
  if (points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    sum += points[i].x * points[j].y - points[j].x * points[i].y
  }
  return Math.abs(sum / 2)
}

export function totalZoneAreaSqm(z: LandUseZone): number {
  return z.polygons.reduce((acc, ring) => acc + polygonAreaSqm(ring), 0)
}

export function displayLabel(z: LandUseZone): string {
  return `${z.layerName} · ${LAND_USE_CATEGORY_META[z.category].label}`
}

/** v1 shape: kind + single boundary */
interface LegacyV1Zone {
  id?: string
  kind?: string
  label?: string
  boundary?: Point2D[]
  color?: string
  visible?: boolean
}

const KIND_TO_CATEGORY: Record<string, LandUseCategory> = {
  hotel: 'hotel',
  outdoor: 'buildable_area',
  foliage: 'buildable_area',
  parking_1: 'parking',
  parking_2: 'parking',
}

const CATEGORY_SET = new Set<LandUseCategory>(['parking', 'hotel', 'buildable_area', 'site_boundary'])

export function migrateLandUseRow(raw: unknown): LandUseZone | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>

  if (Array.isArray(o.polygons) && o.polygons.every((p) => Array.isArray(p))) {
    const z = o as unknown as LandUseZone
    if (
      typeof z.id === 'string' &&
      typeof z.layerName === 'string' &&
      CATEGORY_SET.has(z.category as LandUseCategory) &&
      z.polygons.length > 0
    ) {
      return {
        ...z,
        color: typeof z.color === 'string' ? z.color : LAND_USE_CATEGORY_META[z.category].color,
        visible: z.visible !== false,
      }
    }
  }

  const legacy = o as LegacyV1Zone
  if (legacy.boundary && Array.isArray(legacy.boundary) && legacy.boundary.length >= 2) {
    const kind = legacy.kind ?? 'buildable_area'
    const category = KIND_TO_CATEGORY[kind] ?? 'buildable_area'
    return {
      id: legacy.id ?? `migrated-${Date.now()}`,
      category,
      layerName: typeof legacy.label === 'string' ? legacy.label : 'Migrated layer',
      polygons: [legacy.boundary],
      color: typeof legacy.color === 'string' ? legacy.color : LAND_USE_CATEGORY_META[category].color,
      visible: legacy.visible !== false,
    }
  }

  return null
}
