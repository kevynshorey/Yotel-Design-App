'use client'

import { useState, useCallback, useTransition } from 'react'
import { Viewer3D } from '@/components/viewer/viewer-3d'
import { OptionsSidebar } from '@/components/design/options-sidebar'
import { GeneratorControls } from '@/components/design/generator-controls'
import { MetricsPanel } from '@/components/design/metrics-panel'
import { ScoringPanel } from '@/components/design/scoring-panel'
import { generateAll } from '@/engine/generator'
import type { DesignOption } from '@/engine/types'

export default function DesignPage() {
  const [options, setOptions] = useState<DesignOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedOption = options.find(o => o.id === selectedId) ?? null

  const handleGenerate = useCallback(() => {
    startTransition(() => {
      const generated = generateAll(40)
      setOptions(generated)
      if (generated.length > 0) setSelectedId(generated[0].id)
    })
  }, [])

  return (
    <div className="flex h-full">
      {/* Main viewport */}
      <div className="relative flex-1">
        <Viewer3D selectedOption={selectedOption} className="h-full w-full" />

        {/* Floating overlays */}
        <MetricsPanel option={selectedOption} />
        <ScoringPanel option={selectedOption} />
        <GeneratorControls onGenerate={handleGenerate} isGenerating={isPending} />
      </div>

      {/* Right sidebar */}
      <OptionsSidebar
        options={options}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  )
}
