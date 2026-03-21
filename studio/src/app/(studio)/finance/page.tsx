'use client'

import { useState, useMemo } from 'react'
import { FinanceControls } from '@/components/finance/finance-controls'
import { RevenueTable } from '@/components/finance/revenue-table'
import { CostBreakdown } from '@/components/finance/cost-breakdown'
import { InvestmentMetrics } from '@/components/finance/investment-metrics'
import { estimateCost } from '@/engine/cost'
import { projectRevenue } from '@/engine/revenue'
import type { OptionMetrics } from '@/engine/types'

/** Build a minimal OptionMetrics from room counts for standalone finance use. */
function buildMetrics(ytRooms: number, padUnits: number): OptionMetrics {
  const totalKeys = ytRooms + padUnits
  const gia = totalKeys * 35
  return {
    totalKeys,
    yotelKeys: ytRooms,
    padUnits,
    gia,
    giaPerKey: gia / Math.max(1, totalKeys),
    footprint: gia / 6,
    coverage: 0.45,
    buildingHeight: 18,
    westFacade: 60,
    outdoorTotal: 800,
    costPerKey: 0,
    tdc: 0,
    corridorType: 'double_loaded',
    form: 'BAR',
  }
}

export default function FinancePage() {
  const [ytRooms, setYtRooms] = useState(100)
  const [padUnits, setPadUnits] = useState(30)
  const [years, setYears] = useState(5)

  const cost = useMemo(
    () => estimateCost(buildMetrics(ytRooms, padUnits)),
    [ytRooms, padUnits],
  )

  const projection = useMemo(
    () => projectRevenue(ytRooms, padUnits, years),
    [ytRooms, padUnits, years],
  )

  const totalKeys = ytRooms + padUnits

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Financial Model</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">YOTEL Barbados Pro Forma</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics strip */}
        <div className="border-b border-slate-800/60 px-5 py-3">
          <InvestmentMetrics cost={cost} projection={projection} totalKeys={totalKeys} />
        </div>

        {/* Controls row */}
        <div className="border-b border-slate-800/60 px-5 py-4">
          <FinanceControls
            ytRooms={ytRooms}
            padUnits={padUnits}
            years={years}
            onYtRoomsChange={setYtRooms}
            onPadUnitsChange={setPadUnits}
            onYearsChange={setYears}
          />
        </div>

        {/* Pro forma + cost side by side on larger screens, stacked on small */}
        <div className="flex flex-col gap-6 p-5 lg:flex-row">
          {/* Pro forma table */}
          <div className="min-w-0 flex-1">
            <RevenueTable projection={projection} />
            <p className="mt-4 text-[10px] text-slate-500">
              Year 1: partial year (210 days). Stabilisation at Year 3.
              ADR ramps: YOTEL $155→$195→$211, YOTELPAD $220→$270→$292.
              GOP calibrated to 51% stabilised margin. NOI after FF&R (4%) + ins/tax (11.2%).
            </p>
          </div>

          {/* Cost breakdown */}
          <div className="w-full shrink-0 lg:w-72">
            <CostBreakdown cost={cost} />
          </div>
        </div>
      </div>
    </div>
  )
}
