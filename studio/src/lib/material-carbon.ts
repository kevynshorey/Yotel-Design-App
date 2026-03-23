/** Embodied carbon estimator for Caribbean hotel construction.
 *  Material factors from ICE Database v3.0 + Caribbean-adjusted values.
 *  Coral stone aggregate factor from University of West Indies research. */

// ── Material Library ───────────────────────────────────────────────────

export interface MaterialFactor {
  name: string
  unit: string
  kgCO2PerUnit: number
  source: string
}

export const MATERIAL_LIBRARY: Record<string, MaterialFactor> = {
  concrete: {
    name: 'Reinforced Concrete (C30/37)',
    unit: 'm³',
    kgCO2PerUnit: 350,
    source: 'ICE Database v3.0 — RC 30/37 with rebar',
  },
  steel: {
    name: 'Structural Steel (hot-rolled)',
    unit: 'tonne',
    kgCO2PerUnit: 1500,
    source: 'ICE Database v3.0 — EU average',
  },
  timber: {
    name: 'Cross-Laminated Timber (CLT)',
    unit: 'm³',
    kgCO2PerUnit: -500,
    source: 'ICE Database v3.0 — biogenic carbon credit',
  },
  glass: {
    name: 'Float Glass (double-glazed IGU)',
    unit: 'tonne',
    kgCO2PerUnit: 1200,
    source: 'ICE Database v3.0 — flat glass with IGU assembly',
  },
  coral_stone: {
    name: 'Coral Stone Aggregate',
    unit: 'm³',
    kgCO2PerUnit: 180,
    source: 'UWI research — local quarried coral limestone',
  },
} as const

// ── Structural Quantities Model ────────────────────────────────────────

/** Benchmarks per m² GIA for reinforced concrete frame hotel.
 *  Derived from BCQS 2025 Caribbean hotel cost data. */
const BASELINE_QUANTITIES = {
  concreteM3PerM2Gia: 0.45,      // m³ concrete per m² GIA
  steelTonnesPerM2Gia: 0.012,    // tonnes steel per m² GIA
  glassKgPerM2Facade: 35,        // kg glass per m² facade (25% glazing ratio)
  facadePerimeterFactor: 0.12,   // facade m² per m² GIA (approximate)
} as const

/** Optimised scenario: local coral stone aggregate, recycled steel, timber hybrid. */
const OPTIMISED_ADJUSTMENTS = {
  coralStoneReplacementPct: 0.30,   // replace 30% concrete with coral stone
  recycledSteelReduction: 0.40,     // 40% lower embodied carbon for EAF recycled steel
  timberHybridPct: 0.15,            // 15% of concrete volume replaced with CLT
  localSourcingReduction: 0.10,     // 10% transport carbon savings (500-mile radius)
} as const

// ── Types ──────────────────────────────────────────────────────────────

export interface CarbonBreakdown {
  concrete: { volume: number; kgCO2: number }
  steel: { tonnes: number; kgCO2: number }
  glass: { tonnes: number; kgCO2: number }
  totalKgCO2: number
  kgCO2PerM2: number
}

export interface OptimisedBreakdown extends CarbonBreakdown {
  coralStone: { volume: number; kgCO2: number }
  timber: { volume: number; kgCO2: number }
}

export interface EmbodiedCarbonResult {
  baseline: CarbonBreakdown
  optimised: OptimisedBreakdown
  savingsKgCO2: number
  savingsPercentage: number
  recommendations: string[]
}

// ── Calculator ─────────────────────────────────────────────────────────

