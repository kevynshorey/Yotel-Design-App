'use client'

import { useMemo } from 'react'
import { X, Waves } from 'lucide-react'
import { POOL_DECK, calculatePoolDeckSummary } from '@/config/pool-deck'
import type { PoolZone } from '@/config/pool-deck'

interface PoolDeckDesignerProps {
  isOpen: boolean
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pool:    { bg: 'bg-sky-500/20',     text: 'text-sky-400',     label: 'Pool' },
  deck:    { bg: 'bg-amber-500/20',   text: 'text-amber-400',   label: 'Deck' },
  bar:     { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  label: 'Bar' },
  cabana:  { bg: 'bg-orange-500/20',  text: 'text-orange-400',  label: 'Cabana' },
  splash:  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Splash' },
  jacuzzi: { bg: 'bg-violet-500/20',  text: 'text-violet-400',  label: 'Jacuzzi' },
  service: { bg: 'bg-slate-500/20',   text: 'text-slate-400',   label: 'Service' },
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
/*  SVG Site Plan                                                      */
/* ------------------------------------------------------------------ */

function PoolDeckSitePlan() {
  // SVG layout — top-down schematic of pool deck
  // Ocean (west) is at the TOP, building (east) is at the BOTTOM
  const W = 680
  const H = 560
  const pad = 20

  // Zone rectangles — manually positioned for a clear plan layout
  const zones: Array<{ zone: PoolZone; x: number; y: number; w: number; h: number; rx?: number }> = [
    // Sun Lounger Deck — wraps the whole area
    { zone: POOL_DECK[5], x: pad, y: 60, w: W - pad * 2, h: H - 80 - 60, rx: 8 },
    // Main Pool — centre top
    { zone: POOL_DECK[0], x: 120, y: 100, w: 350, h: 100, rx: 4 },
    // Sun Shelf — left of sub-pool row
    { zone: POOL_DECK[1], x: 60, y: 220, w: 120, h: 60, rx: 4 },
    // Jacuzzi — centre of sub-pool row
    { zone: POOL_DECK[2], x: 210, y: 220, w: 60, h: 60, rx: 30 },
    // Swim-Up Bar — right of sub-pool row
    { zone: POOL_DECK[3], x: 300, y: 220, w: 160, h: 60, rx: 4 },
    // Cabanas — row of 6
    { zone: POOL_DECK[4], x: 60, y: 310, w: 400, h: 50, rx: 4 },
    // Children's Splash — bottom left
    { zone: POOL_DECK[6], x: 60, y: 390, w: 100, h: 70, rx: 8 },
    // Equipment — bottom right
    { zone: POOL_DECK[7], x: 370, y: 390, w: 150, h: 70, rx: 4 },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Pool Deck Site Plan (schematic &mdash; top-down, not to scale)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }}>
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} rx={8} fill="#0f172a" />

        {/* Ocean label (top / west) */}
        <rect x={0} y={0} width={W} height={50} rx={8} fill="#0c4a6e" opacity={0.4} />
        <text x={W / 2} y={20} textAnchor="middle" fontSize={11} fill="#38bdf8" fontWeight="bold" letterSpacing={4}>
          CARLISLE BAY &mdash; OCEAN (WEST)
        </text>
        {/* Wave decoration */}
        <path
          d={`M ${pad} 38 Q ${pad + 40} 30, ${pad + 80} 38 T ${pad + 160} 38 T ${pad + 240} 38 T ${pad + 320} 38 T ${pad + 400} 38 T ${pad + 480} 38 T ${pad + 560} 38 T ${pad + 640} 38`}
          fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.4}
        />
        {/* Infinity edge indicator */}
        <line x1={120} y1={96} x2={470} y2={96} stroke="#38bdf8" strokeWidth={3} strokeDasharray="8 4" opacity={0.8} />
        <text x={495} y={100} fontSize={7} fill="#38bdf8" opacity={0.8}>&larr; infinity edge</text>

        {/* Building label (bottom / east) */}
        <rect x={0} y={H - 30} width={W} height={30} rx={8} fill="#1e293b" opacity={0.6} />
        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight="bold" letterSpacing={3}>
          BUILDING (EAST)
        </text>

        {/* Draw sun lounger deck first (background) */}
        <rect
          x={zones[0].x} y={zones[0].y}
          width={zones[0].w} height={zones[0].h}
          rx={zones[0].rx ?? 4}
          fill={zones[0].zone.color} opacity={0.12}
          stroke={zones[0].zone.color} strokeWidth={1} strokeDasharray="6 3"
        />
        <text x={zones[0].x + 12} y={zones[0].y + 16} fontSize={9} fill={zones[0].zone.color} fontWeight="bold">
          Sun Lounger Deck
        </text>
        <text x={zones[0].x + 12} y={zones[0].y + 28} fontSize={7} fill={zones[0].zone.color} opacity={0.7}>
          {zones[0].zone.area}m&sup2; &middot; 80 loungers
        </text>

        {/* Lounger dots — decorative grid */}
        {Array.from({ length: 20 }).map((_, i) => {
          const row = Math.floor(i / 10)
          const col = i % 10
          return (
            <rect
              key={`lounger-${i}`}
              x={510 + col * 14}
              y={110 + row * 22}
              width={10} height={4} rx={1}
              fill={zones[0].zone.color} opacity={0.3}
            />
          )
        })}

        {/* Draw remaining zones (skip index 0 = deck already drawn) */}
        {zones.slice(1).map((z, i) => {
          const isCircular = z.zone.type === 'jacuzzi'
          return (
            <g key={z.zone.name}>
              {isCircular ? (
                <circle
                  cx={z.x + z.w / 2} cy={z.y + z.h / 2}
                  r={Math.min(z.w, z.h) / 2}
                  fill={z.zone.color} opacity={0.5}
                  stroke={z.zone.color} strokeWidth={1}
                />
              ) : (
                <rect
                  x={z.x} y={z.y}
                  width={z.w} height={z.h}
                  rx={z.rx ?? 4}
                  fill={z.zone.color} opacity={0.5}
                  stroke={z.zone.color} strokeWidth={1}
                />
              )}
              <text
                x={z.x + z.w / 2} y={z.y + z.h / 2 - 6}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill="white" fontWeight="bold"
              >
                {z.zone.name.length > 20 ? z.zone.name.slice(0, 18) + '\u2026' : z.zone.name}
              </text>
              <text
                x={z.x + z.w / 2} y={z.y + z.h / 2 + 8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fill="white" opacity={0.7}
              >
                {z.zone.area}m&sup2;
              </text>
            </g>
          )
        })}

        {/* Cabana subdivisions — 6 equal segments */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`cab-div-${i}`}
            x1={zones[5].x + ((i + 1) * zones[5].w) / 6}
            y1={zones[5].y}
            x2={zones[5].x + ((i + 1) * zones[5].w) / 6}
            y2={zones[5].y + zones[5].h}
            stroke="white" strokeWidth={0.5} opacity={0.3}
          />
        ))}

        {/* Swim-up bar stools — small circles along bar bottom edge */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={`stool-${i}`}
            cx={zones[4].x + 15 + i * 18}
            cy={zones[4].y + zones[4].h - 8}
            r={4}
            fill="#f59e0b" opacity={0.7}
            stroke="white" strokeWidth={0.5}
          />
        ))}

        {/* Compass rose — top right */}
        <g transform={`translate(${W - 55}, 70)`}>
          <circle cx={0} cy={0} r={18} fill="none" stroke="#475569" strokeWidth={0.5} />
          <text x={0} y={-22} textAnchor="middle" fontSize={8} fill="#94a3b8" fontWeight="bold">N</text>
          <text x={0} y={30} textAnchor="middle" fontSize={7} fill="#64748b">S</text>
          <text x={-24} y={3} textAnchor="middle" fontSize={7} fill="#64748b">W</text>
          <text x={24} y={3} textAnchor="middle" fontSize={7} fill="#64748b">E</text>
          {/* Arrow pointing up (north) */}
          <line x1={0} y1={-15} x2={0} y2={15} stroke="#475569" strokeWidth={1} />
          <line x1={0} y1={-15} x2={-4} y2={-9} stroke="#475569" strokeWidth={1} />
          <line x1={0} y1={-15} x2={4} y2={-9} stroke="#475569" strokeWidth={1} />
          {/* W-E line */}
          <line x1={-15} y1={0} x2={15} y2={0} stroke="#475569" strokeWidth={1} />
        </g>

        {/* Scale bar — bottom left */}
        <g transform={`translate(${pad + 10}, ${H - 45})`}>
          <line x1={0} y1={0} x2={50} y2={0} stroke="#64748b" strokeWidth={2} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="#64748b" strokeWidth={1} />
          <line x1={50} y1={-4} x2={50} y2={4} stroke="#64748b" strokeWidth={1} />
          <text x={25} y={12} textAnchor="middle" fontSize={7} fill="#64748b">~10m</text>
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Zone detail card                                                   */
/* ------------------------------------------------------------------ */

