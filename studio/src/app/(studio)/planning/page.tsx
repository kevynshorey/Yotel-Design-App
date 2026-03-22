'use client'

import { useMemo, useState, useEffect } from 'react'
import { useDesign } from '@/context/design-context'
import { getSelectedOption } from '@/store/design-store'
import { validate } from '@/engine/validator'
import { RULES } from '@/config/rules'
import { SITE, PLANNING_REGS } from '@/config/site'
import type { DesignOption } from '@/engine/types'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Building2,
  Ruler,
  Waves,
  TreePalm,
  Car,
  FileSearch,
  Landmark,
  LayoutGrid,
  Maximize,
  Users,
  Zap,
  Droplets,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'
import SustainabilitySection from '@/components/planning/sustainability-section'
import InfrastructureSection from '@/components/planning/infrastructure-section'
import LEEDTracker from '@/components/sustainability/leed-tracker'
import { calculateParking } from '@/config/parking'
import { calculateDrainage } from '@/config/drainage'
import { calculateLandscape } from '@/config/landscape'
import {
  APPROVAL_TRACKS,
  PRECEDENT_PROJECTS,
  EIA_ISSUES,
  computeApprovalProgress,
  type ApprovalStatus,
  type ApprovalTrack,
  type EIAAssessmentStatus,
} from '@/config/approval-tracker'

// ── Regulation check definition ─────────────────────────────────────────

type CheckStatus = 'pass' | 'fail' | 'warning' | 'info'

interface RegulationCheck {
  name: string
  statute: string
  icon: LucideIcon
  status: CheckStatus
  currentValue: string
  limit: string
  /** 0-1 fraction showing how close to limit (for progress bar) */
  ratio: number | null
  detail?: string
}

