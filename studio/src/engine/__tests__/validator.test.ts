import { describe, it, expect } from 'vitest'
import { validate, pointInPolygon } from '../validator'
import type { OptionMetrics, Wing } from '../types'
import { OFFSET_BOUNDARY } from '@/config/site'

describe('pointInPolygon', () => {
  it('returns true for point inside offset boundary', () => {
    expect(pointInPolygon(75, 30, OFFSET_BOUNDARY)).toBe(true)
  })

  it('returns false for point outside offset boundary', () => {
    expect(pointInPolygon(0, 0, OFFSET_BOUNDARY)).toBe(false)
  })
})

describe('validate', () => {
  const validMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 14, outdoorTotal: 660,
    costPerKey: 307692, tdc: 40_000_000,
    corridorType: 'double_loaded', form: 'BAR',
    amenityScore: 0,
  }

  it('passes a valid option', () => {
    const result = validate(validMetrics, [])
    expect(result.isValid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('fails when coverage exceeds 50%', () => {
    const result = validate({ ...validMetrics, coverage: 0.55 }, [])
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.rule.includes('coverage'))).toBe(true)
  })

  it('fails when height exceeds 25m', () => {
    const result = validate({ ...validMetrics, buildingHeight: 26 }, [])
    expect(result.isValid).toBe(false)
  })

  it('fails when building extends outside offset boundary', () => {
    const wings = [{ id: 'test', label: 'Main', x: -50, y: -50, length: 55, width: 14, direction: 'EW' as const, floors: 6 }]
    const result = validate(validMetrics, wings)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.rule.includes('offset boundary'))).toBe(true)
  })

  it('passes when building is within offset boundary', () => {
    const wings = [{ id: 'test', label: 'Main', x: 0, y: 0, length: 55, width: 14, direction: 'EW' as const, floors: 6 }]
    const result = validate(validMetrics, wings)
    expect(result.violations.some(v => v.rule.includes('offset boundary'))).toBe(false)
  })
})
