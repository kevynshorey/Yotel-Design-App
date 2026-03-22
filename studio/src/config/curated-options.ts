/**
 * 7 Kevyn YOTEL Designs — bridges curated-designs.ts with the parametric generator.
 * Each entry maps a Kevyn YOTEL design to GenerationParams so buildOption() can
 * produce a full DesignOption with cost, revenue, score, and validation.
 */

import type { GenerationParams } from '@/engine/types'
import { CURATED_DESIGNS } from './curated-designs'

export interface CuratedOptionConfig {
  id: string
  name: string
  concept: string
  recommended?: boolean
  params: GenerationParams
}

export const CURATED_OPTIONS: CuratedOptionConfig[] = CURATED_DESIGNS.map((d, i) => ({
  id: d.id,
  name: d.name,
  concept: d.concept,
  recommended: i === 0, // First design (Coastal Bar) is recommended
  params: {
    form: d.formType,
    targetFloorArea: d.wings[0].length * d.wings[0].width,
    wingWidth: d.wings[0].width,
    storeys: d.storeys,
    corridorType: 'double_loaded' as const,
    ytRooms: d.yotelKeys,
    padUnits: d.padKeys,
    outdoorPosition: 'WEST' as const,
  },
}))
