'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdvisorCard, AdvisorPriority } from '@/lib/design-advisor'

interface DesignAdvisorCardsProps {
  cards: AdvisorCard[]
}

const priorityBorder: Record<AdvisorPriority, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-slate-500',
}

const priorityDot: Record<AdvisorPriority, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-500',
}

export function DesignAdvisorCards({ cards }: DesignAdvisorCardsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (cards.length === 0) return null

  const highCount = cards.filter((c) => c.priority === 'high').length

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/85 shadow-lg backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {isOpen ? (
          <ChevronDown size={12} className="text-slate-400" />
        ) : (
          <ChevronRight size={12} className="text-slate-400" />
        )}
        <span className="text-xs font-semibold text-slate-100">Advisor</span>
        <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
          {cards.length}
        </span>
        {highCount > 0 && (
          <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
            {highCount} high
          </span>
        )}
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-3 pb-3 pt-2">
          <div className="flex flex-col gap-2">
            {cards.map((card, i) => (
              <AdvisorCardItem key={i} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdvisorCardItem({ card }: { card: AdvisorCard }) {
  return (
    <div
      className={cn(
        'rounded-md border border-white/5 border-l-2 bg-slate-800/60 px-3 py-2',
        priorityBorder[card.priority],
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn('h-1.5 w-1.5 rounded-full', priorityDot[card.priority])} />
        <span className="text-[11px] font-medium text-slate-200">{card.title}</span>
        <span className="ml-auto text-[9px] text-slate-500">
          {Math.round(card.confidence * 100)}%
        </span>
      </div>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{card.body}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {card.sourceTags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-slate-700/60 px-1 py-px text-[8px] font-medium uppercase tracking-wider text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
