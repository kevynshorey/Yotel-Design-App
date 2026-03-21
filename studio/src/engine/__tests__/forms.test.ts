import { describe, it, expect } from 'vitest'
import { generateForm } from '../forms'

describe('generateForm', () => {
  it('generates BAR form with single wing E-W', () => {
    const result = generateForm('BAR', 770, 14)
    expect(result.form).toBe('BAR')
    expect(result.wings).toHaveLength(1)
    expect(result.wings[0].direction).toBe('EW')
    expect(result.footprint).toBeCloseTo(770, -1)
    expect(result.westFacade).toBeCloseTo(14, 0)
  })

  it('generates BAR_NS form with single wing N-S', () => {
    const result = generateForm('BAR_NS', 770, 14)
    expect(result.wings[0].direction).toBe('NS')
    expect(result.westFacade).toBeGreaterThan(result.wings[0].width)
  })

  it('generates L form with 2 wings', () => {
    const result = generateForm('L', 900, 14)
    expect(result.wings).toHaveLength(2)
  })

  it('generates U form with 3 wings', () => {
    const result = generateForm('U', 1200, 14)
    expect(result.wings).toHaveLength(3)
    expect(result.courtyard).toBeGreaterThan(0)
  })

  it('generates C form with 3 wings', () => {
    const result = generateForm('C', 1200, 14)
    expect(result.wings).toHaveLength(3)
    expect(result.courtyard).toBeGreaterThan(0)
  })

  it('deducts corner overlap for L-form footprint', () => {
    const result = generateForm('L', 900, 14)
    const rawArea = result.wings.reduce((sum, w) => sum + w.length * w.width, 0)
    expect(result.footprint).toBeLessThan(rawArea)
    expect(result.footprint).toBeCloseTo(900, -1)
  })

  it('clamps wing length to site dimensions', () => {
    const result = generateForm('BAR', 5000, 14)
    expect(result.wings[0].length).toBeLessThanOrEqual(79.84)
  })
})
