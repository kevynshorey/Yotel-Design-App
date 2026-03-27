/**
 * Mt Brevitor Estates — Investment-Grade Masterplan Specification v3
 *
 * Benchmarked against:
 *   The Lakes Dubai (Emaar)       — hub+cluster model, 4-level road hierarchy
 *   Arabian Ranches Dubai (Emaar) — polo/golf anchor, sub-cluster pools
 *   Royal Westmoreland Barbados   — golf-led premium, plantation club
 *   Apes Hill Barbados            — hilltop, west coast views, lot sales
 *   Sandy Lane Estate Barbados    — ultra-premium Caribbean precedent
 *
 * Principle: Amenity hierarchy is fractal.
 *   Level 1 — Estate Hub (500m+) : supermarket, medical, 50m pool, gym, courts
 *   Level 2 — Cluster Pool (150-300m) : each cluster owns a pool + pavilion
 *   Level 3 — Street Pocket (50m) : seating, shade, planting, bike racks
 */

// ── Road Hierarchy ──────────────────────────────────────────────────────────

export const ROAD_HIERARCHY = [
  {
    level: 1,
    name: 'Estate Boulevard',
    description: 'Estate Boulevard enters from north gate (French Village/Mt Brevitor Road), sweeps SE toward hub at reservoir, then branches to cluster collectors. 8m wide, coral stone edging, double row royal palms.',
    totalLengthKm: 2.5,
    carriageway: 8,        // metres, 2 lanes
    footpath: 2,           // metres each side
    cycleLane: 0,          // shared carriageway at 30km/h (sufficient)
    speedLimitKmh: 30,
    median: true,
    medianWidth: 2,        // planted median with royal palms + bougainvillea
    lighting: 'LED cobra-head 30m spacing',
    drainage: 'Kerb + channel, 1-in-50-year design storm',
    surface: 'Asphalt with stamped concrete at intersections',
    notes: 'Connects gatehouse → hub → all 6 cluster entries → farm/X Range access road',
  },
  {
    level: 2,
    name: 'Cluster Collector Road',
    description: 'Secondary road — connects each cluster to the boulevard',
    totalLengthKm: 3.2,    // ~500-600m per cluster × 6 clusters
    carriageway: 6,
    footpath: 1.5,         // metres one side (uphill side)
    speedLimitKmh: 25,
    median: false,
    lighting: 'LED bollard 20m spacing',
    drainage: 'Swale + kerb on downhill side',
    surface: 'Asphalt with coloured surface treatment at cluster entry',
    notes: 'Card/fob access at junction with boulevard. Speed table at cluster entry point.',
  },
  {
    level: 3,
    name: 'Residential Street',
    description: 'Tertiary road — internal circulation within each cluster',
    totalLengthKm: 5.5,    // shared across all clusters
    carriageway: 5,
    footpath: 0,           // shared surface — homezone design
    speedLimitKmh: 20,
    median: false,
    lighting: 'LED wall-mount on unit boundary walls',
    drainage: 'Porous paving / soakaway where terrain allows',
    surface: 'Textured block paving — speed self-regulating',
    notes: 'No footpath — shared surface with pedestrian priority. Raised plateau at play areas.',
  },
  {
    level: 4,
    name: 'Pedestrian Mews & Trails',
    description: 'Foot-only paths — connects cluster pools, hub, farm, and gully trail',
    totalLengthKm: 4.8,
    carriageway: 3,        // paved section (emergency/maintenance access only)
    footpath: 3,
    speedLimitKmh: 0,      // pedestrian + cycle only
    median: false,
    lighting: 'LED path lights 15m spacing (solar-powered)',
    drainage: 'Permeable surface, natural drainage',
    surface: 'Compacted coral stone + crushed shell (Caribbean vernacular)',
    notes: [
      'Main trail: hub → X Range/farm (~8min walk, 650m)',
      'Gully edge trail: north-south along gully buffer (scenic route, birdwatch)',
      'Cluster-to-cluster connector paths (short-cuts between adjacent clusters)',
      'All trails minimum 3m wide — accessible (DDA/ADA compliant gradient max 1:20)',
    ].join(' | '),
  },
] as const

// ── Security & Access ───────────────────────────────────────────────────────

