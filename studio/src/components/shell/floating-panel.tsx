import { cn } from '@/lib/utils'

interface FloatingPanelProps {
  children: React.ReactNode
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const positionClasses = {
  'top-left': 'md:top-3 md:left-3',
  'top-right': 'md:top-3 md:right-3',
  'bottom-left': 'md:bottom-3 md:left-3',
  'bottom-right': 'md:bottom-3 md:right-3',
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
        position && `md:absolute ${positionClasses[position]} md:z-10`,
        className,
      )}
    >
      {children}
    </div>
  )
}
