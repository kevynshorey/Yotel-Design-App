'use client'

import {
  Box,
  LayoutGrid,
  ArrowUp,
  ArrowLeft,
  Maximize2,
  Map,
  MapPin,
  Mountain,
  EyeOff,
  Fence,
  Palmtree,
  Layers,
} from 'lucide-react'

interface ViewerControlsProps {
  activePreset: string
  activeBasemap: string
  showBoundaries: boolean
  showAmenities: boolean
  explodedView: boolean
  onCameraChange: (preset: string) => void
  onBasemapChange: (basemap: string) => void
  onToggleBoundaries: () => void
  onToggleAmenities: () => void
  onToggleExploded: () => void
}

const CAMERA_PRESETS = [
  { id: '3D', label: '3D Perspective', Icon: Box },
  { id: 'Plan', label: 'Plan View', Icon: LayoutGrid },
  { id: 'South', label: 'South Elevation', Icon: ArrowUp },
  { id: 'West', label: 'West Elevation', Icon: ArrowLeft },
  { id: 'Overview', label: 'Site Overview', Icon: Maximize2 },
] as const

const BASEMAP_OPTIONS = [
  { id: 'Google', label: 'Google' },
  { id: 'Street', label: 'Street' },
  { id: 'Topo', label: 'Topo' },
  { id: 'None', label: 'None' },
] as const

function IconButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg p-2 transition-colors ${
        active
          ? 'bg-sky-500/20 text-sky-400'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleRow({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/10"
    >
      <span className="text-white/70">{label}</span>
      <span
        className={`h-4 w-8 rounded-full transition-colors ${
          active ? 'bg-sky-500' : 'bg-white/20'
        } relative`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            active ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function ViewerControls({
  activePreset,
  activeBasemap,
  showBoundaries,
  showAmenities,
  explodedView,
  onCameraChange,
  onBasemapChange,
  onToggleBoundaries,
  onToggleAmenities,
  onToggleExploded,
}: ViewerControlsProps) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2">
      {/* Camera Presets */}
      <div>
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Camera
        </div>
        <div className="flex gap-0.5">
          {CAMERA_PRESETS.map(({ id, label, Icon }) => (
            <IconButton
              key={id}
              active={activePreset === id}
              onClick={() => onCameraChange(id)}
              title={label}
            >
              <Icon size={16} />
            </IconButton>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* Basemap */}
      <div>
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Basemap
        </div>
        <div className="flex gap-0.5">
          {BASEMAP_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onBasemapChange(id)}
              className={`rounded-lg px-2 py-1 text-xs transition-colors ${
                activeBasemap === id
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* View Options */}
      <div>
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
          View Options
        </div>
        <div className="flex flex-col gap-0.5">
          <ToggleRow
            label="Show Boundaries"
            active={showBoundaries}
            onToggle={onToggleBoundaries}
          />
          <ToggleRow
            label="Show Amenities"
            active={showAmenities}
            onToggle={onToggleAmenities}
          />
          <ToggleRow
            label="Exploded View"
            active={explodedView}
            onToggle={onToggleExploded}
          />
        </div>
      </div>
    </div>
  )
}
