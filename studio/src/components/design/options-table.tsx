'use client'

import { useState, useMemo } from 'react'
import { X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DesignOption } from '@/engine/types'

interface OptionsTableProps {
  options: DesignOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

type SortKey =
  | 'id'
  | 'form'
  | 'keys'
  | 'height'
  | 'coverage'
  | 'giaPerKey'
  | 'costPerKey'
  | 'yoc'
  | 'score'
  | 'compliance'

type SortDir = 'asc' | 'desc'

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function getYoc(option: DesignOption): number {
  return option.cost.total > 0
    ? (option.revenue.stabilisedNoi / option.cost.total) * 100
    : 0
}

function getSortValue(option: DesignOption, key: SortKey): number | string {
  switch (key) {
    case 'id':
      return option.id
    case 'form':
      return option.form
    case 'keys':
      return option.metrics.totalKeys
    case 'height':
      return option.metrics.buildingHeight
    case 'coverage':
      return option.metrics.coverage
    case 'giaPerKey':
      return option.metrics.giaPerKey
    case 'costPerKey':
      return option.metrics.costPerKey
    case 'yoc':
      return getYoc(option)
    case 'score':
      return option.score
    case 'compliance':
      return option.validation.isValid ? 1 : 0
  }
}

const COLUMNS: { key: SortKey; label: string; align?: 'right' | 'center' }[] = [
  { key: 'id', label: 'ID' },
  { key: 'form', label: 'Form' },
  { key: 'keys', label: 'Keys', align: 'right' },
  { key: 'height', label: 'Height (m)', align: 'right' },
  { key: 'coverage', label: 'Coverage (%)', align: 'right' },
  { key: 'giaPerKey', label: 'GIA/Key (m\u00B2)', align: 'right' },
  { key: 'costPerKey', label: '$/Key', align: 'right' },
  { key: 'yoc', label: 'YoC (%)', align: 'right' },
  { key: 'score', label: 'Score', align: 'right' },
  { key: 'compliance', label: 'Compliance', align: 'center' },
]

export function OptionsTable({
  options,
  selectedId,
  onSelect,
  isOpen,
  onClose,
}: OptionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...options]
    copy.sort((a, b) => {
      const va = getSortValue(a, sortKey)
      const vb = getSortValue(b, sortKey)
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      const na = va as number
      const nb = vb as number
      return sortDir === 'asc' ? na - nb : nb - na
    })
    return copy
  }, [options, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-100">Design Options</h2>
          <span className="text-xs text-slate-500">&mdash;</span>
          <span className="text-xs text-slate-400">
            {options.length} design option{options.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-slate-900">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    'cursor-pointer select-none border-b border-slate-700/50 px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 hover:text-sky-400 transition-colors',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((opt) => {
              const isSelected = opt.id === selectedId
              const yoc = getYoc(opt)
              const yocColor =
                yoc > 8
                  ? 'text-emerald-400'
                  : yoc >= 6
                    ? 'text-sky-400'
                    : yoc >= 4
                      ? 'text-amber-400'
                      : 'text-red-400'

              return (
                <tr
                  key={opt.id}
                  onClick={() => onSelect(opt.id)}
                  className={cn(
                    'cursor-pointer border-b border-slate-800/40 transition-colors',
                    isSelected
                      ? 'bg-sky-500/20 hover:bg-sky-500/30'
                      : 'hover:bg-slate-800/60',
                  )}
                >
                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {opt.id}
                  </td>

                  {/* Form */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                        opt.form === 'BAR' || opt.form === 'BAR_NS'
                          ? 'bg-blue-900/40 text-blue-300'
                          : opt.form === 'L'
                            ? 'bg-emerald-900/40 text-emerald-300'
                            : opt.form === 'U'
                              ? 'bg-violet-900/40 text-violet-300'
                              : 'bg-amber-900/40 text-amber-300',
                      )}
                    >
                      {opt.form}
                    </span>
                  </td>

                  {/* Keys */}
                  <td className="px-4 py-3 text-right font-mono text-slate-200">
                    {opt.metrics.totalKeys}
                  </td>

                  {/* Height */}
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    {opt.metrics.buildingHeight.toFixed(1)}
                  </td>

                  {/* Coverage */}
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    {(opt.metrics.coverage * 100).toFixed(1)}
                  </td>

                  {/* GIA/Key */}
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    {opt.metrics.giaPerKey.toFixed(1)}
                  </td>

                  {/* $/Key */}
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    {formatCurrency(opt.metrics.costPerKey)}
                  </td>

                  {/* YoC */}
                  <td className={cn('px-4 py-3 text-right font-mono font-medium', yocColor)}>
                    {yoc.toFixed(1)}
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-sky-400">
                    {opt.score.toFixed(1)}
                  </td>

                  {/* Compliance */}
                  <td className="px-4 py-3 text-center">
                    {opt.validation.isValid ? (
                      <span className="inline-block rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300 ring-1 ring-emerald-800/50">
                        PASS
                      </span>
                    ) : opt.validation.violations.length > 0 ? (
                      <span className="inline-block rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-300 ring-1 ring-red-800/50">
                        FAIL
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300 ring-1 ring-amber-800/50">
                        WARN
                      </span>
                    )}
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
