'use client'

import { useMemo } from 'react'
import { HeroSection } from '@/components/invest/hero-section'
import { HighlightsGrid } from '@/components/invest/highlights-grid'
import { MetricsGrid } from '@/components/invest/metrics-grid'
import { RevenueChart } from '@/components/invest/revenue-chart'
import { Timeline } from '@/components/invest/timeline'
import { estimateCost } from '@/engine/cost'
import { projectRevenue } from '@/engine/revenue'
import type { OptionMetrics } from '@/engine/types'

const YT_ROOMS = 100
const PAD_UNITS = 30

/** Build a minimal OptionMetrics for the default 100 YT + 30 PAD configuration. */
function buildDefaultMetrics(): OptionMetrics {
  const totalKeys = YT_ROOMS + PAD_UNITS
  const gia = totalKeys * 35
  return {
    totalKeys,
    yotelKeys: YT_ROOMS,
    padUnits: PAD_UNITS,
    gia,
    giaPerKey: gia / totalKeys,
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

export default function InvestPage() {
  const metrics = useMemo(() => buildDefaultMetrics(), [])
  const cost = useMemo(() => estimateCost(metrics), [metrics])
  const projection = useMemo(() => projectRevenue(YT_ROOMS, PAD_UNITS, 5), [])

  const totalKeys = YT_ROOMS + PAD_UNITS

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Page header strip */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Investor Portal</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">Investment Summary · YOTEL Barbados</span>
        <span className="ml-auto rounded-full border border-sky-800/60 bg-sky-950/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
          Confidential
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* 1. Hero */}
        <HeroSection
          tdc={cost.total}
          totalKeys={totalKeys}
          stabilisedNoi={projection.stabilisedNoi}
        />

        {/* 2. Investment Highlights */}
        <HighlightsGrid />

        {/* 3. Key Metrics Grid */}
        <MetricsGrid cost={cost} projection={projection} totalKeys={totalKeys} />

        {/* 4. Revenue Chart */}
        <RevenueChart years={projection.years} />

        {/* 5. Development Timeline */}
        <Timeline />

        {/* 6. Contact / Next Steps */}
        <div className="border-t border-slate-800/60 px-8 py-14">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border border-sky-900/50 bg-gradient-to-br from-sky-950/40 to-slate-900/40 p-8 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Next Steps
              </p>
              <h2 className="mb-3 text-2xl font-bold text-slate-50">
                Access the Full Financial Model
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-slate-400">
                For detailed pro-forma financials, capital stack structuring, legal due diligence
                materials, and partnership terms, please contact the development sponsor directly.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <div className="rounded-xl border border-sky-800/50 bg-sky-950/60 px-7 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
                    Development Sponsor
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-100">
                    Coruscant Developments Ltd
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Carlisle Bay Development · Bridgetown, Barbados
                  </p>
                </div>
              </div>

              <p className="mt-8 text-[11px] text-slate-600">
                This summary is for qualified investors only. Past performance is not indicative
                of future results. All projections are illustrative and subject to market conditions,
                planning approvals, and financing terms. © 2025 Coruscant Developments Ltd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
