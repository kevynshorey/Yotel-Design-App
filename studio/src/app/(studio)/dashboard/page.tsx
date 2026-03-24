'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  ClipboardCheck,
  TrendingUp,
  Leaf,
  FolderOpen,
  Users,
  ArrowRight,
  LayoutList,
  Plus,
  MapPin,
  Building2,
} from 'lucide-react'
import { getSelectedOption } from '@/store/design-store'
import { getActiveProject, getProjects } from '@/store/project-store'
import type { Project } from '@/store/project-store'
import { CONSTRUCTION_PROGRAMME } from '@/config/schedule'
import { SUSTAINABILITY } from '@/config/sustainability'
import { ProjectWizard } from '@/components/project/project-wizard'
import type { DesignOption } from '@/engine/types'

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export default function DashboardPage() {
  const [option, setOption] = useState<DesignOption | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [projectCount, setProjectCount] = useState(0)
  const [wizardOpen, setWizardOpen] = useState(false)

  function refreshProject() {
    setActiveProject(getActiveProject())
    setProjectCount(getProjects().length)
  }

  useEffect(() => {
    setMounted(true)
    setOption(getSelectedOption())
    refreshProject()

    function onDesignChanged() {
      setOption(getSelectedOption())
    }
    function onProjectChanged() {
      refreshProject()
    }
    window.addEventListener('design-option-changed', onDesignChanged)
    window.addEventListener('active-project-changed', onProjectChanged)
    window.addEventListener('projects-changed', onProjectChanged)
    return () => {
      window.removeEventListener('design-option-changed', onDesignChanged)
      window.removeEventListener('active-project-changed', onProjectChanged)
      window.removeEventListener('projects-changed', onProjectChanged)
    }
  }, [])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const phases = CONSTRUCTION_PROGRAMME.phases
  const totalMonths = CONSTRUCTION_PROGRAMME.totalMonths

  const edgeScore = 'Advanced'
  const renewablePct = SUSTAINABILITY.energy.renewablePct
  const waterEfficiency = SUSTAINABILITY.water.potableReductionTarget

  // Compute finance metrics from option
  const tdc = option ? option.cost.total : null
  const costPerKey = option ? option.cost.perKey : null
  const gopMargin = option ? option.revenue.gopMargin : null
  const yieldOnCost =
    option && option.cost.total > 0
      ? option.revenue.stabilisedNoi / option.cost.total
      : null

  // Investor metrics
  const stabilisedNoi = option ? option.revenue.stabilisedNoi : null
  const exitValue =
    stabilisedNoi != null ? stabilisedNoi / 0.075 : null // 7.5% cap rate
  const targetIrr = 0.18

  // Compliance
  const isCompliant = option ? option.validation.isValid : null
  const warningCount = option ? option.validation.warnings.length : 0
  const violationCount = option
    ? option.validation.violations.length
    : 0

  // Project display values
  const projectName = activeProject?.name ?? 'No Project'
  const projectLocation = activeProject?.location ?? ''
  const projectDesc = activeProject
    ? `${activeProject.totalKeys}-key ${activeProject.brandConfig.secondary ? 'dual-brand ' : ''}${activeProject.brandConfig.primary}${activeProject.brandConfig.secondary ? ` & ${activeProject.brandConfig.secondary}` : ''}`
    : ''

  const cards = [
    {
      title: 'Design',
      href: '/design',
      icon: Compass,
      content: option ? (
        <>
          <p className="text-sm text-slate-300">
            Form: <span className="font-semibold text-white">{option.form}</span>
            {' '}&middot;{' '}Score: <span className="font-semibold text-sky-400">{option.score.toFixed(0)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {option.metrics.totalKeys} keys &middot; {formatNumber(option.metrics.gia)} m&sup2; GIA
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">No option selected &mdash; generate options</p>
      ),
    },
    {
      title: 'Planning',
      href: '/planning',
      icon: ClipboardCheck,
      content: option ? (
        <>
          <p className="text-sm">
            <span
              className={
                isCompliant
                  ? 'font-semibold text-emerald-400'
                  : 'font-semibold text-red-400'
              }
            >
              {isCompliant ? 'COMPLIANT' : `${violationCount} violation${violationCount !== 1 ? 's' : ''}`}
            </span>
          </p>
          {warningCount > 0 && (
            <p className="mt-1 text-xs text-amber-400">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400">Select a design option first</p>
      ),
    },
    {
      title: 'Finance',
      href: '/finance',
      icon: TrendingUp,
      content: option ? (
        <>
          <p className="text-sm text-slate-300">
            TDC: <span className="font-semibold text-white">{formatCurrency(tdc!)}</span>
            {' '}&middot;{' '}
            {formatCurrency(costPerKey!)}/key
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Yield: {formatPct(yieldOnCost!)} &middot; GOP margin: {formatPct(gopMargin!)}
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">Link a design option for live financials</p>
      ),
    },
    {
      title: 'Sustainability',
      href: '/planning',
      icon: Leaf,
      content: (
        <>
          <p className="text-sm text-slate-300">
            EDGE: <span className="font-semibold text-emerald-400">{edgeScore}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Renewable: {formatPct(renewablePct)} &middot; Water efficiency: {formatPct(waterEfficiency)}
          </p>
        </>
      ),
    },
    {
      title: 'Data Room',
      href: '/dataroom',
      icon: FolderOpen,
      content: (
        <>
          <p className="text-sm text-slate-300">38 documents &middot; 319 MB</p>
          <p className="mt-1 text-xs text-slate-400">6 categories indexed</p>
        </>
      ),
    },
    {
      title: 'Investor Portal',
      href: '/invest',
      icon: Users,
      content: option ? (
        <>
          <p className="text-sm text-slate-300">
            Stabilised NOI: <span className="font-semibold text-white">{formatCurrency(stabilisedNoi!)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Exit value: {formatCurrency(exitValue!)} &middot; Target IRR: {formatPct(targetIrr)}
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">Link design option</p>
      ),
    },
  ]

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero — dynamic per project */}
        <div
          className={`mb-10 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {projectName}{' '}
            {projectLocation && (
              <span className="text-sky-400">&middot; {projectLocation}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {projectDesc || 'Development project'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{today}</p>

          {/* Active project quick stats */}
          {activeProject && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs text-slate-300">{activeProject.totalKeys} keys</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs text-slate-300">{activeProject.planningRules.jurisdiction}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5">
                <span className="text-xs text-slate-300">
                  Site: {formatNumber(activeProject.siteConfig.grossArea)} m&sup2;
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5">
                <span className="text-xs text-slate-300">
                  Buildable: {formatNumber(activeProject.siteConfig.buildableAreaSqm)} m&sup2;
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Empty state — prompt to create project */}
        {projectCount === 0 && (
          <div className="mb-10">
            <button
              onClick={() => setWizardOpen(true)}
              className="group flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-white/10 bg-slate-900/40 p-8 transition-colors hover:border-sky-500/30 hover:bg-slate-900/60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
                <Plus className="h-6 w-6 text-sky-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Create Your First Project</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Set up a new development project with site boundary, programme, and planning rules
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-sky-400" />
            </button>
          </div>
        )}

        {/* Summary cards 3x2 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-xl border border-white/10 bg-slate-900/80 p-5 transition-colors hover:border-sky-500/30"
            >
              <div className="mb-3 flex items-center gap-2">
                <card.icon className="h-4 w-4 text-sky-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {card.title}
                </h2>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-400" />
              </div>
              {card.content}
            </Link>
          ))}
        </div>

        {/* Construction Timeline */}
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Construction Timeline
          </h2>
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6">
            <div className="space-y-3">
              {phases.map((phase) => {
                const widthPct = (phase.months / totalMonths) * 100
                return (
                  <div key={phase.name} className="flex items-center gap-4">
                    <span className="w-48 shrink-0 text-xs text-slate-400">
                      {phase.name}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div
                        className="h-6 rounded bg-sky-500/60"
                        style={{ width: `${widthPct}%`, minWidth: '2rem' }}
                      />
                      <span className="text-xs font-medium text-slate-500">
                        {phase.months}mo
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {totalMonths} months total programme &middot; {CONSTRUCTION_PROGRAMME.netConstructionMonths} months net construction
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/design"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            Generate Options
          </Link>
          <Link
            href="/design?view=table"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-sky-500/30 hover:text-white"
          >
            <LayoutList className="h-4 w-4" />
            View All Options
          </Link>
          <Link
            href="/report"
            className="rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-sky-500/30 hover:text-white"
          >
            Export Report
          </Link>
          <Link
            href="/planning"
            className="rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-sky-500/30 hover:text-white"
          >
            View Compliance
          </Link>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-sky-500/30 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Wizard modal */}
      {wizardOpen && (
        <ProjectWizard
          onClose={() => setWizardOpen(false)}
          onCreated={() => refreshProject()}
        />
      )}
    </div>
  )
}
