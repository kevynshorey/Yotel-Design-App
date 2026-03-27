import type { RoomType } from '@/engine/types'

export const ABBEVILLE_UNITS: Record<string, RoomType> = {
  PadStudio:       { label: 'PAD Studio',     nia: 23, bayWidth: 3.67, bays: 1, pct: 0.20, color: '#2a5a8a' },
  Pad1Bed:         { label: 'PAD 1-Bed',       nia: 34, bayWidth: 4.80, bays: 1, pct: 0.33, color: '#3a6a9a' },
  Pad2Bed:         { label: 'PAD 2-Bed',       nia: 48, bayWidth: 6.50, bays: 2, pct: 0.27, color: '#4a7aaa' },
  PadAccessible:   { label: 'PAD Accessible',  nia: 27, bayWidth: 4.01, bays: 1, pct: 0.07, color: '#5a8aba' },
  Pad1BedLongStay: { label: 'PAD 1-Bed LS',   nia: 34, bayWidth: 4.80, bays: 1, pct: 0.13, color: '#6a9aca' },
}

export const PROGRAMME = {
  totalUnits: 60,
  towers: 4,
  unitsPerTower: 15,
  floorsPerTower: 5,
  unitsPerFloor: 3,
  groundFloorUse: 'AMENITY_RETAIL' as const,
  rooftop: false,
  towerFootprint: 147,
  coreArea: 23,
  corridorWidth: 1.6,
  stairsPerTower: 2,
  liftsPerTower: 2,
  floorToFloor: 3.2,
  groundFloorHeight: 4.5,
  buildingRotation: 30,
  podiumGIA: 786,
  poolDeck: 300,
  parking: 17,
} as const

export const FINANCIALS = {
  land: 2_750_000,
  hardCostPerM2Podium: 3200,
  hardCostPerM2Tower: 3800,
  softCostPct: 0.138,
  contingencyPct: 0.07,
  hurricaneSeismicUplift: 0.18,
  islandFactorsPct: 0.12,
  ffePerUnit: 20_000,
  mepPerM2: 395,
  gopMargin: 0.55,
  padStudioADR: 220,
  pad1BedADR: 295,
  pad2BedADR: 380,
  padAccessibleADR: 220,
  pad1BedLSMonthly: 6500,
  padOccupancy: 0.78,
  longStayOccupancy: 0.88,
  retailNNN: 54_000,
  otherIncome: 100_000,
  staffFTE: 10,
  ftePerKey: 0.17,
} as const
