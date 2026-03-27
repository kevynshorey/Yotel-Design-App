import type { Point2D } from '@/engine/types'

/**
 * Mt Brevitor Estates — Site Configuration (Studio adapter)
 * Source: estate-engine/src/config/site.ts (MBE_B2, MBE_F1)
 *
 * This file adapts the 120-acre estate site into the studio's SiteConfig shape.
 * Units: metres from local project base point.
 *
 * The estate is not a single-building hotel site. The studio engine uses these
 * values only for coverage and boundary checks on any sub-cluster building.
 * For full masterplan analysis use estate-engine directly.
 *
 * Coordinate system: the studio validator expects buildableEW × buildableNS
 * as the bounding box of the buildable zone. For Mt Brevitor this represents
 * the Community Hub cluster footprint (~4-5 acres = ~200m × 100m), which is
 * the zone most likely to contain a hotel-type building (small YOTEL TBC).
 */

/** Approximate site boundary (6-vertex polygon, metres from gate origin).
 *  Scale: 1 unit ≈ 1 metre. Entire 120-acre site represented schematically. */
export const ORIGINAL_BOUNDARY: Point2D[] = [
  { x: 0,   y: 0   },
  { x: 0,   y: 200 },
  { x: 300, y: 220 },
  { x: 350, y: 180 },
  { x: 380, y: 100 },
  { x: 350, y: 0   },
]

/** Buildable zone — 10 m inset from site boundary. */
export const OFFSET_BOUNDARY: Point2D[] = [
  { x: 10,  y: 10  },
  { x: 10,  y: 190 },
  { x: 290, y: 210 },
  { x: 340, y: 170 },
  { x: 370, y: 90  },
  { x: 340, y: 10  },
]

/** Building placement origin — aligns to buildable zone (x: 10, y: 10). */
export const BUILDING_PLACEMENT = { x: 10, y: 10, rotDeg: 0 } as const

/** Directional setbacks (metres). */
export const OFFSETS = { W: 10, N: 10, E: 10, S: 10 } as const

/**
 * Computed site metrics.
 *
 * grossArea / buildableArea are in m² (120 acres → 485 623 m²; 110 acres → 445 154 m²).
 *
 * buildableEW / buildableNS are sized to the Community Hub cluster (~200 m × 100 m)
 * so the studio validator operates on a meaningful sub-zone rather than the full estate.
 * maxFootprint = 50 % of hub buildable area (20 000 m²).
 */
export const SITE = {
  grossArea:        485_623,   // m² — 120 acres
  buildableArea:    445_154,   // m² — 110 acres developable
  maxCoverage:      0.50,
  maxFootprint:     20_000,    // m² — 50% of hub zone (200m × 200m)
  maxHeight:        12.0,      // metres — max 3 storeys inland Barbados
  buildableEW:      200,       // m — Community Hub zone E-W extent
  buildableNS:      200,       // m — Community Hub zone N-S extent
  buildableMinX:    10,
  buildableMaxX:    210,
  buildableMinY:    10,
  buildableMaxY:    210,
  beachSide:        'W' as const,  // Caribbean coast is west
  centroidX:        190,
  centroidY:        110,
} as const

/** Barbados planning regulations — inland agricultural / residential estate. */
export const PLANNING_REGS = {
  coastalSetback:       0,       // inland site
  maxCoverage:          0.50,
  maxHeight:            12.0,    // metres — 3-storey max
  maxStoreys:           3,
  roadSetbackClassI:    15.24,   // 50 ft
  roadSetbackClassII:   9.75,    // 32 ft
  roadSetbackClassIII:  5.79,    // 19 ft
  sideSetback:          1.83,    // 6 ft
  rearSetback:          3.0,
  eiaRequired:          true,
  agriculturalConversion: true,  // required for non-residential use
  heritageZoneProximity: false,
  parkingRatioMin:      0.5,     // residential: 0.5 per unit minimum
  parkingRatioMax:      1.0,
} as const
