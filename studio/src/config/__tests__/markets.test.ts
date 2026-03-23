import { describe, it, expect } from 'vitest'
import { MARKETS, getMarket, getDefaultMarket, getMarketCostMultiplier } from '../markets'

describe('MARKETS', () => {
  it('contains 6 markets', () => {
    expect(MARKETS).toHaveLength(6)
  })

  it('each market has all required fields', () => {
    const requiredFields = [
      'id', 'name', 'region', 'currency', 'currencySymbol',
      'taxRate', 'dutyRate', 'labourRate', 'materialMultiplier',
      'planningAuthority', 'buildingCode', 'maxHeight', 'maxCoverage',
      'seismicZone', 'hurricaneCategory', 'climateZoneAshrae', 'peakSunHours',
    ]

    for (const market of MARKETS) {
      for (const field of requiredFields) {
        expect(market).toHaveProperty(field)
      }
    }
  })

  it('all market IDs are unique', () => {
    const ids = MARKETS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes Barbados, Jamaica, Trinidad, Bahamas, Cayman, UK', () => {
    const ids = MARKETS.map((m) => m.id)
    expect(ids).toContain('BB')
    expect(ids).toContain('JM')
    expect(ids).toContain('TT')
    expect(ids).toContain('BS')
    expect(ids).toContain('KY')
    expect(ids).toContain('GB')
  })

  it('tax rates are between 0 and 1', () => {
    for (const market of MARKETS) {
      expect(market.taxRate).toBeGreaterThanOrEqual(0)
      expect(market.taxRate).toBeLessThanOrEqual(1)
    }
  })

  it('duty rates are between 0 and 1', () => {
    for (const market of MARKETS) {
      expect(market.dutyRate).toBeGreaterThanOrEqual(0)
      expect(market.dutyRate).toBeLessThanOrEqual(1)
    }
  })

  it('hurricane categories are 0-5', () => {
    for (const market of MARKETS) {
      expect(market.hurricaneCategory).toBeGreaterThanOrEqual(0)
      expect(market.hurricaneCategory).toBeLessThanOrEqual(5)
    }
  })

  it('labour rates are positive', () => {
    for (const market of MARKETS) {
      expect(market.labourRate).toBeGreaterThan(0)
    }
  })
})

describe('getMarket', () => {
  it('finds Barbados by ID', () => {
    const bb = getMarket('BB')
    expect(bb).toBeDefined()
    expect(bb!.name).toBe('Barbados')
  })

  it('is case-insensitive', () => {
    const bb = getMarket('bb')
    expect(bb).toBeDefined()
    expect(bb!.id).toBe('BB')
  })

  it('returns undefined for unknown ID', () => {
    expect(getMarket('XX')).toBeUndefined()
  })

  it('finds UK market', () => {
    const gb = getMarket('GB')
    expect(gb).toBeDefined()
    expect(gb!.region).toBe('Europe')
  })
})

describe('getDefaultMarket', () => {
  it('returns Barbados', () => {
    const market = getDefaultMarket()
    expect(market.id).toBe('BB')
    expect(market.name).toBe('Barbados')
  })
})

describe('getMarketCostMultiplier', () => {
  it('returns a positive number', () => {
    for (const market of MARKETS) {
      const multiplier = getMarketCostMultiplier(market)
      expect(multiplier).toBeGreaterThan(0)
    }
  })

  it('UK has lower multiplier than Cayman (closer to mainland)', () => {
    const uk = getMarket('GB')!
    const ky = getMarket('KY')!
    expect(getMarketCostMultiplier(uk)).toBeLessThan(getMarketCostMultiplier(ky))
  })

  it('Trinidad has lower multiplier than Bahamas (local production)', () => {
    const tt = getMarket('TT')!
    const bs = getMarket('BS')!
    expect(getMarketCostMultiplier(tt)).toBeLessThan(getMarketCostMultiplier(bs))
  })
})
