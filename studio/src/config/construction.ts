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

/** Back of House — comprehensive operational areas for 130-key resort.
 *  Areas in m². Benchmarked against Caribbean hotel operations standards. */
export const BOH = {
  // ── FOOD & BEVERAGE BOH ──
  mainKitchen: 65,           // expanded from 47 for 3-venue programme
  coldRoom: 18,              // walk-in refrigerator + freezer (was 13)
  dryStorage: 14,            // non-perishable + beverage (was 9)
  barStorage: 12,            // spirits, wine, glassware (was 9)
  dishwash: 15,              // commercial dishwasher station
  wasteHandling: 22,         // wet/dry separation, grease trap, recycling (was 18)
  staffDining: 18,           // crew cafeteria / break area

  // ── HOUSEKEEPING ──
  housekeeping: 42,          // central linen store + trolley staging
  laundry: 55,               // commercial washers, dryers, ironing, folding
  linenStore: 28,            // clean linen staging per floor (total across building)
  cleaningChemicals: 8,      // COSHH compliant store
  uniformStore: 12,          // staff uniforms + PPE

  // ── ENGINEERING & MAINTENANCE ──
  mainPlantRoom: 75,         // HVAC chillers, AHU, BMS, fire pump (was 60)
  electricalSwitchroom: 25,  // BL&P transformer, main distribution board
  generatorRoom: 30,         // 500kW diesel generator + fuel tank
  waterTreatment: 18,        // greywater recycling, rainwater filtration
  fireRepump: 12,            // fire pump room (separate from main plant)
  workshop: 22,              // maintenance workshop / fix-it (was 18)
  paintStore: 6,             // hazardous materials store

  // ── ADMINISTRATION ──
  generalManager: 15,        // GM office
  backOffice: 30,            // accounts, HR, purchasing (was admin 40)
  securityOffice: 12,        // CCTV monitoring, key store
  itServerRoom: 12,          // server rack, UPS, network switches (was 8)
  receivingDock: 25,         // goods receiving, weighing, inspection
  loadingBay: 35,            // covered loading area + turning circle

  // ── STAFF FACILITIES ──
  maleChanging: 22,          // lockers, showers, WC
  femaleChanging: 22,        // lockers, showers, WC
  staffBreakRoom: 28,        // crew room with kitchenette (was 26)
  staffWC: 12,               // additional staff toilets (was part of crewFacilities 38)
  trainingRoom: 18,          // staff training / meetings
  firstAid: 8,               // first aid room with stretcher access

  // ── GUEST SERVICES BOH ──
  luggageStore: 22,          // bell services, luggage hold (was 19 in FOH)
  lostAndFound: 6,           // secure store
  poolEquipment: 15,         // pump room, chemical store, towel staging
  landscapeStore: 12,        // gardening tools, irrigation controls
} as const

/** Calculate total BOH area */
export function calculateBohArea(): { total: number; categories: Record<string, { area: number; items: string[] }> } {
  const categories: Record<string, { area: number; items: string[] }> = {
    'Food & Beverage': {
      area: BOH.mainKitchen + BOH.coldRoom + BOH.dryStorage + BOH.barStorage + BOH.dishwash + BOH.wasteHandling + BOH.staffDining,
      items: ['Main Kitchen', 'Cold Room', 'Dry Storage', 'Bar Storage', 'Dishwash', 'Waste Handling', 'Staff Dining'],
    },
    'Housekeeping': {
      area: BOH.housekeeping + BOH.laundry + BOH.linenStore + BOH.cleaningChemicals + BOH.uniformStore,
      items: ['Central Linen Store', 'Laundry', 'Linen Store', 'Cleaning Chemicals', 'Uniform Store'],
    },
    'Engineering & Plant': {
      area: BOH.mainPlantRoom + BOH.electricalSwitchroom + BOH.generatorRoom + BOH.waterTreatment + BOH.fireRepump + BOH.workshop + BOH.paintStore,
      items: ['Main Plant Room', 'Electrical Switchroom', 'Generator Room', 'Water Treatment', 'Fire Pump', 'Workshop', 'Paint Store'],
    },
    'Administration': {
      area: BOH.generalManager + BOH.backOffice + BOH.securityOffice + BOH.itServerRoom + BOH.receivingDock + BOH.loadingBay,
      items: ['GM Office', 'Back Office', 'Security', 'IT Server Room', 'Receiving Dock', 'Loading Bay'],
    },
    'Staff Facilities': {
      area: BOH.maleChanging + BOH.femaleChanging + BOH.staffBreakRoom + BOH.staffWC + BOH.trainingRoom + BOH.firstAid,
      items: ['Male Changing', 'Female Changing', 'Break Room', 'Staff WC', 'Training Room', 'First Aid'],
    },
    'Guest Services': {
      area: BOH.luggageStore + BOH.lostAndFound + BOH.poolEquipment + BOH.landscapeStore,
      items: ['Luggage Store', 'Lost & Found', 'Pool Equipment', 'Landscape Store'],
    },
  }

  const total = Object.values(categories).reduce((sum, cat) => sum + cat.area, 0)
  return { total, categories }
}

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
