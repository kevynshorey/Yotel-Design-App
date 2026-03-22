// Campus layout generator for YOTEL Barbados — two-building design
// Places amenity block (south/Bay Street), residential block (north/east),
// with central pool deck between them.

import type { CampusLayout, AmenityBlock, PoolDeck, RooftopBar } from './types'
import {
  AMENITY_BLOCK,
  AMENITY_BLOCK_SPACES,
  POOL_DECK,
  ROOFTOP_BAR,
  RESIDENTIAL_PROGRAMME,
  PROGRAMME,
} from '@/config/programme'
import { SITE, PLANNING_REGS } from '@/config/site'
import { RULES } from '@/config/rules'
import { BOH, calculateBohArea } from '@/config/construction'

// ── Parameters ──────────────────────────────────────────────────────

export interface CampusParams {
  /** Amenity block footprint override (m²), default ~450 */
  amenityFootprint?: number
  /** Residential block footprint override (m²), default ~900 */
  residentialFootprint?: number
  /** Minimum gap between buildings (m), default 12 (pool + circulation) */
  minBuildingGap?: number
  /** Pool length override (m), default 18 */
  poolLength?: number
  /** Pool width override (m), default 9 */
  poolWidth?: number
  /** Number of cabanas, default 5 */
  cabanaCount?: number
  /** Number of sun loungers, default 24 */
  loungerCount?: number
}

// ── Generator ───────────────────────────────────────────────────────

