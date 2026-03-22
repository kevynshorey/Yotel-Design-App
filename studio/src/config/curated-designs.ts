/**
 * 7 Curated "Kevyn YOTEL Designs" — architect-quality preset options
 * for a 130+ key dual-brand hotel (YOTEL + YOTELPAD) at Carlisle Bay,
 * Bridgetown, Barbados.
 *
 * Site: ~5,965m2 gross, ~3,600m2 buildable (~80m EW x 49m NS).
 * Constraints: 6 storeys max, 22m height, 50% coverage, 1.83m setbacks.
 * Programme: 2 buildings (amenity block south + residential block north),
 *            pool deck central, rooftop bar/grill/pool, recording/podcast
 *            studios, sim racing, gym, grab-and-go market.
 *
 * Room sizing: Resort-standard YOTEL rooms ~19m2 (10-15% above 16.5m2 brand min).
 *              YOTELPAD: Studio 25m2, 1-bed 40m2, 2-bed 60m2.
 *
 * Every design: Bay Street (south) entrance, parking flanking gate,
 *               central Rixos-style pool, rooftop with bar/grill/raised pool.
 */

import type { FormType, Wing } from '@/engine/types'

/* ------------------------------------------------------------------ */
/*  Interface                                                          */
/* ------------------------------------------------------------------ */

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
    ground: string[]       // Bay Street entrance, Mission Control, Restaurant & Bar, Grab & Go, etc.
    first: string[]        // amenity block upper floor (gym, studios, sim racing, etc.)
    typical_yt: string[]   // YOTEL floors with resort-sized rooms (~19m2)
    typical_pad: string[]  // YOTELPAD floors
    rooftop: string[]      // Bar, Grill Kitchen, Raised Pool, Lounge, DJ area
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

  parking: {
    covered: number
    surface: number
    accessible: number
  }

  entrance: {
    orientation: 'south' | 'east' | 'west'
    street: string
    features: string[]
  }

  specialAmenities: string[]

  roomSizes: {
    yotelAvg: number     // m2
    padStudio: number    // m2
    padOneBed: number    // m2
    padTwoBed: number    // m2
  }

  estimatedGFA: number
  estimatedCoverage: number
  sustainabilityFeatures: string[]
  architecturalStyle: string
  keyAdvantage: string
}

/* ------------------------------------------------------------------ */
/*  Shared constants                                                   */
/* ------------------------------------------------------------------ */

const ROOM_SIZES = { yotelAvg: 19, padStudio: 25, padOneBed: 40, padTwoBed: 60 } as const

const BAY_STREET_ENTRANCE = {
  orientation: 'south' as const,
  street: 'Bay Street',
  features: [
    'Grand arrival portico facing Bay Street',
    'Covered drop-off with valet lane',
    'Parking courts flanking left and right of entrance gate',
    'Welcome bloc with Mission Control self check-in kiosks',
    'Luggage storage and porter station',
    'Direct sight-line through lobby to pool deck',
  ],
}

const SPECIAL_AMENITIES = [
  'Podcast Studio (~25m2, soundproofed, video-ready)',
  'Recording Studio (~45m2, professional-grade acoustic treatment)',
  'Business Centre (~40m2, hot desks + 2 private offices)',
  'Sim Racing Gaming Room (~50m2, 4+ full-motion sim rigs)',
  'Komyuniti Restaurant & Bar (ground floor, Bay Street frontage)',
  'Grab & Go Supermarket/Convenience (~30m2, snacks, essentials, souvenirs)',
  'Gym (minimum 80m2, cardio + free weights + stretch zone)',
  'Mission Control (YOTEL self check-in lobby)',
  'Komyuniti Lounge',
  'Luggage Storage',
  'Laundry Room',
]

const ROOFTOP_PROGRAMME = [
  'Rooftop Bar & Lounge',
  'Grill Kitchen (burgers, fries, snacks)',
  'Raised Swimming Pool / Plunge Pool (6m x 3m / 20ft x 10ft)',
  'Outdoor Seating & Lounge Area',
  'DJ Booth',
  'Sunset Viewing Deck',
]

/* ------------------------------------------------------------------ */
/*  Design 1 — BAR "Coastal Bar"                                       */
/* ------------------------------------------------------------------ */

