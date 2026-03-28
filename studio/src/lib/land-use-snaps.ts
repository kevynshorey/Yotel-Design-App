/**
 * Revit-style snaps for land-use drawing in site coordinates (+X east, +Y north).
 */
import type { Point2D } from '@/engine/types'
import type { DrawTool } from '@/engine/land-use'

const SNAP_M = 2.6
const ANGLE_TOL = (9 * Math.PI) / 180

function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midsClosed(ring: Point2D[]): Point2D[] {
  const n = ring.length
  if (n < 2) return []
  const out: Point2D[] = []
  for (let i = 0; i < n; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % n]
    out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  }
  return out
}

function midsOpen(ring: Point2D[]): Point2D[] {
  const out: Point2D[] = []
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i]
    const b = ring[i + 1]
    out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  }
  return out
}

function smallestAngleDiff(a: number, b: number): number {
  let d = Math.abs(a - b)
  while (d > Math.PI) d -= 2 * Math.PI
  return Math.abs(d)
}

/** Snap raw point to horizontal/vertical from anchor (site axes). */
function snapOrtho(anchor: Point2D, raw: Point2D): Point2D {
  const dx = raw.x - anchor.x
  const dy = raw.y - anchor.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return raw
  const ang = Math.atan2(dy, dx)
  const orthoDirs = [0, Math.PI / 2, -Math.PI / 2, Math.PI, -Math.PI]
  let best = ang
  let bestDiff = Infinity
  for (const o of orthoDirs) {
    const d = smallestAngleDiff(ang, o)
    if (d < bestDiff) {
      bestDiff = d
      best = o
    }
  }
  if (bestDiff > ANGLE_TOL) return raw
  return { x: anchor.x + Math.cos(best) * len, y: anchor.y + Math.sin(best) * len }
}

/** Project raw onto infinite line through anchor in direction (ux, uy). */
function snapParallel(anchor: Point2D, raw: Point2D, ux: number, uy: number): Point2D | null {
  const elen = Math.hypot(ux, uy)
  if (elen < 1e-9) return null
  ux /= elen
  uy /= elen
  const dx = raw.x - anchor.x
  const dy = raw.y - anchor.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) return raw
  const ang = Math.atan2(dy, dx)
  const edgeAng = Math.atan2(uy, ux)
  const diff = smallestAngleDiff(ang, edgeAng)
  const diffRev = smallestAngleDiff(ang, edgeAng + Math.PI)
  if (Math.min(diff, diffRev) > ANGLE_TOL) return null
  const t = dx * ux + dy * uy
  return { x: anchor.x + ux * t, y: anchor.y + uy * t }
}

export interface LandUseSnapContext {
  enabled: boolean
  tool: DrawTool
  activeRing: Point2D[]
  completedRings: Point2D[][]
  boundaries: Point2D[][]
  zonePolygons: Point2D[][]
  /** First corner while dragging a rectangle */
  rectStart: Point2D | null
}

export function applyLandUseSnap(raw: Point2D, ctx: LandUseSnapContext): Point2D {
  if (!ctx.enabled) return raw

  const snapPoints: Point2D[] = []

  for (const r of ctx.completedRings) {
    for (const p of r) snapPoints.push(p)
    if (r.length >= 2) snapPoints.push(...midsClosed(r))
  }

  for (const p of ctx.activeRing) snapPoints.push(p)
  snapPoints.push(...midsOpen(ctx.activeRing))

  for (const b of ctx.boundaries) {
    for (const p of b) snapPoints.push(p)
    if (b.length >= 3) snapPoints.push(...midsClosed(b))
  }

  for (const z of ctx.zonePolygons) {
    for (const p of z) snapPoints.push(p)
    if (z.length >= 3) snapPoints.push(...midsClosed(z))
  }

  let best: Point2D | null = null
  let bestD = SNAP_M
  for (const p of snapPoints) {
    const d = dist(p, raw)
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  if (best) return best

  if (ctx.tool === 'rectangle' && ctx.rectStart) {
    return snapOrtho(ctx.rectStart, raw)
  }

  if (ctx.tool === 'freehand') {
    return raw
  }

  const ring = ctx.activeRing
  const anchor = ring.length > 0 ? ring[ring.length - 1] : null
  if (!anchor) return raw

  if (ring.length >= 2) {
    const p0 = ring[ring.length - 2]
    const p1 = ring[ring.length - 1]
    const par = snapParallel(anchor, raw, p1.x - p0.x, p1.y - p0.y)
    if (par) return par
  }

  return snapOrtho(anchor, raw)
}
