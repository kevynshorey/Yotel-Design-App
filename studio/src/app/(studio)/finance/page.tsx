'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { FinanceControls } from '@/components/finance/finance-controls'
import { RevenueTable } from '@/components/finance/revenue-table'
import { CostBreakdown } from '@/components/finance/cost-breakdown'
import { InvestmentMetrics } from '@/components/finance/investment-metrics'
import { SensitivityAnalysis } from '@/components/finance/sensitivity-analysis'
import { estimateCost } from '@/engine/cost'
import { projectRevenue } from '@/engine/revenue'
import { useDesign } from '@/context/design-context'
import { getSelectedOption } from '@/store/design-store'
import type { DesignOption, OptionMetrics } from '@/engine/types'

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
    amenityScore: 0,
  }
}

export default function FinancePage() {
  const { selectedOption: contextOption, selectOption } = useDesign()

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

  const [ytRooms, setYtRooms] = useState(100)
  const [padUnits, setPadUnits] = useState(30)
  const [years, setYears] = useState(5)

  // Sensitivity adjustments
  const [adrAdjust, setAdrAdjust] = useState(0)
  const [occAdjust, setOccAdjust] = useState(0)
  const [costAdjust, setCostAdjust] = useState(0)

  // When a design option is linked, pull yotelKeys and padUnits from it;
  // sliders remain as manual overrides in standalone mode.
  const linkedYtRooms = selectedOption?.metrics.yotelKeys ?? ytRooms
  const linkedPadUnits = selectedOption?.metrics.padUnits ?? padUnits

  const metrics: OptionMetrics = useMemo(
    () =>
      selectedOption
        ? selectedOption.metrics
        : buildMetrics(ytRooms, padUnits),
    [selectedOption, ytRooms, padUnits],
  )

  const baseCost = useMemo(() => estimateCost(metrics), [metrics])

  const baseProjection = useMemo(
    () => projectRevenue(linkedYtRooms, linkedPadUnits, years),
    [linkedYtRooms, linkedPadUnits, years],
  )

  // Apply sensitivity adjustments
  const cost = useMemo(() => {
    if (costAdjust === 0) return baseCost
    const factor = 1 + costAdjust
    const adjusted = { ...baseCost }
    adjusted.total = Math.round(baseCost.total * factor)
    adjusted.perKey = Math.round(baseCost.perKey * factor)
    adjusted.breakdown = Object.fromEntries(
      Object.entries(baseCost.breakdown).map(([k, v]) => [k, Math.round(v * factor)]),
    ) as typeof baseCost.breakdown
    return adjusted
  }, [baseCost, costAdjust])

  const projection = useMemo(() => {
    if (adrAdjust === 0 && occAdjust === 0) return baseProjection
    const revFactor = (1 + adrAdjust) * (1 + occAdjust)
    return {
      ...baseProjection,
      stabilisedNoi: Math.round(baseProjection.stabilisedNoi * revFactor),
      stabilisedNoiPerKey: Math.round(baseProjection.stabilisedNoiPerKey * revFactor),
      revPar: Math.round(baseProjection.revPar * (1 + adrAdjust)),
      years: baseProjection.years.map((yr) => ({
        ...yr,
        totalRevenue: Math.round(yr.totalRevenue * revFactor),
        gop: Math.round(yr.gop * revFactor),
        noi: Math.round(yr.noi * revFactor),
      })),
    }
  }, [baseProjection, adrAdjust, occAdjust])

  const totalKeys = linkedYtRooms + linkedPadUnits

  const baseYieldOnCost =
    baseCost.total > 0 ? baseProjection.stabilisedNoi / baseCost.total : 0

  const resetSensitivity = useCallback(() => {
    setAdrAdjust(0)
    setOccAdjust(0)
    setCostAdjust(0)
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Financial Model</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">YOTEL Barbados Pro Forma</span>
      </div>

      {/* Linked-option banner */}
      {selectedOption ? (
        <div className="flex items-center gap-3 border-b border-indigo-800/60 bg-indigo-950/60 px-5 py-2">
          <span className="text-xs text-indigo-300">
            Linked to design option{' '}
            <span className="font-semibold text-indigo-100">{selectedOption.id}</span>
            {' '}—{' '}
            <span className="font-semibold text-indigo-100">{selectedOption.form}</span>
            {' '}
            <span className="font-semibold text-indigo-100">
              {selectedOption.metrics.yotelKeys + selectedOption.metrics.padUnits}
            </span>{' '}
            keys
          </span>
          <button
            onClick={() => selectOption(null)}
            className="ml-auto rounded px-2 py-0.5 text-xs text-indigo-400 hover:bg-indigo-900 hover:text-indigo-200"
          >
            Unlink
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-amber-800/40 bg-amber-950/30 px-5 py-2">
          <span className="text-xs text-amber-400">
            No design option selected — using manual inputs. Select an option in the Massing Tool for live financials.
          </span>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics strip */}
        <div className="border-b border-slate-800/60 px-5 py-3">
          <InvestmentMetrics cost={cost} projection={projection} totalKeys={totalKeys} />
        </div>

        {/* Controls row */}
        <div className="border-b border-slate-800/60 px-5 py-4">
          <FinanceControls
            ytRooms={selectedOption ? linkedYtRooms : ytRooms}
            padUnits={selectedOption ? linkedPadUnits : padUnits}
            years={years}
            onYtRoomsChange={selectedOption ? () => {} : setYtRooms}
            onPadUnitsChange={selectedOption ? () => {} : setPadUnits}
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

        {/* Sensitivity Analysis */}
        <div className="border-t border-slate-800/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div />
            {(adrAdjust !== 0 || occAdjust !== 0 || costAdjust !== 0) && (
              <button
                onClick={resetSensitivity}
                className="rounded border border-slate-700 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 transition-colors hover:border-sky-600 hover:text-sky-400"
              >
                Reset to Base Case
              </button>
            )}
          </div>
          <SensitivityAnalysis
            baseNoi={baseProjection.stabilisedNoi}
            baseTdc={baseCost.total}
            baseYieldOnCost={baseYieldOnCost}
            baseGopMargin={baseProjection.gopMargin}
            baseRevPar={baseProjection.revPar}
            baseCostPerKey={baseCost.perKey}
            totalKeys={totalKeys}
            ytRooms={linkedYtRooms}
            padUnits={linkedPadUnits}
            adrAdjust={adrAdjust}
            occAdjust={occAdjust}
            costAdjust={costAdjust}
            onAdrAdjust={setAdrAdjust}
            onOccAdjust={setOccAdjust}
            onCostAdjust={setCostAdjust}
          />
        </div>
      </div>
    </div>
  )
}
