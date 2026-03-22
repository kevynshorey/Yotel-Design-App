/** LEED v4.1 BD+C: Hospitality — complete credit structure for YOTEL Barbados.
 *  110 total points. Target: Silver (50-59) with stretch to Gold (60-79). */

export interface LEEDCredit {
  id: string
  category: string
  name: string
  maxPoints: number
  prerequisite: boolean
  targetPoints: number
  status: 'achieved' | 'likely' | 'possible' | 'not-pursuing'
  strategy: string
  barbadosNotes?: string
}

export interface LEEDCategory {
  name: string
  abbreviation: string
  maxPoints: number
  credits: LEEDCredit[]
}

export type CertificationLevel = 'none' | 'certified' | 'silver' | 'gold' | 'platinum'

export interface CertificationThreshold {
  level: CertificationLevel
  label: string
  min: number
  max: number
  color: string       // tailwind text color
  bgColor: string     // tailwind bg color
  ringColor: string   // tailwind ring color
}

export const CERTIFICATION_THRESHOLDS: CertificationThreshold[] = [
  { level: 'none',      label: 'Not Certified', min: 0,  max: 39,  color: 'text-slate-400',    bgColor: 'bg-slate-900/40',    ringColor: 'ring-slate-700/50' },
  { level: 'certified', label: 'Certified',     min: 40, max: 49,  color: 'text-green-400',    bgColor: 'bg-green-900/40',    ringColor: 'ring-green-700/50' },
  { level: 'silver',    label: 'Silver',         min: 50, max: 59,  color: 'text-blue-400',     bgColor: 'bg-blue-900/40',     ringColor: 'ring-blue-700/50' },
  { level: 'gold',      label: 'Gold',           min: 60, max: 79,  color: 'text-yellow-400',   bgColor: 'bg-yellow-900/40',   ringColor: 'ring-yellow-700/50' },
  { level: 'platinum',  label: 'Platinum',       min: 80, max: 110, color: 'text-slate-200',    bgColor: 'bg-slate-700/40',    ringColor: 'ring-slate-500/50' },
]

export function getCertificationLevel(points: number): CertificationThreshold {
  for (let i = CERTIFICATION_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= CERTIFICATION_THRESHOLDS[i].min) return CERTIFICATION_THRESHOLDS[i]
  }
  return CERTIFICATION_THRESHOLDS[0]
}

// ── Full LEED v4.1 BD+C: Hospitality Credit Library ─────────────────────

