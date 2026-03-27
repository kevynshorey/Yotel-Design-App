/**
 * Mt Brevitor Estates — Financial Configuration
 * Source: MBE_E2_InvestmentMemorandum_v2.0, MBE_B2_ResidentialConfiguration_v2.0,
 *         MBE_D1_XRangeGolfBrief_v2.0, MBE_F4_LegalStructureNote_v2.0
 *
 * All BBD values. USD = BBD / 2 (fixed peg since 1975).
 */

// ── Headline Numbers ───────────────────────────────────────────────────────

export const FINANCIALS = {
  // Gross Development Value
  residentialGDV_BBD:  247_014_500,   // 355 units (from MBE_B2 unit mix)
  residentialGDV_USD:  123_507_250,
  totalGDV_USD:        168_300_000,   // incl. farm, golf, solar, commercial
  totalGDV_BBD:        336_600_000,

  // Development Costs
  totalDevCost_USD:    114_100_000,
  totalDevCost_BBD:    228_200_000,

  // Profit
  netProfit_USD:       46_900_000,
  netProfit_BBD:       93_800_000,
  netMargin:           0.28,          // 28%

  // Financing
  financingSought_USD: 57_000_000,
  financingSought_BBD: 114_000_000,
  proposedRate:        0.05,          // FLAG F-01: 5% unverified, Barbados commercial 6-9%

  // Returns
  unleveredIRR:        [0.18, 0.25],  // 18-25% sensitivity dependent

  // Land
  totalLandCost_USD:   4_625_000,
  totalLandCost_BBD:   9_250_000,
  landValue_BBD:       25_000_000,    // agreed valuation for SPV contribution (from MBE_F4)
} as const

// ── Revenue by Phase (from MBE_B2) ────────────────────────────────────────

export interface PhaseRevenue {
  phase: number
  period: string
  unitsMin: number
  unitsMax: number
  revenueBBD: number
  revenueUSD: number
}

export const PHASE_REVENUE: PhaseRevenue[] = [
  { phase: 1, period: 'Q3 2025-Q2 2026', unitsMin: 80,  unitsMax: 90,  revenueBBD: 42_600_000,  revenueUSD: 21_300_000 },
  { phase: 2, period: 'Q3 2026-Q2 2027', unitsMin: 100, unitsMax: 120, revenueBBD: 65_500_000,  revenueUSD: 32_750_000 },
  { phase: 3, period: 'Q3 2027-Q2 2028', unitsMin: 85,  unitsMax: 100, revenueBBD: 68_200_000,  revenueUSD: 34_100_000 },
  { phase: 4, period: 'Q3 2028-Q4 2028+', unitsMin: 45,  unitsMax: 55,  revenueBBD: 70_714_500,  revenueUSD: 35_357_250 },
]

// ── Absorption Rate Scenarios (from MBE_B2) ────────────────────────────────

export interface AbsorptionScenario {
  label: string
  annualUnitsMin: number
  annualUnitsMax: number
  selloutYears: [number, number]
  assumptions: string
}

export const ABSORPTION_SCENARIOS: AbsorptionScenario[] = [
  {
    label: 'Conservative',
    annualUnitsMin: 60, annualUnitsMax: 80,
    selloutYears: [4.5, 6],
    assumptions: 'Local demand only, no diaspora traction',
  },
  {
    label: 'Base Case',
    annualUnitsMin: 100, annualUnitsMax: 120,
    selloutYears: [3, 3.5],
    assumptions: 'Local + diaspora active, 95% LTV mortgage works',
  },
  {
    label: 'Optimistic',
    annualUnitsMin: 130, annualUnitsMax: 150,
    selloutYears: [2.5, 3],
    assumptions: 'All buyer segments strong, international demand',
  },
]

// ── Non-Residential Revenue Streams (Stabilised Annual) ────────────────────

export const NON_RESIDENTIAL_REVENUE = {
  xRange: {
    label: 'X Range Golf Entertainment',
    conservative_BBD: 1_750_000,
    baseCase_BBD:     2_800_000,
    optimistic_BBD:   3_900_000,
    stabilisedYear:   3,
    flag: 'O-02: Operator terms undocumented. All figures are assumptions.',
  },
  farm: {
    label: 'Agri-Estate (Working Farm)',
    conservative_BBD: 2_000_000,   // USD 1.0M
    baseCase_BBD:     2_500_000,   // USD 1.25M
    optimistic_BBD:   3_000_000,   // USD 1.5M
    stabilisedYear:   3,
    cogsReduction:    0.06,        // 6-8% COGS reduction via farm-to-table
  },
  solar: {
    label: 'Hybrid Solar-Battery',
    baseCase_BBD:     800_000,     // utility offset estimate
    capacityMW:       [2, 3],
    annualMWh:        [3000, 4500],
  },
  commercial: {
    label: 'Commercial / Retail Leasing',
    baseCase_BBD:     1_200_000,   // NNN lease income estimate
  },
} as const

