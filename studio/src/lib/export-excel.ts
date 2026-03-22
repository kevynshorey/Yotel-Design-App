import type { DesignOption } from '@/engine/types'

/** Generate a multi-section TSV export (tab-separated, Excel-compatible).
 *  Creates a single .tsv file with sections separated by headers.
 *  Uses BOM prefix so Excel auto-detects UTF-8. */
export function exportToExcel(option: DesignOption): void {
  const lines: string[] = []

  // Section 1: Project Summary
  lines.push('YOTEL BARBADOS — DEVELOPMENT FEASIBILITY MODEL')
  lines.push(`Generated\t${new Date().toISOString().slice(0, 10)}`)
  lines.push(`Option ID\t${option.id}`)
  lines.push(`Form Type\t${option.form}`)
  lines.push(`Score\t${option.score.toFixed(1)}`)
  lines.push('')

  // Section 2: Key Metrics
  lines.push('KEY METRICS')
  lines.push(`Total Keys\t${option.metrics.totalKeys}`)
  lines.push(`YOTEL Rooms\t${option.metrics.yotelKeys}`)
  lines.push(`YOTELPAD Units\t${option.metrics.padUnits}`)
  lines.push(`GIA (m²)\t${option.metrics.gia}`)
  lines.push(`GIA per Key (m²)\t${option.metrics.giaPerKey.toFixed(1)}`)
  lines.push(`Footprint (m²)\t${option.metrics.footprint}`)
  lines.push(`Coverage\t${(option.metrics.coverage * 100).toFixed(1)}%`)
  lines.push(`Building Height (m)\t${option.metrics.buildingHeight}`)
  lines.push(`West Facade (m)\t${option.metrics.westFacade}`)
  lines.push('')

  // Section 3: Cost Breakdown
  lines.push('COST BREAKDOWN')
  lines.push('Category\tAmount (USD)\t% of TDC')
  const bd = option.cost.breakdown
  const total = option.cost.total
  const costItems: [string, number][] = [
    ['Construction', bd.construction],
    ['Facade / Cladding', bd.facade],
    ['FF&E', bd.ffe],
    ['Technology', bd.technology],
    ['MEP Systems', bd.mep],
    ['Renewable Energy', bd.renewable],
    ['Foundation Engineering', bd.foundation],
    ['Outdoor / Amenity', bd.outdoor],
    ['Site Works', bd.siteWorks],
    ['Land', bd.land],
    ['Soft Costs (Professional Fees)', bd.softCosts],
    ['Contingency', bd.contingency],
    ['Hurricane & Seismic Uplift', bd.hurricaneUplift],
    ['Island Factors (Import/Freight)', bd.islandFactors],
    ['EIA & Permits', bd.eiaAndPermits],
  ]
  for (const [label, amount] of costItems) {
    lines.push(`${label}\t${amount}\t${((amount / total) * 100).toFixed(1)}%`)
  }
  lines.push(`TOTAL DEVELOPMENT COST\t${total}\t100.0%`)
  lines.push(`Cost per Key\t${option.cost.perKey}`)
  lines.push('')

  // Section 4: Revenue Projection (5-Year)
  lines.push('REVENUE PROJECTION (5-YEAR)')
  lines.push(
    'Metric\t' + option.revenue.years.map((_, i) => `Year ${i + 1}`).join('\t'),
  )
  lines.push(
    'Revenue\t' + option.revenue.years.map((y) => y.totalRevenue).join('\t'),
  )
  lines.push('GOP\t' + option.revenue.years.map((y) => y.gop).join('\t'))
  lines.push('NOI\t' + option.revenue.years.map((y) => y.noi).join('\t'))
  lines.push('')
  lines.push(`Stabilised NOI (Year 3)\t${option.revenue.stabilisedNoi}`)
  lines.push(`Stabilised NOI per Key\t${option.revenue.stabilisedNoiPerKey}`)
  lines.push(`GOP Margin\t${(option.revenue.gopMargin * 100).toFixed(1)}%`)
  lines.push(`RevPAR\t${option.revenue.revPar}`)
  lines.push('')

  // Section 5: Scoring Breakdown
  lines.push('SCORING BREAKDOWN')
  lines.push('Criterion\tRaw Score\tWeighted')
  for (const [key, entry] of Object.entries(option.scoringBreakdown)) {
    lines.push(
      `${key.replace(/_/g, ' ')}\t${(entry.raw * 100).toFixed(0)}\t${(entry.weighted * 100).toFixed(1)}`,
    )
  }
  lines.push(`TOTAL SCORE\t${option.score.toFixed(1)}`)
  lines.push('')

  // Section 6: Amenities
  if (option.amenities) {
    lines.push('AMENITY PROGRAMME')
    lines.push(`Pool Water Area (m²)\t${option.amenities.pool.waterArea}`)
    lines.push(`Pool Deck Area (m²)\t${option.amenities.pool.deckArea}`)
    lines.push(
      `Infinity Edge\t${option.amenities.pool.hasInfinityEdge ? 'Yes' : 'No'}`,
    )
    lines.push(
      `Swim-up Bar\t${option.amenities.pool.hasSwimUpBar ? 'Yes' : 'No'}`,
    )
    lines.push(
      `Rooftop Deck (m²)\t${option.amenities.rooftopDeck.totalArea}`,
    )
    lines.push(`Rooftop Bar (m²)\t${option.amenities.rooftopDeck.barArea}`)
    lines.push(`Lounger Capacity\t${option.amenities.loungerCapacity}`)
    lines.push(
      `Restaurant Indoor (m²)\t${option.amenities.restaurant.indoorArea}`,
    )
    lines.push(
      `Restaurant Outdoor (m²)\t${option.amenities.restaurant.outdoorArea}`,
    )
    lines.push(
      `Restaurant Seats\t${option.amenities.restaurant.totalSeats}`,
    )
    lines.push(
      `Total Amenity Area (m²)\t${option.amenities.totalAmenityArea}`,
    )
  }

  // Section 7: Validation
  lines.push('')
  lines.push('PLANNING COMPLIANCE')
  lines.push(
    `Status\t${option.validation.isValid ? 'COMPLIANT' : 'VIOLATIONS'}`,
  )
  for (const v of option.validation.violations) {
    lines.push(`VIOLATION: ${v.rule}\t${v.actual}\tLimit: ${v.limit}`)
  }
  for (const w of option.validation.warnings) {
    lines.push(`WARNING: ${w}`)
  }

  // Download as .tsv
  const content = lines.join('\n')
  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/tab-separated-values;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `YOTEL_Barbados_${option.id}_${new Date().toISOString().slice(0, 10)}.tsv`
  a.click()
  URL.revokeObjectURL(url)
}
