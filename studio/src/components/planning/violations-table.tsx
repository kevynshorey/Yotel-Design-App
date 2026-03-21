'use client'

import type { DesignOption } from '@/engine/types'

interface ViolationsTableProps {
  options: DesignOption[]
}

interface WarningsListProps {
  options: DesignOption[]
}

function SeverityPill({ severity }: { severity: 'fatal' | 'warning' }) {
  if (severity === 'fatal') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400 ring-1 ring-red-800/60">
        Fatal
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 ring-1 ring-amber-800/60">
      Warning
    </span>
  )
}

function StatusDot({ isValid }: { isValid: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${isValid ? 'bg-green-400' : 'bg-red-400'}`}
    />
  )
}

export function ViolationsTable({ options }: ViolationsTableProps) {
  // Collect all failing options with their violations
  const failingOptions = options.filter(
    (o) => !o.validation.isValid && o.validation.violations.length > 0,
  )

  if (failingOptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-green-800/40 bg-green-900/10 py-8">
        <div className="h-3 w-3 rounded-full bg-green-400" />
        <p className="text-sm font-medium text-green-400">No fatal violations</p>
        <p className="text-xs text-slate-500">All generated options are compliant</p>
      </div>
    )
  }

  return (
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
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-slate-500">
              Rule Violated
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
              Actual
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
              Limit
            </th>
            <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-slate-500">
              Severity
            </th>
          </tr>
        </thead>
        <tbody>
          {failingOptions.flatMap((option) =>
            option.validation.violations.map((violation, vIdx) => (
              <tr
                key={`${option.id}-v${vIdx}`}
                className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
              >
                <td className="px-3 py-2 font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <StatusDot isValid={option.validation.isValid} />
                    {option.id}
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-300">{option.form}</td>
                <td className="px-3 py-2 text-slate-300">{violation.rule}</td>
                <td className="px-3 py-2 text-right font-mono text-red-400">{violation.actual}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-400">{violation.limit}</td>
                <td className="px-3 py-2 text-center">
                  <SeverityPill severity={violation.severity} />
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}

export function WarningsList({ options }: WarningsListProps) {
  // Collect options that are valid but have warnings
  const warnedOptions = options.filter(
    (o) => o.validation.isValid && o.validation.warnings.length > 0,
  )

  if (warnedOptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-green-800/40 bg-green-900/10 py-6">
        <p className="text-xs text-green-400">No warnings on passing options</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {warnedOptions.map((option) => (
        <div
          key={option.id}
          className="rounded-lg border border-amber-800/40 bg-amber-900/10 px-3 py-2.5"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-amber-400">{option.id}</span>
            <span className="text-xs text-slate-500">{option.form}</span>
            <span className="text-[10px] text-slate-600">
              {option.metrics.totalKeys} keys · {option.metrics.buildingHeight.toFixed(1)}m ·{' '}
              {(option.metrics.coverage * 100).toFixed(1)}% coverage
            </span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {option.validation.warnings.map((w, wIdx) => (
              <li key={wIdx} className="flex items-start gap-1.5 text-xs text-amber-300/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
