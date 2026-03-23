import { describe, it, expect } from 'vitest'
import { calculateNetZero, NET_ZERO_CONSTANTS } from '../net-zero-calculator'

describe('calculateNetZero', () => {
  const baseParams = { totalKeys: 130, gia: 8500, storeys: 6 }

  it('returns all required fields', () => {
    const result = calculateNetZero(baseParams)

    expect(result).toHaveProperty('pvCapacityKwp')
    expect(result).toHaveProperty('annualPvGenerationKwh')
    expect(result).toHaveProperty('annualBuildingDemandKwh')
    expect(result).toHaveProperty('offsetPercentage')
    expect(result).toHaveProperty('batteryCapacityKwh')
    expect(result).toHaveProperty('resilienceHours')
    expect(result).toHaveProperty('readinessScore')
    expect(result).toHaveProperty('recommendations')
  })

  it('calculates PV capacity from roof area', () => {
    const result = calculateNetZero(baseParams)
    // Roof area = (8500 / 6) * 0.65 = ~920.83 m²
    // PV capacity = 920.83 * 0.18 = ~165.75 kWp
    const expectedRoofArea = (baseParams.gia / baseParams.storeys) * NET_ZERO_CONSTANTS.USABLE_ROOF_FRACTION
    const expectedPv = expectedRoofArea * NET_ZERO_CONSTANTS.PV_EFFICIENCY
    expect(result.pvCapacityKwp).toBeCloseTo(expectedPv, 1)
  })

  it('calculates annual PV generation using Barbados peak sun hours', () => {
    const result = calculateNetZero(baseParams)
    const expectedGen = result.pvCapacityKwp * NET_ZERO_CONSTANTS.PEAK_SUN_HOURS
    expect(result.annualPvGenerationKwh).toBeCloseTo(expectedGen, 0)
  })

  it('calculates building demand from GIA and energy intensity', () => {
    const result = calculateNetZero(baseParams)
    const expectedDemand = baseParams.gia * NET_ZERO_CONSTANTS.HOTEL_ENERGY_INTENSITY
    expect(result.annualBuildingDemandKwh).toBe(expectedDemand)
  })

  it('offset percentage is generation / demand * 100', () => {
    const result = calculateNetZero(baseParams)
    const expectedOffset = (result.annualPvGenerationKwh / result.annualBuildingDemandKwh) * 100
    expect(result.offsetPercentage).toBeCloseTo(expectedOffset, 1)
  })

  it('offset percentage caps at 100', () => {
    // Small building, lots of roof = high offset
    const result = calculateNetZero({ totalKeys: 10, gia: 500, storeys: 1 })
    expect(result.offsetPercentage).toBeLessThanOrEqual(100)
  })

  it('battery capacity is positive', () => {
    const result = calculateNetZero(baseParams)
    expect(result.batteryCapacityKwh).toBeGreaterThan(0)
  })

  it('resilience hours are positive', () => {
    const result = calculateNetZero(baseParams)
    expect(result.resilienceHours).toBeGreaterThan(0)
  })

  it('readiness score is between 0 and 100', () => {
    const result = calculateNetZero(baseParams)
    expect(result.readinessScore).toBeGreaterThanOrEqual(0)
    expect(result.readinessScore).toBeLessThanOrEqual(100)
  })

  it('provides at least one recommendation', () => {
    const result = calculateNetZero(baseParams)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('taller buildings produce lower offset (less roof per m² GIA)', () => {
    const tall = calculateNetZero({ totalKeys: 130, gia: 8500, storeys: 6 })
    const short = calculateNetZero({ totalKeys: 130, gia: 8500, storeys: 3 })
    expect(short.offsetPercentage).toBeGreaterThan(tall.offsetPercentage)
  })

  it('throws on invalid params (zero keys)', () => {
    expect(() => calculateNetZero({ totalKeys: 0, gia: 8500, storeys: 6 })).toThrow()
  })

  it('throws on invalid params (negative GIA)', () => {
    expect(() => calculateNetZero({ totalKeys: 130, gia: -1, storeys: 6 })).toThrow()
  })

  it('throws on invalid params (zero storeys)', () => {
    expect(() => calculateNetZero({ totalKeys: 130, gia: 8500, storeys: 0 })).toThrow()
  })
})
