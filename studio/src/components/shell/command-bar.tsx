'use client'

import { useState, useEffect } from 'react'
import { getSelectedOption } from '@/store/design-store'
import type { DesignOption } from '@/engine/types'

export function CommandBar() {
  const [option, setOption] = useState<DesignOption | null>(null)

  useEffect(() => {
    setOption(getSelectedOption())

    const handler = () => setOption(getSelectedOption())
    window.addEventListener('design-option-changed', handler)
    return () => window.removeEventListener('design-option-changed', handler)
  }, [])

  const keysLabel = option ? `${option.metrics.totalKeys} keys` : '130 keys'
  const tdcLabel = option
    ? `$${(option.cost.total / 1_000_000).toFixed(1)}M TDC`
    : '$55M TDC est.'

  return (
    <div className="flex h-10 items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white/80 px-2 md:px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-slate-900 truncate">YOTEL Barbados</span>
        <span className="hidden md:inline text-xs text-slate-500 truncate">Carlisle Bay, Bridgetown</span>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
        <span className="font-mono">{keysLabel}</span>
        <span>·</span>
        <span className="font-mono">{tdcLabel}</span>
      </div>
    </div>
  )
}
