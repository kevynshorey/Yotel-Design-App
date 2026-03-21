'use client'

import type { RevenueProjection } from '@/engine/types'

interface RevenueTableProps {
  projection: RevenueProjection
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%'
}

export function RevenueTable({ projection }: RevenueTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Pro Forma — Yearly
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/60">
              <th className="pb-2 text-left font-medium text-slate-400">Metric</th>
              {projection.years.map((yr) => (
                <th
                  key={yr.year}
                  className="pb-2 pr-2 text-right font-medium text-slate-400"
                >
                  Yr {yr.year}
                  {yr.year === 3 && (
                    <span className="ml-1 text-[9px] text-sky-400">stab</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <TableRow
              label="Revenue"
              values={projection.years.map((y) => usd(y.totalRevenue))}
              highlight
            />
            <TableRow
              label="YOTEL Occ."
              values={projection.years.map((y) => pct(y.yotelOcc))}
            />
            <TableRow
              label="YOTEL ADR"
              values={projection.years.map((y) => '$' + y.yotelAdr)}
            />
            <TableRow
              label="PAD Occ."
              values={projection.years.map((y) => pct(y.padOcc))}
            />
            <TableRow
              label="PAD ADR"
              values={projection.years.map((y) => '$' + y.padAdr)}
            />
            <TableRow
              label="GOP"
              values={projection.years.map((y) => usd(y.gop))}
            />
            <TableRow
              label="GOP Margin"
              values={projection.years.map((y) =>
                y.totalRevenue > 0
                  ? pct(y.gop / y.totalRevenue)
                  : '—',
              )}
            />
            <TableRow
              label="NOI"
              values={projection.years.map((y) => usd(y.noi))}
              highlight
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableRow({
  label,
  values,
  highlight,
}: {
  label: string
  values: string[]
  highlight?: boolean
}) {
  return (
    <tr>
      <td
        className={`py-1.5 pr-3 ${
          highlight ? 'font-semibold text-slate-200' : 'text-slate-400'
        }`}
      >
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-1.5 pr-2 text-right font-mono ${
            highlight ? 'font-semibold text-slate-100' : 'text-slate-300'
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  )
}
