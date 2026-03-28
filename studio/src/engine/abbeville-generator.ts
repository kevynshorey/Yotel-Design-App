/**
 * Abbeville YOTELPAD — 4 identical towers on a ground-floor podium.
 *
 * Building concept (per iR Architecture):
 * - ONE ground-floor podium with lobby, gym, retail, restaurant, pool
 * - FOUR identical residential towers sitting ON the podium
 * - Towers are the SAME SIZE — not tapering or terraced
 * - Towers are STAGGERED in position (offset from each other, not grid-aligned)
 * - Building oriented ~30° to catch SW sea views and trade winds
 *
 * This file produces hardcoded design options — not a parametric sweep.
 */

import type {
  DesignOption, GenerationParams, Wing, Floor, RoomAllocation,
  OptionMetrics, CostEstimate, RevenueProjection, ValidationResult,
  ScoreBreakdown, YearlyRevenue,
} from './types'
import type { AmenityProgramme } from './amenities'
import { ABBEVILLE_UNITS, PROGRAMME, FINANCIALS } from '@/config/abbeville/programme'
import { SITE } from '@/config/abbeville/site'

// ── Constants ────────────────────────────────────────────────────────────

const GROUND_H = PROGRAMME.groundFloorHeight  // 4.5 m
const FLOOR_H = PROGRAMME.floorToFloor        // 3.2 m

// Podium: full ground floor — lobby, gym, retail, restaurant, pool access
const PODIUM = { length: 45, width: 30 }  // ~1,350 m²

// Each tower: identical dimensions, 15 units per tower across 5 floors = 3 units/floor
const TOWER = { length: 12.5, width: 11.8 }  // ~147.5 m² per floor

// Tower positions — staggered on the podium for view corridors and cross-ventilation
// Positions are in buildable-local coordinates (x = east, y = north from buildable SW corner)
// Stagger pattern: towers offset diagonally so no tower blocks another's SW sea view
const TOWER_POSITIONS = [
  { id: 'tower-a', label: 'Tower A — 15 PAD Units', x: 3,  y: 4  },  // SW tower (closest to sea)
  { id: 'tower-b', label: 'Tower B — 15 PAD Units', x: 17, y: 2  },  // SE tower
  { id: 'tower-c', label: 'Tower C — 15 PAD Units', x: 6,  y: 17 },  // NW tower
  { id: 'tower-d', label: 'Tower D — 15 PAD Units', x: 20, y: 15 },  // NE tower
]

// Option 2.5: 3 staggered rectangular modules (20m x 10m, 2:1 ratio)
// Modules step diagonally from SW (beach) to NE (road) for unobstructed sea views
const MODULE = { length: 20, width: 10 }  // ~200 m² per floor, 2:1 ratio

const MODULE_POSITIONS = [
  { id: 'module-a', label: 'Module A — SW (Sea)', x: 2,  y: 2  },   // closest to beach
  { id: 'module-b', label: 'Module B — Center',   x: 14, y: 8  },   // offset 12m E, 6m N
  { id: 'module-c', label: 'Module C — NE (Road)', x: 26, y: 14 },  // offset again
]

// ── Helpers ──────────────────────────────────────────────────────────────

/** Build room allocations for a YOTELPAD floor with N units. */
function buildPadRoomAllocations(unitsOnFloor: number): RoomAllocation[] {
  const allocations: RoomAllocation[] = []
  for (const [type, room] of Object.entries(ABBEVILLE_UNITS)) {
    const count = Math.max(1, Math.round(unitsOnFloor * room.pct))
    allocations.push({ type, count, nia: room.nia })
  }
  const total = allocations.reduce((s, a) => s + a.count, 0)
  if (total !== unitsOnFloor) {
    const largest = allocations.reduce((a, b) => (a.count > b.count ? a : b))
    largest.count += unitsOnFloor - total
  }
  return allocations
}

/** Ground-floor podium allocations — amenity + retail, no keys. */
function buildGroundFloorAllocations(): RoomAllocation[] {
  return [
    { type: 'Lobby',      count: 1, nia: 130 },
    { type: 'Restaurant', count: 1, nia: 280 },
    { type: 'Gym',        count: 1, nia: 93  },
    { type: 'CoWorking',  count: 1, nia: 111 },
    { type: 'Retail',     count: 1, nia: 46  },
    { type: 'BOH',        count: 1, nia: 167 },
  ]
}

/**
 * Build Floor[] for the 4-tower-on-podium scheme.
 * Level 0 = podium (FOH_BOH)
 * Levels 1-N = YOTELPAD (units across all 4 towers combined)
 */
