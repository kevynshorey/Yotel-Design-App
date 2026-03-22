'use client'

import { useMemo, useState } from 'react'
import {
  LEED_CATEGORIES,
  LEED_MAX_POINTS,
  CERTIFICATION_THRESHOLDS,
  getCertificationLevel,
  getAllCredits,
  getTargetedPoints,
  getLikelyPoints,
  getPossiblePoints,
  getPrerequisitesMet,
  getCategoryStats,
  type LEEDCredit,
  type LEEDCategory,
  type CertificationLevel,
} from '@/config/leed'
import {
  CheckCircle2,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronRight,
  Leaf,
  MapPin,
  Info,
} from 'lucide-react'

// ── Status helpers ──────────────────────────────────────────────────────

function statusBadgeClass(status: LEEDCredit['status']): string {
  switch (status) {
    case 'achieved':
      return 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50'
    case 'likely':
      return 'bg-blue-900/40 text-blue-400 ring-blue-700/50'
    case 'possible':
      return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
    case 'not-pursuing':
      return 'bg-slate-800/60 text-slate-500 ring-slate-700/50'
  }
}

function statusLabel(status: LEEDCredit['status']): string {
  switch (status) {
    case 'achieved':
      return 'Achieved'
    case 'likely':
      return 'Likely'
    case 'possible':
      return 'Possible'
    case 'not-pursuing':
      return 'Not Pursuing'
  }
}

// ── Score Gauge ─────────────────────────────────────────────────────────

