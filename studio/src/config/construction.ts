export const CONSTRUCTION = {
  type: 'Prefab modular on steel frame',
  extWall: 0.4,           // m
  modularPartition: 0.27,
  internalWall: 0.2,
  corridorWidth: 1.6,     // m clear
  floorCeiling: 0.5,
  floorToFloor: 3.2,      // m (upper floors)
  groundFloorHeight: 4.5, // m
  minRoomCeiling: 2.5,
  maxModuleLength: 17.5,  // m
  maxModuleWidth: 4.5,
} as const

export const CORE = {
  areaPerFloor: 40,       // m²
  guestLifts: 2,
  bohLifts: 1,
  staircases: 2,
  maxDeadEnd: 10,         // m
  maxTravelDistance: 35,   // m
  linenStorePerFloor: 13, // m²
} as const

export const FOH = {
  missionControl: 50,     // m²
  komyuniti: 245,
  hub: 14,                // × 2
  gym: 55,
  publicWC: 27,
  luggage: 19,
  podcastStudio: 15,
  gamingLounge: 25,
} as const

export const BOH = {
  kitchen: 47,
  coldStorage: 13,
  dryStorage: 9,
  barStorage: 9,
  administration: 40,
  crewRoom: 26,
  crewFacilities: 38,
  housekeeping: 42,
  fixIt: 18,
  plant: 60,
  itServer: 8,
  waste: 18,
  generalStorage: 10,
} as const

/** Hurricane resilience — CUBiC Category 4+ design loads */
export const HURRICANE_DESIGN = {
  category: 4,
  windSpeedKmh: 210,
  structuralMultiplier: 1.15,    // 15% uplift on structural costs
  windowsAndCladding: 1.25,     // 25% uplift for impact-rated glazing
  roofUplift: 1.20,             // 20% for enhanced roof connections
} as const

/** Seismic design — Barbados moderate seismic zone */
export const SEISMIC_DESIGN = {
  zone: 'moderate',
  structuralMultiplier: 1.08,   // 8% uplift
  foundationMultiplier: 1.12,   // 12% for enhanced foundations
} as const

/** Foundation engineering — coral limestone substrate */
export const FOUNDATION = {
  type: 'bored_piles_with_tie_beams' as const,
  substrate: 'coral_limestone' as const,
  pileDepthM: 2.2,
  pileDiameterM: 0.6,
  costPerPile: 18000,           // USD installed
  pilesPerM2: 1 / 75,           // 1 pile per 75 m² footprint
  tieBeamCostPerM: 850,
  corrosionProtection: 'epoxy_coated_rebar' as const,
  geotechnicalSurvey: 45000,    // USD flat
} as const

/** Barbados-specific cost adjustment factors */
export const ISLAND_COST_FACTORS = {
  importDuty: 0.12,             // 12% avg (some duty-free under TDA)
  shippingFreight: 0.10,        // 10% FOB to island
  hurricaneScheduling: 0.08,    // 8% programme extension (Jun-Nov)
  labourEscalation: 0.043,      // 4.3% annual (BCQS 2025)
} as const
