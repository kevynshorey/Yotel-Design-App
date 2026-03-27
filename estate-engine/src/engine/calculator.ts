/**
 * Mt Brevitor Estates — Financial Calculator
 * Computes GDV, development costs, cash flow, and returns
 */

import type { CostBreakdown, PhaseRevenue, AbsorptionScenario } from '../types'
import { PRODUCTS, TOTAL_GDV_BBD } from '../config/products'
import { PHASES, COSTS, ABSORPTION } from '../config/financials'

// ── Construction Cost Per Unit (from MBE_E3) ───────────────────────────────

export const CONSTRUCTION_COST_PER_UNIT: Record<string, number> = {
  condo_1bed:      206_250,      // BBD 275/sf × 750sf
  townhouse_2bed:  330_000,      // BBD 350/sf × 943sf
  townhouse_3bed:  507_500,      // BBD 350/sf × 1,450sf
  home_4bed:       800_000,      // BBD 350-450/sf × 2,000sf
  estate_5bed:   1_260_000,      // BBD 450/sf × 2,800sf
}

// ── GDV Calculator ─────────────────────────────────────────────────────────

export function calculateResidentialGDV(): { byProduct: { id: string; units: number; pricePerUnit: number; totalBBD: number }[]; totalBBD: number; totalUSD: number } {
  const byProduct = PRODUCTS.map(p => ({
    id: p.id,
    units: p.units,
    pricePerUnit: p.priceBBD,
    totalBBD: p.priceBBD * p.units,
  }))
  const totalBBD = byProduct.reduce((sum, p) => sum + p.totalBBD, 0)
  return { byProduct, totalBBD, totalUSD: Math.round(totalBBD / 2) }
}

// ── Construction Cost Calculator ───────────────────────────────────────────

export function calculateConstructionCosts(
  costMultiplier: number = 1.0     // 1.0 = BCQS base, 0.75 = developer claimed -25%
): { byProduct: { id: string; units: number; costPerUnit: number; totalBBD: number }[]; totalBBD: number } {
  const byProduct = PRODUCTS.map(p => {
    const baseCost = CONSTRUCTION_COST_PER_UNIT[p.id] ?? 0
    const adjusted = Math.round(baseCost * costMultiplier)
    return {
      id: p.id,
      units: p.units,
      costPerUnit: adjusted,
      totalBBD: adjusted * p.units,
    }
  })
  const totalBBD = byProduct.reduce((sum, p) => sum + p.totalBBD, 0)
  return { byProduct, totalBBD }
}

// ── Total Development Cost ─────────────────────────────────────────────────

export function calculateTotalDevCost(costMultiplier: number = 1.0): CostBreakdown {
  const residential = calculateConstructionCosts(costMultiplier).totalBBD
  const base = COSTS
  const hardSubtotal = residential + base.siteInfrastructure + base.communityFacilities + base.greenInfrastructure + base.xRangeCapex + base.farmCapex
  const softCosts = Math.round(hardSubtotal * 0.138)    // 13.8%
  const contingency = Math.round(hardSubtotal * 0.10)    // 10% (from MBE_E3)
  return {
    land: base.land,
    siteInfrastructure: base.siteInfrastructure,
    residentialConstruction: residential,
    communityFacilities: base.communityFacilities,
    greenInfrastructure: base.greenInfrastructure,
    xRangeCapex: base.xRangeCapex,
    farmCapex: base.farmCapex,
    softCosts,
    contingency,
    transactionTaxes: base.transactionTaxes,
    total: base.land + hardSubtotal + softCosts + contingency + base.transactionTaxes,
  }
}

// ── Profit & Margin ────────────────────────────────────────────────────────

export function calculateProfit(costMultiplier: number = 1.0): {
  gdvBBD: number; costBBD: number; profitBBD: number; profitUSD: number; margin: number
} {
  const gdvBBD = TOTAL_GDV_BBD
  const costBBD = calculateTotalDevCost(costMultiplier).total
  const profitBBD = gdvBBD - costBBD
  return {
    gdvBBD,
    costBBD,
    profitBBD,
    profitUSD: Math.round(profitBBD / 2),
    margin: profitBBD / gdvBBD,
  }
}

// ── Absorption Timeline ────────────────────────────────────────────────────

export function calculateSellout(scenario: AbsorptionScenario): {
  totalUnits: number; annualRate: number; years: number; monthlyRate: number
} {
  const totalUnits = 355
  const annualRate = (scenario.annualUnitsMin + scenario.annualUnitsMax) / 2
  const years = totalUnits / annualRate
  return { totalUnits, annualRate, years, monthlyRate: Math.round(annualRate / 12) }
}

// ── Phase Revenue Waterfall ────────────────────────────────────────────────

export function calculatePhaseWaterfall(): PhaseRevenue[] {
  return PHASES.map(p => ({
    phase: p.number,
    period: p.period,
    unitsMin: p.unitsMin,
    unitsMax: p.unitsMax,
    revenueBBD: p.revenueBBD,
    revenueUSD: p.revenueUSD,
  }))
}

// ── Interest Cost Sensitivity ──────────────────────────────────────────────

export function calculateInterestCost(rate: number, principal: number = 114_200_000, years: number = 4): {
  totalInterest: number; annualInterest: number; arrangementFee: number
} {
  const totalInterest = Math.round(principal * rate * years)
  return {
    totalInterest,
    annualInterest: Math.round(totalInterest / years),
    arrangementFee: Math.round(principal * 0.01),
  }
}
