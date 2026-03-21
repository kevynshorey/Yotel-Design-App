'use client'

import { Slider } from '@/components/ui/slider'

interface FinanceControlsProps {
  ytRooms: number
  padUnits: number
  years: number
  onYtRoomsChange: (v: number) => void
  onPadUnitsChange: (v: number) => void
  onYearsChange: (v: number) => void
}

export function FinanceControls({
  ytRooms,
  padUnits,
  years,
  onYtRoomsChange,
  onPadUnitsChange,
  onYearsChange,
}: FinanceControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <ControlRow
        label="YOTEL Rooms"
        value={ytRooms}
        min={20}
        max={200}
        step={5}
        onChange={onYtRoomsChange}
      />
      <ControlRow
        label="YOTELPAD Units"
        value={padUnits}
        min={0}
        max={100}
        step={5}
        onChange={onPadUnitsChange}
      />
      <ControlRow
        label="Projection Years"
        value={years}
        min={3}
        max={10}
        step={1}
        onChange={onYearsChange}
        format={(v) => `${v} yrs`}
      />
      <div className="flex items-center gap-4 text-xs">
        <span className="text-slate-400">Total: <span className="font-mono font-semibold text-slate-100">{ytRooms + padUnits}</span> keys</span>
        <span className="text-slate-400">PAD: <span className="font-mono font-semibold text-slate-100">{(ytRooms + padUnits > 0 ? ((padUnits / (ytRooms + padUnits)) * 100).toFixed(0) : 0)}%</span></span>
      </div>
    </div>
  )
}

function ControlRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="flex flex-col gap-1.5 w-44">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="font-mono text-xs font-semibold text-slate-100">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vals) => {
          const arr = vals as readonly number[]
          if (arr[0] !== undefined) onChange(arr[0])
        }}
      />
    </div>
  )
}
