import { describe, it, expect } from 'vitest'
import { roomsPerFloor, makeFloorMix, buildFloorProgramme } from '../rooms'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'

describe('roomsPerFloor', () => {
  it('calculates rooms for a dual-loaded EW wing', () => {
    const count = roomsPerFloor(
      [{ length: 55, width: 14, direction: 'EW' }],
      'double_loaded',
      YOTEL_ROOMS,
    )
    expect(count).toBeGreaterThan(20)
    expect(count).toBeLessThan(45)
  })
})

describe('makeFloorMix', () => {
  it('distributes 33 rooms by target percentages', () => {
    const mix = makeFloorMix(33, YOTEL_ROOMS)
    const total = mix.reduce((sum, r) => sum + r.count, 0)
    expect(total).toBe(33)
    expect(mix.find(r => r.type === 'Accessible')!.count).toBeGreaterThanOrEqual(3)
  })
})

describe('buildFloorProgramme', () => {
  it('builds complete floor stack for 100 YOTEL + 30 PAD', () => {
    const floors = buildFloorProgramme({
      storeys: 6,
      ytPerFloor: 33,
      padPerFloor: 15,
      ytFloors: [1, 2, 3],
      padFloors: [4, 5],
      footprint: 770,
    })
    expect(floors).toHaveLength(7) // G + 5 upper + rooftop
    expect(floors[0].use).toBe('FOH_BOH')
    expect(floors[1].use).toBe('YOTEL')
    expect(floors[4].use).toBe('YOTELPAD')
  })
})
