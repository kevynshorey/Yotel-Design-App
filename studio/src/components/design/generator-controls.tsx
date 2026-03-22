'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Play } from 'lucide-react'
import { canGenerate } from '@/lib/auth'
import { useUser } from '@/lib/use-user'

interface GeneratorControlsProps {
  onGenerate: () => void
  isGenerating: boolean
}

export function GeneratorControls({ onGenerate, isGenerating }: GeneratorControlsProps) {
  const user = useUser()
  const allowed = canGenerate(user)

  return (
    <div className="absolute bottom-14 left-3 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-1.5 shadow-lg backdrop-blur-xl">
      <span className="text-[10px] font-semibold text-slate-400">Generator</span>
      <div className="relative group">
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={isGenerating || !allowed}
          className="h-6 gap-1 px-2 text-[10px]"
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {isGenerating ? 'Running...' : 'Generate'}
        </Button>
        {!allowed && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            View-only access
          </div>
        )}
      </div>
    </div>
  )
}
