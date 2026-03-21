import type { Wing, RoomType, RoomAllocation, Floor, FloorUse, CorridorType } from './types'
import { YOTEL_ROOMS, YOTELPAD_UNITS, PROGRAMME } from '@/config/programme'
import { CONSTRUCTION } from '@/config/construction'

const EXT_WALL = 0.4
const CORE_LENGTH = 5.5

export function roomsPerFloor(
  wings: Pick<Wing, 'length' | 'width' | 'direction'>[],
  corridorType: CorridorType,
  roomTypes: Record<string, RoomType>,
): number {
  const avgBayWidth = Object.values(roomTypes).reduce((s, r) => s + r.bayWidth * r.pct, 0)
  let total = 0
  for (const w of wings) {
    // Python rooms.py always uses wing["l"] (the long dimension) regardless of direction.
    // In our Wing type, `length` is always the long dimension.
    const usableLength = w.length - 2 * EXT_WALL - CORE_LENGTH
    const sides = corridorType === 'double_loaded' ? 2 : 1
    total += Math.floor((usableLength / avgBayWidth) * sides)
  }
  return total
}

export function makeFloorMix(
  totalPerFloor: number,
  roomTypes: Record<string, RoomType>,
): RoomAllocation[] {
  const types = Object.entries(roomTypes)
  const mix: RoomAllocation[] = []
  let remaining = totalPerFloor

  // Allocate by percentage using largest-remainder method
  const exactCounts = types.map(([name, rt]) => ({
    name,
    exact: totalPerFloor * rt.pct,
    floor: Math.floor(totalPerFloor * rt.pct),
    remainder: (totalPerFloor * rt.pct) % 1,
  }))

  for (const { name, floor } of exactCounts) {
    const rt = roomTypes[name]
    mix.push({ type: name, count: floor, nia: rt.nia })
    remaining -= floor
  }

  // Distribute remainder to types with largest fractional remainders
  const sorted = [...mix].map((m, i) => ({ m, remainder: exactCounts[i].remainder }))
    .sort((a, b) => b.remainder - a.remainder)
  for (let i = 0; remaining > 0; i++) {
    sorted[i % sorted.length].m.count++
    remaining--
  }

  return mix
}

export function buildFloorProgramme(params: {
  storeys: number
  ytPerFloor: number
  padPerFloor: number
  ytFloors: number[]
  padFloors: number[]
  footprint: number
}): Floor[] {
  const floors: Floor[] = []

  // Ground floor (level 0)
  floors.push({
    level: 0,
    use: 'FOH_BOH',
    rooms: [],
    gia: params.footprint,
  })

  // YOTEL floors
  for (const level of params.ytFloors) {
    floors.push({
      level,
      use: 'YOTEL',
      rooms: makeFloorMix(params.ytPerFloor, YOTEL_ROOMS),
      gia: params.footprint,
    })
  }

  // YOTELPAD floors
  for (const level of params.padFloors) {
    floors.push({
      level,
      use: 'YOTELPAD',
      rooms: makeFloorMix(params.padPerFloor, YOTELPAD_UNITS),
      gia: params.footprint,
    })
  }

  // Rooftop
  floors.push({
    level: params.storeys,
    use: 'ROOFTOP',
    rooms: [],
    gia: PROGRAMME.rooftop.gia,
  })

  return floors.sort((a, b) => a.level - b.level)
}
