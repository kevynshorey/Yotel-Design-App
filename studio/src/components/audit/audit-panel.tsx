'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Filter, Search, X, ChevronDown, ChevronRight, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAuditLog,
  type AuditAction,
  type AuditEntry,
} from '@/store/audit-store'

// ── Helpers ─────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<AuditAction, string> = {
  option_selected: 'Selected Option',
  option_generated: 'Generated Options',
  option_favourited: 'Toggled Favourite',
  design_exported: 'Exported Design',
  report_generated: 'Generated Report',
  setting_changed: 'Changed Setting',
  layout_saved: 'Saved Layout',
  version_saved: 'Saved Version',
  comparison_made: 'Compared Options',
  score_viewed: 'Viewed Score',
}

const ACTION_COLORS: Record<AuditAction, string> = {
  option_selected: 'bg-sky-500/20 text-sky-400',
  option_generated: 'bg-emerald-500/20 text-emerald-400',
  option_favourited: 'bg-amber-500/20 text-amber-400',
  design_exported: 'bg-violet-500/20 text-violet-400',
  report_generated: 'bg-violet-500/20 text-violet-400',
  setting_changed: 'bg-slate-500/20 text-slate-400',
  layout_saved: 'bg-teal-500/20 text-teal-400',
  version_saved: 'bg-teal-500/20 text-teal-400',
  comparison_made: 'bg-orange-500/20 text-orange-400',
  score_viewed: 'bg-pink-500/20 text-pink-400',
}

const ALL_ACTIONS: AuditAction[] = [
  'option_selected',
  'option_generated',
  'option_favourited',
  'design_exported',
  'report_generated',
  'setting_changed',
  'layout_saved',
  'version_saved',
  'comparison_made',
  'score_viewed',
]

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

// ── Component ───────────────────────────────────────────────────────────

interface AuditPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AuditPanel({ isOpen, onClose }: AuditPanelProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const refresh = useCallback(() => {
    setEntries(getAuditLog())
  }, [])

  useEffect(() => {
    if (isOpen) refresh()
  }, [isOpen, refresh])

  // Listen for external refresh events
  useEffect(() => {
    const handler = () => { if (isOpen) refresh() }
    window.addEventListener('audit-log-updated', handler)
    return () => window.removeEventListener('audit-log-updated', handler)
  }, [isOpen, refresh])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Filter + search
  const filtered = entries
    .filter((e) => filterAction === 'all' || e.action === filterAction)
    .filter((e) => {
      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase()
      return (
        e.target.toLowerCase().includes(term) ||
        e.userName.toLowerCase().includes(term) ||
        ACTION_LABELS[e.action].toLowerCase().includes(term) ||
        (e.before && e.before.toLowerCase().includes(term)) ||
        (e.after && e.after.toLowerCase().includes(term))
      )
    })

  const displayed = [...filtered].reverse() // newest first

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(displayed, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <ScrollText size={14} className="text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-100">Audit Trail</h2>
          <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            {displayed.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            title="Export JSON"
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="border-b border-white/10 px-4 py-2 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail..."
            maxLength={200}
            className="w-full rounded-md border border-white/10 bg-slate-800 py-1.5 pl-7 pr-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterDropdown((v) => !v)}
            className="flex w-full items-center gap-1.5 rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/20"
          >
            <Filter size={12} className="text-slate-500" />
            <span className="flex-1 text-left">
              {filterAction === 'all'
                ? 'All actions'
                : ACTION_LABELS[filterAction]}
            </span>
            <ChevronDown
              size={12}
              className={cn(
                'text-slate-500 transition-transform',
                showFilterDropdown && 'rotate-180',
              )}
            />
          </button>
          {showFilterDropdown && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-white/10 bg-slate-800 py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setFilterAction('all')
                  setShowFilterDropdown(false)
                }}
                className={cn(
                  'w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/5',
                  filterAction === 'all'
                    ? 'text-sky-400'
                    : 'text-slate-300',
                )}
              >
                All actions
              </button>
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    setFilterAction(action)
                    setShowFilterDropdown(false)
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/5',
                    filterAction === action
                      ? 'text-sky-400'
                      : 'text-slate-300',
                  )}
                >
                  {ACTION_LABELS[action]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <ScrollText size={24} className="text-slate-600" />
            <p className="text-xs text-slate-500">No audit entries found.</p>
            <p className="text-[10px] text-slate-600">
              Actions will be logged as you use the studio.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {displayed.map((entry) => {
            const isExpanded = expandedIds.has(entry.id)
            const hasBefore = entry.before !== undefined && entry.before !== ''
            const hasAfter = entry.after !== undefined && entry.after !== ''
            const hasDetail = hasBefore || hasAfter || Object.keys(entry.metadata).length > 0

            return (
              <div
                key={entry.id}
                className="rounded-lg border border-white/5 bg-slate-800/60"
              >
                <button
                  type="button"
                  onClick={() => hasDetail && toggleExpand(entry.id)}
                  className={cn(
                    'flex w-full items-start gap-2 px-3 py-2 text-left',
                    hasDetail && 'cursor-pointer hover:bg-white/5',
                  )}
                >
                  {hasDetail && (
                    <span className="mt-0.5 flex-shrink-0 text-slate-500">
                      {isExpanded ? (
                        <ChevronDown size={10} />
                      ) : (
                        <ChevronRight size={10} />
                      )}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex rounded px-1.5 py-0.5 text-[9px] font-medium',
                          ACTION_COLORS[entry.action],
                        )}
                      >
                        {ACTION_LABELS[entry.action]}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {relativeTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-300">
                      {entry.target}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      by {entry.userName}
                    </p>
                  </div>
                </button>

                {/* Expandable detail */}
                {isExpanded && hasDetail && (
                  <div className="border-t border-white/5 px-3 py-2 space-y-1">
                    {hasBefore && (
                      <div className="flex gap-1 text-[10px]">
                        <span className="font-medium text-red-400/80">Before:</span>
                        <span className="text-slate-400">{entry.before}</span>
                      </div>
                    )}
                    {hasAfter && (
                      <div className="flex gap-1 text-[10px]">
                        <span className="font-medium text-emerald-400/80">After:</span>
                        <span className="text-slate-400">{entry.after}</span>
                      </div>
                    )}
                    {Object.keys(entry.metadata).length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(entry.metadata).map(([key, val]) => (
                          <div key={key} className="flex gap-1 text-[10px]">
                            <span className="font-medium text-slate-500">
                              {key}:
                            </span>
                            <span className="text-slate-400">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-2">
        <p className="text-[10px] text-slate-600">
          {entries.length}/500 entries (local storage)
        </p>
      </div>
    </div>
  )
}
