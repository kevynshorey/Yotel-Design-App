/**
 * Mt Brevitor Estates — Sustainability Configuration
 * Source: MBE_F3_EnvironmentalSustainabilityBrief_v2.0
 */

export const SUSTAINABILITY = {
  // Certification targets
  primaryTarget: 'EDGE Advanced',
  alternativeTarget: 'LEED Silver',  // only if investor requires it

  // EDGE Advanced thresholds
  energySavings:    [0.30, 0.40],    // 30-40% vs baseline
  waterSavings:     [0.25, 0.35],    // 25-35% vs baseline
  materialSavings:  [0.15, 0.25],    // 15-25% (marginal — depends on proprietary tech)

  // Energy
  solarCapacityMW:     [2, 3],       // agrivoltaic array
  batteryStoragekWh:   [500, 1000],
  annualGenerationMWh: [3000, 4500],
  baselineConsumptionMWh: [4000, 5500],  // 355 units + commercial
  gridEmissionsFactor: 0.7,          // kg CO2/kWh
  baselineCO2Tonnes:   [2800, 3850],
  solarOffset:         [0.40, 0.60], // 40-60%
  residualCO2Tonnes:   [1120, 2310],
  annualCO2Reduction:  [1200, 2000], // tonnes/yr
  dieselBackupTarget:  0.10,         // below 10% of annual energy

  // Water
  totalDemandGallonsPerDay: 233_000, // residential + farm + amenities
  waterTreatmentLevel: 'tertiary',   // reuse for irrigation, landscaping, non-potable
  municipalReduction:  [0.30, 0.50], // 30-50% reduction
  aquaponicsWaterReuse: 0.90,        // 90%

  // Climate risk profile
  climateRisks: {
    hurricane:     { severity: 'CRITICAL', probability: 'medium', cycle: '5-10 years' },
    flooding:      { severity: 'HIGH', design: '1-in-50-year drainage' },
    drought:       { severity: 'MEDIUM', mitigation: 'on-site treatment + recycling' },
    seaLevelRise:  { severity: 'LOW-MEDIUM', advantage: 'inland elevated site' },
    tempIncrease:  { severity: 'MEDIUM', mitigation: 'passive cooling, trade wind orientation' },
  },

  // Design principles
  designPrinciples: [
    'All structures hurricane-rated',
    'Trade wind orientation for passive cooling',
    'Stormwater management for 1-in-50-year event',
    'Gully buffer as environmental corridor',
    'Agrivoltaic panels (dual-use: energy + shade for crops)',
    'On-site water treatment to tertiary standard',
    'Walkable community — all residents within 10 min of hub',
  ],
} as const
