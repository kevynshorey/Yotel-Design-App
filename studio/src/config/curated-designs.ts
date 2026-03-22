/**
 * 7 Curated "Kevyn YOTEL Designs" — architect-quality preset options
 * for a 130-key dual-brand hotel (YOTEL + YOTELPAD) at Carlisle Bay,
 * Bridgetown, Barbados.
 *
 * Site: ~5,965m2 gross, ~3,600m2 buildable (~80m EW x 49m NS).
 * Constraints: 6 storeys max, 22m height, 50% coverage, 1.83m setbacks.
 * Programme: 2 buildings (amenity block south + residential block north),
 *            pool deck central, rooftop bar, recording/podcast studios.
 */

import type { FormType, Wing } from '@/engine/types'

export interface CuratedDesign {
  id: string
  name: string
  subtitle: string
  description: string
  concept: string
  formType: FormType
  storeys: number
  yotelKeys: number
  padKeys: number
  totalKeys: number
  wings: Wing[]
  floorProgramme: {
    ground: string[]
    typical_yt: string[]
    typical_pad: string[]
    rooftop: string[]
  }
  amenityBlock: {
    footprint: { length: number; width: number }
    storeys: number
    spaces: string[]
  }
  poolDeck: {
    poolSize: { length: number; width: number }
    cabanas: number
    loungers: number
    swimUpBar: boolean
    landscapePercent: number
  }
  estimatedGFA: number
  estimatedCoverage: number
  sustainabilityFeatures: string[]
  architecturalStyle: string
  keyAdvantage: string
}

