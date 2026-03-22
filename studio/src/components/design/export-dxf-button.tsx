'use client'

import { useCallback, useRef, useState } from 'react'
import { FileDown, ChevronDown } from 'lucide-react'
import { downloadDXF, type FloorSelection } from '@/lib/export-dxf'
import type { DesignOption } from '@/engine/types'

interface ExportDxfButtonProps {
  option: DesignOption
}

/** DXF (CAD) export button with floor selector dropdown. */
export function ExportDxfButton({ option }: ExportDxfButtonProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const floorCount = option.floors.length

  const floorItems: { label: string; value: FloorSelection }[] = [
    { label: 'All Floors', value: 'all' },
  ]
  for (let i = 0; i < floorCount; i++) {
    let label: string
    if (i === 0) label = 'Ground Floor'
    else if (i === floorCount - 1) label = 'Rooftop'
    else label = `Floor ${i}`
    floorItems.push({ label, value: i })
  }

  const handleExport = useCallback(
    (selection: FloorSelection) => {
      downloadDXF(option, selection)
      setOpen(false)
    },
    [option],
  )

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200)
  }, [])

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Export DXF (CAD Drawing)"
        className="hidden md:flex items-center gap-2 rounded-lg bg-[#0f172a] px-3 py-2 text-xs font-medium text-white shadow-lg transition-colors hover:bg-[#1e293b]"
      >
        <FileDown size={14} />
        DXF Export
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full right-0 mb-1 min-w-[160px] rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl z-50">
          {floorItems.map((item) => (
            <button
              key={String(item.value)}
              onClick={() => handleExport(item.value)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
