/**
 * Architectural Reasoning Engine — Abbeville YOTELPAD Site Layout
 *
 * Takes a DesignOption and computes intelligent placements for all site
 * elements using architectural reasoning specific to the Abbeville site
 * in Worthing, Christ Church, Barbados.
 *
 * Layout concept: SINGLE terraced building with stepped-back upper floors
 * creating a wedge/"wedding cake" profile. Entrance from Worthing Main
 * Road (south), pool deck SW of building, terraced balconies on SW face.
 * Building rotated 30 degrees for SW sea-view corridors.
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

/** Podium dimensions (m) — full ground-floor building footprint */
const PODIUM_W = 40         // EW (length)
const PODIUM_D = 28         // NS (width)
const PODIUM_H = 4.5        // single storey height
const FLOOR_HEIGHT = 3.2    // m per upper floor

/** Building position — centred in buildable area */
const BLDG_X = 6            // from west edge of buildable
const BLDG_Y = 10           // from south edge of buildable

/** Pool deck — SW of building */
const POOL_DECK_X = 3
const POOL_DECK_Y = 0
const POOL_DECK_W = 20
const POOL_DECK_D = 15

/** Pool water — inside pool deck */
const POOL_WATER_W = 15
const POOL_WATER_D = 8

/** Entrance drive — south edge */
const ENTRANCE_W = 6
const ENTRANCE_D = 15

/** Parking — east side */
const PARKING_X = 30
const PARKING_Y = 0
const PARKING_W = 25
const PARKING_D = 10
const PARKING_SPACES = 17

/** Service yard — NE corner */
const SERVICE_X = 40
const SERVICE_Y = 35
const SERVICE_W = 10
const SERVICE_D = 8

/** Landscape buffer widths */
const LANDSCAPE_STRIP_W = 2.5  // m — perimeter planting width

// ── Rationales ─────────────────────────────────────────────────────────────

const RATIONALES = {
  podium:
    'Full-footprint ground-floor podium (40m x 28m) houses lobby, restaurant/bar, ' +
    'gym, co-working, retail, and BOH/kitchen at grade',
  lobby:
    'Front-of-house lobby (130 m\u00B2) at NE corner near entrance drive for ' +
    'direct sight-line from arrival',
  restaurant:
    'Restaurant/bar (280 m\u00B2) on SW face with sea-view orientation; ' +
    'opens onto pool deck for seamless indoor-outdoor dining',
  gym:
    'Fitness centre (93 m\u00B2) at NW corner; morning light and cross-ventilation ' +
    'from NE trade winds',
  coworking:
    'Co-working lounge (111 m\u00B2) on west face; natural light and ' +
    'sea views for extended-stay guests',
  retail:
    'Retail unit (46 m\u00B2) near entrance for street-facing visibility ' +
    'and passing trade from Worthing Main Road',
  boh:
    'Back-of-house (167 m\u00B2) at NE corner; service access from parking side, ' +
    'screened from guest areas and pool deck',
  terraceL3:
    'L3 terrace deck created by Tier 2 setback (3 m deep, 40 m long); ' +
    'semi-private outdoor space for upper-floor units with SW sea views',
  terraceL5:
    'L5 terrace deck created by Tier 3 setback (3 m deep, 40 m long); ' +
    'premium terrace with panoramic SW sea views at upper levels',
  pool:
    'Pool deck SW of building catches afternoon sun and captures sea views; ' +
    'direct access from ground-floor restaurant and lobby',
  poolWater:
    'Lap pool (15 m x 8 m) oriented E-W for morning and afternoon sun exposure',
  entrance:
    'Vehicular arrival centred on south face from Worthing Main Road; ' +
    'direct sight-line to lobby reception',
  parking:
    'Surface parking east of building — 17 spaces at 0.28 spaces/key satisfies ' +
    'Barbados planning minimum (0.25) without blocking sea views',
  service:
    'Service functions at NE corner — waste, MEP, delivery ' +
    'screened from guest areas, pool, and road frontage',
  landscape:
    'Native Caribbean species buffer around perimeter for privacy, wind break, ' +
    'and LEED credits; frames arrival sequence',
} as const

// ── Main Computation ───────────────────────────────────────────────────────

/**
 * Compute the Abbeville YOTELPAD site layout from a DesignOption.
 *
 * Returns a SiteLayout with PlacedElement[] for the single terraced building:
 * podium with coloured zone overlays, terrace decks at setbacks,
 * pool deck, entrance, parking, service yard, and landscape zones.
 */
