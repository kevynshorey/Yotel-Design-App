// ============================================================================
// IMMUTABLE BARBADOS PLANNING REGULATIONS
// These are absolute red lines — no design option may violate any of these.
//
// Source: Town and Country Planning Act (Cap. 240), Planning and Development
// Act 2019, Physical Development Plan (PDP) 2017 + 2023 amendment,
// CZMU Guidelines, EPD Requirements, BWA Standards, BL&P Requirements,
// Barbados Fire Service + NFPA, UNESCO World Heritage Buffer Zone.
// ============================================================================

export const PLANNING_RULES = {
  // ── SITE COVERAGE ────────────────────────────────────────────────────
  maxSiteCoverage: 0.50, // 50% for commercial/hotel — TCPA
  maxSiteCoverageResidential: 0.40, // 40% for residential

  // ── BUILDING HEIGHT ──────────────────────────────────────────────────
  maxHeightMetres: 22.0, // 6 storeys max (3.2m/floor + 4.0m ground = 20m, plus parapet)
  maxStoreys: 6, // User-confirmed maximum for this site
  minGroundFloorHeight: 3.6, // metres — commercial ground floor
  typicalFloorHeight: 3.2, // metres — upper floors
  maxParapetHeight: 1.2, // metres above roof level

  // ── SETBACKS ─────────────────────────────────────────────────────────
  minSideRearSetback: 1.83, // 6 feet — TCPA
  minBuildingSeparation: 3.66, // 12 feet between buildings on same land — TCPA
  minRoadSetback: 5.79, // 19 feet building line from road — TCPA
  coastalSetback: 30.0, // 30 metres from high water mark — CZMU
  cliffSetback: 10.0, // 10 metres from cliff edge — CZMU

  // ── BOUNDARY SPLAYS ──────────────────────────────────────────────────
  twoNineteenFtSplay: 1.52, // 5 feet — when two 19ft building lines meet
  nineteenAndOtherSplay: 3.05, // 10 feet — 19ft meets 32ft or 50ft
  twoThirtyTwoFtSplay: 6.10, // 20 feet — two 32ft lines meet

  // ── DRAINAGE — Drainage Division ─────────────────────────────────────
  maxImpervious: 0.70, // 70% max impervious surface
  minStormwaterRetention: 50, // mm — first flush retention
  requiredSoakawayCapacity: 100, // litres per m2 of impervious area

  // ── ENVIRONMENTAL — EPD ──────────────────────────────────────────────
  eiaRequired: true, // Mandatory for hotel >50 keys
  eiaThresholdKeys: 50, // Trigger threshold
  noiseLimit: 65, // dB(A) at boundary — daytime
  noiseLimitNight: 55, // dB(A) at boundary — nighttime
  constructionHours: { start: 7, end: 18 } as const, // 7am-6pm Mon-Fri
  constructionHoursSat: { start: 8, end: 13 } as const, // 8am-1pm Saturday
  noConstructionSunday: true,

  // ── WATER — BWA ──────────────────────────────────────────────────────
  waterDemandPerKey: 450, // litres/key/day — hotel standard
  minRoofTankLitres: 4500, // minimum roof tank capacity
  rainwaterHarvestingRequired: true, // for developments >20 units
  greyWaterRecyclingRecommended: true,
  bwaConnectionRequired: true,

  // ── ELECTRICAL — BL&P ────────────────────────────────────────────────
  electricalDemandPerKey: 6.8, // kW per key average
  standbyGeneratorRequired: true, // for hotels
  lightningProtectionRequired: true,
  renewableEnergyTarget: 0.20, // 20% of electrical demand from renewables
  solarPVMinKwp: 50, // minimum PV array size for hotel

  // ── FIRE — Barbados Fire Service + NFPA ──────────────────────────────
  maxTravelDistance: 30, // metres — to nearest exit
  minExitWidth: 1.1, // metres
  minStairWidth: 1.2, // metres — for >50 occupants
  sprinklerRequired: true, // for hotel buildings
  fireAlarmRequired: true,
  emergencyLightingRequired: true,
  smokeDetectorsPerRoom: true,

  // ── PARKING ──────────────────────────────────────────────────────────
  parkingRatioHotel: 0.5, // spaces per key — TCPA
  parkingRatioRestaurant: 1, // per 4 seats (0.25 per seat)
  accessibleParkingMin: 0.05, // 5% of total spaces
  cycleParking: 0.10, // 10% of car spaces

  // ── ACCESSIBILITY ────────────────────────────────────────────────────
  accessibleRoomRatio: 0.05, // 5% of rooms — minimum
  accessibleRouteRequired: true,
  liftRequired: true, // for buildings >2 storeys
  wheelchairAccessibleEntrance: true,

  // ── UNESCO / HERITAGE ────────────────────────────────────────────────
  unescoBufferZone: true, // site is within UNESCO buffer
  heritageConsultationRequired: true, // Barbados National Trust
  maxHeightInHeritageZone: 15, // metres — stricter in heritage areas
  facadeMaterialsRestriction: true, // must complement existing character

  // ── POOL & AMENITY ───────────────────────────────────────────────────
  poolSetbackFromBoundary: 3.0, // metres
  poolFencingRequired: true, // 1.2m min height
  poolFenceHeight: 1.2, // metres
  maxPoolDepth: 1.8, // metres — without lifeguard

  // ── LANDSCAPING ──────────────────────────────────────────────────────
  minLandscapeRatio: 0.15, // 15% of site must be landscaped
  treePreservationRequired: true,
  nativeSpeciesPreferred: true,

  // ── CONSTRUCTION TIMING ──────────────────────────────────────────────
  hurricaneSeasonStart: 6, // June
  hurricaneSeasonEnd: 11, // November
  cropOverWeeks: [30, 31, 32] as const, // ISO weeks — no heavy construction
  maxConstructionMonths: 24, // target completion

  // ── YOTEL BRAND STANDARDS (integrated as hard constraints) ───────────
  yotel: {
    minRoomSize: 13.5, // m2 — minimum cabin size
    maxRoomSize: 22.0, // m2 — maximum (keeps efficiency)
    avgRoomSize: 16.5, // m2 — target average
    gfaPerKey: 30, // m2 GFA per key — YOTEL efficiency benchmark
    dualLoadedMinWidth: 13.6, // metres — minimum wing width
    padDualLoadedMinWidth: 16.1, // metres — YOTELPAD wider units
    minCorridorWidth: 1.5, // metres
    minLobbyArea: 80, // m2 — Mission Control
    smartBedRequired: true,
    freeWifiRequired: true,
    gymRequired: true,
    selfCheckInRequired: true,
  },

  // ── YOTELPAD BRAND STANDARDS ─────────────────────────────────────────
  yotelpad: {
    minStudioSize: 25, // m2
    minOneBedSize: 40, // m2
    minTwoBedSize: 60, // m2
    kitchenRequired: true,
    washerDryerRequired: true,
    separateLivingArea: true, // for 1-bed and above
  },
} as const