export const SECURITY = {
  mainGatehouse: {
    position: 'north — primary site entry from French Village / Mt Brevitor Road (connecting to Ronald Mapp Highway H1)',
    staffing: '24/7 manned, 2 officers per shift',
    technology: 'Number plate recognition (ANPR), visitor management tablet, intercom to all units',
    lanes: { in: 2, out: 1 },
    visitorsLane: true,
    amenities: 'Air-conditioned booth, CCTV control room, storage',
  },
  serviceGate: {
    position: 'south — White Hall / X Range district service access (H1 frontage)',
    staffing: 'Manned 07:00-19:00 (shift), camera after hours',
    notes: 'Heavy vehicles (farm deliveries, X Range supplies) use this gate only. Keeps freight off estate boulevard.',
  },
  clusterAccess: {
    method: 'RFID fob on cluster collector road junction',
    visitors: 'Gate release via resident app or call to unit',
    backup: 'PIN code + manual override by security',
  },
  perimeter: {
    treatment: 'Natural planting buffer (bougainvillea, cactus, sea grape) — no hard wall on north/east',
    west: 'Landscape buffer on Ronald Mapp Highway H1 (western arterial frontage) — dense planting screens traffic noise',
    south: 'Rendered masonry boundary wall with estate branding (White Hall / H1 frontage)',
    north: 'Gatehouse on French Village / Mt Brevitor Road — landscaped arrival forecourt faces Vuemont Country Estate opposite',
    gully: 'Steel post-and-rail fence on gully edge — safety, not security (cliff)',
  },
} as const

// ── Per-Cluster Amenity Programme ───────────────────────────────────────────

