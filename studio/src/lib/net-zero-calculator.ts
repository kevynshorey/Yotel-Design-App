/** Net-zero energy calculator for Caribbean hotel developments.
 *  Solar irradiance and demand benchmarks calibrated to Barbados (13°N latitude). */

// ── Constants ──────────────────────────────────────────────────────────

/** Peak sun hours per year — Barbados average (NREL data, 13.1°N). */
const PEAK_SUN_HOURS = 1650

/** PV panel efficiency — monocrystalline, tropical derating applied. */
const PV_EFFICIENCY = 0.18

/** Typical tropical hotel energy intensity (kWh/m²/yr).
 *  ASHRAE 90.1 tropical hospitality benchmark with VRF HVAC. */
const HOTEL_ENERGY_INTENSITY = 180

/** Evening peak duration (hours) for battery sizing.
 *  Covers 6 PM to 10 PM when solar drops and hotel load peaks. */
const EVENING_PEAK_HOURS = 4

/** Fraction of daily load occurring during evening peak. */
const EVENING_PEAK_FRACTION = 0.30

/** PV capacity density — kWp per m² of roof area. */
const PV_DENSITY_KWP_PER_M2 = 0.18

/** Usable roof fraction — after setbacks, equipment, and walkways. */
const USABLE_ROOF_FRACTION = 0.65

// ── Types ──────────────────────────────────────────────────────────────

export interface NetZeroParams {
  totalKeys: number
  gia: number       // gross internal area (m²)
  storeys: number
}

export interface NetZeroResult {
  pvCapacityKwp: number
  annualPvGenerationKwh: number
  annualBuildingDemandKwh: number
  offsetPercentage: number
  batteryCapacityKwh: number
  resilienceHours: number
  readinessScore: number
  recommendations: string[]
}

// ── Calculator ─────────────────────────────────────────────────────────

export function calculateNetZero(params: NetZeroParams): NetZeroResult {
  const { totalKeys, gia, storeys } = params

  if (totalKeys <= 0 || gia <= 0 || storeys <= 0) {
    throw new Error('All parameters must be positive numbers')
  }

  // Roof area = footprint approximation (GIA / storeys), adjusted for usable fraction
  const roofArea = (gia / storeys) * USABLE_ROOF_FRACTION

  // PV capacity based on roof area and panel efficiency
  const pvCapacityKwp = roofArea * PV_EFFICIENCY

  // Annual PV generation
  const annualPvGenerationKwh = pvCapacityKwp * PEAK_SUN_HOURS

  // Annual building demand
  const annualBuildingDemandKwh = gia * HOTEL_ENERGY_INTENSITY

  // Offset percentage
  const offsetPercentage = Math.min(
    (annualPvGenerationKwh / annualBuildingDemandKwh) * 100,
    100,
  )

  // Battery sizing: cover evening peak load for EVENING_PEAK_HOURS
  const dailyDemandKwh = annualBuildingDemandKwh / 365
  const eveningPeakLoadKwh = dailyDemandKwh * EVENING_PEAK_FRACTION
  const batteryCapacityKwh = eveningPeakLoadKwh * (EVENING_PEAK_HOURS / 4)

  // Resilience: hours the battery can sustain the building at average load
  const averageHourlyLoad = dailyDemandKwh / 24
  const resilienceHours = averageHourlyLoad > 0
    ? Math.round((batteryCapacityKwh / averageHourlyLoad) * 10) / 10
    : 0

  // Readiness score (0-100)
  const readinessScore = calculateReadinessScore({
    offsetPercentage,
    batteryCapacityKwh,
    resilienceHours,
    pvCapacityKwp,
    totalKeys,
  })

  // Recommendations
  const recommendations = generateRecommendations({
    offsetPercentage,
    batteryCapacityKwh,
    resilienceHours,
    pvCapacityKwp,
    storeys,
    totalKeys,
  })

  return {
    pvCapacityKwp: round2(pvCapacityKwp),
    annualPvGenerationKwh: round2(annualPvGenerationKwh),
    annualBuildingDemandKwh: round2(annualBuildingDemandKwh),
    offsetPercentage: round2(offsetPercentage),
    batteryCapacityKwh: round2(batteryCapacityKwh),
    resilienceHours,
    readinessScore,
    recommendations,
  }
}

// ── Scoring ────────────────────────────────────────────────────────────

function calculateReadinessScore(ctx: {
  offsetPercentage: number
  batteryCapacityKwh: number
  resilienceHours: number
  pvCapacityKwp: number
  totalKeys: number
}): number {
  let score = 0

  // Solar offset (0-40 points)
  score += Math.min(ctx.offsetPercentage / 100, 1) * 40

  // Battery resilience (0-25 points): target 8+ hours
  score += Math.min(ctx.resilienceHours / 8, 1) * 25

  // PV density per key (0-20 points): target 1 kWp/key
  const pvPerKey = ctx.pvCapacityKwp / ctx.totalKeys
  score += Math.min(pvPerKey / 1.0, 1) * 20

  // Battery capacity per key (0-15 points): target 5 kWh/key
  const batteryPerKey = ctx.batteryCapacityKwh / ctx.totalKeys
  score += Math.min(batteryPerKey / 5.0, 1) * 15

  return Math.round(Math.min(score, 100))
}

// ── Recommendations ────────────────────────────────────────────────────

function generateRecommendations(ctx: {
  offsetPercentage: number
  batteryCapacityKwh: number
  resilienceHours: number
  pvCapacityKwp: number
  storeys: number
  totalKeys: number
}): string[] {
  const recs: string[] = []

  if (ctx.offsetPercentage < 20) {
    recs.push(
      'Solar offset below 20%. Consider carport PV arrays, building-integrated PV (BIPV) facades, or power purchase agreement (PPA) with off-site solar farm.',
    )
  } else if (ctx.offsetPercentage < 50) {
    recs.push(
      `Solar offsets ${round2(ctx.offsetPercentage)}% of demand. Add facade-integrated PV on east/west elevations and explore ground-mounted arrays on unused site area.`,
    )
  } else {
    recs.push(
      `Strong solar position at ${round2(ctx.offsetPercentage)}% offset. Consider net metering agreement with Barbados Light & Power for grid export revenue.`,
    )
  }

  if (ctx.resilienceHours < 4) {
    recs.push(
      'Battery resilience under 4 hours. Size battery system to cover full evening peak (6 PM-10 PM) for guest comfort during grid outages.',
    )
  }

  if (ctx.storeys >= 5) {
    recs.push(
      'Multi-storey building limits roof PV ratio. Evaluate BIPV cladding and solar thermal for domestic hot water to reduce electrical demand.',
    )
  }

  recs.push(
    'Install smart BMS with demand response capability to shift non-critical loads (laundry, water heating, EV charging) to peak solar hours.',
  )

  if (ctx.totalKeys > 100) {
    recs.push(
      'For 100+ key properties, centralised VRF with heat recovery delivers 30-40% HVAC savings versus split systems. Pairs well with battery storage for peak shaving.',
    )
  }

  return recs
}

// ── Utilities ──────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Re-export constants for testing
export const NET_ZERO_CONSTANTS = {
  PEAK_SUN_HOURS,
  PV_EFFICIENCY,
  HOTEL_ENERGY_INTENSITY,
  EVENING_PEAK_HOURS,
  EVENING_PEAK_FRACTION,
  PV_DENSITY_KWP_PER_M2,
  USABLE_ROOF_FRACTION,
} as const
