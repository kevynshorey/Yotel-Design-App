/**
 * DXF Export — Foster+Partners-grade design documentation
 *
 * Generates DXF files with architectural standard layer naming,
 * proper title blocks, dimension strings, and per-floor drawings.
 *
 * Units: metres | Scale: 1:100
 */

import Drawing from 'dxf-writer'
import type { DesignOption, Wing, Floor } from '@/engine/types'

// ── ACI colour codes ──────────────────────────────────────────────
const ACI = {
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
  CYAN: 4,
  BLUE: 5,
  MAGENTA: 6,
  WHITE: 7,
  GRAY: 8,
  ORANGE: 30,
  PURPLE: 200,
} as const

// ── Layer definitions (Foster+Partners naming convention) ─────────
interface LayerDef {
  name: string
  color: number
  lineType: string
}

const LAYERS: LayerDef[] = [
  { name: 'A-WALL', color: ACI.WHITE, lineType: 'CONTINUOUS' },
  { name: 'A-WALL-CORE', color: ACI.CYAN, lineType: 'CONTINUOUS' },
  { name: 'A-DOOR', color: ACI.GREEN, lineType: 'CONTINUOUS' },
  { name: 'A-GLAZ', color: ACI.BLUE, lineType: 'CONTINUOUS' },
  { name: 'A-COLS', color: ACI.MAGENTA, lineType: 'CONTINUOUS' },
  { name: 'A-FLOR-IDEN', color: ACI.YELLOW, lineType: 'CONTINUOUS' },
  { name: 'A-SITE-BNDY', color: ACI.RED, lineType: 'CONTINUOUS' },
  { name: 'A-SITE-STBK', color: ACI.RED, lineType: 'DASHED' },
  { name: 'A-DIMS', color: ACI.WHITE, lineType: 'CONTINUOUS' },
  { name: 'A-ANNO', color: ACI.WHITE, lineType: 'CONTINUOUS' },
  { name: 'A-FURN', color: ACI.GRAY, lineType: 'CONTINUOUS' },
  { name: 'M-HVAC', color: ACI.ORANGE, lineType: 'CONTINUOUS' },
  { name: 'P-SANR', color: ACI.PURPLE, lineType: 'CONTINUOUS' },
  { name: 'E-POWR', color: ACI.YELLOW, lineType: 'CONTINUOUS' },
  { name: 'L-PLNT', color: ACI.GREEN, lineType: 'CONTINUOUS' },
  { name: 'S-GRID', color: ACI.GRAY, lineType: 'CENTER' },
]

// ── Site constants (Carlisle Bay, Bridgetown) ─────────────────────
const SITE_BOUNDARY: [number, number][] = [
  [0, 0],
  [80, 0],
  [80, 55],
  [0, 55],
  [0, 0],
]

const SETBACK = 3 // metres from site boundary

// ── Floor label helper ────────────────────────────────────────────
function floorLabel(level: number, option: DesignOption): string {
  if (level === 0) return 'Ground'
  const topFloor = option.floors.length - 1
  if (level === topFloor) return 'Rooftop'
  return `Floor ${level}`
}

// ── Text height at 1:100 scale ────────────────────────────────────
const TEXT_HEIGHT = {
  title: 3.5,
  subtitle: 2.5,
  label: 1.8,
  dim: 1.2,
  room: 1.4,
} as const

// ── Core drawing routines ─────────────────────────────────────────

function setupDrawing(): Drawing {
  const d = new Drawing()
  d.setUnits('Meters')

  // Register line types
  d.addLineType('DASHED', 'Dashed __ __ __', [5, -3])
  d.addLineType('CENTER', 'Center ____ _ ____', [12.7, -6.35, 6.35, -6.35])
  d.addLineType('CONTINUOUS', 'Solid', [])

  // Register all layers
  for (const layer of LAYERS) {
    d.addLayer(layer.name, layer.color, layer.lineType)
  }

  return d
}

function drawWingOutline(
  d: Drawing,
  wing: Wing,
  offsetX: number,
  offsetY: number,
) {
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  // Wall outlines
  d.setActiveLayer('A-WALL')
  d.drawPolyline(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ],
    true,
  )
}

