import type { RevenueProjection, YearlyRevenue } from './types'
import { FINANCIALS } from '@/config/financials'

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
): RevenueProjection {
  const yearlyData: YearlyRevenue[] = []
  const totalKeys = ytRooms + padUnits

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
