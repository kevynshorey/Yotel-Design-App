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
        'rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/92 px-3 py-2 shadow-lg backdrop-blur-xl',
        position && `absolute ${positionClasses[position]}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
