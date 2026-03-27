/**
 * Mt Brevitor Estates — Agri-Estate P&L Model
 * Source: MBE_E3 Farm PL sheet, MBE_A2 Brand Positioning
 *
 * 17-acre working farm: aquaponics, containerised vegetables, dairy, cheese
 * Revenue ramp over 4 years, breakeven Year 3
 */

export interface FarmYear {
  year: number
  revenueBBD: number
  setupCapitalBBD: number
  labourBBD: number
  feedSuppliesBBD: number
  maintenanceBBD: number
  totalCostBBD: number
  netPLBBD: number
  cumulativePLBBD: number
  components: string[]
}

// ── Farm P&L Projection (from MBE_E3) ──────────────────────────────────────

export function projectFarmPL(): FarmYear[] {
  const years: Omit<FarmYear, 'totalCostBBD' | 'netPLBBD' | 'cumulativePLBBD'>[] = [
    {
      year: 1,
      revenueBBD: 0,
      setupCapitalBBD: 2_000_000,
      labourBBD: 200_000,
      feedSuppliesBBD: 100_000,
      maintenanceBBD: 50_000,
      components: ['Land clearing + soil prep', 'Aquaponics greenhouse construction', 'Container farm setup (5 units)', 'Dairy herd acquisition (initial)', 'Equipment + irrigation'],
    },
    {
      year: 2,
      revenueBBD: 500_000,
      setupCapitalBBD: 1_000_000,
      labourBBD: 400_000,
      feedSuppliesBBD: 200_000,
      maintenanceBBD: 100_000,
      components: ['Aquaponics first harvest cycle', 'Container farm expansion (10 units)', 'Dairy herd growing', 'Cheese production pilot', 'Farm-to-table supply to community restaurant'],
    },
    {
      year: 3,
      revenueBBD: 2_000_000,
      setupCapitalBBD: 500_000,
      labourBBD: 600_000,
      feedSuppliesBBD: 300_000,
      maintenanceBBD: 150_000,
      components: ['Full aquaponics production', 'Container farm at scale (15 units)', 'Dairy herd mature', 'Cheese brand launched', 'Agri-tourism pilot (tours, workshops)'],
    },
    {
      year: 4,
      revenueBBD: 3_000_000,
      setupCapitalBBD: 0,
      labourBBD: 700_000,
      feedSuppliesBBD: 400_000,
      maintenanceBBD: 200_000,
      components: ['Full-scale operations', 'F&B COGS reduction 6-8% via farm-to-table', 'Agri-tourism revenue stream', 'Export potential (artisan cheese)', 'Solar-powered cold storage'],
    },
  ]

  let cumulative = 0
  return years.map(y => {
    const totalCost = y.setupCapitalBBD + y.labourBBD + y.feedSuppliesBBD + y.maintenanceBBD
    const netPL = y.revenueBBD - totalCost
    cumulative += netPL
    return { ...y, totalCostBBD: totalCost, netPLBBD: netPL, cumulativePLBBD: cumulative }
  })
}

// ── Farm Summary ───────────────────────────────────────────────────────────

export function farmSummary() {
  const pl = projectFarmPL()
  const totalCapex = pl.reduce((s, y) => s + y.setupCapitalBBD, 0)
  const breakEvenYear = pl.findIndex(y => y.netPLBBD > 0) + 1
  const stabilisedRevenue = pl[pl.length - 1].revenueBBD
  const stabilisedNet = pl[pl.length - 1].netPLBBD

  return {
    acres: 17,
    totalCapex,
    breakEvenYear,
    stabilisedRevenueBBD: stabilisedRevenue,
    stabilisedNetBBD: stabilisedNet,
    waterReuse: 0.90,             // 90% aquaponics
    cogsReduction: [0.06, 0.08],  // 6-8% F&B COGS reduction
    components: ['Aquaponics greenhouse', 'Containerised vegetables (15 units)', 'Dairy herd', 'Artisan cheese production', 'Solar-powered cold storage', 'Agri-tourism (tours + workshops)'],
  }
}
