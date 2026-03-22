'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import {
  X,
  RotateCcw,
  Save,
  Trash2,
  Copy,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import {
  ORIGINAL_BOUNDARY,
  OFFSET_BOUNDARY,
  SITE,
  PLANNING_REGS,
} from '@/config/site'
import type { DesignOption } from '@/engine/types'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ComponentCategory = 'residential' | 'amenity' | 'pool' | 'landscape' | 'service'

interface PlacedComponent {
  id: string
  templateId: string
  label: string
  category: ComponentCategory
  x: number
  y: number
  width: number   // metres
  height: number  // metres
  rotation: number // degrees
  storeys: number
  fill: string
  cornerRadius: number
}

interface ComponentTemplate {
  templateId: string
  label: string
  category: ComponentCategory
  defaultWidth: number
  defaultHeight: number
  defaultStoreys: number
  fill: string
  cornerRadius: number
  minStoreys?: number
  maxStoreys?: number
}

interface ComplianceCheck {
  label: string
  ok: boolean
  detail: string
  value?: number
}

interface InteractivePlannerProps {
  isOpen: boolean
  onClose: () => void
  selectedOption?: DesignOption | null
  favourites?: Set<string>
  onToggleFavourite?: (id: string) => void
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCALE = 8 // pixels per metre
const GRID_SNAP = 0.5 // metres
const GRID_SIZE = 5 // metres (visual grid)
const STORAGE_KEY = 'yotel-interactive-planner'

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  residential: '#0d9488',
  amenity: '#d4a574',
  pool: '#3b82f6',
  landscape: '#22c55e',
  service: '#64748b',
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    templateId: 'residential-block',
    label: 'Residential Block',
    category: 'residential',
    defaultWidth: 50,
    defaultHeight: 18,
    defaultStoreys: 7,
    fill: CATEGORY_COLORS.residential,
    cornerRadius: 0,
    minStoreys: 5,
    maxStoreys: 8,
  },
  {
    templateId: 'amenity-block',
    label: 'Amenity Block',
    category: 'amenity',
    defaultWidth: 25,
    defaultHeight: 18,
    defaultStoreys: 2,
    fill: CATEGORY_COLORS.amenity,
    cornerRadius: 0,
  },
  {
    templateId: 'pool',
    label: 'Pool',
    category: 'pool',
    defaultWidth: 18,
    defaultHeight: 9,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.pool,
    cornerRadius: 12,
  },
  {
    templateId: 'pool-bar',
    label: 'Pool Bar',
    category: 'amenity',
    defaultWidth: 6,
    defaultHeight: 4,
    defaultStoreys: 1,
    fill: '#f59e0b',
    cornerRadius: 4,
  },
  {
    templateId: 'cabana',
    label: 'Cabana',
    category: 'landscape',
    defaultWidth: 3,
    defaultHeight: 3,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.landscape,
    cornerRadius: 2,
  },
  {
    templateId: 'sun-lounger',
    label: 'Sun Lounger Area',
    category: 'landscape',
    defaultWidth: 10,
    defaultHeight: 5,
    defaultStoreys: 1,
    fill: '#eab308',
    cornerRadius: 0,
  },
  {
    templateId: 'restaurant',
    label: 'Restaurant / Bar',
    category: 'amenity',
    defaultWidth: 15,
    defaultHeight: 10,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.amenity,
    cornerRadius: 0,
  },
  {
    templateId: 'recording-studio',
    label: 'Recording Studio',
    category: 'service',
    defaultWidth: 8,
    defaultHeight: 6,
    defaultStoreys: 1,
    fill: '#8b5cf6',
    cornerRadius: 0,
  },
  {
    templateId: 'podcast-studio',
    label: 'Podcast Studio',
    category: 'service',
    defaultWidth: 5,
    defaultHeight: 4,
    defaultStoreys: 1,
    fill: '#a78bfa',
    cornerRadius: 0,
  },
  {
    templateId: 'business-center',
    label: 'Business Center',
    category: 'service',
    defaultWidth: 12,
    defaultHeight: 8,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.service,
    cornerRadius: 0,
  },
  {
    templateId: 'gym',
    label: 'Gym',
    category: 'amenity',
    defaultWidth: 10,
    defaultHeight: 8,
    defaultStoreys: 1,
    fill: '#ec4899',
    cornerRadius: 0,
  },
  {
    templateId: 'sim-racing',
    label: 'Sim Racing Room',
    category: 'amenity',
    defaultWidth: 10,
    defaultHeight: 5,
    defaultStoreys: 1,
    fill: '#a78bfa',
    cornerRadius: 0,
  },
  {
    templateId: 'grab-and-go',
    label: 'Grab & Go Market',
    category: 'service',
    defaultWidth: 6,
    defaultHeight: 5,
    defaultStoreys: 1,
    fill: '#a3e635',
    cornerRadius: 0,
  },
  {
    templateId: 'komyuniti-lounge',
    label: 'Komyuniti Lounge',
    category: 'amenity',
    defaultWidth: 8,
    defaultHeight: 5,
    defaultStoreys: 1,
    fill: '#38bdf8',
    cornerRadius: 0,
  },
]

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function snap(val: number, grid: number): number {
  return Math.round(val / grid) * grid
}

