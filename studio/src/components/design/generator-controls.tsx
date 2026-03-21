'use client'

import { Button } from '@/components/ui/button'
import { FloatingPanel } from '@/components/shell/floating-panel'
import { Loader2, Play } from 'lucide-react'

interface GeneratorControlsProps {
  onGenerate: () => void
  isGenerating: boolean
}

export function GeneratorControls({ onGenerate, isGenerating }: GeneratorControlsProps) {
  return (
    <FloatingPanel position="bottom-left" className="w-72">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Generator</h3>
        <Button size="sm" onClick={onGenerate} disabled={isGenerating} className="h-7 gap-1 text-xs">
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        {isGenerating
          ? 'Evaluating combinations across parameter space...'
          : 'Sweeps 5 form types across parameter space. Takes ~2 seconds.'}
      </p>
    </FloatingPanel>
  )
}