function buildFloors(upperFloors: number, unitsPerFloor: number, podiumGIA: number, towerFloorArea: number): Floor[] {
  const floors: Floor[] = []

  // Level 0: podium
  floors.push({
    level: 0,
    use: 'FOH_BOH',
    rooms: buildGroundFloorAllocations(),
    gia: podiumGIA,
  })

  // Upper levels — each level has units across all towers combined
  for (let i = 1; i <= upperFloors; i++) {
    floors.push({
      level: i,
      use: 'YOTELPAD',
      rooms: buildPadRoomAllocations(unitsPerFloor),
      gia: towerFloorArea,
    })
  }

  return floors
}

/** Build wings array — podium + 4 identical towers. */
function buildWings(towerCount: number, upperFloors: number): Wing[] {
  const wings: Wing[] = []

  // Podium wing — ground floor only
  wings.push({
    id: 'podium',
    label: 'Podium — Lobby, Gym, Retail, Restaurant',
    x: 0,
    y: 0,
    length: PODIUM.length,
    width: PODIUM.width,
    direction: 'EW' as const,
    floors: 1,
  })

  // Tower wings — identical size, staggered positions
  for (let i = 0; i < towerCount; i++) {
    const pos = TOWER_POSITIONS[i]
    wings.push({
      id: pos.id,
      label: pos.label,
      x: pos.x,
      y: pos.y,
      length: TOWER.length,
      width: TOWER.width,
      direction: 'EW' as const,
      floors: upperFloors,
    })
  }

  return wings
}

/** Cost calculation per Abbeville financial model. */
function calculateCost(podiumGFA: number, towerGFA: number, totalGFA: number, totalUnits: number): CostEstimate {
  const basePodium = podiumGFA * FINANCIALS.hardCostPerM2Podium
  const baseTower = towerGFA * FINANCIALS.hardCostPerM2Tower
  const baseConstruction = basePodium + baseTower
  const hurricaneUplift = baseConstruction * FINANCIALS.hurricaneSeismicUplift
  const islandFactors = baseConstruction * FINANCIALS.islandFactorsPct
  const construction = baseConstruction * (1 + FINANCIALS.hurricaneSeismicUplift) * (1 + FINANCIALS.islandFactorsPct)

  const ffe = totalUnits * FINANCIALS.ffePerUnit
  const mep = totalGFA * FINANCIALS.mepPerM2

  const subtotal1 = construction + ffe + mep
  const softCosts = subtotal1 * FINANCIALS.softCostPct
  const subtotal2 = subtotal1 + softCosts
  const contingency = subtotal2 * FINANCIALS.contingencyPct

  const land = FINANCIALS.land
  const total = subtotal2 + contingency + land

  return {
    total,
    perKey: total / Math.max(1, totalUnits),
    breakdown: {
      construction,
      facade: 0,
      ffe,
      technology: 0,
      mep,
      renewable: 0,
      foundation: 0,
      outdoor: 0,
      siteWorks: 0,
      land,
      softCosts,
      contingency,
      hurricaneUplift,
      islandFactors,
      eiaAndPermits: 0,
    },
  }
}

/** Revenue projection using Abbeville ADR schedule. */
function calculateRevenue(totalUnits: number): RevenueProjection {
  const blendedADR =
    0.20 * FINANCIALS.padStudioADR +
    0.33 * FINANCIALS.pad1BedADR +
    0.27 * FINANCIALS.pad2BedADR +
    0.07 * FINANCIALS.padAccessibleADR +
    0.13 * (FINANCIALS.pad1BedLSMonthly / 30)

  const occupancy = FINANCIALS.padOccupancy
  const roomRevenue = totalUnits * 365 * occupancy * blendedADR
  const otherRevenue = FINANCIALS.retailNNN + FINANCIALS.otherIncome
  const totalRevenue = roomRevenue + otherRevenue
  const gop = totalRevenue * FINANCIALS.gopMargin
  const noi = gop

  const rampFactors = [0.65, 0.80, 0.95, 1.0, 1.0]
  const years: YearlyRevenue[] = rampFactors.map((factor, i) => ({
    year: i + 1,
    yotelOcc: 0,
    padOcc: occupancy * factor,
    yotelAdr: 0,
    padAdr: blendedADR,
    totalRevenue: totalRevenue * factor,
    gop: gop * factor,
    noi: noi * factor,
  }))

  return {
    years,
    stabilisedNoi: noi,
    stabilisedNoiPerKey: noi / Math.max(1, totalUnits),
    gopMargin: FINANCIALS.gopMargin,
    revPar: occupancy * blendedADR,
  }
}

