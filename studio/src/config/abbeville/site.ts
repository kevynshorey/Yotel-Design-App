import type { Point2D } from '@/engine/types'

/** Original site boundary — 8-vertex polygon approximation for Abbeville site,
 *  Worthing, Christ Church, Barbados.
 *  Units: metres from local project base point. */
export const ORIGINAL_BOUNDARY: Point2D[] = [
  { x: 0.000, y: 0.000 },
  { x: 0.000, y: 67.000 },
  { x: 14.000, y: 75.000 },
  { x: 43.000, y: 77.000 },
  { x: 60.000, y: 75.000 },
  { x: 60.000, y: 8.000 },
  { x: 43.000, y: 2.000 },
  { x: 14.000, y: 0.000 },
]

/** Offset boundary (buildable zone) — after directional setbacks (W:3, N:3, E:5, S:10). */
export const OFFSET_BOUNDARY: Point2D[] = [
  { x: 3.000, y: 10.000 },
  { x: 3.000, y: 57.000 },
  { x: 14.000, y: 63.000 },
  { x: 43.000, y: 65.000 },
  { x: 55.000, y: 63.000 },
  { x: 55.000, y: 10.000 },
  { x: 43.000, y: 10.000 },
  { x: 14.000, y: 10.000 },
]

/** Building placement — aligns local wing (0,0) to offset boundary origin.
 *  x/y match buildableMinX/buildableMinY so wing coords map directly to world. */
export const BUILDING_PLACEMENT = { x: 3, y: 10, rotDeg: 30 } as const

/** Directional setbacks (metres). */
export const OFFSETS = { W: 3, N: 3, E: 5, S: 10 } as const

/** Computed site metrics. */
export const SITE = {
  grossArea: 4008,
  buildableArea: 3036,
  maxCoverage: 0.50,
  maxFootprint: 1518,
  maxHeight: 20.5,
  buildableEW: 52,
  buildableNS: 47,
  buildableMinX: 3,
  buildableMaxX: 55,
  buildableMinY: 10,
  buildableMaxY: 57,
  beachSide: 'SW' as const, // beach access from SW (Worthing seafront)
  centroidX: 29,
  centroidY: 33.5,
} as const

/** Barbados planning regulations for Abbeville, Worthing, Christ Church */
export const PLANNING_REGS = {
  coastalSetback: 0,            // no direct coastal constraint on this plot
  maxCoverage: 0.50,            // 50% for commercial/tourism use
  maxHeight: 20.5,              // metres — per iR Architecture precedent (8 storeys)
  heightPrecedent: { iRArchitecture: 8 }, // existing approvals in area (storeys)
  roadSetbackClassI: 15.24,     // 50 ft from road centre
  roadSetbackClassII: 9.75,     // 32 ft from road centre
  roadSetbackClassIII: 5.79,    // 19 ft from road centre
  sideSetback: 1.83,            // 6 ft from boundary
  rearSetback: 1.83,            // 6 ft from boundary
  eiaRequired: true,            // mandatory for hotel development at this scale
  heritageZoneProximity: false, // no UNESCO buffer zone adjacent
  parkingRatioMin: 0.25,        // spaces per key (min)
  parkingRatioMax: 0.5,         // spaces per key (max)
} as const

/** Tourism Development Act 2002 incentives — SDA approval pending */
export const TAX_INCENTIVES = {
  dutyFreeImports: false,       // TBD — SDA pending
  vatExempt: false,             // TBD — SDA pending
  capitalWriteOff: 15,          // years
  interestDeduction: 1.5,       // 150% deduction on loan interest
  equipmentTaxCredit: 0,        // pending SDA designation
} as const
