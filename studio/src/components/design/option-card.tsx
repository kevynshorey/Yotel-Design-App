import type { DesignOption } from '@/engine/types'
import { ComplianceBadge } from './compliance-badge'
import { Droplets, Sun, Wine, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  option: DesignOption
  isSelected: boolean
  onSelect: (id: string) => void
  isCompareTarget?: boolean
  compareMode?: boolean
}

export function OptionCard({ option, isSelected, onSelect, isCompareTarget, compareMode }: OptionCardProps) {
  const { metrics, score, validation, form } = option
  const showCompareHint = compareMode && !isSelected && !isCompareTarget
  const isCurated = !!option.curatedName
  const isRecommended = option.curatedId === 'beacon'

  const yocValue = option.cost.total > 0
    ? option.revenue.stabilisedNoi / option.cost.total * 100
    : 0
  const yieldOnCost = option.cost.total > 0 ? yocValue.toFixed(1) : '\u2014'
  const yocColor = yocValue > 8 ? 'text-emerald-500' : yocValue >= 6 ? 'text-sky-500' : yocValue >= 4 ? 'text-amber-500' : 'text-red-500'

  return (
    <button
      onClick={() => onSelect(option.id)}
      className={cn(
        'group relative w-full rounded-lg border p-3 text-left transition-all',
        isSelected
          ? 'border-sky-400 bg-sky-50 shadow-sm'
          : isCompareTarget
            ? 'border-amber-400 bg-amber-50 shadow-sm'
            : isCurated
              ? 'border-sky-500/30 bg-white hover:border-sky-400/50'
              : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      {/* Compare badges */}
      {isSelected && compareMode && (
        <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-[10px] font-bold text-white shadow">
          A
        </span>
      )}
      {isCompareTarget && (
        <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shadow">
          B
        </span>
      )}
      {/* Hover hint for compare mode */}
      {showCompareHint && (
        <span className="absolute -right-1 -top-1 z-10 hidden items-center rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-medium text-white shadow group-hover:flex">
          Compare
        </span>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isCurated ? (
            <span className="flex items-center gap-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              <Star className="h-3 w-3 fill-sky-500 text-sky-500" />
              {option.curatedName}
            </span>
          ) : (
            <span className={cn(
              'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
              form === 'BAR' || form === 'BAR_NS' ? 'bg-blue-100 text-blue-700' :
              form === 'L' ? 'bg-emerald-100 text-emerald-700' :
              form === 'U' ? 'bg-violet-100 text-violet-700' :
              'bg-amber-100 text-amber-700',
            )}>{form}</span>
          )}
          {isRecommended && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
              Recommended
            </span>
          )}
        </div>
        <span className="font-mono text-lg font-semibold text-slate-900">{score.toFixed(1)}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        <Metric label="Keys" value={metrics.totalKeys} />
        <Metric label="GFA" value={`${metrics.gia.toFixed(0)}m²`} />
        <Metric label="Storeys" value={Math.round(metrics.buildingHeight / 3.2 + 1)} />
        <Metric label="$/key" value={`${(metrics.costPerKey / 1000).toFixed(0)}k`} />
        <div>
          <div className="text-slate-400">YoC</div>
          <div className={cn('font-mono font-medium', yocColor)}>{yieldOnCost}%</div>
        </div>
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
