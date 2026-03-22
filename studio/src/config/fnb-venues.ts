/** F&B venue programming — Caribbean resort hotel benchmarks.
 *  3 venues for 130-key dual-brand property at Carlisle Bay.
 *  Sources: YOTEL brand standards, Caribbean hospitality F&B ops benchmarks. */

export interface VenueConfig {
  name: string
  type: 'restaurant' | 'bar' | 'cafe' | 'pool_bar'
  location: 'ground' | 'rooftop' | 'poolside' | 'beachfront'
  concept: string
  style: string

  // Area planning
  dining: { area: number; seatsPerM2: number; totalSeats: number }
  bar: { area: number; stools: number; standingCapacity: number }
  kitchen: { area: number; type: 'full' | 'prep' | 'satellite'; kitchenToFrontRatio: number }
  storage: { area: number; coldRoom: boolean }
  terrace: { area: number; seats: number; covered: boolean }

  // Operations
  mealPeriods: string[]
  operatingHours: string
  avgCoversPerMealPeriod: number
  avgCheckUsd: number
  staffCount: number
  annualRevenueEstimate: number

  // Design
  ceilingHeightM: number
  ventilation: 'natural' | 'mechanical' | 'hybrid'
  materials: string[]
  lighting: string
}

export const VENUES: VenueConfig[] = [
  {
    name: 'Carlisle Kitchen',
    type: 'restaurant',
    location: 'ground',
    concept: 'All-day dining with Caribbean-international fusion',
    style: 'Open-plan, indoor-outdoor with retractable glass walls facing pool',

    dining: { area: 145, seatsPerM2: 1.4, totalSeats: 86 },
    bar: { area: 18, stools: 8, standingCapacity: 12 },
    kitchen: { area: 65, type: 'full', kitchenToFrontRatio: 0.40 },
    storage: { area: 22, coldRoom: true },
    terrace: { area: 85, seats: 42, covered: true },

    mealPeriods: ['Breakfast (6:30-10:30)', 'Lunch (12:00-15:00)', 'Dinner (18:00-22:00)'],
    operatingHours: '06:30 – 22:00',
    avgCoversPerMealPeriod: 65,
    avgCheckUsd: 38,
    staffCount: 18,
    annualRevenueEstimate: 2_700_000,

    ceilingHeightM: 4.5,
    ventilation: 'hybrid',
    materials: ['Coral stone feature wall', 'Tropical hardwood tables', 'Terrazzo flooring', 'Linen upholstery'],
    lighting: 'Pendant clusters + recessed ambient + candle table lighting',
  },
  {
    name: 'Sunset Bar',
    type: 'bar',
    location: 'rooftop',
    concept: 'Premium cocktail bar with 270-degree views of Carlisle Bay and Bridgetown',
    style: 'Elevated tropical — polished concrete, brass accents, living green wall',

    dining: { area: 55, seatsPerM2: 1.0, totalSeats: 32 },
    bar: { area: 28, stools: 14, standingCapacity: 25 },
    kitchen: { area: 18, type: 'prep', kitchenToFrontRatio: 0.20 },
    storage: { area: 8, coldRoom: false },
    terrace: { area: 120, seats: 48, covered: false },

    mealPeriods: ['Afternoon (14:00-17:00)', 'Sunset (17:00-20:00)', 'Evening (20:00-01:00)'],
    operatingHours: '14:00 – 01:00',
    avgCoversPerMealPeriod: 45,
    avgCheckUsd: 28,
    staffCount: 10,
    annualRevenueEstimate: 1_400_000,

    ceilingHeightM: 3.0,
    ventilation: 'natural',
    materials: ['Polished concrete bar top', 'Brass rail + fittings', 'Teak decking', 'Living green wall'],
    lighting: 'LED strip under bar + festoon strings + uplighting on greenery',
  },
  {
    name: 'Bay Beach Bar',
    type: 'pool_bar',
    location: 'poolside',
    concept: 'Casual swim-up bar with light bites, smoothies, and tropical cocktails',
    style: 'Barefoot luxury — thatched canopy, reclaimed wood, rope accents',

    dining: { area: 35, seatsPerM2: 0.8, totalSeats: 18 },
    bar: { area: 15, stools: 6, standingCapacity: 10 },
    kitchen: { area: 12, type: 'satellite', kitchenToFrontRatio: 0.25 },
    storage: { area: 5, coldRoom: false },
    terrace: { area: 60, seats: 24, covered: true },

    mealPeriods: ['All Day (10:00-18:00)'],
    operatingHours: '10:00 – 18:00',
    avgCoversPerMealPeriod: 55,
    avgCheckUsd: 18,
    staffCount: 6,
    annualRevenueEstimate: 650_000,

    ceilingHeightM: 3.5,
    ventilation: 'natural',
    materials: ['Reclaimed timber bar', 'Synthetic thatch canopy', 'Marine-grade stainless steel', 'Rope detailing'],
    lighting: 'Under-canopy LED strips + hurricane lanterns',
  },
]

/** Summary calculations */
export function calculateFnbSummary() {
  const totalSeats = VENUES.reduce((s, v) => s + v.dining.totalSeats + v.terrace.seats + v.bar.stools, 0)
  const totalArea = VENUES.reduce((s, v) => s + v.dining.area + v.bar.area + v.kitchen.area + v.storage.area + v.terrace.area, 0)
  const totalRevenue = VENUES.reduce((s, v) => s + v.annualRevenueEstimate, 0)
  const totalStaff = VENUES.reduce((s, v) => s + v.staffCount, 0)
  const totalKitchenArea = VENUES.reduce((s, v) => s + v.kitchen.area, 0)
  const revenuePerSeat = totalRevenue / totalSeats
  const revenuePerM2 = totalRevenue / totalArea

  return { totalSeats, totalArea, totalRevenue, totalStaff, totalKitchenArea, revenuePerSeat, revenuePerM2, venueCount: VENUES.length }
}
