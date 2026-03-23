import { describe, it, expect } from 'vitest'
import { estimateEmbodiedCarbon, MATERIAL_LIBRARY } from '../material-carbon'

describe('estimateEmbodiedCarbon', () => {
  const gia = 8500
  const storeys = 6

  it('returns baseline and optimised breakdowns', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)

    expect(result).toHaveProperty('baseline')
    expect(result).toHaveProperty('optimised')
    expect(result).toHaveProperty('savingsKgCO2')
    expect(result).toHaveProperty('savingsPercentage')
    expect(result).toHaveProperty('recommendations')
  })

  it('baseline total is sum of concrete + steel + glass', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    const expectedTotal =
      result.baseline.concrete.kgCO2 +
      result.baseline.steel.kgCO2 +
      result.baseline.glass.kgCO2

    expect(result.baseline.totalKgCO2).toBeCloseTo(expectedTotal, 0)
  })

  it('optimised carbon is lower than baseline', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    expect(result.optimised.totalKgCO2).toBeLessThan(result.baseline.totalKgCO2)
  })

  it('savings percentage is positive', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    expect(result.savingsPercentage).toBeGreaterThan(0)
    expect(result.savingsPercentage).toBeLessThan(100)
  })

  it('savings kgCO2 matches baseline minus optimised', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    const expectedSavings = result.baseline.totalKgCO2 - result.optimised.totalKgCO2
    expect(result.savingsKgCO2).toBeCloseTo(expectedSavings, 0)
  })

  it('per-m² intensity is calculated correctly', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    expect(result.baseline.kgCO2PerM2).toBeCloseTo(result.baseline.totalKgCO2 / gia, 1)
    expect(result.optimised.kgCO2PerM2).toBeCloseTo(result.optimised.totalKgCO2 / gia, 1)
  })

  it('taller buildings have higher per-m² carbon (structural uplift)', () => {
    const low = estimateEmbodiedCarbon(8500, 3)
    const high = estimateEmbodiedCarbon(8500, 6)
    expect(high.baseline.kgCO2PerM2).toBeGreaterThan(low.baseline.kgCO2PerM2)
  })

  it('optimised includes coral stone and timber components', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    expect(result.optimised.coralStone.volume).toBeGreaterThan(0)
    expect(result.optimised.timber.volume).toBeGreaterThan(0)
    // Timber should have negative kgCO2 (carbon sink)
    expect(result.optimised.timber.kgCO2).toBeLessThan(0)
  })

  it('provides at least one recommendation', () => {
    const result = estimateEmbodiedCarbon(gia, storeys)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('throws on invalid GIA', () => {
    expect(() => estimateEmbodiedCarbon(0, 6)).toThrow()
    expect(() => estimateEmbodiedCarbon(-100, 6)).toThrow()
  })

  it('throws on invalid storeys', () => {
    expect(() => estimateEmbodiedCarbon(8500, 0)).toThrow()
    expect(() => estimateEmbodiedCarbon(8500, -1)).toThrow()
  })
})

describe('MATERIAL_LIBRARY', () => {
  it('concrete has expected emission factor', () => {
    expect(MATERIAL_LIBRARY.concrete.kgCO2PerUnit).toBe(350)
  })

  it('steel has expected emission factor', () => {
    expect(MATERIAL_LIBRARY.steel.kgCO2PerUnit).toBe(1500)
  })

  it('timber has negative carbon factor (biogenic credit)', () => {
    expect(MATERIAL_LIBRARY.timber.kgCO2PerUnit).toBe(-500)
  })

  it('glass has expected emission factor', () => {
    expect(MATERIAL_LIBRARY.glass.kgCO2PerUnit).toBe(1200)
  })

  it('coral stone has expected emission factor', () => {
    expect(MATERIAL_LIBRARY.coral_stone.kgCO2PerUnit).toBe(180)
  })
})