export const CLUSTER_AMENITIES = [
  {
    clusterId: 'A',
    clusterName: 'Springhouse Green',
    theme: 'North entry cluster, arrival experience, near main gate. Ground-level condos and maisonettes face inward to cluster garden. 25m pool with splash zones serves 80 units.',
    units: 80,
    walkToCentreHub: '4 min / 320m',
    pool: {
      name: 'Springhouse Pool',
      type: '25m lap pool + splash zone',
      dimensions: '25m × 12m main + 8m splash zone',
      depth: { shallow: 1.0, deep: 1.8 },
      features: ['Lap lanes (4)', 'Children splash zone', 'Pool shower', 'Changing rooms (M+F, accessible)'],
      operatingHours: '06:00 – 21:00',
    },
    amenities: [
      { name: 'BBQ Pavilion', description: '8-bay BBQ pavilion + communal dining tables (24 covers)' },
      { name: 'Playground', description: 'Children 2-12 years, shade sails, natural rubber surface' },
      { name: 'Communal Garden', description: 'Raised bed herb + vegetable garden — residents self-manage' },
      { name: 'Bike Hub', description: 'Secure bike storage (60 bikes) + pump + basic repair tools' },
      { name: 'Car Wash Bay', description: '2 self-service bays (water recycled, solar pump)' },
      { name: 'Parcel Locker', description: '30-locker smart parcel station' },
    ],
    capexBBD: 1_200_000,
    maintenanceBBD_pa: 85_000,
    ownership: 'Homeowners Association (Cluster A) — managed collectively',
    notes: 'Phase 1 delivery — opens with model homes. Pool is marketing tool for early sales. North gate is the first impression; cluster A sets the arrival tone for the estate.',
  },
  {
    clusterId: 'B',
    clusterName: 'The Terrace',
    theme: 'West-central parkland cluster, Caribbean sea views over H1. Social terrace faces sunset. 2-3 bed townhouses on gentle slope.',
    units: 120,
    walkToCentreHub: '5 min / 400m',
    pool: {
      name: 'Terrace Pool',
      type: '25m pool + raised social terrace',
      dimensions: '25m × 10m',
      depth: { shallow: 1.2, deep: 1.8 },
      features: ['Pool bar (unmanned, residents order via app)', 'Sun terrace (30 loungers)', 'Pergola shade zone', 'Outdoor shower'],
      operatingHours: '06:00 – 22:00',
    },
    amenities: [
      { name: 'Fitness Lawn', description: 'Outdoor gym equipment (8 stations) + pull-up bars + astroturf' },
      { name: 'Community Lawn', description: '500m² lawn for informal football, yoga, events' },
      { name: 'Dog Park', description: 'Enclosed 400m² off-lead dog park with wash station' },
      { name: 'Reading Pavilion', description: 'Shaded seating with magazine library box' },
      { name: 'EV Charging', description: '4 × 7kW EV charging points (paid, solar-subsidised)' },
    ],
    capexBBD: 1_400_000,
    maintenanceBBD_pa: 90_000,
    ownership: 'HOA (Cluster B)',
    notes: 'Phase 2 delivery. Pool bar designed as self-service first (kiosk), upgradeable to staffed. West-facing terrace captures Caribbean sunset views across Ronald Mapp Highway H1.',
  },
  {
    clusterId: 'C',
    clusterName: 'The Pavilion',
    theme: 'Central cluster, hub-adjacent, faces plantation reservoir. The Pavilion pool is the estate\'s social heart — walking distance from every cluster. 30m pool + jacuzzi + signature pavilion.',
    units: 110,
    walkToCentreHub: '3 min / 240m',
    pool: {
      name: 'Pavilion Pool',
      type: '30m pool + jacuzzi + shaded pavilion',
      dimensions: '30m × 12m + 4m jacuzzi',
      depth: { shallow: 1.2, deep: 2.0 },
      features: ['Jacuzzi (8-person)', 'Covered pavilion (events, 40 covers)', 'Kitchenette for private functions', 'Outdoor shower', 'CCTV + keycard access after hours'],
      operatingHours: '06:00 – 22:00',
    },
    amenities: [
      { name: 'Pickleball Courts', description: '2 regulation pickleball courts + LED night lighting' },
      { name: 'Community Kitchen Garden', description: 'Pergola-covered outdoor kitchen + 600m² veggie garden — linked to farm supply' },
      { name: 'Yoga Deck', description: 'Teak deck 12m × 8m, views west, morning use' },
      { name: 'Communal Composting', description: 'Twin-bin system feeds kitchen garden + farm' },
      { name: 'Shaded Play', description: 'Under-5s play equipment, shaded, soft surface' },
    ],
    capexBBD: 1_800_000,
    maintenanceBBD_pa: 110_000,
    ownership: 'HOA (Cluster C)',
    notes: 'Phase 2. Pickleball here, deferred from central hub in Phase 1 (hub courts come Phase 2). Cluster C is hub-adjacent — faces plantation reservoir. Natural social centrepoint of the estate.',
  },
  {
    clusterId: 'D',
    clusterName: 'The Terrace Club',
    theme: 'Hilltop-edge cluster, transition to premium. Terrace Club faces east into the cleared hillside with open Caribbean skies above. Buggy track connects to X Range in south district. 4-bed homes on elevated cleared ground — best of both open parkland and hilltop altitude.',
    units: 55,
    walkToCentreHub: '8 min / 640m via trail',
    pool: {
      name: 'Terrace Club Pool',
      type: '30m pool + bar terrace + sundeck',
      dimensions: '30m × 14m',
      depth: { shallow: 1.2, deep: 2.0 },
      features: ['Bar service (weekly schedule, staffed)', 'Sun terrace (40 loungers)', 'Cabana rooms (4)', 'Outdoor shower + foot wash', 'After-hours keycard access'],
      operatingHours: '07:00 – 22:00 (bar 11:00 – 18:00 Fri-Sun)',
    },
    amenities: [
      { name: 'Putting Green', description: '2-hole practice green + chipping area — walk to X Range in 12 min' },
      { name: 'Bocce / Lawn Bowling', description: 'Traditional Italian bocce courts (2) + seating pavilion' },
      { name: 'Golf Buggy Track', description: 'Dedicated track from Cluster D → X Range (1.2km, lit, smooth surface)' },
      { name: 'Residents Lounge', description: 'Air-conditioned clubroom (20 covers), screen, bar — bookable for private use' },
      { name: 'EV Buggies', description: '4 shared electric golf buggies for residents (app-booked)' },
    ],
    capexBBD: 2_000_000,
    maintenanceBBD_pa: 140_000,
    ownership: 'HOA (Cluster D) + estate management company for bar',
    notes: 'Phase 3. Golf buggy track is differentiating feature — direct connection to X Range as walk-to amenity. Hilltop-edge eastern position is the transition zone from open parkland to premium cleared hilltop.',
  },
  {
    clusterId: 'E',
    clusterName: 'The Estate',
    theme: 'Eastern hilltop premium. The Estate — highest elevation on the cleared hilltop, unobstructed 270° panoramic Caribbean views west and north. Infinity edge pool at the cliff edge with nothing between you and the horizon. Concierge service. The defining address of Mt Brevitor.',
    units: 40,
    walkToCentreHub: '12 min / 960m (or buggy)',
    pool: {
      name: 'Estate Infinity Pool',
      type: 'Infinity-edge pool looking west over Barbados coast',
      dimensions: '20m × 10m + 6m jacuzzi',
      depth: { shallow: 1.2, deep: 1.6 },
      features: [
        'Infinity vanishing edge (west facing — sunset views)',
        'In-pool bar stools (6)',
        'Jacuzzi with waterfall feature (10-person)',
        'Two private cabanas (with sun lounge, shade, privacy screen)',
        'Fully staffed (pool attendant + F&B service Mon-Sun)',
        'Audio system, ambient lighting',
        'Towel + amenity service',
      ],
      operatingHours: 'Sunrise – 23:00 (staffed 08:00 – 20:00)',
    },
    amenities: [
      { name: 'Residents Pavilion', description: 'Covered open-sided pavilion, 60 covers, chef-grade outdoor kitchen, bar' },
      { name: 'Wine & Rum Cellar', description: 'Temperature-controlled cellar, 500 bottles, tasting events (monthly)' },
      { name: 'Concierge Lounge', description: 'Staffed concierge 3 days/week — car hire, yacht bookings, catering, maintenance coordination' },
      { name: 'Private Yoga Lawn', description: 'West-facing 200m² manicured lawn, yoga/meditation, sunrise/sunset use' },
      { name: 'Private Dining Pod', description: '1 chef-accessible private dining room (8-covers, bookable) — for entertaining' },
      { name: 'Direct Farm Supply', description: 'Weekly farm box delivery to all Cluster E homes (included in service charge)' },
    ],
    capexBBD: 2_800_000,
    maintenanceBBD_pa: 200_000,
    ownership: 'HOA (Cluster E) with dedicated estate manager (full-time)',
    notes: 'Phase 4. Concierge model matches Sandy Lane / Royal Westmoreland expectation for HNW buyers. Highest point on cleared eastern hilltop — maximum privacy, open sky, unobstructed 270° panoramic Caribbean outlook west. Cleared brush reveals the true prize: altitude, views, and trade-wind cooling with nothing blocking the horizon.',
  },
  {
    clusterId: 'F',
    clusterName: 'The Social Club',
    theme: 'Southern social district. The Social Club. Near White Hall heritage corridor and X Range. Community focus with rooftop terrace. YOTEL-convertible serviced apartment format.',
    units: 50,
    walkToCentreHub: '10 min / 800m',
    pool: {
      name: 'Social Club Pool',
      type: '25m pool + rooftop social deck',
      dimensions: '25m × 10m + rooftop deck above amenity building',
      depth: { shallow: 1.2, deep: 1.8 },
      features: ['Pool deck (20 loungers)', 'Rooftop terrace (if YOTEL not activated: residents only)', 'Pool bar counter', 'Outdoor shower'],
      operatingHours: '06:00 – 22:00',
    },
    amenities: [
      { name: 'Co-Working Lounge', description: '20-seat co-working space, dual screens, print/scan, air-con — convertible to YOTEL check-in desk if brand deal closes' },
      { name: 'Rooftop Terrace', description: 'NW-facing 300m² terrace — sundowners, elevated views across site' },
      { name: 'Flex Space', description: '150m² ground-floor flex space — yoga studio / community cinema / market pop-ups' },
      { name: 'Bike & Scooter Hub', description: 'Covered bike storage + 6 × electric scooter charging bays' },
      { name: 'Smart Parcel Wall', description: '40-locker automated parcel collection — YOTEL-compatible concierge tech' },
    ],
    capexBBD: 1_500_000,
    maintenanceBBD_pa: 95_000,
    ownership: 'HOA (Cluster F) — YOTEL management if deal activates',
    notes: 'Phase 2-3. Designed so YOTEL can plug in without demolition — co-working becomes check-in, flex space becomes gym/lounge. Southern position adjacent to White Hall heritage corridor and X Range district (3 min walk).',
  },
  {
    clusterId: 'G',
    clusterName: 'The Hilltop',
    theme: 'Upper hilltop residential. Eastern cleared hilltop south section — between the edge character of Cluster D and the deep premium of Cluster E. Cleared elevated ground with panoramic 270° Caribbean views. Open-sky living, altitude, trade-wind cooling. Mix of 3-bed townhouses, 4-bed homes, and 5-bed estates at the sweet spot of premium hilltop.',
    units: 50,
    walkToCentreHub: '10 min / 800m (via trail from hilltop)',
    pool: {
      name: 'Hilltop Infinity Pool',
      type: '25m pool + infinity vanishing edge facing west + jacuzzi + bar terrace',
      dimensions: '25m × 12m + 4m jacuzzi',
      depth: { shallow: 1.2, deep: 1.8 },
      features: [
        'Infinity vanishing edge (west facing — panoramic Caribbean views)',
        'Jacuzzi (8-person, trade-wind sheltered)',
        'Bar terrace (20 covers, open-sided pavilion)',
        'Sun loungers (24)',
        'Outdoor shower + foot wash',
        'After-hours keycard access',
      ],
      operatingHours: '07:00 – 22:00 (bar 11:00 – 18:00 Fri-Sun)',
    },
    amenities: [
      { name: 'Panoramic View Deck', description: 'Open-sided pavilion at the highest point on the hilltop — 270° horizon views west (Caribbean), north, and south. Covered seating for 30. Sunset events.' },
      { name: 'Hilltop Spa Pavilion', description: '2-treatment room outdoor spa, open-air design, trade-wind cooled naturally. Massage, facials, body wraps. 3 days/week staffed, bookable by all G residents.' },
      { name: 'Private Garden Plots', description: '12 private allotment plots (1 per household, ballot if oversubscribed) — farm-to-table growing. Linked to estate farm supply for seedlings and composting.' },
      { name: 'Trail Network', description: 'Direct hilltop trail connecting Cluster G to the Hub (800m, lit, accessible gradient) and to Cluster E — buggy-free pedestrian connection across the cleared hilltop.' },
      { name: 'EV Buggies', description: '4 shared electric golf buggies for residents (app-booked) — same spec as Cluster D. Trail access to Hub and X Range.' },
    ],
    capexBBD: 2_200_000,
    maintenanceBBD_pa: 160_000,
    ownership: 'HOA (Cluster G)',
    notes: 'Phase 4 — delivered alongside Cluster E. Positioned south of E on the cleared eastern hilltop, offering the premium hilltop experience at a range of price points (3-bed TH through 5-bed estate). The 270° panoramic views and trade-wind altitude are the primary driver. Trail to hub and Cluster E creates a connected hilltop precinct.',
  },
] as const

