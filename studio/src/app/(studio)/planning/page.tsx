'use client'

import { useState, useEffect } from 'react'
import { generateAll } from '@/engine/generator'
import type { DesignOption } from '@/engine/types'
import { ComplianceSummary } from '@/components/planning/compliance-summary'
import { RulesDisplay } from '@/components/planning/rules-display'
import { ViolationsTable, WarningsList } from '@/components/planning/violations-table'

export default function PlanningPage() {
  const [displayOptions, setDisplayOptions] = useState<DesignOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'violations' | 'warnings'>('violations')

  useEffect(() => {
    // generateAll returns only valid (no fatal violations) options sorted by score.
    // We generate a large pool (200) to give a representative compliance picture.
    // Failures are filtered inside the engine; all returned options are fatal-clean.
    const pool = generateAll(200)
    setDisplayOptions(pool)
    setLoading(false)
  }, [])

  // Summary stats — generateAll only returns valid options (no fatal violations)
  const total = displayOptions.length
  const passing = displayOptions.filter((o) => o.validation.warnings.length === 0).length
  const withWarnings = displayOptions.filter((o) => o.validation.warnings.length > 0).length
  // Fatal violations are never in the pool (filtered by the engine), so failing = 0
  const failing = 0

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Planning Compliance</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">YOTEL Barbados · T1 Statute &amp; T3 Brand</span>
        {!loading && (
          <>
            <span className="text-xs text-slate-500">—</span>
            <span className="text-xs text-slate-500">
              {displayOptions.length} options analysed
            </span>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary strip */}
        <div className="border-b border-slate-800/60 px-5 py-4">
          <ComplianceSummary
            total={total}
            passing={passing}
            failing={failing}
            withWarnings={withWarnings}
            loading={loading}
          />
        </div>

        {/* Note about generation methodology */}
        {!loading && (
          <div className="border-b border-slate-800/60 bg-slate-900/60 px-5 py-2">
            <p className="text-[11px] text-slate-500">
              Options generated across all form types (BAR, BAR_NS, L, U, C), floor areas
              (650–1050 m²), wing widths (13.6–16.1 m), and storey counts (5–7 floors).
              Only options passing all fatal rules are included. GIA/key warnings are flagged
              when outside the 29–48 m² benchmark.
            </p>
          </div>
        )}

        {/* Main two-column layout */}
        <div className="flex flex-col gap-0 lg:flex-row lg:gap-0">
          {/* Left column: Rules reference */}
          <div className="w-full shrink-0 border-b border-slate-800/60 p-5 lg:w-72 lg:border-b-0 lg:border-r">
            <RulesDisplay />
          </div>

          {/* Right column: Violations + Warnings */}
          <div className="min-w-0 flex-1 p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
                  <span className="text-xs text-slate-500">Running compliance checks…</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex gap-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-1 w-fit">
                  <button
                    onClick={() => setActiveTab('violations')}
                    className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'violations'
                        ? 'bg-red-900/50 text-red-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fatal Violations
                  </button>
                  <button
                    onClick={() => setActiveTab('warnings')}
                    className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'warnings'
                        ? 'bg-amber-900/40 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Warnings
                  </button>
                </div>

                {/* Tab content */}
                {activeTab === 'violations' && (
                  <div>
                    <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Fatal Violations — Options Failing Planning Rules
                    </h2>
                    <ViolationsTable options={displayOptions} />
                  </div>
                )}

                {activeTab === 'warnings' && (
                  <div>
                    <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Warnings — Valid Options with Flagged Metrics
                    </h2>
                    <WarningsList options={displayOptions} />
                  </div>
                )}

                {/* Per-option compliance overview */}
                <div>
                  <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    All Options — Compliance Status
                  </h2>
                  <div className="overflow-hidden rounded-lg border border-slate-700/50">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/60">
                          <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-slate-500">
                            Option
                          </th>
                          <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-slate-500">
                            Form
                          </th>
                          <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
                            Keys
                          </th>
                          <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
                            Height
                          </th>
                          <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
                            Coverage
                          </th>
                          <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
                            GIA/Key
                          </th>
                          <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayOptions.map((option) => {
                          const hasFatal = !option.validation.isValid
                          const hasWarn = option.validation.isValid && option.validation.warnings.length > 0
                          const statusLabel = hasFatal ? 'FAIL' : hasWarn ? 'WARN' : 'PASS'
                          const statusClass = hasFatal
                            ? 'text-red-400 bg-red-900/30 ring-red-800/50'
                            : hasWarn
                              ? 'text-amber-400 bg-amber-900/30 ring-amber-800/50'
                              : 'text-green-400 bg-green-900/30 ring-green-800/50'

                          return (
                            <tr
                              key={option.id}
                              className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                            >
                              <td className="px-3 py-2 font-mono text-slate-400">{option.id}</td>
                              <td className="px-3 py-2 text-slate-300">{option.form}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-200">
                                {option.metrics.totalKeys}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-200">
                                {option.metrics.buildingHeight.toFixed(1)}m
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-200">
                                {(option.metrics.coverage * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-200">
                                {option.metrics.giaPerKey.toFixed(1)}m²
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusClass}`}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
