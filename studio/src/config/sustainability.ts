/** Sustainability targets — EDGE Advanced certification pathway.
 *  Barbados NDC commitments + Green Economy alignment. */
export const SUSTAINABILITY = {
  certification: {
    target: 'EDGE_Advanced' as const,
    auditCost: 45000,
    complianceCost: 85000,
  },
  energy: {
    pvArrayKw: 75,
    annualGenerationKwh: 112500, // 75 kW × 1500 peak sun hours
    buildingLoadKwh: 325000,     // 130 keys × 2500 kWh/key/year
    renewablePct: 0.346,         // 34.6% off-grid
    operationalTarget: 120,      // kWh/m²/year (high-performance)
  },
  water: {
    baselineLitresPerGuestNight: 350,
    greyWaterRecyclingPct: 0.30,
    rainwaterCaptureM3: 2685,    // footprint × 1.2m annual rainfall × 70% efficiency
    potableReductionTarget: 0.40,
  },
  carbon: {
    embodiedTarget: 450,         // kg CO2e/m²
    steelFactor: 2.1,            // tonnes CO2e per tonne steel
    concreteFactor: 0.15,        // tonnes CO2e per tonne concrete
  },
  waste: {
    constructionDiversionTarget: 0.75, // 75% diverted from landfill
    operationalRecycling: 0.60,
  },
} as const