export function estimateEmbodiedCarbon(
  gia: number,
  storeys: number,
): EmbodiedCarbonResult {
  if (gia <= 0 || storeys <= 0) {
    throw new Error('GIA and storeys must be positive numbers')
  }

  // Height factor: taller buildings need more concrete and steel per m²
  const heightFactor = 1 + (storeys - 1) * 0.03

  // ── Baseline ────────────────────────────────────────────────────────

  const concreteVol = gia * BASELINE_QUANTITIES.concreteM3PerM2Gia * heightFactor
  const concreteCO2 = concreteVol * MATERIAL_LIBRARY.concrete.kgCO2PerUnit

  const steelTonnes = gia * BASELINE_QUANTITIES.steelTonnesPerM2Gia * heightFactor
  const steelCO2 = steelTonnes * MATERIAL_LIBRARY.steel.kgCO2PerUnit

  const facadeArea = gia * BASELINE_QUANTITIES.facadePerimeterFactor
  const glassKg = facadeArea * BASELINE_QUANTITIES.glassKgPerM2Facade
  const glassTonnes = glassKg / 1000
  const glassCO2 = glassTonnes * MATERIAL_LIBRARY.glass.kgCO2PerUnit

  const baselineTotalCO2 = concreteCO2 + steelCO2 + glassCO2

  const baseline: CarbonBreakdown = {
    concrete: { volume: round2(concreteVol), kgCO2: round2(concreteCO2) },
    steel: { tonnes: round2(steelTonnes), kgCO2: round2(steelCO2) },
    glass: { tonnes: round2(glassTonnes), kgCO2: round2(glassCO2) },
    totalKgCO2: round2(baselineTotalCO2),
    kgCO2PerM2: round2(baselineTotalCO2 / gia),
  }

  // ── Optimised ───────────────────────────────────────────────────────

  // Coral stone replaces portion of concrete
  const coralVol = concreteVol * OPTIMISED_ADJUSTMENTS.coralStoneReplacementPct
  const remainingConcreteVol = concreteVol * (1 - OPTIMISED_ADJUSTMENTS.coralStoneReplacementPct)
  const coralCO2 = coralVol * MATERIAL_LIBRARY.coral_stone.kgCO2PerUnit

  // Timber hybrid replaces portion of concrete
  const timberVol = remainingConcreteVol * OPTIMISED_ADJUSTMENTS.timberHybridPct
  const finalConcreteVol = remainingConcreteVol * (1 - OPTIMISED_ADJUSTMENTS.timberHybridPct)
  const timberCO2 = timberVol * MATERIAL_LIBRARY.timber.kgCO2PerUnit // negative (carbon sink)

  const optConcreteCO2 = finalConcreteVol * MATERIAL_LIBRARY.concrete.kgCO2PerUnit

  // Recycled steel
  const optSteelCO2 = steelCO2 * (1 - OPTIMISED_ADJUSTMENTS.recycledSteelReduction)

  // Glass unchanged, but local sourcing reduces transport
  const optGlassCO2 = glassCO2 * (1 - OPTIMISED_ADJUSTMENTS.localSourcingReduction)

  const optTotalCO2 = optConcreteCO2 + optSteelCO2 + optGlassCO2 + coralCO2 + timberCO2

  const optimised: OptimisedBreakdown = {
    concrete: { volume: round2(finalConcreteVol), kgCO2: round2(optConcreteCO2) },
    steel: { tonnes: round2(steelTonnes), kgCO2: round2(optSteelCO2) },
    glass: { tonnes: round2(glassTonnes), kgCO2: round2(optGlassCO2) },
    coralStone: { volume: round2(coralVol), kgCO2: round2(coralCO2) },
    timber: { volume: round2(timberVol), kgCO2: round2(timberCO2) },
    totalKgCO2: round2(optTotalCO2),
    kgCO2PerM2: round2(optTotalCO2 / gia),
  }

  // ── Savings ─────────────────────────────────────────────────────────

  const savingsKgCO2 = baselineTotalCO2 - optTotalCO2
  const savingsPercentage = (savingsKgCO2 / baselineTotalCO2) * 100

  // ── Recommendations ─────────────────────────────────────────────────

  const recommendations = generateCarbonRecommendations(baseline, storeys)

  return {
    baseline,
    optimised,
    savingsKgCO2: round2(savingsKgCO2),
    savingsPercentage: round2(savingsPercentage),
    recommendations,
  }
}

// ── Recommendations ────────────────────────────────────────────────────

function generateCarbonRecommendations(
  baseline: CarbonBreakdown,
  storeys: number,
): string[] {
  const recs: string[] = []

  if (baseline.kgCO2PerM2 > 500) {
    recs.push(
      'Embodied carbon exceeds 500 kgCO2/m². Specify low-carbon concrete (GGBS/PFA blends) for 20-30% reduction in concrete emissions.',
    )
  }

  recs.push(
    'Source coral stone aggregate locally (Barbados quarries within 15 km). Replaces imported aggregate and reduces transport emissions by 60-80%.',
  )

  recs.push(
    'Specify EAF-recycled structural steel (available from Trinidad/Guyana mills). 40% lower embodied carbon versus virgin BOF steel.',
  )

  if (storeys <= 4) {
    recs.push(
      'Building height suits CLT hybrid structure for upper floors. Caribbean-sourced Guyana greenheart or imported CLT panels reduce concrete volumes 15-25%.',
    )
  }

  recs.push(
    'Request Environmental Product Declarations (EPDs) from all structural material suppliers. Track actual vs estimated carbon through construction.',
  )

  return recs
}

// ── Utilities ──────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
