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

/**
 * Compute the targetFloorArea that, when fed to generateForm(), will produce
 * wings matching the curated design's specified dimensions.
 *
 * - BAR / BAR_NS: area = length * width (single wing)
 * - L: generator computes netTarget = area + W^2, La = (netTarget*0.6)/W
 *      so area = (La * W / 0.6) - W^2
 * - U / C: generator computes Lw = area / (3 * W)
 *          so area = Lw * 3 * W
 */
function computeTargetFloorArea(d: typeof CURATED_DESIGNS[number]): number {
  const W = d.wings[0].width
  switch (d.formType) {
    case 'BAR':
    case 'BAR_NS':
      return d.wings[0].length * W
    case 'L': {
      // La is the main (EW) wing length
      const La = d.wings[0].length
      return Math.round((La * W / 0.6) - W * W)
    }
    case 'U':
    case 'C': {
      // Lw is the first (EW) wing length
      const Lw = d.wings[0].length
      return Math.round(Lw * 3 * W)
    }
    default:
      return d.wings[0].length * W
  }
}

export const CURATED_OPTIONS: CuratedOptionConfig[] = CURATED_DESIGNS.map((d, i) => ({
  id: d.id,
  name: d.name,
  concept: d.concept,
  recommended: i === 0, // First design (Coastal Bar) is recommended
  params: {
    form: d.formType,
    targetFloorArea: computeTargetFloorArea(d),
    wingWidth: d.wings[0].width,
    storeys: d.storeys,
    corridorType: 'double_loaded' as const,
    ytRooms: d.yotelKeys,
    padUnits: d.padKeys,
    outdoorPosition: 'WEST' as const,
  },
}))
