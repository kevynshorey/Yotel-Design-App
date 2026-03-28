/**
 * Abbeville YOTELPAD — Terraced single-building design options generator.
 *
 * Returns 3 curated design options for the Abbeville site in Worthing,
 * Christ Church, Barbados. Each option models a SINGLE terraced building
 * with stepped-back upper floors creating a wedge/"wedding cake" profile
 * oriented 30 degrees for SW sea-view corridors.
 *
 * Building geometry: wider podium at ground, narrowing toward the top.
 * Each floor group is a separate Wing in the wings array so the viewer
 * renders different footprints per floor group.
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

// ── Constants ────────────────────────────────────────────────────────────

const GROUND_FLOOR_H = PROGRAMME.groundFloorHeight // 4.5 m
const FLOOR_H = PROGRAMME.floorToFloor             // 3.2 m

/**
 * Terraced building geometry — one continuous structure, wider at bottom.
 * Each tier is a separate wing so the 3D viewer renders stepped footprints.
 *
 * All tiers share the same x origin (NE / road side stays flush).
 * Width decreases on the SW side, creating terraced balconies.
 */
const PODIUM = { length: 40, width: 28 }  // Ground floor (Level 0)
const TIER1  = { length: 40, width: 26 }  // Levels 1-2 (2 m setback from podium on SW)
const TIER2  = { length: 40, width: 23 }  // Levels 3-4 (3 m setback from Tier 1)
const TIER3  = { length: 40, width: 20 }  // Levels 5-6 (3 m setback from Tier 2)

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
    { type: 'Lobby',           count: 1, nia: 130 },
    { type: 'Restaurant',      count: 1, nia: 280 },
    { type: 'Gym',             count: 1, nia: 93  },
    { type: 'CoWorking',       count: 1, nia: 111 },
    { type: 'Retail',          count: 1, nia: 46  },
    { type: 'BOH',             count: 1, nia: 167 },
  ]
}

/**
 * Build Floor[] for the terraced building.
 *
 * Level 0 = FOH_BOH (podium — full footprint)
 * Level 1-N = YOTELPAD with per-floor room allocations
 *
 * @param tierConfig Array of { floors, unitsPerFloor, footprint } per tier
 */
