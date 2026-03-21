// Amenity programming calculator for YOTEL Barbados
// Calculates pool areas, rooftop decks, restaurants, and lounger capacity

export interface PoolConfig {
  waterArea: number       // sqm of pool water surface
  deckArea: number        // sqm of surrounding deck
  totalArea: number       // water + deck
  type: 'ground' | 'rooftop' | 'both'
  hasInfinityEdge: boolean
  hasSwimUpBar: boolean
  position: { x: number; z: number; width: number; depth: number }
}

export interface RooftopConfig {
  totalArea: number       // sqm
  barArea: number         // sqm
  loungeArea: number      // sqm
  poolArea: number        // sqm (rooftop pool if applicable)
  loungerCount: number
  hasPool: boolean
  hasCabanas: boolean
}

export interface RestaurantConfig {
  indoorArea: number      // sqm
  outdoorArea: number     // sqm (covered open-air)
  totalSeats: number
  type: 'all-day' | 'specialty' | 'beach-bar'
  position: { x: number; z: number; width: number; depth: number }
}

export interface AmenityProgramme {
  pool: PoolConfig
  rooftopDeck: RooftopConfig
  restaurant: RestaurantConfig
  totalAmenityArea: number // sqm
  loungerCapacity: number
  amenityScore: number     // 0-1
}

export function calculateAmenities(
  totalKeys: number,
  footprint: number,
  buildingHeight: number,
  rooftopArea: number,
  westFacade: number,
  _form: string,
): AmenityProgramme {
  // Pool sizing: 1.5-2.0 sqm water per key, deck = 2.5x water area
  const poolWaterArea = Math.min(250, Math.max(150, totalKeys * 1.7))
  const poolDeckArea = poolWaterArea * 2.5

  // Pool position: west of building (beach side), 3m gap
  // Width along facade, depth toward beach
  const poolWidth = Math.min(westFacade * 0.6, 25) // max 25m along facade
  const poolDepth = poolWaterArea / poolWidth

  // Rooftop deck: uses full rooftop footprint + any additional cantilevered area
  const rooftopTotal = Math.max(rooftopArea, footprint * 0.7) // at least 70% of floor plate
  const rooftopBarArea = 35 // sqm for bar + service
  const rooftopPoolArea = buildingHeight <= 21 ? 40 : 0 // rooftop pool only if height allows
  const rooftopLoungeArea = rooftopTotal - rooftopBarArea - rooftopPoolArea

  // Sun loungers: 7 sqm per lounger (industry standard with circulation)
  const groundLoungers = Math.floor((poolDeckArea * 0.5) / 7) // 50% of deck is lounging
  const rooftopLoungers = Math.floor((rooftopLoungeArea * 0.6) / 7) // 60% of lounge is lounging
  const totalLoungers = groundLoungers + rooftopLoungers

  // Restaurant: ground level, adjacent to pool
  const restaurantOutdoor = Math.min(120, totalKeys * 0.8) // 0.8 sqm/key outdoor
  const restaurantIndoor = Math.min(80, totalKeys * 0.5)   // 0.5 sqm/key indoor (Komyuniti)
  const totalSeats = Math.floor((restaurantOutdoor + restaurantIndoor) / 1.8) // 1.8 sqm/seat

  // Amenity score (0-1): based on Caribbean resort benchmarks
  const loungerRatio = totalLoungers / totalKeys // target: 0.4-0.6
  const poolRatio = poolWaterArea / totalKeys    // target: 1.5-2.0
  const deckRatio = (poolDeckArea + rooftopTotal) / totalKeys // target: 5-8

  const loungerScore = Math.min(1, loungerRatio / 0.5)
  const poolScore = Math.min(1, poolRatio / 1.8)
  const deckScore = Math.min(1, deckRatio / 7)
  const amenityScore = loungerScore * 0.3 + poolScore * 0.4 + deckScore * 0.3

  return {
    pool: {
      waterArea: Math.round(poolWaterArea),
      deckArea: Math.round(poolDeckArea),
      totalArea: Math.round(poolWaterArea + poolDeckArea),
      type: rooftopPoolArea > 0 ? 'both' : 'ground',
      hasInfinityEdge: true, // always for Carlisle Bay (ocean views)
      hasSwimUpBar: totalKeys >= 100,
      position: { x: -poolDepth - 3, z: 0, width: poolDepth, depth: poolWidth },
    },
    rooftopDeck: {
      totalArea: Math.round(rooftopTotal),
      barArea: rooftopBarArea,
      loungeArea: Math.round(rooftopLoungeArea),
      poolArea: rooftopPoolArea,
      loungerCount: rooftopLoungers,
      hasPool: rooftopPoolArea > 0,
      hasCabanas: rooftopTotal > 400,
    },
    restaurant: {
      indoorArea: Math.round(restaurantIndoor),
      outdoorArea: Math.round(restaurantOutdoor),
      totalSeats,
      type: 'all-day',
      position: { x: -12, z: poolWidth + 3, width: 12, depth: 8 },
    },
    totalAmenityArea: Math.round(
      poolWaterArea + poolDeckArea + rooftopTotal + restaurantOutdoor + restaurantIndoor,
    ),
    loungerCapacity: totalLoungers,
    amenityScore: Math.round(amenityScore * 100) / 100,
  }
}
