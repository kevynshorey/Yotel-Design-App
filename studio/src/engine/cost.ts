import type { OptionMetrics, CostEstimate, FormType } from './types'
import { FINANCIALS } from '@/config/financials'
import { HURRICANE_DESIGN, SEISMIC_DESIGN, FOUNDATION, ISLAND_COST_FACTORS } from '@/config/construction'
import { calculateMepTotal } from '@/config/mep'

const RATES = {
  modularPerM2: 2900, // recalibrated: modular YOTEL build, TDA concessions applied
  facadePerM2: 400,   // reduced: modular prefab facade panels
  ffePerKey: { yotel: 18000, pad: 25000 }, // YOTEL standardised FF&E packages
  techPerKey: 7000,
  outdoorPerM2: 700,
  siteWorks: 1_800_000,
  contingencyPct: 0.07, // 7% — lower risk with modular construction
} as const

/** Itemized professional fees (replaces flat 12%) */
const PROFESSIONAL_FEES = {
  architect: 0.045,
  structural: 0.025,
  mep: 0.025,
  qs: 0.018,
  pm: 0.025,
} as const
const SOFT_COST_PCT = Object.values(PROFESSIONAL_FEES).reduce((a, b) => a + b, 0) // 0.138

/** Fixed regulatory / environmental costs */
const EIA_AND_PERMITS = {
  eia: 85000,
  permits: 45000,
} as const

const FORM_MULTIPLIER: Record<FormType, number> = {
  BAR: 1.0, BAR_NS: 1.0, L: 1.08, U: 1.14, C: 1.11,
}

export function estimateCost(metrics: OptionMetrics): CostEstimate {
  const mult = FORM_MULTIPLIER[metrics.form]

  // Base construction (before resilience uplifts)
  const constructionBase = metrics.gia * RATES.modularPerM2 * mult

  // Hurricane structural uplift — tracked separately in breakdown
  const hurricaneUplift = constructionBase * (HURRICANE_DESIGN.structuralMultiplier - 1)
    + constructionBase * (SEISMIC_DESIGN.structuralMultiplier - 1)

  // Construction line item = base only (uplifts shown separately)
  const construction = constructionBase

  // Facade with hurricane impact-rated glazing uplift
  const facade = metrics.gia * 0.3 * RATES.facadePerM2 * HURRICANE_DESIGN.windowsAndCladding

  const ffe = metrics.yotelKeys * RATES.ffePerKey.yotel +
              metrics.padUnits * RATES.ffePerKey.pad
  const technology = metrics.totalKeys * RATES.techPerKey
  const outdoor = metrics.outdoorTotal * RATES.outdoorPerM2
  const siteWorks = RATES.siteWorks
  const land = FINANCIALS.land

  // MEP systems
  const mepResult = calculateMepTotal(metrics.gia)
  const mep = mepResult.hvac + mepResult.electrical + mepResult.plumbing + mepResult.fireSafety + mepResult.utilities
  const renewable = mepResult.renewable

  // Foundation engineering
  const pileCount = Math.ceil(metrics.footprint * FOUNDATION.pilesPerM2)
  const pileCost = pileCount * FOUNDATION.costPerPile
  // Estimate tie beam length as perimeter approximation (~4 * sqrt(footprint))
  const tieBeamLength = 4 * Math.sqrt(metrics.footprint)
  const tieBeamCost = tieBeamLength * FOUNDATION.tieBeamCostPerM
  const foundationBase = pileCost + tieBeamCost + FOUNDATION.geotechnicalSurvey
  // Apply seismic foundation multiplier
  const foundation = foundationBase * SEISMIC_DESIGN.foundationMultiplier

  // Island cost factors — apply import duty + shipping to material-heavy hard costs
  const materialHardCosts = construction + hurricaneUplift + facade + ffe + mep + renewable
  const islandFactors = materialHardCosts * (ISLAND_COST_FACTORS.importDuty + ISLAND_COST_FACTORS.shippingFreight)

  // EIA and permits
  const eiaAndPermits = EIA_AND_PERMITS.eia + EIA_AND_PERMITS.permits

  // Hard subtotal — every breakdown item except land, softCosts, contingency
  const hardSubtotal = construction + facade + ffe + technology +
    mep + renewable + foundation + outdoor + siteWorks +
    hurricaneUplift + islandFactors + eiaAndPermits

  const softCosts = hardSubtotal * SOFT_COST_PCT
  const contingency = hardSubtotal * RATES.contingencyPct

  const total = land + hardSubtotal + softCosts + contingency
  const perKey = total / Math.max(1, metrics.totalKeys)

  return {
    total: Math.round(total),
    perKey: Math.round(perKey),
    breakdown: {
      construction: Math.round(construction),
      facade: Math.round(facade),
      ffe: Math.round(ffe),
      technology: Math.round(technology),
      mep: Math.round(mep),
      renewable: Math.round(renewable),
      foundation: Math.round(foundation),
      outdoor: Math.round(outdoor),
      siteWorks,
      land,
      softCosts: Math.round(softCosts),
      contingency: Math.round(contingency),
      hurricaneUplift: Math.round(hurricaneUplift),
      islandFactors: Math.round(islandFactors),
      eiaAndPermits: Math.round(eiaAndPermits),
    },
  }
}