export const LEED_CATEGORIES: LEEDCategory[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATIVE PROCESS (1 point)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Integrative Process',
    abbreviation: 'IP',
    maxPoints: 1,
    credits: [
      {
        id: 'IP-1',
        category: 'Integrative Process',
        name: 'Integrative Process',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Early-stage energy modelling + water budget analysis during schematic design with full design team charrette',
        barbadosNotes: 'Integrate Caribbean climate data (CARICOM weather stations) into early modelling',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LOCATION & TRANSPORTATION (16 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Location & Transportation',
    abbreviation: 'LT',
    maxPoints: 16,
    credits: [
      {
        id: 'LT-P1',
        category: 'Location & Transportation',
        name: 'LEED for Neighborhood Development Location',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'N/A — prerequisite is met by not pursuing ND path; use alternative compliance path',
      },
      {
        id: 'LT-1',
        category: 'Location & Transportation',
        name: 'LEED for Neighborhood Development Location',
        maxPoints: 15,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'Not applicable — project is not within a LEED-ND certified development',
      },
      {
        id: 'LT-2',
        category: 'Location & Transportation',
        name: 'Sensitive Land Protection',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Site is previously developed (existing hotel site), not on prime farmland or wetland',
        barbadosNotes: 'Confirm no overlap with Barbados National Park or Ramsar wetland boundaries',
      },
      {
        id: 'LT-3',
        category: 'Location & Transportation',
        name: 'High-Priority Site',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Brownfield remediation credit if site qualifies as infill in urban tourism zone',
        barbadosNotes: 'Bridgetown UNESCO buffer zone may qualify as high-priority redevelopment area',
      },
      {
        id: 'LT-4',
        category: 'Location & Transportation',
        name: 'Surrounding Density and Diverse Uses',
        maxPoints: 5,
        prerequisite: false,
        targetPoints: 2,
        status: 'possible',
        strategy: 'West coast tourism corridor provides moderate density and mixed-use context',
        barbadosNotes: 'Caribbean density metrics differ from US urban context; document local amenities within 800m walk',
      },
      {
        id: 'LT-5',
        category: 'Location & Transportation',
        name: 'Access to Quality Transit',
        maxPoints: 5,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Route taxis and BNTCL bus stops along Highway 1 within 400m of site',
        barbadosNotes: 'Barbados public transit frequency may not meet LEED thresholds; document route taxi system as equivalent',
      },
      {
        id: 'LT-6',
        category: 'Location & Transportation',
        name: 'Bicycle Facilities',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Provide secure bicycle storage for 5% of guest capacity + shower facilities for staff',
        barbadosNotes: 'Include beach cruiser rental program as guest amenity to support cycling',
      },
      {
        id: 'LT-7',
        category: 'Location & Transportation',
        name: 'Reduced Parking Footprint',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'No more than minimum parking required; include EV charging stations; preferred parking for carpools',
      },
      {
        id: 'LT-8',
        category: 'Location & Transportation',
        name: 'Green Vehicles',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'EV infrastructure limited in Barbados; defer to future phase',
        barbadosNotes: 'BL&P expanding EV charging network but still limited island-wide',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SUSTAINABLE SITES (10 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Sustainable Sites',
    abbreviation: 'SS',
    maxPoints: 10,
    credits: [
      {
        id: 'SS-P1',
        category: 'Sustainable Sites',
        name: 'Construction Activity Pollution Prevention',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Erosion & sedimentation control plan per EPA CGP or local equivalent; silt fencing, sediment traps, stabilized construction entrances',
        barbadosNotes: 'Critical near coastline — CZMU requires construction runoff management to protect reef',
      },
      {
        id: 'SS-1',
        category: 'Sustainable Sites',
        name: 'Site Assessment',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Complete topography, hydrology, climate, vegetation, soils assessment before design',
        barbadosNotes: 'Include coral stone substrate analysis and coastal erosion assessment',
      },
      {
        id: 'SS-2',
        category: 'Sustainable Sites',
        name: 'Site Development — Protect or Restore Habitat',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Native Caribbean landscaping with 60%+ native/adapted plant species; restore greenfield areas with indigenous species',
        barbadosNotes: 'Use mahogany, flamboyant, casuarina, sea grape, and native ground covers. Avoid invasive species listed by Barbados Environmental Division',
      },
      {
        id: 'SS-3',
        category: 'Sustainable Sites',
        name: 'Open Space',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Exceed zoning open space requirement by 30% with accessible vegetated green space',
      },
      {
        id: 'SS-4',
        category: 'Sustainable Sites',
        name: 'Rainwater Management',
        maxPoints: 3,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'On-site retention system handles 95th percentile storm; permeable pavers in parking; bioswales along boundaries',
        barbadosNotes: 'Barbados receives ~1200mm annual rainfall; size cisterns for tropical storm events',
      },
      {
        id: 'SS-5',
        category: 'Sustainable Sites',
        name: 'Heat Island Reduction',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Solar canopy over parking (high SRI), green roof on amenity level, light-colored coral stone pavers',
        barbadosNotes: 'Critical in Caribbean climate — combine with natural ventilation strategy',
      },
      {
        id: 'SS-6',
        category: 'Sustainable Sites',
        name: 'Light Pollution Reduction',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Full cutoff luminaires, 0 uplight, warm CCT exterior lighting to protect sea turtle nesting',
        barbadosNotes: 'West coast beaches are hawksbill turtle nesting habitat — amber-wavelength lighting required by Barbados Sea Turtle Project guidelines',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WATER EFFICIENCY (11 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Water Efficiency',
    abbreviation: 'WE',
    maxPoints: 11,
    credits: [
      {
        id: 'WE-P1',
        category: 'Water Efficiency',
        name: 'Outdoor Water Use Reduction',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Native/adapted landscaping reduces irrigation by 30%+ vs baseline; drip irrigation with rain sensors',
        barbadosNotes: 'Barbados Water Authority (BWA) may impose dry-season restrictions — design for resilience',
      },
      {
        id: 'WE-P2',
        category: 'Water Efficiency',
        name: 'Indoor Water Use Reduction',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Low-flow fixtures baseline: 1.28 gpf toilets, 1.5 gpm showerheads, 0.5 gpm lavatory faucets',
      },
      {
        id: 'WE-P3',
        category: 'Water Efficiency',
        name: 'Building-Level Water Metering',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'BMS-connected water metering at building entry with monthly tracking dashboard',
      },
      {
        id: 'WE-1',
        category: 'Water Efficiency',
        name: 'Outdoor Water Use Reduction',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Rainwater harvesting for 100% landscape irrigation; native Caribbean planting palette eliminates potable irrigation',
        barbadosNotes: 'Size rainwater tanks for dry season (Jan-May) demand; 50 m\u00B3 minimum storage',
      },
      {
        id: 'WE-2',
        category: 'Water Efficiency',
        name: 'Indoor Water Use Reduction',
        maxPoints: 6,
        prerequisite: false,
        targetPoints: 4,
        status: 'likely',
        strategy: 'Low-flow fixtures throughout: dual-flush 1.1/1.6 gpf toilets, 1.0 gpm showerheads, 0.35 gpm faucets. Guest laundry with high-efficiency machines',
        barbadosNotes: 'Water is precious in Barbados — BWA supply constraints make efficiency essential',
      },
      {
        id: 'WE-3',
        category: 'Water Efficiency',
        name: 'Cooling Tower Water Use',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'VRF system eliminates cooling towers entirely — credit not applicable',
      },
      {
        id: 'WE-4',
        category: 'Water Efficiency',
        name: 'Water Metering',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Sub-metering on irrigation, domestic hot water, laundry, pool, and kitchen systems',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ENERGY & ATMOSPHERE (33 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Energy & Atmosphere',
    abbreviation: 'EA',
    maxPoints: 33,
    credits: [
      {
        id: 'EA-P1',
        category: 'Energy & Atmosphere',
        name: 'Fundamental Commissioning and Verification',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Engage CxA at design phase; commission HVAC, lighting controls, domestic hot water, renewables',
      },
      {
        id: 'EA-P2',
        category: 'Energy & Atmosphere',
        name: 'Minimum Energy Performance',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Whole-building energy simulation demonstrating 5% improvement over ASHRAE 90.1-2016 baseline',
      },
      {
        id: 'EA-P3',
        category: 'Energy & Atmosphere',
        name: 'Building-Level Energy Metering',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Smart BMS with real-time energy monitoring; sub-metering by end use (HVAC, lighting, plug loads, DHW)',
      },
      {
        id: 'EA-P4',
        category: 'Energy & Atmosphere',
        name: 'Fundamental Refrigerant Management',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'No CFC-based refrigerants in HVAC&R systems; VRF system uses R-32 low-GWP refrigerant',
      },
      {
        id: 'EA-1',
        category: 'Energy & Atmosphere',
        name: 'Optimize Energy Performance',
        maxPoints: 18,
        prerequisite: false,
        targetPoints: 10,
        status: 'likely',
        strategy: 'High-performance envelope (U-0.45 walls, low-E glazing), VRF HVAC (COP 4.2+), LED lighting throughout, smart BMS with occupancy-based controls, energy recovery ventilation',
        barbadosNotes: 'Cooling-dominated climate — prioritise envelope performance, solar shading, and HVAC efficiency. BL&P electricity rate ~$0.38/kWh makes efficiency highly cost-effective',
      },
      {
        id: 'EA-2',
        category: 'Energy & Atmosphere',
        name: 'Advanced Energy Metering',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Sub-metering on all end uses >10% of total consumption with BMS dashboard and automated fault detection',
      },
      {
        id: 'EA-3',
        category: 'Energy & Atmosphere',
        name: 'Enhanced Commissioning',
        maxPoints: 6,
        prerequisite: false,
        targetPoints: 3,
        status: 'likely',
        strategy: 'Enhanced CxA scope including envelope commissioning, monitoring-based Cx for first 2 years of operation',
      },
      {
        id: 'EA-4',
        category: 'Energy & Atmosphere',
        name: 'Demand Response',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'BL&P does not currently offer demand response programs',
        barbadosNotes: 'Barbados grid has no DR program yet; revisit when BL&P smart grid rollout advances',
      },
      {
        id: 'EA-5',
        category: 'Energy & Atmosphere',
        name: 'Renewable Energy Production',
        maxPoints: 5,
        prerequisite: false,
        targetPoints: 5,
        status: 'likely',
        strategy: '75 kW rooftop PV array generating ~112,500 kWh/year (35% of building load). Solar thermal for DHW pre-heating',
        barbadosNotes: 'Barbados has ~1500 peak sun hours/year. Feed-in tariff available through FTC interconnection program',
      },
      {
        id: 'EA-6',
        category: 'Energy & Atmosphere',
        name: 'Enhanced Refrigerant Management',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'R-32 VRF systems with GWP < 675; no halons in fire suppression',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MATERIALS & RESOURCES (13 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Materials & Resources',
    abbreviation: 'MR',
    maxPoints: 13,
    credits: [
      {
        id: 'MR-P1',
        category: 'Materials & Resources',
        name: 'Storage and Collection of Recyclables',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Dedicated recycling area in BOH; separate streams for glass, plastic, cardboard, organic waste',
        barbadosNotes: 'Coordinate with Sanitation Service Authority (SSA) recycling programs',
      },
      {
        id: 'MR-P2',
        category: 'Materials & Resources',
        name: 'Construction and Demolition Waste Management Planning',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'C&D waste management plan targeting 75% diversion from landfill',
        barbadosNotes: 'Limited recycling infrastructure in Barbados; identify approved sorting facilities in Bridgetown',
      },
      {
        id: 'MR-1',
        category: 'Materials & Resources',
        name: 'Building Life-Cycle Impact Reduction',
        maxPoints: 5,
        prerequisite: false,
        targetPoints: 2,
        status: 'possible',
        strategy: 'Whole-building LCA using One Click LCA; target 10% reduction in embodied carbon vs baseline',
      },
      {
        id: 'MR-2',
        category: 'Materials & Resources',
        name: 'Building Product Disclosure and Optimization — EPD',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Specify 20+ products with EPDs (structural steel, concrete, insulation, glazing)',
      },
      {
        id: 'MR-3',
        category: 'Materials & Resources',
        name: 'Building Product Disclosure and Optimization — Sourcing',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Local materials sourcing: coral stone aggregate for concrete, Caribbean-sourced timber, regional steel from Trinidad',
        barbadosNotes: 'Coral stone aggregate from local quarries reduces transport emissions. CARICOM trade agreements support regional sourcing',
      },
      {
        id: 'MR-4',
        category: 'Materials & Resources',
        name: 'Building Product Disclosure and Optimization — Material Ingredients',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'HPD/C2C documentation challenging for Caribbean supply chains',
      },
      {
        id: 'MR-5',
        category: 'Materials & Resources',
        name: 'Construction and Demolition Waste Management',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Target 75% diversion: concrete crushing for fill, steel recycling, wood chipping for mulch, cardboard baling',
        barbadosNotes: 'Partner with B\u2019s Recycling and Sustainable Barbados Recycling Centre',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INDOOR ENVIRONMENTAL QUALITY (16 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Indoor Environmental Quality',
    abbreviation: 'IEQ',
    maxPoints: 16,
    credits: [
      {
        id: 'EQ-P1',
        category: 'Indoor Environmental Quality',
        name: 'Minimum Indoor Air Quality Performance',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'Ventilation rates per ASHRAE 62.1-2016; CO2 monitoring in densely occupied spaces',
      },
      {
        id: 'EQ-P2',
        category: 'Indoor Environmental Quality',
        name: 'Environmental Tobacco Smoke Control',
        maxPoints: 0,
        prerequisite: true,
        targetPoints: 0,
        status: 'achieved',
        strategy: 'No smoking within 7.5m of entries/operable windows; designated smoking areas with exhaust',
      },
      {
        id: 'EQ-1',
        category: 'Indoor Environmental Quality',
        name: 'Enhanced Indoor Air Quality Strategies',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'MERV 13 filtration, entryway walk-off systems, CO2-based demand controlled ventilation, cross-ventilation corridors',
        barbadosNotes: 'Natural ventilation through operable windows leverages steady Caribbean trade winds (NE 15-25 km/h)',
      },
      {
        id: 'EQ-2',
        category: 'Indoor Environmental Quality',
        name: 'Low-Emitting Materials',
        maxPoints: 3,
        prerequisite: false,
        targetPoints: 3,
        status: 'likely',
        strategy: 'Low-VOC paints, adhesives, sealants and coatings throughout. GREENGUARD-certified furniture and composite wood. No added urea-formaldehyde',
        barbadosNotes: 'Tropical humidity amplifies off-gassing — low-VOC specification is critical for IAQ',
      },
      {
        id: 'EQ-3',
        category: 'Indoor Environmental Quality',
        name: 'Construction Indoor Air Quality Management Plan',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'SMACNA IAQ guidelines during construction; duct protection, material storage protocols, building flush-out before occupancy',
      },
      {
        id: 'EQ-4',
        category: 'Indoor Environmental Quality',
        name: 'Indoor Air Quality Assessment',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Pre-occupancy building flush-out (14,000 ft\u00B3/ft\u00B2 outdoor air) or baseline IAQ testing',
      },
      {
        id: 'EQ-5',
        category: 'Indoor Environmental Quality',
        name: 'Thermal Comfort',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Individual climate controls in all guest rooms (VRF zones); thermal comfort survey commitment per ASHRAE 55',
      },
      {
        id: 'EQ-6',
        category: 'Indoor Environmental Quality',
        name: 'Interior Lighting',
        maxPoints: 2,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'High CRI (>90) LED lighting with dimming controls in guest rooms and common areas; task/ambient layering',
      },
      {
        id: 'EQ-7',
        category: 'Indoor Environmental Quality',
        name: 'Daylight',
        maxPoints: 3,
        prerequisite: false,
        targetPoints: 2,
        status: 'likely',
        strategy: 'Floor-to-ceiling glazing in corridors and lobby; 55%+ regularly occupied spaces achieve 300+ lux sDA',
        barbadosNotes: 'Strong Caribbean daylight must be balanced with glare control — external shading and low-E glass',
      },
      {
        id: 'EQ-8',
        category: 'Indoor Environmental Quality',
        name: 'Quality Views',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Ocean and garden views from 75%+ of guest rooms and regularly occupied staff spaces',
        barbadosNotes: 'West coast orientation provides premium Caribbean sea views',
      },
      {
        id: 'EQ-9',
        category: 'Indoor Environmental Quality',
        name: 'Acoustic Performance',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'STC 50+ between guest rooms, STC 55+ to corridors; background noise NC 35 in guest rooms per YOTEL brand standards',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INNOVATION (6 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Innovation',
    abbreviation: 'IN',
    maxPoints: 6,
    credits: [
      {
        id: 'IN-1',
        category: 'Innovation',
        name: 'Innovation: Green Cleaning Policy',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Comprehensive green cleaning program using EcoLogo/Green Seal certified products; staff training protocol',
      },
      {
        id: 'IN-2',
        category: 'Innovation',
        name: 'Innovation: Integrative Analysis of Building Materials',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Whole-building LCA integrated into design decisions with documented material selection process',
      },
      {
        id: 'IN-3',
        category: 'Innovation',
        name: 'Innovation: Social Equity within the Community',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Local workforce hiring commitment (80%+ Barbadian), skills training program, community engagement',
        barbadosNotes: 'Aligns with Barbados Employment Rights Act and BTII tourism development goals',
      },
      {
        id: 'IN-4',
        category: 'Innovation',
        name: 'Innovation: Bird Collision Deterrence',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'Low-rise design reduces risk; not pursuing formal credit',
      },
      {
        id: 'IN-5',
        category: 'Innovation',
        name: 'LEED Accredited Professional',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'LEED AP BD+C on project team',
      },
      {
        id: 'IN-6',
        category: 'Innovation',
        name: 'Innovation: Pilot Credit',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 0,
        status: 'not-pursuing',
        strategy: 'No pilot credits identified at this stage',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // REGIONAL PRIORITY (4 points)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: 'Regional Priority',
    abbreviation: 'RP',
    maxPoints: 4,
    credits: [
      {
        id: 'RP-1',
        category: 'Regional Priority',
        name: 'Regional Priority: Water Efficiency',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Water efficiency is a regional priority for Caribbean island nations with limited freshwater',
        barbadosNotes: 'Barbados is one of the most water-scarce countries in the Americas — WE credits are RP eligible',
      },
      {
        id: 'RP-2',
        category: 'Regional Priority',
        name: 'Regional Priority: Renewable Energy',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'On-site renewable energy generation addresses Caribbean fossil fuel dependency',
        barbadosNotes: 'Aligns with Barbados 2030 Renewable Energy Target and Paris Agreement NDC',
      },
      {
        id: 'RP-3',
        category: 'Regional Priority',
        name: 'Regional Priority: Rainwater Management',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'likely',
        strategy: 'Stormwater management critical for island resilience and reef protection',
        barbadosNotes: 'Protects nearshore coral reef ecosystems from construction and operational runoff',
      },
      {
        id: 'RP-4',
        category: 'Regional Priority',
        name: 'Regional Priority: Heat Island Reduction',
        maxPoints: 1,
        prerequisite: false,
        targetPoints: 1,
        status: 'possible',
        strategy: 'Heat island reduction supports thermal comfort in tropical climate',
      },
    ],
  },
]

// ── Derived helpers ─────────────────────────────────────────────────────

export function getAllCredits(): LEEDCredit[] {
  return LEED_CATEGORIES.flatMap((c) => c.credits)
}

export function getTargetedPoints(): number {
  return getAllCredits().reduce((sum, c) => sum + c.targetPoints, 0)
}

export function getLikelyPoints(): number {
  return getAllCredits()
    .filter((c) => c.status === 'achieved' || c.status === 'likely')
    .reduce((sum, c) => sum + c.targetPoints, 0)
}

export function getPossiblePoints(): number {
  return getAllCredits()
    .filter((c) => c.status !== 'not-pursuing')
    .reduce((sum, c) => sum + c.targetPoints, 0)
}

export function getPrerequisitesMet(): { met: number; total: number } {
  const prereqs = getAllCredits().filter((c) => c.prerequisite)
  const met = prereqs.filter((c) => c.status === 'achieved').length
  return { met, total: prereqs.length }
}

export function getCategoryStats(category: LEEDCategory) {
  const targeted = category.credits.reduce((s, c) => s + c.targetPoints, 0)
  const maxAvailable = category.credits
    .filter((c) => !c.prerequisite)
    .reduce((s, c) => s + c.maxPoints, 0)
  return { targeted, maxAvailable }
}

/** LEED v4.1 BD+C: Hospitality max possible = 110 */
export const LEED_MAX_POINTS = 110
