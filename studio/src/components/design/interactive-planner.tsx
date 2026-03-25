'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Circle, Transformer } from 'react-konva'
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
  MousePointer2,
  DoorOpen,
  ParkingSquare,
  Route,
  TreePine,
  Square,
  Eye,
  EyeOff,
  Info,
  RefreshCcw,
} from 'lucide-react'
import {
  ORIGINAL_BOUNDARY,
  OFFSET_BOUNDARY,
  SITE,
  PLANNING_REGS,
} from '@/config/site'
import type { DesignOption } from '@/engine/types'
import { computeSiteLayout } from '@/engine/site-layout'
import type { PlacedElement, SiteLayout, SiteConfig } from '@/engine/site-layout'
import { saveLayoutOverrides, clearLayoutOverrides } from '@/store/layout-store'
import type { LayoutOverridePayload } from '@/store/layout-store'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ComponentCategory = 'residential' | 'amenity' | 'pool' | 'landscape' | 'service' | 'parking' | 'entrance' | 'path' | 'custom'

/** Unified canvas item — can originate from the engine or from user actions */
interface CanvasItem {
  id: string
  source: 'engine' | 'user'         // who placed it
  type: string                        // PlacedElement.type or custom types
  label: string
  category: ComponentCategory
  x: number          // world metres
  y: number
  width: number      // metres (EW)
  height: number     // metres (NS)
  rotation: number   // degrees
  storeys: number
  fill: string
  cornerRadius: number
  rationale: string  // engine rationale or ''
  floor: string      // 'ground' | 'roof' | number
  visible: boolean   // can be toggled off in sidebar
  /** For polyline paths drawn by user */
  pathPoints?: { x: number; y: number }[]
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

type DrawingTool = 'select' | 'entrance' | 'parking' | 'path' | 'landscape' | 'custom_zone'

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
const OVERRIDE_STORAGE_KEY = 'yotel-planner-overrides'
const PARKING_W = 2.5 // metres per bay
const PARKING_D = 5   // metres per bay

const CATEGORY_COLORS: Record<ComponentCategory, string> = {
  residential: '#0d9488',
  amenity: '#d4a574',
  pool: '#3b82f6',
  landscape: '#22c55e',
  service: '#64748b',
  parking: '#a78bfa',
  entrance: '#f59e0b',
  path: '#94a3b8',
  custom: '#ec4899',
}

const TYPE_TO_CATEGORY: Record<string, ComponentCategory> = {
  entrance: 'entrance',
  parking: 'parking',
  amenity_block: 'amenity',
  pool: 'pool',
  pool_deck: 'pool',
  cabana: 'landscape',
  lounger_zone: 'landscape',
  swim_up_bar: 'amenity',
  landscape: 'landscape',
  tree: 'landscape',
  path: 'path',
  service_yard: 'service',
}

const TYPE_TO_FILL: Record<string, string> = {
  entrance: '#f59e0b',
  parking: '#a78bfa',
  amenity_block: '#d4a574',
  pool: '#3b82f6',
  pool_deck: '#60a5fa',
  cabana: '#22c55e',
  lounger_zone: '#eab308',
  swim_up_bar: '#f97316',
  landscape: '#22c55e',
  tree: '#16a34a',
  path: '#94a3b8',
  service_yard: '#64748b',
}

const TYPE_TO_CORNER_RADIUS: Record<string, number> = {
  pool: 12,
  pool_deck: 4,
  cabana: 2,
  swim_up_bar: 4,
  tree: 20,
}

/** Custom templates the user can add from the palette */
const CUSTOM_TEMPLATES: ComponentTemplate[] = [
  {
    templateId: 'extra-parking-bay',
    label: 'Parking Bay',
    category: 'parking',
    defaultWidth: PARKING_W,
    defaultHeight: PARKING_D,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.parking,
    cornerRadius: 0,
  },
  {
    templateId: 'extra-cabana',
    label: 'Extra Cabana',
    category: 'landscape',
    defaultWidth: 3,
    defaultHeight: 4,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.landscape,
    cornerRadius: 2,
  },
  {
    templateId: 'planter',
    label: 'Planter',
    category: 'landscape',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultStoreys: 1,
    fill: '#22c55e',
    cornerRadius: 4,
  },
  {
    templateId: 'bench',
    label: 'Bench',
    category: 'landscape',
    defaultWidth: 2,
    defaultHeight: 0.5,
    defaultStoreys: 1,
    fill: '#92400e',
    cornerRadius: 0,
  },
  {
    templateId: 'signage',
    label: 'Signage',
    category: 'service',
    defaultWidth: 1,
    defaultHeight: 1,
    defaultStoreys: 1,
    fill: '#facc15',
    cornerRadius: 0,
  },
  {
    templateId: 'custom-rect',
    label: 'Custom Rectangle',
    category: 'custom',
    defaultWidth: 5,
    defaultHeight: 5,
    defaultStoreys: 1,
    fill: CATEGORY_COLORS.custom,
    cornerRadius: 0,
  },
]

const DRAWING_TOOLS: { tool: DrawingTool; label: string; icon: typeof MousePointer2 }[] = [
  { tool: 'select', label: 'Select', icon: MousePointer2 },
  { tool: 'entrance', label: 'Entrance Marker', icon: DoorOpen },
  { tool: 'parking', label: 'Parking Bay', icon: ParkingSquare },
  { tool: 'path', label: 'Path Tool', icon: Route },
  { tool: 'landscape', label: 'Zone Tool', icon: TreePine },
  { tool: 'custom_zone', label: 'Custom Zone', icon: Square },
]

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function snap(val: number, grid: number): number {
  return Math.round(val / grid) * grid
}

function pointInPolygon(px: number, py: number, poly: { x: number; y: number }[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
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
  const ppx = a.x + t * dx
  const ppy = a.y + t * dy
  return Math.hypot(p.x - ppx, p.y - ppy)
}

/** Get bounding box corners for a possibly-rotated rectangle. */
function getRotatedCorners(comp: { x: number; y: number; width: number; height: number; rotation: number }): { x: number; y: number }[] {
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

function componentToPolygonMinDist(
  comp: { x: number; y: number; width: number; height: number; rotation: number },
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

  for (const v of poly) {
    for (let i = 0; i < corners.length; i++) {
      const j = (i + 1) % corners.length
      const d = pointToSegmentDist(v, corners[i], corners[j])
      if (d < minDist) minDist = d
    }
  }

  return minDist
}

function componentSeparation(
  a: { x: number; y: number; width: number; height: number; rotation: number },
  b: { x: number; y: number; width: number; height: number; rotation: number },
): number {
  const cornersA = getRotatedCorners(a)
  const cornersB = getRotatedCorners(b)
  let minDist = Infinity

  for (const ca of cornersA) {
    for (const cb of cornersB) {
      const d = Math.hypot(ca.x - cb.x, ca.y - cb.y)
      if (d < minDist) minDist = d
    }
  }

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
/*  Compliance engine (local + engine hybrid)                          */
/* ------------------------------------------------------------------ */

function runLocalCompliance(items: CanvasItem[]): ComplianceCheck[] {
  const buildings = items.filter(
    (c) => c.visible && (c.category === 'residential' || c.category === 'amenity' || c.category === 'service'),
  )

  const totalFootprint = buildings.reduce((s, b) => s + b.width * b.height, 0)
  const coveragePct = totalFootprint / SITE.buildableArea
  const coverageOk = coveragePct <= SITE.maxCoverage

  const setback = PLANNING_REGS.sideSetback
  let worstSetback = Infinity
  for (const b of buildings) {
    const d = componentToPolygonMinDist(b, OFFSET_BOUNDARY)
    if (d < worstSetback) worstSetback = d
  }
  const setbackOk = buildings.length === 0 || worstSetback >= setback

  let worstSep = Infinity
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const d = componentSeparation(buildings[i], buildings[j])
      if (d < worstSep) worstSep = d
    }
  }
  const separationOk = buildings.length < 2 || worstSep >= 6

  const tallest = buildings.reduce(
    (max, b) => Math.max(max, b.storeys * 3.2),
    0,
  )
  const heightOk = tallest <= PLANNING_REGS.maxHeight

  const totalGfa = buildings.reduce((s, b) => s + b.width * b.height * b.storeys, 0)

  const residentials = items.filter((c) => c.visible && c.category === 'residential')
  const totalResGfa = residentials.reduce((s, b) => s + b.width * b.height * b.storeys, 0)
  const estKeys = Math.floor(totalResGfa / 25)

  // Landscape check
  const landscapeItems = items.filter((c) => c.visible && (c.type === 'landscape' || c.type === 'tree'))
  const landscapeArea = landscapeItems.reduce((s, e) => s + e.width * e.height, 0)
  const landscapePct = landscapeArea / SITE.grossArea
  const landscapeOk = landscapePct >= 0.15

  // Parking check — count parking bays
  const parkingItems = items.filter((c) => c.visible && c.category === 'parking')
  const totalParkingBays = parkingItems.reduce((s, p) => {
    return s + Math.max(1, Math.floor((p.width * p.height) / (PARKING_W * PARKING_D)))
  }, 0)

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
      label: 'Landscape',
      ok: landscapeOk,
      detail: `${(landscapePct * 100).toFixed(1)}% / 15% min`,
      value: landscapePct,
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
    {
      label: 'Parking Bays',
      ok: true,
      detail: `${totalParkingBays}`,
      value: totalParkingBays,
    },
  ]
}

/** Merge engine compliance with local compliance */
function mergeCompliance(engineCompliance: SiteLayout['compliance'], localChecks: ComplianceCheck[]): ComplianceCheck[] {
  const merged: ComplianceCheck[] = []

  // Engine checks first
  for (const ec of engineCompliance) {
    merged.push({
      label: ec.rule.length > 35 ? ec.rule.slice(0, 32) + '...' : ec.rule,
      ok: ec.status === 'pass',
      detail: `${ec.value} / ${ec.limit}`,
    })
  }

  // Then local-only checks (skip if engine already covers them)
  const engineLabels = new Set(engineCompliance.map(e => e.rule.toLowerCase()))
  for (const lc of localChecks) {
    const isDuplicate = engineLabels.has(lc.label.toLowerCase())
    if (!isDuplicate) {
      merged.push(lc)
    }
  }

  return merged
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
/*  Engine helpers                                                      */
/* ------------------------------------------------------------------ */

function buildSiteConfig(): SiteConfig {
  return {
    grossArea: SITE.grossArea,
    buildableAreaSqm: SITE.buildableArea,
    maxCoverage: SITE.maxCoverage,
    maxHeight: SITE.maxHeight,
    buildableEW: SITE.buildableEW,
    buildableNS: SITE.buildableNS,
    buildableMinX: SITE.buildableMinX,
    buildableMaxX: SITE.buildableMaxX,
    buildableMinY: SITE.buildableMinY,
    buildableMaxY: SITE.buildableMaxY,
    beachSide: SITE.beachSide,
  }
}

/** Convert a PlacedElement from the engine into a CanvasItem */
function engineElementToCanvasItem(el: PlacedElement): CanvasItem {
  // Engine coords: x,y from buildable origin. Convert to world.
  const worldX = el.x + SITE.buildableMinX
  const worldY = el.y + SITE.buildableMinY

  const cat = TYPE_TO_CATEGORY[el.type] ?? 'custom'
  const fill = TYPE_TO_FILL[el.type] ?? '#94a3b8'
  const cornerRadius = TYPE_TO_CORNER_RADIUS[el.type] ?? 0

  return {
    id: `engine-${el.id}`,
    source: 'engine',
    type: el.type,
    label: el.label,
    category: cat,
    x: worldX,
    y: worldY,
    width: el.width,
    height: el.depth,
    rotation: el.rotation ?? 0,
    storeys: el.floor === 'roof' ? 1 : (el.height && el.height > 3 ? Math.ceil(el.height / 3.2) : 1),
    fill,
    cornerRadius,
    rationale: el.rationale,
    floor: typeof el.floor === 'number' ? String(el.floor) : el.floor,
    visible: true,
  }
}

/* ------------------------------------------------------------------ */
/*  Sync planner state -> layout store (for 3D viewer)                 */
/* ------------------------------------------------------------------ */

/**
 * Convert the current planner canvas state into a LayoutOverridePayload
 * and publish it through the shared layout store so the 3D viewer updates.
 *
 * Canvas items use WORLD coordinates (origin at site SW corner).
 * PlacedElement uses ENGINE coordinates (origin at buildable SW corner).
 * Conversion: engineX = worldX - SITE.buildableMinX, engineY = worldY - SITE.buildableMinY
 */
function publishToLayoutStore(
  currentItems: CanvasItem[],
  engineLayout: SiteLayout | null,
): void {
  // Collect the IDs of all engine elements the reasoning engine produced
  const engineIds = new Set(
    (engineLayout?.elements ?? []).map((el) => `engine-${el.id}`),
  )

  const modified: PlacedElement[] = []
  const added: PlacedElement[] = []
  const presentEngineIds = new Set<string>()

  for (const item of currentItems) {
    // Skip wing items — they are not part of the amenity layer
    if (item.id.startsWith('engine-wing-')) continue

    if (item.source === 'engine' && engineIds.has(item.id)) {
      // Engine item — check if its position/size was overridden
      const originalId = item.id.replace(/^engine-/, '')
      const original = engineLayout?.elements.find((el) => el.id === originalId)
      presentEngineIds.add(item.id)

      if (original) {
        const origWx = original.x + SITE.buildableMinX
        const origWy = original.y + SITE.buildableMinY
        const moved =
          Math.abs(item.x - origWx) > 0.01 ||
          Math.abs(item.y - origWy) > 0.01 ||
          Math.abs(item.width - original.width) > 0.01 ||
          Math.abs(item.height - original.depth) > 0.01 ||
          Math.abs((item.rotation ?? 0) - (original.rotation ?? 0)) > 0.01

        if (moved) {
          modified.push(canvasItemToPlacedElement(item))
        }
      }
    } else if (item.source === 'user') {
      // User-added element
      added.push(canvasItemToPlacedElement(item))
    }
  }

  // Removed = engine IDs not present in current items
  const removedIds: string[] = []
  for (const eid of engineIds) {
    if (!presentEngineIds.has(eid)) {
      removedIds.push(eid.replace(/^engine-/, ''))
    }
  }

  saveLayoutOverrides({ modified, added, removedIds })
}

/** Convert a CanvasItem back to a PlacedElement (engine coordinate system). */
function canvasItemToPlacedElement(item: CanvasItem): PlacedElement {
  return {
    id: item.id.replace(/^engine-/, ''),
    type: (item.type as PlacedElement['type']) || 'amenity_block',
    label: item.label,
    x: item.x - SITE.buildableMinX,
    y: item.y - SITE.buildableMinY,
    width: item.width,
    depth: item.height,
    height: item.storeys > 1 ? item.storeys * 3.2 : (item.type === 'tree' ? 8 : 0),
    rotation: item.rotation || undefined,
    floor: item.floor === 'roof' ? 'roof' : (item.floor === 'ground' ? 'ground' : Number(item.floor) || 'ground'),
    rationale: item.rationale || 'User-placed element',
  }
}

/* ------------------------------------------------------------------ */
/*  Position override storage                                          */
/* ------------------------------------------------------------------ */

interface PositionOverride {
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
}

function loadOverrides(): Record<string, PositionOverride> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(OVERRIDE_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, PositionOverride>
  } catch { /* ignore */ }
  return {}
}

function saveOverrides(overrides: Record<string, PositionOverride>): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(overrides))
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
/*  Tooltip state                                                       */
/* ------------------------------------------------------------------ */

