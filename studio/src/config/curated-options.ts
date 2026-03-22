/** 5 Architect's Options — curated design iterations for YOTEL Barbados.
 *  Each option has a distinct concept, rationale, and architectural intent. */

import type { GenerationParams } from '@/engine/types'

export interface CuratedOptionConfig {
  id: string
  name: string
  concept: string
  rationale: string
  highlights: string[]
  recommended?: boolean
  params: GenerationParams
}

export const CURATED_OPTIONS: CuratedOptionConfig[] = [
  {
    id: 'beacon',
    name: 'The Beacon',
    concept: 'The definitive Carlisle Bay address',
    rationale: 'L-form wrapping the pool deck on two sides. 14m width accommodates both brands. Maximum west ocean facade with sheltered courtyard.',
    highlights: [
      'L-form maximises ocean views + pool embrace',
      '6 storeys — comfortably under 25m height limit',
      '14m unified width — no structural transition between brands',
      '25% site coverage — generous amenity deck',
    ],
    recommended: true,
    params: {
      form: 'L',
      targetFloorArea: 900,
      wingWidth: 14.0,
      storeys: 6,
      corridorType: 'double_loaded',
      ytRooms: 95,
      padUnits: 30,
      outdoorPosition: 'WEST',
    },
  },
  {
    id: 'reef',
    name: 'The Reef',
    concept: 'Every room sees the ocean or the sunrise',
    rationale: 'Single N-S bar. West rooms get sunset, east rooms get sunrise. 16.1m width future-proofs for brand conversion. Maximum cross-ventilation from NE trade winds.',
    highlights: [
      '100% dual-aspect rooms (ocean or sunrise)',
      'Maximum passive cooling from trade winds',
      '16.1m width — PAD-compatible throughout',
      'Simplest structure — lowest construction risk',
    ],
    params: {
      form: 'BAR_NS',
      targetFloorArea: 770,
      wingWidth: 16.1,
      storeys: 7,
      corridorType: 'double_loaded',
      ytRooms: 100,
      padUnits: 30,
      outdoorPosition: 'WEST',
    },
  },
  {
    id: 'cove',
    name: 'The Cove',
    concept: 'A private cove within the cove',
    rationale: 'U-form opening west, creating a protected courtyard that frames the sea. Classic Caribbean resort typology. All three wings overlook the pool courtyard.',
    highlights: [
      'Protected courtyard microclimate',
      'Pool framed by building on 3 sides',
      'All wings get ocean views through open west end',
      'Premium resort feel at mid-scale pricing',
    ],
    params: {
      form: 'U',
      targetFloorArea: 650,
      wingWidth: 13.6,
      storeys: 6,
      corridorType: 'double_loaded',
      ytRooms: 90,
      padUnits: 25,
      outdoorPosition: 'WEST',
    },
  },
  {
    id: 'promenade',
    name: 'The Promenade',
    concept: 'The ocean-facing promenade',
    rationale: 'C-form with ocean-side connector housing rooftop bar and restaurant. The hotel\'s public face toward Carlisle Bay. Semi-enclosed garden for arrival.',
    highlights: [
      'Ocean-facing connector = premium F&B + public areas',
      'Strong key count — maximum revenue potential',
      'Semi-enclosed arrival garden on east side',
      'C-form creates sheltered outdoor dining courtyard',
    ],
    params: {
      form: 'C',
      targetFloorArea: 650,
      wingWidth: 14.0,
      storeys: 7,
      corridorType: 'double_loaded',
      ytRooms: 100,
      padUnits: 30,
      outdoorPosition: 'WEST',
    },
  },
  {
    id: 'village',
    name: 'The Village',
    concept: 'Low-rise luxury — the Caribbean way',
    rationale: 'Wide E-W bar, just 5 storeys. Most heritage-sympathetic, easiest planning approval. Higher PAD mix (29%) targets residences-first market.',
    highlights: [
      'Lowest profile (17.3m) — easiest planning approval',
      'Most sympathetic to UNESCO heritage zone',
      'Higher PAD mix (29%) — residences-led revenue',
      'Lowest structural cost — no high-rise premium',
    ],
    params: {
      form: 'BAR',
      targetFloorArea: 1050,
      wingWidth: 16.1,
      storeys: 5,
      corridorType: 'double_loaded',
      ytRooms: 85,
      padUnits: 35,
      outdoorPosition: 'WEST',
    },
  },
]
