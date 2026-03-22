'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, RotateCcw, Save } from 'lucide-react'
import {
  ORIGINAL_BOUNDARY,
  OFFSET_BOUNDARY,
  SITE,
  PLANNING_REGS,
} from '@/config/site'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PlaceableItem {
  id: string
  label: string
  type: 'building' | 'amenity'
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke: string
  floors?: number
  rx?: number
  ry?: number
}

interface ComplianceCheck {
  label: string
  ok: boolean
  detail: string
}

/* ------------------------------------------------------------------ */
/*  Default layout                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_ITEMS: PlaceableItem[] = [
  // Buildings
  {
    id: 'amenity-block',
    label: 'Amenity Block',
    type: 'building',
    x: 40,
    y: 20,
    w: 25,
    h: 18,
    fill: '#22c55e',
    stroke: '#16a34a',
    floors: 2,
  },
  {
    id: 'residential-block',
    label: 'Residential Block',
    type: 'building',
    x: 70,
    y: 20,
    w: 50,
    h: 18,
    fill: '#14b8a6',
    stroke: '#0d9488',
    floors: 8,
  },
  // Amenities
  {
    id: 'pool',
    label: 'Pool',
    type: 'amenity',
    x: 50,
    y: 42,
    w: 15,
    h: 8,
    fill: '#3b82f6',
    stroke: '#2563eb',
    rx: 3,
    ry: 3,
  },
  {
    id: 'pool-bar',
    label: 'Pool Bar',
    type: 'amenity',
    x: 67,
    y: 44,
    w: 4,
    h: 4,
    fill: '#f59e0b',
    stroke: '#d97706',
  },
  {
    id: 'cabana-1',
    label: 'Cabana 1',
    type: 'amenity',
    x: 74,
    y: 44,
    w: 3,
    h: 3,
    fill: '#92400e',
    stroke: '#78350f',
  },
  {
    id: 'cabana-2',
    label: 'Cabana 2',
    type: 'amenity',
    x: 78,
    y: 44,
    w: 3,
    h: 3,
    fill: '#92400e',
    stroke: '#78350f',
  },
  {
    id: 'cabana-3',
    label: 'Cabana 3',
    type: 'amenity',
    x: 82,
    y: 44,
    w: 3,
    h: 3,
    fill: '#92400e',
    stroke: '#78350f',
  },
  {
    id: 'cabana-4',
    label: 'Cabana 4',
    type: 'amenity',
    x: 86,
    y: 44,
    w: 3,
    h: 3,
    fill: '#92400e',
    stroke: '#78350f',
  },
  {
    id: 'cabana-5',
    label: 'Cabana 5',
    type: 'amenity',
    x: 90,
    y: 44,
    w: 3,
    h: 3,
    fill: '#92400e',
    stroke: '#78350f',
  },
  {
    id: 'sun-loungers',
    label: 'Sun Lounger Area',
    type: 'amenity',
    x: 95,
    y: 42,
    w: 10,
    h: 5,
    fill: '#eab308',
    stroke: '#ca8a04',
  },
]

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Shoelace formula for polygon area (absolute value). */
function polygonArea(pts: { x: number; y: number }[]): number {
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    area += pts[i].x * pts[j].y
    area -= pts[j].x * pts[i].y
  }
  return Math.abs(area) / 2
}

/** Minimum distance from an axis-aligned rect to a polygon boundary. */
function rectToPolygonMinDist(
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  poly: { x: number; y: number }[],
): number {
  // Check distance from each rect corner to each edge segment
  const corners = [
    { x: rx, y: ry },
    { x: rx + rw, y: ry },
    { x: rx + rw, y: ry + rh },
    { x: rx, y: ry + rh },
  ]

  let minDist = Infinity

  for (const corner of corners) {
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length
      const d = pointToSegmentDist(corner, poly[i], poly[j])
      if (d < minDist) minDist = d
    }
  }

  // Also check polygon vertices to rect edges
  const rectEdges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ] as const

  for (const v of poly) {
    for (const [a, b] of rectEdges) {
      const d = pointToSegmentDist(v, a, b)
      if (d < minDist) minDist = d
    }
  }

  return minDist
}

function pointToSegmentDist(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const px = a.x + t * dx
  const py = a.y + t * dy
  return Math.hypot(p.x - px, p.y - py)
}

/** Minimum distance between two axis-aligned rectangles. */
function rectToRectMinDist(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): number {
  const dx = Math.max(0, Math.max(ax, bx) - Math.min(ax + aw, bx + bw))
  const dy = Math.max(0, Math.max(ay, by) - Math.min(ay + ah, by + bh))
  return Math.hypot(dx, dy)
}

/** Snap value to grid. */
function snap(val: number, grid: number): number {
  return Math.round(val / grid) * grid
}

