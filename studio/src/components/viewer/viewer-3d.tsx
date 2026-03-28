'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createRenderer, createCamera, createLights } from './scene-setup'
import { loadBasemapTiles, clearBasemapTiles } from './basemap'
import { addSiteOverlays } from './site-overlays'
import { WalkthroughController } from './walkthrough'
import { CinematicController, getCinematicPath } from './cinematic'
import type { DesignOption, BasemapType, ProjectId } from '@/engine/types'
import { computeSiteLayout } from '@/engine/site-layout'
import { computeAbbevilleSiteLayout } from '@/engine/abbeville-site-layout'
import type { PlacedElement, SiteConfig } from '@/engine/site-layout'
import { SITE } from '@/config/site'
import { getViewerSiteConfig } from './project-site-config'
import { getLayoutOverrides, LAYOUT_CHANGED_EVENT } from '@/store/layout-store'

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
  projectId?: ProjectId
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

/** Create a label with a smaller rationale subtitle below it */
function makeLabelWithSubtitle(
  title: string,
  subtitle: string,
  color: number = 0xffffff,
  size: number = 256,
): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = size * 5
  canvas.height = size * 1.6
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.roundRect(0, 0, canvas.width, canvas.height, 16)
  ctx.fill()
  // Title
  ctx.font = `bold ${Math.round(size * 0.32)}px sans-serif`
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, canvas.width / 2, canvas.height * 0.35)
  // Subtitle (rationale) — smaller, muted
  ctx.font = `${Math.round(size * 0.18)}px sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  // Truncate long rationales
  const maxChars = 60
  const truncated = subtitle.length > maxChars ? subtitle.slice(0, maxChars - 3) + '...' : subtitle
  ctx.fillText(truncated, canvas.width / 2, canvas.height * 0.65)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(10, 3.2, 1)
  return sprite
}

/** Compute the 3D bounding box of all wings in the option.
 *  Returns { minX, maxX, minZ, maxZ } in Three.js world coordinates.
 *  In Three.js: +X = east, -Z = north. */
function computeWingBBox(wings: DesignOption['wings'], pid?: ProjectId): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const vc = getViewerSiteConfig(pid)
  const bx = vc.buildableMinX - vc.centroidX
  const bz = -(vc.buildableMinY - vc.centroidY)
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (const wing of wings) {
    // Convert site coords to Three.js world coords
    const wx = bx + wing.x
    const wz = bz - wing.y
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

/** Colour palette for engine-placed element types */
const ELEMENT_COLORS: Record<PlacedElement['type'], number> = {
  entrance: 0xD4B896,
  parking: 0x4a5568,
  amenity_block: 0xC8B896,
  pool: 0x00CED1,
  pool_deck: 0xD4C8A8,
  cabana: 0x8B6914,
  lounger_zone: 0xffffff,
  swim_up_bar: 0x8B6914,
  landscape: 0x228B22,
  tree: 0x228B22,
  path: 0x9CA3AF,
  service_yard: 0x64748b,
}

/** Build the SiteConfig required by computeSiteLayout — project-aware. */
function buildSiteConfig(pid?: ProjectId): SiteConfig {
  const vc = getViewerSiteConfig(pid)
  return {
    grossArea: vc.grossArea,
    buildableAreaSqm: vc.buildableArea,
    maxCoverage: vc.maxCoverage,
    maxHeight: vc.maxHeight,
    buildableEW: vc.buildableEW,
    buildableNS: vc.buildableNS,
    buildableMinX: vc.buildableMinX,
    buildableMaxX: vc.buildableMaxX,
    buildableMinY: vc.buildableMinY,
    buildableMaxY: vc.buildableMaxY,
    beachSide: vc.beachSide as 'W' | 'E' | 'N' | 'S',
  }
}

/**
 * Convert engine site-local coordinates to Three.js world coordinates.
 * Uses project-specific centroid and buildable origin.
 */
function siteToWorld(engineX: number, engineY: number, pid?: ProjectId): { wx: number; wz: number } {
  const vc = getViewerSiteConfig(pid)
  return {
    wx: vc.buildableMinX + engineX - vc.centroidX,
    wz: -(vc.buildableMinY + engineY - vc.centroidY),
  }
}

/**
 * Apply layout overrides from the interactive planner to the engine layout.
 * - Modified elements replace engine elements with matching IDs
 * - Added elements are appended
 * - Removed elements are filtered out
 */
function applyOverridesToLayout(engineElements: PlacedElement[]): PlacedElement[] {
  const overrides = getLayoutOverrides()
  const { modified, added, removedIds } = overrides

  // Nothing to do if there are no overrides
  if (modified.length === 0 && added.length === 0 && removedIds.length === 0) {
    return engineElements
  }

  const removedSet = new Set(removedIds)
  const modifiedMap = new Map(modified.map((el) => [el.id, el]))

  // Filter out removed, replace modified
  const merged = engineElements
    .filter((el) => !removedSet.has(el.id))
    .map((el) => modifiedMap.get(el.id) ?? el)

  // Append user-added elements
  return [...merged, ...added]
}

/** Create amenity meshes from the architectural reasoning engine.
 *  ALL placement decisions come from computeSiteLayout — no hardcoded positions.
 *  If layout overrides exist (from the interactive planner), they are merged in. */
function buildAmenitiesFromLayout(option: DesignOption, buildingTopY: number, projectId?: ProjectId): THREE.Group {
  const group = new THREE.Group()
  group.name = 'amenities'

  const siteConfig = buildSiteConfig(projectId)
  // Use project-specific layout engine
  const layout = projectId === 'abbeville'
    ? computeAbbevilleSiteLayout(option)
    : computeSiteLayout(option, siteConfig)

  // Merge in any overrides from the interactive planner
  layout.elements = applyOverridesToLayout(layout.elements)

  // Shared geometries for trees
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 })
  const canopyGeo = new THREE.ConeGeometry(1, 8, 8)
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 })

  for (const el of layout.elements) {
    const { wx, wz } = siteToWorld(el.x, el.y, projectId)
    const elColor = ELEMENT_COLORS[el.type] ?? 0xcccccc
    const w = el.width   // EW dimension
    const d = el.depth    // NS dimension
    const h = el.height ?? 0
    const isRoof = el.floor === 'roof'

    // Centre of the element in world coords (engine x,y is the SW corner)
    const centerWx = wx + w / 2
    const centerWz = wz - d / 2  // -Z = north, so moving north means subtracting

    // ── Special case: trees get trunk + canopy ──
    if (el.type === 'tree') {
      const treeH = h || 8
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.set(centerWx, treeH / 2 - 1.5, centerWz)
      trunk.castShadow = true
      group.add(trunk)

      const canopy = new THREE.Mesh(canopyGeo, canopyMat)
      canopy.position.set(centerWx, treeH, centerWz)
      canopy.castShadow = true
      group.add(canopy)

      // Label
      const label = makeLabelWithSubtitle(el.label, el.rationale, 0x228B22, 192)
      label.position.set(centerWx, treeH + 3, centerWz)
      group.add(label)
      continue
    }

    // ── Flat elements (height === 0 or undefined): rendered as planes ──
    if (!h || h === 0) {
      const geo = new THREE.PlaneGeometry(w, d)
      const mat = new THREE.MeshStandardMaterial({
        color: elColor,
        roughness: el.type === 'pool' ? 0.3 : 0.9,
        metalness: el.type === 'pool' ? 0.1 : 0,
        transparent: true,
        opacity: el.type === 'pool' ? 0.85 : 0.6,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2

      // Apply element rotation if specified
      if (el.rotation) {
        mesh.rotation.z = (el.rotation * Math.PI) / 180
      }

      const baseY = isRoof ? buildingTopY + 0.02 : 0.01
      mesh.position.set(centerWx, baseY, centerWz)
      mesh.receiveShadow = true
      group.add(mesh)

      // Label
      const labelColor = el.type === 'pool' ? 0x00CED1
        : el.type === 'parking' ? 0x94a3b8
        : el.type === 'lounger_zone' ? 0xffffff
        : 0xfbbf24
      const label = makeLabelWithSubtitle(el.label, el.rationale, labelColor, 192)
      const labelY = isRoof ? buildingTopY + 1.5 : 1.5
      label.position.set(centerWx, labelY, centerWz)
      group.add(label)
      continue
    }

    // ── Box elements (height > 0): rendered as boxes ──
    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshStandardMaterial({
      color: elColor,
      roughness: el.type === 'pool' ? 0.2 : 0.7,
      metalness: el.type === 'pool' ? 0.1 : 0.05,
      transparent: true,
      opacity: 0.85,
    })
    const mesh = new THREE.Mesh(geo, mat)

    // Apply element rotation if specified
    if (el.rotation) {
      mesh.rotation.y = (el.rotation * Math.PI) / 180
    }

    const baseY = isRoof ? buildingTopY + h / 2 : h / 2
    mesh.position.set(centerWx, baseY, centerWz)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)

    // Label above the element
    const labelColor = el.type === 'entrance' ? 0xfbbf24
      : el.type === 'cabana' ? 0xfb923c
      : el.type === 'swim_up_bar' ? 0xfbbf24
      : el.type === 'service_yard' ? 0x94a3b8
      : el.type === 'amenity_block' ? 0xffffff
      : 0xfbbf24
    const label = makeLabelWithSubtitle(el.label, el.rationale, labelColor, 256)
    const labelY = isRoof ? buildingTopY + h + 2 : h + 2
    label.position.set(centerWx, labelY, centerWz)
    group.add(label)
  }

  return group
}

export function Viewer3D({
  selectedOption,
  className,
  projectId,
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
  // Bump this counter to force amenity rebuild when layout overrides change
  const [layoutRevision, setLayoutRevision] = useState(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const buildingGroupRef = useRef<THREE.Group | null>(null)
  const amenityGroupRef = useRef<THREE.Group | null>(null)
  const walkthroughRef = useRef<WalkthroughController | null>(null)
  const cinematicRef = useRef<CinematicController | null>(null)
  /** Store original (non-exploded) Y positions for building meshes */
  const floorOriginalYRef = useRef<Map<THREE.Object3D, number>>(new Map())

  // Project-aware building placement origin
  const vc = getViewerSiteConfig(projectId)
  const projBuildX = vc.buildableMinX - vc.centroidX
  const projBuildZ = -(vc.buildableMinY - vc.centroidY)

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
    addSiteOverlays(scene, getViewerSiteConfig(projectId))

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
      const startPos = new THREE.Vector3(projBuildX - 10, 0, projBuildZ + 6)
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

      const center = new THREE.Vector3(projBuildX + 20, 0, projBuildZ + 10)
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

  // ── Listen for layout-overrides-changed from the interactive planner ──
  useEffect(() => {
    const handler = () => setLayoutRevision((r) => r + 1)
    window.addEventListener(LAYOUT_CHANGED_EVENT, handler)
    return () => window.removeEventListener(LAYOUT_CHANGED_EVENT, handler)
  }, [])

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

    // For terraced buildings (Abbeville), each wing has its own floor count
    // and stacks sequentially. For legacy tower designs, each wing gets
    // all floors rendered independently.
    const isTerraced = projectId === 'abbeville'

    if (isTerraced) {
      // Terraced: wings stack sequentially — podium first, then tier by tier.
      // Each wing's `floors` count determines how many slabs it gets.
      let currentY = 0
      for (const wing of wings) {
        for (let f = 0; f < wing.floors; f++) {
          const isGround = currentY === 0
          const h = isGround ? GROUND_H : FLOOR_H
          const floorUse = isGround ? 'FOH_BOH' : 'YOTELPAD'
          const mat = MATERIALS[floorUse]?.clone() ?? new THREE.MeshStandardMaterial({
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
            wing.x + (wing.direction === 'EW' ? wing.length / 2 : wing.width / 2),
            yPos,
            -(wing.y + (wing.direction === 'EW' ? wing.width / 2 : wing.length / 2)),
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
      }
      maxBuildingY = currentY

      // Position the building group in world coords and apply 30-degree rotation
      group.position.set(projBuildX, 0, projBuildZ)
      group.rotation.y = (30 * Math.PI) / 180
    } else {
      // Legacy: each wing gets all floors stacked independently
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
            wing.x + (wing.direction === 'EW' ? wing.length / 2 : wing.width / 2) + projBuildX,
            yPos,
            -(wing.y + (wing.direction === 'EW' ? wing.width / 2 : wing.length / 2)) + projBuildZ,
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
    }

    // Add amenities — all placements computed by the architectural reasoning engine
    const amenities = buildAmenitiesFromLayout(selectedOption, maxBuildingY, projectId)
    amenityGroup.add(amenities)

    // Re-apply amenity visibility
    amenityGroup.visible = showAmenities
  // eslint-disable-next-line react-hooks/exhaustive-deps -- layoutRevision forces amenity rebuild
  }, [selectedOption, showAmenities, layoutRevision])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
