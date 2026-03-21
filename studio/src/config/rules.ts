/** Validation rules — planning (T1 statute) + brand (T3 YOTEL D01-C08). */
export const RULES = {
  planning: {
    maxCoverage: 0.50,
    maxHeight: 25.0,         // m (planning limit, not 21m building target)
    siteArea: 3599.1,        // m² buildable (from site.py)
    siteLength: 79.84,       // m E-W
    siteWidth: 48.69,        // m N-S
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