const coastalBar: CuratedDesign = {
  id: 'kevyn-1-coastal-bar',
  name: 'Coastal Bar',
  subtitle: 'Classic efficiency, maximum views',
  description:
    'A single east-west bar building positioned at the north of the site, maximising the ocean-facing west facade. The simple rectangular plan delivers the highest structural efficiency and lowest construction cost per key while giving every YOTEL room a sea view or courtyard outlook. Resort-sized 19m2 rooms and a full rooftop programme with bar, grill kitchen, and raised pool.',
  concept:
    'The Coastal Bar draws on the Caribbean tradition of the long, low oceanfront hotel — a clean horizontal datum against the sky. The 74.5m-long west facade is a continuous ribbon of floor-to-ceiling glass and sliding louvred screens, giving 100 resort-sized YOTEL rooms (19m2 each) direct sunset views across Carlisle Bay. PAD residences occupy the fifth floor with private balconies. The amenity pavilion anchors the south edge near Bay Street, framing a generous Rixos-style pool courtyard between the two volumes. Guests arrive from Bay Street through a grand portico into Mission Control, with parking flanking the entrance gate. The ground-floor amenity block houses the restaurant and bar, grab-and-go market, and Komyuniti lounge, while the upper level holds the gym, recording studio, podcast studio, sim racing room, and business centre.',
  formType: 'BAR',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 32,
  totalKeys: 132,
  wings: [
    { id: 'bar-main', label: 'Main Bar', x: 1.83, y: 1.83, length: 74.5, width: 16.1, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant',
    ],
    first: [
      'Gym (85m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '36 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'Central corridor double-loaded',
      'Laundry chute + ice/vending alcove',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '32 PAD units on floor 5',
      'Mix of studios (25m2), 1-beds (40m2), 2-beds (60m2)',
      'Shared lounge at corridor end',
      'Private balconies west-facing',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge (280m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      '270-degree sunset views',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 20, width: 9 },
    cabanas: 6,
    loungers: 28,
    swimUpBar: true,
    landscapePercent: 25,
  },
  parking: { covered: 8, surface: 18, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 7100,
  estimatedCoverage: 0.38,
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

/* ------------------------------------------------------------------ */
/*  Design 2 — L "Courtyard L"                                         */
/* ------------------------------------------------------------------ */

const courtyardL: CuratedDesign = {
  id: 'kevyn-2-courtyard-l',
  name: 'Courtyard L',
  subtitle: 'Protected pool courtyard',
  description:
    'An L-shaped residential block wraps the pool deck on two sides, creating a sheltered courtyard that captures the prevailing NE trade winds while blocking the hot afternoon sun. The amenity pavilion closes the south edge, producing a three-sided outdoor room focused on the central Rixos-style pool. Resort-sized YOTEL rooms (19m2) and a fully programmed rooftop with bar, grill, and raised pool.',
  concept:
    'The Courtyard L is the recommended option for balancing views, microclimate, and buildability. The longer west wing (50m) faces Carlisle Bay; the shorter north wing (32m) returns inland, shading the pool deck from late-afternoon sun. The L-form generates a sheltered courtyard microclimate — cooler by 2-3 degrees C than an exposed deck — while maintaining unobstructed ocean views from every west-facing room. Guests arrive from Bay Street into a south-facing amenity pavilion housing Mission Control, the restaurant and bar, and grab-and-go market at ground level, with gym, studios, sim racing, and business centre above. Parking flanks the entrance gate on both sides.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 32,
  totalKeys: 132,
  wings: [
    { id: 'l-main', label: 'Main Wing (E-W)', x: 1.83, y: 1.83, length: 46.9, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'l-branch', label: 'Branch Wing (N-S)', x: 32.63, y: 1.83, length: 31.3, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant / Service Corridor',
    ],
    first: [
      'Gym (85m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '34 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'Main wing: 20 sea-view rooms',
      'Branch wing: 14 courtyard-view rooms',
      'Connecting node at L-junction',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '16 PAD units per floor (floors 5-6)',
      'Main wing: 10 sea-view PADs',
      'Branch wing: 6 garden-view PADs',
      'Premium corner units at L-junction',
      '32 PAD keys total across 2 floors',
    ],
    rooftop: [
      'Rooftop Bar & Lounge (300m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      '270-degree panorama from L-corner',
      'Green roof on north wing',
    ],
  },
  amenityBlock: {
    footprint: { length: 24, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 18, width: 9 },
    cabanas: 5,
    loungers: 24,
    swimUpBar: true,
    landscapePercent: 28,
  },
  parking: { covered: 8, surface: 16, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 7000,
  estimatedCoverage: 0.43,
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

/* ------------------------------------------------------------------ */
/*  Design 3 — U "Bay View U"                                          */
/* ------------------------------------------------------------------ */

const bayViewU: CuratedDesign = {
  id: 'kevyn-3-bay-view-u',
  name: 'Bay View U',
  subtitle: 'Embracing the ocean',
  description:
    'A U-shaped residential block opens west toward Carlisle Bay, wrapping the central Rixos-style pool deck on three sides. Every wing gets ocean views through the open west end. The form creates a resort-scale courtyard that channels trade winds while providing intimate scale at ground level. All 19m2 resort-sized YOTEL rooms plus full rooftop bar, grill, and raised pool.',
  concept:
    'The Bay View U is the quintessential Caribbean resort typology reimagined for a modern dual-brand hotel. Three wings — north (30m), east (44m), and south (30m) — embrace a landscaped pool courtyard that opens dramatically toward the ocean. The east wing houses the primary corridor spine; the two flanking wings create a generous 30m-wide view corridor framing Carlisle Bay. The amenity pavilion sits beyond the south wing on Bay Street, with parking flanking the entrance gate. Guests arrive from Bay Street through Mission Control, passing the restaurant and grab-and-go before discovering the pool courtyard and ocean beyond. PAD residences crown the upper floors with wrap-around balconies at the U-corners. The upper amenity floor houses the gym, recording studio, podcast studio, sim racing room, and business centre.',
  formType: 'U',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 30,
  totalKeys: 130,
  wings: [
    { id: 'u-south', label: 'South Wing', x: 1.83, y: 1.83, length: 21.7, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-north', label: 'North Wing', x: 1.83, y: 30.76, length: 21.7, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-east', label: 'East Connector', x: 7.43, y: 1.83, length: 45.03, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant / Pool Plant',
    ],
    first: [
      'Gym (90m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '36 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'South wing: 6 rooms', 'East connector: 20 rooms', 'North wing: 10 rooms',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '30 PAD units on floor 5',
      'Premium corner suites at U-junctions',
      'Wrap-around balconies on upper floors',
      'Mix of studios, 1-beds, and 2-beds',
      '30 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge (320m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      'Panoramic infinity bar facing ocean',
      'Event lawn on east wing roof',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (90m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 22, width: 10 },
    cabanas: 6,
    loungers: 30,
    swimUpBar: true,
    landscapePercent: 30,
  },
  parking: { covered: 6, surface: 16, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 7200,
  estimatedCoverage: 0.47,
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
  keyAdvantage: 'Highest PAD ratio and premium corner units generate strongest residential revenue',
}

/* ------------------------------------------------------------------ */
/*  Design 4 — C "Island Cloister"                                     */
/* ------------------------------------------------------------------ */

const islandCloister: CuratedDesign = {
  id: 'kevyn-4-island-cloister',
  name: 'Island Cloister',
  subtitle: 'Internal garden courtyard',
  description:
    'A C-shaped plan with a connector wing on the west side creates an enclosed garden courtyard — a private tropical world screened from the street. The ocean-facing connector houses the restaurant and rooftop bar, making the public face of the hotel its most spectacular. All YOTEL rooms at 19m2 resort standard, with full rooftop grill, raised pool, and bar programme.',
  concept:
    'The Island Cloister inverts the typical resort plan: instead of opening to the ocean, it creates an internal paradise. The C-form (north wing, south wing, and a lower west connector) wraps a lush 500m2 garden courtyard with the Rixos-style pool as its centrepiece. The west connector — just 2 storeys — houses the ground-floor restaurant with ocean-terrace dining and becomes the base for the rooftop bar above. Arriving guests enter from Bay Street through the south-facing amenity pavilion into Mission Control, with grab-and-go market and Komyuniti lounge at ground level. The upper amenity floor holds the gym, recording studio, podcast studio, sim racing room, and business centre. Guests cross the garden courtyard to discover the pool and ocean beyond. Parking flanks the Bay Street entrance gate.',
  formType: 'C',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 30,
  totalKeys: 130,
  wings: [
    { id: 'c-south', label: 'South Wing', x: 1.83, y: 1.83, length: 21.7, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'c-north', label: 'North Wing', x: 1.83, y: 30.76, length: 21.7, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'c-west', label: 'West Connector', x: 1.83, y: 1.83, length: 45.03, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar (+ ocean terrace on west connector)',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH (north + south wings) / MEP Plant',
    ],
    first: [
      'Gym (85m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '36 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'South wing: 6 rooms',
      'North wing: 10 rooms',
      'West connector: 20 rooms, central corridor with courtyard views',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '30 PAD units on floor 5',
      'South wing: 5 units',
      'North wing: 8 units',
      'West connector: 17 units, ocean-corner penthouses',
      '30 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar on west connector (260m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth + event space',
      'Full ocean panorama',
      'Green roofs on main residential wings',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 20, width: 9 },
    cabanas: 5,
    loungers: 24,
    swimUpBar: true,
    landscapePercent: 32,
  },
  parking: { covered: 6, surface: 14, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 7000,
  estimatedCoverage: 0.48,
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

/* ------------------------------------------------------------------ */
/*  Design 5 — BAR_NS "Twin Tower"                                     */
/* ------------------------------------------------------------------ */

const twinTower: CuratedDesign = {
  id: 'kevyn-5-twin-tower',
  name: 'Twin Tower',
  subtitle: 'North-south bar with separate amenity pavilion',
  description:
    'A north-south oriented bar building maximises dual-aspect rooms: west rooms face the ocean, east rooms face the sunrise and harbour. The narrow 14.5m plan ensures every room has natural cross-ventilation from the prevailing NE trade winds. A separate amenity pavilion to the south on Bay Street creates a distinct arrival identity. All rooms at 19m2 resort standard with rooftop bar, grill, and raised pool.',
  concept:
    'The Twin Tower reinterprets the classic resort slab as a slender north-south bar that turns its broad face to the ocean. At just 14.5m wide, the plan is the most efficient of all seven options — single-aspect rooms are eliminated, and every unit benefits from through-ventilation. The bar sits at the north-east of the buildable area, leaving the entire western and southern zones free for the Rixos-style pool deck and amenity pavilion. Guests arrive from Bay Street through the south-facing amenity block with Mission Control, restaurant and bar, and grab-and-go market at ground level. The upper floor houses the gym, recording and podcast studios, sim racing room, and business centre. Parking courts flank both sides of the Bay Street entrance gate.',
  formType: 'BAR',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 32,
  totalKeys: 132,
  wings: [
    { id: 'ns-main', label: 'Main Bar', x: 1.83, y: 1.83, length: 76.1, width: 16.1, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant / Bike Store',
    ],
    first: [
      'Gym (90m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '37 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      '19 ocean-view west rooms + 18 harbour-view east rooms',
      'Central double-loaded corridor',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '32 PAD units on floor 5',
      '16 ocean-view units + 16 harbour-view units',
      'End-of-bar penthouses with dual aspect',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge (300m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      '360-degree views from slender tower',
      'Herb garden for rooftop kitchen',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (90m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 22, width: 10 },
    cabanas: 6,
    loungers: 32,
    swimUpBar: true,
    landscapePercent: 22,
  },
  parking: { covered: 8, surface: 20, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 6800,
  estimatedCoverage: 0.34,
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

/* ------------------------------------------------------------------ */
/*  Design 6 — L "Sunset Terrace"                                      */
/* ------------------------------------------------------------------ */

const sunsetTerrace: CuratedDesign = {
  id: 'kevyn-6-sunset-terrace',
  name: 'Sunset Terrace',
  subtitle: 'Stepped terraces facing west',
  description:
    'An L-shaped building with the west-facing wing stepping down from 6 storeys (PAD) to 4 storeys (YOTEL), creating cascading planted terraces that face the sunset. The stepping reduces perceived mass and creates outdoor living space on every terrace level. Resort-sized 19m2 YOTEL rooms, full rooftop bar/grill/raised pool programme, and all mandatory amenities.',
  concept:
    'The Sunset Terrace takes the L-form and sculpts it into a cascade of green terraces stepping toward Carlisle Bay. The south wing runs 46m east-west at a full 6 storeys, housing the vertical circulation core and PAD residences on upper floors. The west wing steps down from 6 to 4 storeys, creating three levels of landscaped roof terraces. Each terrace is a private garden — planted with bougainvillea, frangipani, and native grasses — visible from the rooms above. Guests arrive from Bay Street into the south-facing amenity pavilion with Mission Control, restaurant and bar, and grab-and-go at ground level. The upper floor provides the gym, recording studio, podcast studio, sim racing room, and business centre. Parking flanks the entrance gate. The central Rixos-style pool deck sits between the L-form building and amenity block.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 100,
  padKeys: 32,
  totalKeys: 132,
  wings: [
    { id: 'st-main', label: 'Main Wing (E-W, Full Height)', x: 1.83, y: 1.83, length: 48.8, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'st-branch', label: 'Branch Wing (N-S, Stepped)', x: 34.53, y: 1.83, length: 32.5, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant',
    ],
    first: [
      'Gym (85m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '36 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'Main wing: 22 rooms',
      'Branch wing: 14 rooms (terraced floors)',
      'Terrace-access rooms on branch wing',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '32 PAD units on floor 5',
      'Main wing: 20 units full-height',
      'Branch wing: 12 units (terrace above)',
      'Penthouse terraces with plunge pools',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge on south wing (280m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      'Cascading terrace gardens on west wing',
      'Sunset viewing deck',
    ],
  },
  amenityBlock: {
    footprint: { length: 24, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 20, width: 9 },
    cabanas: 5,
    loungers: 26,
    swimUpBar: true,
    landscapePercent: 28,
  },
  parking: { covered: 6, surface: 16, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 7050,
  estimatedCoverage: 0.44,
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

/* ------------------------------------------------------------------ */
/*  Design 7 — BAR "Modular Micro"                                     */
/* ------------------------------------------------------------------ */

const modularMicro: CuratedDesign = {
  id: 'kevyn-7-modular-micro',
  name: 'Modular Micro',
  subtitle: 'Compact 5-storey modular bar, lowest cost',
  description:
    'A compact 5-storey east-west bar designed for modular off-site construction. Standardised 3.6m structural grid, prefabricated bathroom pods, and a simplified MEP strategy deliver the lowest total development cost. The reduced height (18.5m) eases planning approval near the UNESCO heritage zone. Resort-sized 19m2 YOTEL rooms, full rooftop bar/grill/raised pool, and all mandatory amenities in the south-facing amenity pavilion.',
  concept:
    'The Modular Micro strips the hotel to its essential elements: sleep, eat, swim, work. A compact 54m x 15m bar at just 5 storeys keeps the building within low-rise territory — the friendliest profile for Barbados planning authorities and the UNESCO heritage buffer zone. The secret is modular construction: room modules manufactured in a Caribbean factory (Trinidad or Jamaica), shipped to site, and craned into place in 8 weeks. Bathroom pods, headboard units, and corridor sections arrive pre-finished. Guests arrive from Bay Street into the amenity pavilion at the south, with Mission Control, restaurant and bar, and grab-and-go market at ground level; gym, recording studio, podcast studio, sim racing room, and business centre above. The central Rixos-style pool deck sits between the modular bar and amenity block. Parking flanks the Bay Street gate. Construction programme: 14 months (vs 20+ conventional). Cost saving: 12-15%.',
  formType: 'BAR',
  storeys: 5,
  yotelKeys: 100,
  padKeys: 32,
  totalKeys: 132,
  wings: [
    { id: 'mod-main', label: 'Modular Bar', x: 1.83, y: 1.83, length: 74.5, width: 16.1, direction: 'EW', floors: 5 },
  ],
  floorProgramme: {
    ground: [
      'Bay Street Entrance & Arrival Portico',
      'Mission Control (self check-in lobby)',
      'Komyuniti Restaurant & Bar',
      'Grab & Go Supermarket/Convenience (~30m2)',
      'Komyuniti Lounge',
      'Luggage Storage',
      'Public WC',
      'BOH / Housekeeping / MEP Plant / Module Storage',
    ],
    first: [
      'Gym (80m2)',
      'Recording Studio (45m2)',
      'Podcast Studio (25m2)',
      'Sim Racing Gaming Room (50m2, 4 rigs)',
      'Business Centre (40m2)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '36 YOTEL rooms per floor (floors 2-4), ~19m2 resort-sized',
      'Standardised 3.6m module grid',
      'Pre-fitted bathroom pods',
      'Corridor modules with integrated services',
      '100 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '32 PAD units on floor 5 (top floor)',
      'Double-width modules (7.2m)',
      'Pre-fitted kitchenette pods',
      'Balcony modules bolted on-site',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge (260m2)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      'Container-bar aesthetic',
      'Solar PV canopy over lounge',
    ],
  },
  amenityBlock: {
    footprint: { length: 24, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (80m2)', 'Recording Studio (45m2)', 'Podcast Studio (25m2)',
      'Sim Racing Room (50m2, 4 rigs)', 'Business Centre (40m2)',
      'Laundry Room', 'Staff Facilities',
    ],
  },
  poolDeck: {
    poolSize: { length: 20, width: 9 },
    cabanas: 5,
    loungers: 24,
    swimUpBar: true,
    landscapePercent: 22,
  },
  parking: { covered: 6, surface: 16, accessible: 2 },
  entrance: BAY_STREET_ENTRANCE,
  specialAmenities: SPECIAL_AMENITIES,
  roomSizes: ROOM_SIZES,
  estimatedGFA: 6400,
  estimatedCoverage: 0.36,
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

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

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
