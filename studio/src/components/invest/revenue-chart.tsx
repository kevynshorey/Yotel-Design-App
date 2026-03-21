'use client'

import type { YearlyRevenue } from '@/engine/types'

interface RevenueChartProps {
  years: YearlyRevenue[]
}

function usdM(n: number): string {
  return '$' + (n / 1_000_000).toFixed(2) + 'M'
}

export function RevenueChart({ years }: RevenueChartProps) {
  const maxRevenue = Math.max(...years.map((y) => y.totalRevenue), 1)

  return (
    <div className="border-t border-slate-800/60 px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          5-Year Revenue Projection
        </h2>
        <p className="mb-6 text-[11px] text-slate-600">
          Total revenue, GOP, and NOI — Year 1 partial (210 operating days)
        </p>

        {/* Bar chart */}
        <div className="flex items-end gap-4">
          {years.map((yr) => {
            const revHeight = (yr.totalRevenue / maxRevenue) * 180
            const gopHeight = (yr.gop / maxRevenue) * 180
            const noiHeight = (yr.noi / maxRevenue) * 180

            return (
              <div key={yr.year} className="flex flex-1 flex-col items-center gap-2">
                {/* Bars */}
                <div className="flex w-full items-end justify-center gap-1" style={{ height: '180px' }}>
                  {/* Revenue bar */}
                  <div
                    className="flex-1 rounded-t-sm bg-sky-900/70 transition-all"
                    style={{ height: `${revHeight}px` }}
                    title={`Revenue: ${usdM(yr.totalRevenue)}`}
                  />
                  {/* GOP bar */}
                  <div
                    className="flex-1 rounded-t-sm bg-sky-600/70 transition-all"
                    style={{ height: `${gopHeight}px` }}
                    title={`GOP: ${usdM(yr.gop)}`}
                  />
                  {/* NOI bar */}
                  <div
                    className="flex-1 rounded-t-sm bg-sky-400/80 transition-all"
                    style={{ height: `${noiHeight}px` }}
                    title={`NOI: ${usdM(yr.noi)}`}
                  />
                </div>

                {/* Year label */}
                <span className="text-[11px] font-medium text-slate-500">
                  Yr {yr.year}
                </span>

                {/* Revenue value */}
                <span className="text-[10px] font-mono text-sky-400">
                  {usdM(yr.totalRevenue)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-sky-900/70" />
            <span className="text-[11px] text-slate-500">Total Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-sky-600/70" />
            <span className="text-[11px] text-slate-500">GOP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-sky-400/80" />
            <span className="text-[11px] text-slate-500">NOI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
