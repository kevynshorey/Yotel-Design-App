'use client'

import { useMemo } from 'react'
import type { DesignOption } from '@/engine/types'

interface ViewAnalysisProps {
  option: DesignOption | null
}

interface ViewDistribution {
  ocean: number
  garden: number
  courtyard: number
  street: number
}

const VIEW_COLORS = {
  ocean: '#38bdf8',     // sky-400
  garden: '#34d399',    // emerald-400
  courtyard: '#fbbf24', // amber-400
  street: '#64748b',    // slate-500
} as const

const VIEW_LABELS: Record<keyof ViewDistribution, string> = {
  ocean: 'Ocean / Sunset',
  garden: 'Garden / Landscape',
  courtyard: 'Courtyard',
  street: 'Street / Road',
}

function computeViewDistribution(option: DesignOption): {
  distribution: ViewDistribution
  westRooms: number
  eastRooms: number
  courtyardRooms: number
  streetRooms: number
} {
  const totalRooms = option.metrics.totalKeys
  const westFacadeLen = option.metrics.westFacade

  // Estimate rooms per facade based on form type and wing layout
  // Average bay width ~3.5m
  const avgBay = 3.5
  const westRoomsPerLevel = Math.floor(westFacadeLen / avgBay)
  const guestFloors = option.floors.filter(
    (f) => f.use === 'YOTEL' || f.use === 'YOTELPAD',
  ).length
  const westRooms = Math.min(
    westRoomsPerLevel * guestFloors * (option.wings.length >= 2 ? 1 : 1),
    totalRooms,
  )

  // East-facing rooms mirror west for double-loaded corridors
  const eastRooms =
    option.metrics.corridorType === 'double_loaded' ? westRooms : 0

  // Courtyard views (U/C forms)
  const hasCourt = option.form === 'U' || option.form === 'C'
  const courtyardRooms = hasCourt
    ? Math.floor(totalRooms * 0.3)
    : 0

  // Street-facing — remainder
  const streetRooms = Math.max(
    0,
    totalRooms - westRooms - eastRooms - courtyardRooms,
  )

  // Normalize to percentages
  const distribution: ViewDistribution = {
    ocean: westRooms / totalRooms,
    garden: eastRooms / totalRooms,
    courtyard: courtyardRooms / totalRooms,
    street: streetRooms / totalRooms,
  }

  // Clamp — total cannot exceed 1
  const sum =
    distribution.ocean +
    distribution.garden +
    distribution.courtyard +
    distribution.street
  if (sum > 1) {
    const scale = 1 / sum
    distribution.ocean *= scale
    distribution.garden *= scale
    distribution.courtyard *= scale
    distribution.street *= scale
  }

  return { distribution, westRooms, eastRooms, courtyardRooms, streetRooms }
}