// ── Cluster Amenity Summary ─────────────────────────────────────────────────

export const CLUSTER_AMENITY_SUMMARY = {
  totalClusterAmenityCapexBBD: CLUSTER_AMENITIES.reduce((s, c) => s + c.capexBBD, 0),
  totalClusterAmenityMaintenanceBBD_pa: CLUSTER_AMENITIES.reduce((s, c) => s + c.maintenanceBBD_pa, 0),
  poolCount: CLUSTER_AMENITIES.length,  // 7 cluster pools + 1 × 50m central = 8 pools total
  totalPoolsByType: {
    infinity: 2,     // Clusters E, G
    thirtyMetre: 2,  // Clusters C, D
    twentyFiveMetre: 3, // Clusters A, B, F
  },
} as const

// ── Benchmark Comparison ────────────────────────────────────────────────────

export const BENCHMARKS = [
  {
    name: 'The Lakes, Dubai',
    developer: 'Emaar',
    country: 'UAE',
    year: '2003-2010',
    totalUnits: 3200,
    acres: 800,
    density: 4,  // units/acre overall
    pools: 'Community pool per ~300-unit neighbourhood + Central Lake walk',
    roadHierarchy: 'Arterial (9m) → Collector (7m) → Residential (5m) → Mews (3m)',
    gatedModel: 'Main gate + sub-community gates',
    centralHub: 'The Lakes Club: F&B, gym, pool, playground (open to all residents)',
    walkability: '10-min network — all units within 800m of community pool',
    relevance: 'Hub+cluster model most similar to Mt Brevitor layout. 4-level road hierarchy adopted directly.',
  },
  {
    name: 'Arabian Ranches',
    developer: 'Emaar',
    country: 'UAE',
    year: '2003-2012',
    totalUnits: 6000,
    acres: 1650,
    density: 3.6,
    pools: 'Sub-community pool per 150-300 homes. Central Village hub.',
    roadHierarchy: 'Main arterial → Community collector → Residential loop → Court',
    gatedModel: 'Perimeter wall, single manned main gate, resident card sub-gates',
    centralHub: 'Arabian Ranches Village: Carrefour, school, clinic, cafes, mosque',
    walkability: '15-min network (larger scale than Mt Brevitor)',
    relevance: 'Sub-community pool model confirmed. Commercial at gate adopted.',
  },
  {
    name: 'Royal Westmoreland',
    developer: 'Private',
    country: 'Barbados (St James)',
    year: '1994-present',
    totalUnits: 400,
    acres: 750,
    density: 0.5,
    pools: 'Golf club pool (members). Private pools at premium villas.',
    roadHierarchy: 'Main estate road → Villa access tracks',
    gatedModel: 'Staffed gatehouse, perimeter wall',
    centralHub: 'Plantation great house: restaurant, bar, pro shop, tennis, spa',
    walkability: 'Golf cart dependent (larger acreage, lower density)',
    relevance: 'Premium Barbados precedent. Confirms HNW buyer expectations. Mt Brevitor much denser + more amenity-rich.',
  },
  {
    name: 'Apes Hill',
    developer: 'Apes Hill Club',
    country: 'Barbados (St James)',
    year: '2010-present',
    totalUnits: 250,
    acres: 470,
    density: 0.5,
    pools: 'Club pool. Private pools at each villa.',
    roadHierarchy: 'Main drive → Villa access',
    gatedModel: 'Staffed gatehouse',
    centralHub: 'Golf clubhouse + spa. Tom Brady polo connection.',
    walkability: 'Buggy/car dependent',
    relevance: 'Hilltop, west-views, St James comparable. Pricing reference for premium tier.',
  },
  {
    name: 'Vuemont Country Estate',
    developer: 'Private',
    country: 'Barbados (St Peter, adjacent)',
    year: '2022-2026',
    totalUnits: 35,
    acres: 39,
    density: 0.9,
    pools: 'Community pool (35 units, 1 shared pool)',
    roadHierarchy: 'Single lane access roads',
    gatedModel: 'Gated',
    centralHub: 'None',
    walkability: 'Car dependent',
    relevance: 'Primary pricing comparable — literally adjacent on Mount Brevitor. BBD $520-$624/sf validated against Mt Brevitor products.',
  },
] as const

