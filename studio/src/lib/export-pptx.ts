import PptxGenJS from 'pptxgenjs'
import type { DesignOption } from '@/engine/types'

// Theme constants
const NAVY = '0f172a'
const SKY = '0ea5e9'
const WHITE = 'ffffff'
const SLATE_300 = '94a3b8'
const SLATE_700 = '334155'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtUSD(n: number): string {
  return '$' + fmt(n)
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

function addAccentBar(slide: PptxGenJS.Slide) {
  slide.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.06,
    fill: { color: SKY },
  })
}

function addFooter(slide: PptxGenJS.Slide, pageNum: number) {
  slide.addText(`YOTEL Barbados  |  Carlisle Bay  |  Confidential`, {
    x: 0.5,
    y: 5.2,
    w: 7,
    h: 0.3,
    fontSize: 7,
    color: SLATE_700,
    fontFace: 'Arial',
  })
  slide.addText(`${pageNum}`, {
    x: 9,
    y: 5.2,
    w: 0.5,
    h: 0.3,
    fontSize: 7,
    color: SLATE_700,
    fontFace: 'Arial',
    align: 'right',
  })
}

function slideTitle(slide: PptxGenJS.Slide, title: string, pageNum: number) {
  addAccentBar(slide)
  slide.addText(title, {
    x: 0.5,
    y: 0.25,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: WHITE,
    fontFace: 'Arial',
  })
  addFooter(slide, pageNum)
}

