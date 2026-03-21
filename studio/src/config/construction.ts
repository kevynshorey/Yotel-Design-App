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