export type PlanningRules = typeof PLANNING_RULES


// ============================================================================
// Validation function — returns violations
// ============================================================================

export function validateAgainstRules(option: {
  coverage: number
  height: number
  storeys: number
  totalKeys: number
  accessibleRooms: number
  sideSetback: number
  rearSetback: number
  buildingSeparation: number
  poolSetback?: number
  impervious?: number
  landscapeRatio?: number
  parkingSpaces?: number
}): { rule: string; value: number; limit: number; severity: 'fatal' | 'warning' }[] {
  const violations: { rule: string; value: number; limit: number; severity: 'fatal' | 'warning' }[] = []
  const R = PLANNING_RULES

  if (option.coverage > R.maxSiteCoverage)
    violations.push({ rule: 'Site coverage exceeds 50% maximum', value: option.coverage, limit: R.maxSiteCoverage, severity: 'fatal' })

  if (option.height > R.maxHeightMetres)
    violations.push({ rule: 'Building height exceeds 22m maximum', value: option.height, limit: R.maxHeightMetres, severity: 'fatal' })

  if (option.storeys > R.maxStoreys)
    violations.push({ rule: 'Building exceeds 6 storey maximum', value: option.storeys, limit: R.maxStoreys, severity: 'fatal' })

  if (option.sideSetback < R.minSideRearSetback)
    violations.push({ rule: 'Side/rear setback below 1.83m minimum', value: option.sideSetback, limit: R.minSideRearSetback, severity: 'fatal' })

  if (option.buildingSeparation < R.minBuildingSeparation)
    violations.push({ rule: 'Building separation below 3.66m (12ft)', value: option.buildingSeparation, limit: R.minBuildingSeparation, severity: 'fatal' })

  const accessiblePct = option.totalKeys > 0 ? option.accessibleRooms / option.totalKeys : 0
  if (option.totalKeys > 0 && accessiblePct < R.accessibleRoomRatio)
    violations.push({ rule: 'Accessible rooms below 5% minimum', value: accessiblePct, limit: R.accessibleRoomRatio, severity: 'fatal' })

  if (option.poolSetback !== undefined && option.poolSetback < R.poolSetbackFromBoundary)
    violations.push({ rule: 'Pool setback below 3m from boundary', value: option.poolSetback, limit: R.poolSetbackFromBoundary, severity: 'fatal' })

  if (option.impervious !== undefined && option.impervious > R.maxImpervious)
    violations.push({ rule: 'Impervious coverage exceeds 70%', value: option.impervious, limit: R.maxImpervious, severity: 'warning' })

  if (option.landscapeRatio !== undefined && option.landscapeRatio < R.minLandscapeRatio)
    violations.push({ rule: 'Landscape area below 15% minimum', value: option.landscapeRatio, limit: R.minLandscapeRatio, severity: 'warning' })

  if (option.parkingSpaces !== undefined) {
    const required = Math.ceil(option.totalKeys * R.parkingRatioHotel)
    if (option.parkingSpaces < required)
      violations.push({ rule: 'Parking below 0.5 spaces/key', value: option.parkingSpaces, limit: required, severity: 'warning' })
  }

  return violations
}