function drawCorridorCenterline(
  d: Drawing,
  wing: Wing,
  corridorType: string,
  offsetX: number,
  offsetY: number,
) {
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  d.setActiveLayer('A-ANNO')

  if (corridorType === 'double_loaded') {
    // Centerline along the long axis
    if (wing.direction === 'EW') {
      const cy = y + h / 2
      d.drawLine(x, cy, x + w, cy)
    } else {
      const cx = x + w / 2
      d.drawLine(cx, y, cx, y + h)
    }
  } else {
    // Single-loaded: corridor on one side (north or east)
    if (wing.direction === 'EW') {
      const cy = y + h - 1.8 // corridor on north edge
      d.drawLine(x, cy, x + w, cy)
    } else {
      const cx = x + w - 1.8
      d.drawLine(cx, y, cx, y + h)
    }
  }
}

function drawRoomDivisions(
  d: Drawing,
  wing: Wing,
  floor: Floor,
  corridorType: string,
  offsetX: number,
  offsetY: number,
) {
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  const totalRooms = floor.rooms.reduce((sum, r) => sum + r.count, 0)
  if (totalRooms === 0) return

  // Estimate rooms per wing (divide evenly across wings)
  const wingRoomCount = Math.max(1, Math.ceil(totalRooms / 2))

  // Room bay width
  const corridorWidth = 1.8
  const longDim = wing.direction === 'EW' ? w : h
  const shortDim = wing.direction === 'EW' ? h : w
  const bayWidth = longDim / wingRoomCount

  const roomDepthSingle = shortDim - corridorWidth
  const roomDepthDouble = (shortDim - corridorWidth) / 2

  d.setActiveLayer('A-WALL')

  // Draw room partition lines
  for (let i = 1; i < wingRoomCount; i++) {
    if (wing.direction === 'EW') {
      const rx = x + i * bayWidth
      if (corridorType === 'double_loaded') {
        // Both sides
        d.drawLine(rx, y, rx, y + roomDepthDouble)
        d.drawLine(rx, y + roomDepthDouble + corridorWidth, rx, y + h)
      } else {
        d.drawLine(rx, y, rx, y + roomDepthSingle)
      }
    } else {
      const ry = y + i * bayWidth
      if (corridorType === 'double_loaded') {
        d.drawLine(x, ry, x + roomDepthDouble, ry)
        d.drawLine(x + roomDepthDouble + corridorWidth, ry, x + w, ry)
      } else {
        d.drawLine(x, ry, x + roomDepthSingle, ry)
      }
    }
  }

  // Room labels
  d.setActiveLayer('A-FLOR-IDEN')
  let roomIdx = 0
  for (const alloc of floor.rooms) {
    for (let r = 0; r < Math.min(alloc.count, wingRoomCount); r++) {
      const labelX =
        wing.direction === 'EW'
          ? x + (roomIdx + 0.5) * bayWidth
          : x + shortDim * 0.25
      const labelY =
        wing.direction === 'EW'
          ? y + shortDim * 0.25
          : y + (roomIdx + 0.5) * bayWidth

      const areaStr = `${alloc.nia}m2`
      d.drawText(labelX, labelY, TEXT_HEIGHT.room, 0, alloc.type, 'center', 'middle')
      d.drawText(
        labelX,
        labelY - TEXT_HEIGHT.room * 1.5,
        TEXT_HEIGHT.dim,
        0,
        areaStr,
        'center',
        'middle',
      )
      roomIdx++
      if (roomIdx >= wingRoomCount) break
    }
    if (roomIdx >= wingRoomCount) break
  }
}

function drawCoreArea(
  d: Drawing,
  wing: Wing,
  offsetX: number,
  offsetY: number,
) {
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  // Core at the end of the wing (stairs + lifts)
  const coreW = 6
  const coreH = h
  const coreX = x + w - coreW
  const coreY = y

  d.setActiveLayer('A-WALL-CORE')
  d.drawRect(coreX, coreY, coreX + coreW, coreY + coreH)

  // Lift symbol (circle)
  const liftR = 1.2
  d.drawCircle(coreX + coreW / 2, coreY + coreH / 2 - 2, liftR)

  // Stair symbol (zigzag lines)
  const stairY = coreY + coreH / 2 + 1
  const stairW = coreW - 1
  const stairSteps = 6
  const stepW = stairW / stairSteps
  for (let s = 0; s < stairSteps; s++) {
    const sx = coreX + 0.5 + s * stepW
    d.drawLine(sx, stairY, sx + stepW, stairY + 1.5)
    d.drawLine(sx + stepW, stairY + 1.5, sx + stepW, stairY)
  }

  // Label
  d.setActiveLayer('A-FLOR-IDEN')
  d.drawText(coreX + coreW / 2, coreY + 1.5, TEXT_HEIGHT.dim, 0, 'CORE', 'center', 'middle')
}

