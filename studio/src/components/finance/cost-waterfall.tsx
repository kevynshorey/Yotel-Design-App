'use client'

import type { CostEstimate } from '@/engine/types'

interface CostWaterfallProps {
  cost: CostEstimate
}

function usd(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'k'
  return '$' + n.toLocaleString('en-US')
}

/** Waterfall chart segments — ordered from bottom (first cost) to top (TDC). */
const SEGMENTS: Array<{
  key: keyof CostEstimate['breakdown']
  label: string
  color: string
  bgColor: string
}> = [
  { key: 'land',         label: 'Land',          color: 'bg-amber-500',   bgColor: 'bg-amber-500/20' },
  { key: 'construction', label: 'Construction',   color: 'bg-sky-500',     bgColor: 'bg-sky-500/20' },
  { key: 'facade',       label: 'Façade',         color: 'bg-sky-400',     bgColor: 'bg-sky-400/20' },
  { key: 'ffe',          label: 'FF&E',           color: 'bg-teal-500',    bgColor: 'bg-teal-500/20' },
  { key: 'technology',   label: 'Technology',     color: 'bg-violet-500',  bgColor: 'bg-violet-500/20' },
  { key: 'outdoor',      label: 'Outdoor',        color: 'bg-emerald-500', bgColor: 'bg-emerald-500/20' },
  { key: 'siteWorks',    label: 'Site Works',     color: 'bg-orange-500',  bgColor: 'bg-orange-500/20' },
  { key: 'softCosts',    label: 'Soft Costs',     color: 'bg-slate-400',   bgColor: 'bg-slate-400/20' },
  { key: 'contingency',  label: 'Contingency',    color: 'bg-rose-500',    bgColor: 'bg-rose-500/20' },
]

export function CostWaterfall({ cost }: CostWaterfallProps) {
  const total = cost.total
  if (total <= 0) return null

  // Build waterfall bars — each starts where the previous ended
  let cumulative = 0
  const bars = SEGMENTS.map((seg) => {
    const value = cost.breakdown[seg.key]
    const pct = (value / total) * 100
    const startPct = (cumulative / total) * 100
    cumulative += value
    return { ...seg, value, pct, startPct, endPct: (cumulative / total) * 100 }
  })

  const chartHeight = 320

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Cost Waterfall
        </p>
        <p className="font-mono text-xs font-bold text-sky-400">{usd(total)}</p>
      </div>

      {/* Waterfall chart */}
      <div className="flex items-end gap-1" style={{ height: chartHeight }}>
        {bars.map((bar) => {
          const barHeight = Math.max(8, (bar.pct / 100) * chartHeight)
          const bottomOffset = (bar.startPct / 100) * chartHeight

          return (
            <div
              key={bar.key}
              className="group relative flex-1"
              style={{ height: chartHeight }}
            >
              {/* The bar segment */}
              <div
                className={`absolute left-0 right-0 ${bar.color} rounded-t transition-all hover:brightness-110`}
                style={{
                  bottom: bottomOffset,
                  height: barHeight,
                  minHeight: 8,
                }}
              />

              {/* Connector line from previous bar's top to this bar's bottom */}
              {bar.startPct > 0 && (
                <div
                  className="absolute left-0 right-0 border-l border-dashed border-slate-600/40"
                  style={{
                    bottom: 0,
                    height: bottomOffset,
                  }}
                />
              )}

              {/* Hover tooltip */}
              <div className="pointer-events-none absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 shadow-xl group-hover:block">
                <p className="whitespace-nowrap text-[10px] font-semibold text-slate-200">
                  {bar.label}
                </p>
                <p className="whitespace-nowrap font-mono text-xs text-sky-400">
                  {usd(bar.value)}
                </p>
                <p className="whitespace-nowrap text-[10px] text-slate-400">
                  {bar.pct.toFixed(1)}% of TDC
                </p>
              </div>
            </div>
          )
        })}

        {/* Total bar */}
        <div
          className="group relative flex-1"
          style={{ height: chartHeight }}
        >
          <div
            className="absolute left-0 right-0 rounded-t bg-sky-400"
            style={{ bottom: 0, height: chartHeight }}
          />
          <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 shadow-xl group-hover:block">
            <p className="whitespace-nowrap text-[10px] font-semibold text-slate-200">
              Total TDC
            </p>
            <p className="whitespace-nowrap font-mono text-xs text-sky-400">
              {usd(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Labels row */}
      <div className="flex gap-1">
        {bars.map((bar) => (
          <div key={bar.key} className="flex-1 text-center">
            <p className="truncate text-[8px] leading-tight text-slate-500">
              {bar.label}
            </p>
          </div>
        ))}
        <div className="flex-1 text-center">
          <p className="text-[8px] font-bold text-sky-400">TDC</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-sm ${bar.color}`} />
            <span className="text-[9px] text-slate-500">{bar.label}</span>
            <span className="font-mono text-[9px] text-slate-400">{usd(bar.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
