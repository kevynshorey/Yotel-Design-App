'use client'

import { Button } from '@/components/ui/button'
import { FloatingPanel } from '@/components/shell/floating-panel'
import { Loader2, Play } from 'lucide-react'
import { useUser, canGenerate } from '@/lib/auth'

interface GeneratorControlsProps {
  onGenerate: () => void
  isGenerating: boolean
}

export function GeneratorControls({ onGenerate, isGenerating }: GeneratorControlsProps) {
  const user = useUser()
  const allowed = canGenerate(user)

  return (
    <FloatingPanel position="bottom-left" className="w-72">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Generator</h3>
        <div className="relative group">
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating || !allowed}
            className="h-7 gap-1 text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          {!allowed && (
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              View-only access
            </div>
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        {!allowed
          ? 'You have view-only access. Contact an admin to generate options.'
          : isGenerating
            ? 'Evaluating combinations across parameter space...'
            : 'Sweeps 5 form types across parameter space. Takes ~2 seconds.'}
      </p>
    </FloatingPanel>
  )
}