function drawStructuralGrid(
  d: Drawing,
  wings: Wing[],
  offsetX: number,
  offsetY: number,
) {
  d.setActiveLayer('S-GRID')

  // Find bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const wing of wings) {
    const w = wing.direction === 'EW' ? wing.length : wing.width
    const h = wing.direction === 'EW' ? wing.width : wing.length
    minX = Math.min(minX, wing.x + offsetX)
    minY = Math.min(minY, wing.y + offsetY)
    maxX = Math.max(maxX, wing.x + offsetX + w)
    maxY = Math.max(maxY, wing.y + offsetY + h)
  }

  const gridSpacing = 8 // metres
  const overhang = 2

  // Vertical grid lines
  let gridLabel = 1
  for (let gx = minX; gx <= maxX; gx += gridSpacing) {
    d.drawLine(gx, minY - overhang, gx, maxY + overhang)
    // Grid bubble
    d.drawCircle(gx, minY - overhang - 1.5, 1.2)
    d.setActiveLayer('A-ANNO')
    d.drawText(gx, minY - overhang - 1.5, TEXT_HEIGHT.dim, 0, String(gridLabel), 'center', 'middle')
    d.setActiveLayer('S-GRID')
    gridLabel++
  }

  // Horizontal grid lines
  let gridLetter = 'A'
  for (let gy = minY; gy <= maxY; gy += gridSpacing) {
    d.drawLine(minX - overhang, gy, maxX + overhang, gy)
    // Grid bubble
    d.drawCircle(minX - overhang - 1.5, gy, 1.2)
    d.setActiveLayer('A-ANNO')
    d.drawText(minX - overhang - 1.5, gy, TEXT_HEIGHT.dim, 0, gridLetter, 'center', 'middle')
    d.setActiveLayer('S-GRID')
    gridLetter = String.fromCharCode(gridLetter.charCodeAt(0) + 1)
  }
}

function drawDimensions(
  d: Drawing,
  wings: Wing[],
  offsetX: number,
  offsetY: number,
) {
  d.setActiveLayer('A-DIMS')

  for (const wing of wings) {
    const x = wing.x + offsetX
    const y = wing.y + offsetY
    const w = wing.direction === 'EW' ? wing.length : wing.width
    const h = wing.direction === 'EW' ? wing.width : wing.length

    const dimOffset = 3 // distance from wall for dimension line

    // Bottom dimension (length)
    const dy = y - dimOffset
    d.drawLine(x, dy, x + w, dy)
    // Tick marks
    d.drawLine(x, dy - 0.5, x, dy + 0.5)
    d.drawLine(x + w, dy - 0.5, x + w, dy + 0.5)
    // Extension lines
    d.drawLine(x, y, x, dy - 0.3)
    d.drawLine(x + w, y, x + w, dy - 0.3)
    // Dimension text
    d.drawText(x + w / 2, dy - 1.2, TEXT_HEIGHT.dim, 0, `${w.toFixed(1)}`, 'center', 'top')

    // Left dimension (width)
    const dx = x - dimOffset
    d.drawLine(dx, y, dx, y + h)
    d.drawLine(dx - 0.5, y, dx + 0.5, y)
    d.drawLine(dx - 0.5, y + h, dx + 0.5, y + h)
    d.drawLine(x, y, dx - 0.3, y)
    d.drawLine(x, y + h, dx - 0.3, y + h)
    d.drawText(dx - 1.2, y + h / 2, TEXT_HEIGHT.dim, 90, `${h.toFixed(1)}`, 'center', 'top')
  }
}

function drawSiteBoundary(d: Drawing, offsetX: number, offsetY: number) {
  d.setActiveLayer('A-SITE-BNDY')
  const pts: [number, number][] = SITE_BOUNDARY.map(([bx, by]) => [
    bx + offsetX,
    by + offsetY,
  ])
  d.drawPolyline(pts, true)

  // Setback lines
  d.setActiveLayer('A-SITE-STBK')
  const setbackPts: [number, number][] = [
    [SETBACK + offsetX, SETBACK + offsetY],
    [80 - SETBACK + offsetX, SETBACK + offsetY],
    [80 - SETBACK + offsetX, 55 - SETBACK + offsetY],
    [SETBACK + offsetX, 55 - SETBACK + offsetY],
    [SETBACK + offsetX, SETBACK + offsetY],
  ]
  d.drawPolyline(setbackPts, true)

  // Labels
  d.setActiveLayer('A-ANNO')
  d.drawText(40 + offsetX, -3 + offsetY, TEXT_HEIGHT.label, 0, 'CARLISLE BAY (WEST)', 'center', 'top')
  d.drawText(40 + offsetX, 58 + offsetY, TEXT_HEIGHT.label, 0, 'BAY STREET', 'center', 'bottom')
}

