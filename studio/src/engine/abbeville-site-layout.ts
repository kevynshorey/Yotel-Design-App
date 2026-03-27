/**
 * Architectural Reasoning Engine — Abbeville YOTELPAD Site Layout
 *
 * Takes a DesignOption and computes intelligent placements for all site
 * elements using architectural reasoning specific to the Abbeville site
 * in Worthing, Christ Church, Barbados.
 *
 * Layout concept: 4 staggered towers on a ground-floor podium, entrance
 * from Worthing Main Road (south), pool deck courtyard between towers.
 * Towers rotated 30 degrees to create SW sea-view corridors and maximise
 * natural light between buildings.
 *
 * Coordinate system:
 *   origin = buildable-area southwest corner (buildableMinX, buildableMinY)
 *   x = metres east of origin (along EW axis)
 *   y = metres north of origin (along NS axis)
 */

import type { DesignOption } from './types'
import type { PlacedElement, SiteLayout } from './site-layout'
import { SITE, PLANNING_REGS } from '@/config/abbeville/site'

// ── Constants ──────────────────────────────────────────────────────────────

/** Podium dimensions (m) */
const PODIUM_W = 30        // EW
const PODIUM_D = 26        // NS
const PODIUM_H = 4.5       // single storey height
const PODIUM_AREA = PODIUM_W * PODIUM_D  // ~786 m²

/** Tower dimensions (m) — identical for all towers */
const TOWER_W = 12.5       // EW
const TOWER_D = 11.8       // NS
const TOWER_ROTATION = 30  // degrees — SW sea-view corridor
const FLOOR_HEIGHT = 3.2   // m per upper floor
const UNITS_PER_TOWER = 15

/** Tower positions in buildable-local coordinates */
const TOWER_POSITIONS = {
  A: { x: 5,  y: 15, label: 'Tower A — 15 PAD Units', quadrant: 'SW' },
  B: { x: 8,  y: 28, label: 'Tower B — 15 PAD Units', quadrant: 'NW' },
  C: { x: 25, y: 12, label: 'Tower C — 15 PAD Units', quadrant: 'SE' },
  D: { x: 28, y: 25, label: 'Tower D — 15 PAD Units', quadrant: 'NE' },
} as const

/** Pool deck */
const POOL_X = 14
const POOL_Y = 18
const POOL_W = 20
const POOL_D = 15
const POOL_AREA = POOL_W * POOL_D  // 300 m²

/** Entrance drive — from Worthing Main Road (south) */
const ENTRANCE_W = 6
const ENTRANCE_D = 12

/** Parking — east side */
const PARKING_X = 40
const PARKING_Y = 5
const PARKING_W = 25
const PARKING_D = 10
const PARKING_SPACES = 17

/** Service yard — northeast corner */
const SERVICE_X = 45
const SERVICE_Y = 35
const SERVICE_W = 10
const SERVICE_D = 8

/** Landscape buffer widths */
const LANDSCAPE_STRIP_W = 2.5  // m — perimeter planting width

// ── Rationales ─────────────────────────────────────────────────────────────

const RATIONALES = {
  podium:
    'Ground-floor podium at south edge maximises road frontage on Worthing Main Road; ' +
    'houses lobby, gym, retail, and shared amenities beneath towers',
  towerSW:
    'SW tower positioned for direct sea-view corridor through 30-degree rotation; ' +
    'stagger creates privacy separation from adjacent towers',
  towerNW:
    'NW tower offset 8 m north and 3 m east of Tower A; stagger maintains minimum ' +
    '6 m separation while opening diagonal view corridors to the southwest',
  towerSE:
    'SE tower mirrors SW layout on east side; 30-degree rotation aligns views ' +
    'between towers rather than into each other',
  towerNE:
    'NE tower completes the pinwheel pattern; can be omitted for 45-unit ' +
    'conservative scheme without impacting podium or courtyard',
  pool:
    'Central courtyard pool between towers creates resort heart; 300 m² deck ' +
    'provides shared outdoor amenity visible from all units',
  entrance:
    'Vehicular arrival centred on podium south face from Worthing Main Road; ' +
    'direct sight-line to lobby reception',
  parking:
    'Surface parking on east side — 17 spaces at 0.28 spaces/key satisfies ' +
    'Barbados planning minimum (0.25) while preserving west-side views',
  service:
    'Service functions consolidated in northeast corner — waste, MEP, delivery ' +
    'screened from guest areas and road frontage',
  landscape:
    'Native Caribbean species buffer around perimeter for privacy, wind break, ' +
    'and LEED credits; frames arrival sequence',
} as const

