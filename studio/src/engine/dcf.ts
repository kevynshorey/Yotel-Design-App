import type { RevenueProjection } from './types'
import type { CapitalStackResult } from './capital-stack'

// ── Types ──

export interface DcfParams {
  tdc: number
  projection: RevenueProjection        // years 1-5 NOI
  capitalStack: CapitalStackResult
  noiGrowthRate?: number                // default 2.5%
  exitCapRate?: number                  // default 8.5%
  holdPeriod?: number                   // default 10 years
}

export interface DcfYearCashFlow {
  year: number
  noi: number
  debtService: number
  leveredCf: number
  cumulativeCf: number
}

export interface SensitivityCell {
  irr: number
  exitCap: number
  noiGrowth: number
}

export interface DcfResult {
  npv: number
  irr: number
  equityMultiple: number
  terminalValue: number
  terminalNoi: number
  exitCapRate: number
  noiGrowthRate: number
  wacc: number
  yearCashFlows: DcfYearCashFlow[]
  sensitivityMatrix: SensitivityCell[][]  // rows=exitCap, cols=noiGrowth
}

// ── Exit cap rate rows & NOI growth columns for sensitivity ──

export const SENSITIVITY_EXIT_CAPS = [0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.10]
export const SENSITIVITY_NOI_GROWTH = [0.00, 0.01, 0.02, 0.025, 0.03, 0.04]

// ── WACC calculation ──

function calculateWacc(capitalStack: CapitalStackResult, tdc: number): number {
  // Weighted cost: each layer's rate * its share of TDC
  // Senior debt + mezz are debt; LP + GP are equity
  let weightedCost = 0
  for (const layer of capitalStack.layers) {
    weightedCost += layer.rate * (layer.amount / tdc)
  }
  return weightedCost
}

// ── Bisection IRR (reused pattern from capital-stack.ts) ──

function approximateIrr(cashFlows: number[], maxIter = 200, tolerance = 0.00005): number {
  let low = -0.5
  let high = 3.0

  function npvAtRate(rate: number): number {
    return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0)
  }

  // Check if IRR is calculable
  const npvLow = npvAtRate(low)
  const npvHigh = npvAtRate(high)
  if (npvLow * npvHigh > 0) {
    // No sign change — return midpoint estimate
    return npvAtRate(0) > 0 ? high : low
  }

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2
    const val = npvAtRate(mid)
    if (Math.abs(val) < tolerance) return mid
    if (val > 0) low = mid
    else high = mid
  }
  return (low + high) / 2
}

// ── Project NOI years 6-10 from year 5 base ──

function projectNoi(year5Noi: number, growthRate: number, yearsToProject: number): number[] {
  const nois: number[] = []
  let noi = year5Noi
  for (let i = 0; i < yearsToProject; i++) {
    noi = noi * (1 + growthRate)
    nois.push(Math.round(noi))
  }
  return nois
}

// ── Main DCF calculation ──

