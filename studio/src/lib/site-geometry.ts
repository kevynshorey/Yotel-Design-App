/**
 * Shared site ↔ Three.js XZ mapping (Y is up).
 * Site: +X east, +Y north (survey / Revit style).
 * World: origin at site centroid; +X east, +Z south (so north is −Z).
 */
import { SITE } from '@/config/site'
import type { Point2D } from '@/engine/types'

const CX = SITE.centroidX
const CY = SITE.centroidY

export function sitePointToWorldXZ(p: Point2D): { x: number; z: number } {
  return { x: p.x - CX, z: -(p.y - CY) }
}

export function worldXZToSite(x: number, z: number): Point2D {
  return { x: x + CX, y: CY - z }
}