function drawTitleBlock(
  d: Drawing,
  option: DesignOption,
  floorLbl: string,
  floorNum: number,
  offsetX: number,
  offsetY: number,
) {
  const tbW = 60
  const tbH = 20
  const tbX = offsetX + 80 - tbW // right-aligned with site
  const tbY = offsetY - 30 // below site boundary

  d.setActiveLayer('A-ANNO')

  // Border
  d.drawRect(tbX, tbY, tbX + tbW, tbY + tbH)

  // Horizontal dividers
  d.drawLine(tbX, tbY + tbH - 5, tbX + tbW, tbY + tbH - 5)
  d.drawLine(tbX, tbY + tbH - 10, tbX + tbW, tbY + tbH - 10)

  // Vertical divider
  d.drawLine(tbX + tbW / 2, tbY, tbX + tbW / 2, tbY + tbH - 5)

  // Project title
  d.drawText(
    tbX + tbW / 2,
    tbY + tbH - 2.5,
    TEXT_HEIGHT.title,
    0,
    'YOTEL BARBADOS - CARLISLE BAY, BRIDGETOWN',
    'center',
    'middle',
  )

  // Client
  d.drawText(
    tbX + tbW / 2,
    tbY + tbH - 7.5,
    TEXT_HEIGHT.subtitle,
    0,
    'CORUSCANT DEVELOPMENTS LTD',
    'center',
    'middle',
  )

  // Drawing title
  const optionLabel = option.curatedName ?? option.id
  d.drawText(
    tbX + tbW / 4,
    tbY + tbH - 13,
    TEXT_HEIGHT.label,
    0,
    `${floorLbl} Plan - ${optionLabel}`,
    'center',
    'middle',
  )

  // Dwg number
  const dwgNum = `YBB-A-${String(floorNum).padStart(2, '0')}-001`
  d.drawText(tbX + tbW / 4, tbY + 2, TEXT_HEIGHT.label, 0, `Dwg: ${dwgNum}`, 'center', 'middle')

  // Scale
  d.drawText(
    tbX + (3 * tbW) / 4,
    tbY + tbH - 13,
    TEXT_HEIGHT.label,
    0,
    'Scale 1:100',
    'center',
    'middle',
  )

  // Date
  const dateStr = new Date().toISOString().slice(0, 10)
  d.drawText(
    tbX + (3 * tbW) / 4,
    tbY + 2,
    TEXT_HEIGHT.label,
    0,
    `Date: ${dateStr}`,
    'center',
    'middle',
  )

  // Form type
  d.drawText(
    tbX + (3 * tbW) / 4,
    tbY + 5.5,
    TEXT_HEIGHT.dim,
    0,
    `Form: ${option.form} | Keys: ${option.metrics.totalKeys}`,
    'center',
    'middle',
  )
}

function drawColumnGrid(
  d: Drawing,
  wing: Wing,
  offsetX: number,
  offsetY: number,
) {
  d.setActiveLayer('A-COLS')
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  const colSpacing = 8 // metres
  const colRadius = 0.2

  for (let cx = x; cx <= x + w; cx += colSpacing) {
    for (let cy = y; cy <= y + h; cy += colSpacing) {
      d.drawCircle(cx, cy, colRadius)
    }
  }
}

function drawGlazing(
  d: Drawing,
  wing: Wing,
  offsetX: number,
  offsetY: number,
) {
  d.setActiveLayer('A-GLAZ')
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  // Glazing on the west (bottom) facade for EW wings, or west side for NS wings
  const glazeGap = 0.8
  const glazeLen = 2.4
  if (wing.direction === 'EW') {
    // South facade (sea-facing at Carlisle Bay)
    for (let gx = x + 1; gx + glazeLen < x + w - 1; gx += glazeLen + glazeGap) {
      d.drawLine(gx, y, gx + glazeLen, y)
    }
  } else {
    // West facade
    for (let gy = y + 1; gy + glazeLen < y + h - 1; gy += glazeLen + glazeGap) {
      d.drawLine(x, gy, x, gy + glazeLen)
    }
  }
}

