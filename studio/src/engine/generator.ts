import type {
  GenerationParams, DesignOption, FormType, CorridorType,
  OutdoorPosition, OptionMetrics, OptionGroups, ProjectId, RoomType,
} from './types'
import { generateForm } from './forms'
import { roomsPerFloor, buildFloorProgramme } from './rooms'
import { validate } from './validator'
import { scoreOption } from './scorer'
import { estimateCost } from './cost'
import { projectRevenue } from './revenue'
import { calculateAmenities } from './amenities'
import { SITE as CARLISLE_BAY_SITE } from '@/config/site'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'
import { SITE as ABBEVILLE_SITE } from '@/config/abbeville/site'
import { ABBEVILLE_UNITS } from '@/config/abbeville/programme'
import { SITE as MT_BREVITOR_SITE } from '@/config/mt-brevitor/site'
import { MBE_UNITS } from '@/config/mt-brevitor/programme'
import { DEFAULT_WEIGHTS } from '@/config/scoring-weights'
import { CURATED_OPTIONS } from '@/config/curated-options'

interface SiteConfig {
  buildableArea: number
  maxCoverage: number
  maxFootprint: number
  maxHeight: number
  [key: string]: unknown
}

interface ProjectConfig {
  site: SiteConfig
  ytRooms: Record<string, RoomType>
  padUnits: Record<string, RoomType>
}

function getProjectConfig(projectId?: ProjectId): ProjectConfig {
  if (projectId === 'abbeville') {
    return {
      site: ABBEVILLE_SITE,
      ytRooms: ABBEVILLE_UNITS,
      padUnits: ABBEVILLE_UNITS,
    }
  }
  if (projectId === 'mt-brevitor') {
    return {
      site: MT_BREVITOR_SITE,
      ytRooms: MBE_UNITS,
      padUnits: MBE_UNITS,
    }
  }
  // Default: carlisle-bay
  return {
    site: CARLISLE_BAY_SITE,
    ytRooms: YOTEL_ROOMS,
    padUnits: YOTELPAD_UNITS,
  }
}

const GROUND_H = 4.5
const GROUND_H_RESIDENTIAL = 3.0  // lower ground floor for residential (no hotel lobby)
const FLOOR_H = 3.2

/** Hotel design space — Carlisle Bay and Abbeville */
const DESIGN_SPACE = {
  forms: ['BAR', 'BAR_NS', 'L', 'U', 'C'] as FormType[],
  floorAreas: [650, 770, 900, 1050],
  wingWidths: [13.6, 14.0, 16.1],
  storeys: [5, 6],
  corridors: ['double_loaded'] as CorridorType[],
  ytRooms: [95, 100, 105, 110],
  padUnits: [30, 35, 40],
  outdoor: ['WEST'] as OutdoorPosition[],
}

/**
 * Mt Brevitor Estates design space — 2-3 storey residential clusters.
 *
 * Planning envelope: max 3 storeys / 12m height (inland Barbados).
 * Single-loaded corridor = open balcony access (standard residential terrace).
 * Floor areas and wing widths sized for residential cluster blocks, not hotel.
 *
 * Heights produced:
 *   2 storeys: 3.0 + (2-1)×3.2 = 6.2 m  ✓ (<12 m)
 *   3 storeys: 3.0 + (3-1)×3.2 = 9.4 m  ✓ (<12 m)
 */
const DESIGN_SPACE_MBE = {
  forms: ['BAR', 'L', 'U'] as FormType[],
  floorAreas: [300, 450, 600, 750],        // cluster floor plates (m²)
  wingWidths: [8.0, 10.0, 12.0],           // single-loaded residential widths (m)
  storeys: [2, 3],
  corridors: ['single_loaded'] as CorridorType[],
  ytRooms: [10, 15, 20, 25, 30],           // units per cluster
  padUnits: [0],                            // no PAD split — pure residential sale
  outdoor: ['WEST'] as OutdoorPosition[],
}

function getDesignSpace(projectId?: ProjectId) {
  if (projectId === 'mt-brevitor') return DESIGN_SPACE_MBE
  return DESIGN_SPACE
}

function getGroundHeight(projectId?: ProjectId): number {
  if (projectId === 'mt-brevitor') return GROUND_H_RESIDENTIAL
  return GROUND_H
}

