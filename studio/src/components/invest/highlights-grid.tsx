'use client'

interface Highlight {
  title: string
  subtitle: string
  body: string
  icon: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: '⬡',
    title: 'Dual-Brand Strategy',
    subtitle: 'YOTEL + YOTELPAD under one roof',
    body: 'Two complementary YOTEL brands operating from a single building maximise demand capture across business, leisure, and extended-stay segments without cannibalisation.',
  },
  {
    icon: '◈',
    title: 'Prime Beachfront',
    subtitle: 'Carlisle Bay, UNESCO heritage zone',
    body: 'Direct Carlisle Bay frontage in UNESCO World Heritage proximity — a land position that cannot be replicated. Bridgetown\'s most sought-after hospitality address.',
  },
  {
    icon: '▣',
    title: 'Modular Construction',
    subtitle: '40% faster build, controlled quality',
    body: 'Off-site modular fabrication dramatically reduces on-island construction risk, weather exposure, and programme duration — delivering the hotel faster to a supply-constrained Caribbean market.',
  },
  {
    icon: '◎',
    title: 'Strong Unit Economics',
    subtitle: '11%+ yield on cost, $200+ RevPAR',
    body: 'Stabilised yield-on-cost above 11% against a blended RevPAR exceeding $200, underpinned by conservative ramp assumptions and a dual-brand occupancy floor.',
  },
]

export function HighlightsGrid() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Investment Highlights
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="group rounded-xl border border-slate-700/50 bg-slate-800/20 p-5 transition-colors hover:border-sky-800/60 hover:bg-slate-800/40"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-sky-800/50 bg-sky-950/60 text-lg text-sky-400">
                {h.icon}
              </div>
              <h3 className="mb-0.5 text-sm font-semibold text-slate-100">
                {h.title}
              </h3>
              <p className="mb-2 text-[11px] font-medium text-sky-400/80">
                {h.subtitle}
              </p>
              <p className="text-[12px] leading-relaxed text-slate-400">
                {h.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
