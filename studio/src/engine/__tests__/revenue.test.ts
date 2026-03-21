import { describe, it, expect } from 'vitest'
import { projectRevenue } from '../revenue'

describe('projectRevenue', () => {
  it('projects 5 years of revenue for 100 YOTEL + 30 PAD', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.years).toHaveLength(5)
  })

  it('revenue ramps up year over year', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.years[2].totalRevenue).toBeGreaterThan(result.years[0].totalRevenue)
  })

  it('achieves ~51% GOP margin at stabilisation', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.gopMargin).toBeGreaterThan(0.45)
    expect(result.gopMargin).toBeLessThan(0.55)
  })

  it('calculates stabilised NOI > $3M', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.stabilisedNoi).toBeGreaterThan(3_000_000)
  })
})