function ScoreGauge({ targeted, likely, possible }: { targeted: number; likely: number; possible: number }) {
  const level = getCertificationLevel(targeted)
  const likelyLevel = getCertificationLevel(likely)

  // SVG arc gauge
  const radius = 80
  const strokeWidth = 12
  const circumference = Math.PI * radius // half circle
  const targetedFraction = targeted / LEED_MAX_POINTS
  const likelyFraction = likely / LEED_MAX_POINTS

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
        {/* Certification level color bands */}
        {CERTIFICATION_THRESHOLDS.map((t) => {
          const startAngle = Math.PI * (1 - t.max / LEED_MAX_POINTS)
          const endAngle = Math.PI * (1 - t.min / LEED_MAX_POINTS)
          const startX = 100 + radius * Math.cos(Math.PI - (t.min / LEED_MAX_POINTS) * Math.PI)
          const startY = 100 - radius * Math.sin(Math.PI - (t.min / LEED_MAX_POINTS) * Math.PI)

          return null // bands handled by background
        })}

        {/* Background arc */}
        <path
          d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
          fill="none"
          stroke="rgb(30,41,59)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Certification zone indicators */}
        {CERTIFICATION_THRESHOLDS.filter((t) => t.level !== 'none').map((t) => {
          const startFrac = t.min / LEED_MAX_POINTS
          const endFrac = Math.min(t.max, LEED_MAX_POINTS) / LEED_MAX_POINTS
          const startAngle = Math.PI * (1 - startFrac)
          const endAngle = Math.PI * (1 - endFrac)

          const x1 = 100 + radius * Math.cos(startAngle)
          const y1 = 100 - radius * Math.sin(startAngle)
          const x2 = 100 + radius * Math.cos(endAngle)
          const y2 = 100 - radius * Math.sin(endAngle)
          const largeArc = endFrac - startFrac > 0.5 ? 1 : 0

          const colorMap: Record<CertificationLevel, string> = {
            none: 'rgba(100,116,139,0.15)',
            certified: 'rgba(74,222,128,0.15)',
            silver: 'rgba(96,165,250,0.15)',
            gold: 'rgba(250,204,21,0.15)',
            platinum: 'rgba(203,213,225,0.15)',
          }

          return (
            <path
              key={t.level}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`}
              fill="none"
              stroke={colorMap[t.level]}
              strokeWidth={strokeWidth + 4}
            />
          )
        })}

        {/* Targeted score arc */}
        <path
          d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
          fill="none"
          stroke="currentColor"
          className={level.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * targetedFraction} ${circumference}`}
        />

        {/* Center text */}
        <text x="100" y="72" textAnchor="middle" className="fill-slate-100 text-3xl font-bold" style={{ fontSize: 32, fontWeight: 700 }}>
          {targeted}
        </text>
        <text x="100" y="90" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11 }}>
          of {LEED_MAX_POINTS} points
        </text>

        {/* Level labels along bottom */}
        <text x="24" y="115" textAnchor="middle" className="fill-slate-600" style={{ fontSize: 7 }}>40</text>
        <text x="55" y="115" textAnchor="middle" className="fill-slate-600" style={{ fontSize: 7 }}>50</text>
        <text x="100" y="115" textAnchor="middle" className="fill-slate-600" style={{ fontSize: 7 }}>60</text>
        <text x="158" y="115" textAnchor="middle" className="fill-slate-600" style={{ fontSize: 7 }}>80</text>
      </svg>

      {/* Level badge */}
      <span
        className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ring-1 ${level.bgColor} ${level.color} ${level.ringColor}`}
      >
        <Award className="h-4 w-4" />
        {level.label}
      </span>
    </div>
  )
}

// ── Summary Stats ───────────────────────────────────────────────────────

function SummaryStats() {
  const targeted = getTargetedPoints()
  const likely = getLikelyPoints()
  const possible = getPossiblePoints()
  const prereqs = getPrerequisitesMet()
  const level = getCertificationLevel(targeted)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-400" />
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Targeted Points</p>
        </div>
        <p className="text-2xl font-bold text-blue-400">{targeted}</p>
        <p className="text-[10px] text-slate-600">Points we are actively pursuing</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Likely Achievable</p>
        </div>
        <p className="text-2xl font-bold text-emerald-400">{likely}</p>
        <p className="text-[10px] text-slate-600">Achieved + likely credits</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Maximum Possible</p>
        </div>
        <p className="text-2xl font-bold text-amber-400">{possible}</p>
        <p className="text-[10px] text-slate-600">If all possible credits are achieved</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-1 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Prerequisites</p>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          {prereqs.met}/{prereqs.total}
        </p>
        <p className="text-[10px] text-slate-600">
          {prereqs.met === prereqs.total ? 'All prerequisites met' : `${prereqs.total - prereqs.met} outstanding`}
        </p>
      </div>
    </div>
  )
}

// ── Category Progress Card ──────────────────────────────────────────────

function CategoryCard({
  category,
  expanded,
  onToggle,
}: {
  category: LEEDCategory
  expanded: boolean
  onToggle: () => void
}) {
  const stats = getCategoryStats(category)
  const ratio = stats.maxAvailable > 0 ? stats.targeted / stats.maxAvailable : 0
  const nonPrereqCredits = category.credits.filter((c) => !c.prerequisite)
  const prereqCredits = category.credits.filter((c) => c.prerequisite)
  const barbadosNotesCount = category.credits.filter((c) => c.barbadosNotes).length

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80">
      {/* Category header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-800/40"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-400">
              {category.abbreviation}
            </span>
            <h3 className="truncate text-sm font-semibold text-slate-100">{category.name}</h3>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-slate-400">
              {stats.targeted}/{stats.maxAvailable}
            </span>
          </div>
        </div>
        {barbadosNotesCount > 0 && (
          <span className="shrink-0 rounded-full bg-cyan-900/30 px-2 py-0.5 text-[9px] font-medium text-cyan-400 ring-1 ring-cyan-800/50">
            <MapPin className="mr-0.5 inline h-2.5 w-2.5" />
            {barbadosNotesCount}
          </span>
        )}
      </button>

      {/* Expanded credit list */}
      {expanded && (
        <div className="border-t border-white/5">
          {/* Prerequisites */}
          {prereqCredits.length > 0 && (
            <div className="border-b border-white/5 bg-slate-950/40 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Prerequisites
              </p>
              {prereqCredits.map((credit) => (
                <CreditRow key={credit.id} credit={credit} />
              ))}
            </div>
          )}

          {/* Scoring credits */}
          <div className="px-4 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Credits
            </p>
            {nonPrereqCredits.map((credit) => (
              <CreditRow key={credit.id} credit={credit} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Individual Credit Row ───────────────────────────────────────────────

function CreditRow({ credit }: { credit: LEEDCredit }) {
  return (
    <div className="mb-2 last:mb-0 rounded-lg border border-white/5 bg-slate-900/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[10px] text-slate-600">{credit.id}</span>
            <p className="truncate text-xs font-medium text-slate-200">{credit.name}</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{credit.strategy}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Points */}
          {credit.prerequisite ? (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              PREREQ
            </span>
          ) : (
            <span className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-slate-200">{credit.targetPoints}</span>
              <span className="text-[10px] text-slate-600">/{credit.maxPoints}</span>
            </span>
          )}
          {/* Status badge */}
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${statusBadgeClass(credit.status)}`}
          >
            {statusLabel(credit.status)}
          </span>
        </div>
      </div>

      {/* Barbados note */}
      {credit.barbadosNotes && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-cyan-950/30 px-2.5 py-2 ring-1 ring-cyan-900/40">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-cyan-500" />
          <p className="text-[10px] leading-relaxed text-cyan-300/80">{credit.barbadosNotes}</p>
        </div>
      )}
    </div>
  )
}

