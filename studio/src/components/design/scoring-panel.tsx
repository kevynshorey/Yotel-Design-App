import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption, ScoreBreakdown } from '@/engine/types'
import { cn } from '@/lib/utils'

interface ScoringPanelProps {
  option: DesignOption | null
}

export function ScoringPanel({ option }: ScoringPanelProps) {
  if (!option) {
    return (
      <FloatingPanel position="top-right" className="w-64">
        <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200">
          <p className="text-xs text-slate-400">Select an option</p>
          <p className="text-[10px] text-slate-300">to view scoring</p>
        </div>
      </FloatingPanel>
    )
  }

  return (
    <FloatingPanel position="top-right" className="w-64">
      <h3 className="text-xs font-semibold text-slate-900">
        Score: <span className="font-mono text-base">{option.score.toFixed(1)}</span>
      </h3>
      <div className="mt-2 flex flex-col gap-1">
        {Object.entries(option.scoringBreakdown).map(([key, bd]) => (
          <ScoreRow key={key} name={key} breakdown={bd} />
        ))}
      </div>
    </FloatingPanel>
  )
}

function ScoreRow({ name, breakdown }: { name: string; breakdown: ScoreBreakdown }) {
  const pct = Math.round(breakdown.raw * 100)
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-20 truncate text-slate-500">{name.replace(/_/g, ' ')}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full',
            pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 font-mono text-right text-slate-700">{pct}</span>
    </div>
  )
}