// ── Walking Time Matrix ─────────────────────────────────────────────────────

export const WALKING_TIMES = {
  // Speed: 10m/min baseline (relaxed pace, hilly terrain, tropical heat adjusted)
  // All times in minutes. Gate = north entry from French Village / Mt Brevitor Road.
  walkingSpeedMpm: 80,   // 80m/min = 4.8km/h (leisurely, hilly terrain adjusted)
  gate: {
    // Primary access: north gate off French Village / Mt Brevitor Road
    toClusterA: 2,      // Cluster A is immediately south of north gate
    toHub: 5,           // Hub (reservoir/plantation building) is centre-north of open land
  },
  clusters: {
    A: { toHub: 4, toClusterPool: 1, toGate: 2 },    // North entry cluster — nearest to gate
    B: { toHub: 5, toClusterPool: 1, toGate: 7 },    // West-central parkland
    C: { toHub: 3, toClusterPool: 1, toGate: 7 },    // Hub-adjacent — central cluster
    D: { toHub: 8, toClusterPool: 1, toGate: 11 },   // Hilltop edge, east
    E: { toHub: 12, toClusterPool: 1, toGate: 16 },  // Deep hilltop — furthest
    F: { toHub: 10, toClusterPool: 1, toGate: 14 },  // Southern social district
  },
  clusterToCluster: {
    A_to_B: 6,
    B_to_C: 5,
    C_to_D: 7,
    D_to_E: 6,
    E_to_F: 15,   // longest traverse — full estate diagonal
    A_to_C: 5,
    B_to_F: 9,
  },
  destinations: {
    xRange: { fromHub: 8, fromClusterF: 3, fromClusterD: 10 },
    farm: { fromHub: 6, fromClusterC: 7 },
    commercialGate: { fromHub: 5, fromClusterA: 2 },  // commercial gate = north gate area
    whiteHallCorridor: { fromClusterF: 2, fromHub: 11 },
    plantationReservoir: { fromHub: 1, fromClusterC: 3 },   // reservoir IS the hub focal point
  },
  maxWalkToPool: 100,   // all units within 100m of their cluster pool
  maxWalkToHub: 960,    // Cluster E is furthest (12 min × 80m/min) — target met
} as const

