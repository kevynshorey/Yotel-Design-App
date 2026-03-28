'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ShapeUtils } from 'three/src/extras/ShapeUtils.js'
import { X, Undo2, Check, MapPin, Map, Pencil, Hexagon, Spline, SquareDashed } from 'lucide-react'
import { createRenderer, createLights } from '@/components/viewer/scene-setup'
import { loadBasemapTiles, clearBasemapTiles } from '@/components/viewer/basemap'
import { OFFSET_BOUNDARY, ORIGINAL_BOUNDARY } from '@/config/site'
import type { Point2D } from '@/engine/types'
import { sitePointToWorldXZ, worldXZToSite } from '@/lib/site-geometry'
import type { AddLandUseLayerInput } from '@/store/land-use-store'
import { getLandUseZones } from '@/store/land-use-store'
import type { DrawTool, LandUseCategory, LandUseZone } from '@/engine/land-use'
import { LAND_USE_CATEGORY_META, LAYER_NAME_PRESETS, polygonAreaSqm } from '@/engine/land-use'
import {
  configurePlanOrthographic,
  defaultPerspectiveOverview,
  setPerspectiveFromCompass,
  setPlanViewUp,
  type LandUseCompass,
  type LandUsePlanCardinal,
} from '@/lib/land-use-camera'
import { applyLandUseSnap, type LandUseSnapContext } from '@/lib/land-use-snaps'
import { LandUseViewCube } from '@/components/design/land-use-view-cube'

interface LandUseDrawModalProps {
  open: boolean
  onClose: () => void
  onComplete: (input: AddLandUseLayerInput) => void
}

const PLANE_Y = 0.3
const MIN_DRAG_M = 0.8
const FREEHAND_STEP_M = 1.2

function boundaryLine(points: Point2D[], color: number, y: number, close: boolean): THREE.Line {
  const positions: number[] = []
  for (const p of points) {
    const { x, z } = sitePointToWorldXZ(p)
    positions.push(x, y, z)
  }
  if (close && points.length > 0) {
    const { x, z } = sitePointToWorldXZ(points[0])
    positions.push(x, y, z)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }))
}

/**
 * Filled polygon on the site plane (world XZ at fixed Y).
 * Uses the same site→world mapping as boundaryLine — no ShapeGeometry + rotation, so the
 * fill cannot drift from the stroke. Winding is normalized like ShapeGeometry (clockwise in 2D).
 */
