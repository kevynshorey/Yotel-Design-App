import type { LandAllocation, PlanningRules } from '../types'

/**
 * Mt Brevitor Estates — Site Configuration v3
 * REVISED: X Range relocated to 6-acre agricultural parcel within farm zone
 * Cluster F (50 units) added in freed NW zone
 * Cluster G (50 units) added on eastern cleared hilltop south section (Phase 4 alongside E)
 * Total: 485 units across 7 clusters on 120 acres
 */

export const SITE = {
  name: 'Mt Brevitor Estates',
  location: 'Mount Brevitor, St Peter, Barbados',
  parish: 'St Peter',
  nearestTown: 'Speightstown',
  grossArea: 132.61,
  developableArea: 110.09,
  referenceArea: 120,
  gullyArea: 22.52,
  phase1: { lots: '1C & 1D', acres: 15.27, priceUSD: 1_250_000, perSf: 1.88 },
  stage2: { lots: 'A through K', grossAcres: 117.34, landAcres: 94.82, gullyAcres: 22.52, priceUSD: 3_375_000, perSf: 0.66 },
  totalLandCostUSD: 4_625_000,
  totalLandCostBBD: 9_250_000,
  vuemontComparable: {
    name: 'Vuemont Country Estate',
    location: 'Mount Brevitor, St Peter (adjacent)',
    acres: 39, units: 35,
    pricing: {
      twoBedApt: { sf: 1135, priceUSD: 295_000, perSfBBD: 520 },
      twoBedVilla: { sf: 1122, priceUSD: 350_000, perSfBBD: 624 },
      threeBedVilla: { sfMin: 1218, sfMax: 1560, priceUSD: 355_000 },
    },
  },
  layout: 'linear-corridor' as const,
  primaryAccess: 'Single gated entry from north (French Village / Mount Brevitor Road off Ronald Mapp Hwy H1)',
  loopRoadKm: 2.5,
  carriageway: 8,
  walkabilityTarget: 10,
  terrain: 'North-entry estate: open agricultural parkland (NW, ~55ac) grading to elevated cleared hilltop (E, ~65ac — existing brush/weed growth to be cleared, revealing panoramic 270° Caribbean and east-coast views). Existing plantation-era reservoir in north-central open area. White Hall Plantation heritage at south boundary. Ronald Mapp Hwy H1 frontage on west.',
  tradeWindDirection: 'NE to SW',
  coastDirection: 'west',
  existingWaterBody: {
    type: 'plantation_reservoir' as const,
    location: 'north-central open parkland',
    estimatedSizeM2: 1200,  // ~50m × 25m approximate
    designRole: 'Community hub focal point — faces hub plaza, landscape centrepiece',
  },
  existingHeritageBuilding: {
    type: 'plantation_building' as const,
    location: 'central parkland area',
    designRole: 'Restore as Estate Club / concierge / heritage anchor',
    condition: 'existing structure — survey required',
  },
  southernHeritageAnchor: {
    name: 'White Hall Plantation Yard',
    location: 'southern boundary, on H1',
    designRole: 'Heritage narrative anchor for southern clusters and X Range zone',
  },
} as const

// ── Land Allocation v2 (X Range moved to farm zone) ────────────────────────

export const LAND_ALLOCATION: LandAllocation[] = [
  { component: 'Residential Clusters A-E, G', acresMin: 65, acresMax: 72, pctOfSiteMin: 54, pctOfSiteMax: 60, phases: [1,2,3,4], notes: '435 units across 5 original clusters + 50 units Cluster G (eastern cleared hilltop south section, Phase 4). Density gradient: hub → perimeter. Cluster G between D (edge) and E (deep premium) on cleared hilltop.' },
  { component: 'Cluster F (SW, White Hall heritage corridor)', acresMin: 7, acresMax: 8, pctOfSiteMin: 6, pctOfSiteMax: 7, phases: [2,3], notes: '50 mid-range units. YOTEL-ready zone. South-west social district near White Hall Plantation heritage and X Range.' },
  { component: 'Farm + X Range District', acresMin: 17, acresMax: 19, pctOfSiteMin: 14, pctOfSiteMax: 16, phases: [1,2], notes: 'Integrated zone: 17ac farm with X Range on 6ac designated agricultural parcel (southern strip, adjacent to White Hall Plantation Yard). One main building. Walk-to destination ~10min from hub. X Range oriented east, downwind from NE trade winds.' },
  { component: 'Community Hub', acresMin: 4, acresMax: 5, pctOfSiteMin: 3, pctOfSiteMax: 4, phases: [1,2], notes: 'Central location. Medical, supermarket, pickleball, pool, gym, community hall.' },
  { component: 'Green Infrastructure', acresMin: 5, acresMax: 6, pctOfSiteMin: 4, pctOfSiteMax: 5, phases: [1], notes: '2-3 MW agrivoltaic solar (south-facing slope), water treatment, battery.' },
  { component: 'Roads and Circulation', acresMin: 10, acresMax: 12, pctOfSiteMin: 8, pctOfSiteMax: 10, phases: [1,2,3,4], notes: 'Boulevard enters from north gate, curves SE to hub at reservoir, then branches to clusters. Loop road 2.5km. RFID-controlled collector roads to each cluster.' },
  { component: 'Green Space and Buffers', acresMin: 10, acresMax: 13, pctOfSiteMin: 8, pctOfSiteMax: 11, phases: [1,2,3,4], notes: 'Landscape buffers, trails, gully edge treatments. Noise buffer between X Range and residential.' },
  { component: 'Commercial / Retail Lots', acresMin: 3, acresMax: 4, pctOfSiteMin: 3, pctOfSiteMax: 3, phases: [3,4], notes: 'Near gate/entry. Leased commercial lots.' },
  { component: 'Reserve / Contingency', acresMin: 3, acresMax: 5, pctOfSiteMin: 3, pctOfSiteMax: 4, phases: [4], notes: 'Reduced from 8ac (X Range freed NW land). Held for future expansion.' },
  { component: 'Gully (non-buildable)', acresMin: 22.52, acresMax: 22.52, pctOfSiteMin: 17, pctOfSiteMax: 17, phases: [], notes: 'Environmental corridor. Green buffer east edge. Farm drainage.' },
]

