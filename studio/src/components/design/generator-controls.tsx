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

  // Hide entirely for non-admin users — a disabled generate button has no value for investors
  if (!allowed) return null

  return (
    <div className="absolute bottom-14 left-3 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-1.5 shadow-lg backdrop-blur-xl">
      <span className="text-[10px] font-semibold text-slate-400">Generator</span>
      <Button
        size="sm"
        onClick={onGenerate}
        disabled={isGenerating}
        className="h-6 gap-1 px-2 text-[10px]"
      >
        {isGenerating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        {isGenerating ? 'Running...' : 'Generate'}
      </Button>
    </div>
  )
}
