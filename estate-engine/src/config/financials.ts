import type { AbsorptionScenario, CostBreakdown, DevelopmentPhase, FinancialSummary, NonResidentialZone, Risk } from '../types'
import { TOTAL_GDV_BBD, TOTAL_GDV_USD } from './products'

export const PHASES: DevelopmentPhase[] = [
  { number: 1, period: 'Q3 2025 - Q2 2026', acresMin: 25, acresMax: 30, unitsMin: 80, unitsMax: 90, revenueBBD: 67_660_000, revenueUSD: 33_830_000, components: ['Site prep + primary road', 'Utilities + water treatment', 'Cluster A (80-90 units)', 'Model home', 'Farm setup', 'Community hub'] },
  { number: 2, period: 'Q3 2026 - Q2 2027', acresMin: 30, acresMax: 35, unitsMin: 100, unitsMax: 120, revenueBBD: 65_500_000, revenueUSD: 32_750_000, components: ['X Range Golf', 'Clusters B+C (100-120 units)', 'Community expansion', 'Solar array', 'Farm expansion'] },
  { number: 3, period: 'Q3 2027 - Q2 2028', acresMin: 20, acresMax: 25, unitsMin: 85, unitsMax: 100, revenueBBD: 72_254_500, revenueUSD: 36_127_250, components: ['Cluster D (85-100 units)', 'Commercial lots', 'Upper-tier homes'] },
  { number: 4, period: 'Q3 2028 - Q4 2028+', acresMin: 25, acresMax: 30, unitsMin: 90, unitsMax: 110, revenueBBD: 132_887_000, revenueUSD: 66_443_500, components: ['Cluster E (premium estates)', 'Cluster G (hilltop — 3-bed TH, 4-bed homes, 5-bed estates)', 'Reserve land', 'Farm at full scale'] },
]

export const ABSORPTION: AbsorptionScenario[] = [
  { label: 'Conservative', annualUnitsMin: 60, annualUnitsMax: 80, selloutYearsMin: 4.5, selloutYearsMax: 6, assumptions: 'Local demand only' },
  { label: 'Base Case', annualUnitsMin: 100, annualUnitsMax: 120, selloutYearsMin: 3, selloutYearsMax: 3.5, assumptions: 'Local + diaspora, mortgage works' },
  { label: 'Optimistic', annualUnitsMin: 130, annualUnitsMax: 150, selloutYearsMin: 2.5, selloutYearsMax: 3, assumptions: 'All segments strong' },
]

export const NON_RESIDENTIAL: NonResidentialZone[] = [
  { id: 'agri_estate', label: 'Agri-Estate', acresMin: 15, acresMax: 17, phase: 1, capexBBD: 4_000_000, annualRevenueBBD: 2_500_000, operatingCostBBD: 1_500_000, description: 'Aquaponics, dairy, cheese.', flags: [] },
  { id: 'x_range', label: 'X Range Golf', acresMin: 6, acresMax: 8, phase: 2, capexBBD: 8_500_000, annualRevenueBBD: 3_600_000, operatingCostBBD: 2_700_000, description: 'XRU format: 30 bays, Trackman radar, Laservision Mega Media, XR Sports Bar + Forbidden Fruit dining (120 covers).', flags: ['O-02: Operator terms undocumented'] },
  { id: 'community', label: 'Community Facilities', acresMin: 4, acresMax: 5, phase: 1, capexBBD: 8_000_000, annualRevenueBBD: 0, operatingCostBBD: 1_200_000, description: 'Medical, supermarket, pool, gym, courts.', flags: [] },
  { id: 'green_infra', label: 'Green Infrastructure', acresMin: 5, acresMax: 6, phase: 1, capexBBD: 12_000_000, annualRevenueBBD: 800_000, operatingCostBBD: 400_000, description: '2-3 MW solar, battery, water treatment.', flags: [] },
  { id: 'commercial', label: 'Commercial Lots', acresMin: 3, acresMax: 4, phase: 3, capexBBD: 2_000_000, annualRevenueBBD: 1_200_000, operatingCostBBD: 200_000, description: 'Leased retail/service lots.', flags: [] },
]