function ringMesh(points: Point2D[], fillColor: number, y: number): THREE.Mesh | null {
  if (points.length < 3) return null
  const contour: THREE.Vector2[] = []
  for (const p of points) {
    const { x, z } = sitePointToWorldXZ(p)
    contour.push(new THREE.Vector2(x, z))
  }
  if (!ShapeUtils.isClockWise(contour)) {
    contour.reverse()
  }
  const faces = ShapeUtils.triangulateShape(contour, [])
  if (faces.length === 0) return null

  const pos = new Float32Array(contour.length * 3)
  for (let i = 0; i < contour.length; i++) {
    const v = contour[i]
    pos[i * 3] = v.x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = v.y
  }
  const idx: number[] = []
  for (const f of faces) {
    idx.push(f[0], f[1], f[2])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()

  const mat = new THREE.MeshBasicMaterial({
    color: fillColor,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geo, mat)
}

const CATEGORIES: LandUseCategory[] = ['parking', 'hotel', 'buildable_area', 'site_boundary']

function rectangleFromCorners(a: Point2D, b: Point2D): Point2D[] {
  return [
    { x: a.x, y: a.y },
    { x: b.x, y: a.y },
    { x: b.x, y: b.y },
    { x: a.x, y: b.y },
  ]
}

export function LandUseDrawModal({ open, onClose, onComplete }: LandUseDrawModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [navigateMode, setNavigateMode] = useState(false)
  const [category, setCategory] = useState<LandUseCategory>('parking')
  const [layerName, setLayerName] = useState(LAYER_NAME_PRESETS.parking[0])
  const [mergeIntoId, setMergeIntoId] = useState<string>('')
  const [tool, setTool] = useState<DrawTool>('polygon')

  const [completedRings, setCompletedRings] = useState<Point2D[][]>([])
  const [activeRing, setActiveRing] = useState<Point2D[]>([])

  const [linePreview, setLinePreview] = useState<Point2D | null>(null)
  const [rectStart, setRectStart] = useState<Point2D | null>(null)
  const [rectPreview, setRectPreview] = useState<Point2D | null>(null)
  const [freehandStroke, setFreehandStroke] = useState<Point2D[]>([])
  const freehandRef = useRef<Point2D[]>([])

  const [existingZones, setExistingZones] = useState<LandUseZone[]>([])
  const [view3D, setView3D] = useState(false)
  const [compassDir, setCompassDir] = useState<LandUseCompass>('top')
  const [planCardinal, setPlanCardinal] = useState<LandUsePlanCardinal>('N')
  const [snapsEnabled, setSnapsEnabled] = useState(true)

  const view3DRef = useRef(false)
  const planCardinalRef = useRef<LandUsePlanCardinal>('N')
  view3DRef.current = view3D
  planCardinalRef.current = planCardinal

  const snapDrawRef = useRef({
    snapsEnabled: true,
    completedRings: [] as Point2D[][],
    activeRing: [] as Point2D[],
    tool: 'polygon' as DrawTool,
    existingZones: [] as LandUseZone[],
    rectStart: null as Point2D | null,
  })
  snapDrawRef.current = {
    snapsEnabled,
    completedRings,
    activeRing,
    tool,
    existingZones,
    rectStart,
  }

  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const perspCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const activeCameraRef = useRef<THREE.Camera | null>(null)
  const viewportSizeRef = useRef({ w: 1, h: 1 })
  const lastCompass3DRef = useRef<Exclude<LandUseCompass, 'top'>>('NE')
  const controlsRef = useRef<OrbitControls | null>(null)
  const rafRef = useRef<number>(0)

  const interactRef = useRef({
    navigateMode: false,
    tool: 'polygon' as DrawTool,
    rectStart: null as Point2D | null,
  })
  interactRef.current.navigateMode = navigateMode
  interactRef.current.tool = tool
  interactRef.current.rectStart = rectStart

  const rebuildDraftVisuals = useCallback(
    (scene: THREE.Scene) => {
      const old = scene.getObjectByName('land-use-draft')
      if (old) scene.remove(old)
      const g = new THREE.Group()
      g.name = 'land-use-draft'
      const yLine = 0.38
      const yFill = 0.36

      const catColor = parseInt(LAND_USE_CATEGORY_META[category].color.replace('#', ''), 16)

      for (const ring of completedRings) {
        if (ring.length >= 2) {
          g.add(boundaryLine(ring, catColor, yLine, true))
          const m = ringMesh(ring, catColor, yFill)
          if (m) g.add(m)
        }
      }

      if (activeRing.length > 0) {
        g.add(boundaryLine(activeRing, 0xfbbf24, yLine, false))
        const anchor = activeRing[activeRing.length - 1]
        if (linePreview && tool === 'line_chain') {
          g.add(boundaryLine([anchor, linePreview], 0xfcd34d, yLine, false))
        }
        for (const p of activeRing) {
          const { x, z } = sitePointToWorldXZ(p)
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
          )
          dot.position.set(x, yLine, z)
          g.add(dot)
        }
      }

      if (rectStart && rectPreview) {
        const r = rectangleFromCorners(rectStart, rectPreview)
        g.add(boundaryLine(r, 0xa78bfa, yLine, true))
      }

      if (freehandStroke.length > 1) {
        g.add(boundaryLine(freehandStroke, 0x34d399, yLine, false))
      }

      scene.add(g)
    },
    [activeRing, category, completedRings, freehandStroke, linePreview, rectPreview, rectStart, tool],
  )

  useEffect(() => {
    if (!open) return
    setCompletedRings([])
    setActiveRing([])
    setLinePreview(null)
    setRectStart(null)
    setRectPreview(null)
    setFreehandStroke([])
    freehandRef.current = []
    setNavigateMode(false)
    setView3D(false)
    setCompassDir('top')
    setPlanCardinal('N')
    setSnapsEnabled(true)
    setMergeIntoId('')
    setExistingZones(getLandUseZones())
    setCategory('parking')
    setLayerName(LAYER_NAME_PRESETS.parking[0])
    setTool('polygon')
  }, [open])

  useEffect(() => {
    setLayerName((prev) => {
      const presets = LAYER_NAME_PRESETS[category]
      if (presets.includes(prev)) return prev
      return presets[0]
    })
  }, [category])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020617)
    sceneRef.current = scene

    const renderer = createRenderer(canvas)
    rendererRef.current = renderer

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      viewportSizeRef.current = { w, h }
      const persp = perspCameraRef.current
      const ortho = orthoCameraRef.current
      if (persp) {
        persp.aspect = w / Math.max(h, 1)
        persp.updateProjectionMatrix()
      }
      if (ortho) {
        configurePlanOrthographic(ortho, w, h)
        if (!view3DRef.current) {
          setPlanViewUp(ortho, planCardinalRef.current)
        }
      }
      renderer.setSize(w, h)
    }

    const w0 = container.clientWidth
    const h0 = container.clientHeight
    viewportSizeRef.current = { w: w0, h: h0 }
    const aspect0 = w0 / Math.max(h0, 1)

    const persp = new THREE.PerspectiveCamera(48, aspect0, 0.5, 4000)
    defaultPerspectiveOverview(persp)
    perspCameraRef.current = persp

    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.5, 4000)
    configurePlanOrthographic(ortho, w0, h0)
    setPlanViewUp(ortho, planCardinalRef.current)
    orthoCameraRef.current = ortho
    activeCameraRef.current = ortho

    createLights(scene)
    loadBasemapTiles(scene, 'OSM Standard', 18)

    scene.add(boundaryLine(ORIGINAL_BOUNDARY, 0xff4444, 0.12, true))
    scene.add(boundaryLine(OFFSET_BOUNDARY, 0x3b82f6, 0.18, true))

    const controls = new OrbitControls(ortho, canvas)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)
    controls.enabled = false
    controls.enableRotate = false
    controls.minPolarAngle = 0
    controls.maxPolarAngle = 0.001
    controlsRef.current = controls

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const dist = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y)

    const raycastSite = (e: PointerEvent): Point2D | null => {
      const rect = canvas.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const cam = activeCameraRef.current
      if (!cam) return null
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, cam)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PLANE_Y)
      const hit = new THREE.Vector3()
      if (!raycaster.ray.intersectPlane(plane, hit)) return null
      const raw = worldXZToSite(hit.x, hit.z)
      const r = snapDrawRef.current
      const ctx: LandUseSnapContext = {
        enabled: r.snapsEnabled,
        tool: r.tool,
        activeRing: r.activeRing,
        completedRings: r.completedRings,
        boundaries: [ORIGINAL_BOUNDARY, OFFSET_BOUNDARY],
        zonePolygons: r.existingZones.flatMap((z) => z.polygons),
        rectStart: r.rectStart,
      }
      return applyLandUseSnap(raw, ctx)
    }

    const onPointerDown = (e: PointerEvent) => {
      const { navigateMode: nav, tool: t } = interactRef.current
      if (e.button !== 0 || nav) return
      const site = raycastSite(e)
      if (!site) return

      if (t === 'polygon') {
        setActiveRing((r) => [...r, site])
        return
      }

      if (t === 'freehand') {
        freehandRef.current = [site]
        setFreehandStroke([site])
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        return
      }

      if (t === 'line_chain') {
        setActiveRing((r) => {
          if (r.length === 0) return [site]
          return r
        })
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        return
      }

      if (t === 'rectangle') {
        setRectStart(site)
        setRectPreview(site)
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const { navigateMode: nav, tool: t, rectStart: rs } = interactRef.current
      if (nav) return
      const site = raycastSite(e)
      if (!site) return

      if (t === 'line_chain' && e.buttons === 1) {
        setLinePreview(site)
        return
      }
      if (t === 'rectangle' && rs && e.buttons === 1) {
        setRectPreview(site)
        return
      }
      if (t === 'freehand' && freehandRef.current.length > 0 && e.buttons === 1) {
        const stroke = freehandRef.current
        const last = stroke[stroke.length - 1]
        if (!last || dist(last, site) >= FREEHAND_STEP_M) {
          stroke.push(site)
          freehandRef.current = stroke
          setFreehandStroke([...stroke])
        }
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const { navigateMode: nav, tool: t, rectStart: rs } = interactRef.current
      if (e.button !== 0 || nav) return
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* noop */
      }

      const site = raycastSite(e)

      if (t === 'line_chain' && site) {
        setActiveRing((r) => {
          if (r.length === 0) return r
          const anchor = r[r.length - 1]
          if (dist(anchor, site) >= MIN_DRAG_M) {
            return [...r, site]
          }
          return r
        })
        setLinePreview(null)
        return
      }

      if (t === 'rectangle' && rs && site) {
        const r = rectangleFromCorners(rs, site)
        if (polygonAreaSqm(r) > 1) {
          setCompletedRings((rings) => [...rings, r])
        }
        setRectStart(null)
        setRectPreview(null)
      }

      if (t === 'freehand') {
        const stroke = freehandRef.current
        if (stroke.length >= 3) {
          setCompletedRings((rings) => [...rings, [...stroke]])
        }
        freehandRef.current = []
        setFreehandStroke([])
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      controls.update()
      const cam = activeCameraRef.current
      if (cam) renderer.render(scene, cam)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      ro.disconnect()
      controls.dispose()
      clearBasemapTiles(scene)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material?.dispose()
        }
        if (obj instanceof THREE.Line) {
          obj.geometry.dispose()
          ;(obj.material as THREE.Material).dispose()
        }
      })
      renderer.dispose()
      sceneRef.current = null
      rendererRef.current = null
      perspCameraRef.current = null
      orthoCameraRef.current = null
      activeCameraRef.current = null
      controlsRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const persp = perspCameraRef.current
    const ortho = orthoCameraRef.current
    const controls = controlsRef.current
    if (!persp || !ortho || !controls) return
    const { w, h } = viewportSizeRef.current
    if (w < 1 || h < 1) return

    if (!view3D) {
      activeCameraRef.current = ortho
      controls.object = ortho
      configurePlanOrthographic(ortho, w, h)
      setPlanViewUp(ortho, planCardinal)
      controls.enableRotate = false
      controls.minPolarAngle = 0
      controls.maxPolarAngle = 0.001
    } else {
      persp.up.set(0, 1, 0)
      activeCameraRef.current = persp
      controls.object = persp
      controls.enableRotate = true
      controls.minPolarAngle = 0.05
      controls.maxPolarAngle = Math.PI * 0.52
      if (compassDir === 'top') {
        defaultPerspectiveOverview(persp)
      } else {
        setPerspectiveFromCompass(persp, compassDir)
      }
    }
    controls.target.set(0, 0, 0)
    controls.update()
  }, [open, view3D, compassDir, planCardinal])

  useEffect(() => {
    const c = controlsRef.current
    if (c) c.enabled = navigateMode
  }, [navigateMode, open])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !open) return
    rebuildDraftVisuals(scene)
  }, [open, rebuildDraftVisuals])

  const finishRing = () => {
    if (activeRing.length < 3) return
    setCompletedRings((rings) => [...rings, [...activeRing]])
    setActiveRing([])
    setLinePreview(null)
  }

  const undoLast = () => {
    setActiveRing((r) => {
      if (r.length > 0) {
        return r.slice(0, -1)
      }
      setCompletedRings((rings) => rings.slice(0, -1))
      return r
    })
  }

  const canSave =
    completedRings.length > 0 || activeRing.length >= 3

  const save = () => {
    const polygons: Point2D[][] = [...completedRings]
    if (activeRing.length >= 3) polygons.push([...activeRing])
    if (polygons.length === 0) return

    onComplete({
      category,
      layerName: layerName.trim() || LAND_USE_CATEGORY_META[category].label,
      polygons,
      mergeIntoId: mergeIntoId || undefined,
    })
    onClose()
  }

  const mergeOptions = existingZones.filter((z) => z.category === category)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Draw land use boundary</h2>
            <p className="text-[11px] text-slate-500">
              Red = site · Blue = buildable · <strong>2D</strong>: plan + N/S/E/W rotates sheet · <strong>3D</strong>: orbit · Snaps optional ·{' '}
              <strong>Navigate map</strong> to pan/zoom or orbit · <strong>Draw on map</strong> for tools
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[40vh] space-y-3 overflow-y-auto border-b border-slate-800 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setNavigateMode(false)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                !navigateMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Pencil size={14} /> Draw on map
            </button>
            <button
              type="button"
              onClick={() => setNavigateMode(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                navigateMode ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Map size={14} /> Navigate map
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-400">
              Type
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LandUseCategory)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {LAND_USE_CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-400">
              Layer name (one boundary; multiple rings allowed)
              <select
                value={LAYER_NAME_PRESETS[category].includes(layerName) ? layerName : '__custom__'}
                onChange={(e) => {
                  const v = e.target.value
                  if (v !== '__custom__') setLayerName(v)
                }}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-200"
              >
                {LAYER_NAME_PRESETS[category].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              <input
                type="text"
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="e.g. Parking 1"
                className="mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-200"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-400">
            Add polygons to
            <select
              value={mergeIntoId}
              onChange={(e) => setMergeIntoId(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-200"
            >
              <option value="">Create new boundary (new layer)</option>
              {mergeOptions.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.layerName} — {z.polygons.length} ring{z.polygons.length !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Draw tool
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'polygon' as const, label: 'Polygon (points)', Icon: Hexagon },
                  { id: 'line_chain' as const, label: 'Lines (drag)', Icon: Spline },
                  { id: 'rectangle' as const, label: 'Rectangle', Icon: SquareDashed },
                  { id: 'freehand' as const, label: 'Freehand', Icon: Pencil },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={navigateMode}
                  onClick={() => {
                    setTool(id)
                    setActiveRing([])
                    setLinePreview(null)
                    setRectStart(null)
                    setRectPreview(null)
                    setFreehandStroke([])
                    freehandRef.current = []
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium md:text-xs ${
                    tool === id ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
                  } disabled:opacity-40`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              <strong>Polygon</strong>: click each corner · <strong>Lines</strong>: first click starts, drag and release for
              each edge · <strong>Rectangle</strong>: drag diagonal · <strong>Freehand</strong>: hold and sketch, release to
              finish ring
            </p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-slate-400">
              <input
                type="checkbox"
                checked={snapsEnabled}
                onChange={(e) => setSnapsEnabled(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900"
              />
              Drawing snaps (endpoints, midpoints, orthogonal / parallel)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(tool === 'polygon' || tool === 'line_chain') && (
              <button
                type="button"
                disabled={navigateMode || activeRing.length < 3}
                onClick={finishRing}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
              >
                Close current ring
              </button>
            )}
            <button
              type="button"
              disabled={navigateMode}
              onClick={undoLast}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 disabled:opacity-40"
            >
              <Undo2 size={14} /> Undo
            </button>
            <button
              type="button"
              disabled={!canSave || navigateMode}
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 hover:bg-emerald-500"
            >
              <Check size={14} /> Save layer
            </button>
          </div>
        </div>

        <div ref={containerRef} className="relative min-h-[280px] flex-1 md:min-h-[400px]">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
            <div className="pointer-events-auto flex overflow-hidden rounded-lg border border-slate-600 text-[10px] font-semibold shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setView3D(false)
                  setCompassDir('top')
                  setPlanCardinal('N')
                }}
                className={`px-2.5 py-1.5 transition ${!view3D ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                2D
              </button>
              <button
                type="button"
                onClick={() => {
                  setView3D(true)
                  setCompassDir((c) => (c === 'top' ? lastCompass3DRef.current : c))
                }}
                className={`border-l border-slate-600 px-2.5 py-1.5 transition ${view3D ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                3D
              </button>
            </div>
            <div className="pointer-events-auto">
              <LandUseViewCube
                mode={view3D ? '3d' : '2d'}
                planCardinal={planCardinal}
                compass3D={compassDir}
                onTop={() => {
                  setView3D(false)
                  setCompassDir('top')
                  setPlanCardinal('N')
                }}
                onPlanCardinal={(c) => {
                  setView3D(false)
                  setCompassDir('top')
                  setPlanCardinal(c)
                }}
                onCompass3D={(d) => {
                  lastCompass3DRef.current = d
                  setView3D(true)
                  setCompassDir(d)
                }}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-slate-300">
            <span className="flex items-center gap-2">
              <MapPin size={12} className="text-amber-400" />
              Closed rings: {completedRings.length} · Active: {activeRing.length} pts
            </span>
            {!navigateMode && (
              <span className="text-slate-500">
                {tool === 'polygon' && 'Click to place polygon vertices'}
                {tool === 'line_chain' && 'Click first point, then drag each segment'}
                {tool === 'rectangle' && 'Drag a rectangle'}
                {tool === 'freehand' && 'Hold and draw; release to add ring'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
