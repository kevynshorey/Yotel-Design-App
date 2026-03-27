/**
 * Mt Brevitor Estates — Core Type System
 * Estate masterplan engine types (separate from hotel engine)
 */

// ── Geometry ───────────────────────────────────────────────────────────────

export interface Point2D { x: number; y: number }

// ── Residential Products ───────────────────────────────────────────────────

export interface ResidentialProduct {
  id: string                     // 'condo_1bed', 'townhouse_2bed', etc.
  label: string
  beds: number
  baths: number
  sizeSfMin: number
  sizeSfMax: number
  priceBBD: number
  priceUSD: number
  units: number
  priceBBDPerSf: number          // computed: priceBBD / midpoint sf
  color: string
}

// ── Residential Clusters ───────────────────────────────────────────────────

export type ClusterTier = 'entry' | 'mid' | 'mid_upper' | 'upper' | 'premium'

export interface ResidentialCluster {
  id: string                     // 'A' through 'E'
  label: string
  tier: ClusterTier
  acresMin: number
  acresMax: number
  unitsMin: number
  unitsMax: number
  products: string[]             // references ResidentialProduct.id
  targetBuyer: string
  densityMin: number             // units/acre
  densityMax: number
  phase: number
  color: string
}

// ── Non-Residential Zones ──────────────────────────────────────────────────

export interface NonResidentialZone {
  id: string
  label: string
  acresMin: number
  acresMax: number
  phase: number
  capexBBD: number               // mid estimate
  annualRevenueBBD: number       // stabilised base case
  operatingCostBBD: number       // annual
  description: string
  flags: string[]                // risk flags
}

// ── Land Allocation ────────────────────────────────────────────────────────

export interface LandAllocation {
  component: string
  acresMin: number
  acresMax: number
  pctOfSiteMin: number
  pctOfSiteMax: number
  phases: number[]
  notes: string
}

// ── Development Phases ─────────────────────────────────────────────────────

export interface DevelopmentPhase {
  number: number
  period: string
  acresMin: number
  acresMax: number
  unitsMin: number
  unitsMax: number
  revenueBBD: number
  revenueUSD: number
  components: string[]
}

// ── Financial Model ────────────────────────────────────────────────────────

export interface AbsorptionScenario {
  label: string
  annualUnitsMin: number
  annualUnitsMax: number
  selloutYearsMin: number
  selloutYearsMax: number
  assumptions: string
}

export interface CostBreakdown {
  land: number
  siteInfrastructure: number     // roads, utilities, water treatment
  residentialConstruction: number
  communityFacilities: number    // central hub: medical, supermarket, gym, 50m pool, courts
  clusterAmenities: number       // 6 × cluster pools + pavilions (BBD 1.2-2.8M each = ~10.7M total)
  greenInfrastructure: number    // solar, battery, water treatment
  xRangeCapex: number
  farmCapex: number
  softCosts: number
  contingency: number
  transactionTaxes: number
  total: number
}

export interface RevenueProjection {
  phases: PhaseRevenue[]
  totalResidentialGDV_BBD: number
  totalResidentialGDV_USD: number
  annualNonResidentialRevenue_BBD: number
  totalGDV_USD: number
  totalGDV_BBD: number
}

export interface PhaseRevenue {
  phase: number
  period: string
  unitsMin: number
  unitsMax: number
  revenueBBD: number
  revenueUSD: number
}

export interface FinancialSummary {
  gdv: RevenueProjection
  costs: CostBreakdown
  netProfit_USD: number
  netProfit_BBD: number
  netMargin: number
  unleveredIRR: [number, number] // [min, max]
  financingSought_USD: number
  proposedRate: number
  absorption: AbsorptionScenario[]
}

// ── Risk Management ────────────────────────────────────────────────────────

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type RiskStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED'
export type RiskCategory = 'FINANCIAL' | 'PLANNING' | 'OPERATIONAL' | 'MARKET' | 'CONSTRUCTION' | 'ENVIRONMENTAL' | 'TIMELINE' | 'LEGAL'

export interface Risk {
  id: string
  category: RiskCategory
  severity: RiskSeverity
  title: string
  description: string
  mitigation: string
  status: RiskStatus
  owner?: string
}

// ── Sustainability ─────────────────────────────────────────────────────────

export type CertificationTarget = 'EDGE_ADVANCED' | 'LEED_SILVER' | 'NONE'

export interface SustainabilityProfile {
  certificationTarget: CertificationTarget
  energySavingsRange: [number, number]
  waterSavingsRange: [number, number]
  solarCapacityMW: [number, number]
  annualCO2ReductionTonnes: [number, number]
  waterDemandGallonsPerDay: number
  climateRisks: ClimateRisk[]
}

export interface ClimateRisk {
  hazard: string
  severity: RiskSeverity
  probability: string
  mitigation: string
}

// ── Planning & Compliance ──────────────────────────────────────────────────

export interface PlanningRules {
  jurisdiction: string
  parish: string
  eiaRequired: boolean
  eiaEstimateMonths: [number, number]
  agriculturalConversionRequired: boolean
  maxCoverage: number
  maxHeightMetres: number
  maxStoreys: number
  hurricaneRating: boolean
  stormwaterDesign: string
  setbacks: {
    side: number
    rear: number
    road: number
  }
}

// ── Master Estate Config (top-level) ───────────────────────────────────────

export interface EstateConfig {
  name: string
  location: string
  parish: string
  grossAcres: number
  developableAcres: number
  totalUnits: number
  clusters: ResidentialCluster[]
  products: ResidentialProduct[]
  nonResidential: NonResidentialZone[]
  landAllocation: LandAllocation[]
  phases: DevelopmentPhase[]
  financials: FinancialSummary
  planning: PlanningRules
  sustainability: SustainabilityProfile
  risks: Risk[]
}