export const COSTS: CostBreakdown = {
  land: 9_250_000,
  siteInfrastructure: 40_000_000,
  residentialConstruction: 120_000_000,
  communityFacilities: 8_000_000,      // Central hub: medical + supermarket + gym + 50m pool + courts
  clusterAmenities: 12_900_000,         // 7 × cluster pools + pavilions + amenity buildings (BBD 1.2-2.8M each); +2.2M Cluster G
  greenInfrastructure: 12_000_000,
  xRangeCapex: 8_500_000,
  farmCapex: 4_000_000,
  softCosts: 18_550_000,
  contingency: 9_400_000,
  transactionTaxes: 6_900_000,
  total: 249_500_000,                   // UPDATED: +2.2M Cluster G amenities; +2.1M XRU capex increase (6.4M → 8.5M)
}

export const TAX = {
  corporationTax: 0.09,
  propertyTransferTax: 0.025,
  stampDuty: 0.01,
  combinedTransferCost: 0.035,
  whtDividendsNonResident: 0,
  whtInterest: 0.15,
  vat: 0.175,
  currencyPeg: 2.0,
} as const

export const CAPITAL = {
  spvName: 'Coruscant Developments Inc',
  spvStatus: 'INCORPORATED',
  authorisedCapitalBBD: 100_000_000,
  developerLandContributionBBD: 25_000_000,
  financingSoughtUSD: 57_000_000,
  proposedRate: 0.065,
  legalCostsUSD: [100_000, 200_000] as [number, number],
} as const

export const MORTGAGE = {
  ltv: 0.95,
  interestRate: 0.065,
  termYears: 25,
  entryDepositBBD: 18_500,
  qualifyingIncomeBBD: 70_000,
  dtiMax: 0.35,
} as const

export const CRITICAL_RISKS: Risk[] = [
  { id: 'F-01', category: 'FINANCIAL', severity: 'HIGH', title: 'Interest Rate at 6.5%', description: 'Revised to Barbados prime (4%) + 2.5% development spread = 6.5%. Stress-test at 7.5% and 9%.', mitigation: 'Rate aligned to market. Continue stress-testing higher scenarios.', status: 'IN_PROGRESS' },
  { id: 'O-02', category: 'OPERATIONAL', severity: 'CRITICAL', title: 'X Range Format Undocumented', description: 'Format, footprint, capex, and operator model not documented. All revenue figures are assumptions.', mitigation: 'Obtain LOI or term sheet from X Range operator. Define fallback scenarios.', status: 'OPEN' },
  { id: 'T-03', category: 'TIMELINE', severity: 'CRITICAL', title: 'Planning Timeline vs Model', description: 'EIA + planning approval typically 12-18 months in Barbados. Financial model assumes faster timeline.', mitigation: 'Revise model for 12-18 month planning period. Stress-test cash flow with 6-12 month revenue delay.', status: 'OPEN' },
  { id: 'L-01', category: 'LEGAL', severity: 'CRITICAL', title: 'SPV Incorporated', description: 'Coruscant Developments Inc — incorporated and active.', mitigation: 'Resolved.', status: 'RESOLVED' },
]

export const FINANCIAL_SUMMARY: FinancialSummary = {
  gdv: {
    phases: PHASES.map(p => ({ phase: p.number, period: p.period, unitsMin: p.unitsMin, unitsMax: p.unitsMax, revenueBBD: p.revenueBBD, revenueUSD: p.revenueUSD })),
    totalResidentialGDV_BBD: TOTAL_GDV_BBD,
    totalResidentialGDV_USD: TOTAL_GDV_USD,
    annualNonResidentialRevenue_BBD: NON_RESIDENTIAL.reduce((s, z) => s + z.annualRevenueBBD, 0),
    totalGDV_BBD: TOTAL_GDV_BBD + NON_RESIDENTIAL.reduce((s, z) => s + z.annualRevenueBBD, 0) * 4, // residential + 4yr non-res
    totalGDV_USD: Math.round((TOTAL_GDV_BBD + NON_RESIDENTIAL.reduce((s, z) => s + z.annualRevenueBBD, 0) * 4) / 2),
  },
  costs: COSTS,
  netProfit_USD: 33_903_500,   // NOTE: full reforecast needed with financing model after XRU capex increase
  netProfit_BBD: 67_807_000,   // NOTE: full reforecast needed with financing model after XRU capex increase
  netMargin: 0.217,             // NOTE: full reforecast needed with financing model after XRU capex increase
  unleveredIRR: [0.16, 0.22],
  financingSought_USD: 57_000_000,
  proposedRate: 0.065,
  absorption: ABSORPTION,
}
