import type { RoomType } from '@/engine/types'

export const YOTEL_ROOMS: Record<string, RoomType> = {
  Premium:     { label: 'Premium Queen',  nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.61, color: '#2E8A76' },
  Twin:        { label: 'Premium Twin',   nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.18, color: '#3BA68E' },
  FirstClass:  { label: 'First Class',    nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.12, color: '#1D6B5A' },
  Accessible:  { label: 'Accessible',     nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.09, color: '#16a34a' },
}

export const YOTELPAD_UNITS: Record<string, RoomType> = {
  Studio:           { label: 'PAD Studio',     nia: 22.0, bayWidth: 3.67, bays: 1,   pct: 0.67, color: '#B8456A' },
  OneBed:           { label: 'PAD 1-Bedroom',  nia: 32.0, bayWidth: 5.07, bays: 1.5, pct: 0.20, color: '#A03B5C' },
  TwoBed:           { label: 'PAD 2-Bedroom',  nia: 48.0, bayWidth: 6.67, bays: 2,   pct: 0.07, color: '#8A3050' },
  AccessibleStudio: { label: 'PAD Accessible', nia: 27.0, bayWidth: 4.28, bays: 1.2, pct: 0.07, color: '#16a34a' },
}

export const PROGRAMME = {
  totalKeys: 130,
  yotelKeys: 100,
  yotelpadKeys: 30,
  groundFloor: { use: 'FOH_BOH' as const, gia: 770, rooms: 0 },
  yotelFloors: { floors: [1, 2, 3], roomsPerFloor: 33 },
  yotelpadFloors: { floors: [4, 5], unitsPerFloor: 15 },
  rooftop: { use: 'ROOFTOP' as const, gia: 80 },
} as const
