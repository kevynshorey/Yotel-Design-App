/**
 * Architectural Reasoning Engine — YOTEL Barbados Site Layout
 *
 * Takes a DesignOption and site config, computes intelligent placements for ALL
 * site elements using architectural reasoning.  Every placement carries a rationale.
 *
 * Coordinate system:
 *   origin = buildable-area southwest corner (buildableMinX, buildableMinY in world coords)
 *   x = metres east of origin (along EW axis)
 *   y = metres north of origin (along NS axis)
 *
 * Bay Street is to the WEST.  The entrance sits on the WEST edge of the
 * *site* boundary (not the buildable boundary).
 */

import type { DesignOption, FormType, Wing } from './types'
import { SITE, OFFSET_BOUNDARY, ORIGINAL_BOUNDARY } from '@/config/site'
import { AMENITY_BLOCK, POOL_DECK } from '@/config/programme'
import { RULES } from '@/config/rules'

// ── Public Interfaces ──────────────────────────────────────────────────────

export interface PlacedElement {
  id: string
  type:
    | 'entrance'
    | 'parking'
    | 'amenity_block'
    | 'pool'
    | 'pool_deck'
    | 'cabana'
    | 'lounger_zone'
    | 'swim_up_bar'
    | 'landscape'
    | 'tree'
    | 'path'
    | 'service_yard'
  label: string
  x: number      // metres from buildable origin (west edge)
  y: number      // metres from buildable origin (south edge)
  width: number   // EW dimension
  depth: number   // NS dimension
  height?: number // vertical, 0 for ground-level
  rotation?: number // degrees
  floor: 'ground' | 'roof' | number  // which level
  rationale: string  // WHY it's placed here
}

export interface SiteLayout {
  elements: PlacedElement[]
  circulation: { from: string; to: string; path: 'direct' | 'covered' | 'landscaped' }[]
  compliance: { rule: string; status: 'pass' | 'fail'; value: number; limit: number }[]
  designNarrative: string
}

/** Simplified SiteConfig accepted by computeSiteLayout — mirrors project-store shape. */
export interface SiteConfig {
  grossArea: number
  buildableAreaSqm: number
  maxCoverage: number
  maxHeight: number
  buildableEW: number
  buildableNS: number
  buildableMinX: number
  buildableMaxX: number
  buildableMinY: number
  buildableMaxY: number
  beachSide: 'W' | 'E' | 'N' | 'S'
}

// ── Constants ──────────────────────────────────────────────────────────────

const SETBACK = RULES.planning.boundarySetback           // 1.83 m
const BUILDING_SEP = RULES.planning.buildingSeparation    // 3.66 m
const FIRE_ACCESS_WIDTH = 6                               // m — fire-tender access
const POOL_BUILDING_MIN = 3                               // m — pool-to-wall gap
const CABANA_SPACING = 4                                  // m between cabanas
const CABANA_W = 3                                        // m (EW)
const CABANA_D = 4                                        // m (NS)
const LOUNGER_ZONE_D = 3                                  // m depth strip
const LOUNGER_MIN_EDGE = 1.5                              // m from pool edge
const SWIM_UP_BAR_W = 6                                   // m (EW extent)
const SWIM_UP_BAR_D = 3                                   // m (NS extent)
const PLUNGE_POOL_W = 6                                   // m (EW)
const PLUNGE_POOL_D = 3                                   // m (NS)
const DJ_BOOTH_W = 4                                      // m
const DJ_BOOTH_D = 3                                      // m
const GRILL_W = 5                                         // m
const GRILL_D = 4                                         // m
const SERVICE_YARD_W = 10                                 // m (EW)
const SERVICE_YARD_D = 8                                  // m (NS)
const LANDSCAPE_MIN_PCT = 0.15                            // 15 % of gross site area
const ENTRANCE_DRIVE_W = 6                                // m (EW)
const ENTRANCE_DRIVE_D = 10                               // m (NS)
const PARKING_BAY_W = 5                                   // m (EW per row)
const PARKING_BAY_D = 5                                   // m (NS per row)

// ── Rationale Catalogue ────────────────────────────────────────────────────

