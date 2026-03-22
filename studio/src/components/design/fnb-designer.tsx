'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { VENUES, calculateFnbSummary } from '@/config/fnb-venues'
import type { VenueConfig } from '@/config/fnb-venues'

interface FnbDesignerProps {
  isOpen: boolean
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                     */
/* ------------------------------------------------------------------ */

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  restaurant: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Restaurant' },
  bar:        { bg: 'bg-violet-500/20', text: 'text-violet-400', label: 'Bar' },
  pool_bar:   { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Pool Bar' },
  cafe:       { bg: 'bg-sky-500/20', text: 'text-sky-400', label: 'Cafe' },
}

const ZONE_COLOURS: Record<string, string> = {
  dining:  '#f59e0b',  // amber
  bar:     '#38bdf8',  // sky
  kitchen: '#64748b',  // slate
  storage: '#6b7280',  // gray
  terrace: '#34d399',  // emerald
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/* ------------------------------------------------------------------ */
/*  Area breakdown bar                                                 */
/* ------------------------------------------------------------------ */

function AreaBar({ label, area, extra, colour, maxArea }: {
  label: string; area: number; extra: string; colour: string; maxArea: number
}) {
  const pct = Math.max(4, (area / maxArea) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-slate-400">{label}</span>
      <div className="flex-1">
        <div
          className="h-4 rounded"
          style={{ width: `${pct}%`, backgroundColor: colour, opacity: 0.7 }}
        />
      </div>
      <span className="w-28 shrink-0 text-right text-slate-300">{area}m&sup2; {extra}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Venue floor plan SVG  (1m = 4px scale)                             */
/* ------------------------------------------------------------------ */

function VenueFloorPlan({ venue }: { venue: VenueConfig }) {
  const S = 4 // scale: 1m = 4px
  const pad = 12

  // Layout zones left-to-right: kitchen | dining | bar (stacked) | terrace
  const kitchenW = Math.sqrt(venue.kitchen.area) * S
  const kitchenH = (venue.kitchen.area / Math.sqrt(venue.kitchen.area)) * S
  const storageW = Math.sqrt(venue.storage.area) * S
  const storageH = (venue.storage.area / Math.sqrt(venue.storage.area)) * S

  const diningW = Math.sqrt(venue.dining.area) * 1.3 * S
  const diningH = (venue.dining.area / (Math.sqrt(venue.dining.area) * 1.3)) * S

  const barW = Math.sqrt(venue.bar.area) * 2.5 * S
  const barH = (venue.bar.area / (Math.sqrt(venue.bar.area) * 2.5)) * S

  const terraceW = Math.sqrt(venue.terrace.area) * 1.2 * S
  const terraceH = (venue.terrace.area / (Math.sqrt(venue.terrace.area) * 1.2)) * S

  // Positions
  const kx = pad
  const ky = pad
  const sx = pad
  const sy = ky + kitchenH + 4

  const dx = kx + kitchenW + 8
  const dy = pad

  const bx = dx + diningW + 8
  const by = pad

  const tx = bx + barW + 8
  const ty = pad

  const totalW = tx + terraceW + pad
  const totalH = Math.max(kitchenH + storageH + 8, diningH, barH + 20, terraceH) + pad * 2

  // Table positions (small circles) inside dining area
  const tables: { cx: number; cy: number; r: number }[] = []
  const tableCount = Math.floor(venue.dining.totalSeats / 4)
  const cols = Math.ceil(Math.sqrt(tableCount * (diningW / diningH)))
  const rows = Math.ceil(tableCount / cols)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (tables.length >= tableCount) break
      tables.push({
        cx: dx + (col + 0.5) * (diningW / cols),
        cy: dy + (row + 0.5) * (diningH / rows),
        r: 3,
      })
    }
  }

  // Bar stools along bar counter
  const stools: { cx: number; cy: number }[] = []
  for (let i = 0; i < venue.bar.stools; i++) {
    stools.push({
      cx: bx + (i + 0.5) * (barW / venue.bar.stools),
      cy: by + barH + 6,
    })
  }

  // Terrace seats
  const terraceSeats: { cx: number; cy: number }[] = []
  const tCols = Math.ceil(Math.sqrt(venue.terrace.seats / 2))
  const tRows = Math.ceil(venue.terrace.seats / 2 / tCols)
  for (let row = 0; row < tRows; row++) {
    for (let col = 0; col < tCols; col++) {
      if (terraceSeats.length >= Math.floor(venue.terrace.seats / 2)) break
      terraceSeats.push({
        cx: tx + (col + 0.5) * (terraceW / tCols),
        cy: ty + (row + 0.5) * (terraceH / tRows),
      })
    }
  }

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full"
      style={{ maxHeight: 180 }}
    >
      {/* Kitchen */}
      <rect x={kx} y={ky} width={kitchenW} height={kitchenH} rx={2} fill={ZONE_COLOURS.kitchen} opacity={0.6} />
      <text x={kx + kitchenW / 2} y={ky + kitchenH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">Kitchen</text>

      {/* Storage */}
      <rect x={sx} y={sy} width={storageW} height={storageH} rx={2} fill={ZONE_COLOURS.storage} opacity={0.5} />
      <text x={sx + storageW / 2} y={sy + storageH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="white">Store</text>

      {/* Dining */}
      <rect x={dx} y={dy} width={diningW} height={diningH} rx={2} fill={ZONE_COLOURS.dining} opacity={0.5} />
      <text x={dx + diningW / 2} y={dy + 10} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">Dining</text>
      {tables.map((t, i) => (
        <circle key={`t${i}`} cx={t.cx} cy={t.cy} r={t.r} fill={ZONE_COLOURS.dining} opacity={0.8} stroke="white" strokeWidth={0.5} />
      ))}

      {/* Bar */}
      <rect x={bx} y={by} width={barW} height={barH} rx={2} fill={ZONE_COLOURS.bar} opacity={0.6} />
      <text x={bx + barW / 2} y={by + barH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">Bar</text>
      {/* Bar counter line */}
      <line x1={bx + 2} y1={by + barH} x2={bx + barW - 2} y2={by + barH} stroke={ZONE_COLOURS.bar} strokeWidth={2} />
      {/* Stools */}
      {stools.map((s, i) => (
        <circle key={`s${i}`} cx={s.cx} cy={s.cy} r={2.5} fill={ZONE_COLOURS.bar} opacity={0.8} stroke="white" strokeWidth={0.5} />
      ))}

      {/* Terrace */}
      <rect
        x={tx} y={ty} width={terraceW} height={terraceH} rx={2}
        fill={ZONE_COLOURS.terrace} opacity={0.15}
        stroke={ZONE_COLOURS.terrace} strokeWidth={1} strokeDasharray="4 2"
      />
      <text x={tx + terraceW / 2} y={ty + 10} textAnchor="middle" fontSize={8} fill={ZONE_COLOURS.terrace} fontWeight="bold">Terrace</text>
      {terraceSeats.map((s, i) => (
        <circle key={`ts${i}`} cx={s.cx} cy={s.cy} r={2.5} fill={ZONE_COLOURS.terrace} opacity={0.5} stroke="white" strokeWidth={0.3} />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Venue card                                                         */
/* ------------------------------------------------------------------ */

function VenueCard({ venue, revenuePerSeat }: { venue: VenueConfig; revenuePerSeat: number }) {
  const badge = TYPE_BADGE[venue.type] ?? TYPE_BADGE.restaurant
  const totalVenueArea = venue.dining.area + venue.bar.area + venue.kitchen.area + venue.storage.area + venue.terrace.area
  const maxZone = Math.max(venue.dining.area, venue.bar.area, venue.kitchen.area, venue.storage.area, venue.terrace.area)
  const venueSeats = venue.dining.totalSeats + venue.terrace.seats + venue.bar.stools
  const venueRevPerSeat = Math.round(venue.annualRevenueEstimate / venueSeats)

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{venue.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{venue.location.charAt(0).toUpperCase() + venue.location.slice(1)} &middot; {venue.operatingHours}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">{fmt(venue.annualRevenueEstimate)}</p>
          <p className="text-[10px] text-slate-500">annual revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column — concept + materials (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Concept</p>
            <p className="text-xs leading-relaxed text-slate-300">{venue.concept}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Style</p>
            <p className="text-xs leading-relaxed text-slate-300">{venue.style}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Materials</p>
            <ul className="space-y-0.5">
              {venue.materials.map((m) => (
                <li key={m} className="text-xs text-slate-400">&bull; {m}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lighting</p>
            <p className="text-xs text-slate-400">{venue.lighting}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ventilation</p>
            <p className="text-xs text-slate-400 capitalize">{venue.ventilation} &middot; {venue.ceilingHeightM}m ceiling</p>
          </div>
        </div>

        {/* Right column — metrics (2/5) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Area breakdown */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Area Breakdown <span className="normal-case text-slate-600">({totalVenueArea}m&sup2; total)</span>
            </p>
            <div className="space-y-1.5">
              <AreaBar label="Dining" area={venue.dining.area} extra={`(${venue.dining.totalSeats} seats)`} colour={ZONE_COLOURS.dining} maxArea={maxZone} />
              <AreaBar label="Bar" area={venue.bar.area} extra={`(${venue.bar.stools}+${venue.bar.standingCapacity})`} colour={ZONE_COLOURS.bar} maxArea={maxZone} />
              <AreaBar label="Kitchen" area={venue.kitchen.area} extra={`(${venue.kitchen.type})`} colour={ZONE_COLOURS.kitchen} maxArea={maxZone} />
              <AreaBar label="Storage" area={venue.storage.area} extra={venue.storage.coldRoom ? '(cold)' : ''} colour={ZONE_COLOURS.storage} maxArea={maxZone} />
              <AreaBar label="Terrace" area={venue.terrace.area} extra={`(${venue.terrace.seats} seats, ${venue.terrace.covered ? 'covered' : 'open'})`} colour={ZONE_COLOURS.terrace} maxArea={maxZone} />
            </div>
          </div>

          {/* Operations */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Operations</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Meal Periods</span>
                <span className="text-slate-300">{venue.mealPeriods.length}</span>
              </div>
              {venue.mealPeriods.map((mp) => (
                <p key={mp} className="pl-2 text-[10px] text-slate-500">{mp}</p>
              ))}
              <div className="flex justify-between text-slate-400">
                <span>Avg Covers/Period</span>
                <span className="text-slate-300">{venue.avgCoversPerMealPeriod}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Avg Check</span>
                <span className="text-slate-300">${venue.avgCheckUsd}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Staff</span>
                <span className="text-slate-300">{venue.staffCount}</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Annual Estimate</span>
                <span className="font-medium text-white">{fmt(venue.annualRevenueEstimate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rev/Seat</span>
                <span className="text-slate-300">${fmtNum(venueRevPerSeat)}/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Plan SVG */}
      <div className="mt-4 rounded-lg border border-white/5 bg-slate-950/50 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Floor Plan (schematic)</p>
        <VenueFloorPlan venue={venue} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Kitchen detail panel                                               */
/* ------------------------------------------------------------------ */

function KitchenDetailPanel({ totalKitchenArea }: { totalKitchenArea: number }) {
  const mainKitchen = VENUES.find((v) => v.kitchen.type === 'full')
  const avgRatio = VENUES.reduce((s, v) => s + v.kitchen.kitchenToFrontRatio, 0) / VENUES.length

  const equipment = [
    { item: 'Walk-in cold room', spec: '3.5m x 2.5m' },
    { item: '6-burner range + griddle + fryer station', spec: '' },
    { item: 'Pizza / wood-fire oven', spec: '' },
    { item: 'Dishwash station', spec: '' },
    { item: 'Prep stations (hot + cold)', spec: '' },
    { item: 'Pass window / expediting counter', spec: '' },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Kitchen Programme</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total Kitchen Area</span>
            <span className="font-medium text-white">{totalKitchenArea}m&sup2;</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Avg Kitchen-to-Front Ratio</span>
            <span className="text-slate-300">{(avgRatio * 100).toFixed(0)}% <span className="text-slate-600">(industry 25-40%)</span></span>
          </div>
          {mainKitchen && (
            <div className="flex justify-between text-slate-400">
              <span>Main Kitchen ({mainKitchen.name})</span>
              <span className="text-slate-300">{mainKitchen.kitchen.area}m&sup2;</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>Prep Kitchens</span>
            <span className="text-slate-300">{VENUES.filter((v) => v.kitchen.type !== 'full').reduce((s, v) => s + v.kitchen.area, 0)}m&sup2;</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Main Kitchen Equipment</p>
          <ul className="space-y-1">
            {equipment.map((eq) => (
              <li key={eq.item} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                {eq.item}
                {eq.spec && <span className="text-slate-600">({eq.spec})</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Revenue summary panel                                              */
/* ------------------------------------------------------------------ */

function RevenueSummaryPanel({ summary }: { summary: ReturnType<typeof calculateFnbSummary> }) {
  // Caribbean benchmark: $8,000 - $12,000 rev/seat/year
  const benchmarkLow = 8_000
  const benchmarkHigh = 12_000
  const inBenchmark = summary.revenuePerSeat >= benchmarkLow && summary.revenuePerSeat <= benchmarkHigh
  const aboveBenchmark = summary.revenuePerSeat > benchmarkHigh

  // Estimated total hotel revenue from financials context (Year 3 stabilised ~ $12M)
  const estHotelRevenue = 12_000_000
  const fnbPct = (summary.totalRevenue / estHotelRevenue) * 100

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">F&amp;B Revenue Summary</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total F&amp;B Revenue</p>
          <p className="mt-1 text-xl font-bold text-white">{fmt(summary.totalRevenue)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revenue / Seat</p>
          <p className="mt-1 text-xl font-bold text-white">${fmtNum(Math.round(summary.revenuePerSeat))}</p>
          <p className={`text-[10px] ${aboveBenchmark ? 'text-emerald-400' : inBenchmark ? 'text-sky-400' : 'text-amber-400'}`}>
            {aboveBenchmark ? 'Above' : inBenchmark ? 'Within' : 'Below'} Caribbean benchmark ($8K-$12K)
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revenue / m&sup2;</p>
          <p className="mt-1 text-xl font-bold text-white">${fmtNum(Math.round(summary.revenuePerM2))}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">% of Hotel Revenue</p>
          <p className="mt-1 text-xl font-bold text-white">{fnbPct.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500">est. on $12M total</p>
        </div>
      </div>

      {/* Summary stats row */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-xs text-slate-400">
        <span>Total Seats: <span className="font-medium text-white">{summary.totalSeats}</span></span>
        <span>Total Area: <span className="font-medium text-white">{fmtNum(summary.totalArea)}m&sup2;</span></span>
        <span>Total Staff: <span className="font-medium text-white">{summary.totalStaff}</span></span>
        <span>Kitchen Area: <span className="font-medium text-white">{summary.totalKitchenArea}m&sup2;</span></span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FnbDesigner({ isOpen, onClose }: FnbDesignerProps) {
  const summary = useMemo(() => calculateFnbSummary(), [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-200">F&amp;B Venue Design</h2>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>{summary.venueCount} venues</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{summary.totalSeats} seats</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{fmtNum(summary.totalArea)}m&sup2;</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{fmt(summary.totalRevenue)} annual revenue</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Venue cards */}
          {VENUES.map((venue) => (
            <VenueCard key={venue.name} venue={venue} revenuePerSeat={summary.revenuePerSeat} />
          ))}

          {/* Kitchen detail */}
          <KitchenDetailPanel totalKitchenArea={summary.totalKitchenArea} />

          {/* Revenue summary */}
          <RevenueSummaryPanel summary={summary} />
        </div>
      </div>
    </div>
  )
}
