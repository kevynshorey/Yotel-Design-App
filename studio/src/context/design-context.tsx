'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { setSelectedOption as persistOption, clearSelectedOption, getSelectedOption } from '@/store/design-store'
import { logAudit } from '@/store/audit-store'
import { getUserFromCookie } from '@/lib/auth'

interface DesignContextValue {
  options: DesignOption[]
  selectedOption: DesignOption | null
  setOptions: (opts: DesignOption[]) => void
  selectOption: (id: string | null) => void
}

const DesignContext = createContext<DesignContextValue | null>(null)

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<DesignOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Standalone stored option — hydrated from localStorage so it's available
  // on ALL pages immediately, even when options[] is empty (e.g. /finance, /planning)
  const [storedOption, setStoredOption] = useState<DesignOption | null>(null)

  // Hydrate from localStorage on mount + listen for cross-tab changes
  useEffect(() => {
    setStoredOption(getSelectedOption())
    const handler = () => setStoredOption(getSelectedOption())
    window.addEventListener('design-option-changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('design-option-changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  // Prefer in-memory option (from generator) over stored option (from localStorage)
  const selectedOption = options.find(o => o.id === selectedId) ?? storedOption

  const selectOption = useCallback(
    (id: string | null) => {
      const prevId = selectedId
      setSelectedId(id)
      if (id) {
        const opt = options.find(o => o.id === id)
        if (opt) {
          persistOption(opt)
          setStoredOption(opt) // update in-memory immediately for other pages
          const user = getUserFromCookie()
          logAudit({
            userId: user?.name ?? 'unknown',
            userName: user?.name ?? 'Unknown',
            action: 'option_selected',
            target: opt.curatedName ?? `Option ${opt.id.slice(0, 8)}`,
            before: prevId ? `Option ${prevId.slice(0, 8)}` : undefined,
            after: `Option ${id.slice(0, 8)}`,
            metadata: { form: opt.form, score: opt.score.toFixed(1), keys: String(opt.metrics.totalKeys) },
          })
        }
      } else {
        clearSelectedOption()
        setStoredOption(null)
      }
    },
    [options, selectedId],
  )

  return (
    <DesignContext.Provider
      value={{
        options,
        selectedOption,
        setOptions,
        selectOption,
      }}
    >
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext)
  if (!ctx) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return ctx
}
