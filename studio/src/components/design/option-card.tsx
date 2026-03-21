import type { DesignOption } from '@/engine/types'
import { ComplianceBadge } from './compliance-badge'
import { Droplets, Sun, Wine } from 'lucide-react'
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
        <span className={cn(
          'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
          form === 'BAR' || form === 'BAR_NS' ? 'bg-blue-100 text-blue-700' :
          form === 'L' ? 'bg-emerald-100 text-emerald-700' :
          form === 'U' ? 'bg-violet-100 text-violet-700' :
          'bg-amber-100 text-amber-700',
        )}>{form}</span>
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
      {option.amenities && (
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-0.5" title="Pool water area">
            <Droplets className="h-3 w-3 text-sky-400" />
            {option.amenities.pool.waterArea}m²
          </span>
          <span className="flex items-center gap-0.5" title="Lounger capacity">
            <Sun className="h-3 w-3 text-amber-400" />
            {option.amenities.loungerCapacity}
          </span>
          <span className="flex items-center gap-0.5" title="Rooftop deck area">
            <Wine className="h-3 w-3 text-amber-400" />
            {option.amenities.rooftopDeck.totalArea}m²
          </span>
        </div>
      )}
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