/** SVG donut chart */
function DonutChart({
  distribution,
}: {
  distribution: ViewDistribution
}) {
  const radius = 40
  const stroke = 12
  const circumference = 2 * Math.PI * radius
  const entries = (
    Object.entries(distribution) as [keyof ViewDistribution, number][]
  ).filter(([, v]) => v > 0)

  let cumulativeOffset = 0

  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      {entries.map(([key, pct]) => {
        const dashLen = pct * circumference
        const gapLen = circumference - dashLen
        const offset = -cumulativeOffset * circumference + circumference * 0.25
        cumulativeOffset += pct
        return (
          <circle
            key={key}
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke={VIEW_COLORS[key]}
            strokeWidth={stroke}
            strokeDasharray={`${dashLen} ${gapLen}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            opacity={0.9}
          />
        )
      })}
      {/* Center label */}
      <text
        x={60}
        y={57}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f8fafc"
        fontSize={12}
        fontWeight={700}
      >
        {Math.round(distribution.ocean * 100)}%
      </text>
      <text
        x={60}
        y={70}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#94a3b8"
        fontSize={6}
      >
        ocean view
      </text>
    </svg>
  )
}

/** Sun path arc SVG — simple compass rose with sun arc */
function SunPathDiagram() {
  return (
    <svg viewBox="0 0 140 100" className="h-full w-full">
      {/* Compass circle */}
      <circle cx={70} cy={60} r={35} fill="none" stroke="#334155" strokeWidth={0.8} />

      {/* Cardinal directions */}
      <text x={70} y={20} textAnchor="middle" fill="#94a3b8" fontSize={6} fontWeight={600}>N</text>
      <text x={70} y={100} textAnchor="middle" fill="#64748b" fontSize={5}>S</text>
      <text x={28} y={62} textAnchor="middle" fill="#fbbf24" fontSize={6} fontWeight={600}>W</text>
      <text x={112} y={62} textAnchor="middle" fill="#94a3b8" fontSize={6} fontWeight={600}>E</text>

      {/* Sun arc — east to west through high overhead (13N latitude) */}
      <path
        d="M 105 60 Q 70 10 35 60"
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1.5}
        strokeDasharray="3 1.5"
        opacity={0.8}
      />

      {/* Sun positions */}
      {/* Morning (east) */}
      <circle cx={105} cy={60} r={3} fill="#fbbf24" opacity={0.5} />
      <text x={105} y={70} textAnchor="middle" fill="#94a3b8" fontSize={4}>6am</text>

      {/* Noon (overhead — at 13N, near zenith) */}
      <circle cx={70} cy={22} r={4} fill="#fbbf24" opacity={0.9} />
      <text x={70} y={14} textAnchor="middle" fill="#fbbf24" fontSize={4}>12pm</text>

      {/* Afternoon (west — beach side) */}
      <circle cx={35} cy={60} r={3.5} fill="#fbbf24" opacity={0.7} />
      <text x={35} y={70} textAnchor="middle" fill="#fbbf24" fontSize={4}>6pm</text>

      {/* Beach label on west */}
      <text x={15} y={48} fill="#38bdf8" fontSize={4} fontWeight={500}>Beach</text>
      <text x={15} y={54} fill="#38bdf8" fontSize={3.5}>(Carlisle Bay)</text>

      {/* Building footprint indicator */}
      <rect x={58} y={48} width={24} height={24} fill="#1e293b" stroke="#475569" strokeWidth={0.5} rx={1} />
      <text x={70} y={62} textAnchor="middle" fill="#64748b" fontSize={3.5}>Building</text>

      {/* Arrow showing sunset views */}
      <line x1={58} y1={60} x2={42} y2={60} stroke="#f97316" strokeWidth={0.8} markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth={4} markerHeight={4} refX={3} refY={2} orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 Z" fill="#f97316" />
        </marker>
      </defs>
    </svg>
  )
}

export function ViewAnalysis({ option }: ViewAnalysisProps) {
  const analysis = useMemo(() => {
    if (!option) return null
    return computeViewDistribution(option)
  }, [option])

  if (!option || !analysis) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Select a design option to view analysis</p>
      </div>
    )
  }

  const { distribution, westRooms, eastRooms, courtyardRooms, streetRooms } = analysis
  const oceanPct = Math.round(distribution.ocean * 100)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto bg-slate-950 p-4">
      {/* Header metric */}
      <div className="rounded-xl bg-gradient-to-br from-sky-950 to-slate-900 p-4 text-center">
        <div className="text-3xl font-bold text-sky-400">{oceanPct}%</div>
        <div className="mt-1 text-sm text-sky-200">Ocean View Rooms</div>
        <div className="mt-0.5 text-xs text-slate-400">
          {westRooms} of {option.metrics.totalKeys} keys face the Caribbean Sea
        </div>
      </div>

      {/* View distribution */}
      <div className="grid grid-cols-[140px_1fr] gap-4 rounded-xl bg-slate-900 p-4">
        <div className="h-[140px] w-[140px]">
          <DonutChart distribution={distribution} />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            View Distribution
          </h3>
          {(Object.entries(distribution) as [keyof ViewDistribution, number][])
            .filter(([, v]) => v > 0)
            .map(([key, pct]) => {
              const count =
                key === 'ocean'
                  ? westRooms
                  : key === 'garden'
                    ? eastRooms
                    : key === 'courtyard'
                      ? courtyardRooms
                      : streetRooms
              return (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: VIEW_COLORS[key] }}
                  />
                  <span className="flex-1 text-xs text-slate-300">
                    {VIEW_LABELS[key]}
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {count} ({Math.round(pct * 100)}%)
                  </span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Sun path */}
      <div className="rounded-xl bg-slate-900 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sun Path Analysis &mdash; 13&deg;N Latitude
        </h3>
        <div className="h-[120px]">
          <SunPathDiagram />
        </div>
        <div className="mt-3 space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <span>
              West facade ({option.metrics.westFacade.toFixed(1)}m) receives 6+
              hours direct afternoon sun with unobstructed sunset views over
              Carlisle Bay
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
            <span>
              East-facing rooms benefit from cooler morning light and reduced
              solar heat gain &mdash; lower HVAC load
            </span>
          </div>
          {(option.form === 'U' || option.form === 'C') && (
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <span>
                Courtyard orientation provides sheltered outdoor space with
                filtered daylight throughout the day
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Revenue recommendation */}
      <div className="rounded-xl border border-sky-900/50 bg-sky-950/30 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
          Revenue Implication
        </h3>
        <p className="text-xs leading-relaxed text-slate-300">
          Premium pricing applicable to{' '}
          <span className="font-semibold text-sky-300">{westRooms} ocean-view rooms</span>.
          At a 25% ADR uplift for sea-view keys, this configuration supports
          approximately{' '}
          <span className="font-semibold text-emerald-400">
            ${((westRooms * 0.25 * 180 * 365 * 0.72) / 1e6).toFixed(1)}M
          </span>{' '}
          additional annual revenue versus an inland-only layout.
        </p>
        {eastRooms > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            {eastRooms} garden-view rooms command a modest 8-10% premium with
            tropical landscaping.
          </p>
        )}
      </div>

      {/* Form advantage */}
      <div className="rounded-xl bg-slate-900 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Form Advantage: {option.form}
        </h3>
        <p className="text-xs leading-relaxed text-slate-300">
          {option.form === 'BAR' &&
            'Linear bar form maximises west facade length but limits total room count. Ideal for boutique positioning with maximum ocean-view percentage.'}
          {option.form === 'BAR_NS' &&
            'North-south bar orientation provides the longest beach-facing facade, maximising ocean views for all rooms on the west side.'}
          {option.form === 'L' &&
            'L-form balances ocean frontage with room count. The branch wing captures additional garden views while the main wing faces the sea.'}
          {option.form === 'U' &&
            'U-form creates a protected courtyard garden while maintaining dual ocean-facing wings. Strong view diversity across all price tiers.'}
          {option.form === 'C' &&
            'C-form (open to west) combines courtyard amenity with maximum sunset exposure. The open end frames ocean views for both wings and the central space.'}
        </p>
      </div>
    </div>
  )
}