// ── Main LEED Tracker Component ─────────────────────────────────────────

export default function LEEDTracker() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const targeted = useMemo(() => getTargetedPoints(), [])
  const likely = useMemo(() => getLikelyPoints(), [])
  const possible = useMemo(() => getPossiblePoints(), [])

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(LEED_CATEGORIES.map((c) => c.name)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  // Count Barbados notes
  const totalBarbadosNotes = getAllCredits().filter((c) => c.barbadosNotes).length

  // Count by status
  const allCredits = getAllCredits()
  const statusCounts = {
    achieved: allCredits.filter((c) => c.status === 'achieved').length,
    likely: allCredits.filter((c) => c.status === 'likely').length,
    possible: allCredits.filter((c) => c.status === 'possible').length,
    'not-pursuing': allCredits.filter((c) => c.status === 'not-pursuing').length,
  }

  return (
    <div className="mt-6 border-t border-slate-800/60 pt-6">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            LEED v4.1 BD+C: Hospitality Tracker
          </h2>
        </div>
        <span className="text-[10px] text-slate-600">|</span>
        <span className="text-[10px] text-slate-500">
          Target: Silver (50-59) with stretch to Gold (60-79)
        </span>
      </div>

      {/* Score gauge */}
      <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/80 p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left: Gauge */}
          <ScoreGauge targeted={targeted} likely={likely} possible={possible} />

          {/* Divider */}
          <div className="hidden h-32 w-px bg-slate-800 lg:block" />

          {/* Right: Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Targeted Points</span>
              <span className="font-bold text-blue-400">{targeted}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Likely Achievable</span>
              <span className="font-bold text-emerald-400">{likely}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Maximum Possible</span>
              <span className="font-bold text-amber-400">{possible}</span>
            </div>
            <div className="my-2 h-px bg-slate-800" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Credits Achieved</span>
              <span className="font-mono text-slate-300">{statusCounts.achieved}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Credits Likely</span>
              <span className="font-mono text-slate-300">{statusCounts.likely}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Credits Possible</span>
              <span className="font-mono text-slate-300">{statusCounts.possible}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Not Pursuing</span>
              <span className="font-mono text-slate-500">{statusCounts['not-pursuing']}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barbados-specific callout */}
      {totalBarbadosNotes > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          <div>
            <p className="text-xs font-medium text-cyan-300">Caribbean-Specific Considerations</p>
            <p className="mt-0.5 text-[11px] text-cyan-400/70">
              {totalBarbadosNotes} credits have Barbados-specific notes addressing local climate, regulations, and supply chain factors.
              Look for the <MapPin className="inline h-3 w-3 text-cyan-500" /> icon on category cards.
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <SummaryStats />

      {/* Category breakdown */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Category Breakdown ({LEED_CATEGORIES.length} categories)
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-[10px] text-slate-500 transition-colors hover:text-slate-300"
            >
              Expand All
            </button>
            <span className="text-[10px] text-slate-700">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-[10px] text-slate-500 transition-colors hover:text-slate-300"
            >
              Collapse All
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {LEED_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              expanded={expandedCategories.has(category.name)}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </div>
      </div>

      {/* Certification level legend */}
      <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Certification Levels
        </h3>
        <div className="flex flex-wrap gap-3">
          {CERTIFICATION_THRESHOLDS.filter((t) => t.level !== 'none').map((t) => (
            <div
              key={t.level}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${t.bgColor} ${t.color} ${t.ringColor}`}
            >
              {t.label}: {t.min}-{t.max === 110 ? '110' : t.max} pts
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