interface TooltipState {
  x: number
  y: number
  text: string
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
  const [items, setItems] = useState<CanvasItem[]>([])
  const [engineLayout, setEngineLayout] = useState<SiteLayout | null>(null)
  const [overrides, setOverrides] = useState<Record<string, PositionOverride>>(() => loadOverrides())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [activeTool, setActiveTool] = useState<DrawingTool>('select')
  const [drawingPathPoints, setDrawingPathPoints] = useState<{ x: number; y: number }[]>([])
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 })
  const [showSaved, setShowSaved] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'engine' | 'custom' | 'tools'>('engine')

  const containerRef = useRef<HTMLDivElement>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const shapeRefs = useRef<Map<string, Konva.Rect>>(new Map())
  const stageRef = useRef<Konva.Stage>(null)

  // ---- compliance (hybrid: engine + local) ----
  const compliance = useMemo(() => {
    const localChecks = runLocalCompliance(items)
    if (engineLayout) {
      return mergeCompliance(engineLayout.compliance, localChecks)
    }
    return localChecks
  }, [items, engineLayout])

  // ---- publish changes to the shared layout store (drives 3D viewer) ----
  useEffect(() => {
    // Only publish when planner is open and has items
    if (!isOpen || items.length === 0) return
    publishToLayoutStore(items, engineLayout)
  }, [isOpen, items, engineLayout])

  // ---- run engine when selectedOption changes ----
  const prevOptionRef = useRef<string | null>(null)

  const runEngine = useCallback((option: DesignOption, applyOverrides: Record<string, PositionOverride>) => {
    const config = buildSiteConfig()
    const layout = computeSiteLayout(option, config)
    setEngineLayout(layout)

    // Convert engine elements to canvas items
    const engineItems = layout.elements.map(engineElementToCanvasItem)

    // Apply position overrides from localStorage
    const withOverrides = engineItems.map((item) => {
      const ovr = applyOverrides[item.id]
      if (ovr) {
        return {
          ...item,
          x: ovr.x,
          y: ovr.y,
          width: ovr.width ?? item.width,
          height: ovr.height ?? item.height,
          rotation: ovr.rotation ?? item.rotation,
        }
      }
      return item
    })

    // Also add the residential wings from the option directly
    const wingItems: CanvasItem[] = option.wings.map((wing, i) => ({
      id: `engine-wing-${wing.id || i}`,
      source: 'engine' as const,
      type: 'residential',
      label: wing.label || 'Residential Wing',
      category: 'residential' as ComponentCategory,
      x: wing.x + SITE.buildableMinX,
      y: wing.y + SITE.buildableMinY,
      width: wing.direction === 'EW' ? wing.length : wing.width,
      height: wing.direction === 'EW' ? wing.width : wing.length,
      rotation: 0,
      storeys: wing.floors,
      fill: CATEGORY_COLORS.residential,
      cornerRadius: 0,
      rationale: `${wing.label}: ${wing.direction} wing, ${wing.floors} floors`,
      floor: 'ground',
      visible: true,
    }))

    // Also apply overrides to wing items
    const wingsWithOverrides = wingItems.map((item) => {
      const ovr = applyOverrides[item.id]
      if (ovr) {
        return { ...item, x: ovr.x, y: ovr.y, width: ovr.width ?? item.width, height: ovr.height ?? item.height, rotation: ovr.rotation ?? item.rotation }
      }
      return item
    })

    setItems((prev) => {
      // Keep user-placed items, replace engine items
      const userItems = prev.filter((it) => it.source === 'user')
      return [...withOverrides, ...wingsWithOverrides, ...userItems]
    })
  }, [])

  useEffect(() => {
    if (!selectedOption) return
    if (prevOptionRef.current === selectedOption.id) return
    prevOptionRef.current = selectedOption.id
    runEngine(selectedOption, overrides)
  }, [selectedOption, overrides, runEngine])

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
      if (editingId) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        setItems((prev) => prev.filter((c) => c.id !== selectedId))
        setSelectedId(null)
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setContextMenu(null)
        if (activeTool !== 'select') {
          setActiveTool('select')
          setDrawingPathPoints([])
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, selectedId, editingId, activeTool])

  // ---- save user items to localStorage on change ----
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userItems = items.filter((it) => it.source === 'user')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userItems))
    }
  }, [items])

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
  const addCustomComponent = useCallback((template: ComponentTemplate) => {
    const newItem: CanvasItem = {
      id: uid(),
      source: 'user',
      type: template.templateId,
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
      rationale: '',
      floor: 'ground',
      visible: true,
    }
    setItems((prev) => [...prev, newItem])
    setSelectedId(newItem.id)
    setContextMenu(null)
    setActiveTool('select')
  }, [])

  /** Clamp position to within the OFFSET_BOUNDARY for non-parking items */
  const clampToBoundary = useCallback((wx: number, wy: number, w: number, h: number, isParking: boolean): { wx: number; wy: number } => {
    if (isParking) {
      // Parking: must be inside ORIGINAL but outside OFFSET (between red and blue)
      // Simple approach: just ensure it's inside ORIGINAL_BOUNDARY
      const inOriginal = pointInPolygon(wx + w / 2, wy + h / 2, ORIGINAL_BOUNDARY)
      if (!inOriginal) {
        // Push it back toward centroid
        return { wx: SITE.centroidX - w / 2, wy: SITE.centroidY - h / 2 }
      }
      return { wx, wy }
    }
    // Non-parking: must be inside OFFSET_BOUNDARY
    const centre = { x: wx + w / 2, y: wy + h / 2 }
    if (!pointInPolygon(centre.x, centre.y, OFFSET_BOUNDARY)) {
      // Nudge back — simplistic: clamp to buildable box
      const clampedX = Math.max(SITE.buildableMinX, Math.min(wx, SITE.buildableMaxX - w))
      const clampedY = Math.max(SITE.buildableMinY, Math.min(wy, SITE.buildableMaxY - h))
      return { wx: clampedX, wy: clampedY }
    }
    return { wx, wy }
  }, [])

  const handleDragEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const { wx, wy } = toWorld(node.x(), node.y())
      const item = items.find((c) => c.id === id)
      const isParking = item?.category === 'parking'
      const snappedX = snap(wx, GRID_SNAP)
      const snappedY = snap(wy, GRID_SNAP)
      const clamped = clampToBoundary(snappedX, snappedY, item?.width ?? 5, item?.height ?? 5, isParking ?? false)

      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, x: clamped.wx, y: clamped.wy } : c)),
      )

      // Save override if it's an engine item
      if (item?.source === 'engine') {
        setOverrides((prev) => {
          const next = { ...prev, [id]: { x: clamped.wx, y: clamped.wy, width: item.width, height: item.height, rotation: item.rotation } }
          saveOverrides(next)
          return next
        })
      }

      const { cx, cy } = toCanvas(clamped.wx, clamped.wy)
      node.position({ x: cx, y: cy })
    },
    [items, clampToBoundary],
  )

  const handleTransformEnd = useCallback(
    (id: string, node: Konva.Node) => {
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      const rotation = node.rotation()
      const { wx, wy } = toWorld(node.x(), node.y())

      setItems((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const newW = snap(Math.max(1, c.width * scaleX), GRID_SNAP)
          const newH = snap(Math.max(1, c.height * scaleY), GRID_SNAP)
          return { ...c, x: snap(wx, GRID_SNAP), y: snap(wy, GRID_SNAP), width: newW, height: newH, rotation }
        }),
      )
      node.scaleX(1)
      node.scaleY(1)

      // Save override if engine item
      const item = items.find((c) => c.id === id)
      if (item?.source === 'engine') {
        const newW = snap(Math.max(1, item.width * scaleX), GRID_SNAP)
        const newH = snap(Math.max(1, item.height * scaleY), GRID_SNAP)
        setOverrides((prev) => {
          const next = { ...prev, [id]: { x: snap(wx, GRID_SNAP), y: snap(wy, GRID_SNAP), width: newW, height: newH, rotation } }
          saveOverrides(next)
          return next
        })
      }
    },
    [items],
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

  /** Handle stage click for drawing tools */
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'select') {
        if (e.target === e.target.getStage()) {
          setSelectedId(null)
          setContextMenu(null)
        }
        return
      }

      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Convert stage pointer to world via the stage scale
      const sx = stageSize.width / CANVAS_W
      const sy = stageSize.height / CANVAS_H
      const { wx, wy } = toWorld(pointer.x / sx, pointer.y / sy)
      const snappedX = snap(wx, GRID_SNAP)
      const snappedY = snap(wy, GRID_SNAP)

      if (activeTool === 'entrance') {
        const newItem: CanvasItem = {
          id: uid(),
          source: 'user',
          type: 'entrance',
          label: 'Entrance',
          category: 'entrance',
          x: snappedX - 3,
          y: snappedY - 5,
          width: 6,
          height: 10,
          rotation: 0,
          storeys: 1,
          fill: CATEGORY_COLORS.entrance,
          cornerRadius: 2,
          rationale: '',
          floor: 'ground',
          visible: true,
        }
        setItems((prev) => [...prev, newItem])
        setActiveTool('select')
      }

      if (activeTool === 'parking') {
        const newItem: CanvasItem = {
          id: uid(),
          source: 'user',
          type: 'parking',
          label: `Parking Bay`,
          category: 'parking',
          x: snappedX - PARKING_W / 2,
          y: snappedY - PARKING_D / 2,
          width: PARKING_W,
          height: PARKING_D,
          rotation: 0,
          storeys: 1,
          fill: CATEGORY_COLORS.parking,
          cornerRadius: 0,
          rationale: '',
          floor: 'ground',
          visible: true,
        }
        setItems((prev) => [...prev, newItem])
        // Stay in parking tool for rapid placement
      }

      if (activeTool === 'path') {
        // Build polyline — double-click or press Enter to finish
        setDrawingPathPoints((prev) => [...prev, { x: snappedX, y: snappedY }])
      }

      if (activeTool === 'landscape') {
        const newItem: CanvasItem = {
          id: uid(),
          source: 'user',
          type: 'landscape',
          label: 'Landscape Zone',
          category: 'landscape',
          x: snappedX - 3,
          y: snappedY - 3,
          width: 6,
          height: 6,
          rotation: 0,
          storeys: 1,
          fill: CATEGORY_COLORS.landscape,
          cornerRadius: 4,
          rationale: '',
          floor: 'ground',
          visible: true,
        }
        setItems((prev) => [...prev, newItem])
        setActiveTool('select')
      }

      if (activeTool === 'custom_zone') {
        const newItem: CanvasItem = {
          id: uid(),
          source: 'user',
          type: 'custom_zone',
          label: 'Custom Zone',
          category: 'custom',
          x: snappedX - 4,
          y: snappedY - 4,
          width: 8,
          height: 8,
          rotation: 0,
          storeys: 1,
          fill: CATEGORY_COLORS.custom,
          cornerRadius: 0,
          rationale: '',
          floor: 'ground',
          visible: true,
        }
        setItems((prev) => [...prev, newItem])
        setActiveTool('select')
      }
    },
    [activeTool, stageSize],
  )

  /** Finish path drawing on double-click */
  const handleStageDblClick = useCallback(() => {
    if (activeTool === 'path' && drawingPathPoints.length >= 2) {
      const pathItem: CanvasItem = {
        id: uid(),
        source: 'user',
        type: 'path',
        label: 'Circulation Path',
        category: 'path',
        x: drawingPathPoints[0].x,
        y: drawingPathPoints[0].y,
        width: 2,
        height: 2,
        rotation: 0,
        storeys: 1,
        fill: CATEGORY_COLORS.path,
        cornerRadius: 0,
        rationale: '',
        floor: 'ground',
        visible: true,
        pathPoints: [...drawingPathPoints],
      }
      setItems((prev) => [...prev, pathItem])
      setDrawingPathPoints([])
      setActiveTool('select')
    }
  }, [activeTool, drawingPathPoints])

  const duplicateComponent = useCallback(
    (id: string) => {
      const comp = items.find((c) => c.id === id)
      if (!comp) return
      const newItem: CanvasItem = {
        ...comp,
        id: uid(),
        source: 'user',
        x: comp.x + 3,
        y: comp.y + 3,
        rationale: '',
      }
      setItems((prev) => [...prev, newItem])
      setSelectedId(newItem.id)
      setContextMenu(null)
    },
    [items],
  )

  const rotate90 = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c)),
      )
      setContextMenu(null)
    },
    [],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((c) => c.id !== id))
      if (selectedId === id) setSelectedId(null)
      setContextMenu(null)
      // Also remove override
      setOverrides((prev) => {
        const next = { ...prev }
        delete next[id]
        saveOverrides(next)
        return next
      })
    },
    [selectedId],
  )

  const toggleVisibility = useCallback((id: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, visible: !c.visible } : c))
  }, [])

  const handleDblClick = useCallback(
    (id: string) => {
      const comp = items.find((c) => c.id === id)
      if (!comp) return
      setEditingId(id)
      setEditLabel(comp.label)
    },
    [items],
  )

  const commitLabelEdit = useCallback(() => {
    if (!editingId) return
    const trimmed = editLabel.trim()
    if (trimmed.length > 0 && trimmed.length <= 60) {
      setItems((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, label: trimmed } : c)),
      )
    }
    setEditingId(null)
    setEditLabel('')
  }, [editingId, editLabel])

  /** Reset to engine layout — clears all user overrides and user items */
  const resetToEngine = useCallback(() => {
    setOverrides({})
    saveOverrides({})
    clearLayoutOverrides()
    setItems([])
    if (selectedOption) {
      prevOptionRef.current = null // force re-run
      // Trigger re-run on next render
      setTimeout(() => {
        runEngine(selectedOption, {})
      }, 0)
    }
    setSelectedId(null)
  }, [selectedOption, runEngine])

  const handleSave = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userItems = items.filter((it) => it.source === 'user')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userItems))
      saveOverrides(overrides)
    }
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [items, overrides])

  /** Handle hover for rationale tooltip */
  const handleMouseEnter = useCallback((item: CanvasItem, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!item.rationale) return
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    setTooltip({ x: pointer.x + 12, y: pointer.y - 8, text: item.rationale })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

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

  // ---- derived lists ----
  const engineItems = useMemo(() => items.filter((it) => it.source === 'engine'), [items])
  const userItems = useMemo(() => items.filter((it) => it.source === 'user'), [items])
  const visibleItems = useMemo(() => items.filter((it) => it.visible), [items])
  const parkingCount = useMemo(() => {
    return items.filter((it) => it.visible && it.category === 'parking').reduce((s, p) => {
      return s + Math.max(1, Math.floor((p.width * p.height) / (PARKING_W * PARKING_D)))
    }, 0)
  }, [items])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950">
      {/* ─── Left Sidebar ─── */}
      <div className="flex w-64 flex-col border-r border-white/10 bg-slate-900/90 backdrop-blur-sm">
        {/* Tab headers */}
        <div className="flex border-b border-white/10">
          {([['engine', 'From Engine'], ['custom', 'Custom'], ['tools', 'Draw']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSidebarTab(key)}
              className={`flex-1 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                sidebarTab === key
                  ? 'border-b-2 border-blue-400 text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* ── Engine Elements Tab ── */}
          {sidebarTab === 'engine' && (
            <>
              {engineItems.length === 0 ? (
                <p className="text-[10px] text-slate-500 p-2">
                  Select a design option to auto-populate elements from the reasoning engine.
                </p>
              ) : (
                engineItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    onClick={() => {
                      setSelectedId(item.id)
                      setActiveTool('select')
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleVisibility(item.id)
                      }}
                      className="flex-shrink-0"
                      title={item.visible ? 'Hide' : 'Show'}
                    >
                      {item.visible ? (
                        <Eye size={10} className="text-slate-400" />
                      ) : (
                        <EyeOff size={10} className="text-slate-600" />
                      )}
                    </button>
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.fill, opacity: item.visible ? 0.8 : 0.3 }}
                    />
                    <span className={`flex-1 truncate ${!item.visible ? 'line-through text-slate-600' : ''}`}>
                      {item.label}
                    </span>
                    {item.rationale && (
                      <span title={item.rationale}><Info size={9} className="text-slate-500 flex-shrink-0" /></span>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* ── Custom Elements Tab ── */}
          {sidebarTab === 'custom' && (
            <>
              <p className="text-[10px] text-slate-500 px-1 mb-1">Click to add to canvas</p>
              {CUSTOM_TEMPLATES.map((t) => (
                <button
                  key={t.templateId}
                  onClick={() => addCustomComponent(t)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: t.fill, opacity: 0.8 }}
                  />
                  <span className="flex-1">{t.label}</span>
                  <span className="text-[9px] text-slate-500">{t.defaultWidth}x{t.defaultHeight}m</span>
                  <Plus size={12} className="text-slate-500" />
                </button>
              ))}

              {/* User-placed items list */}
              {userItems.length > 0 && (
                <>
                  <div className="mt-3 border-t border-white/10 pt-2">
                    <p className="text-[10px] text-slate-500 px-1 mb-1">Placed by you ({userItems.length})</p>
                  </div>
                  {userItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] cursor-pointer transition-colors ${
                        selectedId === item.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                      onClick={() => {
                        setSelectedId(item.id)
                        setActiveTool('select')
                      }}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.fill, opacity: 0.8 }}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteComponent(item.id) }}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ── Drawing Tools Tab ── */}
          {sidebarTab === 'tools' && (
            <>
              <p className="text-[10px] text-slate-500 px-1 mb-1">Click a tool, then click on the canvas</p>
              {DRAWING_TOOLS.map(({ tool, label, icon: Icon }) => (
                <button
                  key={tool}
                  onClick={() => {
                    setActiveTool(tool)
                    if (tool !== 'path') setDrawingPathPoints([])
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-xs transition-colors ${
                    activeTool === tool
                      ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span className="flex-1">{label}</span>
                  {activeTool === tool && (
                    <span className="text-[8px] bg-blue-500/30 px-1.5 py-0.5 rounded-full">ACTIVE</span>
                  )}
                </button>
              ))}

              {activeTool === 'path' && drawingPathPoints.length > 0 && (
                <div className="mt-2 rounded bg-slate-800 p-2 text-[10px] text-slate-400">
                  <p>{drawingPathPoints.length} point{drawingPathPoints.length !== 1 ? 's' : ''} placed</p>
                  <p className="mt-0.5 text-slate-500">Double-click to finish path</p>
                </div>
              )}

              {activeTool === 'parking' && (
                <div className="mt-2 rounded bg-slate-800 p-2 text-[10px] text-slate-400">
                  <p>Click to place 2.5m x 5m bays</p>
                  <p className="mt-0.5 text-slate-500">Total bays: {parkingCount}</p>
                </div>
              )}

              <div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-slate-500 px-1">
                <p><strong>Entrance:</strong> Click on boundary edge</p>
                <p><strong>Parking:</strong> Click to place bays (stays active)</p>
                <p><strong>Path:</strong> Click points, double-click to finish</p>
                <p><strong>Zones:</strong> Click to place, then drag to resize</p>
                <p className="mt-1 text-slate-600">Press Esc to cancel tool</p>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Legend</p>
          {Object.entries(CATEGORY_COLORS).slice(0, 7).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                className="inline-block h-2 w-4 rounded-sm"
                style={{ backgroundColor: color, opacity: 0.7 }}
              />
              <span className="capitalize">{cat}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
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
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Interactive Site Planner
            </h2>
            {activeTool !== 'select' && (
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                Tool: {DRAWING_TOOLS.find(t => t.tool === activeTool)?.label}
              </span>
            )}
            {engineLayout && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                Engine Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToEngine}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-400 hover:bg-slate-800 hover:text-blue-300"
              title="Reset to engine layout"
            >
              <RefreshCcw size={12} />
              Reset Layout
            </button>
            <button
              onClick={() => {
                setItems((prev) => prev.filter((c) => c.source === 'engine'))
                setOverrides({})
                saveOverrides({})
              }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400"
              title="Clear user items"
            >
              <Trash2 size={12} />
              Clear Custom
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-400 hover:bg-slate-800 hover:text-emerald-300"
              title="Save Layout"
            >
              {showSaved ? (
                <>
                  <CheckCircle2 size={12} />
                  <span className="animate-pulse">Saved!</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  Save
                </>
              )}
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
            draggable={activeTool === 'select'}
            onClick={handleStageClick}
            onDblClick={handleStageDblClick}
            onContextMenu={(e) => {
              e.evt.preventDefault()
            }}
            scaleX={stageSize.width / CANVAS_W}
            scaleY={stageSize.height / CANVAS_H}
            style={{ cursor: activeTool !== 'select' ? 'crosshair' : 'default' }}
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

              {/* Bay Street label */}
              {(() => {
                const { cx, cy } = toCanvas(SITE.centroidX, WORLD_MIN_Y + 2)
                return <Text x={cx - 30} y={cy} text="Bay Street" fill="#94a3b8" fontSize={12} listening={false} />
              })()}

              {/* Placed items */}
              {visibleItems.map((item) => {
                // Special rendering for polyline paths
                if (item.pathPoints && item.pathPoints.length >= 2) {
                  const pts = item.pathPoints.flatMap((p) => {
                    const { cx, cy } = toCanvas(p.x, p.y)
                    return [cx, cy]
                  })
                  return (
                    <Group key={item.id}>
                      <Line
                        points={pts}
                        stroke={item.fill}
                        strokeWidth={4}
                        dash={[6, 4]}
                        lineCap="round"
                        lineJoin="round"
                        onClick={() => {
                          setSelectedId(item.id)
                          setContextMenu(null)
                        }}
                        onContextMenu={(e) => handleContextMenu(e, item.id)}
                      />
                      {/* Path label at midpoint */}
                      {item.pathPoints.length >= 2 && (() => {
                        const midIdx = Math.floor(item.pathPoints.length / 2)
                        const midPt = item.pathPoints[midIdx]
                        const { cx, cy } = toCanvas(midPt.x, midPt.y)
                        return (
                          <Text
                            x={cx - 20}
                            y={cy - 14}
                            text={item.label}
                            fill="#ffffff"
                            fontSize={9}
                            listening={false}
                          />
                        )
                      })()}
                    </Group>
                  )
                }

                const { cx, cy } = toCanvas(item.x, item.y)
                const pw = item.width * SCALE
                const ph = item.height * SCALE
                const isSelected = item.id === selectedId
                const isEntrance = item.type === 'entrance'

                return (
                  <Group key={item.id}>
                    <Rect
                      ref={(node) => {
                        if (node) {
                          shapeRefs.current.set(item.id, node)
                        } else {
                          shapeRefs.current.delete(item.id)
                        }
                      }}
                      x={cx}
                      y={cy}
                      width={pw}
                      height={ph}
                      rotation={item.rotation}
                      fill={item.fill}
                      opacity={item.source === 'engine' ? 0.6 : 0.7}
                      stroke={isSelected ? '#60a5fa' : (item.source === 'engine' ? '#ffffff40' : '#ffffff')}
                      strokeWidth={isSelected ? 3 : 1}
                      cornerRadius={item.cornerRadius}
                      draggable={activeTool === 'select'}
                      onClick={() => {
                        if (activeTool === 'select') {
                          setSelectedId(item.id)
                          setContextMenu(null)
                        }
                      }}
                      onDblClick={() => handleDblClick(item.id)}
                      onContextMenu={(e) => handleContextMenu(e, item.id)}
                      onDragEnd={(e) => handleDragEnd(item.id, e.target)}
                      onTransformEnd={(e) => handleTransformEnd(item.id, e.target)}
                      onMouseEnter={(e) => handleMouseEnter(item, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                    {/* Entrance gate icon */}
                    {isEntrance && (
                      <Group listening={false}>
                        <Line
                          points={[cx + pw * 0.3, cy + ph * 0.2, cx + pw * 0.5, cy + ph * 0.05, cx + pw * 0.7, cy + ph * 0.2]}
                          stroke="#ffffff"
                          strokeWidth={2}
                          lineCap="round"
                          lineJoin="round"
                        />
                        <Line
                          points={[cx + pw * 0.35, cy + ph * 0.2, cx + pw * 0.35, cy + ph * 0.6]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        <Line
                          points={[cx + pw * 0.65, cy + ph * 0.2, cx + pw * 0.65, cy + ph * 0.6]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      </Group>
                    )}
                    {/* Source indicator dot */}
                    {item.source === 'engine' && (
                      <Circle
                        x={cx + pw - 4}
                        y={cy + 4}
                        radius={3}
                        fill="#22c55e"
                        stroke="#0f172a"
                        strokeWidth={1}
                        listening={false}
                      />
                    )}
                    {/* Label text */}
                    <Text
                      x={cx + (item.rotation === 0 ? pw / 2 : 0)}
                      y={cy + (item.rotation === 0 ? ph / 2 - 8 : 0)}
                      text={item.label}
                      fill="#ffffff"
                      fontSize={pw > 60 ? 11 : pw > 30 ? 9 : 7}
                      fontStyle="bold"
                      align="center"
                      width={pw}
                      listening={false}
                      rotation={item.rotation}
                    />
                    {/* Dimension text */}
                    {pw > 20 && (
                      <Text
                        x={cx + (item.rotation === 0 ? pw / 2 : 0)}
                        y={cy + (item.rotation === 0 ? ph / 2 + 4 : 16)}
                        text={`${item.width}m x ${item.height}m${item.storeys > 1 ? ` | ${item.storeys}F` : ''}`}
                        fill="rgba(255,255,255,0.5)"
                        fontSize={7}
                        align="center"
                        width={pw}
                        listening={false}
                        rotation={item.rotation}
                      />
                    )}
                  </Group>
                )
              })}

              {/* Drawing path preview */}
              {activeTool === 'path' && drawingPathPoints.length > 0 && (
                <Line
                  points={drawingPathPoints.flatMap((p) => {
                    const { cx, cy } = toCanvas(p.x, p.y)
                    return [cx, cy]
                  })}
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dash={[6, 3]}
                  lineCap="round"
                  lineJoin="round"
                  listening={false}
                />
              )}

              {/* Drawing path point markers */}
              {activeTool === 'path' && drawingPathPoints.map((p, i) => {
                const { cx, cy } = toCanvas(p.x, p.y)
                return (
                  <Circle
                    key={`path-pt-${i}`}
                    x={cx}
                    y={cy}
                    radius={4}
                    fill="#60a5fa"
                    stroke="#ffffff"
                    strokeWidth={1}
                    listening={false}
                  />
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

          {/* Tooltip overlay */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-50 max-w-xs rounded-lg border border-white/20 bg-slate-800/95 px-3 py-2 text-[11px] text-slate-200 shadow-xl backdrop-blur-sm"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="flex items-start gap-1.5">
                <Info size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{tooltip.text}</span>
              </div>
            </div>
          )}

          {/* Context menu (HTML overlay) */}
          {contextMenu && (
            <div
              className="absolute z-50 w-44 rounded-lg border border-white/10 bg-slate-800 py-1 shadow-2xl"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              {(() => {
                const comp = items.find((c) => c.id === contextMenu.componentId)
                return comp?.rationale ? (
                  <div className="px-3 py-1.5 text-[10px] text-blue-300 border-b border-white/10 leading-tight">
                    {comp.rationale}
                  </div>
                ) : null
              })()}
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
              <button
                onClick={() => toggleVisibility(contextMenu.componentId)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                <EyeOff size={12} /> Toggle Visibility
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
            const comp = items.find((c) => c.id === editingId)
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
                  onChange={(e) => setEditLabel(e.target.value.slice(0, 60))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitLabelEdit()
                    if (e.key === 'Escape') { setEditingId(null); setEditLabel('') }
                  }}
                  onBlur={commitLabelEdit}
                  className="rounded border border-blue-400 bg-slate-800 px-2 py-0.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-400"
                  style={{ minWidth: 120 }}
                />
              </div>
            )
          })()}

          {/* ─── Compliance Panel (floating top-right) ─── */}
          <div className="absolute right-3 top-3 w-72 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Compliance
            </h3>
            <div className="space-y-1.5">
              {compliance.map((c, i) => (
                <div key={`${c.label}-${i}`} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 min-w-0">
                    {c.ok ? (
                      <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={11} className="text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-slate-300 truncate">{c.label}</span>
                  </span>
                  <span className={`ml-2 flex-shrink-0 ${c.ok ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}`}>
                    {c.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Engine design narrative */}
            {engineLayout?.designNarrative && (
              <details className="mt-3 border-t border-white/10 pt-2">
                <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300">
                  Design Narrative
                </summary>
                <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
                  {engineLayout.designNarrative}
                </p>
              </details>
            )}

            {/* Selected info */}
            {selectedId && (() => {
              const sel = items.find((c) => c.id === selectedId)
              if (!sel) return null
              return (
                <div className="mt-3 border-t border-white/10 pt-2">
                  <p className="text-[10px] text-slate-500">
                    Selected: <span className="text-slate-300 font-medium">{sel.label}</span>
                    {sel.source === 'engine' && (
                      <span className="ml-1 rounded bg-emerald-500/20 px-1 py-0.5 text-[8px] text-emerald-400">ENGINE</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pos: ({sel.x.toFixed(1)}, {sel.y.toFixed(1)}) | {sel.width.toFixed(1)}m x {sel.height.toFixed(1)}m
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Rot: {sel.rotation} deg | Floor: {sel.floor}
                    {sel.storeys > 1 ? ` | ${sel.storeys}F` : ''}
                  </p>
                  {sel.rationale && (
                    <p className="text-[10px] text-blue-300 mt-1 leading-tight">
                      {sel.rationale}
                    </p>
                  )}
                  <div className="mt-1.5 flex gap-1 flex-wrap">
                    <button
                      onClick={() => rotate90(sel.id)}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-300 hover:bg-slate-600"
                    >
                      Rotate
                    </button>
                    <button
                      onClick={() => duplicateComponent(sel.id)}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-300 hover:bg-slate-600"
                    >
                      Duplicate
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
            {visibleItems.length} visible / {items.length} total | Parking: {parkingCount} bays
          </div>

          {/* Active tool indicator */}
          {activeTool !== 'select' && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] text-blue-400 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Drawing: {DRAWING_TOOLS.find(t => t.tool === activeTool)?.label}
              <button
                onClick={() => { setActiveTool('select'); setDrawingPathPoints([]) }}
                className="ml-1 rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] hover:bg-blue-500/30"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
