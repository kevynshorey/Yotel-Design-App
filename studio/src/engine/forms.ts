import type { FormType, FormResult, Wing } from './types'
import { SITE } from '@/config/site'
import { RULES } from '@/config/rules'

let wingCounter = 0
function wingId(): string {
  return `w${++wingCounter}`
}

/** Boundary setback (1.83m = 6 ft) enforced on all edges.
 *  Building edges must be at least this far from the buildable zone edge. */
const SETBACK = RULES.planning.boundarySetback

/** Clamp length to site buildable span minus setbacks on both sides. */
function clamp(len: number, maxL: number): number {
  const effectiveMax = maxL - 2 * SETBACK // subtract setback from both ends
  return Math.round(Math.min(len, effectiveMax) * 10) / 10
}

export function generateForm(
  formType: FormType,
  targetFloorArea: number,
  wingWidth: number,
): FormResult {
  wingCounter = 0
  const wings: Wing[] = []
  let courtyard = 0
  let footprintOverlap = 0
  const maxL = SITE.buildableEW
  const maxW = SITE.buildableNS
  const W = wingWidth

  // All wings start at (SETBACK, SETBACK) minimum to enforce 1.83m boundary setback
  // on all edges per Barbados Planning & Development Act.
  const ox = SETBACK // x-origin offset (east boundary setback)
  const oy = SETBACK // y-origin offset (south boundary setback)

  switch (formType) {
    case 'BAR': {
      const length = clamp(targetFloorArea / W, maxL)
      wings.push({
        id: wingId(), label: 'Main', x: ox, y: oy,
        length, width: W, direction: 'EW', floors: 0,
      })
      break
    }
    case 'BAR_NS': {
      const length = clamp(targetFloorArea / W, maxW)
      wings.push({
        id: wingId(), label: 'Main', x: ox, y: oy,
        length, width: W, direction: 'NS', floors: 0,
      })
      break
    }
    case 'L': {
      const netTarget = targetFloorArea + W * W
      const mainArea = netTarget * 0.6
      const branchArea = netTarget * 0.4
      const La = clamp(mainArea / W, maxL)
      const Lb = clamp(branchArea / W, maxW)
      wings.push({
        id: wingId(), label: 'Main (E-W)', x: ox, y: oy,
        length: La, width: W, direction: 'EW', floors: 0,
      })
      wings.push({
        id: wingId(), label: 'Branch (N-S)', x: ox + La - W, y: oy,
        length: Lb, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = W * W
      break
    }
    case 'U': {
      const Lw = clamp(targetFloorArea / (3 * W), maxL)
      const gap = Math.max(8, Lw)
      wings.push({
        id: wingId(), label: 'South', x: ox, y: oy,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      wings.push({
        id: wingId(), label: 'North', x: ox, y: oy + gap + W,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      const connLen = gap + 2 * W
      wings.push({
        id: wingId(), label: 'East Connector', x: ox + Lw - W, y: oy,
        length: connLen, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = 2 * W * W
      courtyard = (Lw - W) * gap
      break
    }
    case 'C': {
      const Lw = clamp(targetFloorArea / (3 * W), maxL)
      const gap = Math.max(8, Lw)
      wings.push({
        id: wingId(), label: 'South', x: ox, y: oy,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      wings.push({
        id: wingId(), label: 'North', x: ox, y: oy + gap + W,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      const connLen = gap + 2 * W
      wings.push({
        id: wingId(), label: 'West Connector', x: ox, y: oy,
        length: connLen, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = 2 * W * W
      courtyard = (Lw - W) * gap
      break
    }
  }

  const rawArea = wings.reduce((sum, w) => sum + w.length * w.width, 0)
  const footprint = rawArea - footprintOverlap

  let westFacade: number
  switch (formType) {
    case 'BAR': westFacade = W; break
    case 'BAR_NS': westFacade = wings[0].length; break
    case 'L': westFacade = W + wings[1].length; break
    case 'U': case 'C': {
      const gap = Math.max(8, wings[0].length)
      westFacade = gap + 2 * W
      break
    }
    default: westFacade = W
  }

  const totalFacade = wings.reduce((sum, w) => sum + 2 * (w.length + w.width), 0)
  const boundingLength = Math.max(...wings.map(w =>
    w.direction === 'EW' ? w.x + w.length : w.x + w.width))
  const boundingWidth = Math.max(...wings.map(w =>
    w.direction === 'EW' ? w.y + w.width : w.y + w.length))

  return {
    form: formType, wings, footprint, westFacade,
    totalFacade, courtyard, boundingLength, boundingWidth,
  }
}
