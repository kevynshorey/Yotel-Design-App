import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption } from '@/engine/types'

interface MetricsPanelProps {
  option: DesignOption | null
}

export function MetricsPanel({ option }: MetricsPanelProps) {
  if (!option) return null

  const { metrics } = option
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
