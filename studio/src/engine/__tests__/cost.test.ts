import { describe, it, expect } from 'vitest'
import { estimateCost } from '../cost'
import type { OptionMetrics } from '../types'

describe('estimateCost', () => {
  const baseMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 14, outdoorTotal: 660,
    costPerKey: 0, tdc: 0,
    corridorType: 'double_loaded', form: 'BAR',
    amenityScore: 0,
  }

  it('estimates total cost near $45-55M for 130-key BAR with full Barbados model', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.total).toBeGreaterThan(40_000_000)
    expect(cost.total).toBeLessThan(55_000_000)
  })

  it('includes land at $3.5M', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.breakdown.land).toBe(3_500_000)
  })

  it('applies form multiplier for L-shape', () => {
    const barCost = estimateCost(baseMetrics)
    const lCost = estimateCost({ ...baseMetrics, form: 'L' })
    expect(lCost.breakdown.construction).toBeGreaterThan(barCost.breakdown.construction)
  })

  it('calculates per-key cost', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.perKey).toBeCloseTo(cost.total / 130, -3)
  })

  it('includes MEP systems costs', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.breakdown.mep).toBeGreaterThan(1_500_000)
    expect(cost.breakdown.mep).toBeLessThan(3_000_000)
  })

  it('includes renewable energy costs', () => {
    const cost = estimateCost(baseMetrics)
    // PV (75kW * $2200) + solar water ($28k) + battery ($65k) = $258k
    expect(cost.breakdown.renewable).toBe(258000)
  })

  it('includes foundation engineering costs', () => {
    const cost = estimateCost(baseMetrics)
    // Piles + tie beams + geotech survey, with seismic multiplier
    expect(cost.breakdown.foundation).toBeGreaterThan(200_000)
    expect(cost.breakdown.foundation).toBeLessThan(500_000)
  })

  it('includes hurricane resilience uplift', () => {
    const cost = estimateCost(baseMetrics)
    // 15% hurricane + 8% seismic on base construction (~$15.7M) = ~$3.6M
    expect(cost.breakdown.hurricaneUplift).toBeGreaterThan(3_000_000)
    expect(cost.breakdown.hurricaneUplift).toBeLessThan(4_000_000)
  })

  it('includes island cost factors (import duty + shipping)', () => {
    const cost = estimateCost(baseMetrics)
    // 22% of material-heavy hard costs
    expect(cost.breakdown.islandFactors).toBeGreaterThan(3_000_000)
    expect(cost.breakdown.islandFactors).toBeLessThan(7_000_000)
  })

  it('includes EIA and permits at $130k', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.breakdown.eiaAndPermits).toBe(130_000)
  })

  it('uses itemized professional fees at 13.8%', () => {
    const cost = estimateCost(baseMetrics)
    // Soft costs should be ~13.8% of hard subtotal (not 12% as before)
    const hardSubtotal = cost.total - cost.breakdown.land - cost.breakdown.softCosts - cost.breakdown.contingency
    const impliedPct = cost.breakdown.softCosts / hardSubtotal
    expect(impliedPct).toBeCloseTo(0.138, 2)
  })

  it('breakdown sums to total', () => {
    const cost = estimateCost(baseMetrics)
    const breakdownSum = Object.values(cost.breakdown).reduce((a, b) => a + b, 0)
    // Allow for rounding
    expect(Math.abs(breakdownSum - cost.total)).toBeLessThan(cost.total * 0.01)
  })
})