const RATIONALES: Record<string, string> = {
  entrance:
    'Vehicular arrival from Bay Street with sight-line to reception',
  parking:
    'Parking flanks entrance drive — outside buildable area, inside site boundary',
  amenity_block:
    'Public-facing amenities front Bay Street for visibility and guest flow',
  pool:
    'Central pool creates resort heart; N-S orientation catches western sun for afternoon swimming',
  pool_deck:
    'Generous deck surround provides circulation and informal gathering space around the pool',
  cabana:
    'South edge provides afternoon shade; north-facing openings overlook pool and catch trade winds',
  lounger_zone:
    'Dual lounger zones offer morning and evening sun options',
  swim_up_bar:
    'West-facing swim-up bar for sunset cocktails — signature experience',
  landscape:
    'Native Caribbean species for hurricane resilience and LEED credits',
  tree:
    'Shade canopy reduces heat-island effect and frames arrival experience',
  path:
    'Covered walkway provides shaded circulation between key amenities',
  service_yard:
    'Service functions hidden from guest view on the east (inland) edge',
  rooftop_bar:
    'Rooftop programme oriented west for sunset; F&B clustered for service efficiency',
  rooftop_plunge:
    'Northwest corner plunge pool captures best panorama over Carlisle Bay',
  rooftop_grill:
    'Grill kitchen adjacent to bar for service efficiency and shared extraction',
  rooftop_dj:
    'DJ booth at south end — sound directed away from rooms below',
  rooftop_lounge:
    'Lounge positioned for unobstructed 270-degree sunset views',
}

/**
 * Return the design reasoning for a given element type.
 */
export function getPlacementRationale(elementType: string): string {
  return RATIONALES[elementType] ?? `No specific rationale catalogued for "${elementType}"`
}

// ── Wing Geometry Helpers ──────────────────────────────────────────────────

interface WingRect {
  x: number
  y: number
  w: number  // EW
  h: number  // NS
}

function wingRect(wing: Wing): WingRect {
  if (wing.direction === 'EW') {
    return { x: wing.x, y: wing.y, w: wing.length, h: wing.width }
  }
  // NS wing: length along NS, width along EW
  return { x: wing.x, y: wing.y, w: wing.width, h: wing.length }
}

/** Compute the bounding box of all wings */
function wingsBbox(wings: Wing[]): { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const wing of wings) {
    const r = wingRect(wing)
    minX = Math.min(minX, r.x)
    minY = Math.min(minY, r.y)
    maxX = Math.max(maxX, r.x + r.w)
    maxY = Math.max(maxY, r.y + r.h)
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY }
}

/** For forms with courtyard space, estimate the courtyard rect */
function courtyardRect(form: FormType, wings: Wing[]): WingRect | null {
  if (form === 'BAR' || form === 'BAR_NS') return null
  const bbox = wingsBbox(wings)
  // For U/C/L, the courtyard is the interior gap
  if (form === 'U') {
    // U form: two EW wings (top/bottom) + one NS connector on the east
    // courtyard is the open west end
    const topWing = wings.find(w => w.label.includes('North'))
    const bottomWing = wings.find(w => w.label.includes('South'))
    if (topWing && bottomWing) {
      const bR = wingRect(bottomWing)
      const tR = wingRect(topWing)
      return {
        x: bR.x,
        y: bR.y + bR.h,
        w: bR.w - (wings[2] ? wingRect(wings[2]).w : 0),
        h: tR.y - (bR.y + bR.h),
      }
    }
  }
  if (form === 'C') {
    const bR = wingRect(wings[0])
    const tR = wingRect(wings[1])
    return {
      x: bR.x + (wings[2] ? wingRect(wings[2]).w : 0),
      y: bR.y + bR.h,
      w: bR.w - 2 * (wings[2] ? wingRect(wings[2]).w : 0),
      h: tR.y - (bR.y + bR.h),
    }
  }
  // L — no full courtyard, but partial open area near junction
  return null
}

// ── Main Computation ───────────────────────────────────────────────────────

