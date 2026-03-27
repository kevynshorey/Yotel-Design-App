import type { AmenityProgramme } from './amenities'

// Form types
export type FormType = 'BAR' | 'BAR_NS' | 'L' | 'U' | 'C'
export type CorridorType = 'single_loaded' | 'double_loaded'
export type OutdoorPosition = 'WEST' | 'ROOFTOP' | 'BOTH'
export type VisualStyle = 'Realistic' | 'Shaded' | 'Wireframe' | 'Consistent'
export type BasemapType =
  | 'Google'
  | 'Satellite'
  | 'Street'
  | 'Topo'
  | 'ESRI Street'
  | 'OSM Standard'
  | 'OSM HOT'
  | 'OpenTopo'
  | 'Carto Voyager'
  | 'Wikimedia OSM'
  | 'Copernicus'
  | 'Mapbox Streets'
  | 'Mapbox Satellite'
  | 'Mapbox Outdoors'
  | 'MapTiler Streets'
  | 'MapTiler Outdoor'
  | 'MapTiler Satellite'
  | 'None'

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
    mep: number
    renewable: number
    foundation: number
    outdoor: number
    siteWorks: number
    land: number
    softCosts: number
    contingency: number
    hurricaneUplift: number
    islandFactors: number
    eiaAndPermits: number
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
  curatedId?: string
  curatedName?: string
  curatedConcept?: string
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

// ── Campus Layout (two-building design) ──

export interface AmenitySpace {
  name: string
  area: number          // m²
  floor: number         // 0 = ground, 1 = upper
  category: 'lobby' | 'food_beverage' | 'fitness' | 'business' | 'creative' | 'coworking' | 'entertainment' | 'retail'
}

export interface AmenityBlock {
  footprint: number     // m² ground floor footprint
  storeys: number       // typically 2
  totalGia: number      // m² gross internal area
  spaces: AmenitySpace[]
  position: { x: number; y: number }  // placement in site coords
  width: number         // m (E-W dimension)
  depth: number         // m (N-S dimension)
}

export interface PoolDeck {
  poolLength: number    // m
  poolWidth: number     // m
  poolArea: number      // m² water surface
  deckArea: number      // m² total deck (excluding pool)
  totalArea: number     // m² pool + deck + landscaping
  cabanaCount: number
  loungerCount: number
  hasSwimUpBar: boolean
  hasInfinityEdge: boolean
  position: { x: number; y: number }
  width: number         // m (E-W)
  depth: number         // m (N-S)
}

export interface RooftopBar {
  totalArea: number     // m²
  barArea: number       // m²
  loungeArea: number    // m²
  plungePoolCount: number
  plungePoolArea: number // m² each
  djBoothArea: number   // m²
  capacity: number      // persons
  has270Views: boolean
}

export interface CampusLayout {
  amenityBlock: AmenityBlock
  residentialBlock: {
    footprint: number
    storeys: number
    totalGia: number
    groundFloorUse: 'BOH'
    yotelFloors: readonly number[]     // e.g. [1, 2, 3]
    yotelpadFloors: readonly number[]  // e.g. [4, 5]
    rooftopBar: RooftopBar
    position: { x: number; y: number }
    width: number
    depth: number
  }
  poolDeck: PoolDeck
  buildingGap: number         // m between the two buildings
  totalSiteGia: number        // m² combined GIA
  totalFootprint: number      // m² combined ground coverage
  siteCoverage: number        // ratio (0-1)
}

// Camera
export interface CameraPreset {
  name: string
  group: string
  position: [number, number, number]
  target: [number, number, number]
  isOrthographic: boolean
}
