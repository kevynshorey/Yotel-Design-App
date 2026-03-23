'use client'

import { useMemo } from 'react'
import type { DesignOption } from '@/engine/types'
import { calculateSustainability, type SustainabilityMetrics } from '@/engine/sustainability'
import { SUSTAINABILITY } from '@/config/sustainability'
import {
  Leaf,
  Sun,
  Droplets,
  Factory,
  Zap,
  CheckCircle2,
  Circle,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────

function edgeScoreBadgeClass(score: number): string {
  if (score >= 70) return 'bg-emerald-900/40 text-emerald-400 ring-emerald-700/50'
  if (score >= 50) return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
  return 'bg-red-900/40 text-red-400 ring-red-700/50'
}

function pctColor(value: number, greenThreshold: number, amberThreshold: number): string {
  if (value >= greenThreshold) return 'text-emerald-400'
  if (value >= amberThreshold) return 'text-amber-400'
  return 'text-red-400'
}

function pctBarColor(value: number, greenThreshold: number, amberThreshold: number): string {
  if (value >= greenThreshold) return 'bg-emerald-500'
  if (value >= amberThreshold) return 'bg-amber-500'
  return 'bg-red-500'
}

function invertedColor(value: number, greenThreshold: number, amberThreshold: number): string {
  if (value < greenThreshold) return 'text-emerald-400'
  if (value <= amberThreshold) return 'text-amber-400'
  return 'text-red-400'
}

function invertedBarColor(value: number, greenThreshold: number, amberThreshold: number): string {
  if (value < greenThreshold) return 'bg-emerald-500'
  if (value <= amberThreshold) return 'bg-amber-500'
  return 'bg-red-500'
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

// ── EDGE Timeline Step ───────────────────────────────────────────────────

interface TimelineStep {
  label: string
  detail?: string
  completed: boolean
}

function EdgeTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto">
      {steps.map((step, i) => (
        <div key={step.label} className="flex min-w-0 flex-1 items-start">
          <div className="flex flex-col items-center">
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-slate-600" />
            )}
            <div className="mt-2 px-1 text-center">
              <p className="text-[11px] font-medium text-slate-300">{step.label}</p>
              {step.detail && (
                <p className="text-[10px] text-slate-500">{step.detail}</p>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="mt-2.5 h-px min-w-4 flex-1 bg-slate-700" />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────

interface SustainabilitySectionProps {
  option: DesignOption | null
}

export default function SustainabilitySection({ option }: SustainabilitySectionProps) {
  const defaultMetrics = { totalKeys: 130, yotelKeys: 100, padUnits: 30, gia: 6000, coverage: 0.30, buildingHeight: 20.5, seaViewPercentage: 0.60, outdoorAmenityArea: 600, costPerKey: 360000, daylightFactor: 0.65, formSimplicity: 0.75 }
  const sustainability = useMemo(
    () => calculateSustainability(option?.metrics ?? defaultMetrics as any),
    [option?.metrics]
  )

  const s = sustainability
  const cfg = SUSTAINABILITY

  // Derived display values
  const renewablePctDisplay = (s.renewableEnergyPct * 100).toFixed(1)
  const waterPctDisplay = (s.waterEfficiencyPct * 100).toFixed(1)
  const embodiedDisplay = s.embodiedCarbonKgM2.toFixed(0)
  const operationalDisplay = s.operationalEnergyKwhM2.toFixed(0)

  // Progress ratios
  const renewableRatio = Math.min(s.renewableEnergyPct / 0.35, 1)
  const waterRatio = Math.min(s.waterEfficiencyPct / 0.40, 1)
  const embodiedRatio = Math.min(s.embodiedCarbonKgM2 / cfg.carbon.embodiedTarget, 1)
  const operationalRatio = Math.min(s.operationalEnergyKwhM2 / cfg.energy.operationalTarget, 1)

  // Cost-benefit
  const certificationCost = cfg.certification.auditCost + cfg.certification.complianceCost
  const annualEnergySavings = 190000
  const annualWaterSavings = 62000
  const totalAnnualSavings = annualEnergySavings + annualWaterSavings
  const simplePayback = certificationCost / totalAnnualSavings
  const npv20Year = 3800000

  const edgeSteps: TimelineStep[] = [
    { label: 'EDGE Preliminary Assessment', detail: formatCurrency(cfg.certification.auditCost), completed: false },
    { label: 'Design Stage Certification', completed: false },
    { label: 'Construction Verification', completed: false },
    { label: 'EDGE Advanced Certified', completed: false },
  ]

  return (
    <div className="border-t border-slate-800/60 mt-6 pt-6">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Sustainability &amp; EDGE Certification
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${edgeScoreBadgeClass(s.edgeScore)}`}
        >
          EDGE Score: {s.edgeScore}/100
        </span>
      </div>

      {/* 4 metric cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Renewable Energy */}
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Renewable Energy
            </h3>
          </div>
          <p className={`text-2xl font-bold ${pctColor(s.renewableEnergyPct, 0.30, 0.20)}`}>
            {renewablePctDisplay}%
            <span className="ml-1.5 text-sm font-normal text-slate-500">of load</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {cfg.energy.pvArrayKw} kW PV array — {formatNumber(cfg.energy.annualGenerationKwh)} kWh/year
          </p>
          <div className="mt-3 mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Progress to 35% target</span>
            <span>{(renewableRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${pctBarColor(s.renewableEnergyPct, 0.30, 0.20)}`}
              style={{ width: `${renewableRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Card 2: Water Efficiency */}
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Water Efficiency
            </h3>
          </div>
          <p className={`text-2xl font-bold ${pctColor(s.waterEfficiencyPct, 0.35, 0.20)}`}>
            {waterPctDisplay}%
            <span className="ml-1.5 text-sm font-normal text-slate-500">reduction</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Greywater recycling + rainwater harvesting
          </p>
          <p className="mt-0.5 text-[10px] text-slate-600">
            Target: 40% potable reduction
          </p>
          <div className="mt-3 mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Progress to 40% target</span>
            <span>{(waterRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${pctBarColor(s.waterEfficiencyPct, 0.35, 0.20)}`}
              style={{ width: `${waterRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Embodied Carbon */}
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Factory className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Embodied Carbon
            </h3>
          </div>
          <p className={`text-2xl font-bold ${invertedColor(s.embodiedCarbonKgM2, 400, 450)}`}>
            {embodiedDisplay}
            <span className="ml-1.5 text-sm font-normal text-slate-500">
              kg CO{'\u2082'}e/m{'\u00B2'}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Target: &lt;450 kg CO{'\u2082'}e/m{'\u00B2'}
          </p>
          <div className="mt-3 mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>vs. 450 target (lower is better)</span>
            <span>{(embodiedRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${invertedBarColor(s.embodiedCarbonKgM2, 400, 450)}`}
              style={{ width: `${embodiedRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Card 4: Operational Energy */}
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operational Energy
            </h3>
          </div>
          <p className={`text-2xl font-bold ${invertedColor(s.operationalEnergyKwhM2, 100, 120)}`}>
            {operationalDisplay}
            <span className="ml-1.5 text-sm font-normal text-slate-500">
              kWh/m{'\u00B2'}/year
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Target: &lt;120 kWh/m{'\u00B2'}/year
          </p>
          <div className="mt-3 mb-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>vs. 120 target (lower is better)</span>
            <span>{(operationalRatio * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${invertedBarColor(s.operationalEnergyKwhM2, 100, 120)}`}
              style={{ width: `${operationalRatio * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* EDGE Certification Pathway */}
      <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/80 p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          EDGE Certification Pathway
        </h3>
        <EdgeTimeline steps={edgeSteps} />
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
          Targeting EDGE Advanced — aligned with Barbados NDC commitments and Green Economy
          initiatives
        </p>
      </div>

      {/* Cost-Benefit Summary */}
      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/80 p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Cost-Benefit Summary
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Certification Cost</p>
            <p className="mt-0.5 text-lg font-bold text-slate-200">
              {formatCurrency(certificationCost)}
            </p>
            <p className="text-[10px] text-slate-600">Audit + compliance</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Annual Energy Savings</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-400">
              ~{formatCurrency(annualEnergySavings)}
            </p>
            <p className="text-[10px] text-slate-600">PV generation</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Annual Water Savings</p>
            <p className="mt-0.5 text-lg font-bold text-sky-400">
              ~{formatCurrency(annualWaterSavings)}
            </p>
            <p className="text-[10px] text-slate-600">Recycled water</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Simple Payback</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-400">
              ~{simplePayback.toFixed(1)} years
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">20-Year NPV</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-400">
              ~{formatCurrency(npv20Year)}
            </p>
            <p className="text-[10px] text-slate-600">Net present value of savings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
