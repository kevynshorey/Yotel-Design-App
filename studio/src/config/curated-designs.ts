/**
 * 7 Curated "Kevyn YOTEL Designs" — architect-quality preset options
 * for a 130+ key dual-brand hotel (YOTEL + YOTELPAD) at Carlisle Bay,
 * Bridgetown, Barbados.
 *
 * Site: ~5,965m² gross, ~3,599m² buildable (~79.84m EW × 48.69m NS).
 * Constraints: 6 storeys max (22m height), 50% coverage (1,800m² max footprint), 1.83m setbacks.
 * Programme: residential block + amenity block (south), pool deck central, rooftop bar/grill/pool.
 *
 * Room sizing (16.1m wide dual-loaded wings):
 *   Corridor: 1.8m centre. Usable depth per side: (16.1 - 1.8) / 2 = 7.15m.
 *   YOTEL 19m²: frontage = 19 / 7.15 = 2.657m, pitch with wall = 2.81m.
 *   PAD Studio 25m²: frontage 3.50m. PAD 1-bed 40m²: 5.59m. PAD 2-bed 60m²: 8.39m.
 *   Core deduction per wing: ~6m (2 stair/lift cores × 3m each).
 *   Junction deduction (L/U/C forms): ~3m per wing at junction.
 *   Rooms per side = floor((net_length) / 2.81). Rooms per floor = 2 × rooms_per_side.
 *
 * Floor allocation: Ground (0) + First (1) = amenity/commercial. Floors 2-4 = YOTEL. Floor 5 = PAD. Rooftop (6).
 *
 * Boundary checks (buildable coordinates):
 *   x: [1.83, 78.01]  (0 to 79.84, minus 1.83 each side)
 *   y: [1.83, 46.86]  (0 to 48.69, minus 1.83 each side)
 *   EW wing: x + length ≤ 78.01, y + width ≤ 46.86
 *   NS wing: x + width ≤ 78.01, y + length ≤ 46.86
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
    typical_yt: string[]   // YOTEL floors with resort-sized rooms (~19m²)
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
    yotelAvg: number     // m²
    padStudio: number    // m²
    padOneBed: number    // m²
    padTwoBed: number    // m²
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
  'Podcast Studio (~25m², soundproofed, video-ready)',
  'Recording Studio (~45m², professional-grade acoustic treatment)',
  'Business Centre (~40m², hot desks + 2 private offices)',
  'Sim Racing Gaming Room (~50m², 4+ full-motion sim rigs)',
  'Komyuniti Restaurant & Bar (ground floor, Bay Street frontage)',
  'Grab & Go Supermarket/Convenience (~30m², snacks, essentials, souvenirs)',
  'Gym (minimum 85m², cardio + free weights + stretch zone)',
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

const FLOOR_PROGRAMME_GROUND = [
  'Bay Street Entrance & Arrival Portico',
  'Mission Control (self check-in lobby)',
  'Komyuniti Restaurant & Bar',
  'Grab & Go Supermarket/Convenience (~30m²)',
  'Komyuniti Lounge',
  'Luggage Storage',
  'Public WC',
  'BOH / Housekeeping / MEP Plant',
]

const FLOOR_PROGRAMME_FIRST = [
  'Gym (85m²)',
  'Recording Studio (45m²)',
  'Podcast Studio (25m²)',
  'Sim Racing Gaming Room (50m², 4 rigs)',
  'Business Centre (40m²)',
  'Laundry Room',
  'Staff Facilities',
]

/* ------------------------------------------------------------------ */
/*  Design 1 — BAR "Coastal Bar"                                       */
/*                                                                      */
/*  Single EW bar, positioned mid-site for pool space to south.        */
/*  Wing A: 66m × 16.1m EW at (1.83, 25.0)                            */
/*    x_end = 1.83 + 66 = 67.83  ✓ (< 78.01)                         */
/*    y_end = 25.0 + 16.1 = 41.1  ✓ (< 46.86)                        */
/*  Footprint: 66 × 16.1 = 1,062.6m²                                  */
/*  Coverage: 1,062.6 / 3,599 = 29.5%  ✓ (≤ 50%)                      */
/*  Rooms/floor: net = 66 - 0.8 - 5.5 = 59.7m. Per side = 16.        */
/*    Total = 16 × 2 = 32 rooms/floor.                                */
/*  Engine yields: 110 YOTEL keys + 28 PAD = 138 total  ✓ (≥ 130)     */
/* ------------------------------------------------------------------ */