/* ------------------------------------------------------------------ */
/*  Compliance checks                                                  */
/* ------------------------------------------------------------------ */

function runComplianceChecks(items: PlaceableItem[]): ComplianceCheck[] {
  const buildings = items.filter((i) => i.type === 'building')
  const pools = items.filter((i) => i.id.startsWith('pool') && i.id !== 'pool-bar')
  const allPlaced = items

  // 1. Site coverage
  const totalFootprint = buildings.reduce((s, b) => s + b.w * b.h, 0)
  const coveragePct = totalFootprint / SITE.grossArea
  const coverageOk = coveragePct <= SITE.maxCoverage

  // 2. Boundary setback
  const setback = PLANNING_REGS.sideSetback
  let setbackOk = true
  let worstSetback = Infinity
  for (const b of buildings) {
    const d = rectToPolygonMinDist(b.x, b.y, b.w, b.h, ORIGINAL_BOUNDARY)
    if (d < worstSetback) worstSetback = d
    if (d < setback) setbackOk = false
  }

  // 3. Building separation
  let separationOk = true
  let worstSep = Infinity
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i]
      const b = buildings[j]
      const d = rectToRectMinDist(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h)
      if (d < worstSep) worstSep = d
      if (d < 6) separationOk = false
    }
  }

  // 4. Pool setback
  let poolSetbackOk = true
  let worstPoolSetback = Infinity
  for (const p of pools) {
    const d = rectToPolygonMinDist(p.x, p.y, p.w, p.h, ORIGINAL_BOUNDARY)
    if (d < worstPoolSetback) worstPoolSetback = d
    if (d < 3) poolSetbackOk = false
  }

  // 5. Max height
  const residentialBlock = buildings.find((b) => b.id === 'residential-block')
  const estHeight = residentialBlock ? (residentialBlock.floors ?? 1) * 3.2 : 0
  const heightOk = estHeight <= PLANNING_REGS.maxHeight

  // 6. GFA
  const totalGfa = buildings.reduce((s, b) => s + b.w * b.h * (b.floors ?? 1), 0)

  return [
    {
      label: 'Site Coverage',
      ok: coverageOk,
      detail: `${(coveragePct * 100).toFixed(1)}% (max 50%)`,
    },
    {
      label: 'Boundary Setback',
      ok: setbackOk,
      detail: `${worstSetback === Infinity ? '--' : worstSetback.toFixed(1)}m (min ${setback}m)`,
    },
    {
      label: 'Building Separation',
      ok: separationOk,
      detail: buildings.length < 2
        ? 'N/A'
        : `${worstSep === Infinity ? '--' : worstSep.toFixed(1)}m (min 6m)`,
    },
    {
      label: 'Pool Setback',
      ok: poolSetbackOk,
      detail: pools.length === 0
        ? 'N/A'
        : `${worstPoolSetback === Infinity ? '--' : worstPoolSetback.toFixed(1)}m (min 3m)`,
    },
    {
      label: 'Max Height',
      ok: heightOk,
      detail: `${estHeight.toFixed(1)}m (max ${PLANNING_REGS.maxHeight}m)`,
    },
    {
      label: 'Total GFA',
      ok: true,
      detail: `${totalGfa.toLocaleString()} m\u00B2`,
    },
    {
      label: 'Coverage %',
      ok: true,
      detail: `${(coveragePct * 100).toFixed(1)}%`,
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Component props                                                    */
/* ------------------------------------------------------------------ */

interface SitePlannerProps {
  isOpen: boolean
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SitePlanner({ isOpen, onClose }: SitePlannerProps) {
  // Items state
  const [items, setItems] = useState<PlaceableItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS
    const stored = localStorage.getItem('yotel-site-planner')
    if (stored) {
      try {
        return JSON.parse(stored) as PlaceableItem[]
      } catch {
        // ignore
      }
    }
    return DEFAULT_ITEMS
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    id: string
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)

  // Compute the viewBox to encompass the site with padding
  const viewBox = useMemo(() => {
    const allX = ORIGINAL_BOUNDARY.map((p) => p.x)
    const allY = ORIGINAL_BOUNDARY.map((p) => p.y)
    const minX = Math.min(...allX) - 15
    const minY = Math.min(...allY) - 15
    const maxX = Math.max(...allX) + 15
    const maxY = Math.max(...allY) + 15
    return { minX, minY, width: maxX - minX, height: maxY - minY }
  }, [])

  // Compliance checks (recomputed on every item move)
  const compliance = useMemo(() => runComplianceChecks(items), [items])

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current
      if (!svg) return { x: 0, y: 0 }
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return { x: 0, y: 0 }
      const svgPt = pt.matrixTransform(ctm.inverse())
      return { x: svgPt.x, y: svgPt.y }
    },
    [],
  )

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, item: PlaceableItem) => {
      e.stopPropagation()
      e.preventDefault()
      // Capture on the SVG element itself — SVG child elements
      // don't reliably support pointer capture in all browsers
      if (svgRef.current) {
        svgRef.current.setPointerCapture(e.pointerId)
      }
      const svgPt = screenToSvg(e.clientX, e.clientY)
      setSelectedId(item.id)
      setDragState({
        id: item.id,
        startX: svgPt.x,
        startY: svgPt.y,
        origX: item.x,
        origY: item.y,
      })
    },
    [screenToSvg],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return
      const svgPt = screenToSvg(e.clientX, e.clientY)
      const dx = svgPt.x - dragState.startX
      const dy = svgPt.y - dragState.startY
      const newX = snap(dragState.origX + dx, 1)
      const newY = snap(dragState.origY + dy, 1)
      setItems((prev) =>
        prev.map((it) =>
          it.id === dragState.id ? { ...it, x: newX, y: newY } : it,
        ),
      )
    },
    [dragState, screenToSvg],
  )

  const handlePointerUp = useCallback(() => {
    setDragState(null)
  }, [])

  // Arrow key fine positioning
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (!selectedId) return
      const step = 0.5
      let dx = 0
      let dy = 0
      if (e.key === 'ArrowLeft') dx = -step
      else if (e.key === 'ArrowRight') dx = step
      else if (e.key === 'ArrowUp') dy = -step
      else if (e.key === 'ArrowDown') dy = step
      else if (e.key === 'Escape') {
        setSelectedId(null)
        return
      } else return

      e.preventDefault()
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedId ? { ...it, x: it.x + dx, y: it.y + dy } : it,
        ),
      )
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, selectedId])

  // Reset handler
  const handleReset = useCallback(() => {
    setItems(DEFAULT_ITEMS)
    setSelectedId(null)
    localStorage.removeItem('yotel-site-planner')
  }, [])

  // Save handler
  const handleSave = useCallback(() => {
    localStorage.setItem('yotel-site-planner', JSON.stringify(items))
  }, [items])

  // Click background to deselect
  const handleBgClick = useCallback(() => {
    setSelectedId(null)
  }, [])

  if (!isOpen) return null

  // Build SVG path for polygon
  const polyPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  // Setback path (1.83m inset — approximate via offset boundary)
  const setbackLines = ORIGINAL_BOUNDARY.map((p, i) => {
    const j = (i + 1) % ORIGINAL_BOUNDARY.length
    return { x1: p.x, y1: p.y, x2: ORIGINAL_BOUNDARY[j].x, y2: ORIGINAL_BOUNDARY[j].y }
  })

  const selectedItem = items.find((it) => it.id === selectedId)

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-200">
          Interactive Site Planner
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="Reset Layout"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-400 hover:bg-slate-800 hover:text-emerald-300"
            title="Save Layout"
          >
            <Save size={12} />
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          className="h-full w-full"
          viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleBgClick}
          style={{ touchAction: 'none' }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern
              id="grid5m"
              width={5}
              height={5}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 5 0 L 0 0 0 5"
                fill="none"
                stroke="#334155"
                strokeWidth={0.15}
              />
            </pattern>
          </defs>

          {/* Background fill */}
          <rect
            x={viewBox.minX}
            y={viewBox.minY}
            width={viewBox.width}
            height={viewBox.height}
            fill="#0f172a"
          />

          {/* Grid */}
          <rect
            x={viewBox.minX}
            y={viewBox.minY}
            width={viewBox.width}
            height={viewBox.height}
            fill="url(#grid5m)"
          />

          {/* Site boundary — red dashed */}
          <path
            d={polyPath(ORIGINAL_BOUNDARY)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={0.5}
            strokeDasharray="2 1.5"
          />

          {/* Offset / buildable boundary — blue solid */}
          <path
            d={polyPath(OFFSET_BOUNDARY)}
            fill="rgba(59,130,246,0.05)"
            stroke="#3b82f6"
            strokeWidth={0.4}
          />

          {/* Setback lines (1.83m from boundary) — subtle orange dashed */}
          {setbackLines.map((seg, i) => (
            <line
              key={`setback-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#f97316"
              strokeWidth={0.15}
              strokeDasharray="1 1"
              opacity={0.4}
            />
          ))}

          {/* Road reserve at south edge */}
          <line
            x1={viewBox.minX}
            y1={-2}
            x2={viewBox.minX + viewBox.width}
            y2={-2}
            stroke="#94a3b8"
            strokeWidth={0.3}
            strokeDasharray="3 2"
          />
          <text
            x={SITE.centroidX}
            y={-4}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={2.5}
            fontFamily="sans-serif"
          >
            Bay Street
          </text>

          {/* Carlisle Bay label (west) */}
          <text
            x={viewBox.minX + 3}
            y={SITE.centroidY}
            fill="#64748b"
            fontSize={2.2}
            fontFamily="sans-serif"
            transform={`rotate(-90, ${viewBox.minX + 3}, ${SITE.centroidY})`}
          >
            {'Carlisle Bay \u2192'}
          </text>

          {/* North arrow */}
          <g transform={`translate(${viewBox.minX + viewBox.width - 8}, ${viewBox.minY + 8})`}>
            <line x1={0} y1={4} x2={0} y2={-4} stroke="#e2e8f0" strokeWidth={0.4} />
            <polygon points="0,-5 -1.2,-2.5 1.2,-2.5" fill="#e2e8f0" />
            <text
              x={0}
              y={-6.5}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize={2.5}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              N
            </text>
          </g>

          {/* Scale bar */}
          <g transform={`translate(${viewBox.minX + 5}, ${viewBox.minY + viewBox.height - 5})`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke="#e2e8f0" strokeWidth={0.3} />
            <line x1={0} y1={-0.8} x2={0} y2={0.8} stroke="#e2e8f0" strokeWidth={0.3} />
            <line x1={20} y1={-0.8} x2={20} y2={0.8} stroke="#e2e8f0" strokeWidth={0.3} />
            <text
              x={10}
              y={-1.5}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize={1.8}
              fontFamily="sans-serif"
            >
              20m
            </text>
          </g>

          {/* Placeable items */}
          {items.map((item) => {
            const isSelected = item.id === selectedId
            const isDragging = dragState?.id === item.id
            return (
              <g
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <rect
                  x={item.x}
                  y={item.y}
                  width={item.w}
                  height={item.h}
                  rx={item.rx ?? 0.5}
                  ry={item.ry ?? 0.5}
                  fill={item.fill}
                  fillOpacity={0.6}
                  stroke={isSelected ? '#60a5fa' : item.stroke}
                  strokeWidth={isSelected ? 0.6 : 0.3}
                />
                {/* Label */}
                <text
                  x={item.x + item.w / 2}
                  y={item.y + item.h / 2 - (item.type === 'building' ? 1 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={item.type === 'building' ? 2 : 1.4}
                  fontWeight="600"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {item.label}
                </text>
                {/* Dimensions */}
                {item.type === 'building' && (
                  <text
                    x={item.x + item.w / 2}
                    y={item.y + item.h / 2 + 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.7)"
                    fontSize={1.5}
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {item.w}m x {item.h}m | {item.floors}F
                  </text>
                )}
                {/* Selected tooltip — shows dimensions for amenities too */}
                {isSelected && item.type === 'amenity' && (
                  <text
                    x={item.x + item.w / 2}
                    y={item.y - 1.5}
                    textAnchor="middle"
                    fill="#60a5fa"
                    fontSize={1.3}
                    fontFamily="sans-serif"
                    pointerEvents="none"
                  >
                    {item.w}m x {item.h}m
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Compliance panel — floating top-right */}
        <div className="absolute right-3 top-3 w-56 rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Compliance
          </h3>
          <div className="space-y-1.5">
            {compliance.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span>{c.ok ? '\u2705' : '\u274C'}</span>
                  <span className="text-slate-300">{c.label}</span>
                </span>
                <span className={c.ok ? 'text-emerald-400' : 'text-red-400'}>
                  {c.detail}
                </span>
              </div>
            ))}
          </div>

          {/* Selected item info */}
          {selectedItem && (
            <div className="mt-3 border-t border-slate-700 pt-2">
              <p className="text-[10px] text-slate-500">
                Selected: <span className="text-slate-300">{selectedItem.label}</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Position: ({selectedItem.x.toFixed(1)}, {selectedItem.y.toFixed(1)})
              </p>
              <p className="text-[10px] text-slate-500">
                Use arrow keys for 0.5m nudge
              </p>
            </div>
          )}
        </div>

        {/* Legend — bottom-left */}
        <div className="absolute bottom-3 left-3 rounded-lg border border-slate-700 bg-slate-900/95 p-2 text-[10px] text-slate-400 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block h-2 w-4 border border-red-400 border-dashed" />
            Site Boundary
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block h-2 w-4 border border-blue-400" />
            Buildable Zone
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block h-2 w-4 bg-emerald-500/60 rounded-sm" />
            Amenity Block
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block h-2 w-4 bg-teal-500/60 rounded-sm" />
            Residential Block
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 bg-blue-500/60 rounded-sm" />
            Pool / Amenities
          </div>
        </div>
      </div>
    </div>
  )
}
