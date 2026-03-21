/** Validation rules — planning (T1 statute) + brand (T3 YOTEL D01-C08).
 *  Sources:
 *  - Planning and Development Act, 2019 (operative Dec 2021)
 *  - Planning and Development (General Development Order), S.I. 2021 No. 89
 *  - Coastal Zone Management Act (CZMU) — 30m coastal setback
 *  - Physical Development Plan (PDP) 2017 + 2023 amendment
 *  - UNESCO World Heritage Buffer Zone constraints (Historic Bridgetown)
 */
export const RULES = {
  planning: {
    maxCoverage: 0.50,       // 50% for commercial/tourism use (PDP)
    maxHeight: 25.0,         // m — conservative for heritage zone proximity
    siteArea: 3599.1,        // m² buildable (from site.py)
    siteLength: 79.84,       // m E-W
    siteWidth: 48.69,        // m N-S
    /** Minimum setback from any property boundary (6 ft = 1.83m) */
    boundarySetback: 1.83,
    /** Minimum setback from nearest building on same land (12 ft = 3.66m) */
    buildingSeparation: 3.66,
    /** Coastal setback from High Water Mark (CZMU mandatory) */
    coastalSetback: 30.0,
    /** Road setbacks from road centre line by road class */
    roadSetbacks: {
      classI: 15.24,         // 50 ft — highway / main road
      classII: 9.75,         // 32 ft — secondary road
      classIII: 5.79,        // 19 ft — local road
    },
    /** Corner splay at intersections */
    cornerSplay: {
      twoClassIII: 1.52,    // 5 ft
      classIIIMixed: 3.05,   // 10 ft
      twoClassII: 6.10,     // 20 ft
      classIIMixed: 6.10,   // 20 ft
    },
    /** EIA required for hotels > 50 keys */
    eiaThreshold: 50,
    /** UNESCO World Heritage buffer zone — additional scrutiny */
    heritageZone: true,
  },
  brand: {
    dualMinWidth: 13.6,      // m YOTEL
    singleMinWidth: 8.0,     // m
    padDualMinWidth: 16.1,   // m YOTELPAD
    maxTravel: 35,           // m
    minAccessiblePct: 0.05,
    yotelAccessiblePct: 0.10,
    yotelpadAccessiblePct: 0.07,
    fohLiftsPerHundred: 2,
    minKomyuniti: 150,       // m²
    minMissionControl: 35,
    minGym: 40,
    minKitchen: 35,
  },
  circulation: {
    minCorridorWidth: 1.6,   // m
    maxDeadEnd: 10,          // m
    maxTravelDistance: 35,    // m
    minCorridorHeight: 2.4,  // m
  },
} as const
