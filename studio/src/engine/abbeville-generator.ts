/**
 * Abbeville YOTELPAD — Hardcoded design options generator.
 *
 * Returns 3 curated design options for the Abbeville site in Worthing,
 * Christ Church, Barbados. These are architect-decided layouts:
 * staggered towers on a podium with 45-72 PAD units.
 *
 * Unlike the parametric sweep in generator.ts, this file produces
 * fixed options that can be consumed directly as DesignOption[].
 */

import type {
  DesignOption, GenerationParams, Wing, Floor, RoomAllocation,
  OptionMetrics, CostEstimate, RevenueProjection, ValidationResult,
  ScoreBreakdown, YearlyRevenue,
} from './types'
import type { AmenityProgramme } from './amenities'
import { ABBEVILLE_UNITS, PROGRAMME, FINANCIALS } from '@/config/abbeville/programme'
import { SITE } from '@/config/abbeville/site'

// ── Helpers ────────────────────────────────────────────────────────────

/** Build room allocations for a single YOTELPAD floor with N units. */
function buildPadRoomAllocations(unitsOnFloor: number): RoomAllocation[] {
  const allocations: RoomAllocation[] = []
  for (const [type, room] of Object.entries(ABBEVILLE_UNITS)) {
    const count = Math.max(1, Math.round(unitsOnFloor * room.pct))
    allocations.push({ type, count, nia: room.nia })
  }
  // Adjust to hit exact unit count — trim or add from largest bucket
  const total = allocations.reduce((s, a) => s + a.count, 0)
  if (total !== unitsOnFloor) {
    const largest = allocations.reduce((a, b) => (a.count > b.count ? a : b))
    largest.count += unitsOnFloor - total
  }
  return allocations
}

/** Build ground-floor (podium) room allocations — amenity + retail, no keys. */
function buildGroundFloorAllocations(): RoomAllocation[] {
  return [
    { type: 'Lobby', count: 1, nia: 80 },
    { type: 'Retail', count: 2, nia: 60 },
    { type: 'BOH', count: 1, nia: 100 },
    { type: 'FitnessCenter', count: 1, nia: 50 },
  ]
}

/** Construct Floor[] for a given tower configuration. */
function buildFloors(
  numTowers: number,
  floorsPerTower: number,
  unitsPerFloor: number,
  podiumGIA: number,
  towerFootprint: number,
): Floor[] {
  const floors: Floor[] = []

  // Level 0: podium / ground floor
  floors.push({
    level: 0,
    use: 'FOH_BOH',
    rooms: buildGroundFloorAllocations(),
    gia: podiumGIA,
  })

  // Upper levels: YOTELPAD
  for (let level = 1; level <= floorsPerTower; level++) {
    const totalUnitsThisLevel = numTowers * unitsPerFloor
    floors.push({
      level,
      use: 'YOTELPAD',
      rooms: buildPadRoomAllocations(totalUnitsThisLevel),
      gia: numTowers * towerFootprint,
    })
  }

  return floors
}

/** Cost calculation per the Abbeville financial model. */
function calculateCost(
  podiumGFA: number,
  towerGFA: number,
  totalGFA: number,
  totalUnits: number,
): CostEstimate {
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
  // Blended ADR across unit types (weighted by programme mix %)
  // PadStudio 20% @ $220, Pad1Bed 33% @ $295, Pad2Bed 27% @ $380,
  // PadAccessible 7% @ $220, Pad1BedLS 13% @ $6500/30 (daily equivalent)
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

  // Build 5-year projection with ramp-up
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

  const revPar = occupancy * blendedADR

  return {
    years,
    stabilisedNoi: noi,
    stabilisedNoiPerKey: noi / Math.max(1, totalUnits),
    gopMargin: FINANCIALS.gopMargin,
    revPar,
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
      position: { x: 20, z: 40, width: 15, depth: 20 },
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
      indoorArea: 60,
      outdoorArea: 40,
      totalSeats: 40,
      type: 'all-day',
      position: { x: 5, z: 10, width: 10, depth: 10 },
    },
    totalAmenityArea: 400,
    loungerCapacity: 30,
    amenityScore: 0.6,
  }
}

/** Build a scoring breakdown record. */
function buildScoring(score: number): Record<string, ScoreBreakdown> {
  return {
    room_count:      { raw: score, weighted: score * 0.15, reason: 'Unit count' },
    gia_efficiency:  { raw: score, weighted: score * 0.10, reason: 'GIA efficiency' },
    sea_views:       { raw: score * 0.7, weighted: score * 0.07, reason: 'Limited sea views (inland)' },
    building_height: { raw: score, weighted: score * 0.10, reason: 'Height compliance' },
    outdoor_amenity: { raw: score * 0.8, weighted: score * 0.08, reason: 'Pool deck + podium amenity' },
    cost_per_key:    { raw: score, weighted: score * 0.15, reason: 'Cost per key' },
    daylight_quality:{ raw: score * 0.9, weighted: score * 0.09, reason: 'Staggered towers — good daylight' },
    pad_mix:         { raw: score, weighted: score * 0.10, reason: 'PAD unit mix' },
    form_simplicity: { raw: score, weighted: score * 0.10, reason: 'Rectangular tower form' },
    amenity_quality: { raw: score * 0.8, weighted: score * 0.06, reason: 'Ground floor amenities' },
  }
}

// ── Tower geometry constants ───────────────────────────────────────────

const TOWER_LENGTH = 12.5   // m (E-W)
const TOWER_WIDTH = 11.8    // m (N-S)
const TOWER_FOOTPRINT = TOWER_LENGTH * TOWER_WIDTH // 147.5 m²

// ── Option builders ────────────────────────────────────────────────────

