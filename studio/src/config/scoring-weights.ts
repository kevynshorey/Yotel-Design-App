import type { ScoringWeights } from '@/engine/types'

export const DEFAULT_WEIGHTS: ScoringWeights = {
  room_count: 0.16,
  gia_efficiency: 0.14,
  sea_views: 0.14,
  building_height: 0.10,
  outdoor_amenity: 0.10,
  cost_per_key: 0.12,
  daylight_quality: 0.08,
  pad_mix: 0.06,
  form_simplicity: 0.06,
  amenity_quality: 0.04,
}

export const WEIGHT_DESCRIPTIONS: Record<keyof ScoringWeights, string> = {
  room_count: 'Total keys vs 130 target. More = more revenue.',
  gia_efficiency: 'GIA per key. Sweet spot 33-38 m²/key.',
  sea_views: 'West-facing facade length. More = more premium rooms.',
  building_height: 'Lower = easier planning approval.',
  outdoor_amenity: 'Total outdoor area (ground + roof + courtyard).',
  cost_per_key: 'Lower cost/key = better investment return.',
  daylight_quality: 'Natural light in corridors and rooms.',
  pad_mix: 'YOTELPAD ratio. 18-28% is revenue-optimal.',
  form_simplicity: 'Simpler forms = lower cost, faster build.',
  amenity_quality: 'Resort amenity programming quality — pool size, lounger capacity, rooftop deck, F&B coverage.',
}
