'use client'

interface HeroStat {
  label: string
  value: string
  sub?: string
}

interface HeroSectionProps {
  tdc: number
  totalKeys: number
  stabilisedNoi: number
}

function usdM(n: number): string {
  return '$' + (n / 1_000_000).toFixed(1) + 'M'
}

function usd(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

export function HeroSection({ tdc, totalKeys, stabilisedNoi }: HeroSectionProps) {
  const stats: HeroStat[] = [
    {
      label: 'Total Development Cost',
      value: usdM(tdc),
      sub: 'all-in TDC',
    },
    {
      label: 'Total Keys',
      value: String(totalKeys),
      sub: 'YOTEL + YOTELPAD',
    },
    {
      label: 'Stabilised NOI',
      value: usdM(stabilisedNoi),
      sub: 'Year 3',
    },
    {
      label: 'Target IRR',
      value: '~18%',
      sub: 'levered equity',
    },
  ]

  return (
    <div className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-14">
      {/* Decorative background accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            Investment Opportunity
          </span>
        </div>

        {/* Main heading */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          YOTEL Barbados
        </h1>
        <p className="mb-1 text-lg font-medium text-slate-300">
          Carlisle Bay, Bridgetown
        </p>
        <p className="mb-10 text-sm text-slate-500">
          130-key dual-brand hotel development
        </p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-5 py-4 backdrop-blur-sm"
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
              <p className="font-mono text-2xl font-bold text-sky-400">
                {stat.value}
              </p>
              {stat.sub && (
                <p className="mt-0.5 text-[11px] text-slate-600">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