// ============================================================================
// RULE_CATEGORIES — groups rules by regulatory agency for planning dashboard
// ============================================================================

export const RULE_CATEGORIES = {
  'Town & Country Planning (TCPA)': {
    agency: 'Town and Country Planning Department',
    statute: 'Town and Country Planning Act (Cap. 240) / Planning and Development Act 2019',
    rules: {
      'Max site coverage (commercial/hotel)': `${PLANNING_RULES.maxSiteCoverage * 100}%`,
      'Max site coverage (residential)': `${PLANNING_RULES.maxSiteCoverageResidential * 100}%`,
      'Max building height': `${PLANNING_RULES.maxHeightMetres}m (${PLANNING_RULES.maxStoreys} storeys)`,
      'Min side/rear setback': `${PLANNING_RULES.minSideRearSetback}m (6 ft)`,
      'Min building separation': `${PLANNING_RULES.minBuildingSeparation}m (12 ft)`,
      'Min road setback': `${PLANNING_RULES.minRoadSetback}m (19 ft)`,
      'Parking ratio (hotel)': `${PLANNING_RULES.parkingRatioHotel} spaces/key`,
      'Accessible parking': `${PLANNING_RULES.accessibleParkingMin * 100}% of total`,
      'Cycle parking': `${PLANNING_RULES.cycleParking * 100}% of car spaces`,
    },
  },
  'Coastal Zone Management Unit (CZMU)': {
    agency: 'Coastal Zone Management Unit',
    statute: 'Coastal Zone Management Act (Cap. 394)',
    rules: {
      'Coastal setback': `${PLANNING_RULES.coastalSetback}m from high water mark`,
      'Cliff setback': `${PLANNING_RULES.cliffSetback}m from cliff edge`,
    },
  },
  'Environmental Protection (EPD)': {
    agency: 'Environmental Protection Department',
    statute: 'Health Services (Nuisances Prevention) Regulations',
    rules: {
      'EIA required': `Yes — for hotels >${PLANNING_RULES.eiaThresholdKeys} keys`,
      'Noise limit (day)': `${PLANNING_RULES.noiseLimit} dB(A) at boundary`,
      'Noise limit (night)': `${PLANNING_RULES.noiseLimitNight} dB(A) at boundary`,
      'Construction hours (weekday)': `${PLANNING_RULES.constructionHours.start}:00–${PLANNING_RULES.constructionHours.end}:00`,
      'Construction hours (Saturday)': `${PLANNING_RULES.constructionHoursSat.start}:00–${PLANNING_RULES.constructionHoursSat.end}:00`,
      'Sunday construction': 'Prohibited',
    },
  },
  'Drainage Division': {
    agency: 'Drainage Division, Ministry of Transport & Works',
    statute: 'Drainage Act',
    rules: {
      'Max impervious surface': `${PLANNING_RULES.maxImpervious * 100}%`,
      'Stormwater retention': `${PLANNING_RULES.minStormwaterRetention}mm first flush`,
      'Soakaway capacity': `${PLANNING_RULES.requiredSoakawayCapacity} L/m² impervious`,
    },
  },
  'Barbados Water Authority (BWA)': {
    agency: 'Barbados Water Authority',
    statute: 'BWA Act (Cap. 274A)',
    rules: {
      'Water demand (hotel)': `${PLANNING_RULES.waterDemandPerKey} L/key/day`,
      'Min roof tank': `${PLANNING_RULES.minRoofTankLitres} L`,
      'Rainwater harvesting': 'Required for >20 units',
      'Grey water recycling': 'Recommended',
      'BWA connection': 'Required',
    },
  },
  'Barbados Light & Power (BL&P)': {
    agency: 'Barbados Light & Power Company',
    statute: 'BL&P Connection Standards',
    rules: {
      'Electrical demand': `${PLANNING_RULES.electricalDemandPerKey} kW/key`,
      'Standby generator': 'Required for hotels',
      'Lightning protection': 'Required',
      'Renewable energy target': `${PLANNING_RULES.renewableEnergyTarget * 100}% of demand`,
      'Min solar PV': `${PLANNING_RULES.solarPVMinKwp} kWp`,
    },
  },
  'Barbados Fire Service': {
    agency: 'Barbados Fire Service',
    statute: 'Fire Service Act + NFPA Standards',
    rules: {
      'Max travel distance': `${PLANNING_RULES.maxTravelDistance}m to nearest exit`,
      'Min exit width': `${PLANNING_RULES.minExitWidth}m`,
      'Min stair width': `${PLANNING_RULES.minStairWidth}m (>50 occupants)`,
      'Sprinklers': 'Required for hotel buildings',
      'Fire alarm': 'Required',
      'Emergency lighting': 'Required',
      'Smoke detectors': 'Required per room',
    },
  },
  'Accessibility': {
    agency: 'Town and Country Planning Department',
    statute: 'Planning Guidelines + ADA-equivalent Standards',
    rules: {
      'Accessible rooms': `${PLANNING_RULES.accessibleRoomRatio * 100}% minimum`,
      'Accessible route': 'Required throughout',
      'Lift': 'Required for >2 storeys',
      'Wheelchair entrance': 'Required',
    },
  },
  'UNESCO / Heritage': {
    agency: 'Barbados National Trust / UNESCO',
    statute: 'UNESCO World Heritage Convention + National Trust Act',
    rules: {
      'Buffer zone': 'Site is within UNESCO buffer',
      'Heritage consultation': 'Required (Barbados National Trust)',
      'Max height (heritage zone)': `${PLANNING_RULES.maxHeightInHeritageZone}m`,
      'Facade materials': 'Must complement existing character',
    },
  },
  'Landscaping': {
    agency: 'Town and Country Planning Department',
    statute: 'Physical Development Plan',
    rules: {
      'Min landscape ratio': `${PLANNING_RULES.minLandscapeRatio * 100}% of site`,
      'Tree preservation': 'Required',
      'Native species': 'Preferred',
    },
  },
  'Pool & Amenity': {
    agency: 'Environmental Health / TCPA',
    statute: 'Environmental Health Regulations',
    rules: {
      'Pool setback': `${PLANNING_RULES.poolSetbackFromBoundary}m from boundary`,
      'Pool fencing': `Required, ${PLANNING_RULES.poolFenceHeight}m min height`,
      'Max pool depth (no lifeguard)': `${PLANNING_RULES.maxPoolDepth}m`,
    },
  },
  'YOTEL Brand Standards': {
    agency: 'YOTEL Group',
    statute: 'YOTEL Design & Technical Standards (D01-C08)',
    rules: {
      'Min cabin size': `${PLANNING_RULES.yotel.minRoomSize} m²`,
      'Max cabin size': `${PLANNING_RULES.yotel.maxRoomSize} m²`,
      'Target avg cabin': `${PLANNING_RULES.yotel.avgRoomSize} m²`,
      'GFA per key': `${PLANNING_RULES.yotel.gfaPerKey} m²`,
      'Dual-loaded min width': `${PLANNING_RULES.yotel.dualLoadedMinWidth}m`,
      'PAD dual-loaded min width': `${PLANNING_RULES.yotel.padDualLoadedMinWidth}m`,
      'Min corridor width': `${PLANNING_RULES.yotel.minCorridorWidth}m`,
      'Min lobby (Mission Control)': `${PLANNING_RULES.yotel.minLobbyArea} m²`,
      'SmartBed': 'Required',
      'Free WiFi': 'Required',
      'Gym': 'Required',
      'Self check-in': 'Required',
    },
  },
  'YOTELPAD Brand Standards': {
    agency: 'YOTEL Group',
    statute: 'YOTELPAD Technical Standards',
    rules: {
      'Min studio size': `${PLANNING_RULES.yotelpad.minStudioSize} m²`,
      'Min 1-bed size': `${PLANNING_RULES.yotelpad.minOneBedSize} m²`,
      'Min 2-bed size': `${PLANNING_RULES.yotelpad.minTwoBedSize} m²`,
      'Kitchen': 'Required',
      'Washer/dryer': 'Required',
      'Separate living area': 'Required for 1-bed+',
    },
  },
} as const

