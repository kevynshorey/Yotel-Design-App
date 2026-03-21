'use client'

interface Milestone {
  quarter: string
  title: string
  description: string
  status: 'complete' | 'active' | 'upcoming'
}

const MILESTONES: Milestone[] = [
  {
    quarter: 'Q2 2025',
    title: 'Planning Approval',
    description: 'Submission and approval of full planning application to Town and Country Development Planning Office (TCDPO), Barbados.',
    status: 'complete',
  },
  {
    quarter: 'Q4 2025',
    title: 'Construction Start',
    description: 'Financial close, contractor mobilisation, and commencement of modular fabrication programme. Site hoarding and enabling works.',
    status: 'active',
  },
  {
    quarter: 'Q3 2027',
    title: 'Soft Opening',
    description: 'Phased handover of modular units, YOTEL fit-out completion, brand launch, and initial guest operations with a limited inventory.',
    status: 'upcoming',
  },
  {
    quarter: '2028',
    title: 'Stabilisation',
    description: 'Full inventory operating. Both brands at stabilised occupancy (78% YOTEL / 75% YOTELPAD). NOI and yield-on-cost targets achieved.',
    status: 'upcoming',
  },
]

const STATUS_STYLES: Record<Milestone['status'], string> = {
  complete: 'border-sky-500 bg-sky-500',
  active: 'border-sky-400 bg-sky-950 ring-2 ring-sky-400/40',
  upcoming: 'border-slate-600 bg-slate-800',
}

const LINE_STYLES: Record<Milestone['status'], string> = {
  complete: 'bg-sky-700',
  active: 'bg-gradient-to-b from-sky-700 to-slate-700',
  upcoming: 'bg-slate-700',
}

export function Timeline() {
  return (
    <div className="border-t border-slate-800/60 px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Development Timeline
        </h2>

        <div className="relative">
          {MILESTONES.map((milestone, idx) => {
            const isLast = idx === MILESTONES.length - 1
            return (
              <div key={milestone.quarter} className="flex gap-5">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${STATUS_STYLES[milestone.status]}`}
                  />
                  {!isLast && (
                    <div className={`mt-1 w-px flex-1 ${LINE_STYLES[milestone.status]}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                  <div className="mb-0.5 flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-sky-400">
                      {milestone.quarter}
                    </span>
                    {milestone.status === 'complete' && (
                      <span className="rounded-full bg-sky-900/60 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                        Achieved
                      </span>
                    )}
                    {milestone.status === 'active' && (
                      <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-100">
                    {milestone.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-slate-400">
                    {milestone.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