// ── Street Pocket Amenities (Level 3 — Doorstep) ───────────────────────────

export const STREET_POCKETS = {
  description: 'Every residential street (50-100m) has at least one pocket amenity node',
  spacing: 75,   // metres between pocket nodes
  standardKit: [
    'Shaded seating (2-3 persons, local hardwood bench)',
    'Planting: flowering trees (Flamboyant, Frangipani) + ground cover',
    'Recycling + waste station (colour-coded)',
    'Street lighting (solar-powered LED)',
  ],
  upgrades: {
    corners: 'Feature tree (Royal Palm or Mahogany) + seat wall',
    clusterEntry: 'Cluster ID sign + letterbox cluster + planting feature bed',
    trailJunction: 'Trail marker post + distance to hub/pool/X Range',
  },
} as const

// ── X Range District ─────────────────────────────────────────────────────────

export const X_RANGE_DISTRICT = {
  name: 'X Range Golf Entertainment District',
  brand: 'XRange LLC — Next Generation Golf Entertainment',
  venueFormat: 'XRU' as const,  // 25-35 bays, 20-25,000 SQM
  bays: 30,
  minBays: 25,
  maxBays: 35,
  totalSiteSQM: 22_000,   // ~5.5 acres within 6-8ac parcel
  buildingFootprintSQM: 3_300,  // ~110m × 30m, 2-3 storeys
  outfieldSQM: 18_700,    // ~110m × 170m grass outfield
  position: 'southern agricultural strip, inside site boundary, northern edge of 6-8ac parcel',
  orientation: 'bays face SOUTH — balls fire into agricultural outfield, away from all residential clusters. NE trade wind carries noise south.',
  buildingDescription: 'Elongated 2-storey bay building, 110m × 30m. 30 bays along south face. XR Sports Bar and Forbidden Fruit dining concept inside. Reception, pro shop, back-of-house on ground floor.',
  outfieldDescription: 'Mega Media Outfield — 110m × 170m. XRange signature illuminated target circles (10-12 targets) with connecting light-river paths. Laservision megamedia projections. High-definition mixed reality driving experience.',
  heritage: 'Southern boundary integrates with White Hall Plantation Yard heritage corridor. Heritage narrative anchors brand positioning as Caribbean landmark destination.',
  buggyTrack: 'Dedicated lit EV buggy track from Cluster D (1.2km via trail). Walk-to from hub: 10min. Direct connection reinforces estate-wide lifestyle integration.',
  technology: {
    ballTracking: 'Trackman radar — professional-grade, PGA Tour standard',
    megaMedia: 'Laservision megamedia — large-scale HD projection on outfield targets',
    gamingSystem: 'XRange Real World Gaming — Bay vs Bay play, XR Handicap System, Personalized XR Avatars',
    gameModes: ['Foot-baller', 'Range Racer', 'Hoop-shot', 'Combat', 'Swinging Sixes', 'XRange Golf Courses', 'Community Challenges'],
  },
  foodBeverage: {
    primary: 'XR Sports Bar — sports bar with direct bay views, leaderboard displays',
    secondary: 'Forbidden Fruit — IP dining concept, Caribbean-localized menu',
    capacity: '120 covers F&B + 30 bays',
  },
  capexBBD: 8_500_000,   // construction + XRange fit-out + technology + F&B
  annualRevenueBBD: 3_600_000,  // conservative: 30 bays × 12hr × 340 days × ~30% occupancy × $25/hr bay rental + F&B
  annualEBITDA_BBD: 900_000,   // ~25% EBITDA margin
  marketingNarrative: 'First XRange venue in the Caribbean. Flagship destination for golf tourism across Barbados and the Eastern Caribbean. Corporate events, weddings, resort day passes, and resident membership.',
  phases: [1, 2],
  operator: 'XRange LLC (LOI pending — operator terms O-02 critical risk)',
  competitiveEdge: 'No comparable golf entertainment facility exists within 500 miles. Barbados golf tourism market (Royal Westmoreland, Apes Hill, Rockley) is traditional — XRange opens a completely new segment.',
} as const