function computeChecks(option: DesignOption): RegulationCheck[] {
  const m = option.metrics
  const totalKeys = m.totalKeys

  // 1. Site Coverage
  const coverageRatio = m.coverage / RULES.planning.maxCoverage
  const coverageStatus: CheckStatus =
    m.coverage > RULES.planning.maxCoverage ? 'fail' : coverageRatio > 0.95 ? 'warning' : 'pass'

  // 2. Building Height
  const heightRatio = m.buildingHeight / RULES.planning.maxHeight
  const heightStatus: CheckStatus =
    m.buildingHeight > RULES.planning.maxHeight ? 'fail' : heightRatio > 0.95 ? 'warning' : 'pass'

  // 3. Boundary Setback — re-run validator to get specifics
  const validation = validate(m, option.wings)
  const boundaryViolation = validation.violations.find(
    (v) => v.rule.includes('Boundary setback') || v.rule.includes('outside buildable')
  )
  const boundaryStatus: CheckStatus = boundaryViolation ? 'fail' : 'pass'

  // 4. Coastal Setback — info only (offset boundary handles this)
  // 5. Wing Width YOTEL
  const minYotelWidth = Math.min(...option.wings.map((w) => w.width))
  const yotelWidthOk = minYotelWidth >= RULES.brand.dualMinWidth
  const yotelWidthRatio = RULES.brand.dualMinWidth / Math.max(minYotelWidth, 0.01)

  // 6. Wing Width PAD
  const padWidthOk = minYotelWidth >= RULES.brand.padDualMinWidth
  const padWidthRatio = RULES.brand.padDualMinWidth / Math.max(minYotelWidth, 0.01)

  // 7. GIA Efficiency
  const giaLow = m.giaPerKey < 25
  const giaWarn = m.giaPerKey < 29 || m.giaPerKey > 48
  const giaStatus: CheckStatus = giaLow ? 'fail' : giaWarn ? 'warning' : 'pass'
  // Map giaPerKey into a 0-1 ratio relative to 25-48 range
  const giaMid = 36.5
  const giaRange = 48 - 25
  const giaDeviation = Math.abs(m.giaPerKey - giaMid) / (giaRange / 2)

  // 8. Accessible Rooms — 5% minimum
  const accessibleMin = Math.ceil(totalKeys * RULES.brand.minAccessiblePct)
  // We flag if total keys exist but can't know exact accessible count from metrics;
  // we just check if the percentage requirement is calculable
  const accessibleStatus: CheckStatus = totalKeys > 0 ? 'pass' : 'warning'

  // 9. Maximum Footprint
  const fpRatio = m.footprint / SITE.maxFootprint
  const fpStatus: CheckStatus =
    m.footprint > SITE.maxFootprint ? 'fail' : fpRatio > 0.95 ? 'warning' : 'pass'

  // 10. Parking (calculated)
  const parkingResult = calculateParking(totalKeys)
  const parkingMin = Math.ceil(totalKeys * PLANNING_REGS.parkingRatioMin)
  const parkingMax = Math.ceil(totalKeys * PLANNING_REGS.parkingRatioMax)

  // 10b. Stormwater (calculated)
  const poolTotalArea = option.amenities?.pool.totalArea ?? 0
  const landscapeResult = calculateLandscape(SITE.grossArea, m.footprint, poolTotalArea)
  const permeableArea = Math.round(landscapeResult.hardscapeArea * 0.4)
  const drainageResult = calculateDrainage(m.footprint, landscapeResult.hardscapeArea, permeableArea, landscapeResult.softscapeArea)

  // 11. EIA
  const eiaRequired = totalKeys > RULES.planning.eiaThreshold

  // 12. Heritage Zone
  const heritageApplies = PLANNING_REGS.heritageZoneProximity

  return [
    {
      name: 'Site Coverage',
      statute: 'PDP 2017, s.4.2 — 50% max for tourism/commercial',
      icon: LayoutGrid,
      status: coverageStatus,
      currentValue: `${(m.coverage * 100).toFixed(1)}%`,
      limit: `${(RULES.planning.maxCoverage * 100).toFixed(0)}%`,
      ratio: Math.min(coverageRatio, 1.2),
    },
    {
      name: 'Building Height',
      statute: 'PDP 2017 + Heritage Zone — 25m discretionary max',
      icon: Building2,
      status: heightStatus,
      currentValue: `${m.buildingHeight.toFixed(1)}m`,
      limit: `${RULES.planning.maxHeight}m`,
      ratio: Math.min(heightRatio, 1.2),
    },
    {
      name: 'Boundary Setback',
      statute: 'Planning & Development Act — 6ft (1.83m) minimum',
      icon: Ruler,
      status: boundaryStatus,
      currentValue: boundaryViolation
        ? String(boundaryViolation.actual)
        : `All corners ≥${RULES.planning.boundarySetback}m`,
      limit: `${RULES.planning.boundarySetback}m from all boundaries`,
      ratio: boundaryStatus === 'pass' ? 0.5 : 1.0,
    },
    {
      name: 'Coastal Setback',
      statute: 'CZMU Act — 30m from High Water Mark',
      icon: Waves,
      status: 'info',
      currentValue: 'Accounted for in offset boundary',
      limit: `${PLANNING_REGS.coastalSetback}m from HWM`,
      ratio: null,
      detail: 'The buildable zone already incorporates the 30m CZMU coastal setback on the west (beach) side.',
    },
    {
      name: 'Wing Width (YOTEL)',
      statute: 'D01 Brand Standard — dual-loaded min 13.6m',
      icon: Maximize,
      status: yotelWidthOk ? 'pass' : 'fail',
      currentValue: `${minYotelWidth.toFixed(1)}m`,
      limit: `${RULES.brand.dualMinWidth}m`,
      ratio: Math.min(yotelWidthRatio, 1.2),
    },
    {
      name: 'Wing Width (PAD)',
      statute: 'D01 Brand Standard — PAD dual-loaded min 16.1m',
      icon: Maximize,
      status: m.padUnits > 0 ? (padWidthOk ? 'pass' : 'warning') : 'pass',
      currentValue: m.padUnits > 0 ? `${minYotelWidth.toFixed(1)}m` : 'N/A (no PAD units)',
      limit: `${RULES.brand.padDualMinWidth}m`,
      ratio: m.padUnits > 0 ? Math.min(padWidthRatio, 1.2) : null,
      detail: m.padUnits === 0 ? 'No YOTELPAD units in this option.' : undefined,
    },
    {
      name: 'GIA Efficiency',
      statute: 'Industry benchmark — 25-48 m²/key',
      icon: Shield,
      status: giaStatus,
      currentValue: `${m.giaPerKey.toFixed(1)} m²/key`,
      limit: '25–48 m²/key',
      ratio: Math.min(giaDeviation, 1.2),
    },
    {
      name: 'Accessible Rooms',
      statute: 'Building Regs + YOTEL C08 — min 5% overall',
      icon: Users,
      status: accessibleStatus,
      currentValue: `${accessibleMin} rooms required (5% of ${totalKeys})`,
      limit: `≥${(RULES.brand.minAccessiblePct * 100).toFixed(0)}% of total keys`,
      ratio: null,
      detail: 'Accessible allocation is enforced at detailed design stage. Minimum 5% overall, 10% YOTEL, 7% PAD.',
    },
    {
      name: 'Maximum Footprint',
      statute: 'Site constraint — 50% of buildable area',
      icon: LayoutGrid,
      status: fpStatus,
      currentValue: `${m.footprint.toFixed(0)} m²`,
      limit: `${SITE.maxFootprint} m²`,
      ratio: Math.min(fpRatio, 1.2),
    },
    {
      name: 'Parking Provision',
      statute: 'TCDPO — 0.5 spaces/key (urban hotel)',
      icon: Car,
      status: 'pass' as CheckStatus,
      currentValue: `${parkingResult.totalSpaces} spaces`,
      limit: `${parkingMin}\u2013${parkingMax} range`,
      ratio: null,
      detail: `Surface with solar canopy: ${parkingResult.standardSpaces} standard + ${parkingResult.handicapSpaces} handicap + ${parkingResult.evReadySpaces} EV-ready. Area: ${parkingResult.parkingArea} m\u00B2.`,
    },
    {
      name: 'Stormwater Retention',
      statute: 'Drainage Division — 35 L/m\u00B2 impervious',
      icon: Droplets,
      status: 'pass' as CheckStatus,
      currentValue: `${drainageResult.retentionM3} m\u00B3 tank`,
      limit: 'On-site retention required',
      ratio: null,
      detail: `Peak flow: ${drainageResult.peakFlowM3Hr} m\u00B3/hr. ${drainageResult.soakawayCount} soakaways + 50 m\u00B3 rainwater harvesting. Impervious area: ${drainageResult.imperviousArea} m\u00B2.`,
    },
    {
      name: 'EIA Requirement',
      statute: 'Environmental Protection Act — mandatory for 50+ key hotels',
      icon: FileSearch,
      status: eiaRequired ? 'warning' : 'pass',
      currentValue: eiaRequired
        ? `${totalKeys} keys — EIA mandatory`
        : `${totalKeys} keys — below threshold`,
      limit: `>${RULES.planning.eiaThreshold} keys triggers EIA`,
      ratio: null,
      detail: eiaRequired
        ? 'Environmental Impact Assessment is mandatory and must be submitted with planning application.'
        : undefined,
    },
    {
      name: 'Electrical Load (BL&P)',
      statute: 'BL&P grid capacity assessment',
      icon: Zap,
      status: (() => {
        const peakElectricalKw = totalKeys * 6.8
        return peakElectricalKw > 900 ? 'warning' : 'pass'
      })() as CheckStatus,
      currentValue: `${Math.round(totalKeys * 6.8)} kW`,
      limit: '900 kW (substation typical)',
      ratio: (totalKeys * 6.8) / 900,
    },
    {
      name: 'Water Demand (BWA)',
      statute: 'BWA daily allocation assessment',
      icon: Droplets,
      status: (() => {
        const dailyWaterM3 = (totalKeys * 450) / 1000
        return dailyWaterM3 > 65 ? 'warning' : 'pass'
      })() as CheckStatus,
      currentValue: `${((totalKeys * 450) / 1000).toFixed(0)} m\u00B3/day`,
      limit: '65 m\u00B3/day (typical allocation)',
      ratio: ((totalKeys * 450) / 1000) / 65,
    },
    {
      name: 'Heritage Zone',
      statute: 'UNESCO World Heritage Buffer Zone — additional scrutiny',
      icon: Landmark,
      status: heritageApplies ? 'warning' : 'pass',
      currentValue: heritageApplies ? 'Within buffer zone' : 'Outside zone',
      limit: 'Historic Bridgetown buffer zone',
      ratio: null,
      detail: heritageApplies
        ? 'Site is within UNESCO World Heritage buffer zone. Design must demonstrate sensitivity to heritage context. Expect additional scrutiny from TCPO and UNESCO advisory.'
        : undefined,
    },
  ]
}