export function computeAbbevilleSiteLayout(option: DesignOption): SiteLayout {
  const elements: PlacedElement[] = []
  const circulation: SiteLayout['circulation'] = []
  const compliance: SiteLayout['compliance'] = []

  const storeys = option.params.storeys
  const totalUpperFloors = storeys - 1  // exclude ground
  const buildingHeight = PODIUM_H + totalUpperFloors * FLOOR_HEIGHT
  const totalPadUnits = option.params.padUnits ?? option.metrics.padUnits ?? 60

  // ── 1. Podium Block ────────────────────────────────────────────────────

  elements.push({
    id: 'podium',
    type: 'amenity_block',
    label: 'Podium \u2014 Lobby, Gym, Retail, Restaurant',
    x: BLDG_X,
    y: BLDG_Y,
    width: PODIUM_W,
    depth: PODIUM_D,
    height: PODIUM_H,
    rotation: 0,
    floor: 'ground',
    rationale: RATIONALES.podium,
  })

  // ── 2. Podium zone overlays ────────────────────────────────────────────
  // Thin coloured overlays on ground floor showing functional zones

  // Lobby — NE corner near entrance
  elements.push({
    id: 'zone-lobby',
    type: 'amenity_block',
    label: 'Lobby \u2014 130 m\u00B2',
    x: BLDG_X + 2,
    y: BLDG_Y + 2,
    width: 15,
    depth: 8,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.lobby,
  })

  // Restaurant/Bar — SW face
  elements.push({
    id: 'zone-restaurant',
    type: 'amenity_block',
    label: 'Restaurant/Bar \u2014 280 m\u00B2',
    x: BLDG_X + 18,
    y: BLDG_Y + 2,
    width: 20,
    depth: 14,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.restaurant,
  })

  // Gym — NW corner
  elements.push({
    id: 'zone-gym',
    type: 'amenity_block',
    label: 'Gym \u2014 93 m\u00B2',
    x: BLDG_X + 2,
    y: BLDG_Y + 12,
    width: 10,
    depth: 9,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.gym,
  })

  // Co-working — west face
  elements.push({
    id: 'zone-coworking',
    type: 'amenity_block',
    label: 'Co-Working \u2014 111 m\u00B2',
    x: BLDG_X + 2,
    y: BLDG_Y + 22,
    width: 12,
    depth: 9,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.coworking,
  })

  // Retail — near entrance
  elements.push({
    id: 'zone-retail',
    type: 'amenity_block',
    label: 'Retail \u2014 46 m\u00B2',
    x: BLDG_X + 14,
    y: BLDG_Y + 22,
    width: 8,
    depth: 6,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.retail,
  })

  // BOH/Kitchen — NE corner
  elements.push({
    id: 'zone-boh',
    type: 'service_yard',
    label: 'BOH/Kitchen \u2014 167 m\u00B2',
    x: BLDG_X + 30,
    y: BLDG_Y + 16,
    width: 10,
    depth: 12,
    height: 0.2,
    floor: 'ground',
    rationale: RATIONALES.boh,
  })

  // ── 3. Terrace decks at setbacks ───────────────────────────────────────

  // L3 terrace — at the setback between Tier 1 and Tier 2
  // Height: ground (4.5) + 2 floors (6.4) = 10.9 m
  const terraceL3Height = PODIUM_H + 2 * FLOOR_HEIGHT
  elements.push({
    id: 'terrace-l3',
    type: 'pool_deck',
    label: 'L3 Terrace Deck \u2014 120 m\u00B2',
    x: BLDG_X,
    y: BLDG_Y,
    width: PODIUM_W,
    depth: 3,
    height: terraceL3Height,
    floor: 'ground',
    rationale: RATIONALES.terraceL3,
  })

  // L5 terrace — at the setback between Tier 2 and Tier 3
  // Height: ground (4.5) + 4 floors (12.8) = 17.3 m
  if (totalUpperFloors >= 5) {
    const terraceL5Height = PODIUM_H + 4 * FLOOR_HEIGHT
    elements.push({
      id: 'terrace-l5',
      type: 'pool_deck',
      label: 'L5 Terrace Deck \u2014 120 m\u00B2',
      x: BLDG_X,
      y: BLDG_Y + 3,
      width: PODIUM_W,
      depth: 3,
      height: terraceL5Height,
      floor: 'ground',
      rationale: RATIONALES.terraceL5,
    })
  }

  // ── 4. Pool Deck — SW of building ──────────────────────────────────────

  elements.push({
    id: 'pool-deck',
    type: 'pool_deck',
    label: `Pool Deck \u2014 ${POOL_DECK_W * POOL_DECK_D} m\u00B2`,
    x: POOL_DECK_X,
    y: POOL_DECK_Y,
    width: POOL_DECK_W,
    depth: POOL_DECK_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.pool,
  })

  // ── 5. Pool Water ──────────────────────────────────────────────────────

  elements.push({
    id: 'pool',
    type: 'pool',
    label: `Lap Pool \u2014 ${POOL_WATER_W * POOL_WATER_D} m\u00B2`,
    x: POOL_DECK_X + (POOL_DECK_W - POOL_WATER_W) / 2,
    y: POOL_DECK_Y + (POOL_DECK_D - POOL_WATER_D) / 2,
    width: POOL_WATER_W,
    depth: POOL_WATER_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.poolWater,
  })

  // ── 6. Main Entrance ───────────────────────────────────────────────────

  const entranceX = BLDG_X + PODIUM_W / 2 - ENTRANCE_W / 2
  const entranceY = 0

  elements.push({
    id: 'entrance',
    type: 'entrance',
    label: 'Main Entrance \u2014 Worthing Main Road',
    x: entranceX,
    y: entranceY,
    width: ENTRANCE_W,
    depth: ENTRANCE_D,
    height: 0,
    floor: 'ground',
    rationale: RATIONALES.entrance,
  })

  // ── 7. Parking — east side ─────────────────────────────────────────────

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

  // ── 8. Service Yard — NE corner ────────────────────────────────────────

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

  // ── 9. Landscape Zones ─────────────────────────────────────────────────

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

  // Entrance forecourt planting
  elements.push({
    id: 'landscape-entrance-w',
    type: 'landscape',
    label: 'Entrance Planting \u2014 West',
    x: entranceX - 3,
    y: 0,
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
    y: 0,
    width: 3,
    depth: ENTRANCE_D,
    height: 0,
    floor: 'ground',
    rationale: 'Native planting frames arrival sequence and screens parking from road',
  })

  // ── 10. Mature Trees ────────────────────────────────────────────────────

  const treePositions = [
    { x: 1, y: 5, label: 'Mahogany' },
    { x: 1, y: 22, label: 'Flamboyant' },
    { x: 1, y: 40, label: 'Caribbean Pine' },
    { x: 50, y: 8, label: 'Sea Grape' },
    { x: 50, y: 30, label: 'Casuarina' },
    { x: 30, y: 44, label: 'Breadfruit' },
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

  // ── Circulation ────────────────────────────────────────────────────────

  circulation.push(
    { from: 'entrance', to: 'podium', path: 'covered' },
    { from: 'podium', to: 'pool-deck', path: 'covered' },
    { from: 'pool-deck', to: 'podium', path: 'direct' },
    { from: 'entrance', to: 'parking', path: 'direct' },
    { from: 'service-yard', to: 'podium', path: 'direct' },
  )

  // ── Compliance Checks ──────────────────────────────────────────────────

  const totalFootprint = PODIUM_W * PODIUM_D
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
      status: buildingHeight <= PLANNING_REGS.maxHeight ? 'pass' : 'fail',
      value: Math.round(buildingHeight * 10) / 10,
      limit: PLANNING_REGS.maxHeight,
    },
    {
      rule: 'Parking ratio \u2265 0.25 spaces/key',
      status: PARKING_SPACES / totalPadUnits >= PLANNING_REGS.parkingRatioMin ? 'pass' : 'fail',
      value: Math.round((PARKING_SPACES / totalPadUnits) * 100) / 100,
      limit: PLANNING_REGS.parkingRatioMin,
    },
  )

  // ── Design Narrative ───────────────────────────────────────────────────

  const designNarrative = [
    `Abbeville YOTELPAD: single terraced building with stepped-back upper floors.`,
    `${totalPadUnits} PAD units across ${totalUpperFloors} upper floors, building rotated 30\u00B0 ` +
      'for diagonal sea-view corridors to the southwest.',
    `Ground-floor podium (${totalFootprint} m\u00B2) houses lobby, restaurant/bar, ` +
      'gym, co-working, retail, and BOH/kitchen at grade.',
    `Upper floors step back on the SW face creating terraced balconies: ` +
      'wider at bottom (L1-2: 26 m), narrowing toward top (L5-6: 20 m).',
    `Pool deck (${POOL_DECK_W * POOL_DECK_D} m\u00B2) SW of building catches afternoon sun ` +
      'and sea views; terrace decks at L3 and L5 setbacks add 240 m\u00B2 outdoor amenity.',
    `${PARKING_SPACES} surface parking spaces east of building satisfy Barbados planning ` +
      'requirements without compromising sea views or pool amenity.',
  ].join(' ')

  return { elements, circulation, compliance, designNarrative }
}