// ── Phasing of Amenity Delivery ─────────────────────────────────────────────

export const AMENITY_DELIVERY_PHASING = [
  {
    phase: 1,
    period: 'Q3 2025 - Q2 2026',
    amenities: [
      'Cluster A pool (Springhouse) — opens with Phase 1 units',
      'Central Hub (skeleton): supermarket + clinic + gym + 50m pool',
      'Main gatehouse (permanent)',
      'Estate boulevard (full loop — enables construction access)',
      'Farm operational — first crop season',
      'Security perimeter (south + main road)',
    ],
    note: 'Phase 1 amenity delivery is the #1 marketing tool. Pool + gatehouse + hub must open same day as model homes.',
  },
  {
    phase: 2,
    period: 'Q3 2026 - Q2 2027',
    amenities: [
      'Cluster B pool (The Terrace)',
      'Cluster C pool (The Pavilion)',
      'Cluster C pickleball courts',
      'Cluster F pool (Social Club)',
      'X Range Golf operational (25 bays + bar)',
      'Central Hub expansion: events hall + nursery + additional courts',
      'Golf buggy track to X Range (shared use — Cluster D priority)',
      'Gully trail (full north-south section)',
    ],
    note: 'X Range opening is Phase 2 flagship event — press event, social media.',
  },
  {
    phase: 3,
    period: 'Q3 2027 - Q2 2028',
    amenities: [
      'Cluster D pool (Terrace Club) + putting green + buggy fleet',
      'Commercial lots at gate (retail fit-out by tenants)',
      'Solar array at full capacity (2-3 MW)',
      'Full pedestrian trail network connected',
      'Farm at full scale (aquaponics + dairy)',
    ],
    note: 'Cluster D golf buggy track opens — first physical link between residential premium and X Range.',
  },
  {
    phase: 4,
    period: 'Q3 2028 - Q4 2028+',
    amenities: [
      'Cluster E infinity pool (The Estate)',
      'Estate residents pavilion + wine cellar',
      'Concierge service activated',
      'YOTEL determination: if deal closed, Cluster F conversion begins',
      'Farm: direct supply programme to all cluster HOAs',
    ],
    note: 'Cluster E is the prestige capstone — launch event for final phase.',
  },
] as const

// ── Hurricane & Climate Resilience (Research-validated) ─────────────────────

export const HURRICANE_RESILIENCE = {
  designStandard: 'Category 3+ hurricane-rated (all structures)',
  emergencyShelter: {
    location: 'Central Community Hub — events hall + gym designation',
    capacity: '10-15% of residents (65-100 persons)',
    features: [
      'Reinforced concrete construction (200mph+ wind rating)',
      'Hurricane shutters on all openings',
      'Backup generator (72-hour fuel reserve)',
      'Water storage (5,000 gallons potable reserve)',
      'Emergency communication system (satellite phone + VHF radio)',
      'First aid station + AED',
      'Non-perishable food store (48-hour supply for capacity)',
    ],
    activation: 'Hurricane Watch trigger — managed by estate security/management',
  },
  structuralDesign: {
    roofSpec: 'Hip roof preferred (better wind resistance than gable). Metal strap all rafters to wall plates.',
    openings: 'Impact-resistant glazing or hurricane shutter system on all units',
    foundation: 'Reinforced strip or raft foundation — depth per geotechnical survey',
    cladding: 'No vinyl siding. Rendered block, timber boarding with hurricane clips, or fibre-cement.',
  },
  landscapeResilience: {
    matureTreeRetention: 'Retain all existing mature trees with trunk diameter >30cm — natural windbreaks reduce gusts 20-40% within 6-12 tree diameters',
    speciesSelection: 'Native hurricane-resistant species: Mahogany, Sea Grape, Casuarina, Flamboyant (deep root systems)',
    avoidSpecies: 'No coconut palms on primary walkways (falling fronds/nuts in storms)',
    bufferPlanting: 'Dense windbreak hedge on north-east perimeter (trade wind direction) — 3m+ mature height',
  },
  utilities: {
    power: 'All electrical infrastructure underground (no overhead lines within estate)',
    water: 'Gravity-fed backup from elevated tank at WTP site',
    communications: 'Fibre-optic backbone underground, cellular backup',
  },
} as const