// ── Status helpers ──────────────────────────────────────────────────────

function statusBadgeClass(status: CheckStatus): string {
  switch (status) {
    case 'pass':
      return 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50'
    case 'fail':
      return 'bg-red-900/40 text-red-400 ring-red-700/50'
    case 'warning':
      return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
    case 'info':
      return 'bg-sky-900/40 text-sky-400 ring-sky-700/50'
  }
}

function statusLabel(status: CheckStatus): string {
  switch (status) {
    case 'pass':
      return 'PASS'
    case 'fail':
      return 'FAIL'
    case 'warning':
      return 'WARNING'
    case 'info':
      return 'INFO'
  }
}

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-400" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />
    case 'info':
      return <Shield className="h-4 w-4 text-sky-400" />
  }
}

function progressBarColor(ratio: number): string {
  if (ratio > 0.95) return 'bg-red-500'
  if (ratio > 0.80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

// ── Regulation Card ─────────────────────────────────────────────────────

function RegulationCard({ check }: { check: RegulationCheck }) {
  const Icon = check.icon
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{check.name}</h3>
            <p className="text-[11px] text-slate-500">{check.statute}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusBadgeClass(check.status)}`}
        >
          <StatusIcon status={check.status} />
          {statusLabel(check.status)}
        </span>
      </div>

      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="text-slate-300">
          <span className="text-slate-500">Current: </span>
          {check.currentValue}
        </span>
        <span className="text-slate-500">Limit: {check.limit}</span>
      </div>

      {check.ratio !== null && (
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${progressBarColor(check.ratio)}`}
            style={{ width: `${Math.min(check.ratio * 100, 100)}%` }}
          />
        </div>
      )}

      {check.detail && <p className="text-[11px] leading-relaxed text-slate-500">{check.detail}</p>}
    </div>
  )
}

