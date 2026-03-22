import { describe, it, expect } from 'vitest'
import { buildOption } from '@/engine/generator'
import { CURATED_OPTIONS } from '@/config/curated-options'

describe('Curated designs: zero violations, zero warnings', () => {
  for (const cfg of CURATED_OPTIONS) {
    it(`${cfg.id} (${cfg.name}) passes all validation with no warnings`, () => {
      const opt = buildOption(cfg.params)
      const v = opt.validation
      const m = opt.metrics

      // Must be valid (no fatal violations)
      expect(v.isValid).toBe(true)

      // Must have zero violations of any severity
      expect(v.violations).toEqual([])

      // Must have zero warnings
      expect(v.warnings).toEqual([])

      // Must meet 130-key minimum
      expect(m.totalKeys).toBeGreaterThanOrEqual(130)

      // Must not exceed height limit
      expect(m.buildingHeight).toBeLessThanOrEqual(22)

      // Must not exceed coverage limit
      expect(m.coverage).toBeLessThanOrEqual(0.5)

      // Must not exceed max footprint
      expect(m.footprint).toBeLessThanOrEqual(1800)
    })
  }
})
