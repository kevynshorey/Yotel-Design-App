/** Simulation tool connectors — generates normalized payloads for
 *  Ladybug Tools, Honeybee, and IES Virtual Environment.
 *  Climate zone 1A (very hot, humid) per ASHRAE 169 for Barbados. */

import type { DesignOption, Wing } from '@/engine/types'

// ── Types ──────────────────────────────────────────────────────────────

export interface SimulationGeometry {
  footprint: number          // m²
  storeys: number
  floorToFloor: number       // m
  groundFloorHeight: number  // m
  totalHeight: number        // m
  wings: SimulationWing[]
}

export interface SimulationWing {
  id: string
  length: number    // m
  width: number     // m
  floors: number
  origin: { x: number; y: number; z: number }
  direction: 'EW' | 'NS'
}

export interface GlazingRatios {
  north: number
  south: number
  east: number
  west: number
}

export interface ClimateZone {
  ashrae: string
  koppen: string
  latitude: number
  longitude: number
  altitude: number
  epwFile: string
  designDayHeating: number    // °C
  designDayCooling: number    // °C
  annualMeanTemp: number      // °C
  annualRainfall: number      // mm
}

export interface SimulationPayload {
  projectName: string
  geometry: SimulationGeometry
  orientation: number          // degrees from north (0 = north-facing)
  glazingRatios: GlazingRatios
  climateZone: ClimateZone
  construction: ConstructionAssembly
  internalLoads: InternalLoads
  hvac: HvacSystem
  metadata: {
    generator: string
    version: string
    timestamp: string
    designOptionId: string
  }
}

export interface ConstructionAssembly {
  externalWallUValue: number   // W/m²K
  roofUValue: number
  floorUValue: number
  glazingUValue: number
  glazingSHGC: number          // Solar Heat Gain Coefficient
  wallSRI: number              // Solar Reflectance Index
  roofSRI: number
}

export interface InternalLoads {
  occupancyDensity: number     // m²/person
  lightingPowerDensity: number // W/m²
  equipmentPowerDensity: number // W/m²
  hotWaterDemand: number       // litres/person/day
}

export interface HvacSystem {
  type: string
  coolingCOP: number
  heatingCOP: number
  ventilationRate: number      // L/s/person
  heatRecovery: boolean
}

export interface LadybugScenario {
  type: 'ladybug'
  version: '1.6'
  model: {
    identifier: string
    rooms: LadybugRoom[]
    properties: {
      energy: {
        construction_sets: string[]
        program_types: string[]
        hvacs: string[]
      }
    }
  }
  simulation_parameter: {
    output: {
      report_defaults: boolean
    }
    simulation_control: {
      do_zone_sizing: boolean
      do_system_sizing: boolean
      do_plant_sizing: boolean
      run_for_sizing_periods: boolean
      run_for_run_periods: boolean
    }
  }
}

export interface LadybugRoom {
  identifier: string
  faces: LadybugFace[]
  properties: {
    energy: {
      program_type: string
      construction_set: string
    }
  }
}

export interface LadybugFace {
  identifier: string
  geometry: {
    boundary: number[][]
  }
  face_type: 'Wall' | 'Floor' | 'RoofCeiling'
  boundary_condition: 'Outdoors' | 'Ground' | 'Adiabatic'
}

// ── Climate Data ───────────────────────────────────────────────────────

const BARBADOS_CLIMATE: ClimateZone = {
  ashrae: '1A',
  koppen: 'Af',
  latitude: 13.1,
  longitude: -59.6,
  altitude: 5,
  epwFile: 'BGI_Barbados.130490_SWERA.epw',
  designDayHeating: 22.0,
  designDayCooling: 33.5,
  annualMeanTemp: 27.0,
  annualRainfall: 1400,
}

// ── Default Construction ───────────────────────────────────────────────

const TROPICAL_CONSTRUCTION: ConstructionAssembly = {
  externalWallUValue: 0.45,   // W/m²K — insulated RC with internal finish
  roofUValue: 0.30,           // W/m²K — insulated flat roof with cool coating
  floorUValue: 0.50,          // W/m²K — ground floor slab
  glazingUValue: 2.0,         // W/m²K — double-glazed low-e
  glazingSHGC: 0.25,          // low SHGC for tropical — heavy solar rejection
  wallSRI: 78,                // light-coloured render
  roofSRI: 82,                // cool roof coating (LEED requirement)
}

const TROPICAL_LOADS: InternalLoads = {
  occupancyDensity: 25,        // m²/person (hotel average)
  lightingPowerDensity: 10,    // W/m² (LED throughout)
  equipmentPowerDensity: 8,    // W/m² (hotel equipment)
  hotWaterDemand: 120,         // litres/person/day
}

const VRF_SYSTEM: HvacSystem = {
  type: 'VRF_with_DOAS',
  coolingCOP: 4.5,
  heatingCOP: 3.8,             // rarely used in Barbados
  ventilationRate: 10,          // L/s/person (ASHRAE 62.1)
  heatRecovery: true,
}

