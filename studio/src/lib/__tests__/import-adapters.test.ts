import { describe, it, expect } from 'vitest'
import { parseIFCFootprint, parseDXFFootprint, parseDWG } from '../import-adapters'

describe('parseIFCFootprint', () => {
  it('extracts 2D coordinates from IFCCARTESIANPOINT', () => {
    const ifc = `
      #1=IFCCARTESIANPOINT((0.0,0.0));
      #2=IFCCARTESIANPOINT((10.0,0.0));
      #3=IFCCARTESIANPOINT((10.0,20.0));
      #4=IFCCARTESIANPOINT((0.0,20.0));
    `
    const result = parseIFCFootprint(ifc)

    expect(result.success).toBe(true)
    expect(result.points).toHaveLength(4)
    expect(result.points[0]).toEqual({ x: 0, y: 0 })
    expect(result.points[1]).toEqual({ x: 10, y: 0 })
    expect(result.points[2]).toEqual({ x: 10, y: 20 })
    expect(result.points[3]).toEqual({ x: 0, y: 20 })
  })

  it('handles 3D IFCCARTESIANPOINT (drops z)', () => {
    const ifc = `IFCCARTESIANPOINT((5.0,10.0,3.5));`
    const result = parseIFCFootprint(ifc)

    expect(result.success).toBe(true)
    expect(result.points).toHaveLength(1)
    expect(result.points[0]).toEqual({ x: 5, y: 10 })
  })

  it('deduplicates points within tolerance', () => {
    const ifc = `
      IFCCARTESIANPOINT((0.0,0.0));
      IFCCARTESIANPOINT((0.0001,0.0001));
      IFCCARTESIANPOINT((10.0,10.0));
    `
    const result = parseIFCFootprint(ifc)

    expect(result.success).toBe(true)
    expect(result.points).toHaveLength(2)
    expect(result.warnings.some((w) => w.includes('duplicate'))).toBe(true)
  })

  it('calculates bounding box', () => {
    const ifc = `
      IFCCARTESIANPOINT((5.0,10.0));
      IFCCARTESIANPOINT((15.0,30.0));
    `
    const result = parseIFCFootprint(ifc)

    expect(result.metadata.boundingBox).toBeDefined()
    expect(result.metadata.boundingBox!.minX).toBe(5)
    expect(result.metadata.boundingBox!.maxX).toBe(15)
    expect(result.metadata.boundingBox!.width).toBe(10)
    expect(result.metadata.boundingBox!.height).toBe(20)
  })

  it('returns failure for empty content', () => {
    const result = parseIFCFootprint('')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns failure for content without IFCCARTESIANPOINT', () => {
    const result = parseIFCFootprint('IFCPROJECT("test");')
    expect(result.success).toBe(false)
    expect(result.points).toHaveLength(0)
  })

  it('handles negative coordinates', () => {
    const ifc = `IFCCARTESIANPOINT((-10.5,-20.3));`
    const result = parseIFCFootprint(ifc)

    expect(result.success).toBe(true)
    expect(result.points[0]).toEqual({ x: -10.5, y: -20.3 })
  })

  it('handles scientific notation', () => {
    const ifc = `IFCCARTESIANPOINT((1.5e2,2.0E1));`
    const result = parseIFCFootprint(ifc)

    expect(result.success).toBe(true)
    expect(result.points[0]).toEqual({ x: 150, y: 20 })
  })
})

describe('parseDXFFootprint', () => {
  it('extracts coordinates from group code 10/20 pairs', () => {
    const dxf = [
      '10', '0.0',
      '20', '0.0',
      '10', '50.0',
      '20', '0.0',
      '10', '50.0',
      '20', '30.0',
    ].join('\n')

    const result = parseDXFFootprint(dxf)

    expect(result.success).toBe(true)
    expect(result.points).toHaveLength(3)
    expect(result.points[0]).toEqual({ x: 0, y: 0 })
    expect(result.points[1]).toEqual({ x: 50, y: 0 })
    expect(result.points[2]).toEqual({ x: 50, y: 30 })
  })

  it('handles Windows-style line endings', () => {
    const dxf = '10\r\n0.0\r\n20\r\n0.0\r\n10\r\n10.0\r\n20\r\n10.0'
    const result = parseDXFFootprint(dxf)

    expect(result.success).toBe(true)
    expect(result.points).toHaveLength(2)
  })

  it('returns failure for empty content', () => {
    const result = parseDXFFootprint('')
    expect(result.success).toBe(false)
  })

  it('returns failure for content without coordinate pairs', () => {
    const result = parseDXFFootprint('SECTION\nHEADER\nENDSEC')
    expect(result.success).toBe(false)
  })

  it('deduplicates coincident points', () => {
    const dxf = [
      '10', '5.0', '20', '10.0',
      '10', '5.0', '20', '10.0',
      '10', '15.0', '20', '20.0',
    ].join('\n')

    const result = parseDXFFootprint(dxf)
    expect(result.points).toHaveLength(2)
  })

  it('calculates bounding box', () => {
    const dxf = [
      '10', '0.0', '20', '0.0',
      '10', '100.0', '20', '50.0',
    ].join('\n')

    const result = parseDXFFootprint(dxf)
    expect(result.metadata.boundingBox).toBeDefined()
    expect(result.metadata.boundingBox!.width).toBe(100)
    expect(result.metadata.boundingBox!.height).toBe(50)
  })
})

describe('parseDWG', () => {
  it('returns failure with conversion instructions', () => {
    const result = parseDWG()

    expect(result.success).toBe(false)
    expect(result.metadata.format).toBe('DWG')
    expect(result.error).toContain('proprietary binary format')
    expect(result.error).toContain('Convert to DXF or IFC')
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})
