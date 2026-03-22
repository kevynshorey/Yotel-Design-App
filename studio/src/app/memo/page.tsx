'use client'

import { useEffect, useState, useMemo } from 'react'
import { estimateCost } from '@/engine/cost'
import { projectRevenue } from '@/engine/revenue'
import { buildCapitalStack } from '@/engine/capital-stack'
import { calculateDCF } from '@/engine/dcf'
import type { DesignOption, OptionMetrics, CostEstimate, RevenueProjection } from '@/engine/types'
import type { CapitalStackResult } from '@/engine/capital-stack'
import type { DcfResult } from '@/engine/dcf'

// ── Helpers ──

function usd(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(2) + 'B'
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toLocaleString('en-US')
}

function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%'
}

function buildDefaultMetrics(): OptionMetrics {
  const totalKeys = 130
  const gia = totalKeys * 35
  return {
    totalKeys, yotelKeys: 100, padUnits: 30, gia,
    giaPerKey: gia / totalKeys, footprint: gia / 6, coverage: 0.45,
    buildingHeight: 18, westFacade: 60, outdoorTotal: 800,
    costPerKey: 0, tdc: 0, corridorType: 'double_loaded', form: 'BAR', amenityScore: 0,
  }
}

// ── Section Components ──

function CoverPage() {
  return (
    <div className="memo-page flex min-h-[90vh] flex-col items-center justify-center text-center">
      <div className="mb-8 h-px w-32 bg-[#0ea5e9]" />
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0ea5e9]">
        Confidential Investment Memorandum
      </p>
      <h1 className="mt-6 text-4xl font-black tracking-tight text-[#0f172a]">
        YOTEL Barbados
      </h1>
      <p className="mt-2 text-lg font-light text-slate-500">Carlisle Bay</p>
      <div className="mt-12 h-px w-32 bg-slate-200" />
      <p className="mt-8 text-sm text-slate-400">
        Prepared by Coruscant Developments Ltd
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}

function ExecutiveSummary({
  cost,
  projection,
  dcf,
  totalKeys,
  ytRooms,
  padUnits,
}: {
  cost: CostEstimate
  projection: RevenueProjection
  dcf: DcfResult
  totalKeys: number
  ytRooms: number
  padUnits: number
}) {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={1} title="Executive Summary" />
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          YOTEL Barbados is a dual-brand hospitality development located on Carlisle Bay,
          Bridgetown, combining {ytRooms} YOTEL transient rooms with {padUnits} YOTELPAD
          extended-stay units across a {totalKeys}-key resort campus. The development targets
          the growing demand for affordable-luxury accommodation in the Caribbean, leveraging
          YOTEL&apos;s proven technology-forward brand with a beachfront location on Barbados&apos;s
          premier west coast.
        </p>
        <p>
          Total development cost is projected at {usd(cost.total)} ({usd(cost.perKey)}/key),
          with a stabilised NOI of {usd(projection.stabilisedNoi)} by Year 3, yielding{' '}
          {pct(projection.stabilisedNoi / cost.total)} on cost. The 10-year DCF analysis
          indicates an equity IRR of {pct(dcf.irr)} and an equity multiple of{' '}
          {dcf.equityMultiple.toFixed(2)}x.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemoMetric label="Total Keys" value={totalKeys.toString()} />
        <MemoMetric label="TDC" value={usd(cost.total)} />
        <MemoMetric label="Stabilised NOI" value={usd(projection.stabilisedNoi)} />
        <MemoMetric label="Yield on Cost" value={pct(projection.stabilisedNoi / cost.total)} />
        <MemoMetric label="Cost per Key" value={usd(cost.perKey)} />
        <MemoMetric label="IRR (10-Year)" value={pct(dcf.irr)} />
        <MemoMetric label="Equity Multiple" value={dcf.equityMultiple.toFixed(2) + 'x'} />
        <MemoMetric label="NPV" value={usd(dcf.npv)} />
      </div>
    </div>
  )
}