export function calculateDCF(params: DcfParams): DcfResult {
  const {
    tdc,
    projection,
    capitalStack,
    noiGrowthRate = 0.025,
    exitCapRate = 0.085,
    holdPeriod = 10,
  } = params

  const totalEquity = capitalStack.totalEquity
  const annualDebtService = capitalStack.annualDebtService

  // Build 10-year NOI schedule
  // Years 1-5: from projection
  const year1to5Noi = projection.years.map(y => y.noi)

  // If projection has fewer than 5 years, extend using last NOI + growth
  while (year1to5Noi.length < 5) {
    const lastNoi = year1to5Noi[year1to5Noi.length - 1]
    year1to5Noi.push(Math.round(lastNoi * (1 + noiGrowthRate)))
  }

  // Years 6-10: project from year 5 at growth rate
  const additionalYears = holdPeriod - 5
  const year6to10Noi = projectNoi(year1to5Noi[4], noiGrowthRate, additionalYears)

  const allNoi = [...year1to5Noi, ...year6to10Noi]

  // Terminal value at exit
  const terminalNoi = allNoi[allNoi.length - 1]
  const terminalValue = terminalNoi / exitCapRate

  // WACC
  const wacc = calculateWacc(capitalStack, tdc)

  // ── Unlevered NPV (discount all NOI + terminal at WACC) ──
  let npv = 0
  for (let t = 0; t < allNoi.length; t++) {
    npv += allNoi[t] / Math.pow(1 + wacc, t + 1)
  }
  npv += terminalValue / Math.pow(1 + wacc, holdPeriod)
  npv -= tdc // subtract initial investment

  // ── Levered cash flows for IRR ──
  const yearCashFlows: DcfYearCashFlow[] = []
  let cumulative = 0

  for (let t = 0; t < allNoi.length; t++) {
    const noi = allNoi[t]
    const leveredCf = noi - annualDebtService
    cumulative += leveredCf
    yearCashFlows.push({
      year: t + 1,
      noi,
      debtService: annualDebtService,
      leveredCf: Math.round(leveredCf),
      cumulativeCf: Math.round(cumulative),
    })
  }

  // Equity IRR cash flows: -equity at t=0, levered CF years 1-10, + net exit at year 10
  const netExitProceeds = terminalValue - capitalStack.totalDebt
  const equityCashFlows = [
    -totalEquity,
    ...yearCashFlows.map(y => y.leveredCf),
  ]
  // Add exit proceeds to final year
  equityCashFlows[equityCashFlows.length - 1] += netExitProceeds

  const irr = approximateIrr(equityCashFlows)

  // Equity multiple
  const totalDistributions = equityCashFlows.slice(1).reduce((a, b) => a + b, 0)
  const equityMultiple = (totalDistributions + totalEquity) / totalEquity

  // ── Sensitivity matrix ──
  const sensitivityMatrix = buildSensitivityMatrix(
    year1to5Noi,
    totalEquity,
    capitalStack.totalDebt,
    annualDebtService,
    holdPeriod,
  )

  return {
    npv: Math.round(npv),
    irr: Math.round(irr * 10000) / 10000, // 4 decimal places
    equityMultiple: Math.round(equityMultiple * 100) / 100,
    terminalValue: Math.round(terminalValue),
    terminalNoi: Math.round(terminalNoi),
    exitCapRate,
    noiGrowthRate,
    wacc: Math.round(wacc * 10000) / 10000,
    yearCashFlows,
    sensitivityMatrix,
  }
}

// ── Build sensitivity matrix ──

function buildSensitivityMatrix(
  year1to5Noi: number[],
  totalEquity: number,
  totalDebt: number,
  annualDebtService: number,
  holdPeriod: number,
): SensitivityCell[][] {
  const matrix: SensitivityCell[][] = []

  for (const exitCap of SENSITIVITY_EXIT_CAPS) {
    const row: SensitivityCell[] = []
    for (const growth of SENSITIVITY_NOI_GROWTH) {
      // Rebuild 10-year NOI at this growth rate
      const nois = [...year1to5Noi]
      while (nois.length < 5) {
        nois.push(Math.round(nois[nois.length - 1] * (1 + growth)))
      }
      const additionalYears = holdPeriod - 5
      let lastNoi = nois[4]
      for (let i = 0; i < additionalYears; i++) {
        lastNoi = lastNoi * (1 + growth)
        nois.push(Math.round(lastNoi))
      }

      // Terminal value
      const termNoi = nois[nois.length - 1]
      const termValue = termNoi / exitCap
      const netExit = termValue - totalDebt

      // Equity cash flows
      const eqCf = [-totalEquity]
      for (let t = 0; t < nois.length; t++) {
        eqCf.push(nois[t] - annualDebtService)
      }
      eqCf[eqCf.length - 1] += netExit

      const cellIrr = approximateIrr(eqCf)

      row.push({
        irr: Math.round(cellIrr * 10000) / 10000,
        exitCap,
        noiGrowth: growth,
      })
    }
    matrix.push(row)
  }

  return matrix
}
