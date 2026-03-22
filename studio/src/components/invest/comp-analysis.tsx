'use client'

import { COMP_SET, YOTEL_BARBADOS, COMPETITIVE_ADVANTAGES, type CompProperty } from '@/config/comp-set'
import { TrendingUp, Star, DollarSign, Building2, MapPin, Sparkles } from 'lucide-react'

function formatUsd(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toLocaleString('en-US')
}

function typeLabel(type: CompProperty['type']): string {
  switch (type) {
    case 'resort': return 'Resort'
    case 'urban': return 'Urban'
    case 'mixed': return 'Mixed'
  }
}

function typeBadgeClass(type: CompProperty['type']): string {
  switch (type) {
    case 'resort': return 'bg-cyan-900/40 text-cyan-400 ring-cyan-700/50'
    case 'urban': return 'bg-violet-900/40 text-violet-400 ring-violet-700/50'
    case 'mixed': return 'bg-amber-900/40 text-amber-400 ring-amber-700/50'
  }
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: stars }, (_, i) => (
        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
      {Array.from({ length: 5 - stars }, (_, i) => (
        <Star key={`e-${i}`} className="h-3 w-3 text-slate-700" />
      ))}
    </span>
  )
}

function CompRow({ prop, isYotel }: { prop: CompProperty; isYotel: boolean }) {
  const rowClass = isYotel
    ? 'bg-sky-950/40 border-l-2 border-sky-500'
    : 'hover:bg-slate-800/40'

  return (
    <tr className={`border-b border-slate-800/40 text-xs ${rowClass}`}>
      <td className="px-3 py-2.5">
        <div className="flex flex-col gap-0.5">
          <span className={`font-semibold ${isYotel ? 'text-sky-300' : 'text-slate-200'}`}>
            {prop.name}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin className="h-2.5 w-2.5" />
            {prop.location}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-slate-400">{prop.brand}</td>
      <td className="px-3 py-2.5 text-center font-mono text-slate-300">{prop.keys}</td>
      <td className="px-3 py-2.5 text-center">
        <StarRating stars={prop.stars} />
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${typeBadgeClass(prop.type)}`}>
          {typeLabel(prop.type)}
        </span>
      </td>
      <td className={`px-3 py-2.5 text-right font-mono ${isYotel ? 'font-bold text-sky-300' : 'text-emerald-400'}`}>
        ${prop.adr}
      </td>
      <td className={`px-3 py-2.5 text-right font-mono ${isYotel ? 'font-bold text-sky-300' : 'text-slate-300'}`}>
        {formatUsd(prop.costPerKey)}
      </td>
      <td className="px-3 py-2.5 text-center font-mono text-slate-400">{prop.yearOpened}</td>
    </tr>
  )
}

export function CompAnalysis() {
  // Sort by ADR descending for positioning clarity
  const sorted = [...COMP_SET].sort((a, b) => b.adr - a.adr)

  // Aggregate stats for context
  const avgAdr = Math.round(COMP_SET.reduce((s, c) => s + c.adr, 0) / COMP_SET.length)
  const avgCostPerKey = Math.round(COMP_SET.reduce((s, c) => s + c.costPerKey, 0) / COMP_SET.length)
  const minAdr = Math.min(...COMP_SET.map((c) => c.adr))
  const maxAdr = Math.max(...COMP_SET.map((c) => c.adr))

  // YOTEL positioning within the range
  const yotelAdrPct = Math.round(((YOTEL_BARBADOS.adr - minAdr) / (maxAdr - minAdr)) * 100)
  const costSavingPct = Math.round(((avgCostPerKey - YOTEL_BARBADOS.costPerKey) / avgCostPerKey) * 100)

  return (
    <div className="border-t border-slate-800/60 px-8 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-sky-400">
            Market Intelligence
          </p>
          <h2 className="text-xl font-bold text-slate-50">Competitive Comp Set</h2>
          <p className="mt-1 text-sm text-slate-400">
            10 comparable Caribbean hotel projects benchmarked against YOTEL Barbados
          </p>
        </div>

        {/* KPI Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <DollarSign className="h-3.5 w-3.5" />
              YOTEL Target ADR
            </div>
            <p className="text-2xl font-bold text-sky-400">${YOTEL_BARBADOS.adr}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Comp set avg: ${avgAdr} | Range: ${minAdr}-${maxAdr}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              Cost / Key
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatUsd(YOTEL_BARBADOS.costPerKey)}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {costSavingPct}% below comp avg ({formatUsd(avgCostPerKey)})
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              ADR Position
            </div>
            <p className="text-2xl font-bold text-amber-400">{yotelAdrPct}th pctl</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Mid-market sweet spot
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <Star className="h-3.5 w-3.5" />
              Brand Tier
            </div>
            <p className="text-2xl font-bold text-violet-400">3-Star+</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Compact luxury positioning
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-800/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/80">
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Property</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Brand</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Keys</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Rating</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">ADR (USD)</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cost/Key</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">Year</th>
                </tr>
              </thead>
              <tbody>
                {/* YOTEL Barbados highlighted at top */}
                <CompRow prop={YOTEL_BARBADOS} isYotel={true} />
                {/* Comp set sorted by ADR */}
                {sorted.map((prop) => (
                  <CompRow key={prop.name} prop={prop} isYotel={false} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitive Advantages */}
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-4 w-4 text-sky-400" />
            Competitive Advantages
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPETITIVE_ADVANTAGES.map((ca) => (
              <div key={ca.advantage} className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-3">
                <p className="mb-1 text-xs font-semibold text-sky-300">{ca.advantage}</p>
                <p className="text-[11px] leading-relaxed text-slate-500">{ca.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