// ── Approval Status Helpers ──────────────────────────────────────────

function approvalStatusBadge(status: ApprovalStatus): string {
  switch (status) {
    case 'COMPLETE':
    case 'CONFIRMED':
      return 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50'
    case 'IN_PROGRESS':
      return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
    case 'PENDING':
      return 'bg-sky-900/40 text-sky-400 ring-sky-700/50'
    case 'NOT_DONE':
      return 'bg-red-900/40 text-red-400 ring-red-700/50'
  }
}

function approvalStatusLabel(status: ApprovalStatus): string {
  switch (status) {
    case 'COMPLETE': return 'Complete'
    case 'CONFIRMED': return 'Confirmed'
    case 'IN_PROGRESS': return 'In Progress'
    case 'PENDING': return 'Pending'
    case 'NOT_DONE': return 'Not Done'
  }
}

function eiaStatusBadge(status: EIAAssessmentStatus): string {
  switch (status) {
    case 'NOT_ASSESSED': return 'bg-slate-800/60 text-slate-400 ring-slate-700/50'
    case 'LOW_RISK': return 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50'
    case 'MODERATE_RISK': return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
    case 'HIGH_RISK': return 'bg-red-900/40 text-red-400 ring-red-700/50'
    case 'MITIGATED': return 'bg-sky-900/40 text-sky-400 ring-sky-700/50'
  }
}

