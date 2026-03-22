import { cn } from '@/lib/utils'

interface FloatingPanelProps {
  children: React.ReactNode
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const positionClasses = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
}

export function FloatingPanel({ children, className, position }: FloatingPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-lg backdrop-blur-xl',
        'max-h-[40vh] overflow-y-auto',
        'pointer-events-auto',
        position && `absolute ${positionClasses[position]} z-10`,
        className,
      )}
    >
      {children}
    </div>
  )
}
