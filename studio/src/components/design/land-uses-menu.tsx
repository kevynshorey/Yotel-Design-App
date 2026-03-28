'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { LandUseZone } from '@/engine/land-use'
import { displayLabel, totalZoneAreaSqm } from '@/engine/land-use'
import {
  getLandUseZones,
  toggleLandUseVisible,
  LAND_USE_CHANGED_EVENT,
} from '@/store/land-use-store'

function bboxZones(zones: LandUseZone[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const z of zones) {
    for (const ring of z.polygons) {
      for (const p of ring) {
        minX = Math.min(minX, p.x)
        maxX = Math.max(maxX, p.x)
        minY = Math.min(minY, p.y)
        maxY = Math.max(maxY, p.y)
      }
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  const pad = 8
  return {
    minX: minX - pad,
    maxX: maxX + pad,
    minY: minY - pad,
    maxY: maxY + pad,
  }
}

function LandUseMapPreview({ zones }: { zones: LandUseZone[] }) {
  const { minX, maxX, minY, maxY } = useMemo(() => bboxZones(zones), [zones])
  const w = maxX - minX
  const h = maxY - minY
  const vbW = 280
  const vbH = Math.max(140, (vbW * h) / Math.max(w, 1))

  const toSvg = (p: { x: number; y: number }) => ({
    x: ((p.x - minX) / Math.max(w, 1)) * vbW,
    y: ((p.y - minY) / Math.max(h, 1)) * vbH,
  })

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        Site preview
      </p>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ maxHeight: 160 }}>
        <rect width={vbW} height={vbH} fill="#020617" rx={4} />
        {zones.map((z) =>
          z.polygons.map((ring, ri) => {
            if (!z.visible || ring.length < 2) return null
            const pts = ring.map((p) => {
              const s = toSvg(p)
              return `${s.x},${s.y}`
            })
            const d = `M ${pts.join(' L ')} Z`
            return (
              <path
                key={`${z.id}-${ri}`}
                d={d}
                fill={z.color}
                fillOpacity={0.35}
                stroke={z.color}
                strokeWidth={1}
              />
            )
          }),
        )}
      </svg>
    </div>
  )
}

interface LandUsesMenuProps {
  open: boolean
  onClose: () => void
  onGenerateNew: () => void
}

export function LandUsesMenu({ open, onClose, onGenerateNew }: LandUsesMenuProps) {
  const [zones, setZones] = useState<LandUseZone[]>(() => getLandUseZones())

  const refresh = useCallback(() => setZones([...getLandUseZones()]), [])

  useEffect(() => {
    refresh()
    window.addEventListener(LAND_USE_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(LAND_USE_CHANGED_EVENT, refresh)
  }, [refresh, open])

  if (!open) return null

  return (
    <div className="absolute bottom-[4.5rem] left-2 right-2 z-40 md:bottom-[5.5rem] md:left-auto md:right-4 md:w-[340px]">
      <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-200">Land uses</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onGenerateNew()
            onClose()
          }}
          className="mb-3 w-full rounded-lg border border-violet-500/50 bg-violet-950/40 px-3 py-2 text-left text-xs font-semibold text-violet-200 transition hover:bg-violet-900/50"
        >
          + Generate new
          <span className="mt-0.5 block text-[10px] font-normal text-violet-400/80">
            3D site map — draw boundaries (multi-ring)
          </span>
        </button>

        <LandUseMapPreview zones={zones} />

        <ul className="mt-3 space-y-1.5">
          {zones.map((z) => (
            <li key={z.id}>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={z.visible}
                  onChange={() => {
                    toggleLandUseVisible(z.id)
                    refresh()
                  }}
                  className="mt-0.5 rounded border-slate-600"
                />
                <span
                  className="mt-1 h-3 w-3 flex-shrink-0 rounded-sm border border-white/20"
                  style={{ backgroundColor: z.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-slate-200">{displayLabel(z)}</span>
                  <span className="text-[10px] text-slate-500">
                    {z.polygons.length} ring{z.polygons.length !== 1 ? 's' : ''} ·{' '}
                    {totalZoneAreaSqm(z).toLocaleString('en-US', { maximumFractionDigits: 0 })} m²
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
