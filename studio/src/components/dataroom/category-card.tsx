'use client'

import { useState } from 'react'
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { DocumentList } from './document-list'
import type { Document } from './document-list'

interface CategoryCardProps {
  title: string
  documents: Document[]
  query: string
  defaultOpen?: boolean
}

export function CategoryCard({
  title,
  documents,
  query,
  defaultOpen = false,
}: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  const visibleCount = query.trim()
    ? documents.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()),
      ).length
    : documents.length

  // Hide category entirely when searching and nothing matches
  if (query.trim() && visibleCount === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/40">
      {/* Category header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
      >
        <FolderOpen className="h-4 w-4 shrink-0 text-indigo-400" />
        <span className="flex-1 text-sm font-semibold text-slate-100">
          {title}
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
          {visibleCount} {visibleCount === 1 ? 'doc' : 'docs'}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        )}
      </button>

      {/* Document table */}
      {open && (
        <div className="border-t border-slate-700/50 p-3">
          <DocumentList documents={documents} query={query} />
        </div>
      )}
    </div>
  )
}
