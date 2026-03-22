'use client'

import { useMemo } from 'react'
import {
  calculateDCF,
  SENSITIVITY_EXIT_CAPS,
  SENSITIVITY_NOI_GROWTH,
} from '@/engine/dcf'
import type { DcfResult, DcfYearCashFlow } from '@/engine/dcf'
import type { RevenueProjection } from '@/engine/types'
import type { CapitalStackResult } from '@/engine/capital-stack'

interface DcfAnalysisProps {
  tdc: number
  projection: RevenueProjection
  capitalStack: CapitalStackResult
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

/** Color class for IRR: green >15%, amber 10-15%, red <10% */
function irrColor(irr: number): string {
  if (irr >= 0.15) return 'bg-emerald-900/60 text-emerald-300'
  if (irr >= 0.10) return 'bg-amber-900/50 text-amber-300'
  return 'bg-red-900/50 text-red-300'
}

function irrTextColor(irr: number): string {
  if (irr >= 0.15) return 'text-emerald-400'
  if (irr >= 0.10) return 'text-amber-400'
  return 'text-red-400'
}

// ── Summary Cards ──

function SummaryCards({ result }: { result: DcfResult }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        label="Net Present Value"
        value={usd(result.npv)}
        sub={`WACC ${pct(result.wacc)}`}
        accent={result.npv > 0}
      />
      <SummaryCard
        label="Unlevered IRR"
        value={pct(result.irr)}
        sub="10-year hold"
        accent={result.irr >= 0.15}
      />
      <SummaryCard
        label="Equity Multiple"
        value={result.equityMultiple.toFixed(2) + 'x'}
        sub="on total equity"
        accent={result.equityMultiple >= 2.0}
      />
      <SummaryCard
        label="Terminal Value"
        value={usd(result.terminalValue)}
        sub={`@ ${pct(result.exitCapRate)} exit cap`}
      />
    </div>
  )
}

function SummaryCard({
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
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 text-center">
      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className={`mt-1 block font-mono text-xl font-black leading-tight ${
          accent ? 'text-emerald-400' : 'text-slate-100'
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  )
}

// ── Sensitivity Table ──

function SensitivityTable({ result }: { result: DcfResult }) {
  const { sensitivityMatrix } = result

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-slate-300">
          IRR Sensitivity Matrix
        </h3>
        <p className="text-[10px] text-slate-600">
          Exit Cap Rate vs. NOI Growth Rate (Years 6-10)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Exit Cap ↓ / Growth →
              </th>
              {SENSITIVITY_NOI_GROWTH.map(g => (
                <th
                  key={g}
                  className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500"
                >
                  {pct(g, 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensitivityMatrix.map((row, ri) => (
              <tr
                key={SENSITIVITY_EXIT_CAPS[ri]}
                className="border-b border-slate-800/40"
              >
                <td className="px-2 py-1.5 font-mono font-medium text-slate-400">
                  {pct(SENSITIVITY_EXIT_CAPS[ri], 1)}
                </td>
                {row.map((cell, ci) => {
                  const isBase =
                    Math.abs(cell.exitCap - result.exitCapRate) < 0.001 &&
                    Math.abs(cell.noiGrowth - result.noiGrowthRate) < 0.001
                  return (
                    <td
                      key={ci}
                      className={`px-2 py-1.5 text-center font-mono text-xs font-semibold ${irrColor(cell.irr)} ${
                        isBase ? 'ring-1 ring-sky-400/60' : ''
                      }`}
                    >
                      {pct(cell.irr, 1)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-[10px] text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-900/60" /> &gt;15% IRR
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-amber-900/50" /> 10-15%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-red-900/50" /> &lt;10%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded ring-1 ring-sky-400/60" /> Base case
        </span>
      </div>
    </div>
  )
}

// ── Cash Flow Timeline ──

function CashFlowTimeline({ yearCashFlows }: { yearCashFlows: DcfYearCashFlow[] }) {
  const maxNoi = Math.max(...yearCashFlows.map(y => y.noi))

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-slate-300">
          10-Year Cash Flow Projection
        </h3>
        <p className="text-[10px] text-slate-600">
          NOI growth trajectory with debt service overlay
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50 text-left">
              <th className="px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Year</th>
              <th className="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">NOI</th>
              <th className="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">Debt Svc</th>
              <th className="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-500">Levered CF</th>
              <th className="w-40 px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">NOI Bar</th>
            </tr>
          </thead>
          <tbody>
            {yearCashFlows.map(yr => {
              const barWidth = maxNoi > 0 ? (yr.noi / maxNoi) * 100 : 0
              const isProjected = yr.year > 5
              return (
                <tr
                  key={yr.year}
                  className={`border-b border-slate-800/40 transition-colors hover:bg-slate-800/30 ${
                    isProjected ? 'opacity-80' : ''
                  }`}
                >
                  <td className="px-2 py-1.5 font-medium text-slate-300">
                    Yr {yr.year}
                    {isProjected && (
                      <span className="ml-1 text-[9px] text-slate-600">proj</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-slate-300">
                    {usd(yr.noi)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-red-400/70">
                    ({usd(yr.debtService)})
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right font-mono font-semibold ${
                      yr.leveredCf < 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {yr.leveredCf < 0
                      ? '(' + usd(Math.abs(yr.leveredCf)) + ')'
                      : usd(yr.leveredCf)}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="h-3 w-full rounded-full bg-slate-800/60">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isProjected
                            ? 'bg-gradient-to-r from-sky-600/60 to-sky-500/60'
                            : 'bg-gradient-to-r from-sky-600 to-sky-400'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ──

export function DcfAnalysis({ tdc, projection, capitalStack }: DcfAnalysisProps) {
  const dcfResult = useMemo(
    () =>
      calculateDCF({
        tdc,
        projection,
        capitalStack,
      }),
    [tdc, projection, capitalStack],
  )

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          DCF Analysis & IRR Sensitivity
        </h2>
        <p className="mt-1 text-[10px] text-slate-600">
          10-year discounted cash flow with {pct(dcfResult.noiGrowthRate)} NOI growth (Yrs 6-10) · Exit at {pct(dcfResult.exitCapRate)} cap
        </p>
      </div>

      {/* Summary cards */}
      <SummaryCards result={dcfResult} />

      {/* Cash flow timeline */}
      <CashFlowTimeline yearCashFlows={dcfResult.yearCashFlows} />

      {/* Sensitivity matrix */}
      <SensitivityTable result={dcfResult} />

      {/* Footnote */}
      <p className="text-[10px] text-slate-600">
        WACC {pct(dcfResult.wacc)} blended from capital stack layer costs. Terminal value = Year 10 NOI / exit cap rate.
        IRR via bisection on equity cash flows over {dcfResult.yearCashFlows.length}-year hold. Sensitivity shows levered IRR across exit cap / growth scenarios.
      </p>
    </div>
  )
}