function polygonArea(pts: { x: number; y: number }[]): number {
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    area += pts[i].x * pts[j].y
    area -= pts[j].x * pts[i].y
  }
  return Math.abs(area) / 2
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

/** Get bounding box corners for a possibly-rotated rectangle. */
function getRotatedCorners(comp: PlacedComponent): { x: number; y: number }[] {
  const cx = comp.x + comp.width / 2
  const cy = comp.y + comp.height / 2
  const hw = comp.width / 2
  const hh = comp.height / 2
  const rad = (comp.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const offsets = [
    { dx: -hw, dy: -hh },
    { dx: hw, dy: -hh },
    { dx: hw, dy: hh },
    { dx: -hw, dy: hh },
  ]

  return offsets.map(({ dx, dy }) => ({
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  }))
}

/** Minimum distance from a component to a polygon boundary. */
function componentToPolygonMinDist(
  comp: PlacedComponent,
  poly: { x: number; y: number }[],
): number {
  const corners = getRotatedCorners(comp)
  let minDist = Infinity

  for (const corner of corners) {
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length
      const d = pointToSegmentDist(corner, poly[i], poly[j])
      if (d < minDist) minDist = d
    }
  }

  // Also check polygon vertices to rect edges
  for (const v of poly) {
    for (let i = 0; i < corners.length; i++) {
      const j = (i + 1) % corners.length
      const d = pointToSegmentDist(v, corners[i], corners[j])
      if (d < minDist) minDist = d
    }
  }

  return minDist
}

/** Approximate min distance between two components (using bounding corners). */
function componentSeparation(a: PlacedComponent, b: PlacedComponent): number {
  const cornersA = getRotatedCorners(a)
  const cornersB = getRotatedCorners(b)
  let minDist = Infinity

  for (const ca of cornersA) {
    for (const cb of cornersB) {
      const d = Math.hypot(ca.x - cb.x, ca.y - cb.y)
      if (d < minDist) minDist = d
    }
  }

  // Edge-to-edge checks
  for (const ca of cornersA) {
    for (let i = 0; i < cornersB.length; i++) {
      const j = (i + 1) % cornersB.length
      const d = pointToSegmentDist(ca, cornersB[i], cornersB[j])
      if (d < minDist) minDist = d
    }
  }
  for (const cb of cornersB) {
    for (let i = 0; i < cornersA.length; i++) {
      const j = (i + 1) % cornersA.length
      const d = pointToSegmentDist(cb, cornersA[i], cornersA[j])
      if (d < minDist) minDist = d
    }
  }

  return minDist
}