let optionCounter = 0

export function buildOption(params: GenerationParams, projectId?: ProjectId): DesignOption {
  const id = `opt-${++optionCounter}`
  const { site, ytRooms, padUnits } = getProjectConfig(projectId)

  // Generate form geometry
  const formResult = generateForm(params.form, params.targetFloorArea, params.wingWidth)

  // Assign storeys to wings
  const wings = formResult.wings.map(w => ({ ...w, floors: params.storeys }))

  // Calculate rooms per floor dynamically (per generator.py)
  const ytPerFloor = roomsPerFloor(wings, params.corridorType, ytRooms)
  const padPerFloor = roomsPerFloor(wings, params.corridorType, padUnits)

  // Dynamic floor allocation (per generator.py lines 60-61):
  const upperFloors = params.storeys - 1  // exclude ground
  const ytFloorCount = params.ytRooms > 0
    ? Math.min(Math.ceil(params.ytRooms / Math.max(1, ytPerFloor)), upperFloors)
    : 0
  const padFloorCount = params.padUnits > 0
    ? Math.min(Math.ceil(params.padUnits / Math.max(1, padPerFloor)), upperFloors - ytFloorCount)
    : 0

  const ytFloors = Array.from({ length: ytFloorCount }, (_, i) => i + 1)
  const actualPadFloors = Array.from({ length: padFloorCount }, (_, i) => i + 1 + ytFloorCount)

  // Actual room counts (clamped to what fits)
  const actualYtRooms = Math.min(params.ytRooms, ytFloorCount * ytPerFloor)
  const actualPadUnits = Math.min(params.padUnits, padFloorCount * padPerFloor)

  const floors = buildFloorProgramme({
    storeys: params.storeys,
    ytPerFloor: Math.round(ytPerFloor),
    padPerFloor: Math.round(padPerFloor),
    ytFloors,
    padFloors: actualPadFloors,
    footprint: formResult.footprint,
    ytRoomTypes: ytRooms,
    padRoomTypes: padUnits,
    residential: projectId === 'mt-brevitor',
  })

  // Calculate metrics
  const totalGia = floors.reduce((sum, f) => sum + f.gia, 0)
  const totalKeys = actualYtRooms + actualPadUnits
  // 130-key minimum is a YOTEL brand requirement — not applicable to residential estates
  if (projectId !== 'mt-brevitor' && totalKeys < 130) {
    throw new Error(`Below 130-key minimum (got ${totalKeys})`)
  }
  // Use project-specific ground floor height (residential = 3.0m, hotel = 4.5m)
  const height = getGroundHeight(projectId) + (params.storeys - 1) * FLOOR_H
  const coverage = formResult.footprint / site.buildableArea
  const outdoorTotal = params.outdoorPosition === 'BOTH' ? 660 + 80 :
                       params.outdoorPosition === 'ROOFTOP' ? 80 : 660

  const metrics: OptionMetrics = {
    totalKeys,
    yotelKeys: actualYtRooms,
    padUnits: actualPadUnits,
    gia: totalGia,
    giaPerKey: totalGia / Math.max(1, totalKeys),
    footprint: formResult.footprint,
    coverage,
    buildingHeight: height,
    westFacade: formResult.westFacade,
    outdoorTotal,
    costPerKey: 0,
    tdc: 0,
    corridorType: params.corridorType,
    form: params.form,
    amenityScore: 0,
  }

  // Cost
  const cost = estimateCost(metrics)
  metrics.tdc = cost.total
  metrics.costPerKey = cost.perKey

  // Revenue
  const revenue = projectRevenue(actualYtRooms, actualPadUnits, 5)

  // Amenities
  const amenities = calculateAmenities(
    metrics.totalKeys,
    metrics.footprint,
    metrics.buildingHeight,
    80, // rooftop base from programme
    metrics.westFacade,
    params.form,
  )
  metrics.amenityScore = amenities.amenityScore

  // Validate against project-specific site constraints
  const validation = validate(metrics, wings, undefined, projectId)

  // Score
  const [score, scoringBreakdown] = scoreOption(metrics, DEFAULT_WEIGHTS)

  return {
    id, form: params.form, params, wings, floors, metrics,
    amenities, cost, revenue, score, scoringBreakdown, validation,
  }
}

