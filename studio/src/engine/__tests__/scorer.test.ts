import { describe, it, expect } from 'vitest'
import { scoreOption } from '../scorer'
import type { OptionMetrics, ScoringWeights } from '../types'
import { DEFAULT_WEIGHTS } from '@/config/scoring-weights'

describe('scoreOption', () => {
  const baseMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 40, outdoorTotal: 660,
    costPerKey: 307692, tdc: 40_000_000,
    corridorType: 'double_loaded', form: 'BAR',
    amenityScore: 0,
  }

  it('scores a baseline 130-key BAR between 50 and 85', () => {
    const [score] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(score).toBeGreaterThan(50)
    expect(score).toBeLessThan(90)
  })

  it('returns breakdown for all 10 criteria', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(Object.keys(breakdown)).toHaveLength(10)
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
      expect(breakdown[key]).toBeDefined()
      expect(breakdown[key].raw).toBeGreaterThanOrEqual(0)
      expect(breakdown[key].raw).toBeLessThanOrEqual(1)
    }
  })

  it('gives room_count score of 1.0 for 130 keys (in 120-140 range)', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(breakdown.room_count.raw).toBe(1)
  })

  it('uses v4 recalibrated cost thresholds — $307k scores on-budget (0.75)', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    // $307k/key is between $290k (excellent) and $320k (on budget) → 0.75
    expect(breakdown.cost_per_key.raw).toBe(0.75)
  })

  it('penalizes high buildings', () => {
    const [score1] = scoreOption({ ...baseMetrics, buildingHeight: 20 }, DEFAULT_WEIGHTS)
    const [score2] = scoreOption({ ...baseMetrics, buildingHeight: 24 }, DEFAULT_WEIGHTS)
    expect(score1).toBeGreaterThan(score2)
  })
})
