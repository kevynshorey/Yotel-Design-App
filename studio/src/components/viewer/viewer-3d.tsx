'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createRenderer, createCamera, createLights } from './scene-setup'
import { loadBasemapTiles, clearBasemapTiles } from './basemap'
import { addSiteOverlays } from './site-overlays'
import { WalkthroughController } from './walkthrough'
import { CinematicController, getCinematicPath } from './cinematic'
import type { DesignOption, BasemapType } from '@/engine/types'

// ── Time-of-day types and presets ──────────────────────────────────
export type TimeOfDay = 'morning' | 'midday' | 'sunset' | 'night'

const LIGHTING_PRESETS: Record<TimeOfDay, {
  skyColor: number
  sunColor: number
  sunIntensity: number
  sunPosition: [number, number, number]
  ambientIntensity: number
  ambientColor: number
}> = {
  morning: {
    skyColor: 0xffd4a0,
    sunColor: 0xffcc88,
    sunIntensity: 1.2,
    sunPosition: [80, 30, -60],
    ambientIntensity: 0.5,
    ambientColor: 0xffeedd,
  },
  midday: {
    skyColor: 0x87CEEB,
    sunColor: 0xffffff,
    sunIntensity: 1.8,
    sunPosition: [10, 80, 0],
    ambientIntensity: 0.6,
    ambientColor: 0xf0f0ff,
  },
  sunset: {
    skyColor: 0xff6b35,
    sunColor: 0xff8844,
    sunIntensity: 1.0,
    sunPosition: [-80, 15, 20],
    ambientIntensity: 0.3,
    ambientColor: 0xff9966,
  },
  night: {
    skyColor: 0x0a0a2e,
    sunColor: 0x4466aa,
    sunIntensity: 0.3,
    sunPosition: [0, 60, 0],
    ambientIntensity: 0.15,
    ambientColor: 0x1a1a3e,
  },
}

// ── Upgraded materials ─────────────────────────────────────────────
const MATERIALS: Record<string, THREE.MeshStandardMaterial> = {
  FOH_BOH: new THREE.MeshStandardMaterial({
    color: 0xD4B896,
    roughness: 0.85,
    metalness: 0.05,
    transparent: true,
    opacity: 0.9,
  }),
  YOTEL: new THREE.MeshStandardMaterial({
    color: 0x1A6B5C,
    roughness: 0.3,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.5,
  }),
  YOTELPAD: new THREE.MeshStandardMaterial({
    color: 0xC4756E,
    roughness: 0.35,
    metalness: 0.35,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.5,
  }),
  ROOFTOP: new THREE.MeshStandardMaterial({
    color: 0xE8DCC8,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.8,
  }),
}

interface Viewer3DProps {
  selectedOption?: DesignOption | null
  className?: string
  onCameraChange?: (preset: string) => void
  activePreset?: string
  activeBasemap?: string
  showBoundaries?: boolean
  showAmenities?: boolean
  explodedView?: boolean
  walkthroughMode?: boolean
  cinematicMode?: boolean
  timeOfDay?: TimeOfDay
  onWalkthroughExit?: () => void
  onCinematicEnd?: () => void
}

/** Site centroid for centering — must match site-overlays.ts */
const SITE_CX = 75.52
const SITE_CY = 32.75

/** Building placement offset — aligns local wing coords (0,0) to the
 *  offset boundary origin, then centers on the basemap (world origin). */
const BUILD_X = 35.597 - SITE_CX   // buildableMinX centered
const BUILD_Z = -(8.403 - SITE_CY) // buildableMinY centered + negated for Three.js

/** Camera preset positions / targets — centered on origin */
const PRESET_CAMERAS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  '3D':       { position: [50, 60, 50],    target: [0, 0, 0] },
  'Plan':     { position: [0, 150, 0],     target: [0, 0, 0] },
  'South':    { position: [0, 30, 80],     target: [0, 15, 0] },
  'West':     { position: [-80, 30, 0],    target: [0, 15, 0] },
  'Overview': { position: [120, 100, 80],  target: [0, 0, 0] },
}

