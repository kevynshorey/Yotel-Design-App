'use client'

import Link from 'next/link'
import type { CostEstimate, RevenueProjection } from '@/engine/types'

interface MetricsGridProps {
  cost: CostEstimate
  projection: RevenueProjection
  totalKeys: number
}

interface MetricItem {
  label: string
  value: string
  sub?: string
  accent?: boolean
  href: string
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function usdM(n: number): string {
  return '$' + (n / 1_000_000).toFixed(2) + 'M'
}

function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%'
}

export function MetricsGrid({ cost, projection, totalKeys }: MetricsGridProps) {
  const yieldOnCost = cost.total > 0 ? projection.stabilisedNoi / cost.total : 0
  const exitValue = projection.stabilisedNoi > 0 ? projection.stabilisedNoi / 0.085 : 0

  const metrics: MetricItem[] = [
    {
      label: 'Total Development Cost',
      value: usdM(cost.total),
      sub: 'all-in TDC',
      accent: true,
      href: '/finance',
    },
    {
      label: 'Cost per Key',
      value: usd(cost.perKey),
      sub: `${totalKeys} keys total`,
      href: '/design',
    },
    {
      label: 'Stabilised NOI',
      value: usdM(projection.stabilisedNoi),
      sub: 'Year 3',
      accent: true,
      href: '/finance',
    },
    {
      label: 'NOI per Key',
      value: usd(projection.stabilisedNoiPerKey),
      sub: 'Year 3 / key / yr',
      href: '/finance',
    },
    {
      label: 'GOP Margin',
      value: pct(projection.gopMargin),
      sub: 'stabilised Year 3',
      accent: projection.gopMargin >= 0.50,
      href: '/finance',
    },
    {
      label: 'Yield on Cost',
      value: pct(yieldOnCost),
      sub: 'NOI ÷ TDC',
      accent: yieldOnCost >= 0.10,
      href: '/finance',
    },
    {
      label: 'RevPAR',
      value: usd(projection.revPar),
      sub: 'blended Yr 3 / night',
      href: '/finance',
    },
    {
      label: 'Indicative Exit Value',
      value: exitValue > 0 ? usdM(Math.round(exitValue)) : '—',
      sub: '8.5% cap rate',
      accent: true,
      href: '/finance',
    },
  ]

  return (
    <div className="border-t border-slate-800/60 px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Key Metrics — Live from Engine
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="group flex flex-col gap-1 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-4 transition-colors hover:border-sky-500/40 hover:bg-slate-700/40 cursor-pointer"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-sky-400 transition-colors">
                {m.label}
              </span>
              <span
                className={`font-mono text-xl font-bold leading-tight ${
                  m.accent ? 'text-sky-400' : 'text-slate-100'
                }`}
              >
                {m.value}
              </span>
              {m.sub && (
                <span className="text-[10px] text-slate-600">{m.sub}</span>
              )}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-slate-600">
          Based on 100 YOTEL keys + 30 YOTELPAD units. ADR ramps: YOTEL $155→$211, YOTELPAD $220→$292.
          Occupancy ramps from 55%/50% to 78%/75% at stabilisation.
          NOI after FF&R reserve (4%) and insurance/tax (11.2%).
        </p>
      </div>
    </div>
  )
}
