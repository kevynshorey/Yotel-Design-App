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
  onWalkthrough,
  onCinematic,
  isWalking,
  isCinematic,
  timeOfDay,
  onTimeOfDayChange,
}: ViewerControlsProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="absolute right-3 top-3 z-[15] flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2 max-w-[200px]">
      {/* Camera Presets — always visible */}
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

      {/* View Options — always visible (the toggles) */}
      <div className="border-t border-white/10" />
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

      {/* Expand/collapse for additional controls */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-center gap-1 rounded-lg py-1 text-[10px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Less' : 'More controls'}
      </button>

      {expanded && (
        <>
          {/* Walkthrough & Cinematic */}
          <div className="border-t border-white/10" />
          <div>
            <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              Walkthrough
            </div>
            <div className="flex gap-0.5">
              <IconButton
                active={isWalking}
                onClick={onWalkthrough}
                title={isWalking ? 'Exit walkthrough (ESC)' : 'First-person walkthrough'}
              >
                <Footprints size={16} />
              </IconButton>
              <IconButton
                active={isCinematic}
                onClick={onCinematic}
                title={isCinematic ? 'Stop fly-around' : 'Cinematic fly-around'}
              >
                <Video size={16} />
              </IconButton>
            </div>
            {isWalking && (
              <div className="mt-1 rounded bg-sky-500/10 px-2 py-1 text-[10px] text-sky-400">
                Click to look, WASD to move, ESC to exit
              </div>
            )}
            {isCinematic && (
              <div className="mt-1 rounded bg-sky-500/10 px-2 py-1 text-[10px] text-sky-400">
                Cinematic fly-around playing...
              </div>
            )}
          </div>

          {/* Time of Day */}
          <div className="border-t border-white/10" />
          <div>
            <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
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
                  <Icon size={16} />
                </IconButton>
              ))}
            </div>
          </div>

          {/* Basemap */}
          <div className="border-t border-white/10" />
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
        </>
      )}
    </div>
  )
}