/** Create a text sprite label for 3D scene */
function makeLabel(text: string, color: number = 0xffffff, size: number = 256): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = size * 4
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.roundRect(0, 0, canvas.width, canvas.height, 16)
  ctx.fill()
  ctx.font = `bold ${Math.round(size * 0.35)}px sans-serif`
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(8, 2, 1)
  return sprite
}

/** Compute the 3D bounding box of all wings in the option.
 *  Returns { minX, maxX, minZ, maxZ } in Three.js world coordinates.
 *  In Three.js: +X = east, -Z = north. */
function computeWingBBox(wings: DesignOption['wings']): { minX: number; maxX: number; minZ: number; maxZ: number } {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (const wing of wings) {
    // Convert site coords to Three.js world coords
    const wx = BUILD_X + wing.x
    const wz = BUILD_Z - wing.y
    const eastExtent = wing.direction === 'EW' ? wing.length : wing.width
    const northExtent = wing.direction === 'EW' ? wing.width : wing.length
    minX = Math.min(minX, wx)
    maxX = Math.max(maxX, wx + eastExtent)
    // Z decreases going north, so south edge is the larger Z, north edge is smaller Z
    minZ = Math.min(minZ, wz - northExtent)
    maxZ = Math.max(maxZ, wz)
  }
  return { minX, maxX, minZ, maxZ }
}

/** Create amenity meshes — pool deck, amenity block, rooftop bar, restaurant, cabanas, palms.
 *  Positions are derived from the actual wing geometry of the selected option. */
