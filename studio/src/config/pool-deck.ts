/** Pool Deck Programme — Caribbean beachfront resort standard.
 *  Carlisle Bay orientation: pool deck faces WEST toward ocean.
 *  Design for 130 keys with infinity edge toward Carlisle Bay. */

export interface PoolZone {
  name: string
  type: 'pool' | 'deck' | 'bar' | 'cabana' | 'splash' | 'jacuzzi' | 'service'
  area: number       // m²
  description: string
  features: string[]
  color: string       // for SVG rendering
}

export const POOL_DECK: PoolZone[] = [
  {
    name: 'Main Pool',
    type: 'pool',
    area: 180,
    description: 'Infinity-edge lap pool facing Carlisle Bay. 25m x 7.2m with variable depth 1.1m-1.6m.',
    features: [
      '25m lap length (competition short course compatible)',
      'Infinity edge on west side (ocean view)',
      'Salt-chlorinated water system',
      'LED colour-changing underwater lighting',
      'Heated to 28\u00b0C (solar-assisted)',
      'ADA-compliant entry ramp + pool lift',
    ],
    color: '#38bdf8', // sky-400
  },
  {
    name: 'Sun Shelf / Baja Step',
    type: 'pool',
    area: 35,
    description: 'Shallow wading shelf (0.15m depth) with submerged loungers for in-water relaxation.',
    features: [
      '6 submerged sun loungers',
      'Bubbler jets',
      '0.15m depth \u2014 ideal for sunbathing in water',
      'Integrated drink holders',
    ],
    color: '#7dd3fc', // sky-300
  },
  {
    name: 'Jacuzzi / Hot Tub',
    type: 'jacuzzi',
    area: 12,
    description: 'Elevated circular jacuzzi with ocean views. 8-person capacity.',
    features: [
      '3.9m diameter, 0.9m depth',
      '8-person capacity',
      'Hydrotherapy jets',
      'Elevated position for sunset views',
      'Separate filtration system',
    ],
    color: '#a78bfa', // violet-400
  },
  {
    name: 'Swim-Up Bar',
    type: 'bar',
    area: 25,
    description: 'In-water bar counter with submerged stools. Served by Bay Beach Bar kitchen.',
    features: [
      '8 submerged bar stools',
      'Granite bar counter (wet side + dry side)',
      'Speed rail, ice well, blender station',
      'Thatched shade canopy overhead',
      '4 underwater LED bar lights',
    ],
    color: '#f59e0b', // amber-500
  },
  {
    name: 'Cabana Row (6 cabanas)',
    type: 'cabana',
    area: 108,
    description: '6 private cabanas (3.6m x 3m each) with day beds, curtains, and personal service.',
    features: [
      '6 private cabanas \u2014 premium upsell ($150-250/day)',
      'King-size day bed + side table per cabana',
      'Privacy curtains (weather-resistant fabric)',
      'Ceiling fan + USB charging',
      'Mini-fridge stocked on request',
      'Call button for poolside service',
      'Annual revenue potential: ~$180,000 (60% utilisation)',
    ],
    color: '#fb923c', // orange-400
  },
  {
    name: 'Sun Lounger Deck',
    type: 'deck',
    area: 420,
    description: 'Premium hardwood deck with 80 sun loungers in rows. Porcelain anti-slip finish.',
    features: [
      '80 sun loungers (7 m\u00b2 per lounger including circulation)',
      '20 parasol umbrellas (4 loungers per umbrella)',
      'Towel station (fresh towels, chilled towels)',
      'Outdoor shower stations (2)',
      'Anti-slip porcelain tile with teak-look finish',
      'Landscape planting beds with coconut palms',
    ],
    color: '#d4b896', // warm sand
  },
  {
    name: "Children's Splash Zone",
    type: 'splash',
    area: 25,
    description: 'Interactive water play area for children. Zero-depth entry with spray features.',
    features: [
      'Zero-depth entry pad',
      '4 spray jets + 2 dump buckets',
      'Soft-surface anti-slip surround',
      'Shaded by mature tree canopy',
      'Separate from main pool (sight-line from lounger deck)',
    ],
    color: '#4ade80', // green-400
  },
  {
    name: 'Pool Equipment & Services',
    type: 'service',
    area: 45,
    description: 'Hidden service area for pool operations.',
    features: [
      'Pool pump room (circulation + filtration)',
      'Chemical dosing system (salt chlorinator)',
      'Towel laundry staging',
      'Pool maintenance equipment store',
      'First aid station with AED',
    ],
    color: '#64748b', // slate-500
  },
]

/** Calculate pool deck totals */
export function calculatePoolDeckSummary() {
  const totalArea = POOL_DECK.reduce((s, z) => s + z.area, 0)
  const waterArea = POOL_DECK.filter(z => z.type === 'pool' || z.type === 'jacuzzi' || z.type === 'splash').reduce((s, z) => s + z.area, 0)
  const deckArea = POOL_DECK.filter(z => z.type === 'deck' || z.type === 'cabana').reduce((s, z) => s + z.area, 0)
  const serviceArea = POOL_DECK.filter(z => z.type === 'bar' || z.type === 'service').reduce((s, z) => s + z.area, 0)
  const loungerCount = 80
  const cabanaCount = 6
  const swimUpStools = 8
  const submergedLoungers = 6
  const totalCapacity = loungerCount + cabanaCount * 2 + submergedLoungers // ~98 guests

  // Revenue potential
  const cabanaRevenue = cabanaCount * 200 * 365 * 0.60  // $200/day avg, 60% utilisation
  const fAndBRevenue = 650_000  // from Bay Beach Bar venue
  const totalPoolRevenue = cabanaRevenue + fAndBRevenue

  // Costs
  const constructionCost = waterArea * 1200 + deckArea * 350 + serviceArea * 800 // per m²
  const equipmentCost = 185_000 // pumps, filters, heaters, lighting
  const annualMaintenance = 95_000 // chemicals, cleaning, equipment service

  return {
    totalArea, waterArea, deckArea, serviceArea,
    loungerCount, cabanaCount, swimUpStools, submergedLoungers, totalCapacity,
    cabanaRevenue: Math.round(cabanaRevenue),
    fAndBRevenue,
    totalPoolRevenue: Math.round(totalPoolRevenue),
    constructionCost, equipmentCost, annualMaintenance,
  }
}
