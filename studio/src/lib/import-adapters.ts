/** Import adapters for CAD/BIM file formats.
 *  Parses IFC, DXF footprint coordinates for use in the design engine.
 *  DWG is a proprietary binary format and requires external conversion. */

// ── Types ──────────────────────────────────────────────────────────────

export interface Point2D {
  x: number
  y: number
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface FootprintResult {
  success: boolean
  points: Point2D[]
  warnings: string[]
  error?: string
  metadata: {
    format: string
    pointCount: number
    boundingBox?: BoundingBox
  }
}

// ── Constants ──────────────────────────────────────────────────────────

/** Tolerance for deduplicating coincident points (metres). */
const DEDUP_TOLERANCE = 0.01

// ── IFC Parser ─────────────────────────────────────────────────────────

/**
 * Extract 2D footprint coordinates from IFC STEP file content.
 * Parses IFCCARTESIANPOINT entities, drops Z coordinate if present.
 */
export function parseIFCFootprint(content: string): FootprintResult {
  const warnings: string[] = []

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      points: [],
      warnings,
      error: 'Empty IFC content provided',
      metadata: { format: 'IFC', pointCount: 0 },
    }
  }

  // Match IFCCARTESIANPOINT((x,y)) or IFCCARTESIANPOINT((x,y,z))
  const regex = /IFCCARTESIANPOINT\(\(([^)]+)\)\)/gi
  const rawPoints: Point2D[] = []

  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    const coords = match[1].split(',').map((s) => parseFloat(s.trim()))
    if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      rawPoints.push({ x: coords[0], y: coords[1] })
    }
  }

  if (rawPoints.length === 0) {
    return {
      success: false,
      points: [],
      warnings,
      error: 'No IFCCARTESIANPOINT entities found in content',
      metadata: { format: 'IFC', pointCount: 0 },
    }
  }

  // Deduplicate within tolerance
  const points = deduplicatePoints(rawPoints, DEDUP_TOLERANCE)
  if (points.length < rawPoints.length) {
    const removed = rawPoints.length - points.length
    warnings.push(`Removed ${removed} duplicate point(s) within ${DEDUP_TOLERANCE}m tolerance`)
  }

  const boundingBox = calculateBoundingBox(points)

  return {
    success: true,
    points,
    warnings,
    metadata: {
      format: 'IFC',
      pointCount: points.length,
      boundingBox,
    },
  }
}

// ── DXF Parser ─────────────────────────────────────────────────────────

/**
 * Extract 2D footprint coordinates from DXF file content.
 * Parses group code 10 (X) and 20 (Y) pairs.
 */
export function parseDXFFootprint(content: string): FootprintResult {
  const warnings: string[] = []

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      points: [],
      warnings,
      error: 'Empty DXF content provided',
      metadata: { format: 'DXF', pointCount: 0 },
    }
  }

  // Normalise line endings and split
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const rawPoints: Point2D[] = []

  let pendingX: number | null = null

  for (let i = 0; i < lines.length - 1; i++) {
    const code = lines[i].trim()
    const value = lines[i + 1]?.trim()

    if (code === '10' && value !== undefined) {
      const x = parseFloat(value)
      if (!isNaN(x)) {
        pendingX = x
      }
    } else if (code === '20' && value !== undefined && pendingX !== null) {
      const y = parseFloat(value)
      if (!isNaN(y)) {
        rawPoints.push({ x: pendingX, y })
        pendingX = null
      }
    }
  }

  if (rawPoints.length === 0) {
    return {
      success: false,
      points: [],
      warnings,
      error: 'No coordinate pairs (group 10/20) found in DXF content',
      metadata: { format: 'DXF', pointCount: 0 },
    }
  }

  // Deduplicate
  const points = deduplicatePoints(rawPoints, DEDUP_TOLERANCE)
  if (points.length < rawPoints.length) {
    const removed = rawPoints.length - points.length
    warnings.push(`Removed ${removed} duplicate point(s) within ${DEDUP_TOLERANCE}m tolerance`)
  }

  const boundingBox = calculateBoundingBox(points)

  return {
    success: true,
    points,
    warnings,
    metadata: {
      format: 'DXF',
      pointCount: points.length,
      boundingBox,
    },
  }
}

// ── DWG Stub ───────────────────────────────────────────────────────────

/**
 * DWG is a proprietary binary format that cannot be parsed directly.
 * Returns guidance on converting to DXF or IFC for import.
 */
export function parseDWG(): FootprintResult {
  return {
    success: false,
    points: [],
    warnings: [
      'DWG is a proprietary binary format owned by Autodesk.',
      'Use the Open Design Alliance (ODA) File Converter or Autodesk DWG TrueView to convert.',
      'Alternatively, export as IFC from the original CAD application.',
    ],
    error: 'DWG is a proprietary binary format and cannot be parsed directly. Convert to DXF or IFC using Autodesk DWG TrueView or ODA File Converter.',
    metadata: {
      format: 'DWG',
      pointCount: 0,
    },
  }
}

// ── Utilities ──────────────────────────────────────────────────────────

function deduplicatePoints(points: Point2D[], tolerance: number): Point2D[] {
  const result: Point2D[] = []

  for (const p of points) {
    const isDuplicate = result.some(
      (existing) =>
        Math.abs(existing.x - p.x) < tolerance &&
        Math.abs(existing.y - p.y) < tolerance,
    )
    if (!isDuplicate) {
      result.push(p)
    }
  }

  return result
}

function calculateBoundingBox(points: Point2D[]): BoundingBox | undefined {
  if (points.length === 0) return undefined

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