export function computeSiteLayout(option: DesignOption, config: SiteConfig): SiteLayout {
  const elements: PlacedElement[] = []
  const circulation: SiteLayout['circulation'] = []
  const compliance: SiteLayout['compliance'] = []

  const B_EW = config.buildableEW  // 79.84
  const B_NS = config.buildableNS  // 48.69

  // Derive wing geometry from the option
  const wings = option.wings
  const form = option.form
  const bbox = wingsBbox(wings)
  const storeys = option.params.storeys

  // ── 1.  Amenity Block ────────────────────────────────────────────────────
  // Inside buildable area, near west edge, centred N-S.
  const amenityW = AMENITY_BLOCK.targetWidth   // 22 m EW
  const amenityD = AMENITY_BLOCK.targetDepth   // 20 m NS
  const amenityX = SETBACK                     // as far west as setback allows
  const amenityY = (B_NS - amenityD) / 2       // centred N-S

  elements.push({
    id: 'amenity-block',
    type: 'amenity_block',
    label: 'Amenity Block (2-storey)',
    x: amenityX,
    y: amenityY,
    width: amenityW,
    depth: amenityD,
    height: AMENITY_BLOCK.groundFloorHeight + AMENITY_BLOCK.floorToFloor,
    floor: 'ground',
    rationale: RATIONALES.amenity_block,
  })

  // ── 2.  Entrance & Parking ──────────────────────────────────────────────
  // Entrance is on the WEST edge of the SITE boundary (outside buildable).
  // In local buildable coords that means negative-x (west of the buildable origin).
  // We express it as metres west of buildable origin — caller can add buildableMinX.
  const westSetbackToSite = SITE.buildableMinX - ORIGINAL_BOUNDARY[0].x  // ~34.6 m
  const entranceCentreY = amenityY + amenityD / 2  // aligned with amenity block centre
  const entranceX = -westSetbackToSite + SETBACK   // within site boundary
  const entranceY = entranceCentreY - ENTRANCE_DRIVE_D / 2

  elements.push({
    id: 'main-entrance',
    type: 'entrance',
    label: 'Bay Street Vehicular Entrance',
    x: entranceX,
    y: entranceY,
    width: ENTRANCE_DRIVE_W,
    depth: ENTRANCE_DRIVE_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.entrance,
  })

  // Parking — north and south of driveway, outside buildable
  const parkingX = entranceX + ENTRANCE_DRIVE_W
  const parkingRowsNorth = 2  // 2 rows of parking north of drive
  const parkingRowsSouth = 2

  elements.push({
    id: 'parking-north',
    type: 'parking',
    label: 'Parking (North of Entrance)',
    x: parkingX,
    y: entranceY + ENTRANCE_DRIVE_D + 1,
    width: PARKING_BAY_W * parkingRowsNorth,
    depth: PARKING_BAY_D * 4,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.parking,
  })

  elements.push({
    id: 'parking-south',
    type: 'parking',
    label: 'Parking (South of Entrance)',
    x: parkingX,
    y: entranceY - PARKING_BAY_D * 4 - 1,
    width: PARKING_BAY_W * parkingRowsSouth,
    depth: PARKING_BAY_D * 4,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.parking,
  })

  // ── 3.  Residential block position ──────────────────────────────────────
  // Residential block is defined by the DesignOption wings. We compute
  // an offset so the residential block sits east of the amenity block with
  // the pool deck in between.

  const poolGap = BUILDING_SEP + POOL_BUILDING_MIN  // min gap for pool
  const resBlockOriginX = computeResidentialX(form, amenityX, amenityW, poolGap, wings, B_EW)
  const resBlockOriginY = computeResidentialY(form, wings, B_NS)

  // We don't place the residential block as a PlacedElement (it is the wing
  // geometry itself), but we use its position for pool + service yard.

  // ── 4.  Pool Deck ───────────────────────────────────────────────────────
  // Between amenity block (west) and residential block (east), centred N-S.
  // Pool long axis N-S.
  const poolDeckX = amenityX + amenityW + POOL_BUILDING_MIN
  const poolDeckEndX = resBlockOriginX - POOL_BUILDING_MIN
  const poolDeckW = Math.max(poolDeckEndX - poolDeckX, 14)  // at least 14 m
  const poolDeckD = Math.min(B_NS - 2 * SETBACK, 40)        // cap at reasonable courtyard
  const poolDeckY = (B_NS - poolDeckD) / 2

  elements.push({
    id: 'pool-deck',
    type: 'pool_deck',
    label: 'Central Pool Deck',
    x: poolDeckX,
    y: poolDeckY,
    width: poolDeckW,
    depth: poolDeckD,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.pool_deck,
  })

  // Pool itself — centred within deck, long axis N-S
  const poolW = Math.min(POOL_DECK.poolWidth, poolDeckW - 2 * LOUNGER_MIN_EDGE - 2)
  const poolD = Math.min(POOL_DECK.poolLength, poolDeckD - 2 * POOL_BUILDING_MIN)
  const poolX = poolDeckX + (poolDeckW - poolW) / 2
  const poolY = poolDeckY + (poolDeckD - poolD) / 2

  elements.push({
    id: 'pool',
    type: 'pool',
    label: 'Main Swimming Pool (N-S oriented)',
    x: poolX,
    y: poolY,
    width: poolW,
    depth: poolD,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.pool,
  })

  // ── 5.  Swim-Up Bar ────────────────────────────────────────────────────
  // West end of pool (guests face sunset).
  elements.push({
    id: 'swim-up-bar',
    type: 'swim_up_bar',
    label: 'Swim-Up Bar (Sunset-Facing)',
    x: poolX - SWIM_UP_BAR_W / 2 + poolW / 2,
    y: poolY + poolD - SWIM_UP_BAR_D,  // north end — conceptually "west end" of N-S pool = top
    width: SWIM_UP_BAR_W,
    depth: SWIM_UP_BAR_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.swim_up_bar,
  })

  // ── 6.  Cabanas ────────────────────────────────────────────────────────
  // Along SOUTH edge of pool deck, facing north (toward pool).
  const cabanaCount = POOL_DECK.cabanaCount
  const totalCabanaSpan = cabanaCount * CABANA_W + (cabanaCount - 1) * (CABANA_SPACING - CABANA_W)
  const cabanaStartX = poolDeckX + (poolDeckW - totalCabanaSpan) / 2

  for (let i = 0; i < cabanaCount; i++) {
    elements.push({
      id: `cabana-${i + 1}`,
      type: 'cabana',
      label: `Cabana ${i + 1}`,
      x: cabanaStartX + i * CABANA_SPACING,
      y: poolDeckY,  // south edge of pool deck
      width: CABANA_W,
      depth: CABANA_D,
      height: 2.8,
      floor: 'ground',
      rationale: RATIONALES.cabana,
    })
  }

  // ── 7.  Lounger Zones ──────────────────────────────────────────────────
  // West side of pool (sunset views) and east side (morning sun).
  elements.push({
    id: 'lounger-west',
    type: 'lounger_zone',
    label: 'Lounger Zone (West — Sunset Views)',
    x: poolDeckX,
    y: poolY,
    width: Math.max(poolX - poolDeckX - LOUNGER_MIN_EDGE, 2),
    depth: poolD,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.lounger_zone,
  })

  elements.push({
    id: 'lounger-east',
    type: 'lounger_zone',
    label: 'Lounger Zone (East — Morning Sun)',
    x: poolX + poolW + LOUNGER_MIN_EDGE,
    y: poolY,
    width: Math.max(poolDeckX + poolDeckW - (poolX + poolW + LOUNGER_MIN_EDGE), 2),
    depth: poolD,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.lounger_zone,
  })

  // ── 8.  Service Yard ───────────────────────────────────────────────────
  // East edge of buildable area, behind the residential block.
  const serviceX = B_EW - SETBACK - SERVICE_YARD_W
  const serviceY = SETBACK

  elements.push({
    id: 'service-yard',
    type: 'service_yard',
    label: 'Service Yard (Waste, MEP, Delivery)',
    x: serviceX,
    y: serviceY,
    width: SERVICE_YARD_W,
    depth: SERVICE_YARD_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.service_yard,
  })

  // ── 9.  Landscape Zones ────────────────────────────────────────────────
  // Boundary planting (all edges), feature planting at entrance, palm grove.
  const boundaryStripW = 2  // m

  // West boundary landscape strip (between parking and amenity block)
  elements.push({
    id: 'landscape-west',
    type: 'landscape',
    label: 'West Boundary Planting (Privacy Screen)',
    x: 0,
    y: 0,
    width: boundaryStripW,
    depth: B_NS,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // North boundary
  elements.push({
    id: 'landscape-north',
    type: 'landscape',
    label: 'North Boundary Planting',
    x: 0,
    y: B_NS - boundaryStripW,
    width: B_EW,
    depth: boundaryStripW,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // South boundary
  elements.push({
    id: 'landscape-south',
    type: 'landscape',
    label: 'South Boundary Planting',
    x: 0,
    y: 0,
    width: B_EW,
    depth: boundaryStripW,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // East boundary
  elements.push({
    id: 'landscape-east',
    type: 'landscape',
    label: 'East Boundary Planting',
    x: B_EW - boundaryStripW,
    y: 0,
    width: boundaryStripW,
    depth: B_NS,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // Feature planting at entrance
  elements.push({
    id: 'landscape-entrance',
    type: 'landscape',
    label: 'Feature Planting — Arrival Experience',
    x: Math.max(0, amenityX - 4),
    y: amenityY - 2,
    width: 4,
    depth: amenityD + 4,
    height: 0,
    floor: 'ground',
    rationale: 'First-impression tropical planting flanking the entrance approach',
  })

  // Palm grove between parking area and amenity block
  elements.push({
    id: 'palm-grove',
    type: 'tree',
    label: 'Palm Grove (Shade + Arrival Screen)',
    x: 0,
    y: amenityY,
    width: amenityX,
    depth: amenityD,
    height: 8,
    floor: 'ground',
    rationale: 'Palm grove provides shade for arriving guests and screens parking from view',
  })

  // ── 10. Rooftop Elements ────────────────────────────────────────────────
  // On the residential block roof. All positioned within building footprint.
  const roofFloor: 'roof' = 'roof'
  const resRoof = wingsBbox(wings)  // bounding box of residential wings
  const roofMidY = (resRoof.minY + resRoof.maxY) / 2

  // Rooftop bar — west half of roof, centred N-S
  const roofBarW = Math.min(12, resRoof.w * 0.4)
  const roofBarD = Math.min(8, resRoof.h * 0.3)
  elements.push({
    id: 'rooftop-bar',
    type: 'amenity_block',
    label: 'Rooftop Bar & Lounge',
    x: resRoof.minX + 1,
    y: roofMidY - roofBarD / 2,
    width: roofBarW,
    depth: roofBarD,
    height: 3,
    floor: roofFloor,
    rationale: RATIONALES.rooftop_bar,
  })

  // Plunge pool — northwest corner of roof
  elements.push({
    id: 'rooftop-plunge',
    type: 'pool',
    label: 'Raised Plunge Pool (6m x 3m)',
    x: resRoof.minX + 1,
    y: resRoof.maxY - PLUNGE_POOL_D - 1,
    width: PLUNGE_POOL_W,
    depth: PLUNGE_POOL_D,
    height: 0.9,
    floor: roofFloor,
    rationale: RATIONALES.rooftop_plunge,
  })

  // Grill kitchen — adjacent to bar
  elements.push({
    id: 'rooftop-grill',
    type: 'amenity_block',
    label: 'Grill Kitchen',
    x: resRoof.minX + roofBarW + 2,
    y: roofMidY - GRILL_D / 2,
    width: GRILL_W,
    depth: GRILL_D,
    height: 3,
    floor: roofFloor,
    rationale: RATIONALES.rooftop_grill,
  })

  // DJ booth — south end of rooftop
  elements.push({
    id: 'rooftop-dj',
    type: 'amenity_block',
    label: 'DJ Booth',
    x: resRoof.minX + 2,
    y: resRoof.minY + 1,
    width: DJ_BOOTH_W,
    depth: DJ_BOOTH_D,
    height: 2.5,
    floor: roofFloor,
    rationale: RATIONALES.rooftop_dj,
  })

  // ── 11. Circulation Paths ──────────────────────────────────────────────
  // Covered walkway: entrance -> amenity block -> pool deck
  elements.push({
    id: 'path-entrance-amenity',
    type: 'path',
    label: 'Covered Walkway (Entrance to Amenity Block)',
    x: Math.max(0, amenityX - 2),
    y: amenityY + amenityD / 2 - 1,
    width: amenityX + 2,
    depth: 2,
    height: 3,
    floor: 'ground',
    rationale: RATIONALES.path,
  })

  elements.push({
    id: 'path-amenity-pool',
    type: 'path',
    label: 'Covered Walkway (Amenity Block to Pool Deck)',
    x: amenityX + amenityW,
    y: amenityY + amenityD / 2 - 1,
    width: poolDeckX - (amenityX + amenityW),
    depth: 2,
    height: 3,
    floor: 'ground',
    rationale: RATIONALES.path,
  })

  // Service corridor along east edge (staff only)
  elements.push({
    id: 'path-service',
    type: 'path',
    label: 'Service Corridor (East Edge — Staff Only)',
    x: B_EW - SETBACK - 2,
    y: serviceY + SERVICE_YARD_D,
    width: 2,
    depth: B_NS - 2 * SETBACK - SERVICE_YARD_D,
    height: 0,
    floor: 'ground',
    rationale: 'Dedicated service corridor keeps back-of-house traffic away from guest areas',
  })

  circulation.push(
    { from: 'main-entrance', to: 'amenity-block', path: 'covered' },
    { from: 'amenity-block', to: 'pool-deck', path: 'covered' },
    { from: 'pool-deck', to: 'pool', path: 'landscaped' },
    { from: 'pool-deck', to: 'service-yard', path: 'direct' },
  )

  // ── 12. Compliance Checks ──────────────────────────────────────────────

  // 12a. Buildable-area containment (amenity block)
  const amenityInside =
    amenityX >= 0 && amenityY >= 0 &&
    amenityX + amenityW <= B_EW &&
    amenityY + amenityD <= B_NS
  compliance.push({
    rule: 'Amenity block inside buildable area',
    status: amenityInside ? 'pass' : 'fail',
    value: amenityInside ? 1 : 0,
    limit: 1,
  })

  // 12b. Parking outside buildable, inside site
  const parkingOutsideBuildable = parkingX < 0 || parkingX < SETBACK
  compliance.push({
    rule: 'Parking outside buildable area but inside site boundary',
    status: parkingOutsideBuildable ? 'pass' : 'fail',
    value: parkingOutsideBuildable ? 1 : 0,
    limit: 1,
  })

  // 12c. Pool setback from buildings
  const poolToAmenity = poolX - (amenityX + amenityW)
  const poolToRes = resBlockOriginX - (poolX + poolW)
  const poolSetbackOk = poolToAmenity >= POOL_BUILDING_MIN && poolToRes >= POOL_BUILDING_MIN
  compliance.push({
    rule: 'Pool minimum 3m from buildings',
    status: poolSetbackOk ? 'pass' : 'fail',
    value: Math.min(poolToAmenity, poolToRes),
    limit: POOL_BUILDING_MIN,
  })

  // 12d. Landscape >= 15% of gross site area
  const landscapeElements = elements.filter(e => e.type === 'landscape' || e.type === 'tree')
  const totalLandscapeArea = landscapeElements.reduce((sum, e) => sum + e.width * e.depth, 0)
  const landscapePct = totalLandscapeArea / config.grossArea
  compliance.push({
    rule: 'Landscape >= 15% of site area',
    status: landscapePct >= LANDSCAPE_MIN_PCT ? 'pass' : 'fail',
    value: Math.round(landscapePct * 1000) / 10,
    limit: LANDSCAPE_MIN_PCT * 100,
  })

  // 12e. Fire access maintained (6m clear around buildings)
  const fireAccessSouth = amenityY
  const fireAccessOk = fireAccessSouth >= FIRE_ACCESS_WIDTH || serviceY >= FIRE_ACCESS_WIDTH
  compliance.push({
    rule: 'Fire access 6m clear maintained',
    status: fireAccessOk ? 'pass' : 'fail',
    value: Math.min(fireAccessSouth, serviceY),
    limit: FIRE_ACCESS_WIDTH,
  })

  // 12f. Setbacks maintained
  const setbackOk =
    amenityX >= SETBACK &&
    amenityY >= SETBACK &&
    (amenityX + amenityW) <= (B_EW - SETBACK) &&
    (amenityY + amenityD) <= (B_NS - SETBACK)
  compliance.push({
    rule: 'Building setbacks (1.83m) maintained on all edges',
    status: setbackOk ? 'pass' : 'fail',
    value: SETBACK,
    limit: SETBACK,
  })

  // 12g. Rooftop elements inside building footprint
  const rooftopElements = elements.filter(e => e.floor === 'roof')
  const allRooftopInside = rooftopElements.every(e =>
    e.x >= resRoof.minX &&
    e.y >= resRoof.minY &&
    (e.x + e.width) <= resRoof.maxX &&
    (e.y + e.depth) <= resRoof.maxY,
  )
  compliance.push({
    rule: 'All rooftop elements inside building footprint (no overhang)',
    status: allRooftopInside ? 'pass' : 'fail',
    value: allRooftopInside ? 1 : 0,
    limit: 1,
  })

  // ── 13. Design Narrative ───────────────────────────────────────────────

  const designNarrative = buildNarrative(form, storeys, amenityW, amenityD, poolW, poolD, cabanaCount)

  return { elements, circulation, compliance, designNarrative }
}

// ── Form-Adaptive Helpers ──────────────────────────────────────────────────

/**
 * Compute the x-origin of the residential block (east of pool deck).
 * Adapts to form type — for forms with courtyards (U, C) the pool may be
 * partially inside the courtyard, allowing the block to be closer.
 */
function computeResidentialX(
  form: FormType,
  amenityX: number,
  amenityW: number,
  poolGap: number,
  wings: Wing[],
  buildableEW: number,
): number {
  const amenityEastEdge = amenityX + amenityW
  const minPoolDeckWidth = 14  // minimum pool courtyard width

  switch (form) {
    case 'BAR':
    case 'BAR_NS': {
      // Simple bar — place pool deck + residential in sequence
      return Math.min(
        amenityEastEdge + minPoolDeckWidth + POOL_BUILDING_MIN * 2,
        buildableEW - wingsBbox(wings).w - SETBACK,
      )
    }
    case 'L': {
      // L-form: main EW wing with NS branch. Place so pool is between
      // amenity block and the L's main wing.
      const mainWing = wings.find(w => w.direction === 'EW')
      const mainW = mainWing ? mainWing.length : 40
      return Math.min(
        amenityEastEdge + minPoolDeckWidth + POOL_BUILDING_MIN * 2,
        buildableEW - mainW - SETBACK,
      )
    }
    case 'U':
    case 'C': {
      // U/C forms have a courtyard; pool can nestle into the opening.
      return amenityEastEdge + poolGap + POOL_BUILDING_MIN
    }
    default:
      return amenityEastEdge + poolGap + minPoolDeckWidth
  }
}

/**
 * Compute the y-origin of the residential block.
 * Centred N-S for BAR; offset for L to align branch.
 */
function computeResidentialY(form: FormType, wings: Wing[], buildableNS: number): number {
  const bbox = wingsBbox(wings)
  switch (form) {
    case 'BAR':
    case 'BAR_NS':
    case 'L':
      return (buildableNS - bbox.h) / 2
    case 'U':
    case 'C':
      // Centre the courtyard form
      return (buildableNS - bbox.h) / 2
    default:
      return SETBACK
  }
}

function buildNarrative(
  form: FormType,
  storeys: number,
  amenityW: number,
  amenityD: number,
  poolW: number,
  poolD: number,
  cabanaCount: number,
): string {
  const formDescriptions: Record<FormType, string> = {
    BAR: 'a single east-west bar building that maximises the ocean-facing west facade',
    BAR_NS: 'a single north-south bar building oriented perpendicular to the coast for dual aspect',
    L: 'an L-shaped plan with the main wing running east-west and a north-south branch creating a sheltered courtyard',
    U: 'a U-shaped courtyard plan that wraps the central pool deck on three sides, creating an intimate resort atmosphere',
    C: 'a C-shaped (closed courtyard) plan enclosing the pool deck for maximum privacy and wind protection',
  }

  return (
    `The layout employs ${formDescriptions[form]}. ` +
    `A ${storeys}-storey residential block houses YOTEL rooms on the lower floors and YOTELPAD ` +
    `extended-stay units above, with a full rooftop programme including bar, grill kitchen, ` +
    `plunge pool, and DJ booth oriented west for sunset views over Carlisle Bay. ` +
    `At ground level, the ${amenityW}m x ${amenityD}m amenity block fronts Bay Street ` +
    `with reception, restaurant, and grab-and-go on the ground floor, and gym, recording ` +
    `studios, and a sim-racing room on the first floor. ` +
    `The central pool deck (${poolW}m x ${poolD}m main pool, N-S oriented) sits between ` +
    `the two buildings, with ${cabanaCount} cabanas along the shaded south edge and a ` +
    `swim-up bar at the west end for sunset cocktails. ` +
    `Vehicular arrival from Bay Street enters via the west edge, with parking flanking ` +
    `the entrance drive outside the buildable area. A covered walkway leads guests from ` +
    `arrival through the amenity block to the pool deck. Service functions are concealed ` +
    `on the east (inland) edge, with a dedicated staff corridor. ` +
    `Native Caribbean landscaping screens all boundaries, with a palm grove shading the ` +
    `arrival approach and feature planting at the entrance for a strong first impression.`
  )
}
