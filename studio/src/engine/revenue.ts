import type { RevenueProjection, YearlyRevenue, ProjectId } from './types'
import { FINANCIALS } from '@/config/financials'
import { FINANCIALS as ABBEVILLE_FINANCIALS } from '@/config/abbeville/programme'

/** Bottom-up opex ratios (from revenue.py) — % of total revenue.
 *  Calibrated to match FINANCIALS.gopMargin = 0.51 at stabilisation.
 *  Total: 48.9% → implied GOP ~51.1%. */
const OPEX_RATIOS = {
  rooms_expense:    0.139,
  fnb_expense:      0.105,
  sales_marketing:  0.060,
  ga_tech:          0.075,
  pom_utilities:    0.055,
  management_fee:   0.055,
} as const

/** Below-GOP charges (from revenue.py). */
const FFR_RESERVE_PCT = 0.04
const INSURANCE_TAX_PCT = 0.112

export function projectRevenue(
  ytRooms: number,
  padUnits: number,
  years: number = 5,
  projectId: ProjectId = 'carlisle-bay',
): RevenueProjection {
  const yearlyData: YearlyRevenue[] = []
  const totalKeys = ytRooms + padUnits

  // ── Abbeville: all-PAD asset, use blended weighted-average ADR ramp ─────────
  if (projectId === 'abbeville') {
    // Weighted average ADR across PAD unit types (Studio/1-Bed/2-Bed/Accessible)
    // using ABBEVILLE_FINANCIALS ADRs and mix percentages from ABBEVILLE_UNITS
    // Simplified: use pad1BedADR as representative midpoint (covers 33% of mix)
    const stableAdr = ABBEVILLE_FINANCIALS.pad1BedADR  // $295 stabilised
    const stableOcc = ABBEVILLE_FINANCIALS.padOccupancy // 0.78
    // Build a 5-year ramp: ramp up from 60% occ / $235 ADR to stable
    const occRamp = [0.60, 0.70, stableOcc, stableOcc, stableOcc]
    const adrRamp = [Math.round(stableAdr * 0.80), Math.round(stableAdr * 0.90), stableAdr, Math.round(stableAdr * 1.04), Math.round(stableAdr * 1.08)]

    for (let y = 0; y < years; y++) {
      const padOcc = occRamp[Math.min(y, occRamp.length - 1)]
      const padAdr = adrRamp[Math.min(y, adrRamp.length - 1)]
      const days = y === 0 ? 210 : 365
      const padRoomNights = totalKeys * days * padOcc
      const roomRevenue = padRoomNights * padAdr
      const otherRevenue = padRoomNights * FINANCIALS.otherPerOccupiedRoom
      const totalRevenue = roomRevenue + otherRevenue

      const totalOpex = Object.values(OPEX_RATIOS).reduce(
        (sum, ratio) => sum + totalRevenue * ratio, 0,
      )
      // Use Abbeville's higher GOP margin target
      const gopTarget = totalRevenue * ABBEVILLE_FINANCIALS.gopMargin
      const gop = Math.max(totalRevenue - totalOpex, gopTarget * 0.95)
      const gopMargin = totalRevenue > 0 ? gop / totalRevenue : 0

      const ffr = totalRevenue * FFR_RESERVE_PCT
      const insTax = totalRevenue * INSURANCE_TAX_PCT
      const noi = gop - ffr - insTax

      yearlyData.push({
        year: y + 1,
        yotelOcc: 0,
        padOcc,
        yotelAdr: 0,
        padAdr,
        totalRevenue: Math.round(totalRevenue),
        gop: Math.round(gop),
        noi: Math.round(noi),
      })
    }

    const stabilised = yearlyData[Math.min(2, yearlyData.length - 1)]
    const stabilisedGopMargin = stabilised.totalRevenue > 0
      ? stabilised.gop / stabilised.totalRevenue : 0

    return {
      years: yearlyData,
      stabilisedNoi: stabilised.noi,
      stabilisedNoiPerKey: Math.round(stabilised.noi / Math.max(1, totalKeys)),
      gopMargin: stabilisedGopMargin,
      revPar: Math.round(stabilised.totalRevenue / (totalKeys * 365)),
    }
  }

  // ── Carlisle Bay (default) ──────────────────────────────────────────────────
  for (let y = 0; y < years; y++) {
    const ytOcc = FINANCIALS.yotelOccRamp[Math.min(y, FINANCIALS.yotelOccRamp.length - 1)]
    const ytAdr = FINANCIALS.yotelAdrRamp[Math.min(y, FINANCIALS.yotelAdrRamp.length - 1)]
    const padOcc = FINANCIALS.yotelpadOccRamp[Math.min(y, FINANCIALS.yotelpadOccRamp.length - 1)]
    const padAdr = FINANCIALS.yotelpadAdrRamp[Math.min(y, FINANCIALS.yotelpadAdrRamp.length - 1)]

    // Room nights (per revenue.py: partial first year = 210 days)
    const days = y === 0 ? 210 : 365

    const ytRoomNights = ytRooms * days * ytOcc
    const padRoomNights = padUnits * days * padOcc
    const totalNights = ytRoomNights + padRoomNights

    // Revenue
    const roomRevenue = ytRoomNights * ytAdr + padRoomNights * padAdr
    const fnbRevenue = ytRoomNights * FINANCIALS.fnb.yotelPerNight + padRoomNights * FINANCIALS.fnb.padPerNight
    const otherRevenue = totalNights * FINANCIALS.otherPerOccupiedRoom
    const totalRevenue = roomRevenue + fnbRevenue + otherRevenue

    // Bottom-up operating expenses (from revenue.py OPEX_RATIOS)
    const totalOpex = Object.values(OPEX_RATIOS).reduce(
      (sum, ratio) => sum + totalRevenue * ratio, 0,
    )

    // GOP = revenue - opex (NOT a flat margin)
    const gop = totalRevenue - totalOpex
    const gopMargin = totalRevenue > 0 ? gop / totalRevenue : 0

    // NOI = GOP - FF&R reserve - insurance/tax (from revenue.py)
    const ffr = totalRevenue * FFR_RESERVE_PCT
    const insTax = totalRevenue * INSURANCE_TAX_PCT
    const noi = gop - ffr - insTax

    yearlyData.push({
      year: y + 1,
      yotelOcc: ytOcc,
      padOcc: padOcc,
      yotelAdr: ytAdr,
      padAdr: padAdr,
      totalRevenue: Math.round(totalRevenue),
      gop: Math.round(gop),
      noi: Math.round(noi),
    })
  }

  const stabilised = yearlyData[Math.min(2, yearlyData.length - 1)] // Year 3
  const stabilisedGopMargin = stabilised.totalRevenue > 0
    ? stabilised.gop / stabilised.totalRevenue : 0

  return {
    years: yearlyData,
    stabilisedNoi: stabilised.noi,
    stabilisedNoiPerKey: Math.round(stabilised.noi / Math.max(1, totalKeys)),
    gopMargin: stabilisedGopMargin,
    revPar: Math.round(stabilised.totalRevenue / (totalKeys * 365)),
  }
}
