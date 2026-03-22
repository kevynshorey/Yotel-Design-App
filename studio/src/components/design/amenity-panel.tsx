'use client'

import { Droplets, UtensilsCrossed, Sun, Wine } from 'lucide-react'
import type { AmenityProgramme } from '@/engine/amenities'

interface AmenityPanelProps {
  amenities?: AmenityProgramme | null
}

export function AmenityPanel({ amenities }: AmenityPanelProps) {
  if (!amenities) {
    return (
      <div className="w-full md:absolute md:bottom-[120px] md:left-3 md:z-[11] md:w-72 rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-3 py-2.5 backdrop-blur-md">
        <div className="flex h-16 flex-col items-center justify-center">
          <p className="text-xs text-slate-500">Select an option</p>
          <p className="text-[10px] text-slate-600">to view amenity programme</p>
        </div>
      </div>
    )
  }

  const scorePct = Math.round(amenities.amenityScore * 100)

  return (
    <div className="w-full md:absolute md:bottom-[120px] md:left-3 md:z-[11] md:w-72 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200">Amenity Programme</h3>
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-400">
          {scorePct}%
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {/* Pool section */}
        <Section icon={<Droplets className="h-3.5 w-3.5 text-sky-400" />} title="Pool" color="sky">
          <Row label="Water" value={`${amenities.pool.waterArea}m²`} color="sky" />
          <Row label="Deck" value={`${amenities.pool.deckArea}m²`} color="sky" />
          <Row label="Infinity Edge" value={amenities.pool.hasInfinityEdge ? '\u2713' : '\u2717'} color="sky" />
          <Row label="Swim-up Bar" value={amenities.pool.hasSwimUpBar ? '\u2713' : '\u2717'} color="sky" />
        </Section>

        {/* Rooftop section */}
        <Section icon={<Wine className="h-3.5 w-3.5 text-amber-400" />} title="Rooftop" color="amber">
          <Row label="Total" value={`${amenities.rooftopDeck.totalArea}m²`} color="amber" />
          <Row label="Bar" value={`${amenities.rooftopDeck.barArea}m²`} color="amber" />
          <Row
            label="Loungers"
            value={amenities.rooftopDeck.loungerCount.toString()}
            color="amber"
            icon={<Sun className="h-3 w-3 text-amber-400" />}
          />
          <Row label="Rooftop Pool" value={amenities.rooftopDeck.hasPool ? '\u2713' : '\u2717'} color="amber" />
        </Section>

        {/* Restaurant section */}
        <Section
          icon={<UtensilsCrossed className="h-3.5 w-3.5 text-emerald-400" />}
          title="Restaurant"
          color="emerald"
        >
          <Row label="Indoor" value={`${amenities.restaurant.indoorArea}m²`} color="emerald" />
          <Row label="Outdoor" value={`${amenities.restaurant.outdoorArea}m²`} color="emerald" />
          <Row label="Seats" value={amenities.restaurant.totalSeats.toString()} color="emerald" />
        </Section>

        {/* Summary */}
        <div className="border-t border-white/10 pt-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Total Amenity Area</span>
            <span className="font-mono font-medium text-slate-200">
              {amenities.totalAmenityArea.toLocaleString()}m²
            </span>
          </div>
          <div className="mt-0.5 flex justify-between text-[10px]">
            <span className="text-slate-400">Lounger Capacity</span>
            <span className="font-mono font-medium text-slate-200">{amenities.loungerCapacity}</span>
          </div>
          {/* Score bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Score</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-sky-400 transition-all"
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-medium text-slate-300">{scorePct}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -- Sub-components -- */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</span>
      </div>
      <div className="mt-1 flex flex-col gap-0.5 pl-5">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: 'sky' | 'amber' | 'emerald'
  icon?: React.ReactNode
}) {
  const colorClass =
    color === 'sky' ? 'text-sky-400' : color === 'amber' ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-slate-500">{label}</span>
      <span className={`flex items-center gap-1 font-mono font-medium ${colorClass}`}>
        {icon}
        {value}
      </span>
    </div>
  )
}
