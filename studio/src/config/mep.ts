/** MEP systems cost model — calibrated for Barbados tropical maritime climate.
 *  Sources: BCQS 2025, BL&P tariff schedule, BWA infrastructure charges. */
export const MEP_COSTS = {
  hvac: {
    perM2: 180,              // VRF + split systems, tropical-rated
    chillerAllowance: 45000, // central plant (130 keys)
    maintenanceSetup: 35000, // generators, fuel tanks
  },
  electrical: {
    perM2: 95,               // BL&P distribution, panels, cabling
    generatorSet: 120000,    // 500 kW emergency backup
    ups: 85000,              // UPS for IT/security
    lightningProtection: 25000,
  },
  plumbing: {
    perM2: 75,               // BWA connection, risers, fixtures
    bwaInfrastructure: 25000,
    greyWaterSystem: 65000,  // recycling for irrigation/cooling
    rainwaterHarvesting: 45000,
  },
  fireSafety: {
    perM2: 45,               // sprinklers, alarms, wet risers (NFPA)
    fireServiceCompliance: 18000,
  },
  renewable: {
    pvPerKw: 2200,           // installed cost (2025)
    pvSizeKw: 75,            // 30-40% of annual load
    solarWaterHeating: 28000,
    batteryStorage: 65000,   // 50 kWh lithium-ion
  },
  utilityConnections: {
    blpDemandCharge: 25000,
    blpTransformer: 85000,   // 1000 kVA
    blpEngineering: 18000,
    bwaConnection: 15000,
    bwaSewage: 35000,
  },
} as const

export function calculateMepTotal(giaM2: number): {
  hvac: number; electrical: number; plumbing: number;
  fireSafety: number; renewable: number; utilities: number; total: number
} {
  const hvac = giaM2 * MEP_COSTS.hvac.perM2 + MEP_COSTS.hvac.chillerAllowance + MEP_COSTS.hvac.maintenanceSetup
  const electrical = giaM2 * MEP_COSTS.electrical.perM2 + MEP_COSTS.electrical.generatorSet + MEP_COSTS.electrical.ups + MEP_COSTS.electrical.lightningProtection
  const plumbing = giaM2 * MEP_COSTS.plumbing.perM2 + MEP_COSTS.plumbing.bwaInfrastructure + MEP_COSTS.plumbing.greyWaterSystem + MEP_COSTS.plumbing.rainwaterHarvesting
  const fireSafety = giaM2 * MEP_COSTS.fireSafety.perM2 + MEP_COSTS.fireSafety.fireServiceCompliance
  const renewable = MEP_COSTS.renewable.pvPerKw * MEP_COSTS.renewable.pvSizeKw + MEP_COSTS.renewable.solarWaterHeating + MEP_COSTS.renewable.batteryStorage
  const utilities = MEP_COSTS.utilityConnections.blpDemandCharge + MEP_COSTS.utilityConnections.blpTransformer + MEP_COSTS.utilityConnections.blpEngineering + MEP_COSTS.utilityConnections.bwaConnection + MEP_COSTS.utilityConnections.bwaSewage
  return { hvac, electrical, plumbing, fireSafety, renewable, utilities, total: hvac + electrical + plumbing + fireSafety + renewable + utilities }
}