/* ------------------------------------------------------------------ */
/*  Compliance engine                                                   */
/* ------------------------------------------------------------------ */

function runCompliance(components: PlacedComponent[]): ComplianceCheck[] {
  const buildings = components.filter(
    (c) => c.category === 'residential' || c.category === 'amenity' || c.category === 'service',
  )

  // 1. Site coverage
  const totalFootprint = buildings.reduce((s, b) => s + b.width * b.height, 0)
  const coveragePct = totalFootprint / SITE.buildableArea
  const coverageOk = coveragePct <= SITE.maxCoverage

  // 2. Boundary setback
  const setback = PLANNING_REGS.sideSetback
  let worstSetback = Infinity
  for (const b of buildings) {
    const d = componentToPolygonMinDist(b, OFFSET_BOUNDARY)
    if (d < worstSetback) worstSetback = d
  }
  const setbackOk = buildings.length === 0 || worstSetback >= setback

  // 3. Building separation
  let worstSep = Infinity
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const d = componentSeparation(buildings[i], buildings[j])
      if (d < worstSep) worstSep = d
    }
  }
  const separationOk = buildings.length < 2 || worstSep >= 6

  // 4. Max height
  const tallest = buildings.reduce(
    (max, b) => Math.max(max, b.storeys * 3.2),
    0,
  )
  const heightOk = tallest <= PLANNING_REGS.maxHeight

  // 5. Total GFA
  const totalGfa = buildings.reduce((s, b) => s + b.width * b.height * b.storeys, 0)

  // 6. Est keys (residential only, ~25m2/key)
  const residentials = components.filter((c) => c.category === 'residential')
  const totalResGfa = residentials.reduce((s, b) => s + b.width * b.height * b.storeys, 0)
  const estKeys = Math.floor(totalResGfa / 25)

  return [
    {
      label: 'Site Coverage',
      ok: coverageOk,
      detail: `${(coveragePct * 100).toFixed(1)}% / 50%`,
      value: coveragePct,
    },
    {
      label: 'Boundary Setback',
      ok: setbackOk,
      detail: buildings.length === 0
        ? 'N/A'
        : `${worstSetback === Infinity ? '--' : worstSetback.toFixed(1)}m / ${setback}m min`,
    },
    {
      label: 'Building Separation',
      ok: separationOk,
      detail: buildings.length < 2
        ? 'N/A'
        : `${worstSep === Infinity ? '--' : worstSep.toFixed(1)}m / 6m min`,
    },
    {
      label: 'Max Height',
      ok: heightOk,
      detail: `${tallest.toFixed(1)}m / ${PLANNING_REGS.maxHeight}m`,
      value: tallest,
    },
    {
      label: 'Total GFA',
      ok: true,
      detail: `${totalGfa.toLocaleString()} m\u00B2`,
      value: totalGfa,
    },
    {
      label: 'Est. Keys',
      ok: true,
      detail: `${estKeys}`,
      value: estKeys,
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Polygon flattener for Konva <Line> points                          */
/* ------------------------------------------------------------------ */

function flattenPoly(pts: { x: number; y: number }[]): number[] {
  return pts.flatMap((p) => [p.x * SCALE, p.y * SCALE])
}

/* ------------------------------------------------------------------ */
/*  Unique ID                                                          */
/* ------------------------------------------------------------------ */

let _idCounter = 0
function uid(): string {
  _idCounter += 1
  return `comp-${Date.now()}-${_idCounter}`
}

/* ------------------------------------------------------------------ */
/*  Canvas origin & dimensions                                         */
/* ------------------------------------------------------------------ */

const allX = [...ORIGINAL_BOUNDARY, ...OFFSET_BOUNDARY].map((p) => p.x)
const allY = [...ORIGINAL_BOUNDARY, ...OFFSET_BOUNDARY].map((p) => p.y)
const PAD = 20 // metres padding
const WORLD_MIN_X = Math.min(...allX) - PAD
const WORLD_MIN_Y = Math.min(...allY) - PAD
const WORLD_MAX_X = Math.max(...allX) + PAD
const WORLD_MAX_Y = Math.max(...allY) + PAD
const CANVAS_W = (WORLD_MAX_X - WORLD_MIN_X) * SCALE
const CANVAS_H = (WORLD_MAX_Y - WORLD_MIN_Y) * SCALE

/** Convert world metres to canvas pixels. */
function toCanvas(wx: number, wy: number): { cx: number; cy: number } {
  return {
    cx: (wx - WORLD_MIN_X) * SCALE,
    cy: (wy - WORLD_MIN_Y) * SCALE,
  }
}

/** Convert canvas pixels to world metres. */
function toWorld(cx: number, cy: number): { wx: number; wy: number } {
  return {
    wx: cx / SCALE + WORLD_MIN_X,
    wy: cy / SCALE + WORLD_MIN_Y,
  }
}

/* ------------------------------------------------------------------ */
/*  Context menu                                                        */
/* ------------------------------------------------------------------ */

interface ContextMenuState {
  x: number
  y: number
  componentId: string
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function InteractivePlanner({
  isOpen,
  onClose,
  selectedOption,
}: InteractivePlannerProps) {
  // ---- state ----
  const [components, setComponents] = useState<PlacedComponent[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored) as PlacedComponent[]
    } catch {
      // ignore
    }
    return []
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 })

  const containerRef = useRef<HTMLDivElement>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const shapeRefs = useRef<Map<string, Konva.Rect>>(new Map())
  const stageRef = useRef<Konva.Stage>(null)

  // ---- compliance ----
  const compliance = useMemo(() => runCompliance(components), [components])

  // ---- auto-place from selectedOption ----
  const prevOptionRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedOption) return
    if (prevOptionRef.current === selectedOption.id) return
    prevOptionRef.current = selectedOption.id

    // Place residential blocks from the option's wings
    const newComps: PlacedComponent[] = []
    for (const wing of selectedOption.wings) {
      newComps.push({
        id: uid(),
        templateId: 'residential-block',
        label: wing.label || 'Residential',
        category: 'residential',
        x: wing.x + SITE.buildableMinX,
        y: wing.y + SITE.buildableMinY,
        width: wing.direction === 'EW' ? wing.length : wing.width,
        height: wing.direction === 'EW' ? wing.width : wing.length,
        rotation: 0,
        storeys: wing.floors,
        fill: CATEGORY_COLORS.residential,
        cornerRadius: 0,
      })
    }
    if (newComps.length > 0) {
      setComponents((prev) => {
        const filtered = prev.filter((c) => c.templateId !== 'residential-block')
        return [...filtered, ...newComps]
      })
    }
  }, [selectedOption])

  // ---- resize observer ----
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ---- transformer update ----
  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (!selectedId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    const node = shapeRefs.current.get(selectedId)
    if (node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId])

  // ---- keyboard shortcuts ----
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (editingId) return // don't intercept while editing label
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        setComponents((prev) => prev.filter((c) => c.id !== selectedId))
        setSelectedId(null)
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setContextMenu(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, selectedId, editingId])

  // ---- save to localStorage on change ----
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components))
    }
  }, [components])

  // ---- close context menu on click outside ----
  useEffect(() => {
    if (!contextMenu) return
    function handleClick() {
      setContextMenu(null)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [contextMenu])

  // ---- handlers ----
  const addComponent = useCallback((template: ComponentTemplate) => {
    const newComp: PlacedComponent = {
      id: uid(),
      templateId: template.templateId,
      label: template.label,
      category: template.category,
      x: SITE.centroidX - template.defaultWidth / 2,
      y: SITE.centroidY - template.defaultHeight / 2,
      width: template.defaultWidth,
      height: template.defaultHeight,
      rotation: 0,
      storeys: template.defaultStoreys,
      fill: template.fill,
      cornerRadius: template.cornerRadius,
    }
    setComponents((prev) => [...prev, newComp])
    setSelectedId(newComp.id)
    setContextMenu(null)
  }, [])

  const handleDragEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const { wx, wy } = toWorld(node.x(), node.y())
      const snappedX = snap(wx, GRID_SNAP)
      const snappedY = snap(wy, GRID_SNAP)
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, x: snappedX, y: snappedY } : c)),
      )
      // Re-position node to snapped position
      const { cx, cy } = toCanvas(snappedX, snappedY)
      node.position({ x: cx, y: cy })
    },
    [],
  )

  const handleTransformEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      const rotation = node.rotation()
      const { wx, wy } = toWorld(node.x(), node.y())

      setComponents((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const newW = snap(Math.max(1, c.width * scaleX), GRID_SNAP)
          const newH = snap(Math.max(1, c.height * scaleY), GRID_SNAP)
          return { ...c, x: snap(wx, GRID_SNAP), y: snap(wy, GRID_SNAP), width: newW, height: newH, rotation }
        }),
      )
      node.scaleX(1)
      node.scaleY(1)
    },
    [],
  )

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>, id: string) => {
      e.evt.preventDefault()
      e.evt.stopPropagation()
      setSelectedId(id)
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return
      setContextMenu({ x: pos.x, y: pos.y, componentId: id })
    },
    [],
  )

  const duplicateComponent = useCallback(
    (id: string) => {
      const comp = components.find((c) => c.id === id)
      if (!comp) return
      const newComp: PlacedComponent = {
        ...comp,
        id: uid(),
        x: comp.x + 3,
        y: comp.y + 3,
      }
      setComponents((prev) => [...prev, newComp])
      setSelectedId(newComp.id)
      setContextMenu(null)
    },
    [components],
  )

  const rotate90 = useCallback(
    (id: string) => {
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c)),
      )
      setContextMenu(null)
    },
    [],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((c) => c.id !== id))
      if (selectedId === id) setSelectedId(null)
      setContextMenu(null)
    },
    [selectedId],
  )

  const handleDblClick = useCallback(
    (id: string) => {
      const comp = components.find((c) => c.id === id)
      if (!comp) return
      setEditingId(id)
      setEditLabel(comp.label)
    },
    [components],
  )

  const commitLabelEdit = useCallback(() => {
    if (!editingId) return
    const trimmed = editLabel.trim()
    if (trimmed.length > 0 && trimmed.length <= 40) {
      setComponents((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, label: trimmed } : c)),
      )
    }
    setEditingId(null)
    setEditLabel('')
  }, [editingId, editLabel])

  const clearAll = useCallback(() => {
    setComponents([])
    setSelectedId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components))
  }, [components])

  // ---- render grid lines ----
  const gridLines = useMemo(() => {
    const lines: { points: number[]; isMain: boolean }[] = []
    const startX = Math.floor(WORLD_MIN_X / GRID_SIZE) * GRID_SIZE
    const startY = Math.floor(WORLD_MIN_Y / GRID_SIZE) * GRID_SIZE

    for (let x = startX; x <= WORLD_MAX_X; x += GRID_SIZE) {
      const { cx: x1, cy: y1 } = toCanvas(x, WORLD_MIN_Y)
      const { cx: x2, cy: y2 } = toCanvas(x, WORLD_MAX_Y)
      lines.push({ points: [x1, y1, x2, y2], isMain: x % 10 === 0 })
    }
    for (let y = startY; y <= WORLD_MAX_Y; y += GRID_SIZE) {
      const { cx: x1, cy: y1 } = toCanvas(WORLD_MIN_X, y)
      const { cx: x2, cy: y2 } = toCanvas(WORLD_MAX_X, y)
      lines.push({ points: [x1, y1, x2, y2], isMain: y % 10 === 0 })
    }
    return lines
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950">
      {/* ─── Left Sidebar: Component Palette ─── */}
      <div className="flex w-56 flex-col border-r border-white/10 bg-slate-900/90 backdrop-blur-sm">
        <div className="border-b border-white/10 px-3 py-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Components
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {COMPONENT_TEMPLATES.map((t) => (
            <button
              key={t.templateId}
              onClick={() => addComponent(t)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span
                className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: t.fill, opacity: 0.8 }}
              />
              <span className="flex-1">{t.label}</span>
              <Plus size={12} className="text-slate-500" />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="border-t border-white/10 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Legend
          </p>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                className="inline-block h-2 w-4 rounded-sm"
                style={{ backgroundColor: color, opacity: 0.7 }}
              />
              <span className="capitalize">{cat}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
            <span className="inline-block h-0 w-4 border-t border-dashed border-red-400" />
            Site Boundary
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="inline-block h-0 w-4 border-t border-blue-400" />
            Buildable Zone
          </div>
        </div>
      </div>

      {/* ─── Main Canvas Area ─── */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-200">
            Interactive Site Planner
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400"
              title="Clear All"
            >
              <Trash2 size={12} />
              Clear All
            </button>
            <button
              onClick={() => {
                setComponents([])
                const stored = localStorage.getItem(STORAGE_KEY)
                if (stored) {
                  try {
                    setComponents(JSON.parse(stored))
                  } catch { /* ignore */ }
                }
              }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              title="Reload Saved"
            >
              <RotateCcw size={12} />
              Reload
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

        {/* Canvas */}
        <div ref={containerRef} className="relative flex-1 overflow-hidden">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            draggable
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null)
                setContextMenu(null)
              }
            }}
            onContextMenu={(e) => {
              e.evt.preventDefault()
            }}
            scaleX={stageSize.width / CANVAS_W}
            scaleY={stageSize.height / CANVAS_H}
          >
            <Layer>
              {/* Background */}
              <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#0f172a" />

              {/* Grid */}
              {gridLines.map((line, i) => (
                <Line
                  key={`grid-${i}`}
                  points={line.points}
                  stroke={line.isMain ? '#1e293b' : '#1e293b'}
                  strokeWidth={line.isMain ? 1.5 : 0.5}
                  opacity={line.isMain ? 0.7 : 0.3}
                  listening={false}
                />
              ))}

              {/* Original Boundary — red dashed */}
              <Line
                points={flattenPoly(ORIGINAL_BOUNDARY)}
                closed
                stroke="#ef4444"
                strokeWidth={2}
                dash={[8, 6]}
                listening={false}
              />

              {/* Offset Boundary — blue solid */}
              <Line
                points={flattenPoly(OFFSET_BOUNDARY)}
                closed
                stroke="#3b82f6"
                strokeWidth={2}
                fill="rgba(59,130,246,0.04)"
                listening={false}
              />

              {/* Scale bar */}
              {(() => {
                const { cx: sx, cy: sy } = toCanvas(WORLD_MIN_X + 5, WORLD_MAX_Y - 3)
                const barLen = 20 * SCALE
                return (
                  <Group listening={false}>
                    <Line points={[sx, sy, sx + barLen, sy]} stroke="#e2e8f0" strokeWidth={2} />
                    <Line points={[sx, sy - 4, sx, sy + 4]} stroke="#e2e8f0" strokeWidth={2} />
                    <Line points={[sx + barLen, sy - 4, sx + barLen, sy + 4]} stroke="#e2e8f0" strokeWidth={2} />
                    <Text x={sx + barLen / 2 - 10} y={sy - 16} text="20m" fill="#e2e8f0" fontSize={11} />
                  </Group>
                )
              })()}

              {/* North arrow */}
              {(() => {
                const { cx: nx, cy: ny } = toCanvas(WORLD_MAX_X - 6, WORLD_MIN_Y + 6)
                return (
                  <Group listening={false}>
                    <Line points={[nx, ny + 20, nx, ny - 20]} stroke="#e2e8f0" strokeWidth={2} />
                    <Line points={[nx - 6, ny - 12, nx, ny - 22, nx + 6, ny - 12]} closed fill="#e2e8f0" />
                    <Text x={nx - 4} y={ny - 38} text="N" fill="#e2e8f0" fontSize={14} fontStyle="bold" />
                  </Group>
                )
              })()}

              {/* Labels */}
              {(() => {
                const { cx, cy } = toCanvas(SITE.centroidX, WORLD_MIN_Y + 2)
                return <Text x={cx - 30} y={cy} text="Bay Street" fill="#94a3b8" fontSize={12} listening={false} />
              })()}

              {/* Placed components */}
              {components.map((comp) => {
                const { cx, cy } = toCanvas(comp.x, comp.y)
                const pw = comp.width * SCALE
                const ph = comp.height * SCALE
                const isSelected = comp.id === selectedId
                return (
                  <Group key={comp.id}>
                    <Rect
                      ref={(node) => {
                        if (node) {
                          shapeRefs.current.set(comp.id, node)
                        } else {
                          shapeRefs.current.delete(comp.id)
                        }
                      }}
                      x={cx}
                      y={cy}
                      width={pw}
                      height={ph}
                      rotation={comp.rotation}
                      fill={comp.fill}
                      opacity={0.65}
                      stroke={isSelected ? '#60a5fa' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 1}
                      cornerRadius={comp.cornerRadius}
                      draggable
                      onClick={() => {
                        setSelectedId(comp.id)
                        setContextMenu(null)
                      }}
                      onDblClick={() => handleDblClick(comp.id)}
                      onContextMenu={(e) => handleContextMenu(e, comp.id)}
                      onDragEnd={(e) => handleDragEnd(comp.id, e.target)}
                      onTransformEnd={(e) => handleTransformEnd(comp.id, e.target)}
                    />
                    {/* Label text */}
                    <Text
                      x={cx + (comp.rotation === 0 ? pw / 2 : 0)}
                      y={cy + (comp.rotation === 0 ? ph / 2 - 8 : 0)}
                      offsetX={comp.rotation === 0 ? 0 : 0}
                      text={comp.label}
                      fill="#ffffff"
                      fontSize={pw > 60 ? 11 : 9}
                      fontStyle="bold"
                      align="center"
                      width={pw}
                      listening={false}
                      rotation={comp.rotation}
                    />
                    {/* Dimension text */}
                    <Text
                      x={cx + (comp.rotation === 0 ? pw / 2 : 0)}
                      y={cy + (comp.rotation === 0 ? ph / 2 + 4 : 16)}
                      text={`${comp.width}m x ${comp.height}m${comp.storeys > 1 ? ` | ${comp.storeys}F` : ''}`}
                      fill="rgba(255,255,255,0.6)"
                      fontSize={8}
                      align="center"
                      width={pw}
                      listening={false}
                      rotation={comp.rotation}
                    />
                  </Group>
                )
              })}

              {/* Transformer */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(_oldBox, newBox) => {
                  const minSize = SCALE * 1
                  if (newBox.width < minSize || newBox.height < minSize) {
                    return _oldBox
                  }
                  return newBox
                }}
                rotateEnabled
                enabledAnchors={[
                  'top-left',
                  'top-right',
                  'bottom-left',
                  'bottom-right',
                  'middle-left',
                  'middle-right',
                  'top-center',
                  'bottom-center',
                ]}
                anchorStroke="#60a5fa"
                anchorFill="#1e293b"
                anchorSize={8}
                borderStroke="#60a5fa"
                borderDash={[4, 3]}
              />
            </Layer>
          </Stage>

          {/* Context menu (HTML overlay) */}
          {contextMenu && (
            <div
              className="absolute z-50 w-40 rounded-lg border border-white/10 bg-slate-800 py-1 shadow-2xl"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                onClick={() => duplicateComponent(contextMenu.componentId)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                <Copy size={12} /> Duplicate
              </button>
              <button
                onClick={() => rotate90(contextMenu.componentId)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                <RotateCw size={12} /> Rotate 90 deg
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => deleteComponent(contextMenu.componentId)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-slate-700"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}

          {/* Label edit overlay */}
          {editingId && (() => {
            const comp = components.find((c) => c.id === editingId)
            if (!comp) return null
            const { cx, cy } = toCanvas(comp.x, comp.y)
            const scaleFactorX = stageSize.width / CANVAS_W
            const scaleFactorY = stageSize.height / CANVAS_H
            return (
              <div
                className="absolute z-50"
                style={{
                  left: cx * scaleFactorX,
                  top: cy * scaleFactorY - 30,
                }}
              >
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value.slice(0, 40))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitLabelEdit()
                    if (e.key === 'Escape') { setEditingId(null); setEditLabel('') }
                  }}
                  onBlur={commitLabelEdit}
                  className="rounded border border-blue-400 bg-slate-800 px-2 py-0.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ minWidth: 100 }}
                />
              </div>
            )
          })()}

          {/* ─── Compliance Panel (floating top-right) ─── */}
          <div className="absolute right-3 top-3 w-64 rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Compliance
            </h3>
            <div className="space-y-2">
              {compliance.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    {c.ok ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : (
                      <XCircle size={12} className="text-red-400" />
                    )}
                    <span className="text-slate-300">{c.label}</span>
                  </span>
                  <span className={c.ok ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                    {c.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Selected info */}
            {selectedId && (() => {
              const sel = components.find((c) => c.id === selectedId)
              if (!sel) return null
              return (
                <div className="mt-3 border-t border-white/10 pt-2">
                  <p className="text-[10px] text-slate-500">
                    Selected: <span className="text-slate-300 font-medium">{sel.label}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pos: ({sel.x.toFixed(1)}, {sel.y.toFixed(1)}) | {sel.width}m x {sel.height}m
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Rot: {sel.rotation} deg | Storeys: {sel.storeys}
                  </p>
                  <div className="mt-1.5 flex gap-1">
                    <button
                      onClick={() => {
                        const tmpl = COMPONENT_TEMPLATES.find((t) => t.templateId === sel.templateId)
                        if (tmpl?.maxStoreys && sel.storeys < tmpl.maxStoreys) {
                          setComponents((prev) =>
                            prev.map((c) => c.id === sel.id ? { ...c, storeys: c.storeys + 1 } : c),
                          )
                        }
                      }}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-300 hover:bg-slate-600"
                    >
                      +Floor
                    </button>
                    <button
                      onClick={() => {
                        const tmpl = COMPONENT_TEMPLATES.find((t) => t.templateId === sel.templateId)
                        const min = tmpl?.minStoreys ?? 1
                        if (sel.storeys > min) {
                          setComponents((prev) =>
                            prev.map((c) => c.id === sel.id ? { ...c, storeys: c.storeys - 1 } : c),
                          )
                        }
                      }}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-300 hover:bg-slate-600"
                    >
                      -Floor
                    </button>
                    <button
                      onClick={() => deleteComponent(sel.id)}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-red-400 hover:bg-slate-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Warnings */}
            {compliance.some((c) => !c.ok) && (
              <div className="mt-3 flex items-center gap-1.5 rounded bg-red-500/10 px-2 py-1.5 text-[10px] text-red-400">
                <AlertTriangle size={12} />
                Planning violations detected
              </div>
            )}
          </div>

          {/* Component count badge */}
          <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1.5 text-[10px] text-slate-400 backdrop-blur-sm">
            {components.length} component{components.length !== 1 ? 's' : ''} placed
          </div>
        </div>
      </div>
    </div>
  )
}