/**
 * Find optimal YT/PAD split for a given form configuration.
 * Tests splits from 60% to 85% YOTEL (in 5% steps) and picks
 * the one with highest yield on cost.
 *
 * Not applicable to Mt Brevitor — it is a pure residential sale estate
 * with no YOTEL/PAD split to optimise (returns null immediately).
 */
function optimizeUnitMix(
  form: FormType, area: number, width: number, storeys: number, projectId?: ProjectId
): { ytRooms: number; padUnits: number; yieldOnCost: number } | null {
  // Residential estates have no hotel YT/PAD mix to optimise
  if (projectId === 'mt-brevitor') return null

  let bestYield = -1
  let bestSplit = { ytRooms: 100, padUnits: 30, yieldOnCost: 0 }
  const { ytRooms: ytRoomConfig } = getProjectConfig(projectId)

  // Total capacity estimate
  const formResult = generateForm(form, area, width)
  const wings = formResult.wings.map(w => ({ ...w, floors: storeys }))
  const roomsFloor = roomsPerFloor(wings, 'double_loaded', ytRoomConfig)
  const upperFloors = storeys - 1
  const maxRooms = Math.floor(roomsFloor * upperFloors)

  for (let ytPct = 60; ytPct <= 85; ytPct += 5) {
    const yt = Math.round(maxRooms * ytPct / 100)
    const pad = maxRooms - yt

    if (yt < 50 || pad < 10 || yt + pad < 80) continue

    try {
      const params: GenerationParams = {
        form, targetFloorArea: area, wingWidth: width,
        storeys, corridorType: 'double_loaded' as const,
        ytRooms: yt, padUnits: pad, outdoorPosition: 'WEST' as const,
      }
      const opt = buildOption(params, projectId)
      if (!opt.validation.isValid) continue

      const yoc = opt.cost.total > 0 ? opt.revenue.stabilisedNoi / opt.cost.total : 0
      if (yoc > bestYield) {
        bestYield = yoc
        bestSplit = { ytRooms: yt, padUnits: pad, yieldOnCost: yoc }
      }
    } catch {
      continue
    }
  }

  return bestYield > 0 ? bestSplit : null
}

