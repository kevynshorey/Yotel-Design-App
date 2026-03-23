'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Copy, Brain, Check, Clipboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSelectedOption } from '@/store/design-store'
import { SITE, PLANNING_REGS } from '@/config/site'
import type { DesignOption } from '@/engine/types'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface PromptEntry {
  id: string
  question: string
  prompt: string
  copied: boolean
}

/* ------------------------------------------------------------------ */
/*  Quick prompts — context-rich starters                             */
/* ------------------------------------------------------------------ */
const QUICK_PROMPTS = [
  {
    label: 'Optimize room mix',
    question:
      'What is the optimal YOTEL / PAD room mix for a 130-key beachfront hotel in Barbados to maximise RevPAR while keeping construction cost under $80M USD?',
  },
  {
    label: 'LEED compliance check',
    question:
      'Review my building design for LEED Silver certification feasibility — what are the easiest credits to achieve for a Caribbean hotel and which will be hardest?',
  },
  {
    label: 'Planning risk assessment',
    question:
      'Assess planning permission risk for this building given Barbados TCDPO regulations, CZMU coastal setback requirements, and proximity to the UNESCO World Heritage buffer zone.',
  },
  {
    label: 'Cost reduction strategies',
    question:
      'Identify the top 5 cost reduction strategies for this hotel design without compromising YOTEL brand standards or guest experience quality.',
  },
  {
    label: 'Revenue projection review',
    question:
      'Review the revenue assumptions for this hotel — are the ADR, occupancy, and ancillary income projections realistic for the Barbados south coast market?',
  },
]