function ZoneCard({ zone }: { zone: PoolZone }) {
  const badge = TYPE_BADGE[zone.type] ?? TYPE_BADGE.service

  return (
    <div
      className="rounded-xl border border-white/10 bg-slate-900/80 p-5"
      style={{ borderLeftWidth: 4, borderLeftColor: zone.color }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{zone.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{zone.area}m&sup2;</p>
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-300">{zone.description}</p>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Features</p>
        <ul className="space-y-0.5">
          {zone.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: zone.color }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Revenue model card                                                 */
/* ------------------------------------------------------------------ */

function RevenueCard({ summary }: { summary: ReturnType<typeof calculatePoolDeckSummary> }) {
  const revenuePerM2 = Math.round(summary.totalPoolRevenue / summary.totalArea)
  const totalInvestment = summary.constructionCost + summary.equipmentCost
  const paybackYears = totalInvestment / (summary.totalPoolRevenue - summary.annualMaintenance)

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
      <h3 className="mb-4 text-sm font-semibold text-emerald-400">Cabana &amp; Pool Deck Revenue Model</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cabana Revenue</p>
          <p className="mt-1 text-xl font-bold text-white">{fmt(summary.cabanaRevenue)}</p>
          <p className="text-[10px] text-slate-500">6 cabanas &times; $200/day &times; 60%</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Bay Beach Bar</p>
          <p className="mt-1 text-xl font-bold text-white">{fmt(summary.fAndBRevenue)}</p>
          <p className="text-[10px] text-slate-500">F&amp;B poolside venue</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Pool Revenue</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{fmt(summary.totalPoolRevenue)}</p>
          <p className="text-[10px] text-slate-500">/year combined</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revenue / m&sup2;</p>
          <p className="mt-1 text-xl font-bold text-white">${fmtNum(revenuePerM2)}</p>
          <p className="text-[10px] text-slate-500">per m&sup2; of pool deck</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cost summary card                                                  */
/* ------------------------------------------------------------------ */

function CostCard({ summary }: { summary: ReturnType<typeof calculatePoolDeckSummary> }) {
  const totalInvestment = summary.constructionCost + summary.equipmentCost
  const netAnnual = summary.totalPoolRevenue - summary.annualMaintenance
  const paybackYears = totalInvestment / netAnnual

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Construction &amp; Operating Costs</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pool Construction</p>
          <p className="mt-1 text-lg font-bold text-white">{fmt(summary.constructionCost)}</p>
          <p className="text-[10px] text-slate-500">water + deck + service</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Equipment</p>
          <p className="mt-1 text-lg font-bold text-white">{fmt(summary.equipmentCost)}</p>
          <p className="text-[10px] text-slate-500">pumps, filters, heaters</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Annual Maintenance</p>
          <p className="mt-1 text-lg font-bold text-white">{fmt(summary.annualMaintenance)}</p>
          <p className="text-[10px] text-slate-500">chemicals, cleaning, repairs</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Payback Period</p>
          <p className="mt-1 text-lg font-bold text-sky-400">{paybackYears.toFixed(1)} years</p>
          <p className="text-[10px] text-slate-500">
            {fmt(totalInvestment)} / {fmt(netAnnual)} net/yr
          </p>
        </div>
      </div>

      {/* Area breakdown */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-xs text-slate-400">
        <span>Total Area: <span className="font-medium text-white">{fmtNum(summary.totalArea)}m&sup2;</span></span>
        <span>Water Area: <span className="font-medium text-white">{fmtNum(summary.waterArea)}m&sup2;</span></span>
        <span>Deck Area: <span className="font-medium text-white">{fmtNum(summary.deckArea)}m&sup2;</span></span>
        <span>Service Area: <span className="font-medium text-white">{fmtNum(summary.serviceArea)}m&sup2;</span></span>
        <span>Guest Capacity: <span className="font-medium text-white">~{summary.totalCapacity}</span></span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PoolDeckDesigner({ isOpen, onClose }: PoolDeckDesignerProps) {
  const summary = useMemo(() => calculatePoolDeckSummary(), [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">Pool Deck Design</h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>{fmtNum(summary.totalArea)}m&sup2; total</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{fmtNum(summary.waterArea)}m&sup2; water</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{summary.loungerCount} loungers</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{summary.cabanaCount} cabanas</span>
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
          {/* SVG site plan */}
          <PoolDeckSitePlan />

          {/* Zone detail cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {POOL_DECK.map((zone) => (
              <ZoneCard key={zone.name} zone={zone} />
            ))}
          </div>

          {/* Revenue model */}
          <RevenueCard summary={summary} />

          {/* Cost summary */}
          <CostCard summary={summary} />
        </div>
      </div>
    </div>
  )
}
