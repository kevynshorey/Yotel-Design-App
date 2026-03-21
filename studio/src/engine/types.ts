import type { AmenityProgramme } from './amenities'

// Form types
export type FormType = 'BAR' | 'BAR_NS' | 'L' | 'U' | 'C'
export type CorridorType = 'single_loaded' | 'double_loaded'
export type OutdoorPosition = 'WEST' | 'ROOFTOP' | 'BOTH'
export type VisualStyle = 'Realistic' | 'Shaded' | 'Wireframe' | 'Consistent'
export type BasemapType = 'Google' | 'Satellite' | 'Street' | 'Topo' | 'None'

// Geometry
export interface Point2D {
  x: number
  y: number
}

export interface Wing {
  id: string
  label: string
  x: number           // position from origin (m)
  y: number
  length: number      // metres
  width: number       // metres
  direction: 'EW' | 'NS'
  floors: number
}

export interface FormResult {
  form: FormType
  wings: Wing[]
  footprint: number   // m²
  westFacade: number  // m (beach-facing)
  totalFacade: number // m
  courtyard: number   // m² (U/C forms)
  boundingLength: number
  boundingWidth: number
}

// Room types
export interface RoomType {
  label: string
  nia: number          // m² net internal area
  bayWidth: number     // m module width
  bays: number
  pct: number          // target mix percentage
  color: string
}

export interface RoomAllocation {
  type: string
  count: number
  nia: number
}

// Floor programming
export type FloorUse = 'FOH_BOH' | 'YOTEL' | 'YOTELPAD' | 'ROOFTOP'

export interface Floor {
  level: number
  use: FloorUse
  rooms: RoomAllocation[]
  gia: number
}

// Validation
export type ViolationSeverity = 'fatal' | 'warning'

export interface Violation {
  rule: string
  actual: number | string
  limit: number | string
  severity: ViolationSeverity
}

export interface ValidationResult {
  isValid: boolean
  violations: Violation[]
  warnings: string[]
}

// Scoring
export interface ScoreBreakdown {
  raw: number
  weighted: number
  reason: string
}

export interface ScoringWeights {
  room_count: number
  gia_efficiency: number
  sea_views: number
  building_height: number
  outdoor_amenity: number
  cost_per_key: number
  daylight_quality: number
  pad_mix: number
  form_simplicity: number
  amenity_quality: number
}

// Cost
export interface CostEstimate {
  total: number
  perKey: number
  breakdown: {
    construction: number
    facade: number
    ffe: number
    technology: number
    outdoor: number
    land: number
    siteWorks: number
    softCosts: number
    contingency: number
  }
}

// Revenue
export interface YearlyRevenue {
  year: number
  yotelOcc: number
  padOcc: number
  yotelAdr: number
  padAdr: number
  totalRevenue: number
  gop: number
  noi: number
}

export interface RevenueProjection {
  years: YearlyRevenue[]
  stabilisedNoi: number
  stabilisedNoiPerKey: number
  gopMargin: number
  revPar: number
}

// Metrics
export interface OptionMetrics {
  totalKeys: number
  yotelKeys: number
  padUnits: number
  gia: number
  giaPerKey: number
  footprint: number
  coverage: number
  buildingHeight: number
  westFacade: number
  outdoorTotal: number
  costPerKey: number
  tdc: number
  corridorType: CorridorType
  form: FormType
  amenityScore: number
}

// Complete design option
export interface DesignOption {
  id: string
  form: FormType
  params: GenerationParams
  wings: Wing[]
  floors: Floor[]
  metrics: OptionMetrics
  cost: CostEstimate
  revenue: RevenueProjection
  amenities?: AmenityProgramme
  score: number
  scoringBreakdown: Record<string, ScoreBreakdown>
  validation: ValidationResult
}

// Generation parameters (what the user controls)
export interface GenerationParams {
  form: FormType
  targetFloorArea: number
  wingWidth: number
  storeys: number
  corridorType: CorridorType
  ytRooms: number
  padUnits: number
  outdoorPosition: OutdoorPosition
}

// Option groups
export interface OptionGroups {
  best_overall: string[]
  most_rooms: string[]
  lowest_height: string[]
  best_views: string[]
  lowest_cost: string[]
  most_outdoor: string[]
  most_efficient: string[]
  pad_heavy: string[]
}

// Camera
export interface CameraPreset {
  name: string
  group: string
  position: [number, number, number]
  target: [number, number, number]
  isOrthographic: boolean
}
