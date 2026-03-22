import type { RoomType, AmenitySpace } from '@/engine/types'

export const YOTEL_ROOMS: Record<string, RoomType> = {
  Premium:     { label: 'Premium Queen',  nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.61, color: '#2E8A76' },
  Twin:        { label: 'Premium Twin',   nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.18, color: '#3BA68E' },
  FirstClass:  { label: 'First Class',    nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.12, color: '#1D6B5A' },
  Accessible:  { label: 'Accessible',     nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.09, color: '#16a34a' },
}

export const YOTELPAD_UNITS: Record<string, RoomType> = {
  Studio:           { label: 'PAD Studio',     nia: 25.0, bayWidth: 3.67, bays: 1,   pct: 0.67, color: '#B8456A' },
  OneBed:           { label: 'PAD 1-Bedroom',  nia: 40.0, bayWidth: 5.07, bays: 1.5, pct: 0.20, color: '#A03B5C' },
  TwoBed:           { label: 'PAD 2-Bedroom',  nia: 60.0, bayWidth: 6.67, bays: 2,   pct: 0.07, color: '#8A3050' },
  AccessibleStudio: { label: 'PAD Accessible', nia: 30.0, bayWidth: 4.28, bays: 1.2, pct: 0.07, color: '#16a34a' },
  SuperStar:        { label: 'SuperStar Suite', nia: 75.0, bayWidth: 8.0, bays: 2.5, pct: 0.00, color: '#c084fc' },
}

export const PROGRAMME = {
  totalKeys: 130,
  yotelKeys: 100,
  yotelpadKeys: 30,
  groundFloor: { use: 'FOH_BOH' as const, gia: 770, rooms: 0 },
  yotelFloors: { floors: [1, 2, 3], roomsPerFloor: 33 },
  yotelpadFloors: { floors: [4, 5], unitsPerFloor: 15 },
  rooftop: { use: 'ROOFTOP' as const, gia: 80 },
} as const

// ── TWO-BUILDING CAMPUS LAYOUT ──────────────────────────────────────

/** Amenity Block — Front building (closest to Bay Street / south edge).
 *  2-storey, ~400-500m² footprint. */
export const AMENITY_BLOCK_SPACES: AmenitySpace[] = [
  // Ground floor
  { name: 'Mission Control (Lobby)',  area: 80,  floor: 0, category: 'lobby' },
  { name: 'Komyuniti Restaurant/Bar', area: 245, floor: 0, category: 'food_beverage' },
  { name: 'Gym',                      area: 60,  floor: 0, category: 'fitness' },
  { name: 'Business Center',          area: 30,  floor: 0, category: 'business' },
  { name: 'Public WC',                area: 27,  floor: 0, category: 'lobby' },
  { name: 'Luggage Storage',          area: 19,  floor: 0, category: 'lobby' },
  // Upper floor
  { name: 'Recording Studio',         area: 45,  floor: 1, category: 'creative' },
  { name: 'Podcast Studio',           area: 25,  floor: 1, category: 'creative' },
  { name: 'Co-Working Space',         area: 80,  floor: 1, category: 'coworking' },
  { name: 'Private Offices',          area: 40,  floor: 1, category: 'business' },
  { name: 'Meeting Room',             area: 25,  floor: 1, category: 'business' },
  { name: 'Sim Racing Gaming Room',   area: 50,  floor: 1, category: 'entertainment' },
  { name: 'Grab & Go Supermarket',    area: 30,  floor: 0, category: 'retail' },
  { name: 'Komyuniti Lounge',         area: 35,  floor: 0, category: 'lobby' },
  { name: 'Guest Laundry',            area: 20,  floor: 0, category: 'lobby' },
]

export const AMENITY_BLOCK = {
  storeys: 2,
  targetFootprint: 450,        // m² (400-500 range)
  targetWidth: 22,             // m (E-W)
  targetDepth: 20,             // m (N-S)
  floorToFloor: 3.8,           // m (generous for lobby double-height feel)
  groundFloorHeight: 4.5,      // m
  spaces: AMENITY_BLOCK_SPACES,
  get totalGia(): number {
    return this.spaces.reduce((sum, s) => sum + s.area, 0)
  },
} as const

/** Pool Deck — central courtyard between the two buildings.
 *  Rixos-style luxury pool with cabanas, swim-up bar, tropical landscaping. */
export const POOL_DECK = {
  poolLength: 18,              // m (minimum 15m requirement exceeded)
  poolWidth: 9,                // m (minimum 8m requirement exceeded)
  poolArea: 162,               // m² water surface (18 × 9)
  deckSurround: 4,             // m minimum deck width around pool
  cabanaCount: 5,              // 4-6 range, 5 optimal
  cabanaArea: 12,              // m² each cabana
  loungerCount: 24,            // 20+ requirement met
  loungerSpacing: 7,           // m² per lounger (industry standard with circulation)
  swimUpBarSeats: 8,           // seats along pool edge
  landscapingPct: 0.25,        // 25% of total deck is tropical gardens
  get totalDeckArea(): number {
    // Pool surround + cabanas + lounger area + landscaping
    const surroundArea = (this.poolLength + 2 * this.deckSurround) * (this.poolWidth + 2 * this.deckSurround) - this.poolArea
    const cabanaArea = this.cabanaCount * this.cabanaArea
    const loungerArea = this.loungerCount * this.loungerSpacing
    const subtotal = surroundArea + cabanaArea + loungerArea
    return Math.round(subtotal * (1 + this.landscapingPct))
  },
  get totalArea(): number {
    return this.poolArea + this.totalDeckArea
  },
} as const

/** Rooftop Bar — top of residential block.
 *  Indigo Barbados style with plunge pools, 270° views, cocktail bar, DJ booth. */
export const ROOFTOP_BAR = {
  totalArea: 650,              // m² (roughly matches residential block footprint minus core)
  barArea: 45,                 // m² main cocktail bar
  djBoothArea: 12,             // m²
  loungeArea: 280,             // m² open-air lounge seating
  plungePoolCount: 3,          // individual plunge pools
  plungePoolArea: 8,           // m² each
  diningArea: 80,              // m² alfresco dining
  kitchenArea: 25,             // m² rooftop prep kitchen
  wcArea: 18,                  // m² restrooms
  storageArea: 10,             // m²
  capacity: 120,               // persons
  has270Views: true,
} as const

/** Residential Block floor programme — floors 0 through 6 (7 storeys total).
 *  Ground = BOH, 1-3 = YOTEL, 4-5 = YOTELPAD, 6 = Rooftop bar. */
export const RESIDENTIAL_PROGRAMME = {
  storeys: 7,                  // including ground + rooftop
  targetFootprint: 900,        // m² (800-1000 range)
  targetWidth: 36,             // m (E-W)
  targetDepth: 25,             // m (N-S)
  groundFloorUse: 'BOH' as const,
  yotelFloors: [1, 2, 3],
  yotelpadFloors: [4, 5],
  rooftopFloor: 6,
  roomsPerYotelFloor: 33,
  unitsPerPadFloor: 15,
  floorToFloor: 3.2,           // m (upper floors)
  groundFloorHeight: 4.5,      // m
} as const
