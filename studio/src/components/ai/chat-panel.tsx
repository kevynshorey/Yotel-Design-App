'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Brain, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/* ------------------------------------------------------------------ */
/*  Quick prompts                                                     */
/* ------------------------------------------------------------------ */
const QUICK_PROMPTS = [
  'Optimize my site layout',
  'Check LEED compliance',
  'Suggest pool deck design',
  'Review building orientation',
  'Estimate construction cost',
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  /* --- Listen for toggle event from icon rail ------------------- */
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-ai-chat', handler)
    return () => window.removeEventListener('toggle-ai-chat', handler)
  }, [])

  /* --- Auto-scroll to bottom ------------------------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* --- Focus input when panel opens ----------------------------- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  /* --- Send message --------------------------------------------- */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInput('')
      setIsStreaming(true)

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `Error: ${errData.error ?? res.statusText}` }
                : m,
            ),
          )
          setIsStreaming(false)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          setIsStreaming(false)
          return
        }

        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          const snapshot = accumulated
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: snapshot } : m,
            ),
          )
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `Connection error: ${errorMessage}` }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, isStreaming],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
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
              <h2 className="text-sm font-semibold text-slate-100">AI Planning Assistant</h2>
              <p className="text-[10px] text-slate-400">YOTEL Barbados Design Advisor</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 pt-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <Brain className="h-7 w-7 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">
                  Design Intelligence
                </p>
                <p className="mt-1 text-xs text-slate-400 max-w-[280px]">
                  Ask about site planning, LEED compliance, structural engineering,
                  or any aspect of the YOTEL Barbados project.
                </p>
              </div>

              {/* Quick prompts */}
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className={cn(
                      'rounded-full border border-slate-700/50 px-3 py-1.5',
                      'text-[11px] text-slate-300 transition-colors',
                      'hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300',
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-sky-500/20 text-sky-100'
                        : 'bg-slate-800/80 text-slate-200',
                    )}
                  >
                    {msg.role === 'assistant' && msg.content === '' && isStreaming ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    )}
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
              placeholder="Ask about the project..."
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
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                input.trim() && !isStreaming
                  ? 'bg-violet-500 text-white hover:bg-violet-400'
                  : 'text-slate-600',
              )}
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[9px] text-slate-600">
            AI can make mistakes. Verify critical design decisions.
          </p>
        </div>
      </div>
    </>
  )
}
