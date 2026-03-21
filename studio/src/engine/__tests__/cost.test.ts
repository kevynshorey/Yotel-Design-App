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
  }

  it('estimates total cost near $40M for 130-key BAR', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.total).toBeGreaterThan(30_000_000)
    expect(cost.total).toBeLessThan(50_000_000)
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
})
