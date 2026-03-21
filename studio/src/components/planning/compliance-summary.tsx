'use client'

interface ComplianceSummaryProps {
  total: number
  passing: number
  failing: number
  withWarnings: number
  loading: boolean
}

interface SummaryTileProps {
  label: string
  value: number | string
  color: 'default' | 'green' | 'red' | 'amber'
  sub?: string
}

function SummaryTile({ label, value, color, sub }: SummaryTileProps) {
  const valueColors = {
    default: 'text-slate-100',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  }
  const borderColors = {
    default: 'border-slate-700/50',
    green: 'border-green-800/50',
    red: 'border-red-800/50',
    amber: 'border-amber-800/50',
  }

  return (
    <div
      className={`flex flex-col gap-0.5 rounded-lg border bg-slate-800/40 px-3 py-2.5 ${borderColors[color]}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className={`font-mono text-2xl font-bold leading-tight ${valueColors[color]}`}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  )
}

export function ComplianceSummary({
  total,
  passing,
  failing,
  withWarnings,
  loading,
}: ComplianceSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border border-slate-700/50 bg-slate-800/40"
          />
        ))}
      </div>
    )
  }

  const passRate = total > 0 ? Math.round((passing / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryTile label="Total Options" value={total} color="default" sub="generated" />
      <SummaryTile
        label="Passing"
        value={passing}
        color="green"
        sub={`${passRate}% pass rate`}
      />
      <SummaryTile label="Failing" value={failing} color="red" sub="fatal violations" />
      <SummaryTile
        label="With Warnings"
        value={withWarnings}
        color="amber"
        sub="valid but flagged"
      />
    </div>
  )
}