// ── Main Computation ───────────────────────────────────────────────────────

/**
 * Compute the Abbeville YOTELPAD site layout from a DesignOption.
 *
 * Returns a SiteLayout with PlacedElement[] for all site components:
 * podium, towers (3 or 4), pool deck, entrance, parking, service yard,
 * and landscape zones.
 *
 * If the option specifies <= 45 PAD units (3 towers), Tower D is omitted.
 */
export function computeAbbevilleSiteLayout(option: DesignOption): SiteLayout {
  const elements: PlacedElement[] = []
  const circulation: SiteLayout['circulation'] = []
  const compliance: SiteLayout['compliance'] = []

  const storeys = option.params.storeys
  const towerHeight = storeys * FLOOR_HEIGHT + PODIUM_H
  const totalPadUnits = option.params.padUnits ?? option.metrics.padUnits ?? 60
  const useFourTowers = totalPadUnits > 45

  // ── 1. Podium Block ────────────────────────────────────────────────────

  const podiumX = (SITE.buildableEW - PODIUM_W) / 2  // centred E-W
  const podiumY = 0  // at south edge (near road)

  elements.push({
    id: 'podium',
    type: 'amenity_block',
    label: 'Podium \u2014 Lobby, Gym, Retail, Amenities',
    x: podiumX,
    y: podiumY,
    width: PODIUM_W,
    depth: PODIUM_D,
    height: PODIUM_H,
    rotation: 0,
    floor: 'ground',
    rationale: RATIONALES.podium,
  })

  // ── 2. Towers ──────────────────────────────────────────────────────────

  const towerEntries: [string, typeof TOWER_POSITIONS[keyof typeof TOWER_POSITIONS], string][] = [
    ['tower-a', TOWER_POSITIONS.A, RATIONALES.towerSW],
    ['tower-b', TOWER_POSITIONS.B, RATIONALES.towerNW],
    ['tower-c', TOWER_POSITIONS.C, RATIONALES.towerSE],
  ]

  if (useFourTowers) {
    towerEntries.push(['tower-d', TOWER_POSITIONS.D, RATIONALES.towerNE])
  }

  for (const [id, pos, rationale] of towerEntries) {
    elements.push({
      id,
      type: 'amenity_block',
      label: pos.label,
      x: pos.x,
      y: pos.y,
      width: TOWER_W,
      depth: TOWER_D,
      height: towerHeight,
      rotation: TOWER_ROTATION,
      floor: 'ground',
      rationale,
    })
  }

  // ── 3. Pool Deck ───────────────────────────────────────────────────────

  elements.push({
    id: 'pool-deck',
    type: 'pool_deck',
    label: `Pool Deck \u2014 ${POOL_AREA} m\u00B2`,
    x: POOL_X,
    y: POOL_Y,
    width: POOL_W,
    depth: POOL_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.pool,
  })

  // ── 4. Pool (water surface within deck) ────────────────────────────────

  const poolWaterW = 12
  const poolWaterD = 8
  elements.push({
    id: 'pool',
    type: 'pool',
    label: 'Lap Pool \u2014 96 m\u00B2',
    x: POOL_X + (POOL_W - poolWaterW) / 2,
    y: POOL_Y + (POOL_D - poolWaterD) / 2,
    width: poolWaterW,
    depth: poolWaterD,
    height: 0,
    floor: 'ground',
    rationale: 'Central lap pool oriented E-W for morning and afternoon sun exposure',
  })

  // ── 5. Main Entrance ───────────────────────────────────────────────────

  const entranceX = podiumX + (PODIUM_W - ENTRANCE_W) / 2
  const entranceY = podiumY - ENTRANCE_D  // south of podium, towards road

  elements.push({
    id: 'entrance',
    type: 'entrance',
    label: 'Main Entrance \u2014 Worthing Main Road',
    x: entranceX,
    y: Math.max(entranceY, -SITE.buildableMinY + SITE.buildableMinY),  // clamp to buildable
    width: ENTRANCE_W,
    depth: ENTRANCE_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.entrance,
  })

  // ── 6. Parking ─────────────────────────────────────────────────────────

  elements.push({
    id: 'parking',
    type: 'parking',
    label: `Parking \u2014 ${PARKING_SPACES} Spaces`,
    x: PARKING_X,
    y: PARKING_Y,
    width: PARKING_W,
    depth: PARKING_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.parking,
  })

  // ── 7. Service Yard ────────────────────────────────────────────────────

  elements.push({
    id: 'service-yard',
    type: 'service_yard',
    label: 'Service Yard \u2014 Waste, MEP, Delivery',
    x: SERVICE_X,
    y: SERVICE_Y,
    width: SERVICE_W,
    depth: SERVICE_D,
    height: 3,
    floor: 'ground',
    rationale: RATIONALES.service,
  })

  // ── 8. Landscape Zones ─────────────────────────────────────────────────

  // West boundary strip
  elements.push({
    id: 'landscape-west',
    type: 'landscape',
    label: 'West Boundary Planting',
    x: 0,
    y: 0,
    width: LANDSCAPE_STRIP_W,
    depth: SITE.buildableNS,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // North boundary strip
  elements.push({
    id: 'landscape-north',
    type: 'landscape',
    label: 'North Boundary Planting',
    x: 0,
    y: SITE.buildableNS - LANDSCAPE_STRIP_W,
    width: SITE.buildableEW,
    depth: LANDSCAPE_STRIP_W,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // East boundary strip
  elements.push({
    id: 'landscape-east',
    type: 'landscape',
    label: 'East Boundary Planting',
    x: SITE.buildableEW - LANDSCAPE_STRIP_W,
    y: 0,
    width: LANDSCAPE_STRIP_W,
    depth: SITE.buildableNS,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.landscape,
  })

  // Entrance forecourt planting (flanking entrance drive)
  elements.push({
    id: 'landscape-entrance-w',
    type: 'landscape',
    label: 'Entrance Planting \u2014 West',
    x: entranceX - 3,
    y: Math.max(entranceY, 0),
    width: 3,
    depth: ENTRANCE_D,
    height: 0,
    floor: 'ground',
    rationale: 'Native planting frames arrival sequence and screens parking from road',
  })

  elements.push({
    id: 'landscape-entrance-e',
    type: 'landscape',
    label: 'Entrance Planting \u2014 East',
    x: entranceX + ENTRANCE_W,
    y: Math.max(entranceY, 0),
    width: 3,
    depth: ENTRANCE_D,
    height: 0,
    floor: 'ground',
    rationale: 'Native planting frames arrival sequence and screens parking from road',
  })

  // ── 9. Mature Trees ────────────────────────────────────────────────────

  const treePositions = [
    { x: 2, y: 5, label: 'Mahogany' },
    { x: 2, y: 20, label: 'Flamboyant' },
    { x: 2, y: 38, label: 'Caribbean Pine' },
    { x: 50, y: 8, label: 'Sea Grape' },
    { x: 50, y: 30, label: 'Casuarina' },
    { x: 30, y: 42, label: 'Breadfruit' },
  ]

  for (const tree of treePositions) {
    elements.push({
      id: `tree-${tree.label.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'tree',
      label: tree.label,
      x: tree.x,
      y: tree.y,
      width: 4,
      depth: 4,
      height: 8,
      floor: 'ground',
      rationale: 'Shade canopy reduces heat-island effect; native species for hurricane resilience',
    })
  }

  // ── 10. Covered Walkway ────────────────────────────────────────────────

  elements.push({
    id: 'path-lobby-to-pool',
    type: 'path',
    label: 'Covered Walkway \u2014 Lobby to Pool',
    x: podiumX + PODIUM_W / 2 - 1.5,
    y: PODIUM_D,
    width: 3,
    depth: POOL_Y - PODIUM_D,
    height: 3.5,
    floor: 'ground',
    rationale: 'Shaded circulation connecting lobby to pool courtyard',
  })

  // ── Circulation ────────────────────────────────────────────────────────

  circulation.push(
    { from: 'entrance', to: 'podium', path: 'covered' },
    { from: 'podium', to: 'pool-deck', path: 'covered' },
    { from: 'pool-deck', to: 'tower-a', path: 'direct' },
    { from: 'pool-deck', to: 'tower-b', path: 'direct' },
    { from: 'pool-deck', to: 'tower-c', path: 'direct' },
    { from: 'entrance', to: 'parking', path: 'direct' },
    { from: 'service-yard', to: 'podium', path: 'direct' },
  )

  if (useFourTowers) {
    circulation.push({ from: 'pool-deck', to: 'tower-d', path: 'direct' })
  }

  // ── Compliance Checks ──────────────────────────────────────────────────

  const towerCount = useFourTowers ? 4 : 3
  const totalFootprint = PODIUM_AREA + towerCount * TOWER_W * TOWER_D
  const siteCoverage = totalFootprint / SITE.grossArea

  compliance.push(
    {
      rule: 'Site coverage \u2264 50%',
      status: siteCoverage <= PLANNING_REGS.maxCoverage ? 'pass' : 'fail',
      value: Math.round(siteCoverage * 100),
      limit: PLANNING_REGS.maxCoverage * 100,
    },
    {
      rule: 'Building height \u2264 20.5 m',
      status: towerHeight <= PLANNING_REGS.maxHeight ? 'pass' : 'fail',
      value: Math.round(towerHeight * 10) / 10,
      limit: PLANNING_REGS.maxHeight,
    },
    {
      rule: 'Parking ratio \u2265 0.25 spaces/key',
      status: PARKING_SPACES / (towerCount * UNITS_PER_TOWER) >= PLANNING_REGS.parkingRatioMin ? 'pass' : 'fail',
      value: Math.round((PARKING_SPACES / (towerCount * UNITS_PER_TOWER)) * 100) / 100,
      limit: PLANNING_REGS.parkingRatioMin,
    },
  )

  // ── Design Narrative ───────────────────────────────────────────────────

  const designNarrative = [
    `Abbeville YOTELPAD: ${towerCount}-tower staggered layout on a single-storey podium.`,
    `${towerCount * UNITS_PER_TOWER} PAD units across ${towerCount} towers, each rotated ${TOWER_ROTATION}\u00B0 ` +
      'to create diagonal sea-view corridors to the southwest.',
    `Ground-floor podium (${PODIUM_AREA} m\u00B2) houses lobby, gym, retail, and shared amenities ` +
      'with direct frontage to Worthing Main Road.',
    `Central courtyard pool deck (${POOL_AREA} m\u00B2) creates a resort-style heart ` +
      'between towers, visible from all units.',
    `Tower staggering provides minimum 6 m separation for fire access, privacy, ` +
      'and cross-ventilation via prevailing NE trade winds.',
    `${PARKING_SPACES} surface parking spaces on the east side satisfy Barbados planning ` +
      'requirements without compromising west-side sea views.',
    `Service functions consolidated in the northeast corner, screened from ` +
      'guest areas and the road.',
  ].join(' ')

  return { elements, circulation, compliance, designNarrative }
}