// ── Rainwater & Water Management (Research-validated) ───────────────────────

export const WATER_MANAGEMENT = {
  rainwaterHarvesting: {
    clusterLevel: 'Each cluster amenity building has 5,000-gallon cistern — collects roof runoff for pool top-up + landscape irrigation',
    totalCisternCapacity: 30_000,  // gallons across 6 clusters
    roofCollection: 'All cluster pavilions + hub buildings have gutter + downpipe to cistern',
    use: 'Non-potable: pool top-up, landscape irrigation, car wash bays, toilet flushing in amenity buildings',
  },
  stormwater: {
    design: '1-in-50-year event capacity',
    primary: 'Swale + retention basin system along estate boulevard median and green buffers',
    secondary: 'Gully acts as natural stormwater conveyance corridor (eastern boundary)',
    permeable: 'Residential streets (Level 3) use permeable block paving — reduces peak runoff 30-40%',
    retentionPonds: '2 × retention ponds: one at hub (ornamental, 800m²), one at farm (irrigation reserve, 1,200m²)',
  },
  greywaterReuse: {
    source: 'All cluster pool backwash + amenity building sinks',
    treatment: 'Sand filter + UV at cluster level',
    use: 'Landscape irrigation within cluster',
  },
  waterTreatmentPlant: {
    capacity: 280_000,  // gallons/day (235K demand + 20% buffer)
    effluentReuse: 'Treated effluent to farm irrigation (40%) + landscape irrigation (30%) + gully discharge (30%)',
  },
} as const

// ── Existing Site Features (Satellite-confirmed) ────────────────────────────

export const EXISTING_SITE_FEATURES = {
  reservoirPond: {
    type: 'plantation_reservoir' as const,
    location: 'north-central open parkland',
    estimatedSizeM2: 1_200,
    designRole: 'Community hub focal point — hub plaza faces the water. Existing landscape amenity, no capex required for water body itself.',
    requiredWork: 'Dredge + line + landscape surrounds + lighting. Estimate BBD 400-600K.',
  },
  plantationBuilding: {
    type: 'heritage_structure' as const,
    location: 'central parkland, near reservoir',
    designRole: 'Restore as Estate Club — concierge, wine cellar, private dining, heritage interpretation. Unique differentiator vs competing developments.',
    requiredWork: 'Structural survey + restoration. Estimate BBD 1.2-2.5M depending on condition.',
    narrativeValue: 'Connects estate to centuries of Mount Brevitor plantation history. Foster + Partners precedent: Speyside + Compton Verney adaptive reuse.',
  },
  plantationEstateDrive: {
    type: 'existing_track' as const,
    location: 'loops through open parkland into elevated cleared hilltop',
    designRole: 'Existing circulation pattern informs boulevard and collector road layout. Design follows the land.',
    requiredWork: 'Widen to 8m boulevard standard. Retain characteristic curves — they follow topography.',
  },
  whiteHallPlantationYard: {
    type: 'adjacent_heritage' as const,
    location: 'southern boundary on Ronald Mapp Hwy H1',
    designRole: 'Heritage narrative anchor for Cluster F (Social) and X Range District. Community history trail connects estates. Potential partnership for heritage tourism.',
  },
} as const

// ── Competitive Position Metrics (Research-validated) ───────────────────────

export const COMPETITIVE_METRICS = {
  poolToUnitRatio: { mbe: '1:62', uaeBest: '1:164 (Yas Acres)', barbadosBest: '1:250 (Apes Hill)' },
  openSpacePerUnit: { mbe: '3,000 sf/unit', uaeAvg: '1,500-2,650 sf/unit' },
  roadHierarchyLevels: { mbe: 4, barbadosAvg: 2, uaeStandard: 4 },
  maxWalkToAmenityMin: { mbe: 12, uaeAvg: 15, barbadosAvg: 'Golf cart dependent' },
  densityUnitsPerAcre: { mbe: 3.6, arabianRanches: 3.6, royalWestmoreland: 0.5 },
  marketGapsFilled: 10,  // pools, roads, farm, golf format, solar, concierge, co-working, trails, heritage building, water body
  landCostPerAcre_BBD: 77_083,  // BBD 9.25M / 120 acres — structural cost advantage
  gateOrientation: 'north',  // Primary entry from French Village / Mt Brevitor Road → Ronald Mapp Hwy H1
  heritageBuilding: true,    // plantation-era building restored as Estate Club — unique in Caribbean
  existingWaterBody: true,   // plantation reservoir as hub focal point — no capex for water amenity
  competitiveAdvantage: 'Most amenity-rich residential development in Barbados history. Per-cluster pool model unprecedented in Caribbean. Only estate with restored plantation building as Estate Club and existing water body as hub focal point.',
} as const
