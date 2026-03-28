import { describe, expect, it } from 'vitest'
import { createDefaultLandUseZones, polygonAreaSqm, totalZoneAreaSqm } from '../land-use'

describe('land-use engine', () => {
  it('seeds default zones with polygon rings', () => {
    const zones = createDefaultLandUseZones()
    expect(zones.length).toBeGreaterThanOrEqual(5)
    for (const z of zones) {
      expect(z.polygons.length).toBeGreaterThanOrEqual(1)
      for (const ring of z.polygons) {
        expect(ring.length).toBeGreaterThanOrEqual(3)
      }
      expect(z.visible).toBe(true)
      expect(z.layerName).toBeTruthy()
      expect(z.category).toBeTruthy()
    }
  })

  it('polygonAreaSqm for unit square', () => {
    const sq = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]
    expect(polygonAreaSqm(sq)).toBeCloseTo(1, 5)
  })

  it('totalZoneAreaSqm sums rings', () => {
    const z = {
      id: 't',
      category: 'parking' as const,
      layerName: 'Test',
      polygons: [
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 },
        ],
        [
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 1 },
          { x: 2, y: 1 },
        ],
      ],
      color: '#000',
      visible: true,
    }
    expect(totalZoneAreaSqm(z)).toBeCloseTo(2, 5)
  })
})
