'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { DesignOption } from '@/engine/types'

interface MetricsPanelProps {
  option: DesignOption | null
}

export function MetricsPanel({ option }: MetricsPanelProps) {
  const [expanded, setExpanded] = useState(false)

  if (!option) {
    return (
      <div className="absolute left-3 top-3 z-10 rounded-xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-lg backdrop-blur-xl">
        <p className="text-[10px] text-slate-500">No option selected</p>
      </div>
    )
  }

  const { metrics, amenities } = option

  return (
    <div className="absolute left-3 top-3 z-10 rounded-xl border border-white/10 bg-slate-900/85 shadow-lg backdrop-blur-xl">
      {/* Collapsed: 1-line summary + toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Metrics
        </span>
        {!expanded && (
          <span className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="font-mono font-medium text-sky-400">{metrics.totalKeys}</span>
            <span className="text-slate-500">keys</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono font-medium text-sky-400">{Math.round(metrics.gia).toLocaleString()}</span>
            <span className="text-slate-500">m² GFA</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono font-medium text-sky-400">{metrics.buildingHeight.toFixed(1)}m</span>
          </span>
        )}
        {expanded ? (
          <ChevronUp size={12} className="ml-auto flex-shrink-0 text-slate-500" />
        ) : (
          <ChevronDown size={12} className="ml-auto flex-shrink-0 text-slate-500" />
        )}
      </button>

      {/* Expanded: full metrics grid */}
      {expanded && (
        <div className="border-t border-white/10 px-3 pb-2 pt-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <Metric label="Keys" value={metrics.totalKeys} />
            <Metric label="YOTEL" value={metrics.yotelKeys} />
            <Metric label="YOTELPAD" value={metrics.padUnits} />
            <Metric label="GFA" value={`${Math.round(metrics.gia).toLocaleString()} m²`} />
            <Metric label="Coverage" value={`${(metrics.coverage * 100).toFixed(1)}%`} />
            <Metric label="Height" value={`${metrics.buildingHeight.toFixed(1)}m`} />
          </div>
          {amenities && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <Metric label="Pool Area" value={`${amenities.pool.waterArea} m²`} />
                <Metric label="Loungers" value={amenities.loungerCapacity} />
                <Metric label="Rooftop Deck" value={`${amenities.rooftopDeck.totalArea} m²`} />
                <Metric label="Restaurant" value={`${amenities.restaurant.totalSeats} seats`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-medium text-slate-100">{value}</span>
    </div>
  )
}