/** Minimal AmenityProgramme for Abbeville podium. */
function buildAmenities(): AmenityProgramme {
  return {
    pool: {
      waterArea: 120,
      deckArea: 180,
      totalArea: 300,
      type: 'ground',
      hasInfinityEdge: false,
      hasSwimUpBar: false,
      position: { x: 5, z: 35, width: 20, depth: 15 },
    },
    rooftopDeck: {
      totalArea: 0,
      barArea: 0,
      loungeArea: 0,
      poolArea: 0,
      loungerCount: 0,
      hasPool: false,
      hasCabanas: false,
    },
    restaurant: {
      indoorArea: 180,
      outdoorArea: 100,
      totalSeats: 80,
      type: 'all-day',
      position: { x: 18, z: 2, width: 20, depth: 14 },
    },
    totalAmenityArea: 827,
    loungerCapacity: 30,
    amenityScore: 0.7,
  }
}

/** Build scoring breakdown. */
function buildScoring(score: number): Record<string, ScoreBreakdown> {
  return {
    room_count:      { raw: score, weighted: score * 0.15, reason: 'Unit count' },
    gia_efficiency:  { raw: score, weighted: score * 0.10, reason: 'GIA efficiency' },
    sea_views:       { raw: score * 0.90, weighted: score * 0.09, reason: '4 staggered towers — view corridors between towers to SW sea' },
    building_height: { raw: score, weighted: score * 0.10, reason: 'Height compliance' },
    outdoor_amenity: { raw: score * 0.85, weighted: score * 0.085, reason: 'Pool deck + podium courtyard' },
    cost_per_key:    { raw: score, weighted: score * 0.15, reason: 'Cost per key' },
    daylight_quality:{ raw: score * 0.95, weighted: score * 0.095, reason: 'Staggered towers — excellent cross-ventilation and daylight' },
    pad_mix:         { raw: score, weighted: score * 0.10, reason: 'PAD unit mix' },
    form_simplicity: { raw: score * 0.85, weighted: score * 0.085, reason: '4 identical towers — repetitive, efficient to build' },
    amenity_quality: { raw: score * 0.85, weighted: score * 0.085, reason: 'Ground floor amenities + pool courtyard' },
  }
}

// ── Option Builders ──────────────────────────────────────────────────────

/**
 * Option A — Base Case: 4 towers × 5 floors = 60 units
 */
function buildOptionA(): DesignOption {
  const towerCount = 4
  const upperFloors = 5
  const unitsPerTowerFloor = 3
  const totalUnits = towerCount * upperFloors * unitsPerTowerFloor  // 60

  const podiumGIA = PODIUM.length * PODIUM.width                   // 1,350 m²
  const towerFloorArea = TOWER.length * TOWER.width                // 147.5 m² per tower floor
  const towerGFA = towerFloorArea * upperFloors * towerCount       // 2,950 m²
  const totalGFA = podiumGIA + towerGFA                            // 4,300 m²
  const height = GROUND_H + upperFloors * FLOOR_H                  // 4.5 + 16.0 = 20.5m
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildWings(towerCount, upperFloors)
  const unitsPerFloorAllTowers = unitsPerTowerFloor * towerCount   // 12 units combined across all towers per level
  const floors = buildFloors(upperFloors, unitsPerFloorAllTowers, podiumGIA, towerFloorArea * towerCount)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 85

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: podiumGIA,
    wingWidth: PODIUM.width,
    storeys: upperFloors + 1,
    corridorType: 'double_loaded',
    ytRooms: 0,
    padUnits: totalUnits,
    outdoorPosition: 'WEST',
  }

  const metrics: OptionMetrics = {
    totalKeys: totalUnits,
    yotelKeys: 0,
    padUnits: totalUnits,
    gia: totalGFA,
    giaPerKey: totalGFA / totalUnits,
    footprint: podiumGIA,
    coverage,
    buildingHeight: height,
    westFacade: PODIUM.length,
    outdoorTotal: PROGRAMME.poolDeck,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  return {
    id: 'abb-base-60',
    form: 'BAR',
    params,
    wings,
    floors,
    metrics,
    cost,
    revenue,
    amenities,
    score,
    scoringBreakdown: buildScoring(score),
    validation: { isValid: true, violations: [], warnings: [] },
    curatedId: 'abb-base-60',
    curatedName: 'Abbeville Base Case',
    curatedConcept: '4 identical towers on podium, 60 YOTELPAD units, staggered for SW sea views and trade wind ventilation',
  }
}

/**
 * Option B — Height Upside: 4 towers × 6 floors = 72 units (needs height variance)
 */
