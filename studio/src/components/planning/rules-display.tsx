'use client'

import { RULES } from '@/config/rules'
import { SITE } from '@/config/site'

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {title}
    </h3>
  )
}

function RuleRow({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-400 flex-1">{label}</span>
      <span className="font-mono text-xs font-medium text-slate-100 shrink-0">{value}</span>
      {note && <span className="text-[10px] text-slate-600 shrink-0">{note}</span>}
    </div>
  )
}

export function RulesDisplay() {
  return (
    <div className="flex flex-col gap-5">
      {/* Site Constraints */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
        <SectionHeader title="Site Constraints" />
        <div>
          <RuleRow
            label="Gross site area"
            value={`${SITE.grossArea.toLocaleString('en-US')} m²`}
          />
          <RuleRow
            label="Buildable area (after setbacks)"
            value={`${SITE.buildableArea.toLocaleString('en-US')} m²`}
          />
          <RuleRow
            label="Buildable zone E–W"
            value={`${SITE.buildableEW} m`}
          />
          <RuleRow
            label="Buildable zone N–S"
            value={`${SITE.buildableNS} m`}
          />
          <RuleRow
            label="Max footprint (50% buildable)"
            value={`${SITE.maxFootprint.toLocaleString('en-US')} m²`}
          />
          <RuleRow
            label="Max site coverage"
            value={`${(SITE.maxCoverage * 100).toFixed(0)}%`}
            note="of buildable area"
          />
          <RuleRow
            label="Max building height"
            value={`${SITE.maxHeight} m`}
          />
          <RuleRow label="Beach-facing facade" value={SITE.beachSide} note="west" />
        </div>
      </div>

      {/* Planning Rules */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
        <SectionHeader title="Planning Rules (T1 Statute)" />
        <div>
          <RuleRow
            label="Max site coverage"
            value={`${(RULES.planning.maxCoverage * 100).toFixed(0)}%`}
          />
          <RuleRow
            label="Max building height"
            value={`${RULES.planning.maxHeight} m`}
          />
          <RuleRow
            label="Site area (planning reference)"
            value={`${RULES.planning.siteArea.toLocaleString('en-US')} m²`}
          />
          <RuleRow label="Site length E–W" value={`${RULES.planning.siteLength} m`} />
          <RuleRow label="Site width N–S" value={`${RULES.planning.siteWidth} m`} />
        </div>
      </div>

      {/* Brand Rules */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
        <SectionHeader title="Brand Standards (T3 D01-C08)" />
        <div>
          <RuleRow
            label="Min dual-loaded wing width (YOTEL)"
            value={`${RULES.brand.dualMinWidth} m`}
          />
          <RuleRow
            label="Min single-loaded wing width"
            value={`${RULES.brand.singleMinWidth} m`}
          />
          <RuleRow
            label="Min dual-loaded width (YOTELPAD)"
            value={`${RULES.brand.padDualMinWidth} m`}
          />
          <RuleRow
            label="Max travel distance"
            value={`${RULES.brand.maxTravel} m`}
          />
          <RuleRow
            label="Min Komyuniti area"
            value={`${RULES.brand.minKomyuniti} m²`}
          />
          <RuleRow
            label="Min Mission Control area"
            value={`${RULES.brand.minMissionControl} m²`}
          />
          <RuleRow label="Min gym area" value={`${RULES.brand.minGym} m²`} />
          <RuleRow label="Min kitchen area" value={`${RULES.brand.minKitchen} m²`} />
        </div>
      </div>

      {/* Circulation */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
        <SectionHeader title="Circulation Standards" />
        <div>
          <RuleRow
            label="Min corridor width"
            value={`${RULES.circulation.minCorridorWidth} m`}
          />
          <RuleRow
            label="Min corridor height"
            value={`${RULES.circulation.minCorridorHeight} m`}
          />
          <RuleRow
            label="Max dead-end length"
            value={`${RULES.circulation.maxDeadEnd} m`}
          />
          <RuleRow
            label="Max travel distance"
            value={`${RULES.circulation.maxTravelDistance} m`}
          />
        </div>
      </div>
    </div>
  )
}
