'use client'

import { FileText, FileSpreadsheet, File, Check, Clock, Lock } from 'lucide-react'

export type DocType = 'PDF' | 'XLSX' | 'DWG'
export type DocStatus = 'Available' | 'Pending' | 'Restricted'

export interface Document {
  name: string
  type: DocType
  size: string
  uploadDate: string
  status: DocStatus
}

interface DocumentListProps {
  documents: Document[]
  query: string
}

function DocTypeIcon({ type }: { type: DocType }) {
  if (type === 'XLSX') {
    return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
  }
  if (type === 'DWG') {
    return <File className="h-3.5 w-3.5 text-sky-400 shrink-0" />
  }
  return <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0" />
}

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === 'Available') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-800/50">
        <Check className="h-2.5 w-2.5" />
        Available
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 ring-1 ring-amber-800/50">
        <Clock className="h-2.5 w-2.5" />
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 ring-1 ring-slate-700/50">
      <Lock className="h-2.5 w-2.5" />
      Restricted
    </span>
  )
}

export function DocumentList({ documents, query }: DocumentListProps) {
  const filtered = query.trim()
    ? documents.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()),
      )
    : documents

  if (filtered.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-slate-500">
        No documents match your search.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-800/60">
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-slate-500">
              Document
            </th>
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-slate-500">
              Type
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
              Size
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-slate-500">
              Uploaded
            </th>
            <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc, i) => (
            <tr
              key={i}
              className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <DocTypeIcon type={doc.type} />
                  <span className="text-slate-200">{doc.name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <span className="font-mono text-slate-400">{doc.type}</span>
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-slate-400">
                {doc.size}
              </td>
              <td className="px-3 py-2.5 text-right text-slate-500">
                {doc.uploadDate}
              </td>
              <td className="px-3 py-2.5 text-center">
                <StatusBadge status={doc.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