function buildOptionB(): DesignOption {
  const towerCount = 4
  const upperFloors = 6
  const unitsPerTowerFloor = 3
  const totalUnits = towerCount * upperFloors * unitsPerTowerFloor  // 72

  const podiumGIA = PODIUM.length * PODIUM.width
  const towerFloorArea = TOWER.length * TOWER.width
  const towerGFA = towerFloorArea * upperFloors * towerCount
  const totalGFA = podiumGIA + towerGFA
  const height = GROUND_H + upperFloors * FLOOR_H                  // 4.5 + 19.2 = 23.7m — needs variance
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildWings(towerCount, upperFloors)
  const unitsPerFloorAllTowers = unitsPerTowerFloor * towerCount
  const floors = buildFloors(upperFloors, unitsPerFloorAllTowers, podiumGIA, towerFloorArea * towerCount)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 80

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: podiumGIA,
    wingWidth: PODIUM.width,
    storeys: upperFloors + 1,
    corridorType: 'double_loaded',
    ytRooms: 0,
    padUnits: totalUnits,
    outdoorPosition: 'WEST',
  }

  const metrics: OptionMetrics = {
    totalKeys: totalUnits,
    yotelKeys: 0,
    padUnits: totalUnits,
    gia: totalGFA,
    giaPerKey: totalGFA / totalUnits,
    footprint: podiumGIA,
    coverage,
    buildingHeight: height,
    westFacade: PODIUM.length,
    outdoorTotal: PROGRAMME.poolDeck,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  return {
    id: 'abb-height-72',
    form: 'BAR',
    params,
    wings,
    floors,
    metrics,
    cost,
    revenue,
    amenities,
    score,
    scoringBreakdown: buildScoring(score),
    validation: {
      isValid: true,
      violations: [],
      warnings: [`Building height ${height.toFixed(1)}m exceeds 20.5m — requires planning height variance`],
    },
    curatedId: 'abb-height-72',
    curatedName: 'Abbeville Height Upside',
    curatedConcept: '4 identical towers on podium, 72 YOTELPAD units (6 upper floors), requires height variance approval',
  }
}

/**
 * Option C — Conservative: 3 towers × 5 floors = 45 units
 */
function buildOptionC(): DesignOption {
  const towerCount = 3
  const upperFloors = 5
  const unitsPerTowerFloor = 3
  const totalUnits = towerCount * upperFloors * unitsPerTowerFloor  // 45

  const podiumGIA = PODIUM.length * PODIUM.width
  const towerFloorArea = TOWER.length * TOWER.width
  const towerGFA = towerFloorArea * upperFloors * towerCount
  const totalGFA = podiumGIA + towerGFA
  const height = GROUND_H + upperFloors * FLOOR_H                  // 20.5m
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildWings(towerCount, upperFloors)
  const unitsPerFloorAllTowers = unitsPerTowerFloor * towerCount   // 9
  const floors = buildFloors(upperFloors, unitsPerFloorAllTowers, podiumGIA, towerFloorArea * towerCount)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  amenities.totalAmenityArea = 950
  amenities.loungerCapacity = 40
  const score = 75

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: podiumGIA,
    wingWidth: PODIUM.width,
    storeys: upperFloors + 1,
    corridorType: 'double_loaded',
    ytRooms: 0,
    padUnits: totalUnits,
    outdoorPosition: 'WEST',
  }

  const metrics: OptionMetrics = {
    totalKeys: totalUnits,
    yotelKeys: 0,
    padUnits: totalUnits,
    gia: totalGFA,
    giaPerKey: totalGFA / totalUnits,
    footprint: podiumGIA,
    coverage,
    buildingHeight: height,
    westFacade: PODIUM.length,
    outdoorTotal: PROGRAMME.poolDeck + 150,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  return {
    id: 'abb-conservative-45',
    form: 'BAR',
    params,
    wings,
    floors,
    metrics,
    cost,
    revenue,
    amenities,
    score,
    scoringBreakdown: buildScoring(score),
    validation: { isValid: true, violations: [], warnings: [] },
    curatedId: 'abb-conservative-45',
    curatedName: 'Abbeville Conservative',
    curatedConcept: '3 towers on podium, 45 YOTELPAD units, more amenity space, easier planning approval',
  }
}

/**
 * Option D — Staggered Modules (Option 2.5): 3 modules × 7 floors = 84 units
 * 3 rectangular modules (20m x 10m, 2:1 ratio) stepping diagonally toward beach.
 * Height variance required (26.9m).
 */
