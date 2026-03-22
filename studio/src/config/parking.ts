/** Parking — Barbados Planning & Development requirements.
 *  Urban Bridgetown location allows reduced ratios. */
export const PARKING = {
  /** Spaces per key (TCDPO range for urban hotels) */
  ratioPerKey: 0.5,              // conservative urban (0.5-1.0 range)
  ratioPerKeyResort: 0.75,       // mid-point for resort setting

  /** Space dimensions (Barbados standard) */
  standardSpaceM2: 12.5,         // 2.5m x 5.0m
  handicapSpaceM2: 17.5,         // 3.5m x 5.0m
  accessAisleM: 1.5,            // between handicap spaces
  driveAisleM: 6.0,             // two-way traffic

  /** Minimum handicap spaces */
  handicapPct: 0.05,             // 5% of total

  /** Bicycle parking */
  bicycleRatio: 0.10,            // 10% of room count
  bicycleRackSpaceM2: 2.0,

  /** EV charging */
  evReadyPct: 0.20,              // 20% EV-ready (future proofing)
  evChargerCost: 8500,           // per Level 2 charger installed

  /** Cost rates */
  costs: {
    surfaceLotPerSpace: 5500,    // grading, paving, striping, lighting
    coveredPerSpace: 12000,      // steel canopy + solar PV shade structure
    undergroundPerSpace: 35000,  // excavation in coral limestone = expensive
  },

  /** Preferred type for Carlisle Bay site */
  recommendedType: 'surface_with_solar_canopy' as const,
} as const

/** Calculate parking requirements and costs */
export function calculateParking(totalKeys: number) {
  const totalSpaces = Math.ceil(totalKeys * PARKING.ratioPerKey)
  const handicapSpaces = Math.max(2, Math.ceil(totalSpaces * PARKING.handicapPct))
  const standardSpaces = totalSpaces - handicapSpaces
  const bicycleSpaces = Math.ceil(totalKeys * PARKING.bicycleRatio)
  const evReadySpaces = Math.ceil(totalSpaces * PARKING.evReadyPct)

  // Area calculation
  const parkingArea = (standardSpaces * PARKING.standardSpaceM2) +
    (handicapSpaces * PARKING.handicapSpaceM2) +
    (totalSpaces * PARKING.driveAisleM * 2.5) // drive aisle allocation

  // Cost (surface with solar canopy)
  const baseCost = totalSpaces * PARKING.costs.coveredPerSpace
  const evCost = evReadySpaces * PARKING.evChargerCost
  const totalCost = baseCost + evCost

  return {
    totalSpaces, standardSpaces, handicapSpaces, bicycleSpaces,
    evReadySpaces, parkingArea: Math.round(parkingArea),
    totalCost, evCost, baseCost,
  }
}
