/**
 * Mt Brevitor Estates — Full Risk Register
 * Source: MBE_F1_RiskRegister_v2.0.xlsx (46 risks)
 */

import type { Risk } from '../types'

// ── CRITICAL Risks (4) ─────────────────────────────────────────────────────

export const CRITICAL_RISKS: Risk[] = [
  { id: 'F-01', category: 'FINANCIAL', severity: 'HIGH', title: 'Interest Rate at 6.5%', description: 'Revised to Barbados prime (4%) + 2.5% development spread = 6.5%. Still stress-test at 7.5% and 9%.', mitigation: 'Rate aligned to market. Continue stress-testing higher scenarios.', status: 'IN_PROGRESS' },
  { id: 'O-02', category: 'OPERATIONAL', severity: 'CRITICAL', title: 'X Range Format Undocumented', description: 'Format, footprint, capex, and operator model not documented. All revenue figures are assumptions.', mitigation: 'Obtain LOI or term sheet from X Range operator. Define fallback scenarios.', status: 'OPEN' },
  { id: 'T-03', category: 'TIMELINE', severity: 'CRITICAL', title: 'Planning Timeline vs Model', description: 'EIA + planning approval typically 12-18 months in Barbados. Financial model assumes faster timeline.', mitigation: 'Revise model for 12-18 month planning period. Stress-test cash flow with 6-12 month revenue delay.', status: 'OPEN' },
  { id: 'L-01', category: 'LEGAL', severity: 'CRITICAL', title: 'SPV Incorporated', description: 'Coruscant Developments Inc — incorporated and active.', mitigation: 'Resolved.', status: 'RESOLVED' },
]

// ── HIGH Risks (16) ────────────────────────────────────────────────────────

export const HIGH_RISKS: Risk[] = [
  { id: 'P-01', category: 'PLANNING', severity: 'HIGH', title: 'Agricultural Land Conversion', description: '6-acre designated agricultural parcel requires conversion consent for X Range and non-agricultural uses.', mitigation: 'Engage Town & Country Planning early. Prepare fallback: relocate X Range to non-designated land.', status: 'OPEN' },
  { id: 'P-02', category: 'PLANNING', severity: 'HIGH', title: 'Parish Unconfirmed', description: 'Exact parish not confirmed in project documents. Assumed St Peter.', mitigation: 'Confirm parish with land registry and title search.', status: 'OPEN' },
  { id: 'P-03', category: 'PLANNING', severity: 'HIGH', title: 'EIA Mandatory', description: 'Schedule 1 EIA required for 355-unit development + water treatment plant. 6-12 month process.', mitigation: 'Commission consolidated EIA covering all components immediately.', status: 'OPEN' },
  { id: 'P-04', category: 'PLANNING', severity: 'HIGH', title: 'Planning Refusal Risk', description: 'Large-scale development in northern Barbados may face community opposition or planning objections.', mitigation: 'Community engagement strategy. Phased submission approach.', status: 'OPEN' },
  { id: 'F-02', category: 'FINANCIAL', severity: 'HIGH', title: 'Construction Cost Savings Unverified', description: 'Developer claims 25% savings vs BCQS benchmarks via proprietary construction technology. Not validated.', mitigation: 'Independent QS review. Use BCQS base case, model savings as upside.', status: 'IN_PROGRESS' },
  { id: 'F-03', category: 'FINANCIAL', severity: 'HIGH', title: 'Pre-Sales Below Industry Norm', description: 'Developer targets 10% pre-sales (~35 units). Industry norm is 20-30% (~70-105 units).', mitigation: 'Increase pre-sales target to minimum 20%. Defer Phase 1 commit until threshold met.', status: 'OPEN' },
  { id: 'F-04', category: 'FINANCIAL', severity: 'HIGH', title: 'Peak Capital Draw 2026', description: 'BBD 78.2M loan draw in 2026 — single-year concentration risk.', mitigation: 'Phase draws more evenly. Secure standby facility.', status: 'OPEN' },
  { id: 'F-07', category: 'FINANCIAL', severity: 'HIGH', title: 'Transaction Taxes Not Modelled', description: '3.5% combined transfer cost on BBD 198.3M = BBD 6.9M not in original model.', mitigation: 'Include in cost model. Already added to estate engine.', status: 'OPEN' },
  { id: 'M-01', category: 'MARKET', severity: 'HIGH', title: 'Upper-Tier Pricing Unvalidated', description: '4-bed (BBD 880K) and 5-bed (BBD 1.75M) pricing has no direct inland north comparable.', mitigation: 'Commission independent valuation. Vuemont plantation at $2.5M provides ceiling reference.', status: 'OPEN' },
  { id: 'C-03', category: 'CONSTRUCTION', severity: 'HIGH', title: 'Proprietary Tech Unproven', description: 'Developer claims proprietary construction technology reduces costs 25%. No independent verification.', mitigation: 'Require prototype/pilot before committing to full-scale use.', status: 'IN_PROGRESS' },
  { id: 'C-05', category: 'CONSTRUCTION', severity: 'HIGH', title: 'Infrastructure Delivery Delay', description: 'Roads, water treatment, electrical — any delay cascades to residential delivery.', mitigation: 'Infrastructure must lead residential by 6+ months. Critical path monitoring.', status: 'OPEN' },
  { id: 'E-03', category: 'ENVIRONMENTAL', severity: 'HIGH', title: 'Hurricane Risk', description: 'Category 3+ hurricane on 5-10 year cycle. All structures must be hurricane-rated.', mitigation: 'Hurricane-rated design standard. Builders risk insurance. Emergency shelter designation.', status: 'OPEN' },
  { id: 'E-06', category: 'ENVIRONMENTAL', severity: 'HIGH', title: 'Water Demand', description: '233,000 gallons/day total demand — significant for on-site treatment.', mitigation: 'Commission water demand study. Size treatment plant with 20% buffer.', status: 'OPEN' },
  { id: 'T-01', category: 'TIMELINE', severity: 'HIGH', title: 'Aggressive 2025 Revenue', description: 'Financial model shows 30 unit sales in 2025. Pre-sales + planning timeline makes this aggressive.', mitigation: 'Delay revenue start to 2026. Model 2025 as infrastructure-only year.', status: 'OPEN' },
  { id: 'L-03', category: 'LEGAL', severity: 'HIGH', title: 'ECA Registration', description: 'Non-resident investors must register foreign currency with Exchange Control Authority. Failure may impair repatriation.', mitigation: 'Mandate ECA registration as condition of investment. Legal counsel to manage.', status: 'OPEN' },
  { id: 'L-04', category: 'LEGAL', severity: 'HIGH', title: 'JV Deadlock Risk', description: 'If JV structure adopted, decision deadlock between developer and investor possible.', mitigation: 'Include deadlock resolution in shareholders agreement. Recommend sole developer + passive investors for Phase 1.', status: 'OPEN' },
]

// ── All Risks Combined ─────────────────────────────────────────────────────

export const ALL_RISKS: Risk[] = [...CRITICAL_RISKS, ...HIGH_RISKS]

export function riskSummary() {
  return {
    total: 46,
    critical: CRITICAL_RISKS.length,
    high: HIGH_RISKS.length,
    medium: 26,                  // from MBE_F1 summary
    low: 0,
    phase1Risks: 32,
    phase2NewRisks: 14,
    immediateAction: ['F-01', 'T-01', 'T-03', 'L-01'],
    inProgress: ['F-02', 'O-02'],
  }
}
