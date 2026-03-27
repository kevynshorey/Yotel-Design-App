import type { OptionMetrics, Wing, Point2D, ValidationResult, Violation, ProjectId } from './types'
import { RULES } from '@/config/rules'
import { SITE as CARLISLE_BAY_SITE } from '@/config/site'
import { SITE as ABBEVILLE_SITE } from '@/config/abbeville/site'
import { getJurisdiction, type Jurisdiction } from '@/config/jurisdictions'

function getProjectSite(projectId?: ProjectId) {
  if (projectId === 'abbeville') return ABBEVILLE_SITE
  return CARLISLE_BAY_SITE
}

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

/**
 * Validate a design option against planning rules.
 *
 * @param metrics  - the computed option metrics
 * @param wings    - array of building wings
 * @param jurisdictionId - optional 2-letter jurisdiction code (e.g. 'bb', 'jm').
 *                         Falls back to Barbados defaults if omitted or not found.
 * @param projectId - optional project identifier. When provided, uses that project's
 *                    site config (maxFootprint, buildableEW/NS). Defaults to carlisle-bay.
 */
export function validate(
  metrics: OptionMetrics,
  wings: Wing[],
  jurisdictionId?: string,
  projectId?: ProjectId,
): ValidationResult {
  const violations: Violation[] = []
  const warnings: string[] = []

  // Resolve site config based on projectId (defaults to carlisle-bay)
  const SITE = getProjectSite(projectId)

  // Resolve jurisdiction — fall back to Barbados hardcoded RULES when absent
  const jurisdiction: Jurisdiction | undefined = jurisdictionId
    ? getJurisdiction(jurisdictionId)
    : undefined

  // Effective planning limits: jurisdiction overrides if present, else Barbados defaults
  const maxCoverage = jurisdiction?.maxCoverage ?? RULES.planning.maxCoverage
  const maxHeight = jurisdiction?.maxHeight ?? RULES.planning.maxHeight
  const boundarySetback = jurisdiction?.minSetback ?? RULES.planning.boundarySetback
  const buildingSeparation = RULES.planning.buildingSeparation // site-specific, keep Barbados

  // Coverage
  if (metrics.coverage > maxCoverage) {
    violations.push({
      rule: 'Max site coverage',
      actual: `${(metrics.coverage * 100).toFixed(1)}%`,
      limit: `${maxCoverage * 100}%`,
      severity: 'fatal',
    })
  }

  // Height
  if (metrics.buildingHeight > maxHeight) {
    violations.push({
      rule: 'Max building height',
      actual: `${metrics.buildingHeight}m`,
      limit: `${maxHeight}m`,
      severity: 'fatal',
    })
  }

  // ── BOUNDARY SETBACK ENFORCEMENT ──────────────────────────────────────
  // Uses jurisdiction-specific setback when provided, otherwise Barbados 1.83m.
  // Wing coordinates are in building-local space (origin at BUILDING_PLACEMENT).
  // The buildable zone spans [0, buildableEW] × [0, buildableNS].
  const SETBACK = boundarySetback
  const minX = SETBACK
  const minY = SETBACK
  const maxX = SITE.buildableEW - SETBACK
  const maxY = SITE.buildableNS - SETBACK

  let outsideCorners = 0
  let tooCloseToEdge = 0
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
      // Hard fail: completely outside buildable zone
      if (cx < 0 || cy < 0 || cx > SITE.buildableEW || cy > SITE.buildableNS) {
        outsideCorners++
      }
      // Setback violation
      else if (cx < minX || cy < minY || cx > maxX || cy > maxY) {
        tooCloseToEdge++
      }
    }
  }

  if (outsideCorners > 0) {
    violations.push({
      rule: 'Building outside buildable zone',
      actual: `${outsideCorners} corners outside boundary`,
      limit: '0 — must be fully within offset boundary',
      severity: 'fatal',
    })
  }

  if (tooCloseToEdge > 0) {
    violations.push({
      rule: `Boundary setback violation (${SETBACK}m minimum)`,
      actual: `${tooCloseToEdge} corners within ${SETBACK}m of boundary`,
      limit: `${SETBACK}m from all property boundaries`,
      severity: 'fatal',
    })
  }

  // ── BUILDING SEPARATION ──────────────────────────────────────────────
  // Minimum 12 ft (3.66m) between buildings on the same land.
  // Check gap between wings for multi-wing forms (L, U, C).
  if (wings.length >= 2) {
    const SEPARATION = buildingSeparation // 3.66m
    for (let i = 0; i < wings.length; i++) {
      for (let j = i + 1; j < wings.length; j++) {
        const a = wings[i], b = wings[j]
        // Simple gap check: if wings share an edge (e.g. L-form corner),
        // the overlap is intentional (connected). Only flag if wings are
        // detached but too close.
        const aEndX = a.x + (a.direction === 'NS' ? a.width : a.length)
        const bStartX = b.x
        const gap = bStartX - aEndX
        if (gap > 0 && gap < SEPARATION) {
          warnings.push(
            `Wings "${a.label}" and "${b.label}" are ${gap.toFixed(1)}m apart — minimum ${SEPARATION}m required between buildings`
          )
        }
      }
    }
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
