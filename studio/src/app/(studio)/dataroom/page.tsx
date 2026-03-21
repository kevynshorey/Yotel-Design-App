'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { CategoryCard } from '@/components/dataroom/category-card'
import type { Document } from '@/components/dataroom/document-list'

interface Category {
  title: string
  documents: Document[]
}

const CATEGORIES: Category[] = [
  {
    title: 'Legal',
    documents: [
      {
        name: 'YOTEL Brand License Agreement — Coruscant Developments Ltd',
        type: 'PDF',
        size: '4.2 MB',
        uploadDate: '12 Jan 2025',
        status: 'Available',
      },
      {
        name: 'Sale & Purchase Agreement — Carlisle Bay Lot 14B',
        type: 'PDF',
        size: '3.8 MB',
        uploadDate: '18 Jan 2025',
        status: 'Available',
      },
      {
        name: 'Development Agreement — Government of Barbados',
        type: 'PDF',
        size: '2.1 MB',
        uploadDate: '22 Jan 2025',
        status: 'Available',
      },
      {
        name: 'Management Agreement — YOTEL Hotels & Resorts Ltd',
        type: 'PDF',
        size: '5.6 MB',
        uploadDate: '30 Jan 2025',
        status: 'Restricted',
      },
      {
        name: 'Corporate Structure Chart — SPV & Holding Co.',
        type: 'PDF',
        size: '0.8 MB',
        uploadDate: '05 Feb 2025',
        status: 'Available',
      },
      {
        name: 'Escrow Agreement — First Citizens Bank Barbados',
        type: 'PDF',
        size: '1.4 MB',
        uploadDate: '14 Feb 2025',
        status: 'Restricted',
      },
    ],
  },
  {
    title: 'Planning & Permits',
    documents: [
      {
        name: 'Town Planning Approval — TCP Ref 2024/0847',
        type: 'PDF',
        size: '6.3 MB',
        uploadDate: '08 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Coastal Zone Management Permit — CZMU/2024/0312',
        type: 'PDF',
        size: '3.1 MB',
        uploadDate: '15 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Building Permit Application — Phase 1',
        type: 'PDF',
        size: '12.7 MB',
        uploadDate: '02 Apr 2025',
        status: 'Pending',
      },
      {
        name: 'Setback Variance Application — West Elevation',
        type: 'PDF',
        size: '2.4 MB',
        uploadDate: '10 Apr 2025',
        status: 'Pending',
      },
      {
        name: 'Fire Safety Pre-Submission Comments — BFRA',
        type: 'PDF',
        size: '1.2 MB',
        uploadDate: '18 Apr 2025',
        status: 'Available',
      },
      {
        name: 'Utility Connection Approval — BWA & BL&P',
        type: 'PDF',
        size: '0.9 MB',
        uploadDate: '25 Apr 2025',
        status: 'Pending',
      },
    ],
  },
  {
    title: 'Financial',
    documents: [
      {
        name: 'Pro Forma Financial Model v2.1 — YOTEL Barbados',
        type: 'XLSX',
        size: '3.4 MB',
        uploadDate: '20 Feb 2025',
        status: 'Restricted',
      },
      {
        name: 'BCQS Construction Cost Estimate — Q1 2025',
        type: 'XLSX',
        size: '2.1 MB',
        uploadDate: '01 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Investor Presentation — Series A Round',
        type: 'PDF',
        size: '8.9 MB',
        uploadDate: '10 Mar 2025',
        status: 'Restricted',
      },
      {
        name: 'Development Budget Summary — TDC $148M',
        type: 'XLSX',
        size: '1.8 MB',
        uploadDate: '15 Mar 2025',
        status: 'Restricted',
      },
      {
        name: 'Construction Finance Term Sheet — RBTT Merchant Bank',
        type: 'PDF',
        size: '2.3 MB',
        uploadDate: '22 Mar 2025',
        status: 'Restricted',
      },
      {
        name: 'Stabilised NOI Sensitivity Analysis',
        type: 'XLSX',
        size: '1.2 MB',
        uploadDate: '01 Apr 2025',
        status: 'Available',
      },
      {
        name: 'Equity Waterfall Model — LP/GP Split',
        type: 'XLSX',
        size: '0.9 MB',
        uploadDate: '08 Apr 2025',
        status: 'Restricted',
      },
    ],
  },
  {
    title: 'Technical',
    documents: [
      {
        name: 'Geotechnical Survey Report — Geopave Ltd',
        type: 'PDF',
        size: '18.4 MB',
        uploadDate: '05 Nov 2024',
        status: 'Available',
      },
      {
        name: 'Topographic Survey — Lot 14B Carlisle Bay',
        type: 'DWG',
        size: '22.1 MB',
        uploadDate: '12 Nov 2024',
        status: 'Available',
      },
      {
        name: 'Concept Design Package — BAR Form Option C3',
        type: 'PDF',
        size: '34.6 MB',
        uploadDate: '15 Jan 2025',
        status: 'Available',
      },
      {
        name: 'Structural Basis of Design — Piling & Foundations',
        type: 'PDF',
        size: '9.2 MB',
        uploadDate: '28 Jan 2025',
        status: 'Available',
      },
      {
        name: 'MEP Services Strategy Report',
        type: 'PDF',
        size: '7.8 MB',
        uploadDate: '10 Feb 2025',
        status: 'Available',
      },
      {
        name: 'Floor Plans — All Levels — Rev 04',
        type: 'DWG',
        size: '41.3 MB',
        uploadDate: '18 Feb 2025',
        status: 'Pending',
      },
      {
        name: 'Façade Specification — West Elevation Louvres',
        type: 'PDF',
        size: '5.5 MB',
        uploadDate: '05 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Site Drainage & Storm Water Management Plan',
        type: 'DWG',
        size: '15.2 MB',
        uploadDate: '20 Mar 2025',
        status: 'Pending',
      },
    ],
  },
  {
    title: 'Environmental',
    documents: [
      {
        name: 'Phase 1 ESA — Carlisle Bay Site Assessment',
        type: 'PDF',
        size: '24.7 MB',
        uploadDate: '18 Oct 2024',
        status: 'Available',
      },
      {
        name: 'Environmental Impact Assessment — Draft',
        type: 'PDF',
        size: '31.2 MB',
        uploadDate: '10 Dec 2024',
        status: 'Available',
      },
      {
        name: 'Coral Reef Baseline Survey — Marine Ecology',
        type: 'PDF',
        size: '16.4 MB',
        uploadDate: '20 Dec 2024',
        status: 'Available',
      },
      {
        name: 'Environmental Management Plan — Construction Phase',
        type: 'PDF',
        size: '8.1 MB',
        uploadDate: '15 Feb 2025',
        status: 'Pending',
      },
      {
        name: 'Waste Water Treatment Strategy — BWSL Consent',
        type: 'PDF',
        size: '4.3 MB',
        uploadDate: '28 Feb 2025',
        status: 'Pending',
      },
      {
        name: 'LEED Pre-Certification Assessment',
        type: 'PDF',
        size: '6.7 MB',
        uploadDate: '12 Mar 2025',
        status: 'Available',
      },
    ],
  },
  {
    title: 'Insurance',
    documents: [
      {
        name: "Contractor's All Risk Policy — Construction Phase",
        type: 'PDF',
        size: '2.8 MB',
        uploadDate: '01 Apr 2025',
        status: 'Pending',
      },
      {
        name: 'Professional Indemnity Insurance — Design Team',
        type: 'PDF',
        size: '1.6 MB',
        uploadDate: '15 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Public Liability Cover — Site Operations',
        type: 'PDF',
        size: '1.2 MB',
        uploadDate: '20 Mar 2025',
        status: 'Available',
      },
      {
        name: 'Hurricane & Windstorm Coverage — Parametric Policy',
        type: 'PDF',
        size: '2.1 MB',
        uploadDate: '01 Apr 2025',
        status: 'Pending',
      },
      {
        name: 'Directors & Officers Liability — Coruscant SPV',
        type: 'PDF',
        size: '0.9 MB',
        uploadDate: '10 Apr 2025',
        status: 'Available',
      },
    ],
  },
]

