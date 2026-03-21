import type { DesignOption } from '@/engine/types'
import { ComplianceBadge } from './compliance-badge'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  option: DesignOption
  isSelected: boolean
  onSelect: (id: string) => void
}

export function OptionCard({ option, isSelected, onSelect }: OptionCardProps) {
  const { metrics, score, validation, form } = option
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-all',
        isSelected
          ? 'border-sky-400 bg-sky-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500">{form}</span>
        <span className="font-mono text-lg font-semibold text-slate-900">{score.toFixed(1)}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        <Metric label="Keys" value={metrics.totalKeys} />
        <Metric label="GFA" value={`${metrics.gia.toFixed(0)}m²`} />
        <Metric label="Storeys" value={Math.round(metrics.buildingHeight / 3.2 + 1)} />
        <Metric label="$/key" value={`${(metrics.costPerKey / 1000).toFixed(0)}k`} />
        <Metric label="Coverage" value={`${(metrics.coverage * 100).toFixed(0)}%`} />
        <Metric label="Views" value={`${metrics.westFacade.toFixed(0)}m`} />
      </div>
      <div className="mt-2">
        <ComplianceBadge
          isValid={validation.isValid}
          violationCount={validation.violations.length}
          warningCount={validation.warnings.length}
        />
      </div>
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-slate-400">{label}</div>
      <div className="font-mono font-medium text-slate-700">{value}</div>
    </div>
  )
}
