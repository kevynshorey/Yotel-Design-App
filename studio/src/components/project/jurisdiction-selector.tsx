'use client'

import { useState, useCallback } from 'react'
import { Globe, Building2, Ruler, TreePalm, Shield } from 'lucide-react'
import { JURISDICTIONS, getJurisdiction, type Jurisdiction } from '@/config/jurisdictions'

interface JurisdictionSelectorProps {
  /** Currently selected jurisdiction id (default: 'bb' for Barbados) */
  value?: string
  /** Callback when the user picks a different jurisdiction */
  onSelect: (jurisdictionId: string) => void
}

export default function JurisdictionSelector({ value = 'bb', onSelect }: JurisdictionSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const selected = getJurisdiction(value)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSelect(e.target.value)
    },
    [onSelect],
  )

  if (!selected) return null

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
      {/* Selector row */}
      <div className="flex flex-wrap items-center gap-3">
        <Globe className="h-4 w-4 shrink-0 text-sky-400" />
        <label htmlFor="jurisdiction-select" className="text-xs font-semibold text-slate-300">
          Jurisdiction
        </label>
        <select
          id="jurisdiction-select"
          value={value}
          onChange={handleChange}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
        >
          {JURISDICTIONS.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Planning authority */}
      <p className="mt-2 text-[11px] text-slate-500">
        Planning Authority: <span className="text-slate-400">{selected.planningAuthority}</span>
      </p>

      {/* Key stats row */}
      <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
        <StatPill icon={Building2} label="Max Height" value={`${selected.maxHeight}m / ${selected.maxStoreys}F`} />
        <StatPill icon={Shield} label="Max Coverage" value={`${(selected.maxCoverage * 100).toFixed(0)}%`} />
        <StatPill icon={Ruler} label="Min Setback" value={`${selected.minSetback}m`} />
        <StatPill icon={TreePalm} label="Landscape" value={`${(selected.landscapePercent * 100).toFixed(0)}%`} />
      </div>

      {/* Expanded detail panel */}
      {expanded && <JurisdictionDetail jurisdiction={selected} />}
    </div>
  )
}

// ── Stat pill ────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1 text-slate-400 ring-1 ring-slate-700/40">
      <Icon className="h-3 w-3 text-slate-500" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-300">{value}</span>
    </span>
  )
}

// ── Detail panel ─────────────────────────────────────────────────────────

function JurisdictionDetail({ jurisdiction: j }: { jurisdiction: Jurisdiction }) {
  return (
    <div className="mt-4 grid gap-3 border-t border-slate-800/60 pt-4 sm:grid-cols-2">
      <DetailRow label="Building Code" value={j.buildingCode} />
      <DetailRow label="Fire Regulations" value={j.fireRegulations} />
      <DetailRow label="Coastal Setback" value={`${j.coastalSetback}m from HWM`} />
      <DetailRow label="Parking Ratio" value={`${j.parkingRatio} spaces/key`} />
      <DetailRow label="Accessible Rooms" value={`${(j.accessiblePercent * 100).toFixed(0)}% minimum`} />
      <DetailRow label="EIA Threshold" value={`>${j.eiaThreshold} keys`} />
      <DetailRow label="Utility Providers" value={j.utilityProviders.join(', ')} />
      {j.specialZones.length > 0 && (
        <DetailRow label="Special Zones" value={j.specialZones.join(', ')} />
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px]">
      <span className="text-slate-500">{label}: </span>
      <span className="text-slate-300">{value}</span>
    </div>
  )
}
