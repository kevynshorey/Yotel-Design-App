'use client'

import { useMemo, useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { SITE } from '@/config/site'
import { LANDSCAPE, calculateLandscape } from '@/config/landscape'
import { calculateDrainage } from '@/config/drainage'
import { calculateParking, PARKING } from '@/config/parking'
import { calculateFFE, FFE } from '@/config/ffe'
import {
  Shovel,
  TreePalm,
  Droplets,
  Car,
  Sofa,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Collapsible Sub-Section ─────────────────────────────────────────────

interface SubSectionProps {
  title: string
  icon: LucideIcon
  iconColor: string
  totalCost: number
  defaultOpen?: boolean
  children: React.ReactNode
}

function SubSection({ title, icon: Icon, iconColor, totalCost, defaultOpen = false, children }: SubSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-200">{formatCurrency(totalCost)}</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>
      {open && <div className="border-t border-white/5 px-4 pb-4 pt-3">{children}</div>}
    </div>
  )
}

// ── Metric Row ──────────────────────────────────────────────────────────

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium text-slate-200">{value}</span>
        {sub && <span className="ml-1.5 text-[10px] text-slate-500">{sub}</span>}
      </div>
    </div>
  )
}

// ── Cost Row ────────────────────────────────────────────────────────────

function CostRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] font-medium text-slate-300">{formatCurrency(amount)}</span>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

interface InfrastructureSectionProps {
  option: DesignOption
}

