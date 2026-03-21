import type { OptionMetrics, CostEstimate, FormType } from './types'
import { FINANCIALS } from '@/config/financials'

const RATES = {
  modularPerM2: 3400,
  facadePerM2: 450,
  ffePerKey: { yotel: 22000, pad: 28000 },
  techPerKey: 8000,
  outdoorPerM2: 800,
  siteWorks: 2_200_000,
  softCostPct: 0.12,
  contingencyPct: 0.08,
} as const

const FORM_MULTIPLIER: Record<FormType, number> = {
  BAR: 1.0, BAR_NS: 1.0, L: 1.08, U: 1.14, C: 1.11,
}

export function estimateCost(metrics: OptionMetrics): CostEstimate {
  const mult = FORM_MULTIPLIER[metrics.form]

  const construction = metrics.gia * RATES.modularPerM2 * mult
  const facade = metrics.gia * 0.3 * RATES.facadePerM2
  const ffe = metrics.yotelKeys * RATES.ffePerKey.yotel +
              metrics.padUnits * RATES.ffePerKey.pad
  const technology = metrics.totalKeys * RATES.techPerKey
  const outdoor = metrics.outdoorTotal * RATES.outdoorPerM2
  const land = FINANCIALS.land
  const siteWorks = RATES.siteWorks

  const hardSubtotal = construction + facade + ffe + technology + outdoor + siteWorks
  const softCosts = hardSubtotal * RATES.softCostPct
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
      outdoor: Math.round(outdoor),
      land,
      siteWorks,
      softCosts: Math.round(softCosts),
      contingency: Math.round(contingency),
    },
  }
}
