import type { RevenueProjection } from './types'

export interface CapitalLayer {
  name: string
  amount: number
  pctOfTdc: number
  rate: number        // annual interest/return rate
  type: 'senior_debt' | 'mezzanine' | 'preferred_equity' | 'lp_equity' | 'gp_equity'
  interestOnly: boolean
  term: number        // years
}

export interface CapitalStackResult {
  layers: CapitalLayer[]
  totalDebt: number
  totalEquity: number
  ltv: number               // loan-to-value
  ltc: number               // loan-to-cost
  dscr: number              // debt service coverage ratio (Year 3)
  annualDebtService: number
  leveredCashFlows: number[] // after debt service
  leveredIrr: number        // approximate IRR on equity
  equityMultiple: number    // total return / equity invested
  cashOnCash: number[]      // annual cash-on-cash return
}

export function buildCapitalStack(
  tdc: number,
  projection: RevenueProjection,
): CapitalStackResult {
  // Default capital structure (from financials.ts v2 params)
  const seniorDebt = tdc * 0.55        // 55% LTC
  const mezzanine = tdc * 0.12         // 12%
  const lpEquity = tdc * 0.28          // 28%
  const gpEquity = tdc * 0.05          // 5% GP co-invest

  const layers: CapitalLayer[] = [
    { name: 'Senior Debt', amount: Math.round(seniorDebt), pctOfTdc: 0.55, rate: 0.065, type: 'senior_debt', interestOnly: true, term: 5 },
    { name: 'Mezzanine', amount: Math.round(mezzanine), pctOfTdc: 0.12, rate: 0.11, type: 'mezzanine', interestOnly: true, term: 3 },
    { name: 'LP Equity', amount: Math.round(lpEquity), pctOfTdc: 0.28, rate: 0.15, type: 'lp_equity', interestOnly: false, term: 7 },
    { name: 'GP Co-Invest', amount: Math.round(gpEquity), pctOfTdc: 0.05, rate: 0.20, type: 'gp_equity', interestOnly: false, term: 7 },
  ]

  const totalDebt = seniorDebt + mezzanine
  const totalEquity = lpEquity + gpEquity
  const ltv = totalDebt / (tdc * 1.1)  // assume 10% day-1 value uplift
  const ltc = totalDebt / tdc

  // Annual debt service (interest only)
  const seniorService = seniorDebt * 0.065
  const mezzService = mezzanine * 0.11
  const annualDebtService = seniorService + mezzService

  // DSCR at stabilisation (Year 3)
  const dscr = projection.stabilisedNoi / annualDebtService

  // Levered cash flows (NOI - debt service)
  const leveredCashFlows = projection.years.map(y => y.noi - annualDebtService)

  // Exit in Year 5 at 8.5% cap rate
  const exitNoi = projection.years[projection.years.length - 1]?.noi ?? projection.stabilisedNoi
  const exitValue = exitNoi / 0.085
  const netSaleProceeds = exitValue - totalDebt  // repay debt at exit

  // Equity cash flows for IRR (negative at Year 0, positive Years 1-5, + exit)
  const equityCashFlows = [-totalEquity, ...leveredCashFlows]
  equityCashFlows[equityCashFlows.length - 1] += netSaleProceeds

  // Approximate IRR using bisection method
  const leveredIrr = approximateIrr(equityCashFlows)

  // Equity multiple
  const totalReturns = equityCashFlows.slice(1).reduce((a, b) => a + b, 0)
  const equityMultiple = (totalReturns + totalEquity) / totalEquity

  // Cash-on-cash returns
  const cashOnCash = leveredCashFlows.map(cf => cf / totalEquity)

  return {
    layers, totalDebt: Math.round(totalDebt), totalEquity: Math.round(totalEquity),
    ltv: Math.round(ltv * 1000) / 1000,
    ltc: Math.round(ltc * 1000) / 1000,
    dscr: Math.round(dscr * 100) / 100,
    annualDebtService: Math.round(annualDebtService),
    leveredCashFlows: leveredCashFlows.map(Math.round),
    leveredIrr: Math.round(leveredIrr * 1000) / 1000,
    equityMultiple: Math.round(equityMultiple * 100) / 100,
    cashOnCash: cashOnCash.map(c => Math.round(c * 1000) / 1000),
  }
}

/** Bisection method IRR approximation */
function approximateIrr(cashFlows: number[], maxIter = 100, tolerance = 0.0001): number {
  let low = -0.5, high = 2.0

  function npv(rate: number): number {
    return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0)
  }

  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2
    const val = npv(mid)
    if (Math.abs(val) < tolerance) return mid
    if (val > 0) low = mid
    else high = mid
  }
  return (low + high) / 2
}