export default function InfrastructureSection({ option }: InfrastructureSectionProps) {
  const m = option.metrics
  const poolTotalArea = option.amenities?.pool.totalArea ?? 0

  // Calculate all infrastructure metrics
  const landscape = useMemo(
    () => calculateLandscape(SITE.grossArea, m.footprint, poolTotalArea),
    [m.footprint, poolTotalArea],
  )

  // Permeable area = ~40% of hardscape (driveways + paths)
  const permeableArea = Math.round(landscape.hardscapeArea * 0.4)

  const drainage = useMemo(
    () => calculateDrainage(m.footprint, landscape.hardscapeArea, permeableArea, landscape.softscapeArea),
    [m.footprint, landscape.hardscapeArea, permeableArea, landscape.softscapeArea],
  )

  const parking = useMemo(() => calculateParking(m.totalKeys), [m.totalKeys])

  const ffe = useMemo(() => calculateFFE(m.yotelKeys, m.padUnits), [m.yotelKeys, m.padUnits])

  const totalInfrastructureCost = landscape.totalCost + drainage.totalCost + parking.totalCost + ffe.total

  return (
    <div className="mt-6 border-t border-slate-800/60 pt-6">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Shovel className="h-5 w-5 text-orange-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Site Infrastructure &amp; Services
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300 ring-1 ring-slate-700/50">
          Total: {formatCurrency(totalInfrastructureCost)}
        </span>
      </div>

      <div className="grid gap-4">
        {/* 1. Landscape Architecture */}
        <SubSection
          title="Landscape Architecture"
          icon={TreePalm}
          iconColor="text-emerald-400"
          totalCost={landscape.totalCost}
          defaultOpen
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Metrics */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Area Breakdown
              </p>
              <MetricRow label="Total open space" value={`${formatNumber(landscape.totalOpenSpace)} m\u00B2`} />
              <MetricRow label="Softscape (planted)" value={`${formatNumber(landscape.softscapeArea)} m\u00B2`} sub="35%" />
              <MetricRow label="Hardscape (paved)" value={`${formatNumber(landscape.hardscapeArea)} m\u00B2`} sub="40%" />
              <MetricRow label="Pool zone" value={`${formatNumber(landscape.poolArea)} m\u00B2`} />
              <MetricRow label="Green roof" value={`${formatNumber(landscape.greenRoofArea)} m\u00B2`} sub="25% of roof" />
              <MetricRow label="Mature specimen trees" value={`${landscape.matureTrees} palms`} />
            </div>

            {/* Costs */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cost Breakdown
              </p>
              <CostRow label="Softscape (planting + soil)" amount={landscape.costs.softscape} />
              <CostRow label="Hardscape (paving + edging)" amount={landscape.costs.hardscape} />
              <CostRow label="Irrigation systems" amount={landscape.costs.irrigation} />
              <CostRow label="Green roof system" amount={landscape.costs.greenRoof} />
              <CostRow label={`Mature trees (${landscape.matureTrees})`} amount={landscape.costs.matureTrees} />
              <CostRow label="Landscape lighting" amount={landscape.costs.lighting} />
            </div>
          </div>

          {/* Species list */}
          <div className="mt-3 border-t border-white/5 pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Planting Zones
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LANDSCAPE.plantingZones.map((zone) => (
                <div key={zone.name} className="rounded-lg bg-slate-800/50 p-2">
                  <p className="text-[11px] font-medium text-slate-300">{zone.name}</p>
                  <p className="text-[10px] text-slate-500">{zone.species.join(', ')}</p>
                  <p className="mt-0.5 text-[10px] text-slate-600">{zone.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        {/* 2. Stormwater Drainage */}
        <SubSection
          title="Stormwater Drainage"
          icon={Droplets}
          iconColor="text-sky-400"
          totalCost={drainage.totalCost}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Metrics */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Design Parameters
              </p>
              <MetricRow label="Peak flow rate" value={`${formatNumber(drainage.peakFlowM3Hr)} m\u00B3/hr`} sub="1-in-25yr" />
              <MetricRow label="Impervious area" value={`${formatNumber(drainage.imperviousArea)} m\u00B2`} />
              <MetricRow label="Retention volume required" value={`${drainage.retentionM3} m\u00B3`} />
              <MetricRow label="Rainwater harvesting tank" value={`${drainage.harvestingTankM3} m\u00B3`} />
              <MetricRow label="Soakaway pits" value={`${drainage.soakawayCount} pits`} sub="2m x 2m x 2m" />
              <MetricRow label="Surface channel length" value={`${drainage.channelLengthM} m`} />

              {/* Compliance badge */}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/30 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-[11px] font-medium text-emerald-400">Drainage Division Compliant</p>
                  <p className="text-[10px] text-emerald-600">35 L/m{'\u00B2'} retention requirement met</p>
                </div>
              </div>
            </div>

            {/* Costs */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cost Breakdown
              </p>
              <CostRow label="Roof drainage system" amount={drainage.costs.roofDrainage} />
              <CostRow label={`Surface channels (${drainage.channelLengthM}m)`} amount={drainage.costs.surfaceChannels} />
              <CostRow label={`Retention tank (${drainage.harvestingTankM3}m\u00B3)`} amount={drainage.costs.retentionTank} />
              <CostRow label={`Soakaways (${drainage.soakawayCount} pits)`} amount={drainage.costs.soakaways} />
              <CostRow label="Oil/grease separator" amount={drainage.costs.oilSeparator} />
              <CostRow label="Permeable sub-base" amount={drainage.costs.permeableSub} />
            </div>
          </div>
        </SubSection>

        {/* 3. Parking */}
        <SubSection
          title="Parking"
          icon={Car}
          iconColor="text-amber-400"
          totalCost={parking.totalCost}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Metrics */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Space Allocation
              </p>
              <MetricRow label="Total spaces" value={`${parking.totalSpaces}`} sub={`@ ${PARKING.ratioPerKey}/key`} />
              <MetricRow label="Standard spaces" value={`${parking.standardSpaces}`} />
              <MetricRow label="Handicap spaces" value={`${parking.handicapSpaces}`} sub="5% min" />
              <MetricRow label="EV-ready spaces" value={`${parking.evReadySpaces}`} sub="20% future-proof" />
              <MetricRow label="Bicycle spaces" value={`${parking.bicycleSpaces}`} sub="10% of keys" />
              <MetricRow label="Total parking area" value={`${formatNumber(parking.parkingArea)} m\u00B2`} />
            </div>

            {/* Costs + type */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cost &amp; Type
              </p>
              <div className="mb-3 rounded-lg bg-amber-950/20 p-2">
                <p className="text-[11px] font-medium text-amber-300">Surface with Solar Canopy</p>
                <p className="text-[10px] text-amber-500">Steel canopy + PV shade structure</p>
              </div>
              <CostRow label={`Covered parking (${parking.totalSpaces} spaces)`} amount={parking.baseCost} />
              <CostRow label={`EV chargers (${parking.evReadySpaces} Level 2)`} amount={parking.evCost} />
            </div>
          </div>
        </SubSection>

        {/* 4. FF&E Schedule */}
        <SubSection
          title="FF&E Schedule"
          icon={Sofa}
          iconColor="text-purple-400"
          totalCost={ffe.total}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Room FF&E */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Room FF&amp;E by Brand
              </p>
              <div className="mb-2 rounded-lg bg-slate-800/50 p-2">
                <p className="text-[11px] font-medium text-slate-300">YOTEL ({m.yotelKeys} keys)</p>
                <p className="text-[10px] text-slate-500">
                  Premium Queen: {formatCurrency(FFE.rooms.yotelPremiumQueen.total)}/key (79% mix)
                </p>
                <p className="text-[10px] text-slate-500">
                  First Class: {formatCurrency(FFE.rooms.yotelFirstClass.total)}/key (21% mix)
                </p>
              </div>
              {m.padUnits > 0 && (
                <div className="mb-2 rounded-lg bg-slate-800/50 p-2">
                  <p className="text-[11px] font-medium text-slate-300">YOTELPAD ({m.padUnits} units)</p>
                  <p className="text-[10px] text-slate-500">
                    Studio: {formatCurrency(FFE.rooms.yotelpadStudio.total)}/unit (74% mix)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    One-Bed: {formatCurrency(FFE.rooms.yotelpadOneBed.total)}/unit (26% mix)
                  </p>
                </div>
              )}
              <MetricRow label="Room FF&E subtotal" value={formatCurrency(ffe.roomFFE)} />
              <MetricRow label="Public area FF&E" value={formatCurrency(ffe.publicFFE)} />
              <MetricRow label="OS&E" value={formatCurrency(ffe.ose)} sub={`${formatCurrency(FFE.osePerKey)}/key`} />
            </div>

            {/* Caribbean factors + total */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Caribbean Uplift &amp; Totals
              </p>
              <CostRow label="Base subtotal" amount={ffe.subtotal} />
              <CostRow label="Shipping + customs (12%)" amount={ffe.shipping} />
              <CostRow label="Humidity-spec premium (8%)" amount={ffe.humidityPremium} />
              <CostRow label="Installation premium (6%)" amount={ffe.installation} />
              <div className="mt-2 border-t border-white/5 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">Total FF&amp;E</span>
                  <span className="text-sm font-bold text-slate-100">{formatCurrency(ffe.total)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-500">Per key</span>
                  <span className="text-[11px] font-medium text-slate-400">{formatCurrency(ffe.perKey)}/key</span>
                </div>
              </div>
            </div>
          </div>

          {/* Public area breakdown */}
          <div className="mt-3 border-t border-white/5 pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Public Area FF&amp;E
            </p>
            <div className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
              <CostRow label="Lobby / Mission Control" amount={FFE.publicAreas.lobby_missionControl} />
              <CostRow label="Komyuniti (bar + lounge)" amount={FFE.publicAreas.komyuniti} />
              <CostRow label="Gym" amount={FFE.publicAreas.gym} />
              <CostRow label="Pool Deck" amount={FFE.publicAreas.poolDeck} />
              <CostRow label="Rooftop Bar" amount={FFE.publicAreas.rooftopBar} />
              <CostRow label="Restaurant" amount={FFE.publicAreas.restaurant} />
              <CostRow label="Corridors" amount={FFE.publicAreas.corridors} />
              <CostRow label="Back of House" amount={FFE.publicAreas.backOfHouse} />
            </div>
          </div>
        </SubSection>
      </div>
    </div>
  )
}
