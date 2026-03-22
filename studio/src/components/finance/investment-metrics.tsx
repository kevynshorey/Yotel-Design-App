'use client'

import type { CostEstimate, RevenueProjection } from '@/engine/types'

interface InvestmentMetricsProps {
  cost: CostEstimate
  projection: RevenueProjection
  totalKeys: number
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function pct(n: number, decimals = 2): string {
  return (n * 100).toFixed(decimals) + '%'
}

export function InvestmentMetrics({
  cost,
  projection,
  totalKeys,
}: InvestmentMetricsProps) {
  const yieldOnCost =
    cost.total > 0 ? projection.stabilisedNoi / cost.total : 0
  const exitValue =
    yieldOnCost > 0 ? projection.stabilisedNoi / 0.085 : 0

  const metrics: Array<{
    label: string
    value: string
    accent?: boolean
    sub?: string
  }> = [
    {
      label: 'Total Dev. Cost',
      value: usd(cost.total),
      accent: true,
    },
    {
      label: 'Cost / Key',
      value: usd(cost.perKey),
      sub: `${totalKeys} keys`,
    },
    {
      label: 'Stabilised NOI',
      value: usd(projection.stabilisedNoi),
      accent: true,
      sub: 'Year 3',
    },
    {
      label: 'NOI / Key',
      value: usd(projection.stabilisedNoiPerKey),
    },
    {
      label: 'GOP Margin',
      value: pct(projection.gopMargin),
      sub: 'stabilised',
    },
    {
      label: 'Yield on Cost',
      value: pct(yieldOnCost),
      accent: yieldOnCost >= 0.07,
      sub: 'NOI ÷ TDC',
    },
    {
      label: 'RevPAR',
      value: usd(projection.revPar),
      sub: 'Yr 3 / key / night',
    },
    {
      label: 'Exit Value (8.5%)',
      value: exitValue > 0 ? usd(Math.round(exitValue)) : '—',
      sub: 'indicative',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {metrics.map((m) => (
        <MetricTile key={m.label} {...m} />
      ))}
    </div>
  )
}

function MetricTile({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string
  accent?: boolean
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 cursor-pointer hover:bg-slate-700/60 hover:border-sky-500/30 transition-colors">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className={`font-mono text-sm font-bold leading-tight ${
          accent ? 'text-sky-400' : 'text-slate-100'
        }`}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-slate-600">{sub}</span>
      )}
    </div>
  )
}
