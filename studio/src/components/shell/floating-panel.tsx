import { cn } from '@/lib/utils'

type PanelPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  /** Metrics: top-left but pushed down to avoid command-bar overlap */
  | 'metrics'
  /** Scoring: top-right but pushed down below viewer-controls */
  | 'scoring'
  /** Generator: bottom-left, above action bar */
  | 'generator'

interface FloatingPanelProps {
  children: React.ReactNode
  className?: string
  position?: PanelPosition
}

const positionClasses: Record<PanelPosition, string> = {
  'top-left': 'md:top-3 md:left-3 md:z-10',
  'top-right': 'md:top-3 md:right-3 md:z-10',
  'bottom-left': 'md:bottom-14 md:left-3 md:z-10',
  'bottom-right': 'md:bottom-3 md:right-3 md:z-10',
  // Metrics: top-left corner, below any command bar
  metrics: 'md:top-3 md:left-3 md:z-[12]',
  // Scoring: top-right but pushed below the viewer-controls panel (~320px from top)
  scoring: 'md:top-3 md:right-[220px] md:z-[11]',
  // Generator: bottom-left, above the action-bar row
  generator: 'md:bottom-14 md:left-3 md:z-[12]',
}

export function FloatingPanel({ children, className, position }: FloatingPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-lg backdrop-blur-xl',
        'max-h-[40vh] overflow-y-auto',
        'pointer-events-auto',
        // Mobile: static flow (will be stacked in a scrollable area)
        // md+: absolute positioned floating overlays
        position && `md:absolute ${positionClasses[position]}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