function SiteAndLocation() {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={2} title="Site & Location" />
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          The site is situated on the south-west coast of Barbados along Carlisle Bay,
          one of the island&apos;s most iconic and sheltered beaches. Carlisle Bay offers
          calm turquoise waters, world-class snorkelling, and proximity to Bridgetown&apos;s
          UNESCO World Heritage site.
        </p>
        <p>
          <strong>Proximity to Key Amenities:</strong> The site is within 5 minutes of
          the Bridgetown port and cruise terminal, 20 minutes from Grantley Adams International
          Airport (BGI), and adjacent to a vibrant dining and nightlife corridor. Public
          transport, water taxis, and a planned coastal boardwalk provide excellent connectivity.
        </p>
        <p>
          <strong>Beach Access:</strong> The development benefits from direct beach access
          to Carlisle Bay&apos;s 1.2km crescent beach, with potential for a beach club concession
          and water sports operations. The west-facing orientation provides sunset views
          across the Caribbean Sea.
        </p>
      </div>
    </div>
  )
}

function DesignProgramme({
  option,
  metrics,
}: {
  option: DesignOption | null
  metrics: OptionMetrics
}) {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={3} title="Design Programme" />
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          The development comprises a campus layout with a residential tower and dedicated
          amenity block, designed for modular construction efficiency and Caribbean climate
          resilience.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <tbody>
            <TableRow label="Total Keys" value={metrics.totalKeys.toString()} />
            <TableRow label="YOTEL Rooms" value={metrics.yotelKeys.toString()} />
            <TableRow label="YOTELPAD Units" value={metrics.padUnits.toString()} />
            <TableRow label="Gross Internal Area" value={metrics.gia.toLocaleString() + ' m\u00B2'} />
            <TableRow label="GIA per Key" value={metrics.giaPerKey.toFixed(1) + ' m\u00B2'} />
            <TableRow label="Building Form" value={option?.form ?? metrics.form} />
            <TableRow label="Storeys" value={Math.round(metrics.buildingHeight / 3.2).toString()} />
            <TableRow label="Corridor Type" value={metrics.corridorType === 'double_loaded' ? 'Double-loaded' : 'Single-loaded'} />
            <TableRow label="Outdoor Amenity" value={metrics.outdoorTotal.toLocaleString() + ' m\u00B2'} />
            <TableRow label="Site Coverage" value={pct(metrics.coverage, 0)} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FinancialHighlights({
  cost,
  projection,
  capitalStack,
  dcf,
}: {
  cost: CostEstimate
  projection: RevenueProjection
  capitalStack: CapitalStackResult
  dcf: DcfResult
}) {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={4} title="Financial Highlights" />

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <FinRow label="Total Development Cost" value={usd(cost.total)} bold />
        <FinRow label="Cost per Key" value={usd(cost.perKey)} />
        <FinRow label="Land" value={usd(cost.breakdown.land)} />
        <FinRow label="Hard Costs" value={usd(cost.breakdown.construction + cost.breakdown.facade + cost.breakdown.ffe)} />
        <FinRow label="Soft Costs" value={usd(cost.breakdown.softCosts)} />
        <FinRow label="Contingency" value={usd(cost.breakdown.contingency)} />
      </div>

      <div className="mt-6 h-px bg-slate-200" />

      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <FinRow label="Stabilised NOI (Year 3)" value={usd(projection.stabilisedNoi)} bold />
        <FinRow label="NOI per Key" value={usd(projection.stabilisedNoiPerKey)} />
        <FinRow label="GOP Margin" value={pct(projection.gopMargin)} />
        <FinRow label="RevPAR (Stabilised)" value={'$' + projection.revPar.toLocaleString()} />
        <FinRow label="Yield on Cost" value={pct(projection.stabilisedNoi / cost.total)} bold />
      </div>

      <div className="mt-6 h-px bg-slate-200" />

      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <FinRow label="Senior Debt (55% LTC)" value={usd(capitalStack.totalDebt)} />
        <FinRow label="Total Equity" value={usd(capitalStack.totalEquity)} />
        <FinRow label="DSCR (Year 3)" value={capitalStack.dscr.toFixed(2) + 'x'} />
        <FinRow label="LTV" value={pct(capitalStack.ltv)} />
        <FinRow label="10-Year IRR" value={pct(dcf.irr)} bold />
        <FinRow label="Equity Multiple" value={dcf.equityMultiple.toFixed(2) + 'x'} bold />
        <FinRow label="Terminal Value" value={usd(dcf.terminalValue)} />
        <FinRow label="NPV" value={usd(dcf.npv)} />
      </div>
    </div>
  )
}

