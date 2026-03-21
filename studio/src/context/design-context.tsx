'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { setSelectedOption as persistOption, clearSelectedOption } from '@/store/design-store'

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

  const selectedOption = options.find(o => o.id === selectedId) ?? null

  const selectOption = useCallback(
    (id: string | null) => {
      setSelectedId(id)
      if (id) {
        const opt = options.find(o => o.id === id)
        if (opt) persistOption(opt)
      } else {
        clearSelectedOption()
      }
    },
    [options],
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
