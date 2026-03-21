import type { Point2D } from '@/engine/types'

/** Original site boundary — 10 vertices from Dynamo/Revit survey export.
 *  Units: metres from Revit project base point. */
export const ORIGINAL_BOUNDARY: Point2D[] = [
  { x: 1.009, y: -0.301 },
  { x: -10.767, y: 26.325 },
  { x: 9.350, y: 34.945 },
  { x: 41.455, y: 54.551 },
  { x: 70.225, y: 57.869 },
  { x: 99.271, y: 64.064 },
  { x: 116.286, y: 65.293 },
  { x: 120.661, y: 7.772 },
  { x: 71.756, y: 5.659 },
  { x: 23.308, y: 3.414 },
]

/** Offset boundary (buildable zone) — after directional setbacks. */
export const OFFSET_BOUNDARY: Point2D[] = [
  { x: 66.161, y: 8.403 },
  { x: 35.597, y: 8.403 },
  { x: 35.597, y: 46.533 },
  { x: 42.789, y: 50.678 },
  { x: 70.873, y: 53.917 },
  { x: 85.741, y: 57.088 },
  { x: 113.901, y: 57.088 },
  { x: 115.434, y: 36.933 },
  { x: 115.434, y: 10.549 },
  { x: 71.622, y: 8.656 },
]

/** Building placement — aligns local wing (0,0) to offset boundary origin.
 *  x/y match buildableMinX/buildableMinY so wing coords map directly to world. */
export const BUILDING_PLACEMENT = { x: 35.597, y: 8.403, rotDeg: 0 } as const

/** Directional setbacks (metres). */
export const OFFSETS = { W: 55, N: 8, E: 5, S: 5 } as const

/** Computed site metrics. */
export const SITE = {
  grossArea: 5965,
  buildableArea: 3599.1,
  maxCoverage: 0.50,
  maxFootprint: 1800,
  maxHeight: 25.0,
  buildableEW: 79.84,
  buildableNS: 48.69,
  buildableMinX: 35.597,
  buildableMaxX: 115.434,
  buildableMinY: 8.403,
  buildableMaxY: 57.088,
  beachSide: 'W' as const,
  centroidX: 75.52,
  centroidY: 32.75,
} as const

/** Barbados planning regulations for Carlisle Bay */
export const PLANNING_REGS = {
  coastalSetback: 30,           // metres from High Water Mark (CZMU requirement)
  maxCoverage: 0.50,            // 50% for commercial/tourism use
  maxHeight: 25.0,              // metres — discretionary, but conservative for heritage zone proximity
  heightPrecedent: { hilton: 8, hyatt: 15 }, // existing approvals in area (storeys)
  roadSetbackClassI: 15.24,     // 50 ft from road centre
  roadSetbackClassII: 9.75,     // 32 ft from road centre
  roadSetbackClassIII: 5.79,    // 19 ft from road centre
  sideSetback: 1.83,            // 6 ft from boundary
  rearSetback: 1.83,            // 6 ft from boundary
  eiaRequired: true,            // mandatory for 130-key hotel
  heritageZoneProximity: true,  // UNESCO buffer zone adjacent
  parkingRatioMin: 0.5,         // spaces per key (urban setting)
  parkingRatioMax: 1.0,         // spaces per key (resort setting)
} as const

/** Tourism Development Act 2002 incentives */
export const TAX_INCENTIVES = {
  dutyFreeImports: true,        // construction materials, FFE
  vatExempt: true,              // construction materials
  capitalWriteOff: 15,          // years
  interestDeduction: 1.5,       // 150% deduction on loan interest
  equipmentTaxCredit: 0.30,     // 30% on plant/equipment > BDS$100k
} as const
