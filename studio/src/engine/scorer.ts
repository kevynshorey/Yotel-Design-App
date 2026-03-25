import type { OptionMetrics, ScoringWeights, ScoreBreakdown } from './types'

type ScoringResult = [number, Record<string, ScoreBreakdown>]

export function scoreOption(
  metrics: OptionMetrics,
  weights: ScoringWeights,
): ScoringResult {
  const bd: Record<string, ScoreBreakdown> = {}

  // 1. Room count
  const keys = metrics.totalKeys
  let s: number, r: string
  if (keys >= 120 && keys <= 140) { s = 1.0; r = `${keys} keys — in target range` }
  else if (keys >= 100 && keys < 120) { s = 0.7 + (keys - 100) / 100; r = `${keys} keys — slightly below` }
  else if (keys > 140) { s = Math.max(0.5, 1.0 - (keys - 140) / 100); r = `${keys} keys — above target` }
  else { s = Math.max(0.2, keys / 130); r = `${keys} keys — below minimum` }
  bd.room_count = { raw: round(s), weighted: round(s * weights.room_count), reason: r }

  // 2. GIA efficiency
  const gk = metrics.giaPerKey
  if (gk >= 33 && gk <= 38) { s = 1.0; r = `${gk} m²/key — optimal` }
  else if (gk >= 29 && gk <= 42) { s = 0.7; r = `${gk} m²/key — acceptable` }
  else { s = Math.max(0.2, 1 - Math.abs(gk - 35.5) / 35.5); r = `${gk} m²/key — review` }
  bd.gia_efficiency = { raw: round(s), weighted: round(s * weights.gia_efficiency), reason: r }

  // 3. Sea views
  const wf = metrics.westFacade
  s = Math.min(1.0, wf / 50)
  bd.sea_views = { raw: round(s), weighted: round(s * weights.sea_views), reason: `${wf.toFixed(0)}m west facade` }

  // 4. Building height
  const h = metrics.buildingHeight
  if (h <= 21) { s = 1.0; r = `${h}m — within envelope` }
  else if (h <= 25) { s = 0.6; r = `${h}m — needs approval` }
  else { s = 0.2; r = `${h}m — exceeds limit` }
  bd.building_height = { raw: round(s), weighted: round(s * weights.building_height), reason: r }

  // 5. Outdoor amenity
  const out = metrics.outdoorTotal
  s = Math.min(1.0, out / 900)
  bd.outdoor_amenity = { raw: round(s), weighted: round(s * weights.outdoor_amenity), reason: `${out.toFixed(0)}m² outdoor` }

  // 6. Cost per key — v3 RECALIBRATED for expanded cost model (MEP, hurricane, foundation, island factors)
  const cpk = metrics.costPerKey
  if (cpk <= 290_000) { s = 1.0; r = `$${(cpk / 1000).toFixed(0)}k/key — excellent` }
  else if (cpk <= 320_000) { s = 0.75; r = `$${(cpk / 1000).toFixed(0)}k/key — on budget` }
  else if (cpk <= 360_000) { s = 0.5; r = `$${(cpk / 1000).toFixed(0)}k/key — above target` }
  else { s = 0.2; r = `$${(cpk / 1000).toFixed(0)}k/key — review scope` }
  bd.cost_per_key = { raw: round(s), weighted: round(s * weights.cost_per_key), reason: r }

  // 7. Daylight quality
  const ct = metrics.corridorType
  const form = metrics.form
  if (ct === 'single_loaded') { s = 1.0; r = 'Single-loaded — natural light' }
  else if (form === 'U' || form === 'C') { s = 0.75; r = `${form}-shape with courtyard daylight` }
  else if (form === 'L') { s = 0.65; r = 'L-shape — some corner daylight' }
  else { s = 0.5; r = 'Double-loaded bar — standard' }
  bd.daylight_quality = { raw: round(s), weighted: round(s * weights.daylight_quality), reason: r }

  // 8. PAD mix
  const padPct = metrics.padUnits / Math.max(1, metrics.totalKeys)
  if (padPct >= 0.18 && padPct <= 0.28) { s = 1.0; r = `${(padPct * 100).toFixed(0)}% PAD — optimal` }
  else if (padPct >= 0.12 && padPct <= 0.35) { s = 0.7; r = `${(padPct * 100).toFixed(0)}% PAD — acceptable` }
  else { s = 0.4; r = `${(padPct * 100).toFixed(0)}% PAD — outside range` }
  bd.pad_mix = { raw: round(s), weighted: round(s * weights.pad_mix), reason: r }

  // 9. Form simplicity
  const formScores: Record<string, number> = { BAR: 1.0, BAR_NS: 1.0, L: 0.75, C: 0.6, U: 0.5 }
  s = formScores[form] ?? 0.5
  r = `${form} — ${s >= 0.9 ? 'simplest' : s >= 0.6 ? 'moderate' : 'complex'}`
  bd.form_simplicity = { raw: round(s), weighted: round(s * weights.form_simplicity), reason: r }

  // 10. Amenity quality
  const aq = metrics.amenityScore
  s = Math.min(1.0, aq / 0.85) // 0.85+ is excellent for Caribbean resort
  r = aq >= 0.8 ? `${aq} — excellent amenity programme` :
      aq >= 0.6 ? `${aq} — good amenity programme` :
      `${aq} — amenities below benchmark`
  bd.amenity_quality = { raw: round(s), weighted: round(s * weights.amenity_quality), reason: r }

  const total = Object.values(bd).reduce((sum, v) => sum + v.weighted, 0)
  return [Math.round(total * 1000) / 10, bd]
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}
