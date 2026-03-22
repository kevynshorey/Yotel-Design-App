'use client'

import { useState } from 'react'
import {
  Box,
  LayoutGrid,
  ArrowUp,
  ArrowLeft,
  Maximize2,
  Footprints,
  Video,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ChevronDown,
  ChevronUp,
  Settings2,
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
  onWalkthrough: () => void
  onCinematic: () => void
  isWalking: boolean
  isCinematic: boolean
  timeOfDay: string
  onTimeOfDayChange: (time: string) => void
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

const TIME_PRESETS = [
  { id: 'morning', label: 'Morning', Icon: Sunrise },
  { id: 'midday', label: 'Midday', Icon: Sun },
  { id: 'sunset', label: 'Sunset', Icon: Sunset },
  { id: 'night', label: 'Night', Icon: Moon },
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
      className={`rounded-lg p-1.5 transition-colors ${
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
      className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[10px] transition-colors hover:bg-white/10"
    >
      <span className="text-white/70">{label}</span>
      <span
        className={`h-3.5 w-7 rounded-full transition-colors ${
          active ? 'bg-sky-500' : 'bg-white/20'
        } relative`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform ${
            active ? 'translate-x-3.5' : 'translate-x-0.5'
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
  onWalkthrough,
  onCinematic,
  isWalking,
  isCinematic,
  timeOfDay,
  onTimeOfDayChange,
}: ViewerControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Collapsed: just a small gear button
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Viewer Controls"
        className="absolute right-3 top-3 z-10 rounded-xl border border-white/10 bg-slate-900/85 p-2 shadow-lg backdrop-blur-xl text-white/70 hover:text-white transition-colors"
      >
        <Settings2 size={16} />
      </button>
    )
  }

  return (
    <div className="absolute right-3 top-3 z-[15] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 max-w-[200px]">
      {/* Header with close */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          Controls
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded p-0.5 text-white/40 hover:bg-white/10 hover:text-white/80"
        >
          <ChevronUp size={12} />
        </button>
      </div>

      {/* Camera Presets */}
      <div>
        <div className="px-1 pb-0.5 text-[9px] font-medium uppercase tracking-wider text-white/30">
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
              <Icon size={14} />
            </IconButton>
          ))}
        </div>
      </div>

      {/* View Options */}
      <div className="border-t border-white/10" />
      <div className="flex flex-col gap-0.5">
        <ToggleRow label="Boundaries" active={showBoundaries} onToggle={onToggleBoundaries} />
        <ToggleRow label="Amenities" active={showAmenities} onToggle={onToggleAmenities} />
        <ToggleRow label="Exploded" active={explodedView} onToggle={onToggleExploded} />
      </div>

      {/* Expand/collapse for additional controls */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-center gap-1 rounded-lg py-0.5 text-[9px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {expanded ? 'Less' : 'More'}
      </button>

      {expanded && (
        <>
          {/* Walkthrough & Cinematic */}
          <div className="border-t border-white/10" />
          <div>
            <div className="px-1 pb-0.5 text-[9px] font-medium uppercase tracking-wider text-white/30">
              Walkthrough
            </div>
            <div className="flex gap-0.5">
              <IconButton
                active={isWalking}
                onClick={onWalkthrough}
                title={isWalking ? 'Exit walkthrough (ESC)' : 'First-person walkthrough'}
              >
                <Footprints size={14} />
              </IconButton>
              <IconButton
                active={isCinematic}
                onClick={onCinematic}
                title={isCinematic ? 'Stop fly-around' : 'Cinematic fly-around'}
              >
                <Video size={14} />
              </IconButton>
            </div>
            {isWalking && (
              <div className="mt-1 rounded bg-sky-500/10 px-2 py-0.5 text-[9px] text-sky-400">
                WASD to move, ESC to exit
              </div>
            )}
            {isCinematic && (
              <div className="mt-1 rounded bg-sky-500/10 px-2 py-0.5 text-[9px] text-sky-400">
                Cinematic playing...
              </div>
            )}
          </div>

          {/* Time of Day */}
          <div className="border-t border-white/10" />
          <div>
            <div className="px-1 pb-0.5 text-[9px] font-medium uppercase tracking-wider text-white/30">
              Time of Day
            </div>
            <div className="flex gap-0.5">
              {TIME_PRESETS.map(({ id, label, Icon }) => (
                <IconButton
                  key={id}
                  active={timeOfDay === id}
                  onClick={() => onTimeOfDayChange(id)}
                  title={label}
                >
                  <Icon size={14} />
                </IconButton>
              ))}
            </div>
          </div>

          {/* Basemap */}
          <div className="border-t border-white/10" />
          <div>
            <div className="px-1 pb-0.5 text-[9px] font-medium uppercase tracking-wider text-white/30">
              Basemap
            </div>
            <div className="flex gap-0.5">
              {BASEMAP_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onBasemapChange(id)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] transition-colors ${
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
        </>
      )}
    </div>
  )
}
