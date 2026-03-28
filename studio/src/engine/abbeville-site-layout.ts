/**
 * Abbeville YOTELPAD Site Layout — 4 towers on podium
 *
 * Layout: 4 identical residential towers sitting on a ground-floor podium.
 * Towers are staggered in POSITION (offset from each other) to create
 * view corridors to the SW (sea) and maximize cross-ventilation from
 * Caribbean trade winds. All towers are the SAME SIZE.
 *
 * Entrance from Worthing Main Road (south), pool between towers,
 * parking east side, service yard NE corner.
 *
 * Building group rotated 30° in the 3D viewer for SW orientation.
 */

import type { DesignOption } from './types'
import type { PlacedElement, SiteLayout } from './site-layout'

// Tower and podium dimensions (must match abbeville-generator.ts)
const PODIUM = { length: 45, width: 30 }

export function computeAbbevilleSiteLayout(option: DesignOption): SiteLayout {
  const elements: PlacedElement[] = []

  // ── 1. Podium (ground floor) ──────────────────────────────────────

  elements.push({
    id: 'abb-podium',
    type: 'amenity_block',
    x: 0, y: 0,
    width: PODIUM.length, depth: PODIUM.width, height: 4.5,
    floor: 'ground',
    label: 'Podium — Lobby, Gym, Retail, Restaurant',
    rationale: 'Full ground-floor podium with all guest amenities and services',
  })

  // ── 2. Podium zone overlays ───────────────────────────────────────

  elements.push({
    id: 'abb-lobby',
    type: 'amenity_block',
    x: 15, y: 1,
    width: 15, depth: 8, height: 0.2,
    floor: 'ground',
    label: 'Lobby & Reception — 130 m²',
    rationale: 'Central lobby facing main entrance from Worthing Main Road',
  })

  elements.push({
    id: 'abb-restaurant',
    type: 'amenity_block',
    x: 0, y: 1,
    width: 14, depth: 20, height: 0.2,
    floor: 'ground',
    label: 'Restaurant & Bar — 280 m²',
    rationale: 'Sea-facing restaurant with outdoor terrace views to SW',
  })

  elements.push({
    id: 'abb-gym',
    type: 'amenity_block',
    x: 31, y: 1,
    width: 13, depth: 9, height: 0.2,
    floor: 'ground',
    label: 'Gym & Wellness — 93 m²',
    rationale: 'East-facing gym with morning light',
  })

  elements.push({
    id: 'abb-cowork',
    type: 'amenity_block',
    x: 31, y: 11,
    width: 13, depth: 9, height: 0.2,
    floor: 'ground',
    label: 'Co-working Lounge — 111 m²',
    rationale: 'Quiet co-working space away from restaurant noise',
  })

  elements.push({
    id: 'abb-retail',
    type: 'amenity_block',
    x: 15, y: 10,
    width: 8, depth: 6, height: 0.2,
    floor: 'ground',
    label: 'Retail — 46 m²',
    rationale: 'Guest convenience store adjacent to lobby',
  })

  elements.push({
    id: 'abb-boh',
    type: 'amenity_block',
    x: 31, y: 21,
    width: 13, depth: 8, height: 0.2,
    floor: 'ground',
    label: 'BOH & Kitchen — 167 m²',
    rationale: 'Service area screened from guest circulation',
  })

  // ── 3. Pool deck — courtyard SW of building ───────────────────────

  elements.push({
    id: 'abb-pool-deck',
    type: 'pool_deck',
    x: 8, y: 32,
    width: 20, depth: 15, height: 0,
    floor: 'ground',
    label: 'Pool Deck — 300 m²',
    rationale: 'Central courtyard between building and beach direction (SW)',
  })

  elements.push({
    id: 'abb-pool',
    type: 'pool',
    x: 11, y: 35,
    width: 15, depth: 8, height: 0,
    floor: 'ground',
    label: 'Pool — 120 m²',
    rationale: 'Main pool oriented E-W to catch afternoon sun',
  })

  // ── 4. Entrance from Worthing Main Road (south) ───────────────────

  elements.push({
    id: 'abb-entrance',
    type: 'entrance',
    x: 18, y: -8,
    width: 8, depth: 10, height: 0,
    floor: 'ground',
    label: 'Main Entrance — Worthing Main Rd',
    rationale: 'Vehicular arrival from Worthing Main Road (south)',
  })

  elements.push({
    id: 'abb-entrance-plant-w',
    type: 'landscape',
    x: 13, y: -6,
    width: 4, depth: 8, height: 0,
    floor: 'ground',
    label: 'Entrance Planting — West',
    rationale: 'Tropical planting framing guest arrival',
  })

  elements.push({
    id: 'abb-entrance-plant-e',
    type: 'landscape',
    x: 27, y: -6,
    width: 4, depth: 8, height: 0,
    floor: 'ground',
    label: 'Entrance Planting — East',
    rationale: 'Tropical planting framing guest arrival',
  })

  // ── 5. Parking — east side ────────────────────────────────────────

  elements.push({
    id: 'abb-parking',
    type: 'parking',
    x: 35, y: 5,
    width: 15, depth: 20, height: 0,
    floor: 'ground',
    label: 'Parking — 17 Spaces',
    rationale: 'Surface parking on east side, 0.28 spaces/key',
  })

  // ── 6. Service yard — NE corner ───────────────────────────────────

  elements.push({
    id: 'abb-service',
    type: 'service_yard',
    x: 40, y: 30,
    width: 10, depth: 8, height: 2,
    floor: 'ground',
    label: 'Service Yard — Waste, MEP, Delivery',
    rationale: 'Screened service area on NE corner, away from guest areas',
  })

  // ── 7. Landscape — boundary planting ──────────────────────────────

  elements.push({
    id: 'abb-land-w',
    type: 'landscape',
    x: -2, y: 0,
    width: 2, depth: 50, height: 0,
    floor: 'ground',
    label: 'West Boundary Planting',
    rationale: 'Native species for hurricane resilience and privacy',
  })

  elements.push({
    id: 'abb-land-n',
    type: 'landscape',
    x: 0, y: 48,
    width: 50, depth: 2, height: 0,
    floor: 'ground',
    label: 'North Boundary Planting',
    rationale: 'Buffer planting to private road',
  })

  elements.push({
    id: 'abb-land-e',
    type: 'landscape',
    x: 52, y: 0,
    width: 2, depth: 50, height: 0,
    floor: 'ground',
    label: 'East Boundary Planting',
    rationale: 'Buffer to side road',
  })

  // ── 8. Feature trees ──────────────────────────────────────────────

  const trees = [
    { x: 5, y: 35, label: 'Mahogany' },
    { x: 30, y: 38, label: 'Sea Grape' },
    { x: 2, y: 20, label: 'Flamboyant' },
    { x: 48, y: 25, label: 'Casuarina' },
    { x: 25, y: 45, label: 'Royal Palm' },
    { x: 10, y: -3, label: 'Coconut Palm' },
  ]

  trees.forEach((t, i) => {
    elements.push({
      id: `abb-tree-${i}`,
      type: 'tree',
      x: t.x, y: t.y,
      width: 3, depth: 3, height: 8,
      floor: 'ground',
      label: t.label,
      rationale: 'Native Caribbean species for hurricane resilience and shade',
    })
  })

  // ── 9. Covered walkway ────────────────────────────────────────────

  elements.push({
    id: 'abb-walkway',
    type: 'path',
    x: 18, y: 30,
    width: 8, depth: 3, height: 0,
    floor: 'ground',
    label: 'Covered Walkway — Podium to Pool',
    rationale: 'Weather-protected path connecting lobby to pool deck',
  })

  return {
    elements,
    circulation: [
      { from: 'abb-entrance', to: 'abb-lobby', path: 'direct' as const },
      { from: 'abb-lobby', to: 'abb-pool-deck', path: 'covered' as const },
      { from: 'abb-lobby', to: 'abb-restaurant', path: 'direct' as const },
    ],
    compliance: [
      { rule: 'Site coverage', status: 'pass' as const, value: (PODIUM.length * PODIUM.width) / 3036, limit: 0.50 },
      { rule: 'Building height', status: 'pass' as const, value: 20.5, limit: 20.5 },
      { rule: 'Parking ratio', status: 'pass' as const, value: 17 / 60, limit: 0.25 },
    ],
    designNarrative: '4 identical towers on ground-floor podium, staggered for SW sea views and Caribbean trade wind cross-ventilation. Building group rotated 30° per iR Architecture precedent. Entrance from Worthing Main Road (south), pool courtyard SW of building.',
  }
}