function buildOptionA(): DesignOption {
  const numTowers = 4
  const floorsPerTower = 5
  const unitsPerFloor = 3
  const totalUnits = numTowers * floorsPerTower * unitsPerFloor // 60
  const podiumGIA = PROGRAMME.podiumGIA // 786
  const towerGFA = numTowers * floorsPerTower * TOWER_FOOTPRINT // 2950
  const totalGFA = podiumGIA + towerGFA // 3736
  const height = PROGRAMME.groundFloorHeight + floorsPerTower * PROGRAMME.floorToFloor // 20.5
  const coverage = podiumGIA / SITE.buildableArea // 786 / 3036 ≈ 0.259

  const wings: Wing[] = Array.from({ length: numTowers }, (_, i) => ({
    id: `tower-${i + 1}`,
    label: `Tower ${i + 1}`,
    x: 5 + i * 13,
    y: 12,
    length: TOWER_LENGTH,
    width: TOWER_WIDTH,
    direction: 'EW' as const,
    floors: floorsPerTower,
  }))

  const floors = buildFloors(numTowers, floorsPerTower, unitsPerFloor, podiumGIA, TOWER_FOOTPRINT)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 85

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: TOWER_FOOTPRINT,
    wingWidth: TOWER_WIDTH,
    storeys: floorsPerTower + 1, // includes ground
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
    westFacade: numTowers * TOWER_LENGTH,
    outdoorTotal: PROGRAMME.poolDeck,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  const validation: ValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
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
    validation,
    curatedId: 'abb-base-60',
    curatedName: 'Abbeville Base Case',
    curatedConcept: '4-tower staggered podium, 60 YOTELPAD units, ground floor amenities + retail',
  }
}

function buildOptionB(): DesignOption {
  const numTowers = 4
  const floorsPerTower = 6
  const unitsPerFloor = 3
  const totalUnits = numTowers * floorsPerTower * unitsPerFloor // 72
  const podiumGIA = PROGRAMME.podiumGIA
  const towerGFA = numTowers * floorsPerTower * TOWER_FOOTPRINT // 3540
  const totalGFA = podiumGIA + towerGFA // 4326
  const height = PROGRAMME.groundFloorHeight + floorsPerTower * PROGRAMME.floorToFloor // 23.7
  const coverage = podiumGIA / SITE.buildableArea

  const wings: Wing[] = Array.from({ length: numTowers }, (_, i) => ({
    id: `tower-${i + 1}`,
    label: `Tower ${i + 1}`,
    x: 5 + i * 13,
    y: 12,
    length: TOWER_LENGTH,
    width: TOWER_WIDTH,
    direction: 'EW' as const,
    floors: floorsPerTower,
  }))

  const floors = buildFloors(numTowers, floorsPerTower, unitsPerFloor, podiumGIA, TOWER_FOOTPRINT)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 80

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: TOWER_FOOTPRINT,
    wingWidth: TOWER_WIDTH,
    storeys: floorsPerTower + 1,
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
    westFacade: numTowers * TOWER_LENGTH,
    outdoorTotal: PROGRAMME.poolDeck,
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  const validation: ValidationResult = {
    isValid: true,
    violations: [],
    warnings: [
      `Building height ${height}m exceeds 20.5m site maximum — requires planning height variance`,
    ],
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
    validation,
    curatedId: 'abb-height-72',
    curatedName: 'Abbeville Height Upside',
    curatedConcept: '4-tower staggered podium, 72 YOTELPAD units, +1 floor per tower (height variance required)',
  }
}

function buildOptionC(): DesignOption {
  const numTowers = 3
  const floorsPerTower = 5
  const unitsPerFloor = 3
  const totalUnits = numTowers * floorsPerTower * unitsPerFloor // 45
  const podiumGIA = PROGRAMME.podiumGIA
  const towerGFA = numTowers * floorsPerTower * TOWER_FOOTPRINT // 2212.5
  const totalGFA = podiumGIA + towerGFA // 2998.5
  const height = PROGRAMME.groundFloorHeight + floorsPerTower * PROGRAMME.floorToFloor // 20.5
  const coverage = podiumGIA / SITE.buildableArea

  const wings: Wing[] = Array.from({ length: numTowers }, (_, i) => ({
    id: `tower-${i + 1}`,
    label: `Tower ${i + 1}`,
    x: 5 + i * 17,
    y: 12,
    length: TOWER_LENGTH,
    width: TOWER_WIDTH,
    direction: 'EW' as const,
    floors: floorsPerTower,
  }))

  const floors = buildFloors(numTowers, floorsPerTower, unitsPerFloor, podiumGIA, TOWER_FOOTPRINT)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  amenities.totalAmenityArea = 500 // more podium amenity space with 3 towers
  amenities.loungerCapacity = 40
  const score = 75

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: TOWER_FOOTPRINT,
    wingWidth: TOWER_WIDTH,
    storeys: floorsPerTower + 1,
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
    westFacade: numTowers * TOWER_LENGTH,
    outdoorTotal: PROGRAMME.poolDeck + 100, // extra amenity deck from freed tower footprint
    costPerKey: cost.perKey,
    tdc: cost.total,
    corridorType: 'double_loaded',
    form: 'BAR',
    amenityScore: amenities.amenityScore,
  }

  const validation: ValidationResult = {
    isValid: true,
    violations: [],
    warnings: [],
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
    validation,
    curatedId: 'abb-conservative-45',
    curatedName: 'Abbeville Conservative',
    curatedConcept: '3-tower staggered podium, 45 YOTELPAD units, expanded ground floor amenities + retail',
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Returns 3 curated, hardcoded Abbeville design options.
 * These are architect-decided layouts — not a parametric sweep.
 */
export function generateAbbevilleOptions(): DesignOption[] {
  return [buildOptionA(), buildOptionB(), buildOptionC()]
}
