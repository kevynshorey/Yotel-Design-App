/** Stormwater drainage — Barbados Drainage Division compliance.
 *  Design for high-intensity tropical rainfall (150mm/hr peak, 1-in-25yr event).
 *  Sources: Barbados Drainage Division guidelines, CZMU stormwater regs. */
export const DRAINAGE = {
  /** Rainfall design parameters */
  rainfall: {
    peakIntensityMmHr: 150,      // 1-in-25yr storm event
    annualMm: 1200,              // average annual rainfall Barbados
    designStormMinutes: 60,       // 1-hour duration for pipe sizing
  },

  /** Runoff coefficients by surface type */
  runoffCoefficients: {
    roofArea: 0.95,
    pavedArea: 0.85,
    permeablePavers: 0.40,       // 55% infiltration
    landscape: 0.20,
    pool: 0.00,                   // contained
  },

  /** Drainage infrastructure */
  systems: [
    { name: 'Roof drainage', description: 'Internal downpipes to underground tank \u2192 overflow to soakaway' },
    { name: 'Surface channels', description: 'Slot drains at pool deck, drives, paths \u2192 oil separator \u2192 soakaway' },
    { name: 'Permeable paving', description: 'Sub-base reservoir for infiltration (driveways, paths)' },
    { name: 'Rainwater harvesting', description: '50m\u00B3 underground tank for irrigation + toilet flushing' },
    { name: 'Soakaway pits', description: 'Coral limestone infiltration (high permeability)' },
    { name: 'Oil/grease separator', description: 'Required for parking + kitchen waste before discharge' },
  ],

  /** Cost rates */
  costs: {
    roofDrainagePerM2: 25,       // internal downpipes + connections
    surfaceChannelsPerM: 180,    // slot drains installed
    undergroundTankPerM3: 850,   // reinforced concrete or GRP
    soakawayEach: 8500,          // 2m x 2m x 2m pit with gravel fill
    oilSeparator: 15000,         // pre-cast unit
    permeableSubBase: 45,        // per m² additional over standard
  },

  /** Required storage (litres) per m² impervious area */
  retentionLPerM2: 35,           // Drainage Division minimum
} as const

/** Calculate drainage requirements and costs */
export function calculateDrainage(
  buildingFootprint: number,
  hardscapeArea: number,
  permeableArea: number,
  softscapeArea: number,
) {
  const { rainfall, runoffCoefficients, costs, retentionLPerM2 } = DRAINAGE

  // Impervious area calculation
  const roofRunoff = buildingFootprint * runoffCoefficients.roofArea
  const pavedRunoff = (hardscapeArea - permeableArea) * runoffCoefficients.pavedArea
  const permeableRunoff = permeableArea * runoffCoefficients.permeablePavers
  const landscapeRunoff = softscapeArea * runoffCoefficients.landscape
  const totalRunoffArea = roofRunoff + pavedRunoff + permeableRunoff + landscapeRunoff

  // Peak flow (Q = C x I x A, rational method, m³/hr)
  const peakFlowM3Hr = (totalRunoffArea * rainfall.peakIntensityMmHr) / 1000

  // Required retention volume
  const imperviousArea = buildingFootprint + (hardscapeArea - permeableArea)
  const retentionM3 = Math.ceil((imperviousArea * retentionLPerM2) / 1000)

  // Rainwater harvesting tank (50m³ target)
  const harvestingTankM3 = 50

  // Number of soakaways needed (each handles ~4m³)
  const soakawayCount = Math.ceil(retentionM3 / 4)

  // Surface channel length (perimeter of building + pool deck)
  const channelLengthM = Math.round(Math.sqrt(buildingFootprint) * 4 + 60) // approximate

  // Costs
  const drainageCosts = {
    roofDrainage: buildingFootprint * costs.roofDrainagePerM2,
    surfaceChannels: channelLengthM * costs.surfaceChannelsPerM,
    retentionTank: harvestingTankM3 * costs.undergroundTankPerM3,
    soakaways: soakawayCount * costs.soakawayEach,
    oilSeparator: costs.oilSeparator,
    permeableSub: permeableArea * costs.permeableSubBase,
  }
  const totalCost = Object.values(drainageCosts).reduce((a, b) => a + b, 0)

  return {
    totalRunoffArea: Math.round(totalRunoffArea),
    peakFlowM3Hr: Math.round(peakFlowM3Hr),
    retentionM3,
    harvestingTankM3,
    soakawayCount,
    channelLengthM,
    imperviousArea: Math.round(imperviousArea),
    costs: drainageCosts,
    totalCost,
  }
}
