'use client'

import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, MapPin, Building2, Ruler, Scale } from 'lucide-react'
import { createProject, setActiveProject } from '@/store/project-store'
import type { Project, SiteConfig, BrandConfig, PlanningRulesConfig } from '@/store/project-store'

// ── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i < current
                ? 'bg-sky-500 text-white'
                : i === current
                ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-500'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px w-8 transition-colors ${
                i < current ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step labels ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Project Info', 'Site Boundary', 'Programme', 'Planning Rules']
const STEP_ICONS = [MapPin, Ruler, Building2, Scale]

// ── Field component ─────────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors'

const textareaClass =
  'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors resize-none'

// ── Main wizard component ───────────────────────────────────────────────────

interface ProjectWizardProps {
  onClose: () => void
  onCreated?: (project: Project) => void
}

export function ProjectWizard({ onClose, onCreated }: ProjectWizardProps) {
  const [step, setStep] = useState(0)

  // Step 1: Project info
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  // Step 2: Site boundary
  const [coordsText, setCoordsText] = useState('')
  const [useDefault, setUseDefault] = useState(true)

  // Step 3: Programme
  const [totalKeys, setTotalKeys] = useState(100)
  const [primaryBrand, setPrimaryBrand] = useState('')
  const [secondaryBrand, setSecondaryBrand] = useState('')
  const [primaryKeys, setPrimaryKeys] = useState(70)
  const [secondaryKeys, setSecondaryKeys] = useState(30)

  // Step 4: Planning rules
  const [jurisdiction, setJurisdiction] = useState('Custom')
  const [maxCoverage, setMaxCoverage] = useState(0.5)
  const [maxHeight, setMaxHeight] = useState(22)
  const [maxStoreys, setMaxStoreys] = useState(6)
  const [coastalSetback, setCoastalSetback] = useState(30)
  const [sideSetback, setSideSetback] = useState(1.83)
  const [roadSetback, setRoadSetback] = useState(5.79)
  const [eiaRequired, setEiaRequired] = useState(true)

  function parseBoundary(): { x: number; y: number }[] {
    if (useDefault || !coordsText.trim()) {
      // Default 100m x 50m rectangle
      return [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ]
    }
    try {
      // Accept JSON array or simple "x,y" per line
      const trimmed = coordsText.trim()
      if (trimmed.startsWith('[')) {
        return JSON.parse(trimmed)
      }
      return trimmed.split('\n').map((line) => {
        const [xStr, yStr] = line.split(',').map((s) => s.trim())
        return { x: parseFloat(xStr), y: parseFloat(yStr) }
      })
    } catch {
      return [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ]
    }
  }

  function canAdvance(): boolean {
    if (step === 0) return name.trim().length > 0 && location.trim().length > 0
    if (step === 1) return true
    if (step === 2) return totalKeys > 0 && primaryKeys >= 0 && secondaryKeys >= 0
    if (step === 3) return maxHeight > 0 && maxStoreys > 0
    return true
  }

  function handleCreate() {
    const boundary = parseBoundary()

    // Compute a simple bounding box for buildable area (apply uniform 5m offset)
    const xs = boundary.map((p) => p.x)
    const ys = boundary.map((p) => p.y)
    const minX = Math.min(...xs) + 5
    const maxX = Math.max(...xs) - 5
    const minY = Math.min(...ys) + 5
    const maxY = Math.max(...ys) - 5

    const buildableArea = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ]

    const grossArea = Math.abs(
      boundary.reduce((sum, p, i) => {
        const next = boundary[(i + 1) % boundary.length]
        return sum + (p.x * next.y - next.x * p.y)
      }, 0) / 2
    )

    const buildableAreaSqm = Math.abs((maxX - minX) * (maxY - minY))

    const siteConfig: SiteConfig = {
      boundary,
      buildableArea,
      offsets: { W: 5, N: 5, E: 5, S: 5 },
      grossArea: Math.round(grossArea),
      buildableAreaSqm: Math.round(buildableAreaSqm),
      maxCoverage,
      maxHeight,
    }

    const brandConfig: BrandConfig = {
      primary: primaryBrand || name,
      secondary: secondaryBrand || undefined,
      primaryKeys,
      secondaryKeys: secondaryBrand ? secondaryKeys : 0,
    }

    const planningRules: PlanningRulesConfig = {
      jurisdiction,
      coastalSetback,
      maxCoverage,
      maxHeight,
      maxStoreys,
      sideSetback,
      rearSetback: sideSetback,
      roadSetback,
      eiaRequired,
      heritageZone: false,
    }

    const project = createProject({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      totalKeys,
      brandConfig,
      siteConfig,
      planningRules,
    })

    setActiveProject(project.id)
    onCreated?.(project)
    onClose()
  }

  const StepIcon = STEP_ICONS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <StepIcon className="h-5 w-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">New Project</h2>
              <p className="text-xs text-slate-400">{STEP_LABELS[step]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex justify-center border-b border-white/5 py-3">
          <StepIndicator current={step} total={4} />
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Project Name">
                <input
                  className={inputClass}
                  placeholder="e.g. YOTEL Miami Beach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Location">
                <input
                  className={inputClass}
                  placeholder="e.g. Collins Avenue, Miami Beach"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Field>
              <Field label="Description" hint="Optional project summary">
                <textarea
                  className={textareaClass}
                  rows={3}
                  placeholder="Brief description of the development..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={useDefault}
                    onChange={(e) => setUseDefault(e.target.checked)}
                    className="accent-sky-500"
                  />
                  Use default rectangle (100m x 50m)
                </label>
              </div>
              {!useDefault && (
                <Field
                  label="Site Boundary Coordinates"
                  hint='Paste as JSON array [{x,y},...] or one "x,y" per line (metres)'
                >
                  <textarea
                    className={textareaClass}
                    rows={6}
                    placeholder={'0, 0\n100, 0\n100, 50\n0, 50'}
                    value={coordsText}
                    onChange={(e) => setCoordsText(e.target.value)}
                  />
                </Field>
              )}
              <div className="rounded-lg border border-white/5 bg-slate-800/30 p-3">
                <p className="text-xs text-slate-400">
                  You can refine the site boundary later in the Site Planner. A default
                  5m offset will be applied for the buildable area.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Total Keys">
                <input
                  type="number"
                  className={inputClass}
                  min={1}
                  max={2000}
                  value={totalKeys}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0
                    setTotalKeys(v)
                    setPrimaryKeys(Math.max(0, v - secondaryKeys))
                  }}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary Brand" hint="e.g. YOTEL">
                  <input
                    className={inputClass}
                    placeholder="Brand name"
                    value={primaryBrand}
                    onChange={(e) => setPrimaryBrand(e.target.value)}
                  />
                </Field>
                <Field label="Secondary Brand" hint="Optional, e.g. YOTELPAD">
                  <input
                    className={inputClass}
                    placeholder="None"
                    value={secondaryBrand}
                    onChange={(e) => setSecondaryBrand(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary Keys">
                  <input
                    type="number"
                    className={inputClass}
                    min={0}
                    value={primaryKeys}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0
                      setPrimaryKeys(v)
                      setSecondaryKeys(Math.max(0, totalKeys - v))
                    }}
                  />
                </Field>
                <Field label="Secondary Keys">
                  <input
                    type="number"
                    className={inputClass}
                    min={0}
                    value={secondaryKeys}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0
                      setSecondaryKeys(v)
                      setPrimaryKeys(Math.max(0, totalKeys - v))
                    }}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Jurisdiction">
                <select
                  className={inputClass}
                  value={jurisdiction}
                  onChange={(e) => {
                    setJurisdiction(e.target.value)
                    if (e.target.value === 'Barbados') {
                      setMaxCoverage(0.5)
                      setMaxHeight(22)
                      setMaxStoreys(6)
                      setCoastalSetback(30)
                      setSideSetback(1.83)
                      setRoadSetback(5.79)
                      setEiaRequired(true)
                    }
                  }}
                >
                  <option value="Barbados">Barbados (pre-loaded)</option>
                  <option value="Custom">Custom</option>
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Max Coverage">
                  <input
                    type="number"
                    className={inputClass}
                    step={0.05}
                    min={0}
                    max={1}
                    value={maxCoverage}
                    onChange={(e) => setMaxCoverage(parseFloat(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Max Height (m)">
                  <input
                    type="number"
                    className={inputClass}
                    min={0}
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(parseFloat(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Max Storeys">
                  <input
                    type="number"
                    className={inputClass}
                    min={1}
                    max={100}
                    value={maxStoreys}
                    onChange={(e) => setMaxStoreys(parseInt(e.target.value) || 1)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Coastal (m)">
                  <input
                    type="number"
                    className={inputClass}
                    min={0}
                    value={coastalSetback}
                    onChange={(e) => setCoastalSetback(parseFloat(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Side Setback (m)">
                  <input
                    type="number"
                    className={inputClass}
                    step={0.01}
                    min={0}
                    value={sideSetback}
                    onChange={(e) => setSideSetback(parseFloat(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Road Setback (m)">
                  <input
                    type="number"
                    className={inputClass}
                    step={0.01}
                    min={0}
                    value={roadSetback}
                    onChange={(e) => setRoadSetback(parseFloat(e.target.value) || 0)}
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={eiaRequired}
                  onChange={(e) => setEiaRequired(e.target.checked)}
                  className="accent-sky-500"
                />
                Environmental Impact Assessment required
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