// ── Zone Placement Logic (research-based) ──────────────────────────────────

export const ZONE_PLACEMENT = {
  communityHub: {
    position: 'north-central, facing plantation reservoir',
    rationale: 'Existing plantation-era reservoir is the natural focal point. Hub plaza faces the water body. The reservoir provides immediate landscape amenity without capex. All 6 clusters within 10-min walk.',
  },
  farmAndXRange: {
    position: 'south, agricultural strip adjacent to White Hall heritage corridor',
    rationale: 'Southern parkland strip (~6-8ac cleared agricultural land) adjacent to White Hall Plantation Yard. X Range driving range oriented east (downwind from NE trade winds — noise and balls carried away from residential). Heritage narrative connection to plantation era. Walk-to from Cluster F and hub (~10min). White Hall heritage integration opportunity.',
    noiseBuffer: '200m+ from nearest residential cluster (B). Green buffer + gully between.',
    agriculturalParcel: '6-acre designated parcel requires conversion consent for X Range building. Fallback: relocate to simulator-based facility if consent denied.',
  },
  premiumHilltop: {
    position: 'east, elevated cleared hilltop',
    rationale: 'Elevated hilltop occupies eastern half of site (~65ac — existing brush/weed trees to be cleared, no mature forest to preserve). Best west-facing Caribbean sea views with unobstructed sightlines once cleared. 270° panoramic outlook. Maximum trade wind cooling from NE. Lowest density (3-5/ac). Privacy from boundary. Three hilltop clusters occupy this zone: Cluster D (upper hilltop edge — transition zone), Cluster G (The Hilltop — south section, cleared elevated ground, 50 units, panoramic 270° views, Phase 4), and Cluster E (The Estate — deep hilltop premium, 40 units, highest elevation, Phase 4). Clusters G and E delivered together in Phase 4, forming a connected hilltop precinct linked by trail.',
  },
  entryZone: {
    position: 'north, near gate (French Village / Mt Brevitor Road)',
    rationale: 'First impressions from northern gate. Cluster A is the arrival sequence. Highest density (7-8/ac). Phase 1 priority. Model home. Walking distance to hub and reservoir.',
  },
  clusterF: {
    position: 'south-west, social district near White Hall heritage corridor',
    rationale: 'South-western zone adjacent to White Hall Plantation Yard heritage corridor. Mid-range 2-3 bed townhouses. Can pivot to YOTEL serviced apartments if brand deal closes. Proximity to X Range and farm district provides lifestyle amenity.',
  },
  solar: {
    position: 'south-facing lower slope',
    rationale: 'Barbados at 13°N latitude — panels face south at ~15° tilt. Lower elevation for maximum sun hours. Agrivoltaic: dual-use with crops underneath.',
  },
  waterTreatment: {
    position: 'south-east, near gully, downslope',
    rationale: 'WHO recommends 100-150m from residential. Gravity flow downslope. Treated water discharge to gully. Near farm for irrigation reuse.',
  },
  commercial: {
    position: 'south, near gate entry',
    rationale: 'Visible from main road. Captures pass-through traffic. Phase 3-4 delivery.',
  },
} as const

// ── Planning Rules ─────────────────────────────────────────────────────────

export const PLANNING: PlanningRules = {
  jurisdiction: 'Barbados',
  parish: 'St Peter',
  eiaRequired: true,
  eiaEstimateMonths: [6, 12],
  agriculturalConversionRequired: true,
  maxCoverage: 0.50,
  maxHeightMetres: 12.0,
  maxStoreys: 3,
  hurricaneRating: true,
  stormwaterDesign: '1-in-50-year event',
  setbacks: { side: 1.83, rear: 3.0, road: 9.75 },
}
