import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption } from '@/engine/types'

interface MetricsPanelProps {
  option: DesignOption | null
}

export function MetricsPanel({ option }: MetricsPanelProps) {
  if (!option) {
    return (
      <FloatingPanel position="top-left">
        <div className="flex h-24 w-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700">
          <p className="text-xs text-slate-400">Select an option</p>
          <p className="text-[10px] text-slate-300">to view metrics</p>
        </div>
      </FloatingPanel>
    )
  }

  const { metrics, amenities } = option
  return (
    <FloatingPanel position="top-left" className="w-full md:w-auto">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 md:hidden">Metrics</h3>
      <div className="grid grid-cols-3 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <Metric label="Keys" value={metrics.totalKeys} />
        <Metric label="YOTEL" value={metrics.yotelKeys} />
        <Metric label="YOTELPAD" value={metrics.padUnits} />
        <Metric label="GFA" value={`${Math.round(metrics.gia).toLocaleString()} m²`} />
        <Metric label="Coverage" value={`${(metrics.coverage * 100).toFixed(1)}%`} />
        <Metric label="Height" value={`${metrics.buildingHeight.toFixed(1)}m`} />
      </div>
      {amenities && (
        <div className="mt-2 border-t border-slate-200 pt-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <Metric label="Pool Area" value={`${amenities.pool.waterArea} m²`} />
            <Metric label="Loungers" value={amenities.loungerCapacity} />
            <Metric label="Rooftop Deck" value={`${amenities.rooftopDeck.totalArea} m²`} />
            <Metric label="Restaurant" value={`${amenities.restaurant.totalSeats} seats`} />
          </div>
        </div>
      )}
    </FloatingPanel>
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
