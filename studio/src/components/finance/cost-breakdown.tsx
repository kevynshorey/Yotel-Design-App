'use client'

import type { CostEstimate } from '@/engine/types'
import { Separator } from '@/components/ui/separator'

interface CostBreakdownProps {
  cost: CostEstimate
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function pctOf(part: number, total: number): string {
  if (total <= 0) return '0%'
  return ((part / total) * 100).toFixed(1) + '%'
}

const BREAKDOWN_LABELS: Record<keyof CostEstimate['breakdown'], string> = {
  construction: 'Construction',
  facade: 'Facade / Cladding',
  ffe: 'FF&E',
  technology: 'Technology',
  outdoor: 'Outdoor / Amenity',
  siteWorks: 'Site Works',
  land: 'Land',
  softCosts: 'Soft Costs',
  contingency: 'Contingency',
}

const BREAKDOWN_ORDER: Array<keyof CostEstimate['breakdown']> = [
  'construction',
  'facade',
  'ffe',
  'technology',
  'outdoor',
  'siteWorks',
  'land',
  'softCosts',
  'contingency',
]

export function CostBreakdown({ cost }: CostBreakdownProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        TDC Breakdown
      </p>

      <div className="flex flex-col gap-1.5">
        {BREAKDOWN_ORDER.map((key) => {
          const value = cost.breakdown[key]
          const barPct = cost.total > 0 ? (value / cost.total) * 100 : 0
          return (
            <div key={key} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{BREAKDOWN_LABELS[key]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    {pctOf(value, cost.total)}
                  </span>
                  <span className="font-mono font-medium text-slate-200 w-24 text-right">
                    {usd(value)}
                  </span>
                </div>
              </div>
              {/* Mini bar */}
              <div className="h-0.5 w-full rounded-full bg-slate-800">
                <div
                  className="h-0.5 rounded-full bg-sky-500/60"
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">Total Dev. Cost</span>
        <span className="font-mono font-bold text-sky-400">{usd(cost.total)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Cost / Key</span>
        <span className="font-mono font-semibold text-slate-200">{usd(cost.perKey)}</span>
      </div>
    </div>
  )
}