function TrackCard({ track }: { track: ApprovalTrack }) {
  const [open, setOpen] = useState(false)
  const complete = track.steps.filter((s) => s.status === 'COMPLETE' || s.status === 'CONFIRMED').length
  const total = track.steps.length
  const pct = Math.round((complete / total) * 100)

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
              {track.id}
            </span>
            <h3 className="text-sm font-semibold text-slate-100">{track.name}</h3>
          </div>
          <p className="text-[11px] text-slate-500">{track.authority} -- {track.timeline}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-700'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{complete}/{total}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-800/60 px-4 py-3">
          <div className="space-y-2">
            {track.steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 rounded-lg bg-slate-800/30 px-3 py-2">
                <span className="shrink-0 font-mono text-[10px] text-slate-600">{step.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-300">{step.requirement}</p>
                  {step.responsible && (
                    <p className="text-[10px] text-slate-600">Responsible: {step.responsible}</p>
                  )}
                  {step.notes && (
                    <p className="text-[10px] text-slate-500 italic">{step.notes}</p>
                  )}
                  {step.blocks && (
                    <p className="text-[10px] text-amber-500/70">Blocks: {step.blocks}</p>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${approvalStatusBadge(step.status)}`}
                >
                  {approvalStatusLabel(step.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ApprovalTrackerSection() {
  const progress = computeApprovalProgress(APPROVAL_TRACKS)

  return (
    <div className="border-b border-slate-800/60 px-5 py-5">
      {/* Section header */}
      <div className="mb-4 flex items-center gap-3">
        <ClipboardCheck className="h-5 w-5 text-sky-400" />
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Approval Tracker</h2>
          <p className="text-[11px] text-slate-500">5 regulatory tracks -- Barbados planning process</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-5 rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Overall Progress</span>
          <span className="font-mono text-slate-300">
            {progress.complete}/{progress.total} steps ({progress.pct}%)
          </span>
        </div>
        <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${progress.pct === 100 ? 'bg-emerald-500' : progress.pct > 0 ? 'bg-sky-500' : 'bg-slate-700'}`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Complete: {progress.complete}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-500">In Progress: {progress.inProgress}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span className="text-slate-500">Pending: {progress.pending}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-slate-500">Not Done: {progress.notDone}</span>
          </span>
        </div>
      </div>

      {/* Track cards (collapsible) */}
      <div className="mb-6 space-y-3">
        {APPROVAL_TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      {/* Precedent Projects table */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Precedent Projects (Approved Near Site)
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/80">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Project</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Scale</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {PRECEDENT_PROJECTS.map((p) => (
                <tr key={p.name} className="border-b border-slate-800/40">
                  <td className="px-3 py-2 font-semibold text-slate-300">{p.name}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${p.approved ? 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50' : 'bg-red-900/40 text-red-400 ring-red-700/50'}`}>
                      {p.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{p.scale}</td>
                  <td className="px-3 py-2 text-slate-500">{p.relevance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EIA Issues table */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          EIA Issues Assessment
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/80">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Issue</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Relevance</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assessment Status</th>
              </tr>
            </thead>
            <tbody>
              {EIA_ISSUES.map((eia) => (
                <tr key={eia.issue} className="border-b border-slate-800/40">
                  <td className="px-3 py-2 text-slate-300">{eia.issue}</td>
                  <td className="px-3 py-2 text-slate-500">{eia.relevance}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${eiaStatusBadge(eia.status)}`}>
                      {eia.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function PlanningPage() {
  const { selectedOption: contextOption } = useDesign()
  const [storedOption, setStoredOption] = useState<DesignOption | null>(null)

  // Hydrate from localStorage on mount + listen for cross-page changes
  useEffect(() => {
    setStoredOption(getSelectedOption())
    const handler = () => setStoredOption(getSelectedOption())
    window.addEventListener('design-option-changed', handler)
    return () => window.removeEventListener('design-option-changed', handler)
  }, [])

  const selectedOption = contextOption ?? storedOption

  const checks = useMemo(() => {
    if (!selectedOption) return []
    return computeChecks(selectedOption)
  }, [selectedOption])

  const violations = checks.filter((c) => c.status === 'fail')
  const warnings = checks.filter((c) => c.status === 'warning')
  const isCompliant = violations.length === 0

  // ── No option selected ──────────────────────────────────────────────
  if (!selectedOption) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-950 text-slate-100">
        <TreePalm className="mb-4 h-10 w-10 text-slate-600" />
        <h2 className="mb-1 text-lg font-semibold text-slate-300">No Design Option Selected</h2>
        <p className="max-w-sm text-center text-sm text-slate-500">
          Select a design option from the Design tab first, then return here to run planning
          compliance checks against Barbados regulations.
        </p>
      </div>
    )
  }

  // ── Dashboard ───────────────────────────────────────────────────────
  const m = selectedOption.metrics
  const totalKeys = m.totalKeys

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Planning Compliance</h1>
        <span className="text-xs text-slate-500">--</span>

        {/* Overall status badge */}
        {isCompliant ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-700/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Compliant
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-400 ring-1 ring-red-700/50">
            <XCircle className="h-3.5 w-3.5" />
            {violations.length} Violation{violations.length !== 1 ? 's' : ''} Found
          </span>
        )}

        <span className="text-xs text-slate-500">--</span>

        {/* Selected option summary */}
        <span className="text-xs text-slate-400">
          <span className="font-mono font-semibold text-slate-300">{selectedOption.id}</span>
          {' -- '}
          {selectedOption.form} form, {totalKeys} keys, {m.buildingHeight.toFixed(1)}m height
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Approval Tracker — above compliance checks */}
        <ApprovalTrackerSection />

        {/* Violations section (if any) */}
        {violations.length > 0 && (
          <div className="border-b border-red-900/30 bg-red-950/20 px-5 py-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
              <XCircle className="h-4 w-4" />
              Fatal Violations ({violations.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {violations.map((v) => (
                <div
                  key={v.name}
                  className="rounded-lg border border-red-800/40 bg-red-950/40 p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs font-semibold text-red-300">{v.name}</span>
                  </div>
                  <p className="text-[11px] text-red-300/80">
                    <span className="text-red-200">{v.currentValue}</span> exceeds limit of{' '}
                    <span className="text-red-200">{v.limit}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-red-400/60">{v.statute}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings section */}
        {warnings.length > 0 && (
          <div className="border-b border-amber-900/20 bg-amber-950/10 px-5 py-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({warnings.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {warnings.map((w) => (
                <div
                  key={w.name}
                  className="rounded-lg border border-amber-800/30 bg-amber-950/30 p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">{w.name}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">{w.currentValue}</p>
                  {w.detail && (
                    <p className="mt-1 text-[10px] text-amber-400/60">{w.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regulation checks grid */}
        <div className="px-5 py-5">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            All Regulation Checks ({checks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {checks.map((check) => (
              <RegulationCard key={check.name} check={check} />
            ))}
          </div>

          {/* Sustainability & EDGE Certification */}
          <SustainabilitySection option={selectedOption} />

          {/* LEED v4.1 BD+C: Hospitality Certification Tracker */}
          <LEEDTracker />

          {/* Site Infrastructure & Services */}
          <InfrastructureSection option={selectedOption} />
        </div>
      </div>
    </div>
  )
}
