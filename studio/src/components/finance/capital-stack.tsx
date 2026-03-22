'use client'

import type { CapitalStackResult } from '@/engine/capital-stack'
import type { RevenueProjection } from '@/engine/types'

interface CapitalStackProps {
  result: CapitalStackResult
  projection: RevenueProjection
}

function usd(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return '$' + (n / 1_000_000).toFixed(1) + 'M'
  }
  return '$' + n.toLocaleString('en-US')
}

function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%'
}

const LAYER_COLORS: Record<string, string> = {
  senior_debt: 'bg-sky-500',
  mezzanine: 'bg-amber-500',
  lp_equity: 'bg-emerald-500',
  gp_equity: 'bg-violet-500',
}

const LAYER_TEXT_COLORS: Record<string, string> = {
  senior_debt: 'text-sky-400',
  mezzanine: 'text-amber-400',
  lp_equity: 'text-emerald-400',
  gp_equity: 'text-violet-400',
}

const LAYER_BORDER_COLORS: Record<string, string> = {
  senior_debt: 'border-sky-500/30',
  mezzanine: 'border-amber-500/30',
  lp_equity: 'border-emerald-500/30',
  gp_equity: 'border-violet-500/30',
}

export function CapitalStackUI({ result, projection }: CapitalStackProps) {
  const { layers } = result

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Capital Structure & Returns
        </h2>
        <p className="mt-1 text-[10px] text-slate-600">
          Levered return analysis on {pct(result.ltc)} LTC senior + mezz structure
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* LEFT: Stacked bar + layer details */}
        <div className="flex gap-5">
          {/* Vertical stacked bar */}
          <div className="flex w-14 flex-col-reverse overflow-hidden rounded-lg border border-slate-700/50">
            {layers.map((layer) => (
              <div
                key={layer.type}
                className={`${LAYER_COLORS[layer.type]} flex items-center justify-center transition-all`}
                style={{ height: `${layer.pctOfTdc * 100}%`, minHeight: '24px' }}
              >
                <span className="text-[9px] font-bold text-white/90">
                  {Math.round(layer.pctOfTdc * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Layer detail cards */}
          <div className="flex flex-col-reverse justify-between gap-1.5">
            {layers.map((layer) => (
              <div
                key={layer.type}
                className={`rounded-md border ${LAYER_BORDER_COLORS[layer.type]} bg-slate-800/40 px-3 py-1.5`}
              >
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-semibold ${LAYER_TEXT_COLORS[layer.type]}`}>
                    {layer.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-100">
                    {usd(layer.amount)}
                  </span>
                </div>
                <div className="mt-0.5 flex gap-3 text-[10px] text-slate-500">
                  <span>{pct(layer.pctOfTdc, 0)} of TDC</span>
                  <span>{pct(layer.rate, 1)} {layer.interestOnly ? 'I/O' : 'target'}</span>
                  <span>{layer.term}yr</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Key metrics + IRR/Multiple */}
        <div className="flex-1 space-y-4">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard label="LTV" value={pct(result.ltv)} sub="Debt / Value" />
            <MetricCard label="LTC" value={pct(result.ltc)} sub="Debt / Cost" />
            <MetricCard
              label="DSCR"
              value={result.dscr.toFixed(2) + 'x'}
              sub="Year 3 stabilised"
              accent={result.dscr >= 1.25}
            />
            <MetricCard
              label="Annual Debt Service"
              value={usd(result.annualDebtService)}
              sub="Senior + Mezz I/O"
            />
          </div>

          {/* IRR & Equity Multiple highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 text-center">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Levered IRR
              </span>
              <span
                className={`mt-1 block font-mono text-2xl font-black leading-tight ${
                  result.leveredIrr >= 0.15 ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                {pct(result.leveredIrr, 1)}
              </span>
              <span className="text-[10px] text-slate-600">on total equity</span>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 text-center">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Equity Multiple
              </span>
              <span
                className={`mt-1 block font-mono text-2xl font-black leading-tight ${
                  result.equityMultiple >= 2.0 ? 'text-emerald-400' : 'text-slate-100'
                }`}
              >
                {result.equityMultiple.toFixed(2)}x
              </span>
              <span className="text-[10px] text-slate-600">
                {usd(result.totalEquity)} invested
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Levered returns table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50 text-left">
              <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Year
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">
                NOI
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Debt Service
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Levered CF
              </th>
              <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Cash-on-Cash
              </th>
            </tr>
          </thead>
          <tbody>
            {projection.years.map((yr, i) => {
              const leveredCf = result.leveredCashFlows[i] ?? 0
              const coc = result.cashOnCash[i] ?? 0
              const isNeg = leveredCf < 0
              return (
                <tr
                  key={yr.year}
                  className="border-b border-slate-800/40 transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-3 py-1.5 font-medium text-slate-300">
                    Yr {yr.year}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-300">
                    {usd(yr.noi)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-red-400/70">
                    ({usd(result.annualDebtService)})
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right font-mono font-semibold ${
                      isNeg ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {isNeg ? '(' + usd(Math.abs(leveredCf)) + ')' : usd(leveredCf)}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right font-mono ${
                      coc < 0 ? 'text-red-400' : 'text-slate-300'
                    }`}
                  >
                    {pct(coc, 1)}
                  </td>
                </tr>
              )
            })}
            {/* Exit row */}
            <tr className="border-t border-slate-600/50 bg-slate-800/20">
              <td className="px-3 py-1.5 font-semibold text-slate-200">
                Exit (Yr {projection.years.length})
              </td>
              <td className="px-3 py-1.5 text-right text-[10px] text-slate-500">
                @ 8.5% cap
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-red-400/70">
                repaid
              </td>
              <td className="px-3 py-1.5 text-right font-mono font-semibold text-sky-400">
                {usd(Math.round(
                  (projection.years[projection.years.length - 1]?.noi ?? projection.stabilisedNoi) / 0.085 - result.totalDebt
                ))}
              </td>
              <td className="px-3 py-1.5 text-right text-[10px] text-slate-500">
                net of debt
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <p className="text-[10px] text-slate-600">
        Senior debt 6.5% I/O, mezz 11% I/O. Exit at Year {projection.years.length} stabilised NOI / 8.5% cap.
        IRR via bisection approximation on equity cash flows. Excludes disposition costs.
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2">
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
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  )
}