/* ------------------------------------------------------------------ */
/*  Build context string from current project state                   */
/* ------------------------------------------------------------------ */
function buildProjectContext(option: DesignOption | null): string {
  const lines: string[] = []

  lines.push('=== YOTEL Barbados Design Studio — Project Context ===')
  lines.push('')
  lines.push('## Site')
  lines.push(`- Gross site area: ${SITE.grossArea} m²`)
  lines.push(`- Buildable area: ${SITE.buildableArea} m²`)
  lines.push(`- Max coverage: ${(SITE.maxCoverage * 100).toFixed(0)}%`)
  lines.push(`- Max footprint: ${SITE.maxFootprint} m²`)
  lines.push(`- Max height: ${SITE.maxHeight} m`)
  lines.push(`- Buildable envelope: ${SITE.buildableEW.toFixed(1)} m (E-W) x ${SITE.buildableNS.toFixed(1)} m (N-S)`)
  lines.push(`- Beach side: ${SITE.beachSide}`)
  lines.push('')
  lines.push('## Planning Regulations (Barbados)')
  lines.push(`- Coastal setback (CZMU): ${PLANNING_REGS.coastalSetback} m from HWM`)
  lines.push(`- Max site coverage: ${(PLANNING_REGS.maxCoverage * 100).toFixed(0)}%`)
  lines.push(`- Max building height: ${PLANNING_REGS.maxHeight} m`)
  lines.push(`- EIA required: ${PLANNING_REGS.eiaRequired ? 'Yes' : 'No'}`)
  lines.push(`- Heritage zone proximity: ${PLANNING_REGS.heritageZoneProximity ? 'Yes (UNESCO buffer)' : 'No'}`)
  lines.push(`- Side/rear setback: ${PLANNING_REGS.sideSetback} m`)

  if (option) {
    const m = option.metrics
    lines.push('')
    lines.push('## Selected Design Option')
    if (option.curatedName) lines.push(`- Design: ${option.curatedName}`)
    lines.push(`- Building form: ${option.form}`)
    lines.push(`- Storeys: ${option.floors.length}`)
    lines.push(`- Total keys: ${m.totalKeys} (YOTEL: ${m.yotelKeys}, PAD: ${m.padUnits})`)
    lines.push(`- GIA: ${m.gia.toLocaleString()} m²`)
    lines.push(`- GIA per key: ${m.giaPerKey.toFixed(1)} m²`)
    lines.push(`- Footprint: ${m.footprint.toFixed(0)} m²`)
    lines.push(`- Coverage: ${(m.coverage * 100).toFixed(1)}%`)
    lines.push(`- Building height: ${m.buildingHeight.toFixed(1)} m`)
    lines.push(`- West facade (sea-facing): ${m.westFacade.toFixed(1)} m`)
    lines.push(`- Outdoor area: ${m.outdoorTotal.toFixed(0)} m²`)
    lines.push(`- Cost per key: $${m.costPerKey.toLocaleString()}`)
    lines.push(`- TDC: $${m.tdc.toLocaleString()}`)
    lines.push(`- Corridor type: ${m.corridorType}`)
    lines.push(`- Amenity score: ${m.amenityScore.toFixed(1)}/10`)
    lines.push(`- Overall score: ${option.score.toFixed(1)}/100`)

    if (option.validation) {
      const v = option.validation
      lines.push('')
      lines.push('## Validation')
      lines.push(`- Valid: ${v.isValid ? 'Yes' : 'No'}`)
      if (v.violations && v.violations.length > 0) {
        lines.push(`- Violations: ${v.violations.map((vl) => `${vl.rule} (actual: ${vl.actual}, limit: ${vl.limit})`).join('; ')}`)
      }
      if (v.warnings && v.warnings.length > 0) {
        lines.push(`- Warnings: ${v.warnings.join('; ')}`)
      }
    }
  } else {
    lines.push('')
    lines.push('## Selected Design Option')
    lines.push('- No design option currently selected.')
  }

  return lines.join('\n')
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [entries, setEntries] = useState<PromptEntry[]>([])
  const [input, setInput] = useState('')
  const [currentOption, setCurrentOption] = useState<DesignOption | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  /* --- Listen for toggle event from icon rail ------------------- */
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-ai-chat', handler)
    return () => window.removeEventListener('toggle-ai-chat', handler)
  }, [])

  /* --- Track selected design option ----------------------------- */
  useEffect(() => {
    const refresh = () => setCurrentOption(getSelectedOption())
    refresh()
    window.addEventListener('design-option-changed', refresh)
    return () => window.removeEventListener('design-option-changed', refresh)
  }, [])

  /* --- Auto-scroll to bottom ------------------------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  /* --- Focus input when panel opens ----------------------------- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  /* --- Build prompt and copy to clipboard ----------------------- */
  const buildAndCopy = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed) return

      const context = buildProjectContext(currentOption)
      const fullPrompt = [
        context,
        '',
        '---',
        '',
        '## Question',
        trimmed,
        '',
        '---',
        'Please provide specific, actionable advice based on the project context above.',
      ].join('\n')

      try {
        await navigator.clipboard.writeText(fullPrompt)
      } catch {
        // fallback: textarea copy
        const ta = document.createElement('textarea')
        ta.value = fullPrompt
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }

      const entry: PromptEntry = {
        id: crypto.randomUUID(),
        question: trimmed,
        prompt: fullPrompt,
        copied: true,
      }

      setEntries((prev) => [...prev, entry])
      setInput('')

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, copied: false } : e)),
        )
      }, 3000)
    },
    [currentOption],
  )

  /* --- Re-copy a previous prompt -------------------------------- */
  const reCopy = useCallback(async (entry: PromptEntry) => {
    try {
      await navigator.clipboard.writeText(entry.prompt)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = entry.prompt
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, copied: true } : e)),
    )
    setTimeout(() => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, copied: false } : e)),
      )
    }, 2000)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      buildAndCopy(input)
    }
  }

  /* --- Render --------------------------------------------------- */
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full flex-col',
          'bg-slate-900/95 backdrop-blur-xl shadow-2xl',
          'border-l border-slate-700/50',
          'transition-transform duration-300 ease-in-out',
          'md:w-[420px]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <Brain className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">AI Prompt Builder</h2>
              <p className="text-[10px] text-slate-400">
                Generates prompts for Claude.ai — paste to get expert advice
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages / Entries */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-4 pt-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <Brain className="h-7 w-7 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">
                  AI Prompt Builder
                </p>
                <p className="mt-1 text-xs text-slate-400 max-w-[280px]">
                  Ask a question and a context-rich prompt will be copied to your
                  clipboard. Paste it into Claude.ai for expert advice on your
                  YOTEL Barbados project.
                </p>
                {currentOption ? (
                  <p className="mt-2 text-[10px] text-emerald-400">
                    Design loaded: {currentOption.curatedName ?? currentOption.form} — {currentOption.metrics.totalKeys} keys
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-amber-400">
                    No design selected — prompts will include site data only
                  </p>
                )}
              </div>

              {/* Quick prompts */}
              <div className="mt-2 flex flex-col gap-2 w-full">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => buildAndCopy(qp.question)}
                    className={cn(
                      'rounded-lg border border-slate-700/50 px-3 py-2 text-left',
                      'text-[11px] text-slate-300 transition-colors',
                      'hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300',
                    )}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-1.5">
                  {/* User question */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-sky-500/20 px-3.5 py-2.5 text-[13px] leading-relaxed text-sky-100">
                      <div className="whitespace-pre-wrap break-words">{entry.question}</div>
                    </div>
                  </div>
                  {/* Copy confirmation */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-slate-800/80 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-200">
                      <div className="flex items-center gap-2">
                        {entry.copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 text-xs font-medium">
                              Copied! Paste into Claude.ai
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={() => reCopy(entry)}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors"
                          >
                            <Clipboard className="h-3.5 w-3.5 shrink-0" />
                            Copy prompt again
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Includes site data, planning rules{currentOption ? ', and design metrics' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-end gap-2 rounded-xl bg-slate-800/60 px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a question — prompt copied to clipboard..."
              rows={1}
              className={cn(
                'flex-1 resize-none bg-transparent text-sm text-slate-100',
                'placeholder:text-slate-500 focus:outline-none',
                'max-h-32 min-h-[20px]',
              )}
              style={{
                height: 'auto',
                minHeight: '20px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={() => buildAndCopy(input)}
              disabled={!input.trim()}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                input.trim()
                  ? 'bg-violet-500 text-white hover:bg-violet-400'
                  : 'text-slate-600',
              )}
              title="Build prompt and copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[9px] text-slate-600">
            Copies a context-rich prompt to your clipboard. Paste into Claude.ai for answers.
          </p>
        </div>
      </div>
    </>
  )
}
