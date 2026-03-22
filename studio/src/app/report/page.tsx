'use client'

import { useEffect, useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { SITE, PLANNING_REGS } from '@/config/site'
import { FINANCIALS } from '@/config/financials'

// ── Helpers ──────────────────────────────────────────────────────────────

const FORM_LABELS: Record<string, string> = {
  BAR: 'Linear Bar (E-W)',
  BAR_NS: 'Linear Bar (N-S)',
  L: 'L-Form',
  U: 'U-Form',
  C: 'Courtyard (C-Form)',
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtM(n: number): string {
  return `$${(n / 1_000_000).toFixed(1)}M`
}

function fmtK(n: number): string {
  return `$${(n / 1_000).toFixed(0)}k`
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function fmtCur(n: number): string {
  return `$${fmt(Math.round(n))}`
}

function today(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Report Component ─────────────────────────────────────────────────────

export default function ReportPage() {
  const [option, setOption] = useState<DesignOption | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('yotel-selected-option')
      if (!raw) {
        setError('No design option selected. Please select an option in the Design Studio first.')
        return
      }
      const parsed = JSON.parse(raw) as DesignOption
      if (!parsed?.id || !parsed?.metrics || !parsed?.cost || !parsed?.revenue) {
        setError('Invalid design option data. Please re-select an option in the Design Studio.')
        return
      }
      setOption(parsed)
    } catch {
      setError('Failed to load design option data.')
    }
  }, [])

  // Auto-trigger print after render
  useEffect(() => {
    if (!option) return
    const timer = setTimeout(() => {
      window.print()
    }, 600)
    return () => clearTimeout(timer)
  }, [option])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-xl font-semibold text-slate-900">Report Unavailable</h1>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.close()}
            className="mt-6 rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!option) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Loading report data...</p>
      </div>
    )
  }

  const { metrics, cost, revenue, validation, amenities } = option
  const dateStr = today()
  const floors = Math.round((metrics.buildingHeight - 4.5) / 3.2) + 1

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 20mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { break-before: page; }
          .no-print { display: none !important; }
        }
        @media screen {
          .report-container { max-width: 210mm; margin: 0 auto; padding: 20mm; }
        }
      `}</style>

      <div className="report-container bg-white font-sans text-slate-900">
        {/* ═══ PAGE 1: Cover ═══ */}
        <div className="flex min-h-[calc(297mm-40mm)] flex-col justify-between">
          <div />
          <div className="text-center">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              Confidential
            </div>
            <h1 className="mb-1 text-4xl font-bold tracking-tight text-[#0f172a]">
              YOTEL BARBADOS
            </h1>
            <h2 className="mb-8 text-xl font-light text-slate-600">
              Development Feasibility Study
            </h2>
            <div className="mx-auto mb-12 h-px w-24 bg-sky-500" />
            <p className="text-sm text-slate-500">
              Carlisle Bay &middot; Bridgetown &middot; Barbados
            </p>
          </div>
          <div className="text-center text-xs text-slate-400">
            <p>Prepared by: <span className="font-semibold text-slate-600">Coruscant Developments Ltd</span></p>
            <p className="mt-1">Date: {dateStr}</p>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-300">
              Strictly Private &amp; Confidential
            </p>
          </div>
        </div>

        {/* ═══ PAGE 2: Executive Summary ═══ */}
        <div className="page-break">
          <SectionHeader number={1} title="Executive Summary" />

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#0f172a]">
            Project Overview
          </h3>
          <table className="mb-8 w-full text-sm">
            <tbody>
              <Row label="Location" value="Carlisle Bay, Bridgetown, Barbados" />
              <Row label="Site Area" value={`${fmt(SITE.grossArea)} m\u00B2`} />
              <Row label="Buildable Area" value={`${fmt(Math.round(SITE.buildableArea))} m\u00B2`} />
              <Row label="Building Form" value={FORM_LABELS[option.form] ?? option.form} />
              <Row
                label="Total Keys"
                value={`${metrics.totalKeys} (YOTEL ${metrics.yotelKeys} + YOTELPAD ${metrics.padUnits})`}
              />
              <Row label="Building Height" value={`${metrics.buildingHeight.toFixed(1)}m (${floors} storeys)`} />
              <Row label="GIA" value={`${fmt(Math.round(metrics.gia))} m\u00B2 (${metrics.giaPerKey.toFixed(1)} m\u00B2/key)`} />
              <Row label="Site Coverage" value={fmtPct(metrics.coverage)} />
            </tbody>
          </table>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#0f172a]">
            Key Financial Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Total Development Cost" value={fmtM(cost.total)} />
            <MetricCard label="Cost per Key" value={fmtK(cost.perKey)} />
            <MetricCard label="Stabilised NOI" value={fmtM(revenue.stabilisedNoi)} />
            <MetricCard label="GOP Margin" value={fmtPct(revenue.gopMargin)} />
            <MetricCard
              label="Yield on Cost"
              value={fmtPct(cost.total > 0 ? revenue.stabilisedNoi / cost.total : 0)}
            />
            <MetricCard label="RevPAR" value={fmtCur(revenue.revPar)} />
          </div>
        </div>

        {/* ═══ PAGE 3: Cost Breakdown ═══ */}
        <div className="page-break">
          <SectionHeader number={2} title="Development Cost Breakdown" />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0f172a]">
                <th className="py-2 text-left font-semibold">Category</th>
                <th className="py-2 text-right font-semibold">Amount (USD)</th>
                <th className="py-2 text-right font-semibold">% of Total</th>
              </tr>
            </thead>
            <tbody>
              <CostRow label="Construction" amount={cost.breakdown.construction} total={cost.total} />
              <CostRow label="Facade Systems" amount={cost.breakdown.facade} total={cost.total} />
              <CostRow label="FF&E" amount={cost.breakdown.ffe} total={cost.total} />
              <CostRow label="Technology & Systems" amount={cost.breakdown.technology} total={cost.total} />
              <CostRow label="MEP Systems" amount={cost.breakdown.mep} total={cost.total} />
              <CostRow label="Renewable Energy" amount={cost.breakdown.renewable} total={cost.total} />
              <CostRow label="Foundation Engineering" amount={cost.breakdown.foundation} total={cost.total} />
              <CostRow label="Outdoor / Amenities" amount={cost.breakdown.outdoor} total={cost.total} />
              <CostRow label="Site Works" amount={cost.breakdown.siteWorks} total={cost.total} />
              <CostRow label="Hurricane & Seismic Uplift" amount={cost.breakdown.hurricaneUplift} total={cost.total} />
              <CostRow label="Island Factors (Import & Freight)" amount={cost.breakdown.islandFactors} total={cost.total} />
              <CostRow label="EIA & Permits" amount={cost.breakdown.eiaAndPermits} total={cost.total} />
              <CostRow label="Soft Costs" amount={cost.breakdown.softCosts} total={cost.total} />
              <CostRow label="Contingency" amount={cost.breakdown.contingency} total={cost.total} />
              <CostRow label="Land" amount={cost.breakdown.land} total={cost.total} />
              <tr className="border-t-2 border-[#0f172a] font-semibold">
                <td className="py-2">Total Development Cost</td>
                <td className="py-2 text-right">{fmtCur(cost.total)}</td>
                <td className="py-2 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Cost per Key</div>
              <div className="text-lg font-semibold text-[#0f172a]">{fmtK(cost.perKey)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Cost per m\u00B2 GIA</div>
              <div className="text-lg font-semibold text-[#0f172a]">
                {fmtCur(metrics.gia > 0 ? cost.total / metrics.gia : 0)}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ PAGE 4: Revenue Projection ═══ */}
        <div className="page-break">
          <SectionHeader number={3} title="Revenue Projection (5-Year)" />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0f172a]">
                <th className="py-2 text-left font-semibold">Year</th>
                <th className="py-2 text-right font-semibold">Revenue</th>
                <th className="py-2 text-right font-semibold">GOP</th>
                <th className="py-2 text-right font-semibold">NOI</th>
                <th className="py-2 text-right font-semibold">YOTEL Occ.</th>
                <th className="py-2 text-right font-semibold">YOTEL ADR</th>
                <th className="py-2 text-right font-semibold">PAD Occ.</th>
                <th className="py-2 text-right font-semibold">PAD ADR</th>
              </tr>
            </thead>
            <tbody>
              {revenue.years.map((yr) => (
                <tr key={yr.year} className="border-b border-slate-100">
                  <td className="py-2 font-medium">Year {yr.year}</td>
                  <td className="py-2 text-right font-mono">{fmtCur(yr.totalRevenue)}</td>
                  <td className="py-2 text-right font-mono">{fmtCur(yr.gop)}</td>
                  <td className="py-2 text-right font-mono">{fmtCur(yr.noi)}</td>
                  <td className="py-2 text-right">{fmtPct(yr.yotelOcc)}</td>
                  <td className="py-2 text-right font-mono">{fmtCur(yr.yotelAdr)}</td>
                  <td className="py-2 text-right">{fmtPct(yr.padOcc)}</td>
                  <td className="py-2 text-right font-mono">{fmtCur(yr.padAdr)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Stabilised NOI</div>
              <div className="text-lg font-semibold text-[#0f172a]">{fmtM(revenue.stabilisedNoi)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">NOI per Key</div>
              <div className="text-lg font-semibold text-[#0f172a]">{fmtK(revenue.stabilisedNoiPerKey)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">GOP Margin</div>
              <div className="text-lg font-semibold text-[#0f172a]">{fmtPct(revenue.gopMargin)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <div className="text-xs text-slate-500">RevPAR</div>
              <div className="text-lg font-semibold text-[#0f172a]">{fmtCur(revenue.revPar)}</div>
            </div>
          </div>

          <div className="mt-6 rounded bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Key Assumptions</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>YOTEL Stabilised ADR: ${FINANCIALS.yotelAdr} &middot; YOTELPAD Stabilised ADR: ${FINANCIALS.yotelpadAdr}</li>
              <li>GOP Margin: {(FINANCIALS.gopMargin * 100).toFixed(0)}% &middot; Brand Fees: {(FINANCIALS.yotelFees * 100).toFixed(1)}% of revenue</li>
              <li>F&B revenue: YOTEL ${FINANCIALS.fnb.yotelPerNight}/night, PAD ${FINANCIALS.fnb.padPerNight}/night &middot; Other ancillary: ${FINANCIALS.otherPerOccupiedRoom}</li>
              <li>3-year ramp to stabilisation</li>
            </ul>
          </div>
        </div>

        {/* ═══ PAGE 5: Amenity Programme ═══ */}
        <div className="page-break">
          <SectionHeader number={4} title="Amenity Programme" />

          {amenities ? (
            <div className="space-y-6">
              {/* Pool */}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0f172a]">
                  Pool &amp; Beach Deck
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <Row label="Pool Water Area" value={`${amenities.pool.waterArea} m\u00B2`} />
                    <Row label="Pool Deck Area" value={`${amenities.pool.deckArea} m\u00B2`} />
                    <Row label="Pool Type" value={amenities.pool.type === 'both' ? 'Ground + Rooftop' : 'Ground Level'} />
                    <Row label="Infinity Edge" value={amenities.pool.hasInfinityEdge ? 'Yes' : 'No'} />
                    <Row label="Swim-Up Bar" value={amenities.pool.hasSwimUpBar ? 'Yes' : 'No'} />
                  </tbody>
                </table>
              </div>

              {/* Rooftop */}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0f172a]">
                  Rooftop Deck
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <Row label="Total Area" value={`${amenities.rooftopDeck.totalArea} m\u00B2`} />
                    <Row label="Bar Area" value={`${amenities.rooftopDeck.barArea} m\u00B2`} />
                    <Row label="Lounge Area" value={`${amenities.rooftopDeck.loungeArea} m\u00B2`} />
                    <Row label="Rooftop Pool" value={amenities.rooftopDeck.hasPool ? `${amenities.rooftopDeck.poolArea} m\u00B2` : 'N/A'} />
                    <Row label="Lounger Count" value={`${amenities.rooftopDeck.loungerCount}`} />
                    <Row label="Cabanas" value={amenities.rooftopDeck.hasCabanas ? 'Yes' : 'No'} />
                  </tbody>
                </table>
              </div>

              {/* Restaurant */}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#0f172a]">
                  Restaurant (Komyuniti)
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <Row label="Indoor Area" value={`${amenities.restaurant.indoorArea} m\u00B2`} />
                    <Row label="Outdoor Area" value={`${amenities.restaurant.outdoorArea} m\u00B2`} />
                    <Row label="Total Seats" value={`${amenities.restaurant.totalSeats}`} />
                    <Row label="Concept" value="All-Day Dining" />
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <MetricCard label="Total Amenity Area" value={`${fmt(amenities.totalAmenityArea)} m\u00B2`} />
                <MetricCard label="Lounger Capacity" value={`${amenities.loungerCapacity}`} />
                <MetricCard label="Amenity Score" value={`${(amenities.amenityScore * 100).toFixed(0)}%`} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Amenity programme data not available for this option.</p>
          )}
        </div>

        {/* ═══ PAGE 6: Planning Compliance ═══ */}
        <div className="page-break">
          <SectionHeader number={5} title="Planning Compliance" />

          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0f172a]">
                <th className="py-2 text-left font-semibold">Regulation</th>
                <th className="py-2 text-left font-semibold">Limit</th>
                <th className="py-2 text-left font-semibold">Proposed</th>
                <th className="py-2 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <ComplianceRow
                rule="Max Site Coverage"
                limit={`${(PLANNING_REGS.maxCoverage * 100).toFixed(0)}%`}
                actual={fmtPct(metrics.coverage)}
                pass={metrics.coverage <= PLANNING_REGS.maxCoverage}
              />
              <ComplianceRow
                rule="Max Building Height"
                limit={`${PLANNING_REGS.maxHeight}m`}
                actual={`${metrics.buildingHeight.toFixed(1)}m`}
                pass={metrics.buildingHeight <= PLANNING_REGS.maxHeight}
              />
              <ComplianceRow
                rule="Coastal Setback (CZMU)"
                limit={`${PLANNING_REGS.coastalSetback}m from HWM`}
                actual="Compliant (offset boundary)"
                pass={true}
              />
              <ComplianceRow
                rule="Max Footprint"
                limit={`${fmt(SITE.maxFootprint)} m\u00B2`}
                actual={`${fmt(Math.round(metrics.footprint))} m\u00B2`}
                pass={metrics.footprint <= SITE.maxFootprint}
              />
              <ComplianceRow
                rule="EIA Required"
                limit="Yes (130+ keys)"
                actual={PLANNING_REGS.eiaRequired ? 'Required' : 'N/A'}
                pass={true}
                neutral
              />
              <ComplianceRow
                rule="Heritage Zone Proximity"
                limit="UNESCO buffer adjacent"
                actual="Design review required"
                pass={true}
                neutral
              />
            </tbody>
          </table>

          {/* Violations if any */}
          {validation.violations.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-red-700">Violations</h3>
              <ul className="space-y-1 text-sm">
                {validation.violations.map((v, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded-full bg-red-100 text-center text-xs font-bold leading-4 text-red-700">
                      !
                    </span>
                    <span>
                      <span className="font-medium">{v.rule}:</span> {String(v.actual)} (limit: {String(v.limit)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-amber-700">Warnings</h3>
              <ul className="space-y-1 text-sm">
                {validation.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded-full bg-amber-100 text-center text-xs leading-4 text-amber-700">
                      ~
                    </span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.isValid && validation.violations.length === 0 && (
            <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              All planning regulations passed. Option is compliant with Barbados planning requirements.
            </div>
          )}
        </div>

        {/* ═══ Footer ═══ */}
        <div className="mt-12 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400">
          Confidential &mdash; Coruscant Developments Ltd &mdash; {dateStr}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-500">
        Section {number}
      </div>
      <h2 className="text-2xl font-bold text-[#0f172a]">{title}</h2>
      <div className="mt-2 h-0.5 w-12 bg-sky-500" />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5 pr-4 text-slate-500">{label}</td>
      <td className="py-1.5 font-medium">{value}</td>
    </tr>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-[#0f172a]">{value}</div>
    </div>
  )
}

function CostRow({ label, amount, total }: { label: string; amount: number; total: number }) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5">{label}</td>
      <td className="py-1.5 text-right font-mono">{fmtCur(amount)}</td>
      <td className="py-1.5 text-right">{pct.toFixed(1)}%</td>
    </tr>
  )
}

function ComplianceRow({
  rule,
  limit,
  actual,
  pass,
  neutral,
}: {
  rule: string
  limit: string
  actual: string
  pass: boolean
  neutral?: boolean
}) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5">{rule}</td>
      <td className="py-1.5 text-slate-500">{limit}</td>
      <td className="py-1.5 font-medium">{actual}</td>
      <td className="py-1.5 text-center">
        {neutral ? (
          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            Info
          </span>
        ) : pass ? (
          <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            PASS
          </span>
        ) : (
          <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            FAIL
          </span>
        )}
      </td>
    </tr>
  )
}