function RiskFactors() {
  const risks = [
    {
      risk: 'Planning & Approvals',
      mitigant: 'Pre-application consultation completed with Town & Country Planning. Zoning supports hotel use. Environmental Impact Assessment in progress.',
    },
    {
      risk: 'Hurricane & Natural Disaster',
      mitigant: 'Design to Cat-5 wind code (185 mph). Impact-rated glazing. Comprehensive property insurance with Caribbean specialist underwriters. Emergency backup power.',
    },
    {
      risk: 'Construction Cost Escalation',
      mitigant: 'Modular construction reduces on-site labour by 40%. Fixed-price contracts with 8% contingency. Pre-procurement of long-lead items.',
    },
    {
      risk: 'Foreign Exchange',
      mitigant: 'Barbados dollar pegged 2:1 to USD. Revenue denominated in USD. Debt facilities in USD to provide natural hedge.',
    },
    {
      risk: 'Occupancy Ramp-up',
      mitigant: 'Conservative 3-year ramp (55% to 78%). YOTEL brand provides global distribution network. Pre-opening marketing 12 months ahead of launch.',
    },
    {
      risk: 'Brand Dependency',
      mitigant: 'Dual-brand strategy (YOTEL + YOTELPAD) diversifies revenue. Management agreement includes performance termination clause.',
    },
    {
      risk: 'Interest Rate Exposure',
      mitigant: 'Senior debt structured with interest-rate cap. Mezz at fixed rate. Refinancing options at Year 3 post-stabilisation.',
    },
    {
      risk: 'Market & Competition',
      mitigant: 'Limited new hotel supply in Carlisle Bay. Barbados tourism growing 8% YoY. Affordable-luxury segment underserved on the island.',
    },
  ]

  return (
    <div className="memo-page py-12">
      <SectionHeader number={5} title="Risk Factors & Mitigants" />
      <div className="mt-6 space-y-3">
        {risks.map((r, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-[#0f172a]">{r.risk}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{r.mitigant}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanningSustainability() {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={6} title="Planning & Sustainability" />
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          <strong>Planning Status:</strong> The development site is zoned for hotel and
          tourism use under the Barbados Physical Development Plan. A pre-application
          meeting with the Town and Country Development Planning Office has been completed,
          with positive preliminary feedback. The formal Environmental Impact Assessment
          (EIA) is underway with submission targeted for Q2 2026.
        </p>
        <p>
          <strong>LEED Pathway:</strong> The project is targeting LEED Gold certification,
          incorporating solar PV arrays, rainwater harvesting, energy-efficient HVAC systems,
          and locally sourced materials where feasible. The modular construction approach
          reduces construction waste by approximately 50% compared to conventional methods.
        </p>
        <p>
          <strong>EDGE Certification:</strong> The development is designed to exceed EDGE
          (Excellence in Design for Greater Efficiencies) thresholds with a minimum 20%
          improvement in energy, water, and embodied energy versus the EDGE baseline for
          Caribbean hotel developments.
        </p>
      </div>
    </div>
  )
}

function DisclaimerAndContact() {
  return (
    <div className="memo-page py-12">
      <SectionHeader number={7} title="Disclaimer & Contact" />
      <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-500">
        <p>
          This Confidential Investment Memorandum (&quot;Memorandum&quot;) has been prepared
          by Coruscant Developments Ltd (&quot;the Sponsor&quot;) solely for the purpose of
          providing qualified investors with information regarding a potential investment
          in the YOTEL Barbados development project. This Memorandum does not constitute
          an offer to sell or a solicitation of an offer to buy any securities.
        </p>
        <p>
          All financial projections, estimates, and forward-looking statements contained
          herein are based on assumptions that the Sponsor believes to be reasonable but
          are inherently uncertain. Actual results may differ materially from those projected.
          Past performance is not indicative of future results.
        </p>
        <p>
          Recipients of this Memorandum should conduct their own due diligence and consult
          with their own legal, tax, and financial advisors before making any investment
          decision. The Sponsor makes no representation or warranty, express or implied,
          as to the accuracy or completeness of the information contained herein.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-[#0ea5e9]/30 bg-sky-50 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0ea5e9]">
          Development Sponsor
        </p>
        <p className="mt-2 text-lg font-bold text-[#0f172a]">
          Coruscant Developments Ltd
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Carlisle Bay Development &middot; Bridgetown, Barbados
        </p>
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        &copy; {new Date().getFullYear()} Coruscant Developments Ltd. All rights reserved.
      </p>
    </div>
  )
}

// ── Shared Sub-Components ──

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-[#0f172a] pb-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f172a] text-xs font-bold text-white">
        {number}
      </span>
      <h2 className="text-lg font-bold text-[#0f172a]">{title}</h2>
    </div>
  )
}

function MemoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-[#0f172a]">{value}</p>
    </div>
  )
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-2 text-slate-600">{label}</td>
      <td className="px-4 py-2 text-right font-mono font-semibold text-[#0f172a]">{value}</td>
    </tr>
  )
}

function FinRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <>
      <p className={`py-1 text-slate-600 ${bold ? 'font-semibold text-[#0f172a]' : ''}`}>
        {label}
      </p>
      <p className={`py-1 text-right font-mono ${bold ? 'font-bold text-[#0f172a]' : 'text-slate-700'}`}>
        {value}
      </p>
    </>
  )
}

