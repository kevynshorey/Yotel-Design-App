// ── Design Advisor ──
// Analyses a DesignOption and produces recommendation cards

import type { DesignOption } from '@/engine/types'

export type AdvisorPriority = 'high' | 'medium' | 'low'

export interface AdvisorCard {
  title: string
  body: string
  priority: AdvisorPriority
  confidence: number // 0-1
  sourceTags: string[]
}

export interface NetZeroSummary {
  leedPathAvailable: boolean
  estimatedEui: number // kWh/m²/yr
  renewablePercent: number
}

/**
 * Build recommendation cards for a design option.
 * Each card flags a risk, opportunity, or advisory with a priority and confidence level.
 */
export function buildDesignAdvisorCards(
  option: DesignOption,
  netZeroSummary?: NetZeroSummary,
): AdvisorCard[] {
  const cards: AdvisorCard[] = []

  // 1. High site coverage (>45%)
  if (option.metrics.coverage > 0.45) {
    const pct = Math.round(option.metrics.coverage * 100)
    cards.push({
      title: 'High site coverage',
      body: `Coverage is ${pct}%, exceeding the 45% threshold. This may reduce landscaping, setbacks, and outdoor amenity space. Consider a more compact or taller form.`,
      priority: 'high',
      confidence: 0.95,
      sourceTags: ['planning', 'site-constraints'],
    })
  }

  // 2. Cost per key above $400k
  if (option.metrics.costPerKey > 400_000) {
    const cpk = Math.round(option.metrics.costPerKey / 1000)
    cards.push({
      title: 'Cost per key above target',
      body: `Cost per key is $${cpk}k, above the $400k benchmark. Review facade specification, structural system, and amenity scope for value engineering.`,
      priority: 'high',
      confidence: 0.9,
      sourceTags: ['cost', 'feasibility'],
    })
  }

  // 3. Building height above 20m
  if (option.metrics.buildingHeight > 20) {
    const h = option.metrics.buildingHeight.toFixed(1)
    cards.push({
      title: 'Building exceeds 20m height',
      body: `Height is ${h}m. Barbados planning policy generally favours low-rise coastal development. Check Town & Country Planning requirements for height restrictions in this zone.`,
      priority: 'medium',
      confidence: 0.85,
      sourceTags: ['planning', 'regulatory'],
    })
  }

  // 4. Low design score (<70)
  if (option.score < 70) {
    cards.push({
      title: 'Design score below 70',
      body: `Score is ${option.score.toFixed(1)}. Review the scoring breakdown — common drag factors are low sea-view exposure, poor GIA efficiency, or limited outdoor amenity.`,
      priority: 'medium',
      confidence: 0.8,
      sourceTags: ['design-quality'],
    })
  }

  // 5. No LEED path (if net zero summary provided)
  if (netZeroSummary && !netZeroSummary.leedPathAvailable) {
    cards.push({
      title: 'No LEED certification path',
      body: `Current design does not meet minimum LEED prerequisites. Consider adding solar PV, improving envelope performance, or increasing water efficiency to unlock certification.`,
      priority: 'medium',
      confidence: 0.75,
      sourceTags: ['sustainability', 'certification'],
    })
  }

  // 6. Low room count relative to site potential
  if (option.metrics.totalKeys < 130) {
    cards.push({
      title: 'Room count below 130-key target',
      body: `${option.metrics.totalKeys} keys is below the YOTEL operational minimum for a standalone resort. Consider adjusting floor count, wing width, or corridor type to increase yield.`,
      priority: 'medium',
      confidence: 0.85,
      sourceTags: ['operations', 'feasibility'],
    })
  }

  // 7. Excellent sea-view exposure
  if (option.metrics.westFacade > 60) {
    cards.push({
      title: 'Strong sea-view exposure',
      body: `West facade is ${option.metrics.westFacade.toFixed(0)}m — good for premium room pricing. Consider allocating YOTELPad units to upper west-facing bays to maximise revenue.`,
      priority: 'low',
      confidence: 0.9,
      sourceTags: ['revenue', 'design-quality'],
    })
  }

  // 8. High renewable potential (if summary provided)
  if (netZeroSummary && netZeroSummary.renewablePercent >= 30) {
    cards.push({
      title: 'Strong renewable energy potential',
      body: `Renewables can cover ${netZeroSummary.renewablePercent}% of demand. This strengthens the ESG narrative and may qualify for Barbados solar incentives.`,
      priority: 'low',
      confidence: 0.7,
      sourceTags: ['sustainability', 'incentives'],
    })
  }

  return cards
}
