'use client'

import type { DesignOption } from '@/engine/types'
import { X, ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface ComparisonPanelProps {
  optionA: DesignOption
  optionB: DesignOption
  onClose: () => void
}

type DeltaDirection = 'positive' | 'negative' | 'neutral'

interface MetricRow {
  label: string
  valueA: string
  valueB: string
  delta: string
  direction: DeltaDirection
}

/** For cost metrics, lower is better — so we invert color logic */
const LOWER_IS_BETTER = new Set(['TDC', 'Cost / Key'])

function computeDelta(
  a: number,
  b: number,
  format: (v: number) => string,
  label: string,
): { delta: string; direction: DeltaDirection } {
  const diff = b - a
  if (Math.abs(diff) < 0.001) return { delta: '0', direction: 'neutral' }

  const isPositive = diff > 0
  const lowerIsBetter = LOWER_IS_BETTER.has(label)

  // Determine if the change is "good" or "bad"
  let direction: DeltaDirection
  if (lowerIsBetter) {
    direction = isPositive ? 'negative' : 'positive'
  } else {
    direction = isPositive ? 'positive' : 'negative'
  }

  const sign = isPositive ? '+' : ''
  return { delta: `${sign}${format(diff)}`, direction }
}

function fmtNum(v: number): string {
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtDec1(v: number): string {
  return v.toFixed(1)
}

function fmtDollarsM(v: number): string {
  return `$${(v / 1_000_000).toFixed(1)}M`
}

function fmtDollarsMDelta(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
}

function fmtDollarsK(v: number): string {
  return `$${Math.round(v / 1000)}k`
}

function fmtDollarsKDelta(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.round(abs / 1000)}k`
}

function fmtDollars(v: number): string {
  return `$${Math.round(v)}`
}

function fmtDollarsDelta(v: number): string {
  const sign = v >= 0 ? '+' : '-'
  return `${sign}$${Math.round(Math.abs(v))}`
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`
}

function fmtPctDelta(v: number): string {
  const sign = v >= 0 ? '+' : '-'
  return `${sign}${(Math.abs(v) * 100).toFixed(1)}pp`
}

function fmtPctWhole(v: number): string {
  return `${Math.round(v * 100)}%`
}

function fmtPctWholeDelta(v: number): string {
  const sign = v >= 0 ? '+' : '-'
  return `${sign}${Math.round(Math.abs(v) * 100)}pp`
}

function buildRows(a: DesignOption, b: DesignOption): MetricRow[] {
  const rows: MetricRow[] = []

  // Form Type — no numeric delta
  rows.push({
    label: 'Form Type',
    valueA: a.form,
    valueB: b.form,
    delta: '\u2014',
    direction: 'neutral',
  })

  // Score
  {
    const d = computeDelta(a.score, b.score, fmtDec1, 'Score')
    rows.push({
      label: 'Score',
      valueA: a.score.toFixed(1),
      valueB: b.score.toFixed(1),
      ...d,
    })
  }

  // Total Keys
  {
    const d = computeDelta(a.metrics.totalKeys, b.metrics.totalKeys, fmtNum, 'Total Keys')
    rows.push({
      label: 'Total Keys',
      valueA: fmtNum(a.metrics.totalKeys),
      valueB: fmtNum(b.metrics.totalKeys),
      ...d,
    })
  }

  // YOTEL / PAD
  rows.push({
    label: 'YOTEL / PAD',
    valueA: `${a.metrics.yotelKeys} / ${a.metrics.padUnits}`,
    valueB: `${b.metrics.yotelKeys} / ${b.metrics.padUnits}`,
    delta: '\u2014',
    direction: 'neutral',
  })

  // GIA
  {
    const d = computeDelta(a.metrics.gia, b.metrics.gia, (v) => `${fmtNum(v)} m\u00B2`, 'GIA')
    rows.push({
      label: 'GIA',
      valueA: `${fmtNum(a.metrics.gia)} m\u00B2`,
      valueB: `${fmtNum(b.metrics.gia)} m\u00B2`,
      ...d,
    })
  }

  // GIA / Key
  {
    const d = computeDelta(a.metrics.giaPerKey, b.metrics.giaPerKey, (v) => `${fmtDec1(v)} m\u00B2`, 'GIA / Key')
    rows.push({
      label: 'GIA / Key',
      valueA: `${a.metrics.giaPerKey.toFixed(1)} m\u00B2`,
      valueB: `${b.metrics.giaPerKey.toFixed(1)} m\u00B2`,
      ...d,
    })
  }

  // Coverage
  {
    const d = computeDelta(a.metrics.coverage, b.metrics.coverage, fmtPctDelta, 'Coverage')
    rows.push({
      label: 'Coverage',
      valueA: fmtPct(a.metrics.coverage),
      valueB: fmtPct(b.metrics.coverage),
      ...d,
    })
  }

  // Height
  {
    const d = computeDelta(a.metrics.buildingHeight, b.metrics.buildingHeight, (v) => `${fmtDec1(v)}m`, 'Height')
    rows.push({
      label: 'Height',
      valueA: `${a.metrics.buildingHeight.toFixed(1)}m`,
      valueB: `${b.metrics.buildingHeight.toFixed(1)}m`,
      ...d,
    })
  }

  // West Facade
  {
    const d = computeDelta(a.metrics.westFacade, b.metrics.westFacade, (v) => `${fmtDec1(v)}m`, 'West Facade')
    rows.push({
      label: 'West Facade',
      valueA: `${a.metrics.westFacade.toFixed(1)}m`,
      valueB: `${b.metrics.westFacade.toFixed(1)}m`,
      ...d,
    })
  }

  // TDC (lower is better)
  {
    const d = computeDelta(a.metrics.tdc, b.metrics.tdc, fmtDollarsMDelta, 'TDC')
    rows.push({
      label: 'TDC',
      valueA: fmtDollarsM(a.metrics.tdc),
      valueB: fmtDollarsM(b.metrics.tdc),
      ...d,
    })
  }

  // Cost / Key (lower is better)
  {
    const d = computeDelta(a.metrics.costPerKey, b.metrics.costPerKey, fmtDollarsKDelta, 'Cost / Key')
    rows.push({
      label: 'Cost / Key',
      valueA: fmtDollarsK(a.metrics.costPerKey),
      valueB: fmtDollarsK(b.metrics.costPerKey),
      ...d,
    })
  }

  // Stabilised NOI
  {
    const d = computeDelta(a.revenue.stabilisedNoi, b.revenue.stabilisedNoi, fmtDollarsMDelta, 'Stab. NOI')
    rows.push({
      label: 'Stab. NOI',
      valueA: fmtDollarsM(a.revenue.stabilisedNoi),
      valueB: fmtDollarsM(b.revenue.stabilisedNoi),
      ...d,
    })
  }

  // Yield on Cost
  {
    const yocA = a.metrics.tdc > 0 ? a.revenue.stabilisedNoi / a.metrics.tdc : 0
    const yocB = b.metrics.tdc > 0 ? b.revenue.stabilisedNoi / b.metrics.tdc : 0
    const d = computeDelta(yocA, yocB, fmtPctDelta, 'Yield on Cost')
    rows.push({
      label: 'Yield on Cost',
      valueA: fmtPct(yocA),
      valueB: fmtPct(yocB),
      ...d,
    })
  }

  // GOP Margin
  {
    const d = computeDelta(a.revenue.gopMargin, b.revenue.gopMargin, fmtPctDelta, 'GOP Margin')
    rows.push({
      label: 'GOP Margin',
      valueA: fmtPct(a.revenue.gopMargin),
      valueB: fmtPct(b.revenue.gopMargin),
      ...d,
    })
  }

  // RevPAR
  {
    const d = computeDelta(a.revenue.revPar, b.revenue.revPar, fmtDollarsDelta, 'RevPAR')
    rows.push({
      label: 'RevPAR',
      valueA: fmtDollars(a.revenue.revPar),
      valueB: fmtDollars(b.revenue.revPar),
      ...d,
    })
  }

  // Pool Area
  if (a.amenities && b.amenities) {
    {
      const d = computeDelta(a.amenities.pool.waterArea, b.amenities.pool.waterArea, (v) => `${fmtNum(v)} m\u00B2`, 'Pool Area')
      rows.push({
        label: 'Pool Area',
        valueA: `${a.amenities.pool.waterArea} m\u00B2`,
        valueB: `${b.amenities.pool.waterArea} m\u00B2`,
        ...d,
      })
    }

    // Lounger Capacity
    {
      const d = computeDelta(a.amenities.loungerCapacity, b.amenities.loungerCapacity, fmtNum, 'Lounger Capacity')
      rows.push({
        label: 'Lounger Capacity',
        valueA: fmtNum(a.amenities.loungerCapacity),
        valueB: fmtNum(b.amenities.loungerCapacity),
        ...d,
      })
    }
  }

  // Amenity Score
  {
    const d = computeDelta(a.metrics.amenityScore, b.metrics.amenityScore, fmtPctWholeDelta, 'Amenity Score')
    rows.push({
      label: 'Amenity Score',
      valueA: fmtPctWhole(a.metrics.amenityScore),
      valueB: fmtPctWhole(b.metrics.amenityScore),
      ...d,
    })
  }

  // Compliance
  rows.push({
    label: 'Compliance',
    valueA: a.validation.isValid ? '\u2713 PASS' : '\u2717 FAIL',
    valueB: b.validation.isValid ? '\u2713 PASS' : '\u2717 FAIL',
    delta: '\u2014',
    direction: 'neutral',
  })

  return rows
}

function DeltaCell({ delta, direction }: { delta: string; direction: DeltaDirection }) {
  if (direction === 'neutral') {
    return (
      <span className="flex items-center gap-1 text-slate-500">
        <Minus size={12} />
        {delta !== '\u2014' && delta}
        {delta === '\u2014' && '\u2014'}
      </span>
    )
  }
  if (direction === 'positive') {
    return (
      <span className="flex items-center gap-1 text-emerald-400">
        <ArrowUp size={12} />
        {delta}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-red-400">
      <ArrowDown size={12} />
      {delta}
    </span>
  )
}

function FormBadge({ form, score, color }: { form: string; score: number; color: string }) {
  return (
    <div className={`flex items-center gap-3 border-l-4 ${color} pl-3`}>
      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-white">
        {form}
      </span>
      <span className="font-mono text-lg font-bold text-white">{score.toFixed(1)}</span>
    </div>
  )
}

export function ComparisonPanel({ optionA, optionB, onClose }: ComparisonPanelProps) {
  const rows = buildRows(optionA, optionB)

  return (
    <div className="fixed bottom-0 left-14 right-0 z-50 max-h-[60vh] overflow-y-auto border-t border-sky-500/30 bg-slate-900/95 backdrop-blur-xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-3 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-white">Side-by-Side Comparison</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">A</span>
              <FormBadge form={optionA.form} score={optionA.score} color="border-sky-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">B</span>
              <FormBadge form={optionB.form} score={optionB.score} color="border-amber-400" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Close comparison (C)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700/50 text-slate-400">
            <th className="px-6 py-2 text-left font-medium">Metric</th>
            <th className="px-4 py-2 text-right font-medium">Option A</th>
            <th className="px-4 py-2 text-right font-medium">Option B</th>
            <th className="px-4 py-2 text-right font-medium">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
            >
              <td className="px-6 py-2 font-medium text-slate-300">{row.label}</td>
              <td className="px-4 py-2 text-right font-mono text-white">{row.valueA}</td>
              <td className="px-4 py-2 text-right font-mono text-white">{row.valueB}</td>
              <td className="px-4 py-2 text-right font-mono">
                <DeltaCell delta={row.delta} direction={row.direction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer hint */}
      <div className="border-t border-slate-800/50 px-6 py-2 text-center text-[10px] text-slate-500">
        Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-400">C</kbd> to close comparison
      </div>
    </div>
  )
}