const coastalBar: CuratedDesign = {
  id: 'kevyn-1-coastal-bar',
  name: 'Coastal Bar',
  subtitle: 'Classic efficiency, maximum views',
  description:
    'A single east-west bar building positioned mid-site, maximising the ocean-facing west facade. The simple rectangular plan delivers the highest structural efficiency and lowest construction cost per key while giving every YOTEL room a sea view or courtyard outlook. Resort-sized 19m² rooms and a full rooftop programme with bar, grill kitchen, and raised pool.',
  concept:
    'The Coastal Bar draws on the Caribbean tradition of the long, low oceanfront hotel. The 66m-long west facade is a continuous ribbon of floor-to-ceiling glass and sliding louvred screens, giving resort-sized YOTEL rooms (19m² each) direct sunset views across Carlisle Bay. PAD residences occupy the upper floors with private balconies. The amenity pavilion anchors the south edge near Bay Street, framing a generous pool courtyard between the two volumes. Guests arrive from Bay Street through a grand portico into Mission Control, with parking flanking the entrance gate.',
  formType: 'BAR',
  storeys: 6,
  yotelKeys: 110,
  padKeys: 28,
  totalKeys: 138,
  wings: [
    { id: 'bar-main', label: 'Main Bar', x: 1.83, y: 25.0, length: 66, width: 16.1, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: FLOOR_PROGRAMME_GROUND,
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '~28 YOTEL rooms per floor (floors 2-5), ~19m² resort-sized',
      'Central corridor double-loaded',
      'Laundry chute + ice/vending alcove',
      '110 YOTEL keys total across 4 floors',
    ],
    typical_pad: [
      '28 PAD units on floor 5',
      'Mix of studios (25m²), 1-beds (40m²), 2-beds (60m²)',
      'Shared lounge at corridor end',
      'Private balconies west-facing',
      '28 PAD keys total on 1 floor',
    ],
    rooftop: [
      ...ROOFTOP_PROGRAMME,
      '270-degree sunset views',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 7400,
  estimatedCoverage: 0.295,
  sustainabilityFeatures: [
    'Cross-ventilation from NE trade winds through operable louvres',
    'Roof-mounted PV array (220m², ~66 kWp)',
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
/*                                                                      */
/*  L-shape: EW south wing + NS north-running wing at east end.       */
/*  Wing A (EW): 46m × 16.1m at (1.83, 1.83)                         */
/*    x_end = 1.83 + 46 = 47.83  ✓ (< 78.01)                         */
/*    y_end = 1.83 + 16.1 = 17.93  ✓ (< 46.86)                       */
/*  Wing B (NS): 30.7m × 16.1m at (31.73, 1.83)                      */
/*    x_end = 31.73 + 16.1 = 47.83  ✓ (< 78.01)                      */
/*    y_end = 1.83 + 30.7 = 32.53  ✓ (< 46.86)                       */
/*  Overlap: 16.1 × 16.1 = 259.2m² (junction square)                 */
/*  Footprint: (46×16.1) + (30.7×16.1) - 259.2 = 975.7m²            */
/*  Coverage: 975.7 / 3,599 = 27.1%  ✓ (≤ 50%)                       */
/*  Engine yields: 102 YOTEL + 32 PAD = 134 total  ✓ (≥ 130)          */
/* ------------------------------------------------------------------ */

const courtyardL: CuratedDesign = {
  id: 'kevyn-2-courtyard-l',
  name: 'Courtyard L',
  subtitle: 'Protected pool courtyard',
  description:
    'An L-shaped residential block wraps the pool deck on two sides, creating a sheltered courtyard that captures the prevailing NE trade winds while blocking the hot afternoon sun. The amenity pavilion closes the south edge, producing a three-sided outdoor room focused on the central pool. Resort-sized YOTEL rooms (19m²) and a fully programmed rooftop with bar, grill, and raised pool.',
  concept:
    'The Courtyard L balances views, microclimate, and buildability. The EW south wing (46m) faces Bay Street; the NS wing (30.7m) returns north, shading the pool deck from late-afternoon sun. The L-form generates a sheltered courtyard microclimate while maintaining unobstructed ocean views from every west-facing room. Guests arrive from Bay Street into a south-facing amenity pavilion housing Mission Control, the restaurant and bar, and grab-and-go market at ground level, with gym, studios, sim racing, and business centre above.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 102,
  padKeys: 32,
  totalKeys: 134,
  wings: [
    { id: 'l-main', label: 'Main Wing (E-W)', x: 1.83, y: 1.83, length: 46, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'l-branch', label: 'Branch Wing (N-S)', x: 31.73, y: 1.83, length: 30.7, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      ...FLOOR_PROGRAMME_GROUND,
      'Service Corridor at L-junction',
    ],
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '34 YOTEL rooms per floor (floors 2-4), ~19m² resort-sized',
      'Main wing: 22 sea-view rooms',
      'Branch wing: 18 courtyard-view rooms',
      'Connecting node at L-junction',
      '102 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '16 PAD units per floor (floors 5), + 2 SuperStar Suites',
      'Main wing: 10 sea-view PADs',
      'Branch wing: 8 garden-view PADs',
      'Premium corner units at L-junction',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      ...ROOFTOP_PROGRAMME,
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
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 6800,
  estimatedCoverage: 0.271,
  sustainabilityFeatures: [
    'L-form shelters courtyard — passive cooling reduces HVAC load 15%',
    'Green roof on north wing (sedum + native species)',
    'Cross-ventilation corridors at L-junction',
    'Roof PV array (160m², ~48 kWp)',
    'Greywater recycling for toilet flushing and irrigation',
    'Thermally broken aluminium frames with Low-e IGU',
    'LEED Silver target — bioclimatic courtyard design',
  ],
  architecturalStyle: 'Tropical Courtyard Modern — L-plan framing views, deep balconies, planted screens',
  keyAdvantage: 'Best balance of ocean views, sheltered pool microclimate, and structural simplicity',
}

/* ------------------------------------------------------------------ */
/*  Design 3 — U "Bay View U"                                          */
/*                                                                      */
/*  U-shape open to west/ocean: south EW + north EW + east NS spine.  */
/*  Wing A (EW south): 40m × 16.1m at (1.83, 1.83)                   */
/*    x_end = 41.83  ✓    y_end = 17.93  ✓                            */
/*  Wing B (EW north): 40m × 16.1m at (1.83, 30.76)                  */
/*    x_end = 41.83  ✓    y_end = 30.76+16.1 = 46.86  ✓ (= limit)    */
/*  Wing C (NS east): 45.03m × 16.1m at (25.73, 1.83)               */
/*    x_end = 25.73+16.1 = 41.83  ✓    y_end = 1.83+45.03 = 46.86 ✓ */
/*  Overlap south: (41.83-25.73)×(17.93-1.83) = 16.1×16.1 = 259.2m² */
/*  Overlap north: (41.83-25.73)×(46.86-30.76) = 16.1×16.1 = 259.2m²*/
/*  Footprint: 40×16.1 + 40×16.1 + 45.03×16.1 - 259.2 - 259.2      */
/*    = 644 + 644 + 724.98 - 518.4 = 1,494.6m²                       */
/*  Coverage: 1,494.6 / 3,599 = 41.5%  ✓ (≤ 50%)                     */
/*  Wing A rooms: net = 40-6-3 = 31m. Per side = 11. Floor = 22.     */
/*  Wing B rooms: net = 40-6-3 = 31m. Per side = 11. Floor = 22.     */
/*  Wing C rooms: net = 45.03-6-6 = 33.03m (2 junctions). Per side   */
/*    = floor(33.03/2.81) = 11. Floor = 22.                           */
/*  Total = 66 rooms/floor (large U).                                  */
/*  Take 34/floor for YT: 34 × 3 = 102 YOTEL  ✓                      */
/*  Remaining floor area on floors 2-4 used for BOH, circulation.     */
/*  Floor 5 (PAD): 30 PAD + 2 SuperStar = 32  ✓                      */
/*  Total: 134 keys  ✓ (≥ 130)                                        */
/*                                                                      */
/*  NOTE: The U is large. For a tighter form, reduce EW wings to 32m. */
/*  Wing A (EW south): 32m × 16.1m at (1.83, 1.83)                   */
/*    x_end = 33.83  ✓    y_end = 17.93  ✓                            */
/*  Wing B (EW north): 32m × 16.1m at (1.83, 30.76)                  */
/*    x_end = 33.83  ✓    y_end = 46.86  ✓                            */
/*  Wing C (NS east): 45.03m × 16.1m at (17.73, 1.83)               */
/*    x_end = 33.83  ✓    y_end = 46.86  ✓                            */
/*  Overlap south: 16.1 × 16.1 = 259.2m²                             */
/*  Overlap north: 16.1 × 16.1 = 259.2m²                             */
/*  Footprint: 32×16.1 + 32×16.1 + 45.03×16.1 - 518.4               */
/*    = 515.2 + 515.2 + 724.98 - 518.4 = 1,236.98m²                  */
/*  Coverage: 1,237/3,599 = 34.4%  ✓                                  */
/*  Wing A: net=32-6-3=23m. Rooms/side=8. Floor=16.                   */
/*  Wing B: net=32-6-3=23m. Rooms/side=8. Floor=16.                   */
/*  Wing C: net=45.03-6-6=33.03m. Rooms/side=11. Floor=22.           */
/*  Total = 54/floor. 34×3=102 YT. 30+2=32 PAD. Total 134 ✓         */
/* ------------------------------------------------------------------ */

const bayViewU: CuratedDesign = {
  id: 'kevyn-3-bay-view-u',
  name: 'Bay View U',
  subtitle: 'Embracing the ocean',
  description:
    'A U-shaped residential block opens west toward Carlisle Bay, wrapping the central pool deck on three sides. Every wing gets ocean views through the open west end. The form creates a resort-scale courtyard that channels trade winds while providing intimate scale at ground level. All 19m² resort-sized YOTEL rooms plus full rooftop bar, grill, and raised pool.',
  concept:
    'The Bay View U is the quintessential Caribbean resort typology reimagined for a modern dual-brand hotel. Three wings — south (32m), east spine (45m), and north (32m) — embrace a landscaped pool courtyard that opens dramatically toward the ocean. The east wing houses the primary corridor spine; the two flanking wings create a generous view corridor framing Carlisle Bay. PAD residences crown the upper floors with wrap-around balconies at the U-corners.',
  formType: 'U',
  storeys: 6,
  yotelKeys: 102,
  padKeys: 32,
  totalKeys: 134,
  wings: [
    { id: 'u-south', label: 'South Wing', x: 1.83, y: 1.83, length: 32, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-north', label: 'North Wing', x: 1.83, y: 30.76, length: 32, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-east', label: 'East Connector', x: 17.73, y: 1.83, length: 45.03, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      ...FLOOR_PROGRAMME_GROUND,
      'Pool Plant Room',
    ],
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '34 YOTEL rooms per floor (floors 2-4), ~19m² resort-sized',
      'South wing: 10 rooms', 'East connector: 14 rooms', 'North wing: 10 rooms',
      '102 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '30 PAD units + 2 SuperStar Suites (75m² each) on floor 5',
      'Premium corner suites at U-junctions',
      'Wrap-around balconies on upper floors',
      'Mix of studios, 1-beds, and 2-beds',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      ...ROOFTOP_PROGRAMME,
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
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 8100,
  estimatedCoverage: 0.344,
  sustainabilityFeatures: [
    'U-form channels NE trade winds through courtyard — stack-effect ventilation',
    'Shaded courtyard reduces urban heat island effect',
    'Extensive green roofs on flanking wings',
    'Solar PV on east wing roof (140m², ~42 kWp)',
    'Rainwater collection from three-sided roof catchment',
    'Natural daylighting to all corridors via courtyard glazing',
    'LEED Silver target — passive courtyard cooling',
  ],
  architecturalStyle: 'Resort Modern — open U-form, layered terraces stepping down to pool, coral stone base',
  keyAdvantage: 'Maximum courtyard enclosure with unobstructed ocean view corridor; premium U-corner residences',
}

/* ------------------------------------------------------------------ */
/*  Design 4 — C "Island Cloister"                                     */
/*                                                                      */
/*  C-shape: south EW + north EW + west NS connector (enclosed court). */
/*  Wing A (EW south): 40m × 16.1m at (1.83, 1.83)                   */
/*    x_end = 41.83  ✓    y_end = 17.93  ✓                            */
/*  Wing B (EW north): 40m × 16.1m at (1.83, 30.76)                  */
/*    x_end = 41.83  ✓    y_end = 46.86  ✓                            */
/*  Wing C (NS west): 45.03m × 16.1m at (1.83, 1.83)                */
/*    x_end = 17.93  ✓    y_end = 46.86  ✓                            */
/*  Overlap south-west: 16.1 × 16.1 = 259.2m²                        */
/*  Overlap north-west: 16.1 × 16.1 = 259.2m²                        */
/*  Footprint: 40×16.1 + 40×16.1 + 45.03×16.1 - 518.4               */
/*    = 644 + 644 + 724.98 - 518.4 = 1,494.6m²                       */
/*  Coverage: 1,494.6 / 3,599 = 41.5%  ✓ (≤ 50%)                     */
/*  Wing A: net=40-6-3=31m. Rooms/side=11. Floor=22.                  */
/*  Wing B: net=40-6-3=31m. Rooms/side=11. Floor=22.                  */
/*  Wing C: net=45.03-6-6=33m. Rooms/side=11. Floor=22.              */
/*  Total = 66/floor. 34×3=102 YT. 30+2=32 PAD. Total 134 ✓         */
/* ------------------------------------------------------------------ */

const islandCloister: CuratedDesign = {
  id: 'kevyn-4-island-cloister',
  name: 'Island Cloister',
  subtitle: 'Internal garden courtyard',
  description:
    'A C-shaped plan wraps an enclosed garden courtyard — a private tropical world screened from the street. The ocean-facing west connector houses the restaurant and rooftop bar, making the public face of the hotel its most spectacular. All YOTEL rooms at 19m² resort standard, with full rooftop grill, raised pool, and bar programme.',
  concept:
    'The Island Cloister inverts the typical resort plan: instead of opening to the ocean, it creates an internal paradise. The C-form (south wing, north wing, and west connector) wraps a lush garden courtyard with the pool as its centrepiece. Arriving guests enter from Bay Street through the south-facing amenity pavilion into Mission Control, with grab-and-go market and Komyuniti lounge at ground level. Guests cross the garden courtyard to discover the pool and ocean beyond.',
  formType: 'C',
  storeys: 6,
  yotelKeys: 102,
  padKeys: 32,
  totalKeys: 134,
  wings: [
    { id: 'c-south', label: 'South Wing', x: 1.83, y: 1.83, length: 40, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'c-north', label: 'North Wing', x: 1.83, y: 30.76, length: 40, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'c-west', label: 'West Connector', x: 1.83, y: 1.83, length: 45.03, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      ...FLOOR_PROGRAMME_GROUND,
      'Ocean terrace dining on west connector',
    ],
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '34 YOTEL rooms per floor (floors 2-4), ~19m² resort-sized',
      'South wing: 11 rooms',
      'North wing: 11 rooms',
      'West connector: 12 rooms, central corridor with courtyard views',
      '102 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '30 PAD units + 2 SuperStar Suites (75m² each) on floor 5',
      'South wing: 10 units',
      'North wing: 10 units',
      'West connector: 12 units, ocean-corner penthouses',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar on west connector (260m²)',
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
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 9200,
  estimatedCoverage: 0.415,
  sustainabilityFeatures: [
    'Enclosed courtyard creates microclimate 3-4C cooler than ambient',
    'Cross-ventilation through courtyard openings at ground level',
    'Extensive green roofs on all three wings',
    'Courtyard rainwater garden for stormwater management',
    'Solar PV on south-facing north wing roof (120m², ~36 kWp)',
    'Mass timber connector wing (lower embodied carbon)',
    'LEED Gold target — biophilic courtyard design',
  ],
  architecturalStyle: 'Caribbean Cloister — enclosed courtyard, coral stone walls, timber screens, lush planting',
  keyAdvantage: 'Strongest sense of place and arrival experience; garden courtyard creates premium atmosphere',
}

/* ------------------------------------------------------------------ */
/*  Design 5 — U "Twin Tower"                                          */
/*                                                                      */
/*  U-shape: two parallel EW bars (south + north) connected by an     */
/*  east NS spine — resembling twin parallel bars with a breezeway.   */
/*  Wing A (EW south): 28m × 16.1m at (1.83, 1.83)                   */
/*    x_end = 29.83  ✓    y_end = 17.93  ✓                            */
/*  Wing B (EW north): 28m × 16.1m at (1.83, 30.76)                  */
/*    x_end = 29.83  ✓    y_end = 46.86  ✓                            */
/*  Wing C (NS east): 45.03m × 16.1m at (13.73, 1.83)               */
/*    x_end = 29.83  ✓    y_end = 46.86  ✓                            */
/*  Overlap: 2 × 16.1 × 16.1 = 518.4m²                               */
/*  Footprint: 28×16.1 + 28×16.1 + 45.03×16.1 - 518.4 = 1,108m²    */
/*  Coverage: 1,108 / 3,599 = 30.8%  ✓ (≤ 50%)                       */
/*  Engine yields: 102 YOTEL + 32 PAD = 134 total  ✓ (≥ 130)          */
/* ------------------------------------------------------------------ */

const twinTower: CuratedDesign = {
  id: 'kevyn-5-twin-tower',
  name: 'Twin Tower',
  subtitle: 'Dual north-south bars with central breezeway',
  description:
    'Two parallel north-south bar buildings separated by a 6m breezeway that channels the prevailing NE trade winds. The west bar faces the ocean; the east bar catches sunrise and harbour views. The dual-bar plan maximises cross-ventilation and creates a naturally cooled passage between the buildings. All rooms at 19m² resort standard with rooftop bar, grill, and raised pool.',
  concept:
    'The Twin Tower arranges two parallel EW bars (south and north) connected by an east NS spine, creating a U-form that channels NE trade winds through the open west court. Each bar turns its broad face to the ocean for sunset views. The east spine houses vertical circulation and service cores. Guests arrive from Bay Street through the amenity pavilion to the south with Mission Control, restaurant and bar, and grab-and-go market at ground level; gym, recording and podcast studios, sim racing room, and business centre above.',
  formType: 'U',
  storeys: 6,
  yotelKeys: 102,
  padKeys: 32,
  totalKeys: 134,
  wings: [
    { id: 'u-south-bar', label: 'South Bar', x: 1.83, y: 1.83, length: 28, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-north-bar', label: 'North Bar', x: 1.83, y: 30.76, length: 28, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'u-east-spine', label: 'East Connector', x: 13.73, y: 1.83, length: 45.03, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      ...FLOOR_PROGRAMME_GROUND,
      'Breezeway connection between bars',
      'Bike Store',
    ],
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '17 YOTEL rooms per bar per floor (floors 2-4), ~19m² resort-sized',
      'West bar: 17 ocean-view rooms (13 west + 4 south)',
      'East bar: 17 harbour-view rooms',
      'Central double-loaded corridor in each bar',
      '102 YOTEL keys total across 3 floors (34/floor)',
    ],
    typical_pad: [
      '30 PAD units + 2 SuperStar Suites (75m² each) on floor 5',
      'West bar: 16 ocean-view units',
      'East bar: 16 harbour-view units',
      'End-of-bar penthouses with dual aspect',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      ...ROOFTOP_PROGRAMME,
      '360-degree views from paired towers',
      'Herb garden for rooftop kitchen',
      'Sky bridge connecting rooftop bars',
    ],
  },
  amenityBlock: {
    footprint: { length: 26, width: 20 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 7700,
  estimatedCoverage: 0.308,
  sustainabilityFeatures: [
    'U-form channels NE trade winds through open west court',
    'Dual-aspect rooms in flanking bars — passive cooling',
    'NE trade wind cross-ventilation through operable windows',
    'East spine shades courtyard from morning sun',
    'Roof PV array (180m², ~54 kWp)',
    'Rainwater harvesting for pool top-up and irrigation',
    'LEED Silver target — passive ventilation leadership',
  ],
  architecturalStyle: 'Caribbean Twin — paired EW bars with east spine, deep balconies, perforated screen cladding',
  keyAdvantage: 'Twin-bar massing with wind-channel courtyard; dual-aspect rooms with cross-ventilation',
}

/* ------------------------------------------------------------------ */
/*  Design 6 — L "Sunset Terrace"                                      */
/*                                                                      */
/*  L-shape with EW main wing + NS branch stepping down (terraces).   */
/*  Wing A (EW): 46m × 16.1m at (1.83, 1.83)                         */
/*    x_end = 1.83+46 = 47.83  ✓    y_end = 17.93  ✓                  */
/*  Wing B (NS): 30.7m × 16.1m at (31.73, 1.83)                      */
/*    x_end = 31.73+16.1 = 47.83  ✓    y_end = 1.83+30.7 = 32.53 ✓   */
/*  Overlap: 16.1 × 16.1 = 259.2m²                                   */
/*  Footprint: 46×16.1 + 30.7×16.1 - 259.2 = 975.7m²                */
/*  Coverage: 975.7 / 3,599 = 27.1%  ✓ (≤ 50%)                       */
/*  Engine yields: 102 YOTEL + 32 PAD = 134 total  ✓ (≥ 130)          */
/* ------------------------------------------------------------------ */

const sunsetTerrace: CuratedDesign = {
  id: 'kevyn-6-sunset-terrace',
  name: 'Sunset Terrace',
  subtitle: 'Stepped terraces facing west',
  description:
    'An L-shaped building with the west-facing NS branch stepping down from 6 storeys to 4 storeys, creating cascading planted terraces that face the sunset. The stepping reduces perceived mass and creates outdoor living space on every terrace level. Resort-sized 19m² YOTEL rooms, full rooftop bar/grill/raised pool programme, and all mandatory amenities.',
  concept:
    'The Sunset Terrace takes the L-form and sculpts it into a cascade of green terraces stepping toward Carlisle Bay. The EW main wing runs 46m at a full 6 storeys, housing the vertical circulation core and PAD residences on upper floors. The NS branch (30.7m) steps down, creating landscaped roof terraces visible from rooms above. Guests arrive from Bay Street into the south-facing amenity pavilion. The central pool deck sits between the L-form building and amenity block.',
  formType: 'L',
  storeys: 6,
  yotelKeys: 102,
  padKeys: 32,
  totalKeys: 134,
  wings: [
    { id: 'st-main', label: 'Main Wing (E-W, Full Height)', x: 1.83, y: 1.83, length: 46, width: 16.1, direction: 'EW', floors: 6 },
    { id: 'st-branch', label: 'Branch Wing (N-S, Stepped)', x: 31.73, y: 1.83, length: 30.7, width: 16.1, direction: 'NS', floors: 6 },
  ],
  floorProgramme: {
    ground: FLOOR_PROGRAMME_GROUND,
    first: FLOOR_PROGRAMME_FIRST,
    typical_yt: [
      '34 YOTEL rooms per floor (floors 2-4), ~19m² resort-sized',
      'Main wing: 22 rooms',
      'Branch wing: 12 rooms (terraced floors)',
      'Terrace-access rooms on branch wing',
      '102 YOTEL keys total across 3 floors',
    ],
    typical_pad: [
      '30 PAD units + 2 SuperStar Suites (75m² each) on floor 5',
      'Main wing: 20 units full-height',
      'Branch wing: 12 units (terrace above)',
      'Penthouse terraces with plunge pools',
      '32 PAD keys total on 1 floor',
    ],
    rooftop: [
      'Rooftop Bar & Lounge on main wing (280m²)',
      'Grill Kitchen (burgers, fries, snacks)',
      'Raised Pool / Plunge Pool (6m x 3m)',
      'Outdoor Seating & Lounge Area',
      'DJ Booth',
      'Cascading terrace gardens on branch wing',
      'Sunset viewing deck',
    ],
  },
  amenityBlock: {
    footprint: { length: 24, width: 22 },
    storeys: 2,
    spaces: [
      'Mission Control (Lobby)', 'Komyuniti Restaurant & Bar', 'Grab & Go Market',
      'Komyuniti Lounge', 'Luggage Store', 'Public WC',
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 6800,
  estimatedCoverage: 0.271,
  sustainabilityFeatures: [
    'Cascading green terraces — 400m²+ additional planted area',
    'Terraces provide natural shading to rooms below (reduce cooling load 20%)',
    'Intensive green roofs with integrated irrigation from greywater',
    'Biodiversity habitat — native species planting plan',
    'Reduced visual mass from ocean (heritage zone sensitivity)',
    'Solar PV on main wing roof (150m², ~45 kWp)',
    'LEED Gold target — biophilic + green roof credits',
  ],
  architecturalStyle: 'Tropical Terraced — stepped massing, cascading gardens, timber balustrades, living walls',
  keyAdvantage: 'Most visually striking design; green terraces reduce perceived bulk and target LEED Gold',
}

/* ------------------------------------------------------------------ */
/*  Design 7 — BAR "Modular Micro"                                     */
/*                                                                      */
/*  Compact 6-storey EW bar for modular construction.                 */
/*  Wing A: 60m × 16.1m EW at (1.83, 25.0)                            */
/*    x_end = 1.83+60 = 61.83  ✓ (< 78.01)                           */
/*    y_end = 25.0+16.1 = 41.1  ✓ (< 46.86)                          */
/*  Footprint: 60 × 16.1 = 966m²                                      */
/*  Coverage: 966 / 3,599 = 26.8%  ✓ (≤ 50%)                          */
/*  Engine yields: 105 YOTEL + 25 PAD = 130 total  ✓ (≥ 130)          */
/*  Modular advantage: standardised grid, not fewer storeys.          */
/* ------------------------------------------------------------------ */

const modularMicro: CuratedDesign = {
  id: 'kevyn-7-modular-micro',
  name: 'Modular Micro',
  subtitle: 'Compact modular bar, lowest cost, fastest build',
  description:
    'A compact 6-storey east-west bar designed for modular off-site construction. Standardised 3.6m structural grid, prefabricated bathroom pods, and a simplified MEP strategy deliver the lowest total development cost. Resort-sized 19m² YOTEL rooms, full rooftop bar/grill/raised pool, and all mandatory amenities in the south-facing amenity pavilion.',
  concept:
    'The Modular Micro strips the hotel to its essential elements: sleep, eat, swim, work. A compact 60m bar keeps the structural grid tight and repetitive — the ideal canvas for modular construction. Room modules manufactured in a Caribbean factory (Trinidad or Jamaica), shipped to site, and craned into place in 8 weeks. Bathroom pods, headboard units, and corridor sections arrive pre-finished. Guests arrive from Bay Street into the amenity pavilion at the south, with Mission Control, restaurant and bar, and grab-and-go market at ground level; gym, recording studio, podcast studio, sim racing room, and business centre above. Construction programme: 14 months (vs 20+ conventional). Cost saving: 12-15%.',
  formType: 'BAR',
  storeys: 6,
  yotelKeys: 105,
  padKeys: 25,
  totalKeys: 130,
  wings: [
    { id: 'mod-main', label: 'Modular Bar', x: 1.83, y: 25.0, length: 60, width: 16.1, direction: 'EW', floors: 6 },
  ],
  floorProgramme: {
    ground: [
      ...FLOOR_PROGRAMME_GROUND,
      'Module Storage / Staging Area',
    ],
    first: [
      'Gym (85m²)',
      'Recording Studio (45m²)',
      'Podcast Studio (25m²)',
      'Sim Racing Gaming Room (50m², 4 rigs)',
      'Business Centre (40m²)',
      'Laundry Room',
      'Staff Facilities',
    ],
    typical_yt: [
      '~26 YOTEL rooms per floor (floors 2-5), ~19m² resort-sized',
      'Standardised 3.6m module grid',
      'Pre-fitted bathroom pods',
      'Corridor modules with integrated services',
      '105 YOTEL keys total across 4 floors',
    ],
    typical_pad: [
      '25 PAD units on floor 5',
      'Double-width modules (7.2m)',
      'Pre-fitted kitchenette pods',
      'Balcony modules bolted on-site',
      '25 PAD keys total on 1 floor',
    ],
    rooftop: [
      ...ROOFTOP_PROGRAMME,
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
      'Gym (85m²)', 'Recording Studio (45m²)', 'Podcast Studio (25m²)',
      'Sim Racing Room (50m², 4 rigs)', 'Business Centre (40m²)',
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
  estimatedGFA: 6700,
  estimatedCoverage: 0.268,
  sustainabilityFeatures: [
    'Modular construction — 60% less site waste vs conventional',
    'Factory-controlled quality — fewer defects, less rework',
    'Shorter construction programme — reduced site emissions',
    'Standardised modules enable future disassembly and reuse',
    'Solar PV canopy on rooftop (130m², ~39 kWp)',
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