// ── Tax Structure (from MBE_F4) ────────────────────────────────────────────

export const TAX_STRUCTURE = {
  corporationTax:       0.09,     // 9% flat (2024 amendment)
  propertyTransferTax:  0.025,    // 2.5% — seller pays
  stampDuty:            0.01,     // 1%
  combinedTransferCost: 0.035,    // 3.5% total on each unit sale
  transferTaxTotal_BBD: 6_900_000,// on BBD 198.3M rev
  whtDividends:         0,        // 0% for non-residents — major advantage
  whtInterest:          0.15,     // 15% standard (reduced under DTAs)
  vat:                  0.175,    // 17.5% (residential sales generally exempt)
  globalMinTax:         0.15,     // only if investor group > EUR 750M revenue
} as const

// ── Capital Structure (from MBE_F4) ────────────────────────────────────────

export const CAPITAL_STRUCTURE = {
  spvEntity: 'Mount Brevitor Development Ltd (proposed)',
  spvStatus: 'NOT YET INCORPORATED — FLAG L-01',
  authorisedCapital_BBD: 100_000_000,
  shareClasses: {
    classA: 'Ordinary (voting, developer)',
    classB: 'Ordinary (voting, investors)',
    classP: 'Preference (non-voting, 8-12% cumulative dividend)',
  },
  developerEquity_BBD: 25_000_000,  // land contribution valuation
  legalCosts_USD: [100_000, 200_000],
} as const

// ── Residential Pricing Synergy (from MBE_D1) ─────────────────────────────

export const PRICING_SYNERGY = {
  xRangePremium: [0.05, 0.15],     // 5-15% residential price premium
  premiumAtFive_BBD: 12_400_000,    // BBD uplift at 5% premium
  premiumAtFifteen_BBD: 37_000_000, // BBD uplift at 15% premium
  vsCapex_BBD: 6_400_000,           // mid-range X Range capex for comparison
} as const

// ── Critical Risk Flags (from MBE_F1) ──────────────────────────────────────

export interface RiskFlag {
  id: string
  severity: 'CRITICAL' | 'HIGH'
  title: string
  description: string
  mitigation: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}

export const CRITICAL_RISKS: RiskFlag[] = [
  {
    id: 'F-01',
    severity: 'CRITICAL',
    title: '5% Interest Rate Unverified',
    description: 'Proposed 5% rate is below Barbados commercial rates (6-9%). No lender confirmation.',
    mitigation: 'Developer must confirm lender type and rate basis. Stress-test at 7% and 9%.',
    status: 'OPEN',
  },
  {
    id: 'O-02',
    severity: 'CRITICAL',
    title: 'X Range Operator Terms Undocumented',
    description: 'No brand agreement, no capex confirmation, no operator terms. All figures are assumptions.',
    mitigation: 'Obtain LOI or term sheet from X Range. Define fallback if deal falls through.',
    status: 'OPEN',
  },
  {
    id: 'T-03',
    severity: 'CRITICAL',
    title: 'Planning Timeline vs Model',
    description: 'EIA + planning approval typically 12-18 months. Financial model assumes faster timeline.',
    mitigation: 'Revise financial model for 12-18 month planning period. Stress-test cash flow with 6-12 month revenue delay.',
    status: 'OPEN',
  },
  {
    id: 'L-01',
    severity: 'CRITICAL',
    title: 'SPV Not Incorporated',
    description: 'Mount Brevitor Development Ltd not yet formed. Cannot raise capital or execute contracts.',
    mitigation: 'Incorporate SPV before first capital raise. Estimated cost BBD 200K-400K.',
    status: 'OPEN',
  },
]

// ── Macroeconomic Context (from MBE_E2) ────────────────────────────────────

export const MACRO = {
  gdpGrowth2025:       0.027,     // 2.7%
  gdpGrowth2026:       [0.025, 0.030],
  inflation2025:       [0.017, 0.035],
  currencyPeg:         2.0,       // BBD:USD fixed since 1975
  internationalReserves: '9+ months import cover',
  tourismArrivals2025: 503_000,   // Jan-Aug, +5.4% YoY
  housingDeficit:      10_000,    // 10,000+ units, <500 delivered past 4 years
  northernPriceGrowth: 0.10,     // ~10% annual vs 3-5% island average
} as const
