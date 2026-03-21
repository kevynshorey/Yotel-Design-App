'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createRenderer, createCamera, createLights } from './scene-setup'
import { loadBasemapTiles, clearBasemapTiles } from './basemap'
import { addSiteOverlays } from './site-overlays'
import type { DesignOption, BasemapType } from '@/engine/types'

interface Viewer3DProps {
  selectedOption?: DesignOption | null
  className?: string
  onCameraChange?: (preset: string) => void
  activePreset?: string
  activeBasemap?: string
  showBoundaries?: boolean
  showAmenities?: boolean
  explodedView?: boolean
}

/** Building placement offset used across building + amenity groups. */
const BUILD_X = 65
const BUILD_Z = 9

/** Camera preset positions / targets */
const PRESET_CAMERAS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  '3D':       { position: [120, 80, 100],  target: [75, 0, 33] },
  'Plan':     { position: [75, 150, 33],   target: [75, 0, 33] },
  'South':    { position: [75, 30, -50],   target: [75, 15, 33] },
  'West':     { position: [-50, 30, 33],   target: [75, 15, 33] },
  'Overview': { position: [200, 120, 150], target: [60, 0, 30] },
}

/** Create amenity meshes (pool, rooftop, restaurant, palms) relative to building placement. */
function buildAmenities(buildingTopY: number): THREE.Group {
  const group = new THREE.Group()
  group.name = 'amenities'

  // ── Pool area (west / beach side of building) ──
  const poolGeo = new THREE.PlaneGeometry(20, 12)
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x00CED1,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  })
  const poolMesh = new THREE.Mesh(poolGeo, poolMat)
  poolMesh.rotation.x = -Math.PI / 2
  // West of building with 3m gap: BUILD_X - 10 (half pool width) - 3
  poolMesh.position.set(BUILD_X - 10 - 3, 0.02, BUILD_Z + 6)
  poolMesh.receiveShadow = true
  group.add(poolMesh)

  // ── Rooftop deck ──
  // Bar structure
  const barGeo = new THREE.BoxGeometry(6, 3, 3)
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xD4A050,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  })
  const barMesh = new THREE.Mesh(barGeo, barMat)
  barMesh.position.set(BUILD_X + 3, buildingTopY + 1.5, BUILD_Z + 2)
  barMesh.castShadow = true
  group.add(barMesh)

  // Sun loungers (rows of small thin boxes)
  const loungerGeo = new THREE.BoxGeometry(2, 0.15, 0.7)
  const loungerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  const loungerPositions = [
    [BUILD_X + 12, BUILD_Z + 2],
    [BUILD_X + 12, BUILD_Z + 4],
    [BUILD_X + 12, BUILD_Z + 6],
    [BUILD_X + 15, BUILD_Z + 2],
    [BUILD_X + 15, BUILD_Z + 4],
    [BUILD_X + 15, BUILD_Z + 6],
  ]
  for (const [lx, lz] of loungerPositions) {
    const lounger = new THREE.Mesh(loungerGeo, loungerMat)
    lounger.position.set(lx, buildingTopY + 0.075, lz)
    lounger.castShadow = true
    group.add(lounger)
  }

  // Rooftop pool
  const roofPoolGeo = new THREE.PlaneGeometry(8, 4)
  const roofPoolMat = new THREE.MeshStandardMaterial({
    color: 0x00CED1,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  })
  const roofPoolMesh = new THREE.Mesh(roofPoolGeo, roofPoolMat)
  roofPoolMesh.rotation.x = -Math.PI / 2
  roofPoolMesh.position.set(BUILD_X + 6, buildingTopY + 0.02, BUILD_Z + 10)
  group.add(roofPoolMesh)

  // ── Ground-level restaurant (adjacent to pool, west side) ──
  // Roof slab
  const restRoofGeo = new THREE.BoxGeometry(12, 0.3, 8)
  const restRoofMat = new THREE.MeshStandardMaterial({
    color: 0x8B6914,
    roughness: 0.8,
    metalness: 0.0,
    transparent: true,
    opacity: 0.7,
  })
  const restRoof = new THREE.Mesh(restRoofGeo, restRoofMat)
  restRoof.position.set(BUILD_X - 10 - 3, 4, BUILD_Z + 6 + 10)
  restRoof.castShadow = true
  group.add(restRoof)

  // Four support posts for the restaurant
  const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 4, 8)
  const postMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.6 })
  const postOffsets = [
    [-5.5, -3.5], [5.5, -3.5], [-5.5, 3.5], [5.5, 3.5],
  ]
  for (const [ox, oz] of postOffsets) {
    const post = new THREE.Mesh(postGeo, postMat)
    post.position.set(BUILD_X - 13 + ox, 2, BUILD_Z + 16 + oz)
    group.add(post)
  }

  // ── Palm trees around pool area ──
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 })
  const canopyGeo = new THREE.ConeGeometry(1, 8, 8)
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 })

  const treePositions = [
    [BUILD_X - 25, BUILD_Z - 2],
    [BUILD_X - 22, BUILD_Z + 14],
    [BUILD_X - 18, BUILD_Z - 4],
    [BUILD_X - 28, BUILD_Z + 6],
    [BUILD_X - 20, BUILD_Z + 20],
    [BUILD_X - 26, BUILD_Z + 18],
    [BUILD_X - 15, BUILD_Z + 22],
    [BUILD_X - 30, BUILD_Z + 10],
  ]
  for (const [tx, tz] of treePositions) {
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
}: Viewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const buildingGroupRef = useRef<THREE.Group | null>(null)
  const amenityGroupRef = useRef<THREE.Group | null>(null)
  /** Store original (non-exploded) Y positions for building meshes */
  const floorOriginalYRef = useRef<Map<THREE.Object3D, number>>(new Map())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB)
    sceneRef.current = scene

    const renderer = createRenderer(canvas)
    const camera = createCamera(canvas.clientWidth / canvas.clientHeight)
    cameraRef.current = camera
    createLights(scene)
    loadBasemapTiles(scene, 'Google')
    addSiteOverlays(scene)

    const buildingGroup = new THREE.Group()
    scene.add(buildingGroup)
    buildingGroupRef.current = buildingGroup

    const amenityGroup = new THREE.Group()
    scene.add(amenityGroup)
    amenityGroupRef.current = amenityGroup

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(75, 0, 33)
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
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
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
    const COLORS: Record<string, number> = {
      FOH_BOH: 0xD4B896,
      YOTEL: 0x1A6B5C,
      YOTELPAD: 0xC4756E,
      ROOFTOP: 0xE8DCC8,
    }

    const { wings } = selectedOption
    let maxBuildingY = 0

    for (const wing of wings) {
      let currentY = 0
      for (const floor of selectedOption.floors) {
        const h = floor.level === 0 ? GROUND_H : FLOOR_H
        const color = COLORS[floor.use] ?? 0xcccccc

        const geometry = new THREE.BoxGeometry(
          wing.direction === 'EW' ? wing.length : wing.width,
          h - 0.1,
          wing.direction === 'EW' ? wing.width : wing.length,
        )
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
        })
        const mesh = new THREE.Mesh(geometry, material)
        const yPos = currentY + h / 2
        mesh.position.set(
          wing.x + (wing.direction === 'EW' ? wing.length / 2 : wing.width / 2) + BUILD_X,
          yPos,
          wing.y + (wing.direction === 'EW' ? wing.width / 2 : wing.length / 2) + BUILD_Z,
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

    // Add amenities positioned relative to the building height
    const amenities = buildAmenities(maxBuildingY)
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
