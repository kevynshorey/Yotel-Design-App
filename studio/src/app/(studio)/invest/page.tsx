'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { HeroSection } from '@/components/invest/hero-section'
import { HighlightsGrid } from '@/components/invest/highlights-grid'
import { MetricsGrid } from '@/components/invest/metrics-grid'
import { RevenueChart } from '@/components/invest/revenue-chart'
import { Timeline } from '@/components/invest/timeline'
import { CompAnalysis } from '@/components/invest/comp-analysis'
import { estimateCost } from '@/engine/cost'
import { projectRevenue } from '@/engine/revenue'
import { useDesign } from '@/context/design-context'
import { getSelectedOption } from '@/store/design-store'
import type { DesignOption, OptionMetrics } from '@/engine/types'

const DEFAULT_YT_ROOMS = 100
const DEFAULT_PAD_UNITS = 30

/** Build a minimal OptionMetrics for the default 100 YT + 30 PAD configuration. */
function buildDefaultMetrics(): OptionMetrics {
  const totalKeys = DEFAULT_YT_ROOMS + DEFAULT_PAD_UNITS
  const gia = totalKeys * 35
  return {
    totalKeys,
    yotelKeys: DEFAULT_YT_ROOMS,
    padUnits: DEFAULT_PAD_UNITS,
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
    amenityScore: 0,
  }
}

export default function InvestPage() {
  const { selectedOption: contextOption } = useDesign()

  // Persisted option from localStorage (for when context is empty on page load)
  const [storedOption, setStoredOption] = useState<DesignOption | null>(null)

  const loadStored = useCallback(() => {
    setStoredOption(getSelectedOption())
  }, [])

  useEffect(() => {
    loadStored()
    const handler = () => loadStored()
    window.addEventListener('design-option-changed', handler)
    return () => window.removeEventListener('design-option-changed', handler)
  }, [loadStored])

  // Prefer context (live from Design page) over localStorage
  const selectedOption = contextOption ?? storedOption

  const ytRooms = selectedOption?.metrics.yotelKeys ?? DEFAULT_YT_ROOMS
  const padUnits = selectedOption?.metrics.padUnits ?? DEFAULT_PAD_UNITS

  const metrics = useMemo(
    () => (selectedOption ? selectedOption.metrics : buildDefaultMetrics()),
    [selectedOption],
  )
  const cost = useMemo(() => estimateCost(metrics), [metrics])
  const projection = useMemo(
    () => projectRevenue(ytRooms, padUnits, 5),
    [ytRooms, padUnits],
  )

  const totalKeys = ytRooms + padUnits

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Page header strip */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Investor Portal</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">Investment Summary · YOTEL Barbados</span>
        <button
          onClick={() => window.open('/memo', '_blank')}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-sky-800/60 bg-sky-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400 transition-colors hover:border-sky-600 hover:bg-sky-900/60 hover:text-sky-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path d="M2 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 10 2.586L13.414 6A2 2 0 0 1 14 7.414V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
          </svg>
          Export Memo
        </button>
      </div>

      {/* Linked-option banner */}
      {selectedOption ? (
        <div className="flex items-center gap-3 border-b border-indigo-800/60 bg-indigo-950/60 px-5 py-2">
          <span className="text-xs text-indigo-300">
            Sourced from design option{' '}
            <span className="font-semibold text-indigo-100">{selectedOption.id}</span>
            {' '}—{' '}
            <span className="font-semibold text-indigo-100">{selectedOption.form}</span>
            {' '}
            <span className="font-semibold text-indigo-100">
              {selectedOption.metrics.yotelKeys + selectedOption.metrics.padUnits}
            </span>{' '}
            keys
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-amber-800/40 bg-amber-950/30 px-5 py-2">
          <span className="text-xs text-amber-400">
            No design option selected — showing default assumptions. Select an option in the Massing Tool for live data.
          </span>
        </div>
      )}

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

        {/* 6. Competitive Comp Set */}
        <CompAnalysis />

        {/* 7. Contact / Next Steps */}
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