function formatBytes(documents: { size: string }[]): string {
  // Sum MB values from size strings for display
  let totalMB = 0
  for (const doc of documents) {
    const match = doc.size.match(/([\d.]+)\s*MB/)
    if (match) totalMB += parseFloat(match[1])
  }
  if (totalMB >= 1000) {
    return `${(totalMB / 1024).toFixed(1)} GB`
  }
  return `${totalMB.toFixed(0)} MB`
}

export default function DataroomPage() {
  const [query, setQuery] = useState('')

  const allDocuments = CATEGORIES.flatMap((c) => c.documents)
  const totalDocs = allDocuments.length
  const totalSize = formatBytes(allDocuments)

  const matchCount = query.trim()
    ? allDocuments.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()),
      ).length
    : null

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3">
        <h1 className="text-sm font-semibold text-slate-100">Data Room</h1>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-400">YOTEL Barbados · Project Documents</span>
        <span className="text-xs text-slate-500">—</span>
        <span className="text-xs text-slate-500">
          {totalDocs} documents · {totalSize}
        </span>
        {matchCount !== null && (
          <>
            <span className="text-xs text-slate-500">—</span>
            <span className="text-xs text-indigo-400">
              {matchCount} {matchCount === 1 ? 'result' : 'results'}
            </span>
          </>
        )}
      </div>

      {/* Search bar */}
      <div className="border-b border-slate-800/60 px-5 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-5">
          {CATEGORIES.map((category, i) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              documents={category.documents}
              query={query}
              defaultOpen={i === 0}
            />
          ))}

          {/* Empty state when search yields nothing */}
          {query.trim() && matchCount === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-slate-400">No documents found</p>
              <p className="mt-1 text-xs text-slate-600">
                Try a different search term
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="px-5 pb-5 text-[10px] text-slate-600">
          This data room contains confidential project documents for YOTEL Barbados.
          Access is restricted to authorised parties only. All document activity is logged.
          Restricted documents require NDA clearance — contact the project team to request access.
        </p>
      </div>
    </div>
  )
}
