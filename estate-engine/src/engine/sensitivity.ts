/**
 * Mt Brevitor Estates — Sensitivity Analysis
 * Runs scenario matrix across interest rates, construction costs, absorption, pricing
 */

import { calculateProfit, calculateInterestCost, calculateSellout } from './calculator'
import { ABSORPTION } from '../config/financials'
import { PRODUCTS, TOTAL_GDV_BBD } from '../config/products'

// ── Scenario Definitions (from MBE_E3) ─────────────────────────────────────

export const INTEREST_RATE_SCENARIOS = [0.05, 0.06, 0.075, 0.09] as const
export const COST_MULTIPLIER_SCENARIOS = [0.75, 1.0, 1.10, 1.20] as const  // -25%, base, +10%, +20%
export const PRICING_MULTIPLIER_SCENARIOS = [0.90, 1.0, 1.05, 1.10] as const

// ── Interest Rate Sensitivity ──────────────────────────────────────────────

export interface InterestSensitivity {
  rate: number
  totalInterest: number
  arrangementFee: number
  impactOnProfit: number
}

export function runInterestSensitivity(): InterestSensitivity[] {
  const baseInterest = calculateInterestCost(0.05)
  return INTEREST_RATE_SCENARIOS.map(rate => {
    const result = calculateInterestCost(rate)
    return {
      rate,
      totalInterest: result.totalInterest,
      arrangementFee: result.arrangementFee,
      impactOnProfit: -(result.totalInterest - baseInterest.totalInterest),
    }
  })
}

// ── Construction Cost Sensitivity ──────────────────────────────────────────

export interface CostSensitivity {
  label: string
  multiplier: number
  totalCost: number
  profit: number
  margin: number
}

export function runCostSensitivity(): CostSensitivity[] {
  const labels = ['-25% (dev claim)', 'BCQS Base', '+10%', '+20%']
  return COST_MULTIPLIER_SCENARIOS.map((mult, i) => {
    const result = calculateProfit(mult)
    return {
      label: labels[i],
      multiplier: mult,
      totalCost: result.costBBD,
      profit: result.profitBBD,
      margin: result.margin,
    }
  })
}

// ── Absorption Sensitivity ─────────────────────────────────────────────────

export interface AbsorptionSensitivity {
  scenario: string
  annualRate: number
  selloutYears: number
  monthlyRate: number
}

export function runAbsorptionSensitivity(): AbsorptionSensitivity[] {
  return ABSORPTION.map(s => {
    const result = calculateSellout(s)
    return {
      scenario: s.label,
      annualRate: result.annualRate,
      selloutYears: result.years,
      monthlyRate: result.monthlyRate,
    }
  })
}

// ── Pricing Sensitivity ────────────────────────────────────────────────────

export interface PricingSensitivity {
  label: string
  multiplier: number
  gdvBBD: number
  gdvUSD: number
  deltaFromBase: number
}

export function runPricingSensitivity(): PricingSensitivity[] {
  const labels = ['-10%', 'Base', '+5%', '+10%']
  return PRICING_MULTIPLIER_SCENARIOS.map((mult, i) => {
    const gdvBBD = Math.round(TOTAL_GDV_BBD * mult)
    return {
      label: labels[i],
      multiplier: mult,
      gdvBBD,
      gdvUSD: Math.round(gdvBBD / 2),
      deltaFromBase: gdvBBD - TOTAL_GDV_BBD,
    }
  })
}

// ── Combined Scenario Matrix ───────────────────────────────────────────────

export interface ScenarioResult {
  interestRate: number
  costMultiplier: string
  pricingMultiplier: string
  gdvBBD: number
  totalCostBBD: number
  profitBBD: number
  margin: number
  selloutYears: number
}

export function runFullMatrix(): ScenarioResult[] {
  const results: ScenarioResult[] = []

  for (const rate of [0.05, 0.075, 0.09]) {
    for (const costMult of [0.75, 1.0, 1.20]) {
      for (const priceMult of [0.90, 1.0, 1.10]) {
        const gdvBBD = Math.round(TOTAL_GDV_BBD * priceMult)
        const costs = calculateProfit(costMult)
        const interest = calculateInterestCost(rate)
        const totalCost = costs.costBBD + interest.totalInterest
        const profit = gdvBBD - totalCost

        results.push({
          interestRate: rate,
          costMultiplier: `${Math.round(costMult * 100)}%`,
          pricingMultiplier: `${Math.round(priceMult * 100)}%`,
          gdvBBD,
          totalCostBBD: totalCost,
          profitBBD: profit,
          margin: profit / gdvBBD,
          selloutYears: 355 / 110,  // base absorption
        })
      }
    }
  }
  return results
}