function drawMepIndicators(
  d: Drawing,
  wing: Wing,
  offsetX: number,
  offsetY: number,
) {
  const x = wing.x + offsetX
  const y = wing.y + offsetY
  const w = wing.direction === 'EW' ? wing.length : wing.width
  const h = wing.direction === 'EW' ? wing.width : wing.length

  // HVAC diffuser symbols along corridor
  d.setActiveLayer('M-HVAC')
  const corridorY = wing.direction === 'EW' ? y + h / 2 : y
  const corridorX = wing.direction === 'EW' ? x : x + w / 2
  const spacing = 6
  if (wing.direction === 'EW') {
    for (let mx = x + 3; mx < x + w - 3; mx += spacing) {
      // Small X for diffuser
      d.drawLine(mx - 0.3, corridorY - 0.3, mx + 0.3, corridorY + 0.3)
      d.drawLine(mx - 0.3, corridorY + 0.3, mx + 0.3, corridorY - 0.3)
    }
  } else {
    for (let my = y + 3; my < y + h - 3; my += spacing) {
      d.drawLine(corridorX - 0.3, my - 0.3, corridorX + 0.3, my + 0.3)
      d.drawLine(corridorX - 0.3, my + 0.3, corridorX + 0.3, my - 0.3)
    }
  }
}

// ── Single floor drawing ──────────────────────────────────────────

function drawFloor(
  d: Drawing,
  option: DesignOption,
  floorIdx: number,
  offsetX: number,
  offsetY: number,
) {
  const floor = option.floors[floorIdx]
  if (!floor) return

  const label = floorLabel(floorIdx, option)
  const corridorType = option.metrics.corridorType

  // Site boundary only on ground floor
  if (floorIdx === 0) {
    drawSiteBoundary(d, offsetX, offsetY)
  }

  // Structural grid
  drawStructuralGrid(d, option.wings, offsetX, offsetY)

  // Per-wing elements
  for (const wing of option.wings) {
    drawWingOutline(d, wing, offsetX, offsetY)
    drawCorridorCenterline(d, wing, corridorType, offsetX, offsetY)
    drawRoomDivisions(d, wing, floor, corridorType, offsetX, offsetY)
    drawCoreArea(d, wing, offsetX, offsetY)
    drawColumnGrid(d, wing, offsetX, offsetY)
    drawGlazing(d, wing, offsetX, offsetY)
    drawMepIndicators(d, wing, offsetX, offsetY)
  }

  // Dimensions
  drawDimensions(d, option.wings, offsetX, offsetY)

  // Floor label
  d.setActiveLayer('A-ANNO')
  const labelX = option.wings[0]
    ? option.wings[0].x + offsetX - 8
    : offsetX
  const labelY = option.wings[0]
    ? option.wings[0].y + offsetY + 30
    : offsetY + 30
  d.drawText(labelX, labelY, TEXT_HEIGHT.title, 0, label.toUpperCase(), 'left', 'bottom')

  // Title block
  drawTitleBlock(d, option, label, floorIdx, offsetX, offsetY)
}

// ── Public API ────────────────────────────────────────────────────

export type FloorSelection = 'all' | number

/**
 * Generate a DXF string for the given design option.
 *
 * @param option - The design option to draw
 * @param floorSelection - 'all' for every floor (offset vertically), or a floor index (0-based)
 * @returns DXF file content as a string
 */
export function exportToDXF(
  option: DesignOption,
  floorSelection: FloorSelection = 'all',
): string {
  const d = setupDrawing()

  if (floorSelection === 'all') {
    // Draw each floor offset vertically by 100m
    const floorSpacing = 100
    for (let i = 0; i < option.floors.length; i++) {
      drawFloor(d, option, i, 0, i * floorSpacing)
    }
  } else {
    drawFloor(d, option, floorSelection, 0, 0)
  }

  return d.toDxfString()
}

/**
 * Generate DXF and trigger browser download.
 */
export function downloadDXF(
  option: DesignOption,
  floorSelection: FloorSelection = 'all',
): void {
  const content = exportToDXF(option, floorSelection)
  const blob = new Blob([content], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)

  const optionLabel = option.curatedName ?? option.id
  const floorSuffix =
    floorSelection === 'all'
      ? 'All-Floors'
      : floorLabel(floorSelection, option).replace(/\s+/g, '-')
  const filename = `YOTEL-Barbados-${optionLabel}-${floorSuffix}.dxf`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