export async function exportToPPTX(option: DesignOption): Promise<void> {
  const pptx = new PptxGenJS()
  pptx.author = 'Coruscant Developments Ltd'
  pptx.company = 'Coruscant Developments'
  pptx.subject = 'YOTEL Barbados Investment Deck'
  pptx.title = `YOTEL Barbados - ${option.form} Form - ${option.metrics.totalKeys} Keys`
  pptx.layout = 'LAYOUT_WIDE'

  const bgOpts = { fill: NAVY }

  // ── Slide 1: Cover ──
  const s1 = pptx.addSlide()
  s1.background = bgOpts
  s1.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: SKY },
  })
  s1.addText('YOTEL BARBADOS', {
    x: 1,
    y: 1.5,
    w: 8,
    h: 1,
    fontSize: 42,
    bold: true,
    color: WHITE,
    fontFace: 'Arial',
    align: 'center',
  })
  s1.addText('Carlisle Bay, Bridgetown', {
    x: 1,
    y: 2.5,
    w: 8,
    h: 0.6,
    fontSize: 20,
    color: SKY,
    fontFace: 'Arial',
    align: 'center',
  })
  s1.addText('Investor Presentation', {
    x: 1,
    y: 3.3,
    w: 8,
    h: 0.5,
    fontSize: 14,
    color: SLATE_300,
    fontFace: 'Arial',
    align: 'center',
  })
  s1.addText(`${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}  |  Confidential`, {
    x: 1,
    y: 4.5,
    w: 8,
    h: 0.4,
    fontSize: 10,
    color: SLATE_700,
    fontFace: 'Arial',
    align: 'center',
  })
  s1.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0,
    y: 5.45,
    w: '100%',
    h: 0.05,
    fill: { color: SKY },
  })

  // ── Slide 2: Executive Summary ──
  const s2 = pptx.addSlide()
  s2.background = bgOpts
  slideTitle(s2, 'Executive Summary', 2)

  const execRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Metric', options: { bold: true, color: SKY, fontSize: 11, fontFace: 'Arial' } },
      { text: 'Value', options: { bold: true, color: SKY, fontSize: 11, fontFace: 'Arial' } },
    ],
    [
      { text: 'Total Development Cost', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(option.cost.total), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Total Keys', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.totalKeys}`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Stabilised NOI (Year 3)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(option.revenue.stabilisedNoi), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Yield on Cost', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: pct(option.revenue.stabilisedNoi / option.cost.total), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s2.addTable(execRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [4.2, 4.2],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.5,
  })

  s2.addText(
    `This ${option.form}-form design delivers ${option.metrics.totalKeys} keys (${option.metrics.yotelKeys} YOTEL + ${option.metrics.padUnits} PAD) ` +
    `with a stabilised yield of ${pct(option.revenue.stabilisedNoi / option.cost.total)} on a TDC of ${fmtUSD(option.cost.total)}.`,
    {
      x: 0.8,
      y: 4.0,
      w: 8.4,
      h: 0.8,
      fontSize: 10,
      color: SLATE_300,
      fontFace: 'Arial',
    },
  )

  // ── Slide 3: Site Overview ──
  const s3 = pptx.addSlide()
  s3.background = bgOpts
  slideTitle(s3, 'Site Overview', 3)

  const siteArea = 4047 // ~1 acre in m²
  const siteRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Parameter', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Value', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Site Area', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${fmt(siteArea)} m² (1.0 acre)`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Footprint', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${fmt(option.metrics.footprint)} m²`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Site Coverage', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: pct(option.metrics.coverage), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Building Height', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.buildingHeight.toFixed(1)} m`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Height Limit (TCDPO)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: '45.0 m', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Gross Internal Area', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${fmt(option.metrics.gia)} m²`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'West (Sea) Facade', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.westFacade.toFixed(1)} m`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s3.addTable(siteRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [4.2, 4.2],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.45,
  })

  // ── Slide 4: Design Option ──
  const s4 = pptx.addSlide()
  s4.background = bgOpts
  slideTitle(s4, 'Design Option', 4)

  const designRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Parameter', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Value', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Form Type', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: option.form, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Gross Floor Area', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${fmt(option.metrics.gia)} m²`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'YOTEL Rooms', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.yotelKeys}`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'YOTELPAD Units', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.padUnits}`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Total Keys', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.metrics.totalKeys}`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Corridor Type', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: option.metrics.corridorType === 'double_loaded' ? 'Double-Loaded' : 'Single-Loaded', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Design Score', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${option.score.toFixed(1)} / 100`, options: { color: SKY, bold: true, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s4.addTable(designRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [4.2, 4.2],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.45,
  })

  // ── Slide 5: Floor Programme ──
  const s5 = pptx.addSlide()
  s5.background = bgOpts
  slideTitle(s5, 'Floor Programme', 5)

  const floorRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Level', options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' } },
      { text: 'Use', options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' } },
      { text: 'GIA (m²)', options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' } },
      { text: 'Rooms', options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' } },
    ],
  ]
  for (const floor of option.floors) {
    const useLabel =
      floor.use === 'FOH_BOH' ? 'Ground (FOH/BOH)' :
      floor.use === 'YOTEL' ? 'YOTEL' :
      floor.use === 'YOTELPAD' ? 'YOTELPAD' : 'Rooftop'
    const roomCount = floor.rooms.reduce((s, r) => s + r.count, 0)
    floorRows.push([
      { text: floor.level === 0 ? 'G' : `${floor.level}`, options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
      { text: useLabel, options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
      { text: fmt(floor.gia), options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
      { text: roomCount > 0 ? `${roomCount}` : '-', options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
    ])
  }
  s5.addTable(floorRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [1.2, 3.0, 2.1, 2.1],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.35,
  })

  // ── Slide 6: Amenity Programme ──
  const s6 = pptx.addSlide()
  s6.background = bgOpts
  slideTitle(s6, 'Amenity Programme', 6)

  const amenities = option.amenities
  const amenityItems: [string, string][] = amenities
    ? [
        ['Swimming Pool', `${fmt(amenities.pool.waterArea)} m² water area`],
        ['Pool Deck', `${fmt(amenities.pool.deckArea)} m² deck`],
        ['Infinity Edge', amenities.pool.hasInfinityEdge ? 'Yes' : 'No'],
        ['Swim-up Bar', amenities.pool.hasSwimUpBar ? 'Yes' : 'No'],
        ['Rooftop Bar & Lounge', `${fmt(amenities.rooftopDeck.totalArea)} m²`],
        ['Restaurant', `${fmt(amenities.restaurant.totalSeats)} seats (${fmt(amenities.restaurant.indoorArea)} m² indoor + ${fmt(amenities.restaurant.outdoorArea)} m² outdoor)`],
        ['Recording Studio', 'Professional grade, soundproofed'],
        ['Sim Racing Lounge', 'Multi-bay simulator experience'],
        ['Total Amenity Area', `${fmt(amenities.totalAmenityArea)} m²`],
      ]
    : [
        ['Pool', 'Included'],
        ['Rooftop Bar', 'Included'],
        ['Restaurant', 'Included'],
        ['Recording Studio', 'Planned'],
        ['Sim Racing', 'Planned'],
      ]

  const amenityRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Amenity', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Details', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    ...amenityItems.map(([name, detail]) => [
      { text: name, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: detail, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ] as PptxGenJS.TableRow),
  ]
  s6.addTable(amenityRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [3.0, 5.4],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.38,
  })

  // ── Slide 7: Financial Summary ──
  const s7 = pptx.addSlide()
  s7.background = bgOpts
  slideTitle(s7, 'Financial Summary', 7)

  const finHeaders: PptxGenJS.TableRow = [
    { text: 'Metric', options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' } },
    ...option.revenue.years.map((_, i) => ({
      text: `Year ${i + 1}`,
      options: { bold: true, color: SKY, fontSize: 9, fontFace: 'Arial' },
    })),
  ]

  const finRevenue: PptxGenJS.TableRow = [
    { text: 'Revenue', options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
    ...option.revenue.years.map((y) => ({
      text: fmtUSD(y.totalRevenue),
      options: { color: WHITE, fontSize: 9, fontFace: 'Arial' },
    })),
  ]

  const finGOP: PptxGenJS.TableRow = [
    { text: 'GOP', options: { color: WHITE, fontSize: 9, fontFace: 'Arial' } },
    ...option.revenue.years.map((y) => ({
      text: fmtUSD(y.gop),
      options: { color: WHITE, fontSize: 9, fontFace: 'Arial' },
    })),
  ]

  const finNOI: PptxGenJS.TableRow = [
    { text: 'NOI', options: { color: SKY, bold: true, fontSize: 9, fontFace: 'Arial' } },
    ...option.revenue.years.map((y) => ({
      text: fmtUSD(y.noi),
      options: { color: SKY, bold: true, fontSize: 9, fontFace: 'Arial' },
    })),
  ]

  s7.addTable([finHeaders, finRevenue, finGOP, finNOI], {
    x: 0.5,
    y: 1.2,
    w: 9,
    colW: [1.5, ...option.revenue.years.map(() => 7.5 / option.revenue.years.length)],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.45,
  })

  const summaryRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Cost per Key', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(option.cost.perKey), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'GOP Margin (Stabilised)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: pct(option.revenue.gopMargin), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'RevPAR', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(option.revenue.revPar), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Stabilised NOI', options: { color: SKY, bold: true, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(option.revenue.stabilisedNoi), options: { color: SKY, bold: true, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s7.addTable(summaryRows, {
    x: 0.8,
    y: 3.5,
    w: 8.4,
    colW: [4.2, 4.2],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.4,
  })

  // ── Slide 8: Capital Stack ──
  const s8 = pptx.addSlide()
  s8.background = bgOpts
  slideTitle(s8, 'Capital Stack', 8)

  const tdc = option.cost.total
  const seniorDebt = tdc * 0.55
  const mezzanine = tdc * 0.15
  const equity = tdc * 0.30
  const yieldOnCost = option.revenue.stabilisedNoi / tdc
  const irr = yieldOnCost * 2.2 // Simplified IRR estimate
  const equityMultiple = 1 + (irr * 5) // Simplified 5-year multiple

  const capRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Tranche', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Amount', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: '% of TDC', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Senior Debt', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(seniorDebt), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: '55%', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Mezzanine', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(mezzanine), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: '15%', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Equity', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(equity), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: '30%', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Total', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: fmtUSD(tdc), options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: '100%', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s8.addTable(capRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [2.8, 2.8, 2.8],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.45,
  })

  const returnRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Return Metric', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Value', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Yield on Cost', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: pct(yieldOnCost), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Projected IRR (Levered)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: pct(irr), options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Equity Multiple (5yr)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: `${equityMultiple.toFixed(2)}x`, options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s8.addTable(returnRows, {
    x: 0.8,
    y: 3.6,
    w: 8.4,
    colW: [4.2, 4.2],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.4,
  })

  // ── Slide 9: Sustainability ──
  const s9 = pptx.addSlide()
  s9.background = bgOpts
  slideTitle(s9, 'Sustainability & ESG', 9)

  const susRows: PptxGenJS.TableRow[] = [
    [
      { text: 'Initiative', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Target', options: { bold: true, color: SKY, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'LEED Certification', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'LEED Gold (target)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'EDGE Score', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'EDGE Advanced (>40% savings)', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Renewable Energy', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Rooftop solar PV, battery storage', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Water Efficiency', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Rainwater harvesting, greywater recycling, low-flow fixtures', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Building Envelope', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'High-performance glazing, natural ventilation corridors', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Materials', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Locally sourced coral stone, recycled content steel', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
    [
      { text: 'Resilience', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
      { text: 'Hurricane-rated structure, elevated MEP, backup generation', options: { color: WHITE, fontSize: 10, fontFace: 'Arial' } },
    ],
  ]
  s9.addTable(susRows, {
    x: 0.8,
    y: 1.2,
    w: 8.4,
    colW: [3.0, 5.4],
    border: { type: 'solid', pt: 0.5, color: SLATE_700 },
    rowH: 0.43,
  })

  // ── Slide 10: Contact ──
  const s10 = pptx.addSlide()
  s10.background = bgOpts
  s10.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: SKY },
  })
  s10.addText('Contact', {
    x: 1,
    y: 1.0,
    w: 8,
    h: 0.7,
    fontSize: 32,
    bold: true,
    color: WHITE,
    fontFace: 'Arial',
    align: 'center',
  })
  s10.addText('Coruscant Developments Ltd', {
    x: 1,
    y: 2.0,
    w: 8,
    h: 0.5,
    fontSize: 18,
    color: SKY,
    fontFace: 'Arial',
    align: 'center',
  })
  s10.addText(
    'Carlisle Bay, Bridgetown, Barbados\n\ninvestors@coruscantdev.com\nwww.coruscantdev.com',
    {
      x: 1.5,
      y: 2.8,
      w: 7,
      h: 1.5,
      fontSize: 13,
      color: SLATE_300,
      fontFace: 'Arial',
      align: 'center',
      lineSpacingMultiple: 1.3,
    },
  )
  s10.addText('This document is confidential and intended for the recipient only.', {
    x: 1,
    y: 4.8,
    w: 8,
    h: 0.3,
    fontSize: 8,
    color: SLATE_700,
    fontFace: 'Arial',
    align: 'center',
  })
  s10.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0,
    y: 5.45,
    w: '100%',
    h: 0.05,
    fill: { color: SKY },
  })

  // Generate and download
  const fileName = `YOTEL_Barbados_${option.form}_${option.metrics.totalKeys}keys_${new Date().toISOString().slice(0, 10)}.pptx`
  await pptx.writeFile({ fileName })
}
