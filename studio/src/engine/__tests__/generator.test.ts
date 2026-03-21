import { describe, it, expect } from 'vitest'
import { buildOption, generateAll, groupOptions } from '../generator'
import type { GenerationParams } from '../types'

describe('buildOption', () => {
  it('builds a complete option from params', () => {
    const params: GenerationParams = {
      form: 'BAR', targetFloorArea: 770, wingWidth: 14,
      storeys: 6, corridorType: 'double_loaded',
      ytRooms: 100, padUnits: 30, outdoorPosition: 'WEST',
    }
    const option = buildOption(params)
    expect(option.id).toBeTruthy()
    expect(option.form).toBe('BAR')
    expect(option.metrics.totalKeys).toBeGreaterThan(50)
    expect(option.score).toBeGreaterThan(0)
    expect(option.floors.length).toBeGreaterThan(0)
    expect(option.cost.total).toBeGreaterThan(0)
  })
})

describe('generateAll', () => {
  it('generates multiple options across design space', () => {
    const options = generateAll(20)
    expect(options.length).toBeGreaterThan(5)
    expect(options.length).toBeLessThanOrEqual(20)
    // Should be sorted by score descending
    for (let i = 1; i < options.length; i++) {
      expect(options[i - 1].score).toBeGreaterThanOrEqual(options[i].score)
    }
  })
})

describe('groupOptions', () => {
  it('groups options into categories', () => {
    const options = generateAll(20)
    const groups = groupOptions(options)
    expect(groups.best_overall).toBeDefined()
    expect(groups.best_overall.length).toBeGreaterThan(0)
  })
})
