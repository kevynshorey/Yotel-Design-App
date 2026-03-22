'use client'

import { X } from 'lucide-react'
import type { DesignOption, ScoreBreakdown } from '@/engine/types'
import { cn } from '@/lib/utils'

interface ScoringPanelProps {
  option: DesignOption | null
  isOpen: boolean
  onClose: () => void
}

export function ScoringPanel({ option, isOpen, onClose }: ScoringPanelProps) {
  if (!isOpen || !option) return null

  return (
    <div className="absolute right-3 top-3 z-[15] w-64 rounded-xl border border-white/10 bg-slate-900/90 shadow-lg backdrop-blur-xl transition-all duration-150 ease-out">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold text-slate-100">
          Score: <span className="font-mono text-base text-sky-400">{option.score.toFixed(1)}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
        >
          <X size={14} />
        </button>
      </div>
      <div className="border-t border-white/10 px-3 pb-2 pt-2">
        <div className="flex flex-col gap-1">
          {Object.entries(option.scoringBreakdown).map(([key, bd]) => (
            <ScoreRow key={key} name={key} breakdown={bd} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ScoreRow({ name, breakdown }: { name: string; breakdown: ScoreBreakdown }) {
  const pct = Math.round(breakdown.raw * 100)
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-20 truncate text-slate-400">{name.replace(/_/g, ' ')}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
        <div
          className={cn(
            'h-full rounded-full',
            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 font-mono text-right text-slate-300">{pct}</span>
    </div>
  )
}