// ── Glazing Strategy ───────────────────────────────────────────────────

/** Optimised glazing ratios for Caribbean orientation.
 *  West limited due to late afternoon solar heat gain.
 *  North maximised for views (minimal direct sun at 13°N). */
const DEFAULT_GLAZING: GlazingRatios = {
  north: 0.40,
  south: 0.30,
  east: 0.25,
  west: 0.35,   // ocean-facing in Barbados — balanced views vs solar gain
}

// ── Payload Generator ──────────────────────────────────────────────────

export function generateSimulationPayload(option: DesignOption): SimulationPayload {
  const wings: SimulationWing[] = option.wings.map(wingToSimWing)

  const storeys = option.params.storeys
  const floorToFloor = 3.2
  const groundFloorHeight = 4.5
  const totalHeight = groundFloorHeight + (storeys - 1) * floorToFloor

  return {
    projectName: `YOTEL_Barbados_${option.id}`,
    geometry: {
      footprint: option.metrics.footprint,
      storeys,
      floorToFloor,
      groundFloorHeight,
      totalHeight,
      wings,
    },
    orientation: 0,   // north = 0°, site aligned to grid
    glazingRatios: DEFAULT_GLAZING,
    climateZone: BARBADOS_CLIMATE,
    construction: TROPICAL_CONSTRUCTION,
    internalLoads: TROPICAL_LOADS,
    hvac: VRF_SYSTEM,
    metadata: {
      generator: 'yotel-design-studio',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      designOptionId: option.id,
    },
  }
}

function wingToSimWing(wing: Wing): SimulationWing {
  return {
    id: wing.id,
    length: wing.length,
    width: wing.width,
    floors: wing.floors,
    origin: { x: wing.x, y: wing.y, z: 0 },
    direction: wing.direction,
  }
}

// ── Ladybug Mapper ─────────────────────────────────────────────────────

export function mapToLadybugScenario(payload: SimulationPayload): LadybugScenario {
  const rooms: LadybugRoom[] = payload.geometry.wings.flatMap((wing) =>
    generateRoomsForWing(wing, payload),
  )

  return {
    type: 'ladybug',
    version: '1.6',
    model: {
      identifier: payload.projectName,
      rooms,
      properties: {
        energy: {
          construction_sets: ['TropicalHotel_ConstructionSet'],
          program_types: ['Hotel_GuestRoom', 'Hotel_Corridor', 'Hotel_Lobby'],
          hvacs: ['VRF_DOAS_System'],
        },
      },
    },
    simulation_parameter: {
      output: {
        report_defaults: true,
      },
      simulation_control: {
        do_zone_sizing: true,
        do_system_sizing: true,
        do_plant_sizing: true,
        run_for_sizing_periods: true,
        run_for_run_periods: true,
      },
    },
  }
}

function generateRoomsForWing(
  wing: SimulationWing,
  payload: SimulationPayload,
): LadybugRoom[] {
  const rooms: LadybugRoom[] = []

  for (let floor = 0; floor < wing.floors; floor++) {
    const z = floor === 0
      ? 0
      : payload.geometry.groundFloorHeight + (floor - 1) * payload.geometry.floorToFloor

    const height = floor === 0
      ? payload.geometry.groundFloorHeight
      : payload.geometry.floorToFloor

    const x0 = wing.origin.x
    const y0 = wing.origin.y
    const x1 = x0 + wing.length
    const y1 = y0 + wing.width

    const floorBoundary = [
      [x0, y0, z],
      [x1, y0, z],
      [x1, y1, z],
      [x0, y1, z],
    ]

    const ceilingBoundary = [
      [x0, y0, z + height],
      [x1, y0, z + height],
      [x1, y1, z + height],
      [x0, y1, z + height],
    ]

    const programType = floor === 0 ? 'Hotel_Lobby' : 'Hotel_GuestRoom'

    rooms.push({
      identifier: `${wing.id}_F${floor}`,
      faces: [
        {
          identifier: `${wing.id}_F${floor}_floor`,
          geometry: { boundary: floorBoundary },
          face_type: 'Floor',
          boundary_condition: floor === 0 ? 'Ground' : 'Adiabatic',
        },
        {
          identifier: `${wing.id}_F${floor}_ceiling`,
          geometry: { boundary: ceilingBoundary },
          face_type: 'RoofCeiling',
          boundary_condition: floor === wing.floors - 1 ? 'Outdoors' : 'Adiabatic',
        },
      ],
      properties: {
        energy: {
          program_type: programType,
          construction_set: 'TropicalHotel_ConstructionSet',
        },
      },
    })
  }

  return rooms
}

// ── Exports for testing ────────────────────────────────────────────────

export {
  BARBADOS_CLIMATE,
  TROPICAL_CONSTRUCTION,
  TROPICAL_LOADS,
  VRF_SYSTEM,
  DEFAULT_GLAZING,
}