// ---------------------------------------------------------------------------
// Design 1 — BAR "Coastal Bar"
// ---------------------------------------------------------------------------
const coastalBar: CuratedDesign = {
  id: 'kevyn-1-coastal-bar',
  name: 'Coastal Bar',
  subtitle: 'Classic efficiency, maximum views',
  description:
    'A single east-west bar building positioned at the north of the site, maximising the ocean-facing west facade. The simple rectangular plan delivers the highest structural efficiency and lowest construction cost per key while giving every YOTEL room a sea view or courtyard outlook.',
  concept:
    'The Coastal Bar draws on the Caribbean tradition of the long, low oceanfront hotel — a clean horizontal datum against the sky. The 56m-long west facade is a continuous ribbon of floor-to-ceiling glass and sliding louvred screens, giving 96 YOTEL rooms direct sunset views across Carlisle Bay. PAD residences occupy the top two floors with private balconies. The amenity pavilion anchors the south edge near Bay Street, framing a generous pool courtyard between the two volumes.',
  formType: 'BAR',
  storeys: 6,
  yotelKeys: 96,
  padKeys: 34,
  totalKeys: 130,
  wings: [
    { id: 'bar-main', label: 'Main Bar', x: 0, y: 0, length: 56, width: 14.5, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Facilities', 'MEP Plant', 'Loading Dock'],
    typical_yt: ['32 YOTEL rooms per floor (floors 1-3)', 'Central corridor double-loaded', 'Laundry chute', 'Ice/vending alcove'],
    typical_pad: ['17 PAD units per floor (floors 4-5)', 'Studios + 1-beds', 'Shared lounge at corridor end', 'Private balconies west'],
    rooftop: ['Rooftop Bar & Lounge (280m2)', '3 plunge pools', 'DJ booth', 'Prep kitchen', '270-degree views'],
  },
  amenityBlock: {
    footprint: { length: 24, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 20, width: 9 },
    cabanas: 6,
    loungers: 28,
    swimUpBar: true,
    landscapePercent: 25,
  },
  estimatedGFA: 6550,
  estimatedCoverage: 0.37,
  sustainabilityFeatures: [
    'Cross-ventilation from NE trade winds through operable louvres',
    'Roof-mounted PV array (180m2, ~54 kWp)',
    'Rainwater harvesting for landscape irrigation',
    'Low-e glazing with external aluminium brise-soleil',
    'Salt-chlorinated pool system (no chemical chlorine)',
    'LED lighting throughout with daylight sensors',
    'LEED Silver target — passive-first strategy',
  ],
  architecturalStyle: 'Contemporary Caribbean Modernism — clean horizontal lines, deep overhangs, louvred screens',
  keyAdvantage: 'Lowest construction cost per key due to simple rectangular geometry and repetitive structure',
}

// ---------------------------------------------------------------------------
// Design 2 — L "Courtyard L"
// ---------------------------------------------------------------------------
const courtyardL: CuratedDesign = {
  id: 'kevyn-2-courtyard-l',
  name: 'Courtyard L',
  subtitle: 'Protected pool courtyard',
  description:
    'An L-shaped residential block wraps the pool deck on two sides, creating a sheltered courtyard that captures the prevailing NE trade winds while blocking the hot afternoon sun. The amenity pavilion closes the south edge, producing a three-sided outdoor room focused on the pool.',
  concept:
    'The Courtyard L is the recommended option for balancing views, microclimate, and buildability. The longer west wing (48m) faces Carlisle Bay; the shorter north wing (30m) returns inland, shading the pool deck from late-afternoon sun. The L-form generates a sheltered courtyard microclimate — cooler by 2-3 degrees C than an exposed deck — while maintaining unobstructed ocean views from every west-facing room. The 14m wing width accommodates double-loaded corridors for both YOTEL and PAD floor plates without structural transitions.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 96,
  padKeys: 34,
  totalKeys: 130,
  wings: [
    { id: 'l-west', label: 'West Wing (Ocean)', x: 0, y: 0, length: 48, width: 14, direction: 'NS', floors: 6 },
    { id: 'l-north', label: 'North Wing', x: 0, y: 0, length: 30, width: 14, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Facilities', 'MEP Plant', 'Service Corridor'],
    typical_yt: ['32 YOTEL rooms per floor (floors 1-3)', 'West wing: 20 sea-view rooms', 'North wing: 12 courtyard-view rooms', 'Connecting node at L-junction'],
    typical_pad: ['17 PAD units per floor (floors 4-5)', 'West wing: 11 sea-view PADs', 'North wing: 6 garden-view PADs', 'Premium corner units at junction'],
    rooftop: ['Rooftop Bar & Lounge (300m2)', '3 plunge pools', 'DJ booth', '270-degree panorama from L-corner', 'Green roof on north wing'],
  },
  amenityBlock: {
    footprint: { length: 22, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 18, width: 9 },
    cabanas: 5,
    loungers: 24,
    swimUpBar: true,
    landscapePercent: 28,
  },
  estimatedGFA: 6400,
  estimatedCoverage: 0.42,
  sustainabilityFeatures: [
    'L-form shelters courtyard — passive cooling reduces HVAC load 15%',
    'Green roof on north wing (sedum + native species)',
    'Cross-ventilation corridors at L-junction',
    'Roof PV array (160m2, ~48 kWp)',
    'Greywater recycling for toilet flushing and irrigation',
    'Thermally broken aluminium frames with Low-e IGU',
    'LEED Silver target — bioclimatic courtyard design',
  ],
  architecturalStyle: 'Tropical Courtyard Modern — L-plan framing views, deep balconies, planted screens',
  keyAdvantage: 'Best balance of ocean views, sheltered pool microclimate, and structural simplicity',
}

// ---------------------------------------------------------------------------
// Design 3 — U "Bay View U"
// ---------------------------------------------------------------------------
const bayViewU: CuratedDesign = {
  id: 'kevyn-3-bay-view-u',
  name: 'Bay View U',
  subtitle: 'Embracing the ocean',
  description:
    'A U-shaped residential block opens west toward Carlisle Bay, wrapping the central pool deck on three sides. Every wing gets ocean views through the open west end. The form creates a resort-scale courtyard that channels trade winds while providing intimate scale at ground level.',
  concept:
    'The Bay View U is the quintessential Caribbean resort typology reimagined for a modern dual-brand hotel. Three wings — north (28m), east (42m), and south (28m) — embrace a landscaped pool courtyard that opens dramatically toward the ocean. The east wing houses the primary corridor spine; the two flanking wings create a generous 28m-wide view corridor framing Carlisle Bay. The amenity pavilion sits beyond the south wing, connected by a covered walkway. PAD residences crown the upper floors with wrap-around balconies at the U-corners.',
  formType: 'U',
  storeys: 6,
  yotelKeys: 90,
  padKeys: 40,
  totalKeys: 130,
  wings: [
    { id: 'u-north', label: 'North Wing', x: 0, y: 28, length: 28, width: 13, direction: 'EW', floors: 6 },
    { id: 'u-east', label: 'East Wing (Spine)', x: 15, y: 0, length: 42, width: 13, direction: 'NS', floors: 6 },
    { id: 'u-south', label: 'South Wing', x: 0, y: 0, length: 28, width: 13, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Areas', 'MEP Plant', 'Loading', 'Pool Plant Room'],
    typical_yt: ['30 YOTEL rooms per floor (floors 1-3)', 'North wing: 9 rooms', 'East wing: 12 rooms', 'South wing: 9 rooms'],
    typical_pad: ['20 PAD units per floor (floors 4-5)', 'Premium corner suites at U-junctions', 'Wrap-around balconies', 'Higher PAD ratio for revenue optimisation'],
    rooftop: ['Rooftop Bar & Lounge (320m2)', '3 plunge pools along west edge', 'DJ booth', 'Panoramic infinity bar facing ocean', 'Event lawn on east wing roof'],
  },
  amenityBlock: {
    footprint: { length: 24, width: 18 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 22, width: 10 },
    cabanas: 6,
    loungers: 30,
    swimUpBar: true,
    landscapePercent: 30,
  },
  estimatedGFA: 6200,
  estimatedCoverage: 0.46,
  sustainabilityFeatures: [
    'U-form channels NE trade winds through courtyard — stack-effect ventilation',
    'Shaded courtyard reduces urban heat island effect',
    'Extensive green roofs on flanking wings',
    'Solar PV on east wing roof (140m2, ~42 kWp)',
    'Rainwater collection from three-sided roof catchment',
    'Natural daylighting to all corridors via courtyard glazing',
    'LEED Silver target — passive courtyard cooling',
  ],
  architecturalStyle: 'Resort Modern — open U-form, layered terraces stepping down to pool, coral stone base',
  keyAdvantage: 'Highest PAD ratio (31%) and premium corner units generate strongest residential revenue',
}

// ---------------------------------------------------------------------------
// Design 4 — C "Island Cloister"
// ---------------------------------------------------------------------------
const islandCloister: CuratedDesign = {
  id: 'kevyn-4-island-cloister',
  name: 'Island Cloister',
  subtitle: 'Internal garden courtyard',
  description:
    'A C-shaped plan with a connector wing on the west side creates an enclosed garden courtyard — a private tropical world screened from the street. The ocean-facing connector houses the restaurant and rooftop bar, making the public face of the hotel its most spectacular.',
  concept:
    'The Island Cloister inverts the typical resort plan: instead of opening to the ocean, it creates an internal paradise. The C-form (north wing, south wing, and a lower west connector) wraps a lush 450m2 garden courtyard with the pool as its centrepiece. The west connector — just 2 storeys — houses the ground-floor restaurant with ocean-terrace dining and becomes the base for the rooftop bar above. Arriving guests pass through the amenity pavilion on Bay Street, cross the garden courtyard, and discover the pool and ocean beyond. The journey from street to sea is a curated sequence of compression and release.',
  formType: 'C',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 30,
  totalKeys: 130,
  wings: [
    { id: 'c-north', label: 'North Wing', x: 0, y: 32, length: 32, width: 13, direction: 'EW', floors: 6 },
    { id: 'c-south', label: 'South Wing', x: 0, y: 0, length: 32, width: 13, direction: 'EW', floors: 6 },
    { id: 'c-west', label: 'West Connector', x: 0, y: 0, length: 32, width: 10, direction: 'NS', floors: 2 },
  ],
  floorProgramme: {
    ground: ['BOH (north + south wings)', 'Restaurant & Ocean Terrace (west connector)', 'MEP Plant', 'Loading'],
    typical_yt: ['34 YOTEL rooms per floor (floors 1-3)', 'North wing: 17 rooms', 'South wing: 17 rooms', 'Central corridor with courtyard views'],
    typical_pad: ['15 PAD units per floor (floors 4-5)', 'North wing: 8 units', 'South wing: 7 units', 'Ocean-corner penthouses'],
    rooftop: ['Rooftop Bar on west connector (240m2)', 'Full ocean panorama', 'Plunge pools (2)', 'Green roofs on main wings', 'DJ booth + event space'],
  },
  amenityBlock: {
    footprint: { length: 24, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Cafe & Grab-Go', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 18, width: 8 },
    cabanas: 4,
    loungers: 22,
    swimUpBar: false,
    landscapePercent: 35,
  },
  estimatedGFA: 6350,
  estimatedCoverage: 0.47,
  sustainabilityFeatures: [
    'Enclosed courtyard creates microclimate 3-4C cooler than ambient',
    'Cross-ventilation through courtyard openings at ground level',
    'Extensive green roofs on all three wings',
    'Courtyard rainwater garden for stormwater management',
    'Solar PV on south-facing north wing roof (120m2, ~36 kWp)',
    'Mass timber connector wing (lower embodied carbon)',
    'LEED Gold target — biophilic courtyard design',
  ],
  architecturalStyle: 'Caribbean Cloister — enclosed courtyard, coral stone walls, timber screens, lush planting',
  keyAdvantage: 'Strongest sense of place and arrival experience; garden courtyard creates premium atmosphere',
}

// ---------------------------------------------------------------------------
// Design 5 — BAR_NS "Twin Tower"
// ---------------------------------------------------------------------------
const twinTower: CuratedDesign = {
  id: 'kevyn-5-twin-tower',
  name: 'Twin Tower',
  subtitle: 'North-south bar with separate amenity pavilion',
  description:
    'A north-south oriented bar building maximises dual-aspect rooms: west rooms face the ocean, east rooms face the sunrise and harbour. The narrow 14m plan ensures every room has natural cross-ventilation from the prevailing NE trade winds. A separate amenity pavilion to the south creates a distinct arrival identity.',
  concept:
    'The Twin Tower reinterprets the classic resort slab as a slender north-south bar that turns its broad face to the ocean. At just 14m wide, the plan is the most efficient of all seven options — single-aspect rooms are eliminated, and every unit benefits from through-ventilation. The bar sits at the north-east of the buildable area, leaving the entire western and southern zones free for the pool deck and amenity pavilion. The result is the most generous outdoor amenity space of any option, with a 22m lap pool and an expansive sun deck.',
  formType: 'BAR_NS',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 30,
  totalKeys: 130,
  wings: [
    { id: 'ns-main', label: 'Main Tower', x: 20, y: 0, length: 50, width: 14, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Facilities', 'MEP Plant', 'Loading Dock', 'Bike Store'],
    typical_yt: ['34 YOTEL rooms per floor (floors 1-3)', '17 ocean-view west rooms', '17 harbour-view east rooms', 'Central double-loaded corridor'],
    typical_pad: ['15 PAD units per floor (floors 4-5)', '8 ocean-view units', '7 harbour-view units', 'End-of-bar penthouses with dual aspect'],
    rooftop: ['Rooftop Bar & Lounge (300m2)', '3 plunge pools', 'DJ booth', '360-degree views from slender tower', 'Herb garden for rooftop kitchen'],
  },
  amenityBlock: {
    footprint: { length: 25, width: 18 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 22, width: 10 },
    cabanas: 6,
    loungers: 32,
    swimUpBar: true,
    landscapePercent: 22,
  },
  estimatedGFA: 5950,
  estimatedCoverage: 0.33,
  sustainabilityFeatures: [
    '100% dual-aspect rooms — maximum passive cooling potential',
    'NE trade wind cross-ventilation through operable windows',
    'Slender form minimises self-shading, maximises daylight',
    'Roof PV array (200m2, ~60 kWp) — largest of all options',
    'Rainwater harvesting for pool top-up and irrigation',
    'Ground-source heat pump for domestic hot water',
    'LEED Silver target — passive ventilation leadership',
  ],
  architecturalStyle: 'Caribbean Slender Tower — narrow bar, deep balconies, perforated screen cladding',
  keyAdvantage: '100% dual-aspect rooms with cross-ventilation; most generous outdoor amenity area',
}

// ---------------------------------------------------------------------------
// Design 6 — L "Sunset Terrace"
// ---------------------------------------------------------------------------
const sunsetTerrace: CuratedDesign = {
  id: 'kevyn-6-sunset-terrace',
  name: 'Sunset Terrace',
  subtitle: 'Stepped terraces facing west',
  description:
    'An L-shaped building with the west-facing wing stepping down from 6 storeys (PAD) to 4 storeys (YOTEL), creating cascading planted terraces that face the sunset. The stepping reduces perceived mass and creates outdoor living space on every terrace level.',
  concept:
    'The Sunset Terrace takes the L-form and sculpts it into a cascade of green terraces stepping toward Carlisle Bay. The south wing runs 44m east-west at a full 6 storeys, housing the vertical circulation core and PAD residences on upper floors. The west wing steps down from 6 to 4 storeys, creating three levels of landscaped roof terraces (floors 5, 4, and the main rooftop). Each terrace is a private garden — planted with bougainvillea, frangipani, and native grasses — visible from the rooms above. The effect from the ocean is a green hillside, not a concrete wall. YOTEL rooms on the lower west wing floors get direct terrace access.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 92,
  padKeys: 38,
  totalKeys: 130,
  wings: [
    { id: 'st-south', label: 'South Wing (Full Height)', x: 0, y: 0, length: 44, width: 14, direction: 'EW', floors: 6 },
    { id: 'st-west', label: 'West Wing (Stepped)', x: 0, y: 0, length: 34, width: 14, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Areas', 'MEP Plant', 'Loading'],
    typical_yt: ['31 YOTEL rooms per floor (floors 1-3)', 'South wing: 18 rooms', 'West wing: 13 rooms (terraced floors)', 'Terrace-access rooms on west wing'],
    typical_pad: ['19 PAD units per floor (floors 4-5)', 'South wing: 12 units full-height', 'West wing: 7 units (floor 4 only, terrace above)', 'Penthouse terraces with plunge pools'],
    rooftop: ['Rooftop Bar on south wing (260m2)', 'Cascading terrace gardens on west wing', '2 plunge pools', 'DJ booth', 'Sunset viewing deck'],
  },
  amenityBlock: {
    footprint: { length: 22, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 18, width: 9 },
    cabanas: 5,
    loungers: 26,
    swimUpBar: true,
    landscapePercent: 30,
  },
  estimatedGFA: 6100,
  estimatedCoverage: 0.43,
  sustainabilityFeatures: [
    'Cascading green terraces — 400m2+ additional planted area',
    'Terraces provide natural shading to rooms below (reduce cooling load 20%)',
    'Intensive green roofs with integrated irrigation from greywater',
    'Biodiversity habitat — native species planting plan',
    'Reduced visual mass from ocean (heritage zone sensitivity)',
    'Solar PV on south wing roof (150m2, ~45 kWp)',
    'LEED Gold target — biophilic + green roof credits',
  ],
  architecturalStyle: 'Tropical Terraced — stepped massing, cascading gardens, timber balustrades, living walls',
  keyAdvantage: 'Most visually striking design; green terraces reduce perceived bulk and target LEED Gold',
}

// ---------------------------------------------------------------------------
// Design 7 — BAR "Modular Micro"
// ---------------------------------------------------------------------------
const modularMicro: CuratedDesign = {
  id: 'kevyn-7-modular-micro',
  name: 'Modular Micro',
  subtitle: 'Compact 5-storey modular bar, lowest cost',
  description:
    'A compact 5-storey east-west bar designed for modular off-site construction. Standardised 3.6m structural grid, prefabricated bathroom pods, and a simplified MEP strategy deliver the lowest total development cost. The reduced height (18.5m) eases planning approval near the UNESCO heritage zone.',
  concept:
    'The Modular Micro strips the hotel to its essential elements: sleep, eat, swim, work. A compact 52m x 15m bar at just 5 storeys keeps the building within low-rise territory — the friendliest profile for Barbados planning authorities and the UNESCO heritage buffer zone. The secret is modular construction: 130 room modules manufactured in a Caribbean factory (Trinidad or Jamaica), shipped to site, and craned into place in 8 weeks. Bathroom pods, headboard units, and corridor sections arrive pre-finished. The amenity pavilion uses the same modular system. Construction programme: 14 months (vs 20+ for conventional). Cost saving: 12-15% on structure and fit-out.',
  formType: 'BAR',
  storeys: 5,
  yotelKeys: 95,
  padKeys: 35,
  totalKeys: 130,
  wings: [
    { id: 'mod-main', label: 'Modular Bar', x: 0, y: 0, length: 52, width: 15, direction: 'EW', floors: 5 },
  ],
  floorProgramme: {
    ground: ['BOH', 'Housekeeping', 'Staff Facilities', 'MEP Plant', 'Module Storage'],
    typical_yt: ['32 YOTEL rooms per floor (floors 1-2)', 'Standardised 3.6m module grid', 'Pre-fitted bathroom pods', 'Corridor modules with integrated services'],
    typical_pad: ['12 PAD units per floor (floors 3-4)', 'Double-width modules (7.2m)', 'Pre-fitted kitchenette pods', 'Balcony modules bolted on-site'],
    rooftop: ['Rooftop Bar & Lounge (250m2)', '2 plunge pools', 'DJ booth', 'Container-bar aesthetic', 'Solar PV canopy over lounge'],
  },
  amenityBlock: {
    footprint: { length: 22, width: 18 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Gym', 'Business Centre', 'Public WC', 'Luggage Store',
      'Recording Studio', 'Podcast Studio', 'Co-Working Space', 'Private Offices', 'Meeting Room', 'Gaming Lounge',
    ],
  },
  poolDeck: {
    poolSize: { length: 18, width: 8 },
    cabanas: 4,
    loungers: 22,
    swimUpBar: false,
    landscapePercent: 20,
  },
  estimatedGFA: 5600,
  estimatedCoverage: 0.35,
  sustainabilityFeatures: [
    'Modular construction — 60% less site waste vs conventional',
    'Factory-controlled quality — fewer defects, less rework',
    'Shorter construction programme — reduced site emissions',
    'Standardised modules enable future disassembly and reuse',
    'Solar PV canopy on rooftop (130m2, ~39 kWp)',
    'Pre-insulated modules exceed building code U-values',
    'LEED Silver target — construction waste reduction credits',
  ],
  architecturalStyle: 'Industrial Caribbean — expressed module grid, Corten steel accents, timber screens, raw concrete',
  keyAdvantage: 'Lowest total development cost (12-15% saving); fastest construction programme (14 months)',
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const CURATED_DESIGNS: CuratedDesign[] = [
  coastalBar,
  courtyardL,
  bayViewU,
  islandCloister,
  twinTower,
  sunsetTerrace,
  modularMicro,
]

/** Lookup a curated design by its id. */
export function getCuratedDesign(id: string): CuratedDesign | undefined {
  return CURATED_DESIGNS.find(d => d.id === id)
}

/** All available curated design IDs. */
export const CURATED_DESIGN_IDS = CURATED_DESIGNS.map(d => d.id) as readonly string[]