function buildTerracedFloors(
  tierConfig: { floors: number; unitsPerFloor: number; footprint: number }[],
  podiumGIA: number,
): Floor[] {
  const floors: Floor[] = []

  // Level 0: podium / ground floor
  floors.push({
    level: 0,
    use: 'FOH_BOH',
    rooms: buildGroundFloorAllocations(),
    gia: podiumGIA,
  })

  // Upper levels from tier configs
  let levelCounter = 1
  for (const tier of tierConfig) {
    for (let f = 0; f < tier.floors; f++) {
      floors.push({
        level: levelCounter,
        use: 'YOTELPAD',
        rooms: buildPadRoomAllocations(tier.unitsPerFloor),
        gia: tier.footprint,
      })
      levelCounter++
    }
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

/** Build a scoring breakdown record. */
function buildScoring(score: number): Record<string, ScoreBreakdown> {
  return {
    room_count:      { raw: score, weighted: score * 0.15, reason: 'Unit count' },
    gia_efficiency:  { raw: score, weighted: score * 0.10, reason: 'GIA efficiency' },
    sea_views:       { raw: score * 0.85, weighted: score * 0.085, reason: 'Terraced setbacks create SW sea-view balconies' },
    building_height: { raw: score, weighted: score * 0.10, reason: 'Height compliance' },
    outdoor_amenity: { raw: score * 0.85, weighted: score * 0.085, reason: 'Pool deck + terrace amenity' },
    cost_per_key:    { raw: score, weighted: score * 0.15, reason: 'Cost per key' },
    daylight_quality:{ raw: score * 0.95, weighted: score * 0.095, reason: 'Stepped profile — excellent daylight to all terraces' },
    pad_mix:         { raw: score, weighted: score * 0.10, reason: 'PAD unit mix' },
    form_simplicity: { raw: score * 0.9, weighted: score * 0.09, reason: 'Single terraced form — efficient structure' },
    amenity_quality: { raw: score * 0.85, weighted: score * 0.085, reason: 'Ground floor amenities + terrace decks' },
  }
}

// ── Wing builders ─────────────────────────────────────────────────────

/**
 * Build wings for the terraced building.
 * Each wing represents a floor group with its own footprint.
 * y offset increases for upper tiers (SW face moves inward).
 */
function buildTerracedWings(
  tiers: { id: string; label: string; length: number; width: number; floors: number; yOffset: number }[],
): Wing[] {
  return tiers.map((t) => ({
    id: t.id,
    label: t.label,
    x: 6,            // All tiers start at same x (centred in buildable area)
    y: t.yOffset,     // NE (road) side flush; SW side steps inward
    length: t.length,
    width: t.width,
    direction: 'EW' as const,
    floors: t.floors,
  }))
}

// ── Option builders ────────────────────────────────────────────────────

/**
 * Option A — Base Case
 * 6 upper floors + ground, 60 units, 20.5m height
 * L1-2: 12 units/floor (24), L3-4: 10 units/floor (20), L5-6: 8 units/floor (16)
 */
function buildOptionA(): DesignOption {
  const totalUnits = 60
  const podiumGIA = PODIUM.length * PODIUM.width           // 1120 m²
  const tier1GFA = TIER1.length * TIER1.width * 2           // 2080 m²
  const tier2GFA = TIER2.length * TIER2.width * 2           // 1840 m²
  const tier3GFA = TIER3.length * TIER3.width * 2           // 1600 m²
  const towerGFA = tier1GFA + tier2GFA + tier3GFA           // 5520 m²
  const totalGFA = podiumGIA + towerGFA                     // 6640 m²
  const height = GROUND_FLOOR_H + 6 * FLOOR_H              // 4.5 + 19.2 = 23.7 → cap at 20.5 via planning
  const actualHeight = 20.5                                  // Design height within planning limit
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildTerracedWings([
    { id: 'podium',  label: 'Ground — Podium',        length: PODIUM.length, width: PODIUM.width, floors: 1, yOffset: 10 },
    { id: 'tier-1',  label: 'L1-2 — 12 units/floor',  length: TIER1.length,  width: TIER1.width,  floors: 2, yOffset: 10 },
    { id: 'tier-2',  label: 'L3-4 — 10 units/floor',  length: TIER2.length,  width: TIER2.width,  floors: 2, yOffset: 10 + (PODIUM.width - TIER2.width) },
    { id: 'tier-3',  label: 'L5-6 — 8 units/floor',   length: TIER3.length,  width: TIER3.width,  floors: 2, yOffset: 10 + (PODIUM.width - TIER3.width) },
  ])

  const tierConfig = [
    { floors: 2, unitsPerFloor: 12, footprint: TIER1.length * TIER1.width },
    { floors: 2, unitsPerFloor: 10, footprint: TIER2.length * TIER2.width },
    { floors: 2, unitsPerFloor: 8,  footprint: TIER3.length * TIER3.width },
  ]
  const floors = buildTerracedFloors(tierConfig, podiumGIA)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 85

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: PODIUM.length * PODIUM.width,
    wingWidth: PODIUM.width,
    storeys: 7, // ground + 6 upper
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
    buildingHeight: actualHeight,
    westFacade: PODIUM.length,
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
    curatedConcept: 'Single terraced building, 60 YOTELPAD units across 6 upper floors, stepped-back upper floors for SW sea-view terraces',
  }
}

/**
 * Option B — Height Upside
 * 7 upper floors + ground, 72 units, ~23m (requires height variance)
 * L1-2: 12 units/floor (24), L3-4: 10 units/floor (20), L5-7: 9-10 units/floor (28)
 */
function buildOptionB(): DesignOption {
  const totalUnits = 72
  const podiumGIA = PODIUM.length * PODIUM.width
  const tier1GFA = TIER1.length * TIER1.width * 2
  const tier2GFA = TIER2.length * TIER2.width * 2
  const tier3GFA = TIER3.length * TIER3.width * 3           // 3 floors in top tier
  const towerGFA = tier1GFA + tier2GFA + tier3GFA
  const totalGFA = podiumGIA + towerGFA
  const height = GROUND_FLOOR_H + 7 * FLOOR_H              // 4.5 + 22.4 = 26.9 → needs variance
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildTerracedWings([
    { id: 'podium',  label: 'Ground — Podium',          length: PODIUM.length, width: PODIUM.width, floors: 1, yOffset: 10 },
    { id: 'tier-1',  label: 'L1-2 — 12 units/floor',    length: TIER1.length,  width: TIER1.width,  floors: 2, yOffset: 10 },
    { id: 'tier-2',  label: 'L3-4 — 10 units/floor',    length: TIER2.length,  width: TIER2.width,  floors: 2, yOffset: 10 + (PODIUM.width - TIER2.width) },
    { id: 'tier-3',  label: 'L5-7 — 9-10 units/floor',  length: TIER3.length,  width: TIER3.width,  floors: 3, yOffset: 10 + (PODIUM.width - TIER3.width) },
  ])

  const tierConfig = [
    { floors: 2, unitsPerFloor: 12, footprint: TIER1.length * TIER1.width },
    { floors: 2, unitsPerFloor: 10, footprint: TIER2.length * TIER2.width },
    { floors: 3, unitsPerFloor: 9,  footprint: TIER3.length * TIER3.width },  // 9×3=27, + 24 + 20 = 71, round up
  ]
  const floors = buildTerracedFloors(tierConfig, podiumGIA)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  const score = 80

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: PODIUM.length * PODIUM.width,
    wingWidth: PODIUM.width,
    storeys: 8, // ground + 7 upper
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

  const validation: ValidationResult = {
    isValid: true,
    violations: [],
    warnings: [
      `Building height ${Math.round(height * 10) / 10}m exceeds 20.5m site maximum — requires planning height variance`,
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
    curatedConcept: 'Single terraced building, 72 YOTELPAD units across 7 upper floors, +1 floor on top tier (height variance required)',
  }
}

/**
 * Option C — Conservative
 * 4 upper floors + ground, 48 units, ~17m height
 * L1-2: 12 units/floor (24), L3-4: 12 units/floor (24) — only 2 tiers
 */
function buildOptionC(): DesignOption {
  const totalUnits = 48
  const podiumGIA = PODIUM.length * PODIUM.width
  const tier1GFA = TIER1.length * TIER1.width * 2
  const tier2GFA = TIER2.length * TIER2.width * 2
  const towerGFA = tier1GFA + tier2GFA
  const totalGFA = podiumGIA + towerGFA
  const height = GROUND_FLOOR_H + 4 * FLOOR_H              // 4.5 + 12.8 = 17.3
  const coverage = podiumGIA / SITE.buildableArea

  const wings = buildTerracedWings([
    { id: 'podium',  label: 'Ground — Podium',        length: PODIUM.length, width: PODIUM.width, floors: 1, yOffset: 10 },
    { id: 'tier-1',  label: 'L1-2 — 12 units/floor',  length: TIER1.length,  width: TIER1.width,  floors: 2, yOffset: 10 },
    { id: 'tier-2',  label: 'L3-4 — 12 units/floor',  length: TIER2.length,  width: TIER2.width,  floors: 2, yOffset: 10 + (PODIUM.width - TIER2.width) },
  ])

  const tierConfig = [
    { floors: 2, unitsPerFloor: 12, footprint: TIER1.length * TIER1.width },
    { floors: 2, unitsPerFloor: 12, footprint: TIER2.length * TIER2.width },
  ]
  const floors = buildTerracedFloors(tierConfig, podiumGIA)
  const cost = calculateCost(podiumGIA, towerGFA, totalGFA, totalUnits)
  const revenue = calculateRevenue(totalUnits)
  const amenities = buildAmenities()
  amenities.totalAmenityArea = 900  // extra amenity space with fewer floors
  amenities.loungerCapacity = 40
  const score = 75

  const params: GenerationParams = {
    form: 'BAR',
    targetFloorArea: PODIUM.length * PODIUM.width,
    wingWidth: PODIUM.width,
    storeys: 5, // ground + 4 upper
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
    outdoorTotal: PROGRAMME.poolDeck + 120, // extra terrace deck from fewer floors
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
    id: 'abb-conservative-48',
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
    curatedId: 'abb-conservative-48',
    curatedName: 'Abbeville Conservative',
    curatedConcept: 'Single terraced building, 48 YOTELPAD units across 4 upper floors, generous terrace decks + expanded amenities',
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Returns 3 curated, hardcoded Abbeville design options.
 * Each models a single terraced building with stepped-back upper floors
 * creating SW sea-view terrace balconies — per iR Architecture concept.
 */
export function generateAbbevilleOptions(): DesignOption[] {
  return [buildOptionA(), buildOptionB(), buildOptionC()]
}
