/** FF&E schedule — furniture, fixtures & equipment.
 *  Caribbean-specific: humidity-resistant, UV-stable, salt-air durable.
 *  Sources: YOTEL brand standards, Caribbean hospitality FF&E benchmarks. */
export const FFE = {
  /** Per-room allowances by room type (USD) */
  rooms: {
    yotelPremiumQueen: {
      furniture: 4200,    // smart bed, desk, storage, luggage rack
      fixtures: 3800,     // bathroom fixtures, mirror, shower screen
      equipment: 2500,    // TechnoWall, smart TV, mood lighting, AC unit
      textiles: 1800,     // linens, curtains, towels
      accessories: 700,   // minibar, safe, hangers, amenity kit
      total: 13000,
    },
    yotelFirstClass: {
      furniture: 6500,
      fixtures: 5200,
      equipment: 3200,
      textiles: 2400,
      accessories: 1100,
      total: 18400,
    },
    yotelpadStudio: {
      furniture: 8500,    // bed, sofa, dining, kitchenette cabinets
      fixtures: 5800,     // bathroom + kitchenette (Smeg/Electrolux)
      equipment: 4200,    // smart home, washer-dryer, full kitchen appliances
      textiles: 2200,
      accessories: 1300,  // cookware, tableware, cleaning supplies
      total: 22000,
    },
    yotelpadOneBed: {
      furniture: 12000,
      fixtures: 7500,
      equipment: 5500,
      textiles: 3200,
      accessories: 1800,
      total: 30000,
    },
  },

  /** Public area FF&E (USD) */
  publicAreas: {
    lobby_missionControl: 85000,   // reception desk, kiosk, seating, robot
    komyuniti: 120000,             // bar, lounge furniture, lighting, AV
    gym: 95000,                    // cardio, weights, flooring, mirrors
    poolDeck: 65000,               // loungers, umbrellas, cabanas, towel stations
    rooftopBar: 110000,            // bar counter, stools, lounge seating, lighting
    restaurant: 145000,            // tables, chairs, buffet, kitchen pass
    corridors: 35000,              // art, lighting, wayfinding, carpet
    backOfHouse: 25000,            // office furniture, housekeeping carts
  },

  /** Operating supplies & equipment (OS&E) — per key */
  osePerKey: 3500,                 // cleaning supplies, guest consumables, maintenance tools

  /** Replacement reserve */
  replacementReservePct: 0.04,     // 4% of revenue for FF&E reserve (industry standard)

  /** Caribbean uplift factors */
  caribbeanFactors: {
    shippingPct: 0.12,             // 12% freight + customs handling
    humiditySpec: 1.08,            // 8% premium for marine-grade materials
    installationPct: 0.06,         // 6% on-island installation labour premium
  },
} as const

/** Calculate total FF&E budget */
export function calculateFFE(yotelKeys: number, padUnits: number) {
  // Room FF&E (weighted average by room mix)
  const ytAvg = FFE.rooms.yotelPremiumQueen.total * 0.79 + FFE.rooms.yotelFirstClass.total * 0.21
  const padAvg = FFE.rooms.yotelpadStudio.total * 0.74 + FFE.rooms.yotelpadOneBed.total * 0.26
  const roomFFE = (yotelKeys * ytAvg) + (padUnits * padAvg)

  // Public area FF&E
  const publicFFE = Object.values(FFE.publicAreas).reduce((a, b) => a + b, 0)

  // OS&E
  const ose = (yotelKeys + padUnits) * FFE.osePerKey

  // Sub-total before Caribbean factors
  const subtotal = roomFFE + publicFFE + ose

  // Caribbean uplift
  const shipping = subtotal * FFE.caribbeanFactors.shippingPct
  const humidityPremium = subtotal * FFE.caribbeanFactors.humiditySpec - subtotal
  const installation = subtotal * FFE.caribbeanFactors.installationPct

  const total = subtotal + shipping + humidityPremium + installation

  return {
    roomFFE: Math.round(roomFFE),
    publicFFE: Math.round(publicFFE),
    ose: Math.round(ose),
    subtotal: Math.round(subtotal),
    shipping: Math.round(shipping),
    humidityPremium: Math.round(humidityPremium),
    installation: Math.round(installation),
    total: Math.round(total),
    perKey: Math.round(total / (yotelKeys + padUnits)),
  }
}
