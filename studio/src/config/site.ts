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

/** Building placement from existing Three.js viewer. */
export const BUILDING_PLACEMENT = { x: 65, y: 9, rotDeg: 8 } as const

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