export function generateCampusLayout(params: CampusParams = {}): CampusLayout {
  const SETBACK = RULES.planning.boundarySetback // 1.83m
  const SEPARATION = RULES.planning.buildingSeparation // 3.66m

  // ── Amenity Block sizing ──
  const amenityFootprint = params.amenityFootprint ?? AMENITY_BLOCK.targetFootprint
  const amenityWidth = AMENITY_BLOCK.targetWidth   // 22m E-W
  const amenityDepth = Math.round(amenityFootprint / amenityWidth) // ~20m N-S
  const amenityStoreys = AMENITY_BLOCK.storeys     // 2

  // ── Residential Block sizing ──
  const residentialFootprint = params.residentialFootprint ?? RESIDENTIAL_PROGRAMME.targetFootprint
  const residentialWidth = RESIDENTIAL_PROGRAMME.targetWidth  // 36m E-W
  const residentialDepth = Math.round(residentialFootprint / residentialWidth) // ~25m N-S
  const residentialStoreys = RESIDENTIAL_PROGRAMME.storeys    // 7

  // ── Pool dimensions ──
  const poolLength = params.poolLength ?? POOL_DECK.poolLength // 18m
  const poolWidth = params.poolWidth ?? POOL_DECK.poolWidth    // 9m
  const cabanaCount = params.cabanaCount ?? POOL_DECK.cabanaCount
  const loungerCount = params.loungerCount ?? POOL_DECK.loungerCount

  // ── Building placement ──
  // Amenity block: near south edge of buildable zone (closest to Bay Street)
  // Origin is at buildable zone (0,0) = southwest corner
  const amenityX = Math.round((SITE.buildableEW - amenityWidth) / 2) // centered E-W
  const amenityY = SETBACK // against south boundary (with setback)

  // Minimum gap between buildings: must fit pool (9m) + deck surround (4m each side) + circulation (2m each side)
  const minGap = params.minBuildingGap ?? Math.max(
    poolWidth + POOL_DECK.deckSurround * 2 + 4, // pool + surround + 2m circulation each side
    SEPARATION * 2, // at least 2x building separation
    12, // absolute minimum 12m
  )

  // Residential block: north of amenity block, separated by pool deck gap
  const residentialX = Math.round((SITE.buildableEW - residentialWidth) / 2) // centered E-W
  const residentialY = amenityY + amenityDepth + minGap

  // ── Validate placement fits within buildable zone ──
  const residentialTopEdge = residentialY + residentialDepth
  if (residentialTopEdge > SITE.buildableNS - SETBACK) {
    // If residential block exceeds north boundary, compress the gap
    const availableGap = SITE.buildableNS - SETBACK - amenityY - amenityDepth - residentialDepth
    if (availableGap < 6) {
      // Not enough room — this is a fatal constraint
      throw new Error(
        `Campus layout does not fit: need ${minGap}m gap but only ${availableGap.toFixed(1)}m available. ` +
        `Reduce building depths or footprints.`
      )
    }
    // Use whatever gap is available (minimum 6m for pool + basic circulation)
    const adjustedResidentialY = amenityY + amenityDepth + Math.max(availableGap, 6)
    // Re-check
    if (adjustedResidentialY + residentialDepth > SITE.buildableNS - SETBACK) {
      throw new Error('Campus layout exceeds buildable zone even with compressed gap.')
    }
  }

  // ── Pool Deck positioned in the gap ──
  const poolDeckY = amenityY + amenityDepth + 2 // 2m circulation from amenity block
  const poolDeckDepth = minGap - 4 // subtract 2m circulation each side
  const poolDeckWidth = Math.max(amenityWidth, residentialWidth) // span full width
  const poolDeckX = Math.min(amenityX, residentialX)

  const poolArea = poolLength * poolWidth
  const surroundArea = (poolLength + 2 * POOL_DECK.deckSurround) * (poolWidth + 2 * POOL_DECK.deckSurround) - poolArea
  const cabanaArea = cabanaCount * POOL_DECK.cabanaArea
  const loungerArea = loungerCount * POOL_DECK.loungerSpacing
  const deckSubtotal = surroundArea + cabanaArea + loungerArea
  const totalDeckArea = Math.round(deckSubtotal * (1 + POOL_DECK.landscapingPct))
  const totalPoolDeckArea = poolArea + totalDeckArea

  // ── Assemble amenity block ──
  const amenityTotalGia = AMENITY_BLOCK_SPACES.reduce((sum, s) => sum + s.area, 0)
  const amenityBlock: AmenityBlock = {
    footprint: amenityWidth * amenityDepth,
    storeys: amenityStoreys,
    totalGia: amenityTotalGia,
    spaces: AMENITY_BLOCK_SPACES,
    position: { x: amenityX, y: amenityY },
    width: amenityWidth,
    depth: amenityDepth,
  }

  // ── Assemble pool deck ──
  const poolDeck: PoolDeck = {
    poolLength,
    poolWidth,
    poolArea,
    deckArea: totalDeckArea,
    totalArea: totalPoolDeckArea,
    cabanaCount,
    loungerCount,
    hasSwimUpBar: true,
    hasInfinityEdge: true,
    position: { x: poolDeckX, y: poolDeckY },
    width: poolDeckWidth,
    depth: poolDeckDepth,
  }

  // ── Assemble rooftop bar ──
  const rooftopBar: RooftopBar = {
    totalArea: ROOFTOP_BAR.totalArea,
    barArea: ROOFTOP_BAR.barArea,
    loungeArea: ROOFTOP_BAR.loungeArea,
    plungePoolCount: ROOFTOP_BAR.plungePoolCount,
    plungePoolArea: ROOFTOP_BAR.plungePoolArea,
    djBoothArea: ROOFTOP_BAR.djBoothArea,
    capacity: ROOFTOP_BAR.capacity,
    has270Views: ROOFTOP_BAR.has270Views,
  }

  // ── Assemble residential block ──
  const bohData = calculateBohArea()
  const residentialGia =
    bohData.total + // ground floor BOH
    RESIDENTIAL_PROGRAMME.yotelFloors.length * RESIDENTIAL_PROGRAMME.roomsPerYotelFloor * 25 + // YOTEL floors (approx 25m²/key GIA)
    RESIDENTIAL_PROGRAMME.yotelpadFloors.length * RESIDENTIAL_PROGRAMME.unitsPerPadFloor * 35 + // PAD floors (approx 35m²/unit GIA)
    ROOFTOP_BAR.totalArea // rooftop

  const residentialBlock = {
    footprint: residentialWidth * residentialDepth,
    storeys: residentialStoreys,
    totalGia: Math.round(residentialGia),
    groundFloorUse: 'BOH' as const,
    yotelFloors: RESIDENTIAL_PROGRAMME.yotelFloors,
    yotelpadFloors: RESIDENTIAL_PROGRAMME.yotelpadFloors,
    rooftopBar,
    position: { x: residentialX, y: residentialY },
    width: residentialWidth,
    depth: residentialDepth,
  }

  // ── Combined metrics ──
  const totalFootprint = amenityBlock.footprint + residentialBlock.footprint
  const totalGia = amenityBlock.totalGia + residentialBlock.totalGia
  const siteCoverage = totalFootprint / SITE.buildableArea

  // ── Validate site coverage ──
  if (siteCoverage > SITE.maxCoverage) {
    throw new Error(
      `Site coverage ${(siteCoverage * 100).toFixed(1)}% exceeds maximum ${SITE.maxCoverage * 100}%. ` +
      `Total footprint: ${totalFootprint}m² on ${SITE.buildableArea}m² buildable.`
    )
  }

  // ── Validate building height ──
  const residentialHeight =
    RESIDENTIAL_PROGRAMME.groundFloorHeight +
    (residentialStoreys - 2) * RESIDENTIAL_PROGRAMME.floorToFloor + // -2 for ground and rooftop
    3.5 // rooftop bar structure height
  if (residentialHeight > SITE.maxHeight) {
    throw new Error(
      `Residential block height ${residentialHeight.toFixed(1)}m exceeds maximum ${SITE.maxHeight}m.`
    )
  }

  // ── Validate setbacks ──
  const blocks = [
    { name: 'Amenity', x: amenityX, y: amenityY, w: amenityWidth, d: amenityDepth },
    { name: 'Residential', x: residentialX, y: residentialY, w: residentialWidth, d: residentialDepth },
  ]
  for (const block of blocks) {
    if (block.x < SETBACK) {
      throw new Error(`${block.name} block west edge (${block.x}m) violates ${SETBACK}m boundary setback.`)
    }
    if (block.y < SETBACK) {
      throw new Error(`${block.name} block south edge (${block.y}m) violates ${SETBACK}m boundary setback.`)
    }
    if (block.x + block.w > SITE.buildableEW - SETBACK) {
      throw new Error(`${block.name} block east edge (${(block.x + block.w).toFixed(1)}m) violates ${SETBACK}m boundary setback.`)
    }
    if (block.y + block.d > SITE.buildableNS - SETBACK) {
      throw new Error(`${block.name} block north edge (${(block.y + block.d).toFixed(1)}m) violates ${SETBACK}m boundary setback.`)
    }
  }

  return {
    amenityBlock,
    residentialBlock,
    poolDeck,
    buildingGap: minGap,
    totalSiteGia: Math.round(totalGia),
    totalFootprint: Math.round(totalFootprint),
    siteCoverage: Math.round(siteCoverage * 1000) / 1000,
  }
}
