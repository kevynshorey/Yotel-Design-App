// ── Competitive Comp Set — Caribbean Hotel Market ─────────────────────
// Real comparable properties for YOTEL Barbados positioning analysis.

export interface CompProperty {
  name: string
  location: string
  brand: string
  keys: number
  yearOpened: number
  adr: number        // USD average daily rate
  costPerKey: number  // USD estimated development cost per key
  stars: number
  type: 'resort' | 'urban' | 'mixed'
  notes: string
}

export const COMP_SET: CompProperty[] = [
  {
    name: 'Hyatt Ziva Barbados',
    location: 'Carlisle Bay, Barbados',
    brand: 'Hyatt',
    keys: 350,
    yearOpened: 2021,
    adr: 380,
    costPerKey: 520_000,
    stars: 5,
    type: 'resort',
    notes: 'Adjacent site. All-inclusive resort + 16 branded residences. Precedent for large-scale SDA hotel.',
  },
  {
    name: 'Sandals Royal Barbados',
    location: 'Maxwell Coast, Barbados',
    brand: 'Sandals',
    keys: 222,
    yearOpened: 2017,
    adr: 450,
    costPerKey: 480_000,
    stars: 5,
    type: 'resort',
    notes: 'All-inclusive adults-only. Premium pricing but limited local market crossover.',
  },
  {
    name: 'Hilton Barbados Resort',
    location: 'Needhams Point, Barbados',
    brand: 'Hilton',
    keys: 350,
    yearOpened: 2005,
    adr: 280,
    costPerKey: 320_000,
    stars: 4,
    type: 'resort',
    notes: 'Established full-service resort. Government-adjacent location. Recently renovated.',
  },
  {
    name: 'O2 Beach Club & Spa',
    location: 'Dover, Christ Church, Barbados',
    brand: 'Independent',
    keys: 130,
    yearOpened: 2021,
    adr: 360,
    costPerKey: 440_000,
    stars: 4,
    type: 'resort',
    notes: 'Boutique lifestyle positioning. Strong social media presence. South coast location.',
  },
  {
    name: 'Courtyard by Marriott Bridgetown',
    location: 'Hastings, Barbados',
    brand: 'Marriott',
    keys: 118,
    yearOpened: 2015,
    adr: 195,
    costPerKey: 280_000,
    stars: 3,
    type: 'urban',
    notes: 'Closest urban hotel comp. Business + leisure mix. Lower ADR but strong occupancy.',
  },
  {
    name: 'YOTEL Miami',
    location: 'Miami, FL, USA',
    brand: 'YOTEL',
    keys: 222,
    yearOpened: 2022,
    adr: 175,
    costPerKey: 240_000,
    stars: 3,
    type: 'urban',
    notes: 'Brand reference. Tech-forward, compact rooms, rooftop F&B. Demonstrates YOTEL at scale in warm market.',
  },
  {
    name: 'citizenM Miami Worldcenter',
    location: 'Miami, FL, USA',
    brand: 'citizenM',
    keys: 351,
    yearOpened: 2022,
    adr: 190,
    costPerKey: 260_000,
    stars: 3,
    type: 'urban',
    notes: 'Competitor brand. Modular construction, compact luxury, strong digital. Direct YOTEL competitor.',
  },
  {
    name: 'Accor Tribe Nassau',
    location: 'Nassau, Bahamas',
    brand: 'Accor Tribe',
    keys: 150,
    yearOpened: 2024,
    adr: 165,
    costPerKey: 230_000,
    stars: 3,
    type: 'urban',
    notes: 'Competitor brand. Lifestyle economy positioning. Caribbean urban context comparable to Bridgetown.',
  },
  {
    name: 'AC Hotel Kingston',
    location: 'Kingston, Jamaica',
    brand: 'Marriott AC',
    keys: 219,
    yearOpened: 2021,
    adr: 180,
    costPerKey: 270_000,
    stars: 3,
    type: 'urban',
    notes: 'Caribbean urban lifestyle hotel. Business traveller focus with leisure crossover.',
  },
  {
    name: 'Kimpton Grand Cayman',
    location: 'Grand Cayman, Cayman Islands',
    brand: 'IHG Kimpton',
    keys: 266,
    yearOpened: 2023,
    adr: 340,
    costPerKey: 490_000,
    stars: 4,
    type: 'mixed',
    notes: 'Lifestyle resort. Demonstrates premium pricing in high-end Caribbean island market.',
  },
]

// ── YOTEL Barbados positioning (for comparison row) ───────────────────
export const YOTEL_BARBADOS: CompProperty = {
  name: 'YOTEL Barbados (Proposed)',
  location: 'Carlisle Bay, Bridgetown, Barbados',
  brand: 'YOTEL',
  keys: 130, // minimum viable from generator
  yearOpened: 2028, // target opening
  adr: 210,
  costPerKey: 285_000,
  stars: 3,
  type: 'mixed',
  notes: 'Tech-forward lifestyle hotel + YOTELPAD residences. Compact luxury at accessible price point.',
}

// ── Competitive Advantages ────────────────────────────────────────────
export const COMPETITIVE_ADVANTAGES = [
  { advantage: 'Cost per key 30-45% below luxury comps', detail: 'YOTEL modular design + compact rooms reduce construction cost vs. Hyatt Ziva / Sandals' },
  { advantage: 'ADR positioned in underserved mid-market', detail: '$200-220 ADR targets gap between Courtyard ($195) and resort tier ($350+)' },
  { advantage: 'Technology-first operations', detail: 'Self-check-in kiosks, app-controlled rooms, robotic luggage storage reduce staffing costs' },
  { advantage: 'Mixed-use revenue diversification', detail: 'YOTELPAD residences provide upfront sales revenue + recurring management fees' },
  { advantage: 'SDA tax incentives', detail: 'Duty-free imports + income tax holiday reduce effective development cost (pending confirmation)' },
  { advantage: 'Beachfront location at urban price point', detail: 'Carlisle Bay frontage typically commands $400+ ADR; YOTEL delivers at $210' },
]