function buildAmenities(option: DesignOption, buildingTopY: number, buildableWidth: number, buildableDepth: number): THREE.Group {
  const group = new THREE.Group()
  group.name = 'amenities'

  // Buildable area bounds in 3D coords
  const buildMinX = BUILD_X
  const buildMaxX = BUILD_X + buildableWidth
  const buildMaxZ = BUILD_Z  // south edge (Bay Street side)
  const buildMinZ = BUILD_Z - buildableDepth  // north edge

  // Wing bounding box in 3D world coords
  const bbox = computeWingBBox(option.wings)
  const bboxCenterX = (bbox.minX + bbox.maxX) / 2
  const bboxWidth = bbox.maxX - bbox.minX

  // ── Layout: west-to-east order: Bay Street (WEST) → Entrance → Amenity Block → Pool → Residential Block ──
  // BAY STREET IS TO THE WEST. Cars enter from the west.
  // ALL elements must be INSIDE the blue buildable boundary.

  // Gap and size constants
  const poolW = 18, poolD = 9
  const abW = 20, abD = 18, abH = 9  // amenity block: 20m E-W x 18m N-S
  const poolGap = 2

  // The residential block (wings) is positioned by the engine at the EAST side.
  // Amenity block goes WEST of the residential, pool between them.
  const bboxCenterZ_val = (bbox.minZ + bbox.maxZ) / 2

  // Amenity block: near the WEST edge of buildable area (Bay Street side)
  const abCenterX_raw = buildMinX + abW / 2 + 2  // 2m from west boundary
  const abCenterZ_raw = bboxCenterZ_val  // centered N-S with the building

  // Pool: between amenity block (west) and residential block (east)
  const poolCenterX_raw = abCenterX_raw + abW / 2 + poolGap + poolD / 2
  const poolCenterZ_raw = bboxCenterZ_val

  // Clamp ALL positions within buildable area
  const clampedAbX = Math.max(buildMinX + abW / 2 + 1, Math.min(buildMaxX - abW / 2 - 1, abCenterX_raw))
  const clampedAbZ = Math.max(buildMinZ + abD / 2 + 1, Math.min(buildMaxZ - abD / 2 - 1, abCenterZ_raw))
  let poolCenterX = Math.max(buildMinX + poolD / 2 + 1, Math.min(buildMaxX - poolD / 2 - 1, poolCenterX_raw))
  let poolCenterZ = Math.max(buildMinZ + poolW / 2 + 1, Math.min(buildMaxZ - poolW / 2 - 1, poolCenterZ_raw))

  // ── Amenity Block (2-storey, south of pool deck) ──
  const abGeo = new THREE.BoxGeometry(abW, abH, abD)
  const abMat = new THREE.MeshStandardMaterial({
    color: 0xC8B896, roughness: 0.7, metalness: 0.05, transparent: true, opacity: 0.85,
  })
  const abMesh = new THREE.Mesh(abGeo, abMat)
  abMesh.position.set(clampedAbX, abH / 2, clampedAbZ)
  abMesh.castShadow = true
  abMesh.receiveShadow = true
  group.add(abMesh)

  // Amenity block ground floor labels
  const gfLabels: Array<{ text: string; x: number; z: number; color: number }> = [
    { text: 'Mission Control', x: clampedAbX - 6, z: clampedAbZ - 6, color: 0x38bdf8 },
    { text: 'Restaurant & Bar', x: clampedAbX + 2, z: clampedAbZ - 6, color: 0x34d399 },
    { text: 'Grab & Go', x: clampedAbX + 8, z: clampedAbZ - 6, color: 0xa3e635 },
    { text: 'Komyuniti Lounge', x: clampedAbX - 6, z: clampedAbZ + 3, color: 0x38bdf8 },
    { text: 'Gym', x: clampedAbX + 6, z: clampedAbZ + 3, color: 0xfb7185 },
  ]
  for (const lbl of gfLabels) {
    const sprite = makeLabel(lbl.text, lbl.color, 192)
    sprite.position.set(lbl.x, 2.5, lbl.z)
    sprite.scale.set(6, 1.5, 1)
    group.add(sprite)
  }

  // Amenity block L1 labels (upper floor)
  const l1Labels: Array<{ text: string; x: number; z: number; color: number }> = [
    { text: 'Recording Studio', x: clampedAbX - 6, z: clampedAbZ - 5, color: 0xd946ef },
    { text: 'Podcast Studio', x: clampedAbX + 2, z: clampedAbZ - 5, color: 0xd946ef },
    { text: 'Sim Racing', x: clampedAbX - 6, z: clampedAbZ + 4, color: 0xa78bfa },
    { text: 'Business Centre', x: clampedAbX + 4, z: clampedAbZ + 4, color: 0x34d399 },
  ]
  for (const lbl of l1Labels) {
    const sprite = makeLabel(lbl.text, lbl.color, 192)
    sprite.position.set(lbl.x, 7, lbl.z)
    sprite.scale.set(6, 1.5, 1)
    group.add(sprite)
  }

  // Amenity block title
  const abTitle = makeLabel('AMENITY BLOCK', 0xffffff, 256)
  abTitle.position.set(clampedAbX, abH + 2, clampedAbZ)
  abTitle.scale.set(10, 2.5, 1)
  group.add(abTitle)

  // ── Central Pool Deck (between amenity block to west and residential block to east) ──
  // Pool oriented N-S (long axis 18m N-S, short axis 9m E-W)
  const poolGeo = new THREE.PlaneGeometry(poolD, poolW)  // 9m E-W x 18m N-S
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x00CED1, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  })
  const poolMesh = new THREE.Mesh(poolGeo, poolMat)
  poolMesh.rotation.x = -Math.PI / 2
  poolMesh.position.set(poolCenterX, 0.02, poolCenterZ)
  poolMesh.receiveShadow = true
  group.add(poolMesh)

  // Pool label
  const poolLabel = makeLabel('CENTRAL POOL', 0x00CED1, 192)
  poolLabel.position.set(poolCenterX, 2, poolCenterZ)
  group.add(poolLabel)

  // Pool deck surround (slightly larger than pool)
  const deckPadding = 4
  const deckGeo = new THREE.PlaneGeometry(poolW + deckPadding * 2, poolD + deckPadding * 2)
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0xD4C8A8, roughness: 0.9, metalness: 0, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
  })
  const deckMesh = new THREE.Mesh(deckGeo, deckMat)
  deckMesh.rotation.x = -Math.PI / 2
  deckMesh.position.set(poolCenterX, 0.01, poolCenterZ)
  deckMesh.receiveShadow = true
  group.add(deckMesh)

  // Swim-up bar (west side of pool)
  const swimBarGeo = new THREE.BoxGeometry(6, 1.2, 2)
  const swimBarMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.6, transparent: true, opacity: 0.8 })
  const swimBar = new THREE.Mesh(swimBarGeo, swimBarMat)
  swimBar.position.set(poolCenterX - poolW / 2 - 3, 0.6, poolCenterZ)
  group.add(swimBar)
  const swimLabel = makeLabel('Swim-up Bar', 0xfbbf24, 160)
  swimLabel.position.set(poolCenterX - poolW / 2 - 3, 2, poolCenterZ)
  swimLabel.scale.set(5, 1.2, 1)
  group.add(swimLabel)

  // Cabanas (5 along south edge of pool deck, within buildable area)
  const cabanaGeo = new THREE.BoxGeometry(3, 2.8, 3)
  const cabanaMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.8, transparent: true, opacity: 0.7 })
  const cabanaBaseZ = Math.min(poolCenterZ + poolW / 2 + 3, buildMaxZ - 2)  // south of pool, clamped
  for (let i = 0; i < 5; i++) {
    const cabana = new THREE.Mesh(cabanaGeo, cabanaMat)
    const cx = poolCenterX - 8 + i * 4
    // Only place if within buildable area
    if (cx > buildMinX + 2 && cx < buildMaxX - 2) {
      cabana.position.set(cx, 1.4, cabanaBaseZ)
      cabana.castShadow = true
      group.add(cabana)
    }
  }
  const cabanaLabel = makeLabel('Cabanas', 0xfb923c, 160)
  cabanaLabel.position.set(poolCenterX, 3.5, cabanaBaseZ)
  cabanaLabel.scale.set(5, 1.2, 1)
  group.add(cabanaLabel)

  // Sun loungers (around pool, east and west sides)
  const loungerGeo = new THREE.BoxGeometry(2, 0.15, 0.7)
  const loungerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  const loungerWestX = poolCenterX - poolW / 2 - 2
  const loungerEastX = poolCenterX + poolW / 2 + 2
  const loungerPositions = [
    [loungerEastX, poolCenterZ - 3], [loungerEastX, poolCenterZ - 1], [loungerEastX, poolCenterZ + 1], [loungerEastX, poolCenterZ + 3],
    [loungerWestX, poolCenterZ - 3], [loungerWestX, poolCenterZ - 1], [loungerWestX, poolCenterZ + 1], [loungerWestX, poolCenterZ + 3],
  ]
  for (const [lx, lz] of loungerPositions) {
    const lounger = new THREE.Mesh(loungerGeo, loungerMat)
    lounger.position.set(lx, 0.075, lz)
    lounger.castShadow = true
    group.add(lounger)
  }

  // ── Rooftop amenities — placed WITHIN the wing footprint bounding box ──
  const roofCenterX = bboxCenterX
  const roofCenterZ = (bbox.minZ + bbox.maxZ) / 2
  const roofW = bbox.maxX - bbox.minX
  const roofD = bbox.maxZ - bbox.minZ

  // Rooftop Bar & Lounge (west edge for sunset views)
  const barGeo = new THREE.BoxGeometry(8, 3, 4)
  const barMat = new THREE.MeshStandardMaterial({ color: 0xD4A050, roughness: 0.5, metalness: 0.1, transparent: true, opacity: 0.85 })
  const barMesh = new THREE.Mesh(barGeo, barMat)
  barMesh.position.set(bbox.minX + 5, buildingTopY + 1.5, roofCenterZ)
  barMesh.castShadow = true
  group.add(barMesh)
  const roofBarLabel = makeLabel('Rooftop Bar & Lounge', 0xfbbf24, 256)
  roofBarLabel.position.set(bbox.minX + 5, buildingTopY + 4, roofCenterZ)
  group.add(roofBarLabel)

  // Rooftop DJ booth (center of roof)
  const djGeo = new THREE.BoxGeometry(3, 2.5, 3)
  const djMat = new THREE.MeshStandardMaterial({ color: 0x6B21A8, roughness: 0.4, transparent: true, opacity: 0.8 })
  const djMesh = new THREE.Mesh(djGeo, djMat)
  djMesh.position.set(roofCenterX, buildingTopY + 1.25, roofCenterZ)
  group.add(djMesh)
  const djLabel = makeLabel('DJ Booth', 0xa78bfa, 160)
  djLabel.position.set(roofCenterX, buildingTopY + 3.5, roofCenterZ)
  djLabel.scale.set(5, 1.2, 1)
  group.add(djLabel)

  // Rooftop grill kitchen (east side of roof)
  const grillGeo = new THREE.BoxGeometry(5, 2.8, 4)
  const grillMat = new THREE.MeshStandardMaterial({ color: 0x7C3AED, roughness: 0.5, transparent: true, opacity: 0.7 })
  const grillMesh = new THREE.Mesh(grillGeo, grillMat)
  grillMesh.position.set(bbox.maxX - 4, buildingTopY + 1.4, roofCenterZ)
  group.add(grillMesh)
  const grillLabel = makeLabel('Grill Kitchen', 0xfbbf24, 160)
  grillLabel.position.set(bbox.maxX - 4, buildingTopY + 3.5, roofCenterZ)
  grillLabel.scale.set(5, 1.2, 1)
  group.add(grillLabel)

  // Rooftop raised pool (6m x 3m, within wing footprint)
  const roofPoolGeo = new THREE.PlaneGeometry(6, 3)
  const roofPoolMat = new THREE.MeshStandardMaterial({
    color: 0x00CED1, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  })
  const roofPoolMesh = new THREE.Mesh(roofPoolGeo, roofPoolMat)
  roofPoolMesh.rotation.x = -Math.PI / 2
  roofPoolMesh.position.set(roofCenterX, buildingTopY + 0.02, bbox.minZ + roofD * 0.3)
  group.add(roofPoolMesh)
  const rpLabel = makeLabel('Raised Pool', 0x00CED1, 160)
  rpLabel.position.set(roofCenterX, buildingTopY + 1.5, bbox.minZ + roofD * 0.3)
  rpLabel.scale.set(5, 1.2, 1)
  group.add(rpLabel)

  // Rooftop loungers (east side of roof, near raised pool)
  const roofLoungerBaseX = bbox.maxX - 3
  const roofLoungerBaseZ = bbox.minZ + roofD * 0.3
  const roofLoungerPositions = [
    [roofLoungerBaseX, roofLoungerBaseZ - 2], [roofLoungerBaseX, roofLoungerBaseZ], [roofLoungerBaseX, roofLoungerBaseZ + 2],
    [roofLoungerBaseX - 3, roofLoungerBaseZ - 2], [roofLoungerBaseX - 3, roofLoungerBaseZ], [roofLoungerBaseX - 3, roofLoungerBaseZ + 2],
  ]
  for (const [lx, lz] of roofLoungerPositions) {
    const lounger = new THREE.Mesh(loungerGeo, loungerMat)
    lounger.position.set(lx, buildingTopY + 0.075, lz)
    lounger.castShadow = true
    group.add(lounger)
  }

  // ── Bay Street Entrance (WEST edge — Bay Street runs along the west boundary) ──
  const entranceGeo = new THREE.BoxGeometry(2, 4, 8)  // narrow E-W, wide N-S
  const entranceMat = new THREE.MeshStandardMaterial({ color: 0xD4B896, roughness: 0.7, transparent: true, opacity: 0.8 })
  const entrance = new THREE.Mesh(entranceGeo, entranceMat)
  const entranceX = buildMinX - 4  // WEST of blue buildable line, in the setback strip
  const entranceZ = clampedAbZ  // centered on amenity block
  entrance.position.set(entranceX, 2, entranceZ)
  entrance.castShadow = true
  group.add(entrance)
  const entrLabel = makeLabel('Bay Street Entrance', 0xfbbf24, 256)
  entrLabel.position.set(entranceX, 5, entranceZ)
  group.add(entrLabel)

  // Parking courts OUTSIDE buildable area but INSIDE site boundary (red line)
  // Parking sits west of the blue buildable boundary, flanking the Bay Street entrance
  const parkingX = buildMinX - 8  // 8m west of blue boundary (in the setback strip)
  const parkGeo = new THREE.PlaneGeometry(12, 10)  // 12m E-W x 10m N-S
  const parkMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
  const parkN = new THREE.Mesh(parkGeo, parkMat)
  parkN.rotation.x = -Math.PI / 2
  parkN.position.set(parkingX, 0.01, entranceZ - 10)  // north of entrance, outside blue
  group.add(parkN)
  const parkS = new THREE.Mesh(parkGeo, parkMat)
  parkS.rotation.x = -Math.PI / 2
  parkS.position.set(parkingX, 0.01, entranceZ + 10)  // south of entrance, outside blue
  group.add(parkS)
  const parkNLabel = makeLabel('Parking', 0x94a3b8, 128)
  parkNLabel.position.set(parkingX, 1.5, entranceZ - 10)
  parkNLabel.scale.set(4, 1, 1)
  group.add(parkNLabel)
  const parkSLabel = makeLabel('Parking', 0x94a3b8, 128)
  parkSLabel.position.set(parkingX, 1.5, entranceZ + 10)
  parkSLabel.scale.set(4, 1, 1)
  group.add(parkSLabel)

  // ── Palm trees (landscaping — within buildable area, outside building footprints) ──
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 })
  const canopyGeo = new THREE.ConeGeometry(1, 8, 8)
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 })

  // Place trees along boundaries and between buildings, within buildable area
  const treePositions = [
    // West boundary line
    [buildMinX + 2, buildMaxZ - 5], [buildMinX + 2, buildMaxZ - 15],
    [buildMinX + 2, buildMinZ + 10], [buildMinX + 2, buildMinZ + 20],
    // East boundary line
    [buildMaxX - 2, buildMaxZ - 5], [buildMaxX - 2, buildMaxZ - 15],
    [buildMaxX - 2, buildMinZ + 10], [buildMaxX - 2, buildMinZ + 20],
    // North boundary line
    [bboxCenterX - 15, buildMinZ + 2], [bboxCenterX + 15, buildMinZ + 2],
    // Around pool deck and amenity block
    [poolCenterX + poolW / 2 + deckPadding + 6, poolCenterZ - 4],
    [poolCenterX + poolW / 2 + deckPadding + 6, poolCenterZ + 4],
    [poolCenterX - poolW / 2 - deckPadding - 6, poolCenterZ - 4],
    [poolCenterX - poolW / 2 - deckPadding - 6, poolCenterZ + 4],
  ]
  for (const [tx, tz] of treePositions) {
    // Skip trees outside buildable area
    if (tx < buildMinX || tx > buildMaxX || tz < buildMinZ || tz > buildMaxZ) continue
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.set(tx, 2.5, tz)
    trunk.castShadow = true
    group.add(trunk)

    const canopy = new THREE.Mesh(canopyGeo, canopyMat)
    canopy.position.set(tx, 5 + 4, tz)
    canopy.castShadow = true
    group.add(canopy)
  }

  return group
}