function buildOptionD(): DesignOption {
  const moduleCount = 3
  const upperFloors = 7
  const unitsPerModuleFloor = 4
  const totalUnits = moduleCount * upperFloors * unitsPerModuleFloor  // 84

  const podiumGIA = PODIUM.length * PODIUM.width                     // 1,350 m²
  const moduleFloorArea = MODULE.length * MODULE.width               // 200 m² per module floor
  const moduleGFA = moduleFloorArea * upperFloors * moduleCount      // 4,200 m²
  const totalGFA = podiumGIA + moduleGFA                             // 5,550 m²
  const height = GROUND_H + upperFloors * FLOOR_H                   // 4.5 + 22.4 = 26.9m
  const coverage = podiumGIA / SITE.buildableArea

  // Wings: podium + 3 staggered modules
  const wings: Wing[] = [
    {
      id: 'podium',
      label: 'Podium — Lobby, Gym, Retail, Restaurant',
      x: 0, y: 0,
      length: PODIUM.length, width: PODIUM.width,
      direction: 'EW' as const,
      floors: 1,
    },
    ...MODULE_POSITIONS.map((pos) => ({
      id: pos.id,
      label: pos.label,
      x: pos.x, y: pos.y,
      length: MODULE.length, width: MODULE.width,
      direction: 'EW' as const,
      floors: upperFloors,
    })),
  ]

  const unitsPerFloorAllModules = unitsPerModuleFloor * moduleCount  // 12
  const floors = buildFloors(upperFloors, unitsPerFloorAllModules, podiumGIA, moduleFloorArea * moduleCount)
  const cost = calculateCost(podiumGIA, moduleGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  amenities.totalAmenityArea = 900
  const score = 78

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: podiumGIA,
    wingWidth: PODIUM.width,
    storeys: upperFloors + 1,
    corridorType: 'double_loaded',
    ytRooms: 0,
    padUnits: totalUnits,
    outdoorPosition: 'WEST',
  }

  const metrics: OptionMetrics = {
    totalKeys: totalUnits,
    yotelKeys: 0,
    padUnits: totalUnits,
    gia: totalGFA,
    giaPerKey: totalGFA / totalUnits,
    footprint: podiumGIA,
    coverage,
    buildingHeight: height,
    westFacade: PODIUM.length,
    outdoorTotal: PROGRAMME.poolDeck,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  const scoring: Record<string, ScoreBreakdown> = {
    room_count:      { raw: 90, weighted: 90 * 0.15, reason: '84 units — highest density option' },
    gia_efficiency:  { raw: 80, weighted: 80 * 0.10, reason: 'Large modules efficient for unit packing' },
    sea_views:       { raw: 85, weighted: 85 * 0.10, reason: '3 staggered modules — view corridors between modules to SW sea' },
    building_height: { raw: 60, weighted: 60 * 0.10, reason: '26.9m exceeds 20.5m — requires height variance' },
    outdoor_amenity: { raw: 75, weighted: 75 * 0.085, reason: 'Pool deck + space between modules' },
    cost_per_key:    { raw: 80, weighted: 80 * 0.15, reason: 'Good cost efficiency at 84 keys' },
    daylight_quality:{ raw: 80, weighted: 80 * 0.095, reason: 'Staggered modules — good but modules are wider than towers' },
    pad_mix:         { raw: 85, weighted: 85 * 0.10, reason: 'Full PAD unit mix' },
    form_simplicity: { raw: 70, weighted: 70 * 0.085, reason: '3 large modules — more complex structure than identical towers' },
    amenity_quality: { raw: 75, weighted: 75 * 0.085, reason: 'Ground floor amenities + module courtyard spaces' },
  }

  return {
    id: 'abb-staggered-84',
    form: 'BAR',
    params,
    wings,
    floors,
    metrics,
    cost,
    revenue,
    amenities,
    score,
    scoringBreakdown: scoring,
    validation: {
      isValid: true,
      violations: [],
      warnings: [
        `Building height ${height.toFixed(1)}m exceeds 20.5m — requires planning height variance`,
        '3 large cantilevered modules increase structural complexity vs 4 smaller towers',
      ],
    },
    curatedId: 'abb-staggered-84',
    curatedName: 'Abbeville Staggered Modules',
    curatedConcept: '3 interlocking rectangular modules (2:1 ratio) stepping diagonally toward beach, 84 YOTELPAD units across 7 floors, view corridors between modules',
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Returns 4 curated Abbeville design options.
 * Options A-C: towers on podium. Option D: 3 staggered modules.
 */
export function generateAbbevilleOptions(): DesignOption[] {
  return [buildOptionA(), buildOptionB(), buildOptionC(), buildOptionD()]
}