// ── Print Styles ──

const printStyleContent = [
  '@media print {',
  '  @page { size: A4; margin: 20mm 15mm 25mm 15mm; }',
  '  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  '  .memo-page { page-break-after: always; }',
  '  .memo-page:last-child { page-break-after: auto; }',
  '  .no-print { display: none !important; }',
  '  .print-footer {',
  '    position: fixed; bottom: 0; left: 0; right: 0;',
  '    text-align: center; font-size: 8pt; color: #64748b;',
  '    padding: 8px 0; border-top: 1px solid #e2e8f0;',
  '  }',
  '}',
  '@media screen { .print-footer { display: none; } }',
].join('\n')

// ── Main Page ──

export default function MemoPage() {
  const [option, setOption] = useState<DesignOption | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem('yotel-selected-option')
      if (raw) setOption(JSON.parse(raw))
    } catch {
      // ignore parse errors
    }
  }, [])

  // Auto-trigger print 800ms after render
  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      window.print()
    }, 800)
    return () => clearTimeout(timer)
  }, [mounted])

  // Inject print styles via <style> element (safe: hardcoded constant, no user input)
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = printStyleContent
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const metrics = useMemo(
    () => option?.metrics ?? buildDefaultMetrics(),
    [option],
  )

  const cost = useMemo(() => estimateCost(metrics), [metrics])
  const ytRooms = metrics.yotelKeys
  const padUnits = metrics.padUnits
  const totalKeys = ytRooms + padUnits

  const projection = useMemo(
    () => projectRevenue(ytRooms, padUnits, 5),
    [ytRooms, padUnits],
  )

  const capitalStack = useMemo(
    () => buildCapitalStack(cost.total, projection),
    [cost.total, projection],
  )

  const dcf = useMemo(
    () => calculateDCF({ tdc: cost.total, projection, capitalStack }),
    [cost.total, projection, capitalStack],
  )

  if (!mounted) return null

  return (
    <>
      {/* Print footer (fixed at bottom of every printed page) */}
      <div className="print-footer">
        Coruscant Developments Ltd &middot; Confidential
      </div>

      {/* Screen-only close button */}
      <div className="no-print fixed right-4 top-4 z-50">
        <button
          onClick={() => window.close()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      {/* Memo content */}
      <div className="mx-auto max-w-3xl px-8 font-sans">
        <CoverPage />
        <ExecutiveSummary
          cost={cost}
          projection={projection}
          dcf={dcf}
          totalKeys={totalKeys}
          ytRooms={ytRooms}
          padUnits={padUnits}
        />
        <SiteAndLocation />
        <DesignProgramme option={option} metrics={metrics} />
        <FinancialHighlights
          cost={cost}
          projection={projection}
          capitalStack={capitalStack}
          dcf={dcf}
        />
        <RiskFactors />
        <PlanningSustainability />
        <DisclaimerAndContact />
      </div>
    </>
  )
}
