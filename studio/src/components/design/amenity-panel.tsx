'use client'

import {
  Droplets, UtensilsCrossed, Sun, Wine, Dumbbell, Mic, Podcast,
  Gamepad2, Briefcase, ShoppingCart, DoorOpen, Sofa, TreePalm,
  Car, MapPin, X,
} from 'lucide-react'
import type { AmenityProgramme } from '@/engine/amenities'
import { ROOFTOP_BAR, POOL_DECK, AMENITY_BLOCK_SPACES } from '@/config/programme'
import { FOH } from '@/config/construction'

interface AmenityPanelProps {
  amenities?: AmenityProgramme | null
  isOpen: boolean
  onClose: () => void
}

export function AmenityPanel({ amenities, isOpen, onClose }: AmenityPanelProps) {
  if (!isOpen) return null

  if (!amenities) {
    return (
      <div className="absolute bottom-14 left-3 z-[15] w-72 rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200">Amenity Programme</h3>
          <button type="button" onClick={onClose} className="rounded p-0.5 text-slate-500 hover:bg-white/10 hover:text-slate-300">
            <X size={14} />
          </button>
        </div>
        <div className="mt-2 flex h-12 items-center justify-center">
          <p className="text-[10px] text-slate-500">Select an option to view amenities</p>
        </div>
      </div>
    )
  }

  const scorePct = Math.round(amenities.amenityScore * 100)

  return (
    <div className="absolute bottom-14 left-3 z-[15] w-72 max-h-[calc(100vh-120px)] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2.5 shadow-lg backdrop-blur-xl scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200">Amenity Programme</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-400">
            {scorePct}%
          </span>
          <button type="button" onClick={onClose} className="rounded p-0.5 text-slate-500 hover:bg-white/10 hover:text-slate-300">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {/* 1. Rooftop Bar & Lounge */}
        <Section icon={<Wine className="h-3.5 w-3.5 text-amber-400" />} title="Rooftop Bar & Lounge" color="amber">
          <Row label="Bar" value={`${ROOFTOP_BAR.barArea}m\u00B2`} color="amber" />
          <Row label="Grill Kitchen" value={`${ROOFTOP_BAR.kitchenArea}m\u00B2`} color="amber" />
          <Row label="Raised Pool" value={`${ROOFTOP_BAR.plungePoolCount}\u00D7 plunge`} color="amber" />
          <Row label="DJ Booth" value={`${ROOFTOP_BAR.djBoothArea}m\u00B2`} color="amber" />
          <Row label="Lounge Area" value={`${ROOFTOP_BAR.loungeArea}m\u00B2`} color="amber" />
          <Row label="Capacity" value={`${ROOFTOP_BAR.capacity} pax`} color="amber" />
        </Section>

        {/* 2. Recording Studio */}
        <Section icon={<Mic className="h-3.5 w-3.5 text-fuchsia-400" />} title="Recording Studio" color="fuchsia">
          <Row label="Area" value={`${FOH.recordingStudio}m\u00B2`} color="fuchsia" />
          <Row label="Location" value="Amenity Block L1" color="fuchsia" />
        </Section>

        {/* 3. Podcast Studio */}
        <Section icon={<Podcast className="h-3.5 w-3.5 text-fuchsia-400" />} title="Podcast Studio" color="fuchsia">
          <Row label="Area" value={`${FOH.podcastStudio}m\u00B2`} color="fuchsia" />
          <Row label="Location" value="Amenity Block L1" color="fuchsia" />
        </Section>

        {/* 4. Sim Racing Gaming Room */}
        <Section icon={<Gamepad2 className="h-3.5 w-3.5 text-violet-400" />} title="Sim Racing Room" color="violet">
          <Row label="Area" value={`${FOH.simRacingRoom}m\u00B2`} color="violet" />
          <Row label="Rigs" value="4 full-motion" color="violet" />
        </Section>

        {/* 5. Business Center */}
        <Section icon={<Briefcase className="h-3.5 w-3.5 text-emerald-400" />} title="Business Centre" color="emerald">
          <Row label="Area" value={`${FOH.businessCenter}m\u00B2`} color="emerald" />
          <Row label="Hot Desks + Offices" value="\u2713" color="emerald" />
        </Section>

        {/* 6. Grab & Go Supermarket */}
        <Section icon={<ShoppingCart className="h-3.5 w-3.5 text-lime-400" />} title="Grab & Go Market" color="lime">
          <Row label="Area" value={`${FOH.grabAndGo}m\u00B2`} color="lime" />
          <Row label="Snacks / Essentials" value="\u2713" color="lime" />
        </Section>

        {/* 7. Restaurant & Bar */}
        <Section icon={<UtensilsCrossed className="h-3.5 w-3.5 text-emerald-400" />} title="Restaurant & Bar" color="emerald">
          <Row label="Indoor" value={`${amenities.restaurant.indoorArea}m\u00B2`} color="emerald" />
          <Row label="Outdoor" value={`${amenities.restaurant.outdoorArea}m\u00B2`} color="emerald" />
          <Row label="Seats" value={amenities.restaurant.totalSeats.toString()} color="emerald" />
        </Section>

        {/* 8. Gym */}
        <Section icon={<Dumbbell className="h-3.5 w-3.5 text-rose-400" />} title="Gym" color="rose">
          <Row label="Area" value={`${FOH.gym}m\u00B2`} color="rose" />
          <Row label="Cardio + Weights" value="\u2713" color="rose" />
        </Section>

        {/* 9. Mission Control */}
        <Section icon={<DoorOpen className="h-3.5 w-3.5 text-sky-400" />} title="Mission Control" color="sky">
          <Row label="Self Check-in" value={`${FOH.missionControl}m\u00B2`} color="sky" />
        </Section>

        {/* 10. Komyuniti Lounge */}
        <Section icon={<Sofa className="h-3.5 w-3.5 text-sky-400" />} title="Komyuniti Lounge" color="sky">
          <Row label="Area" value={`${FOH.komyunitiLounge}m\u00B2`} color="sky" />
        </Section>

        {/* 11. Central Pool Deck */}
        <Section icon={<Droplets className="h-3.5 w-3.5 text-sky-400" />} title="Central Pool Deck" color="sky">
          <Row label="Pool" value={`${amenities.pool.waterArea}m\u00B2`} color="sky" />
          <Row label="Deck" value={`${amenities.pool.deckArea}m\u00B2`} color="sky" />
          <Row label="Cabanas" value={String(POOL_DECK.cabanaCount)} color="sky" />
          <Row label="Loungers" value={String(POOL_DECK.loungerCount)} color="sky" icon={<Sun className="h-3 w-3 text-sky-400" />} />
          <Row label="Swim-up Bar" value={amenities.pool.hasSwimUpBar ? `${POOL_DECK.swimUpBarSeats} seats` : '\u2717'} color="sky" />
          <Row label="Infinity Edge" value={amenities.pool.hasInfinityEdge ? '\u2713' : '\u2717'} color="sky" />
        </Section>

        {/* 12. Bay Street Entrance */}
        <Section icon={<MapPin className="h-3.5 w-3.5 text-amber-400" />} title="Bay Street Entrance" color="amber">
          <Row label="Arrival Portico" value="\u2713" color="amber" />
          <Row label="Valet Lane" value="\u2713" color="amber" />
        </Section>

        {/* 13. Landscaping */}
        <Section icon={<TreePalm className="h-3.5 w-3.5 text-emerald-400" />} title="Landscaping" color="emerald">
          <Row label="Coverage" value={`${Math.round(POOL_DECK.landscapingPct * 100)}% of deck`} color="emerald" />
          <Row label="Native Species" value="\u2713" color="emerald" />
        </Section>

        {/* 14. Parking */}
        <Section icon={<Car className="h-3.5 w-3.5 text-slate-400" />} title="Parking Courts" color="slate">
          <Row label="Flanking Entrance" value="Left + Right" color="slate" />
        </Section>

        {/* Summary */}
        <div className="border-t border-white/10 pt-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Total Amenity Area</span>
            <span className="font-mono font-medium text-slate-200">
              {amenities.totalAmenityArea.toLocaleString()}m\u00B2
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

type ColorName = 'sky' | 'amber' | 'emerald' | 'fuchsia' | 'violet' | 'rose' | 'lime' | 'slate'

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  color: ColorName
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

const COLOR_MAP: Record<ColorName, string> = {
  sky: 'text-sky-400',
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
  fuchsia: 'text-fuchsia-400',
  violet: 'text-violet-400',
  rose: 'text-rose-400',
  lime: 'text-lime-400',
  slate: 'text-slate-400',
}

function Row({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: ColorName
  icon?: React.ReactNode
}) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-slate-500">{label}</span>
      <span className={`flex items-center gap-1 font-mono font-medium ${COLOR_MAP[color]}`}>
        {icon}
        {value}
      </span>
    </div>
  )
}
