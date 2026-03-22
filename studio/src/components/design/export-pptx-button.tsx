'use client'

import { useCallback, useState } from 'react'
import { Presentation } from 'lucide-react'
import type { DesignOption } from '@/engine/types'

interface ExportPptxButtonProps {
  option: DesignOption
}

/** PowerPoint investor deck export button. Uses dynamic import to avoid SSR issues with pptxgenjs. */
export function ExportPptxButton({ option }: ExportPptxButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = useCallback(async () => {
    setLoading(true)
    try {
      const { exportToPPTX } = await import('@/lib/export-pptx')
      await exportToPPTX(option)
    } catch (err) {
      console.error('PPTX export failed:', err)
    } finally {
      setLoading(false)
    }
  }, [option])

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      title="Download Investor Deck (PPTX)"
      className="flex items-center gap-1.5 md:gap-2 rounded-lg bg-[#0f172a] px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-medium text-white shadow-lg transition-colors hover:bg-[#1e293b] disabled:opacity-50 flex-shrink-0"
    >
      {loading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <Presentation size={14} />
      )}
      <span className="hidden sm:inline">{loading ? 'Generating...' : 'PPTX'}</span>
    </button>
  )
}
