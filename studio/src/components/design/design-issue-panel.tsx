'use client'

import { useState, useCallback } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addIssue,
  getIssues,
  toggleIssueStatus,
  clearIssues,
  type DesignIssue,
  type IssuePriority,
} from '@/store/design-issues-store'

interface DesignIssuePanelProps {
  isOpen: boolean
  onClose: () => void
  scopeId: string
}

const priorityColors: Record<IssuePriority, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export function DesignIssuePanel({ isOpen, onClose, scopeId }: DesignIssuePanelProps) {
  const [issues, setIssues] = useState<DesignIssue[]>(() => getIssues(scopeId))
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [priority, setPriority] = useState<IssuePriority>('medium')
  const [showForm, setShowForm] = useState(false)

  const refresh = useCallback(() => {
    setIssues(getIssues(scopeId))
  }, [scopeId])

  const openCount = issues.filter((i) => i.status === 'open').length
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length

  function handleAdd() {
    if (!title.trim()) return
    addIssue(scopeId, { title, detail, priority })
    setTitle('')
    setDetail('')
    setPriority('medium')
    setShowForm(false)
    refresh()
  }

  function handleToggle(id: number) {
    toggleIssueStatus(scopeId, id)
    refresh()
  }

  function handleClear() {
    clearIssues(scopeId)
    refresh()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-100">Issues</h2>
          <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
            {openCount}
          </span>
          <span className="rounded-full bg-slate-500/20 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            {resolvedCount} done
          </span>
        </div>
        <div className="flex items-center gap-1">
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
          Log issue
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="border-b border-white/10 px-4 py-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title"
            maxLength={200}
            className="mb-2 w-full rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detail (optional)"
            maxLength={1000}
            rows={2}
            className="mb-2 w-full resize-none rounded-md border border-white/10 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
          <div className="mb-2 flex gap-1">
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize transition-colors',
                  priority === p ? priorityColors[p] : 'border-white/10 text-slate-500',
                )}
              >
                {p}
              </button>
            ))}
          </div>
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

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {issues.length === 0 && (
          <p className="text-center text-xs text-slate-500">No issues recorded.</p>
        )}
        <div className="flex flex-col gap-2">
          {[...issues].reverse().map((issue) => (
            <button
              key={issue.id}
              type="button"
              onClick={() => handleToggle(issue.id)}
              className={cn(
                'w-full rounded-lg border border-white/5 bg-slate-800/60 px-3 py-2 text-left transition-colors hover:bg-slate-800',
                issue.status === 'resolved' && 'opacity-50',
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border',
                    issue.status === 'open' ? 'border-slate-500 bg-transparent' : 'border-slate-500 bg-slate-400',
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        issue.status === 'resolved' ? 'text-slate-500 line-through' : 'text-slate-200',
                      )}
                    >
                      {issue.title}
                    </span>
                    <span
                      className={cn(
                        'rounded border px-1 py-px text-[9px] font-medium uppercase',
                        priorityColors[issue.priority],
                      )}
                    >
                      {issue.priority}
                    </span>
                  </div>
                  {issue.detail && (
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                      {issue.detail}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