export function Viewer3D({
  selectedOption,
  className,
  activePreset = '3D',
  activeBasemap = 'Google',
  showBoundaries = true,
  showAmenities = true,
  explodedView = false,
  walkthroughMode = false,
  cinematicMode = false,
  timeOfDay = 'midday',
  onWalkthroughExit,
  onCinematicEnd,
}: Viewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const buildingGroupRef = useRef<THREE.Group | null>(null)
  const amenityGroupRef = useRef<THREE.Group | null>(null)
  const walkthroughRef = useRef<WalkthroughController | null>(null)
  const cinematicRef = useRef<CinematicController | null>(null)
  /** Store original (non-exploded) Y positions for building meshes */
  const floorOriginalYRef = useRef<Map<THREE.Object3D, number>>(new Map())

  // Stable callback refs so we can use them inside animate loop
  const onWalkthroughExitRef = useRef(onWalkthroughExit)
  onWalkthroughExitRef.current = onWalkthroughExit
  const onCinematicEndRef = useRef(onCinematicEnd)
  onCinematicEndRef.current = onCinematicEnd

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB)
    sceneRef.current = scene

    const renderer = createRenderer(canvas)
    rendererRef.current = renderer
    const camera = createCamera(canvas.clientWidth / canvas.clientHeight)
    cameraRef.current = camera
    createLights(scene)

    // Create a simple gradient environment map for glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x87CEEB)
    const envMap = pmremGenerator.fromScene(envScene).texture
    scene.environment = envMap
    pmremGenerator.dispose()

    loadBasemapTiles(scene, 'Google')
    addSiteOverlays(scene)

    const buildingGroup = new THREE.Group()
    scene.add(buildingGroup)
    buildingGroupRef.current = buildingGroup

    const amenityGroup = new THREE.Group()
    scene.add(amenityGroup)
    amenityGroupRef.current = amenityGroup

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(75, 0, 30)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.maxPolarAngle = Math.PI / 2.1
    controlsRef.current = controls

    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(canvas)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    let frameId: number
    function animate() {
      frameId = requestAnimationFrame(animate)

      // Update active controller
      if (walkthroughRef.current?.enabled) {
        walkthroughRef.current.update()
      } else if (cinematicRef.current?.isPlaying) {
        cinematicRef.current.update()
      } else {
        controls.update()
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      // Clean up walkthrough/cinematic if still active
      walkthroughRef.current?.disable()
      cinematicRef.current?.stop()
    }
  }, [])

  // ── Camera preset changes ──
  useEffect(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    const preset = PRESET_CAMERAS[activePreset]
    if (!preset) return

    camera.position.set(...preset.position)
    controls.target.set(...preset.target)
    controls.update()
  }, [activePreset])

  // ── Basemap changes ──
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    clearBasemapTiles(scene)
    if (activeBasemap !== 'None') {
      loadBasemapTiles(scene, activeBasemap as BasemapType)
    }
  }, [activeBasemap])

  // ── Boundary visibility ──
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    for (const child of scene.children) {
      if (child instanceof THREE.Line) {
        child.visible = showBoundaries
      }
    }
  }, [showBoundaries])

  // ── Amenity visibility ──
  useEffect(() => {
    const group = amenityGroupRef.current
    if (!group) return
    group.visible = showAmenities
  }, [showAmenities])

  // ── Exploded view ──
  useEffect(() => {
    const group = buildingGroupRef.current
    if (!group) return

    const originals = floorOriginalYRef.current

    for (const child of group.children) {
      const origY = originals.get(child)
      if (origY === undefined) continue

      if (explodedView) {
        child.position.y = origY * 1.5
      } else {
        child.position.y = origY
      }
    }
  }, [explodedView])

  // ── Walkthrough mode ──
  useEffect(() => {
    const camera = cameraRef.current
    const canvas = canvasRef.current
    const controls = controlsRef.current
    if (!camera || !canvas || !controls) return

    if (walkthroughMode) {
      // Disable orbit controls and cinematic
      controls.enabled = false
      cinematicRef.current?.stop()

      const wt = new WalkthroughController(camera, canvas)
      // Start at pool deck area
      const startPos = new THREE.Vector3(BUILD_X - 10, 0, BUILD_Z + 6)
      wt.enable(startPos)
      walkthroughRef.current = wt

      // ESC exits walkthrough
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onWalkthroughExitRef.current?.()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.removeEventListener('keydown', handleEsc)
      }
    } else {
      // Exiting walkthrough mode
      walkthroughRef.current?.disable()
      walkthroughRef.current = null
      controls.enabled = true
    }
  }, [walkthroughMode])

  // ── Cinematic mode ──
  useEffect(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    if (cinematicMode) {
      // Disable orbit controls and walkthrough
      controls.enabled = false
      walkthroughRef.current?.disable()

      const center = new THREE.Vector3(BUILD_X + 20, 0, BUILD_Z + 10)
      const keyframes = getCinematicPath(center)
      const cc = new CinematicController(camera, keyframes)
      cc.onComplete = () => {
        onCinematicEndRef.current?.()
      }
      cc.play()
      cinematicRef.current = cc
    } else {
      // Exiting cinematic mode
      cinematicRef.current?.stop()
      cinematicRef.current = null
      controls.enabled = true
    }
  }, [cinematicMode])

  // ── Time of day ──
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const preset = LIGHTING_PRESETS[timeOfDay]
    if (!preset) return

    // Update scene background
    scene.background = new THREE.Color(preset.skyColor)

    // Find and update lights
    for (const child of scene.children) {
      if (child instanceof THREE.AmbientLight) {
        child.color.setHex(preset.ambientColor)
        child.intensity = preset.ambientIntensity
      } else if (child instanceof THREE.DirectionalLight) {
        child.color.setHex(preset.sunColor)
        child.intensity = preset.sunIntensity
        child.position.set(...preset.sunPosition)
      } else if (child instanceof THREE.HemisphereLight) {
        child.color.setHex(preset.skyColor)
        child.intensity = preset.ambientIntensity * 0.8
      }
    }
  }, [timeOfDay])

  // ── Rebuild building geometry when selectedOption changes ──
  useEffect(() => {
    const group = buildingGroupRef.current
    const amenityGroup = amenityGroupRef.current
    if (!group || !amenityGroup) return

    while (group.children.length) group.remove(group.children[0])
    while (amenityGroup.children.length) amenityGroup.remove(amenityGroup.children[0])
    floorOriginalYRef.current.clear()

    if (!selectedOption) return

    const GROUND_H = 4.5
    const FLOOR_H = 3.2

    const { wings } = selectedOption
    let maxBuildingY = 0

    for (const wing of wings) {
      let currentY = 0
      for (const floor of selectedOption.floors) {
        const h = floor.level === 0 ? GROUND_H : FLOOR_H
        const mat = MATERIALS[floor.use]?.clone() ?? new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          roughness: 0.7,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
        })

        const geoH = h - 0.1
        const geometry = new THREE.BoxGeometry(
          wing.direction === 'EW' ? wing.length : wing.width,
          geoH,
          wing.direction === 'EW' ? wing.width : wing.length,
        )
        const mesh = new THREE.Mesh(geometry, mat)
        const yPos = currentY + geoH / 2
        mesh.position.set(
          wing.x + (wing.direction === 'EW' ? wing.length / 2 : wing.width / 2) + BUILD_X,
          yPos,
          -(wing.y + (wing.direction === 'EW' ? wing.width / 2 : wing.length / 2)) + BUILD_Z,
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        group.add(mesh)
        floorOriginalYRef.current.set(mesh, yPos)

        const edges = new THREE.EdgesGeometry(geometry)
        const lineMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.3 })
        const wireframe = new THREE.LineSegments(edges, lineMat)
        wireframe.position.copy(mesh.position)
        group.add(wireframe)
        floorOriginalYRef.current.set(wireframe, yPos)

        currentY += h
      }
      if (currentY > maxBuildingY) maxBuildingY = currentY
    }

    // Add amenities positioned relative to actual wing geometry and building height
    const amenities = buildAmenities(selectedOption, maxBuildingY, 79.84, 48.69)
    amenityGroup.add(amenities)

    // Re-apply amenity visibility
    amenityGroup.visible = showAmenities
  }, [selectedOption, showAmenities])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
