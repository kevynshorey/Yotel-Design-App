import { describe, it, expect } from 'vitest'
import { buildDesignAdvisorCards } from '../design-advisor'
import type { DesignOption } from '@/engine/types'

// Minimal mock that satisfies the fields the advisor reads
function mockOption(overrides: Partial<DesignOption['metrics']> & { score?: number }): DesignOption {
  const { score = 80, ...metricOverrides } = overrides
  return {
    id: 'test-1',
    form: 'BAR',
    params: {
      form: 'BAR',
      targetFloorArea: 1050,
      wingWidth: 16.1,
      storeys: 5,
      corridorType: 'double_loaded',
      ytRooms: 105,
      padUnits: 35,
      outdoorPosition: 'WEST',
    },
    wings: [],
    floors: [],
    metrics: {
      totalKeys: 140,
      yotelKeys: 105,
      padUnits: 35,
      gia: 8000,
      giaPerKey: 57,
      footprint: 2100,
      coverage: 0.35,
      buildingHeight: 18,
      westFacade: 50,
      outdoorTotal: 400,
      costPerKey: 350_000,
      tdc: 49_000_000,
      corridorType: 'double_loaded',
      form: 'BAR',
      amenityScore: 75,
      ...metricOverrides,
    },
    cost: {
      total: 49_000_000,
      perKey: 350_000,
      breakdown: {
        construction: 20_000_000,
        facade: 5_000_000,
        ffe: 4_000_000,
        technology: 2_000_000,
        mep: 6_000_000,
        renewable: 1_000_000,
        foundation: 3_000_000,
        outdoor: 1_500_000,
        siteWorks: 1_000_000,
        land: 2_500_000,
        softCosts: 1_500_000,
        contingency: 1_000_000,
        hurricaneUplift: 500_000,
        islandFactors: 0,
        eiaAndPermits: 0,
      },
    },
    revenue: {
      years: [],
      stabilisedNoi: 5_000_000,
      stabilisedNoiPerKey: 35_714,
      gopMargin: 0.45,
      revPar: 200,
    },
    score,
    scoringBreakdown: {},
    validation: { isValid: true, violations: [], warnings: [] },
  }
}

describe('buildDesignAdvisorCards', () => {
  it('returns no cards for a well-optimised option', () => {
    const cards = buildDesignAdvisorCards(mockOption({}))
    // The base mock has coverage 0.35, cost $350k, height 18m, score 80, 140 keys
    // westFacade 50 — no "strong sea view" card (threshold is 60)
    expect(cards.length).toBe(0)
  })

  it('flags high site coverage', () => {
    const cards = buildDesignAdvisorCards(mockOption({ coverage: 0.50 }))
    const coverageCard = cards.find((c) => c.title === 'High site coverage')
    expect(coverageCard).toBeTruthy()
    expect(coverageCard!.priority).toBe('high')
  })

  it('flags high cost per key', () => {
    const cards = buildDesignAdvisorCards(mockOption({ costPerKey: 450_000 }))
    const costCard = cards.find((c) => c.title === 'Cost per key above target')
    expect(costCard).toBeTruthy()
    expect(costCard!.priority).toBe('high')
  })

  it('flags building height above 20m', () => {
    const cards = buildDesignAdvisorCards(mockOption({ buildingHeight: 22 }))
    const heightCard = cards.find((c) => c.title === 'Building exceeds 20m height')
    expect(heightCard).toBeTruthy()
    expect(heightCard!.priority).toBe('medium')
  })

  it('flags low design score', () => {
    const cards = buildDesignAdvisorCards(mockOption({ score: 55 }))
    const scoreCard = cards.find((c) => c.title === 'Design score below 70')
    expect(scoreCard).toBeTruthy()
  })

  it('flags no LEED path when netZeroSummary provided', () => {
    const cards = buildDesignAdvisorCards(mockOption({}), {
      leedPathAvailable: false,
      estimatedEui: 150,
      renewablePercent: 10,
    })
    const leedCard = cards.find((c) => c.title === 'No LEED certification path')
    expect(leedCard).toBeTruthy()
    expect(leedCard!.priority).toBe('medium')
  })

  it('flags low room count', () => {
    const cards = buildDesignAdvisorCards(mockOption({ totalKeys: 110 }))
    const roomCard = cards.find((c) => c.title === 'Room count below 130-key target')
    expect(roomCard).toBeTruthy()
  })

  it('positive card for strong sea views', () => {
    const cards = buildDesignAdvisorCards(mockOption({ westFacade: 70 }))
    const viewCard = cards.find((c) => c.title === 'Strong sea-view exposure')
    expect(viewCard).toBeTruthy()
    expect(viewCard!.priority).toBe('low')
  })

  it('positive card for strong renewables', () => {
    const cards = buildDesignAdvisorCards(mockOption({}), {
      leedPathAvailable: true,
      estimatedEui: 100,
      renewablePercent: 35,
    })
    const solarCard = cards.find((c) => c.title === 'Strong renewable energy potential')
    expect(solarCard).toBeTruthy()
  })

  it('all cards have required fields', () => {
    const cards = buildDesignAdvisorCards(
      mockOption({ coverage: 0.50, costPerKey: 450_000, buildingHeight: 25, score: 50, totalKeys: 100 }),
    )
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.title).toBeTruthy()
      expect(card.body).toBeTruthy()
      expect(['high', 'medium', 'low']).toContain(card.priority)
      expect(card.confidence).toBeGreaterThan(0)
      expect(card.confidence).toBeLessThanOrEqual(1)
      expect(card.sourceTags.length).toBeGreaterThan(0)
    }
  })
})
