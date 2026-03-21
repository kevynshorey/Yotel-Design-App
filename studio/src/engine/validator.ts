import type { OptionMetrics, Wing, Point2D, ValidationResult, Violation } from './types'
import { RULES } from '@/config/rules'
import { OFFSET_BOUNDARY, BUILDING_PLACEMENT, SITE } from '@/config/site'

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(x: number, y: number, poly: Point2D[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** Rotate a 2D point around origin by angle in radians (per validator.py). */
function rotatePoint(x: number, y: number, angRad: number): [number, number] {
  const c = Math.cos(angRad), s = Math.sin(angRad)
  return [x * c - y * s, x * s + y * c]
}

export function validate(metrics: OptionMetrics, wings: Wing[]): ValidationResult {
  const violations: Violation[] = []
  const warnings: string[] = []

  // Coverage
  if (metrics.coverage > RULES.planning.maxCoverage) {
    violations.push({
      rule: 'Max site coverage',
      actual: `${(metrics.coverage * 100).toFixed(1)}%`,
      limit: `${RULES.planning.maxCoverage * 100}%`,
      severity: 'fatal',
    })
  }

  // Height
  if (metrics.buildingHeight > RULES.planning.maxHeight) {
    violations.push({
      rule: 'Max building height',
      actual: `${metrics.buildingHeight}m`,
      limit: `${RULES.planning.maxHeight}m`,
      severity: 'fatal',
    })
  }

  // Offset boundary containment — wing coordinates are in building-local space
  // (origin at BUILDING_PLACEMENT, +X east, +Y north). The buildable zone in
  // local space spans [0, buildableEW] × [0, buildableNS].  We check each
  // corner of each wing's footprint; any corner outside this AABB is flagged.
  let outsideCorners = 0
  for (const wing of wings) {
    const rectLx = wing.direction === 'NS' ? wing.width : wing.length
    const rectWy = wing.direction === 'NS' ? wing.length : wing.width
    const corners: [number, number][] = [
      [wing.x, wing.y],
      [wing.x + rectLx, wing.y],
      [wing.x + rectLx, wing.y + rectWy],
      [wing.x, wing.y + rectWy],
    ]
    for (const [cx, cy] of corners) {
      if (cx < 0 || cy < 0 || cx > SITE.buildableEW || cy > SITE.buildableNS) {
        outsideCorners++
      }
    }
  }
  if (outsideCorners > 0) {
    violations.push({
      rule: 'Building footprint exceeds offset boundary (buildable zone)',
      actual: `${outsideCorners} corners outside`,
      limit: '0',
      severity: 'fatal',
    })
  }

  // Wing widths
  for (const wing of wings) {
    const minWidth = metrics.corridorType === 'double_loaded'
      ? RULES.brand.dualMinWidth
      : RULES.brand.singleMinWidth ?? 8.0
    if (wing.width < minWidth) {
      violations.push({
        rule: `Min ${metrics.corridorType === 'double_loaded' ? 'dual' : 'single'}-loaded width (${wing.label})`,
        actual: `${wing.width}m`,
        limit: `${minWidth}m`,
        severity: 'fatal',
      })
    }
    if (metrics.padUnits > 0 && metrics.corridorType === 'double_loaded'
        && wing.width * 1000 < RULES.brand.padDualMinWidth * 1000) {
      warnings.push(`PAD dual-aspect needs ${RULES.brand.padDualMinWidth}m; wing is ${wing.width}m`)
    }
  }

  // GIA efficiency sanity
  if (metrics.giaPerKey < 25) {
    violations.push({
      rule: 'GIA/key impossibly tight',
      actual: `${metrics.giaPerKey.toFixed(1)}m²`,
      limit: '25m²',
      severity: 'fatal',
    })
  } else if (metrics.giaPerKey < 29 || metrics.giaPerKey > 48) {
    warnings.push(`GIA/key ${metrics.giaPerKey.toFixed(1)} m² — outside benchmark (29-48)`)
  }

  // Footprint within buildable area
  if (metrics.footprint > SITE.maxFootprint) {
    violations.push({
      rule: 'Max footprint (50% of buildable)',
      actual: `${metrics.footprint}m²`,
      limit: `${SITE.maxFootprint}m²`,
      severity: 'fatal',
    })
  }

  return {
    isValid: violations.filter(v => v.severity === 'fatal').length === 0,
    violations,
    warnings,
  }
}
