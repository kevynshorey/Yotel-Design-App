import type {
  GenerationParams, DesignOption, FormType, CorridorType,
  OutdoorPosition, OptionMetrics, OptionGroups,
} from './types'
import { generateForm } from './forms'
import { roomsPerFloor, buildFloorProgramme } from './rooms'
import { validate } from './validator'
import { scoreOption } from './scorer'
import { estimateCost } from './cost'
import { projectRevenue } from './revenue'
import { calculateAmenities } from './amenities'
import { SITE } from '@/config/site'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'
import { DEFAULT_WEIGHTS } from '@/config/scoring-weights'

const GROUND_H = 4.5
const FLOOR_H = 3.2

const DESIGN_SPACE = {
  forms: ['BAR', 'BAR_NS', 'L', 'U', 'C'] as FormType[],
  floorAreas: [650, 770, 900, 1050],
  wingWidths: [13.6, 14.0, 16.1],
  storeys: [5, 6, 7],
  corridors: ['double_loaded'] as CorridorType[],
  ytRooms: [80, 90, 100, 110],
  padUnits: [20, 25, 30, 35],
  outdoor: ['WEST'] as OutdoorPosition[],
}

let optionCounter = 0

export function buildOption(params: GenerationParams): DesignOption {
  const id = `opt-${++optionCounter}`

  // Generate form geometry
  const formResult = generateForm(params.form, params.targetFloorArea, params.wingWidth)

  // Assign storeys to wings
  const wings = formResult.wings.map(w => ({ ...w, floors: params.storeys }))

  // Calculate rooms per floor dynamically (per generator.py)
  const ytPerFloor = roomsPerFloor(wings, params.corridorType, YOTEL_ROOMS)
  const padPerFloor = roomsPerFloor(wings, params.corridorType, YOTELPAD_UNITS)

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
  })

  // Calculate metrics
  const totalGia = floors.reduce((sum, f) => sum + f.gia, 0)
  const totalKeys = actualYtRooms + actualPadUnits
  if (totalKeys < 50) throw new Error('Too few keys')
  const height = GROUND_H + (params.storeys - 1) * FLOOR_H
  const coverage = formResult.footprint / SITE.buildableArea
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

  // Validate
  const validation = validate(metrics, wings)

  // Score
  const [score, scoringBreakdown] = scoreOption(metrics, DEFAULT_WEIGHTS)

  return {
    id, form: params.form, params, wings, floors, metrics,
    amenities, cost, revenue, score, scoringBreakdown, validation,
  }
}

export function generateAll(maxOptions: number = 50): DesignOption[] {
  optionCounter = 0
  const options: DesignOption[] = []

  for (const form of DESIGN_SPACE.forms) {
    for (const area of DESIGN_SPACE.floorAreas) {
      for (const width of DESIGN_SPACE.wingWidths) {
        for (const storeys of DESIGN_SPACE.storeys) {
          for (const yt of DESIGN_SPACE.ytRooms) {
            for (const pad of DESIGN_SPACE.padUnits) {
              const params: GenerationParams = {
                form, targetFloorArea: area, wingWidth: width,
                storeys, corridorType: 'double_loaded',
                ytRooms: yt, padUnits: pad, outdoorPosition: 'WEST',
              }
              try {
                const opt = buildOption(params)
                if (opt.validation.isValid) options.push(opt)
              } catch {
                // Skip invalid parameter combinations
              }
            }
          }
        }
      }
    }
  }

  // Deduplicate by output signature (form + keys + yt/pad split + storeys)
  const seen = new Set<string>()
  const unique = options.filter(o => {
    const sig = `${o.form}-${o.metrics.totalKeys}-${o.metrics.yotelKeys}-${o.metrics.padUnits}-${Math.round(o.metrics.buildingHeight)}`
    if (seen.has(sig)) return false
    seen.add(sig)
    return true
  })

  // Sort by score descending
  unique.sort((a, b) => b.score - a.score)

  // Round-robin across form types to ensure diversity
  const byForm = new Map<string, DesignOption[]>()
  for (const o of unique) {
    const arr = byForm.get(o.form) ?? []
    arr.push(o)
    byForm.set(o.form, arr)
  }

  const result: DesignOption[] = []
  const formIndices = new Map<string, number>()
  for (const form of DESIGN_SPACE.forms) formIndices.set(form, 0)

  // Round-robin: pick one from each form, repeat until full
  let added = true
  while (result.length < maxOptions && added) {
    added = false
    for (const form of DESIGN_SPACE.forms) {
      if (result.length >= maxOptions) break
      const idx = formIndices.get(form)!
      const formOpts = byForm.get(form) ?? []
      if (idx < formOpts.length) {
        result.push(formOpts[idx])
        formIndices.set(form, idx + 1)
        added = true
      }
    }
  }

  // Final sort by score
  result.sort((a, b) => b.score - a.score)
  return result
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
