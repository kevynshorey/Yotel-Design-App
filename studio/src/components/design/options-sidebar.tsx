'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { OptionCard } from './option-card'
import { cn } from '@/lib/utils'

interface OptionsSidebarProps {
  options: DesignOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function OptionsSidebar({ options, selectedId, onSelect }: OptionsSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={cn('relative flex h-full flex-col border-l border-slate-200 bg-white/80 backdrop-blur-sm transition-all', isOpen ? 'w-60' : 'w-0')}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-8 top-3 z-10 h-6 w-6 rounded-full border bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
      {isOpen && (
        <>
          <div className="border-b px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-900">{options.length} Options</h3>
          </div>
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="flex flex-col gap-2">
              {options.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={opt.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
