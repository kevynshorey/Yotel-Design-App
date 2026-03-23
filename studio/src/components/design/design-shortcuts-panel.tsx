'use client'

import { useEffect, useState } from 'react'
import { X, Keyboard } from 'lucide-react'

interface Shortcut {
  keys: string
  description: string
}

const shortcuts: Shortcut[] = [
  { keys: '1 – 5', description: 'Navigate modules' },
  { keys: 'G', description: 'Generate options' },
  { keys: 'Esc', description: 'Deselect current option' },
  { keys: '← →', description: 'Cycle through options' },
  { keys: '?', description: 'Toggle this panel' },
]

export function DesignShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 w-56 rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Keyboard size={12} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-100">Shortcuts</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded p-0.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
        >
          <X size={12} />
        </button>
      </div>
      <div className="px-3 py-2">
        <div className="flex flex-col gap-1.5">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{s.description}</span>
              <kbd className="rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-300">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
