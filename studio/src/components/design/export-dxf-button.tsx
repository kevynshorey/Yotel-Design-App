'use client'

import { useCallback, useRef, useState } from 'react'
import { FileDown, ChevronDown, Info, X } from 'lucide-react'
import { downloadDXF, type FloorSelection } from '@/lib/export-dxf'
import type { DesignOption } from '@/engine/types'

interface ExportDxfButtonProps {
  option: DesignOption
}

/** CAD export button with floor selector dropdown and DWG info. */
export function ExportDxfButton({ option }: ExportDxfButtonProps) {
  const [open, setOpen] = useState(false)
  const [showDwgInfo, setShowDwgInfo] = useState(false)
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
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main button */}
        <button
          onClick={() => setOpen((v) => !v)}
          title="CAD Export (DXF / DWG)"
          className="hidden md:flex items-center gap-2 rounded-lg bg-[#0f172a] px-3 py-2 text-xs font-medium text-white shadow-lg transition-colors hover:bg-[#1e293b]"
        >
          <FileDown size={14} />
          CAD Export
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute bottom-full right-0 mb-1 min-w-[180px] rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl z-50">
            {/* DXF floor items */}
            {floorItems.map((item) => (
              <button
                key={String(item.value)}
                onClick={() => handleExport(item.value)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <FileDown size={11} className="shrink-0 text-slate-500" />
                Download DXF — {item.label}
              </button>
            ))}

            {/* Divider */}
            <div className="my-1 border-t border-slate-700/50" />

            {/* DWG info */}
            <button
              onClick={() => {
                setOpen(false)
                setShowDwgInfo(true)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <Info size={11} className="shrink-0" />
              About DWG format
            </button>
          </div>
        )}
      </div>

      {/* DWG Info Modal */}
      {showDwgInfo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDwgInfo(false)}
        >
          <div
            className="mx-4 max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100">About DWG Format</h3>
              </div>
              <button
                onClick={() => setShowDwgInfo(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              DWG is Autodesk&apos;s proprietary format and cannot be generated directly in the
              browser. To get a .dwg file:
            </p>
            <ol className="mt-2 list-decimal pl-4 text-xs leading-relaxed text-slate-300 space-y-1">
              <li>Download the DXF file using the options above.</li>
              <li>Open the DXF in <strong className="text-slate-100">AutoCAD</strong>,{' '}
                <strong className="text-slate-100">BricsCAD</strong>, or{' '}
                <strong className="text-slate-100">FreeCAD</strong>.
              </li>
              <li>Save As <code className="rounded bg-slate-800 px-1 py-0.5 text-amber-300">.dwg</code> format.</li>
            </ol>
            <p className="mt-3 text-[10px] text-slate-500">
              All geometry, layers, and annotations from the DXF are preserved during conversion.
            </p>
            <button
              onClick={() => setShowDwgInfo(false)}
              className="mt-4 w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