export type RuleCategories = typeof RULE_CATEGORIES


// ============================================================================
// BACKWARD-COMPATIBLE LEGACY EXPORT
// Existing code imports { RULES } and accesses RULES.planning.*, RULES.brand.*,
// RULES.circulation.*. This adapter preserves those paths exactly.
// ============================================================================

export const RULES = {
  planning: {
    maxCoverage: PLANNING_RULES.maxSiteCoverage,
    maxHeight: PLANNING_RULES.maxHeightMetres,
    siteArea: 3599.1, // m² buildable (from site.py)
    siteLength: 79.84, // m E-W
    siteWidth: 48.69, // m N-S
    boundarySetback: PLANNING_RULES.minSideRearSetback,
    buildingSeparation: PLANNING_RULES.minBuildingSeparation,
    coastalSetback: PLANNING_RULES.coastalSetback,
    roadSetbacks: {
      classI: 15.24, // 50 ft — highway / main road
      classII: 9.75, // 32 ft — secondary road
      classIII: PLANNING_RULES.minRoadSetback, // 19 ft — local road
    },
    cornerSplay: {
      twoClassIII: PLANNING_RULES.twoNineteenFtSplay,
      classIIIMixed: PLANNING_RULES.nineteenAndOtherSplay,
      twoClassII: PLANNING_RULES.twoThirtyTwoFtSplay,
      classIIMixed: PLANNING_RULES.twoThirtyTwoFtSplay,
    },
    eiaThreshold: PLANNING_RULES.eiaThresholdKeys,
    heritageZone: PLANNING_RULES.unescoBufferZone,
  },
  brand: {
    dualMinWidth: PLANNING_RULES.yotel.dualLoadedMinWidth,
    singleMinWidth: 8.0, // m — single-loaded wing
    padDualMinWidth: PLANNING_RULES.yotel.padDualLoadedMinWidth,
    maxTravel: PLANNING_RULES.maxTravelDistance,
    minAccessiblePct: PLANNING_RULES.accessibleRoomRatio,
    yotelAccessiblePct: 0.10,
    yotelpadAccessiblePct: 0.07,
    fohLiftsPerHundred: 2,
    minKomyuniti: 150, // m²
    minMissionControl: 35,
    minGym: 40,
    minKitchen: 35,
  },
  circulation: {
    minCorridorWidth: 1.6, // m
    maxDeadEnd: 10, // m
    maxTravelDistance: 35, // m
    minCorridorHeight: 2.4, // m
  },
} as const
