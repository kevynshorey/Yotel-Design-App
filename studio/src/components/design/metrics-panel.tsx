import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption } from '@/engine/types'

interface MetricsPanelProps {
  option: DesignOption | null
}

export function MetricsPanel({ option }: MetricsPanelProps) {
  if (!option) return null

  const { metrics, amenities } = option
  return (
    <FloatingPanel position="top-left">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
      <span className="font-mono font-medium text-slate-900">{value}</span>
    </div>
  )
}
