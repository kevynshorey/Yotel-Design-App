'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import type { DesignOption, FormType } from '@/engine/types'
import { OptionCard } from './option-card'
import { cn } from '@/lib/utils'

interface OptionsSidebarProps {
  options: DesignOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  compareMode?: boolean
  compareTargetId?: string | null
}

type SortKey = 'score' | 'cost' | 'keys' | 'yield'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: 'Score' },
  { key: 'cost', label: 'Cost' },
  { key: 'keys', label: 'Keys' },
  { key: 'yield', label: 'Yield' },
]

const FORM_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'BAR', label: 'BAR' },
  { key: 'BAR_NS', label: 'BAR_NS' },
  { key: 'L', label: 'L' },
  { key: 'U', label: 'U' },
  { key: 'C', label: 'C' },
]

export function OptionsSidebar({ options, selectedId, onSelect, compareMode, compareTargetId }: OptionsSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('score')
  const [filterForm, setFilterForm] = useState<string>('all')

  // Filter + sort logic
  const filtered = options
    .filter(o => filterForm === 'all' || o.form === filterForm)

  // Separate curated from sweep, preserving curated order when filter is "All"
  const curatedOptions = filtered.filter(o => !!o.curatedName)
  const sweepOptions = filtered.filter(o => !o.curatedName)

  // Sort sweep options by selected sort key
  sweepOptions.sort((a, b) => {
    switch (sortBy) {
      case 'cost': return a.metrics.costPerKey - b.metrics.costPerKey
      case 'keys': return b.metrics.totalKeys - a.metrics.totalKeys
      case 'yield': {
        const ya = a.cost.total > 0 ? a.revenue.stabilisedNoi / a.cost.total : 0
        const yb = b.cost.total > 0 ? b.revenue.stabilisedNoi / b.cost.total : 0
        return yb - ya
      }
      default: return b.score - a.score
    }
  })

  // Sort curated by sort key too (but recommended always first)
  curatedOptions.sort((a, b) => {
    const aRec = a.curatedId === 'beacon' ? 1 : 0
    const bRec = b.curatedId === 'beacon' ? 1 : 0
    if (aRec !== bRec) return bRec - aRec
    switch (sortBy) {
      case 'cost': return a.metrics.costPerKey - b.metrics.costPerKey
      case 'keys': return b.metrics.totalKeys - a.metrics.totalKeys
      case 'yield': {
        const ya = a.cost.total > 0 ? a.revenue.stabilisedNoi / a.cost.total : 0
        const yb = b.cost.total > 0 ? b.revenue.stabilisedNoi / b.cost.total : 0
        return yb - ya
      }
      default: return b.score - a.score
    }
  })

  const sidebarContent = (
    <>
      <div className="border-b border-slate-700/50 px-3 py-2">
        <h3 className="text-xs font-semibold text-slate-100">
          {filtered.length} of {options.length} Options
          {compareMode && (
            <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-600">
              Compare Mode
            </span>
          )}
        </h3>
        {/* Sort pills */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                sortBy === s.key
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {/* Form filter pills */}
        <div className="mt-1 flex flex-wrap gap-1">
          {FORM_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterForm(f.key)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                filterForm === f.key
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-2">
          {curatedOptions.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Architect&apos;s Options
                </span>
                <span className="flex-1 border-t border-sky-500/30" />
              </div>
              {curatedOptions.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={opt.id === selectedId}
                  onSelect={onSelect}
                  compareMode={compareMode}
                  isCompareTarget={opt.id === compareTargetId}
                />
              ))}
            </>
          )}
          {sweepOptions.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Parametric Sweep
                </span>
                <span className="flex-1 border-t border-slate-700" />
              </div>
              {sweepOptions.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={opt.id === selectedId}
                  onSelect={onSelect}
                  compareMode={compareMode}
                  isCompareTarget={opt.id === compareTargetId}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar (md+) */}
      <div className={cn(
        'relative hidden md:flex h-full min-h-0 flex-col border-l border-slate-700/50 bg-slate-900/90 backdrop-blur-sm transition-all',
        isOpen ? 'w-60' : 'w-0',
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-8 top-3 z-10 h-6 w-6 rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-sm hover:bg-slate-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
        {isOpen && sidebarContent}
      </div>

      {/* Mobile bottom sheet (< md) */}
      <div className={cn(
        'fixed inset-x-0 bottom-14 z-30 flex flex-col md:hidden',
        'border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm transition-all duration-300',
        mobileExpanded ? 'h-[60vh]' : 'h-12',
      )}>
        {/* Drag handle / toggle */}
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex items-center justify-center gap-2 px-3 py-2 flex-shrink-0"
        >
          <div className="h-1 w-8 rounded-full bg-slate-600" />
          <span className="text-[10px] font-semibold text-slate-300">
            {filtered.length} Options
          </span>
          <ChevronRight className={cn('h-3 w-3 text-slate-400 transition-transform', mobileExpanded ? 'rotate-[-90deg]' : 'rotate-90')} />
        </button>
        {mobileExpanded && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {sidebarContent}
          </div>
        )}
      </div>
    </>
  )
}
