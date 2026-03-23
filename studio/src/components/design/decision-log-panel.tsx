'use client'

import { useState, useCallback } from 'react'
import { X, Download, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addDecision,
  getDecisions,
  clearDecisions,
  type Decision,
} from '@/store/decision-log-store'

interface DecisionLogPanelProps {
  isOpen: boolean
  onClose: () => void
  scopeId: string
}

export function DecisionLogPanel({ isOpen, onClose, scopeId }: DecisionLogPanelProps) {
  const [decisions, setDecisions] = useState<Decision[]>(() => getDecisions(scopeId))
  const [title, setTitle] = useState('')
  const [rationale, setRationale] = useState('')
  const [impact, setImpact] = useState('')
  const [showForm, setShowForm] = useState(false)

  const refresh = useCallback(() => {
    setDecisions(getDecisions(scopeId))
  }, [scopeId])

  function handleAdd() {
    if (!title.trim()) return
    addDecision(scopeId, { title, rationale, impact })
    setTitle('')
    setRationale('')
    setImpact('')
    setShowForm(false)
    refresh()
  }

  function handleClear() {
    clearDecisions(scopeId)
    refresh()
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(decisions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decisions-${scopeId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">Decision Log</h2>
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
            onClick={handleClear}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400"
            title="Clear all"
          >
            <Trash2 size={14} />
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

      {/* Add form toggle */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mx-4 mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-amber-500/40 hover:text-amber-400"
        >
          <Plus size={12} />
          Add decision
        </button>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="border-b border-white/10 px-4 py-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Decision title"
            maxLength={200}
            className="mb-2 w-full rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Rationale"
            maxLength={1000}
            rows={2}
            className="mb-2 w-full resize-none rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <textarea
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            placeholder="Impact"
            maxLength={1000}
            rows={2}
            className="mb-2 w-full resize-none rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!title.trim()}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md px-3 py-1 text-xs text-slate-400 transition-colors hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {decisions.length === 0 && (
          <p className="text-center text-xs text-slate-500">No decisions recorded yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {[...decisions].reverse().map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-medium text-slate-200">{d.title}</h4>
                <span className="ml-2 shrink-0 text-[10px] text-slate-500">
                  {new Date(d.timestamp).toLocaleDateString()}
                </span>
              </div>
              {d.rationale && (
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{d.rationale}</p>
              )}
              {d.impact && (
                <p className={cn('mt-1 text-[10px] leading-relaxed text-amber-400/80')}>
                  Impact: {d.impact}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
