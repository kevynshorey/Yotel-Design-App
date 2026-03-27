/**
 * Mt Brevitor Estates — X Range Golf Entertainment Model
 * Source: MBE_D1_XRangeGolfBrief_v2.0, XR Dev Dubai Small/Mid/Large .xlsx
 *
 * Adapted from Dubai "Small" format (25 standard bays) for Barbados market
 * FLAG O-02: No operator agreement — all figures are advisory assumptions
 */

export type XRangeFormat = 'small' | 'mid' | 'large'

export interface XRangeConfig {
  format: XRangeFormat
  bays: number
  bayTypes: { standard: number; premium: number; mini: number; hospitality: number }
  acres: [number, number]
  capexBBD: number
  users: number                  // annual distinct users
  occupancy: number              // stabilised
  hourlyRate: number             // BBD per bay/hour
}

export interface XRangeRevenue {
  scenario: string
  rangeFeesBBD: number
  fnbBBD: number
  eventsBBD: number
  membershipsBBD: number
  totalBBD: number
  totalUSD: number
}

// ── Format Configurations (from Dubai models, Barbados-adapted) ────────────

export const XRANGE_FORMATS: Record<XRangeFormat, XRangeConfig> = {
  small: {
    format: 'small',
    bays: 25,
    bayTypes: { standard: 25, premium: 0, mini: 0, hospitality: 0 },
    acres: [6, 8],
    capexBBD: 6_400_000,         // adapted from AED 26.67M
    users: 50_000,               // vs 140K Dubai — smaller market
    occupancy: 0.45,             // vs 55% Dubai
    hourlyRate: 120,             // BBD ($60 USD) vs AED 200 ($54.50)
  },
  mid: {
    format: 'mid',
    bays: 56,
    bayTypes: { standard: 52, premium: 4, mini: 0, hospitality: 0 },
    acres: [10, 14],
    capexBBD: 11_000_000,        // adapted from AED 55.40M
    users: 100_000,
    occupancy: 0.50,
    hourlyRate: 120,
  },
  large: {
    format: 'large',
    bays: 82,
    bayTypes: { standard: 66, premium: 4, mini: 10, hospitality: 2 },
    acres: [18, 24],
    capexBBD: 22_000_000,        // adapted from AED 111.96M
    users: 200_000,
    occupancy: 0.45,
    hourlyRate: 120,
  },
}

// ── Revenue Projections (from MBE_D1) ──────────────────────────────────────

export function projectXRangeRevenue(format: XRangeFormat = 'small'): XRangeRevenue[] {
  // Revenue split from MBE_D1: Range 35%, F&B 40%, Events 15%, Memberships 10%
  const scenarios: { label: string; totalBBD: number }[] =
    format === 'small' ? [
      { label: 'Conservative', totalBBD: 1_750_000 },
      { label: 'Base Case',    totalBBD: 2_800_000 },
      { label: 'Optimistic',   totalBBD: 3_900_000 },
    ] : format === 'mid' ? [
      { label: 'Conservative', totalBBD: 3_500_000 },
      { label: 'Base Case',    totalBBD: 5_600_000 },
      { label: 'Optimistic',   totalBBD: 7_800_000 },
    ] : [
      { label: 'Conservative', totalBBD: 7_000_000 },
      { label: 'Base Case',    totalBBD: 11_200_000 },
      { label: 'Optimistic',   totalBBD: 15_600_000 },
    ]

  return scenarios.map(s => ({
    scenario: s.label,
    rangeFeesBBD:   Math.round(s.totalBBD * 0.35),
    fnbBBD:         Math.round(s.totalBBD * 0.40),
    eventsBBD:      Math.round(s.totalBBD * 0.15),
    membershipsBBD: Math.round(s.totalBBD * 0.10),
    totalBBD:       s.totalBBD,
    totalUSD:       Math.round(s.totalBBD / 2),
  }))
}

// ── Operating Costs ────────────────────────────────────────────────────────

export function xrangeOpex(format: XRangeFormat = 'small') {
  const config = XRANGE_FORMATS[format]
  const baseRevenue = format === 'small' ? 2_800_000 : format === 'mid' ? 5_600_000 : 11_200_000

  return {
    staffing: { fte: format === 'small' ? 18 : format === 'mid' ? 30 : 50, annualBBD: format === 'small' ? 1_400_000 : format === 'mid' ? 2_400_000 : 4_000_000 },
    cogsFnB: Math.round(baseRevenue * 0.40 * 0.30),  // 30% of F&B revenue
    maintenance: Math.round(config.capexBBD * 0.04),  // 4% of capex
    utilities: format === 'small' ? 200_000 : format === 'mid' ? 350_000 : 500_000,
    licensingFee: Math.round(baseRevenue * 0.15),     // 15% of revenue
    marketing: Math.round(baseRevenue * 0.08),         // 8% of revenue
  }
}

// ── Residential Pricing Synergy (from MBE_D1) ──────────────────────────────

export const PRICING_SYNERGY = {
  premiumRange: [0.05, 0.15] as [number, number],
  estimatedUpliftAt5pct_BBD: 12_400_000,
  estimatedUpliftAt15pct_BBD: 37_000_000,
  note: 'Entertainment golf supports 5-15% residential price premium vs. BBD 6.4M capex',
}