export function generateAll(maxOptions: number = 50, projectId?: ProjectId): DesignOption[] {
  optionCounter = 0

  // Select the design space for this project
  const ds = getDesignSpace(projectId)

  // ── Phase 1: Generate curated Architect's Options (Carlisle Bay only) ──────
  // CURATED_OPTIONS are calibrated specifically for the Carlisle Bay hotel site.
  // Skip entirely for Abbeville and Mt Brevitor — they get parametric-only results.
  const curated: DesignOption[] = []
  if (!projectId || projectId === 'carlisle-bay') {
    for (const cfg of CURATED_OPTIONS) {
      try {
        const opt = buildOption(cfg.params, projectId)
        opt.curatedId = cfg.id
        opt.curatedName = cfg.name
        opt.curatedConcept = cfg.concept
        // Always include curated designs — they're architect-approved.
        // Warnings are acceptable; only skip if buildOption() throws (fatal constraint violation).
        curated.push(opt)
      } catch {
        // Skip curated options that fail generation (e.g. below 130-key minimum)
        console.warn(`Curated design "${cfg.name}" (${cfg.id}) failed generation`)
      }
    }
  }

  // Sort curated: recommended first, then by score descending
  curated.sort((a, b) => {
    const aCfg = CURATED_OPTIONS.find(c => c.id === a.curatedId)
    const bCfg = CURATED_OPTIONS.find(c => c.id === b.curatedId)
    const aRec = aCfg?.recommended ? 1 : 0
    const bRec = bCfg?.recommended ? 1 : 0
    if (aRec !== bRec) return bRec - aRec
    return b.score - a.score
  })

  // ── Phase 2: Parametric sweep ───────────────────────────────────────
  const sweepOptions: DesignOption[] = []

  for (const form of ds.forms) {
    for (const area of ds.floorAreas) {
      for (const width of ds.wingWidths) {
        for (const storeys of ds.storeys) {
          for (const corridor of ds.corridors) {
            for (const yt of ds.ytRooms) {
              for (const pad of ds.padUnits) {
                const params: GenerationParams = {
                  form, targetFloorArea: area, wingWidth: width,
                  storeys, corridorType: corridor,
                  ytRooms: yt, padUnits: pad, outdoorPosition: 'WEST',
                }
                try {
                  const opt = buildOption(params, projectId)
                  if (opt.validation.isValid) sweepOptions.push(opt)
                } catch {
                  // Skip invalid parameter combinations
                }
              }
            }
          }
        }
      }
    }
  }

  // Add optimized unit mix options for hotel projects (not residential estates)
  for (const form of ds.forms) {
    for (const area of ds.floorAreas) {
      for (const width of ds.wingWidths) {
        for (const storeys of ds.storeys) {
          const optimal = optimizeUnitMix(form, area, width, storeys, projectId)
          if (optimal) {
            try {
              const params: GenerationParams = {
                form, targetFloorArea: area, wingWidth: width,
                storeys, corridorType: ds.corridors[0],
                ytRooms: optimal.ytRooms, padUnits: optimal.padUnits,
                outdoorPosition: 'WEST' as const,
              }
              const opt = buildOption(params, projectId)
              if (opt.validation.isValid) sweepOptions.push(opt)
            } catch {
              // Skip invalid optimized combinations
            }
          }
        }
      }
    }
  }

  // Deduplicate sweep by output signature (form + keys + yt/pad split + storeys)
  const curatedSigs = new Set(curated.map(o =>
    `${o.form}-${o.metrics.totalKeys}-${o.metrics.yotelKeys}-${o.metrics.padUnits}-${Math.round(o.metrics.buildingHeight)}`
  ))
  const seen = new Set<string>(curatedSigs)
  const unique = sweepOptions.filter(o => {
    const sig = `${o.form}-${o.metrics.totalKeys}-${o.metrics.yotelKeys}-${o.metrics.padUnits}-${Math.round(o.metrics.buildingHeight)}`
    if (seen.has(sig)) return false
    seen.add(sig)
    return true
  })

  // Sort sweep by score descending
  unique.sort((a, b) => b.score - a.score)

  // Round-robin across form types to ensure diversity in sweep results
  const byForm = new Map<string, DesignOption[]>()
  for (const o of unique) {
    const arr = byForm.get(o.form) ?? []
    arr.push(o)
    byForm.set(o.form, arr)
  }

  const sweepResult: DesignOption[] = []
  const formIndices = new Map<string, number>()
  for (const form of ds.forms) formIndices.set(form, 0)

  const sweepLimit = maxOptions - curated.length
  let added = true
  while (sweepResult.length < sweepLimit && added) {
    added = false
    for (const form of ds.forms) {
      if (sweepResult.length >= sweepLimit) break
      const idx = formIndices.get(form)!
      const formOpts = byForm.get(form) ?? []
      if (idx < formOpts.length) {
        sweepResult.push(formOpts[idx])
        formIndices.set(form, idx + 1)
        added = true
      }
    }
  }

  // Sort sweep by score
  sweepResult.sort((a, b) => b.score - a.score)

  // Return curated first, then sweep
  return [...curated, ...sweepResult]
}

export function groupOptions(options: DesignOption[]): OptionGroups {
  const sorted = [...options]
  return {
    best_overall: sorted.slice(0, 5).map(o => o.id),
    most_rooms: [...sorted].sort((a, b) => b.metrics.totalKeys - a.metrics.totalKeys).slice(0, 3).map(o => o.id),
    lowest_height: [...sorted].sort((a, b) => a.metrics.buildingHeight - b.metrics.buildingHeight).slice(0, 3).map(o => o.id),
    best_views: [...sorted].sort((a, b) => b.metrics.westFacade - a.metrics.westFacade).slice(0, 3).map(o => o.id),
    lowest_cost: [...sorted].sort((a, b) => a.metrics.costPerKey - b.metrics.costPerKey).slice(0, 3).map(o => o.id),
    most_outdoor: [...sorted].sort((a, b) => b.metrics.outdoorTotal - a.metrics.outdoorTotal).slice(0, 3).map(o => o.id),
    most_efficient: [...sorted].sort((a, b) => a.metrics.giaPerKey - b.metrics.giaPerKey).slice(0, 3).map(o => o.id),
    pad_heavy: [...sorted].sort((a, b) => b.metrics.padUnits - a.metrics.padUnits).slice(0, 3).map(o => o.id),
  }
}
