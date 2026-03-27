/**
 * Mt Brevitor Estates — Sustainability Profile
 * Source: MBE_F3_EnvironmentalSustainabilityBrief_v2.0
 */

import type { SustainabilityProfile } from '../types'

export const SUSTAINABILITY: SustainabilityProfile = {
  certificationTarget: 'EDGE_ADVANCED',
  energySavingsRange: [0.30, 0.40],
  waterSavingsRange: [0.25, 0.35],
  solarCapacityMW: [2, 3],
  annualCO2ReductionTonnes: [1200, 2000],
  waterDemandGallonsPerDay: 233_000,
  climateRisks: [
    { hazard: 'Hurricane (Cat 3+)', severity: 'CRITICAL', probability: '5-10 year cycle', mitigation: 'All structures hurricane-rated, emergency shelter designation' },
    { hazard: 'Flooding', severity: 'HIGH', probability: 'Annual during wet season', mitigation: '1-in-50-year drainage design, retention ponds' },
    { hazard: 'Drought', severity: 'MEDIUM', probability: 'Periodic', mitigation: 'On-site water treatment, aquaponics 90% reuse' },
    { hazard: 'Sea level rise', severity: 'LOW', probability: 'Long-term', mitigation: 'Inland elevated site — natural advantage' },
    { hazard: 'Temperature increase', severity: 'MEDIUM', probability: 'Ongoing', mitigation: 'Passive cooling, trade wind orientation, agrivoltaic shading' },
  ],
}
