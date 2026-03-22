/** Landscape architecture — tropical Caribbean planting + hardscape.
 *  Species selected for Barbados: salt-tolerant, hurricane-resistant, drought-adapted.
 *  Sources: Barbados National Trust plant guide, CZMU coastal species list. */
export const LANDSCAPE = {
  /** Tropical planting zones */
  plantingZones: [
    { name: 'Coastal Buffer', species: ['Coccoloba uvifera (Sea Grape)', 'Conocarpus erectus (Buttonwood)', 'Suriana maritima (Bay Cedar)'], depthM: 5, purpose: 'CZMU coastal protection + wind break' },
    { name: 'Pool Deck', species: ['Cocos nucifera (Coconut Palm)', 'Plumeria spp. (Frangipani)', 'Bougainvillea spp.'], depthM: 3, purpose: 'Shade + tropical ambiance' },
    { name: 'Entry Landscape', species: ['Roystonea regia (Royal Palm)', 'Heliconia spp.', 'Alpinia purpurata (Red Ginger)'], depthM: 4, purpose: 'Arrival experience' },
    { name: 'Green Roof', species: ['Sedum spp.', 'Zoysia grass', 'Native succulents'], depthM: 0.3, purpose: 'Stormwater retention + insulation' },
  ],

  /** Hardscape specifications */
  hardscape: {
    poolDeckFinish: 'porcelain_antislip' as const,  // large format, salt resistant
    pathways: 'coral_stone_pavers' as const,         // local material, vernacular
    driveways: 'permeable_pavers' as const,           // stormwater management
    retainingWalls: 'coral_stone_block' as const,
  },

  /** Cost rates (USD/m²) */
  costs: {
    softscapePerM2: 85,         // planting, soil prep, mulch, establishment
    hardscapePerM2: 165,        // paving, edging, drainage channels
    irrigationPerM2: 35,        // drip systems, valves, controllers, rain sensors
    greenRoofPerM2: 120,        // substrate, membrane, planting, drainage layer
    matureTreeEach: 2500,       // specimen palms (3m+ clear trunk)
    lightingPerM2: 45,          // landscape lighting (LED, bollards, uplights)
  },

  /** Maintenance (annual, first 3 years establishment) */
  maintenanceAnnual: {
    year1: 65000,  // intensive establishment watering + replacements
    year2: 45000,
    year3: 35000,
    ongoing: 28000,
  },
} as const

/** Calculate landscape areas and costs from site metrics */
export function calculateLandscape(
  siteGrossArea: number,
  buildingFootprint: number,
  poolTotalArea: number,
) {
  const totalOpenSpace = siteGrossArea - buildingFootprint
  const softscapeArea = Math.round(totalOpenSpace * 0.35)    // 35% planted
  const hardscapeArea = Math.round(totalOpenSpace * 0.40)    // 40% paved (paths, decks, drives)
  const poolArea = Math.round(poolTotalArea)                  // pool zone
  const remainingArea = totalOpenSpace - softscapeArea - hardscapeArea - poolArea  // buffer/utility
  const greenRoofArea = Math.round(buildingFootprint * 0.25) // 25% of rooftop as green roof
  const matureTrees = Math.round(softscapeArea / 80)          // 1 specimen tree per 80m² softscape

  const costs = {
    softscape: softscapeArea * LANDSCAPE.costs.softscapePerM2,
    hardscape: hardscapeArea * LANDSCAPE.costs.hardscapePerM2,
    irrigation: (softscapeArea + greenRoofArea) * LANDSCAPE.costs.irrigationPerM2,
    greenRoof: greenRoofArea * LANDSCAPE.costs.greenRoofPerM2,
    matureTrees: matureTrees * LANDSCAPE.costs.matureTreeEach,
    lighting: hardscapeArea * LANDSCAPE.costs.lightingPerM2,
  }

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0)

  return {
    totalOpenSpace, softscapeArea, hardscapeArea, poolArea, greenRoofArea,
    matureTrees, remainingArea, costs, totalCost,
  }
}
