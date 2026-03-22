'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ORIGINAL_BOUNDARY } from '@/config/site'

// ── Constants ────────────────────────────────────────────────────────────────

const INIT_LAT = 13.090731
const INIT_LON = -59.608315
const INIT_ZOOM = 18
const TILE_SIZE = 256

/** Tile URL — same Google satellite source as basemap.ts */
function tileUrl(z: number, y: number, x: number): string {
  return `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`
}

// ── Geo math ─────────────────────────────────────────────────────────────────

/** Metres per pixel at a given latitude and zoom. */
function metersPerPx(lat: number, zoom: number): number {
  return (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (TILE_SIZE * Math.pow(2, zoom))
}

/** Convert lat/lon to absolute pixel coordinates at the given zoom. */
function latLonToPixel(lat: number, lon: number, zoom: number): { px: number; py: number } {
  const n = Math.pow(2, zoom)
  const px = ((lon + 180) / 360) * n * TILE_SIZE
  const latRad = (lat * Math.PI) / 180
  const py =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE
  return { px, py }
}

/** Convert absolute pixel coordinates back to lat/lon at the given zoom. */
function pixelToLatLon(px: number, py: number, zoom: number): { lat: number; lon: number } {
  const n = Math.pow(2, zoom)
  const lon = (px / (n * TILE_SIZE)) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / (n * TILE_SIZE))))
  const lat = (latRad * 180) / Math.PI
  return { lat, lon }
}

/** Compute the centroid of the ORIGINAL_BOUNDARY in metres. */
function boundaryCentroid(): { cx: number; cy: number } {
  let cx = 0
  let cy = 0
  for (const p of ORIGINAL_BOUNDARY) {
    cx += p.x
    cy += p.y
  }
  return { cx: cx / ORIGINAL_BOUNDARY.length, cy: cy / ORIGINAL_BOUNDARY.length }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AlignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Map state
  const [centerLat, setCenterLat] = useState(INIT_LAT)
  const [centerLon, setCenterLon] = useState(INIT_LON)
  const [zoom, setZoom] = useState(INIT_ZOOM)

  // Polygon offset in metres from the map center
  const [polyOffsetX, setPolyOffsetX] = useState(0) // east in metres
  const [polyOffsetY, setPolyOffsetY] = useState(0) // north in metres
  const [rotation, setRotation] = useState(0) // degrees

  // Interaction state
  const dragRef = useRef<{
    dragging: boolean
    startX: number
    startY: number
    origOffsetX: number
    origOffsetY: number
  }>({ dragging: false, startX: 0, startY: 0, origOffsetX: 0, origOffsetY: 0 })

  // Tile image cache
  const tileCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const [, setTick] = useState(0) // force re-render when tiles load

  // Copied state for feedback
  const [copied, setCopied] = useState(false)

  // ── Derived values ───────────────────────────────────────────────────────

  const mpp = metersPerPx(centerLat, zoom)
  const bCentroid = boundaryCentroid()

  // The polygon centroid in GPS
  const polyLat = centerLat + polyOffsetY / 111320
  const polyLon = centerLon + polyOffsetX / (111320 * Math.cos((centerLat * Math.PI) / 180))

  // ── Tile loading ─────────────────────────────────────────────────────────

  const loadTile = useCallback(
    (key: string, url: string) => {
      const cache = tileCacheRef.current
      if (cache.has(key)) return cache.get(key)!
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        cache.set(key, img)
        setTick((t) => t + 1)
      }
      img.onerror = () => {
        // silently skip broken tiles
      }
      img.src = url
      // put placeholder so we don't re-request
      cache.set(key, img)
      return null
    },
    [],
  )

  // ── Canvas draw ──────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Clear
    ctx.fillStyle = '#0a0e17'
    ctx.fillRect(0, 0, w, h)

    // Center pixel in world tile space
    const { px: cpx, py: cpy } = latLonToPixel(centerLat, centerLon, zoom)

    // Which tiles are visible
    const halfW = w / 2
    const halfH = h / 2
    const tileMinX = Math.floor((cpx - halfW) / TILE_SIZE)
    const tileMaxX = Math.floor((cpx + halfW) / TILE_SIZE)
    const tileMinY = Math.floor((cpy - halfH) / TILE_SIZE)
    const tileMaxY = Math.floor((cpy + halfH) / TILE_SIZE)

    for (let tx = tileMinX; tx <= tileMaxX; tx++) {
      for (let ty = tileMinY; ty <= tileMaxY; ty++) {
        const key = `${zoom}/${ty}/${tx}`
        const url = tileUrl(zoom, ty, tx)
        const img = loadTile(key, url)
        if (img && img.complete && img.naturalWidth > 0) {
          const sx = tx * TILE_SIZE - cpx + halfW
          const sy = ty * TILE_SIZE - cpy + halfH
          ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE)
        }
      }
    }

    // ── Draw polygon ─────────────────────────────────────────────────────
    const pxPerMetre = 1 / mpp
    const radians = (rotation * Math.PI) / 180

    ctx.save()
    // Translate to canvas center + polygon offset in pixels
    const polyScreenX = halfW + (polyOffsetX * pxPerMetre)
    const polyScreenY = halfH - (polyOffsetY * pxPerMetre) // Y is inverted (screen Y down, north up)
    ctx.translate(polyScreenX, polyScreenY)
    ctx.rotate(-radians) // negative because screen Y is inverted

    ctx.beginPath()
    for (let i = 0; i < ORIGINAL_BOUNDARY.length; i++) {
      const p = ORIGINAL_BOUNDARY[i]
      // Convert metres to pixels, offset from boundary centroid
      const bx = (p.x - bCentroid.cx) * pxPerMetre
      const by = -(p.y - bCentroid.cy) * pxPerMetre // invert Y
      if (i === 0) ctx.moveTo(bx, by)
      else ctx.lineTo(bx, by)
    }
    ctx.closePath()

    ctx.fillStyle = 'rgba(220, 38, 38, 0.3)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw centroid marker
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()

    ctx.restore()

    // ── Crosshair at center ──────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(halfW, 0)
    ctx.lineTo(halfW, h)
    ctx.moveTo(0, halfH)
    ctx.lineTo(w, halfH)
    ctx.stroke()
  }, [centerLat, centerLon, zoom, polyOffsetX, polyOffsetY, rotation, loadTile, mpp, bCentroid.cx, bCentroid.cy])

  // ── Resize ───────────────────────────────────────────────────────────────

  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setTick((t) => t + 1) // force redraw
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Mouse / touch handlers for polygon dragging ──────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Check if click is near the polygon area (rough bounding box check)
      const pxPerMetre = 1 / mpp
      const halfW = canvas.width / 2
      const halfH = canvas.height / 2
      const polyScreenX = halfW + polyOffsetX * pxPerMetre
      const polyScreenY = halfH - polyOffsetY * pxPerMetre

      // Rough 150px radius hit test from polygon centroid
      const dist = Math.sqrt(
        (mx - polyScreenX) ** 2 + (my - polyScreenY) ** 2,
      )
      if (dist < 200) {
        dragRef.current = {
          dragging: true,
          startX: e.clientX,
          startY: e.clientY,
          origOffsetX: polyOffsetX,
          origOffsetY: polyOffsetY,
        }
        canvas.setPointerCapture(e.pointerId)
      }
    },
    [mpp, polyOffsetX, polyOffsetY],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const d = dragRef.current
      if (!d.dragging) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      // Convert pixel delta to metres
      setPolyOffsetX(d.origOffsetX + dx * mpp)
      setPolyOffsetY(d.origOffsetY - dy * mpp) // invert Y
    },
    [mpp],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current.dragging = false
  }, [])

  // ── Zoom controls ────────────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 1, 21))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 1, 14))
  }, [])

  // ── Scroll to zoom ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (e.deltaY < 0) setZoom((z) => Math.min(z + 1, 21))
      else setZoom((z) => Math.max(z - 1, 14))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [])

  // ── Copy coordinates ─────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    const text = `const SITE_LAT = ${polyLat.toFixed(6)}\nconst SITE_LON = ${polyLon.toFixed(6)}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [polyLat, polyLon])

  // ── Pan map with arrow keys ──────────────────────────────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const step = 0.0001
      if (e.key === 'ArrowUp') setCenterLat((v) => v + step)
      if (e.key === 'ArrowDown') setCenterLat((v) => v - step)
      if (e.key === 'ArrowRight') setCenterLon((v) => v + step)
      if (e.key === 'ArrowLeft') setCenterLon((v) => v - step)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0e17]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        {/* Info panel */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 max-w-sm">
          <h1 className="text-white text-lg font-semibold mb-1">Site Alignment</h1>
          <p className="text-slate-400 text-xs mb-3">
            Drag the red boundary to align with your plot on the satellite image
          </p>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Centroid Lat</span>
              <span>{polyLat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Centroid Lon</span>
              <span>{polyLon.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Offset</span>
              <span>
                {polyOffsetX.toFixed(1)}m E, {polyOffsetY.toFixed(1)}m N
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Rotation</span>
              <span>{rotation.toFixed(1)}&deg;</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Zoom</span>
              <span>{zoom}</span>
            </div>
          </div>

          {/* Rotation slider */}
          <div className="mt-3">
            <label className="text-slate-400 text-xs block mb-1">
              Rotation: {rotation.toFixed(1)}&deg;
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={0.5}
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Buttons */}
          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                // Save to localStorage so the 3D viewer picks it up
                const data = {
                  lat: parseFloat(polyLat.toFixed(6)),
                  lon: parseFloat(polyLon.toFixed(6)),
                  rotation: rotation,
                }
                localStorage.setItem('yotel-site-position', JSON.stringify(data))
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full px-3 py-2 text-sm font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {copied ? '✓ Saved to App!' : '💾 Save Position to App'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Copy Coordinates
              </button>
              <button
                onClick={() => {
                  setPolyOffsetX(0)
                  setPolyOffsetY(0)
                  setRotation(0)
                  setCenterLat(INIT_LAT)
                  setCenterLon(INIT_LON)
                  setZoom(INIT_ZOOM)
                }}
                className="px-3 py-1.5 text-xs font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            Drag the red boundary onto your plot, then click &quot;Save Position to App&quot;.
            The 3D viewer will use this position automatically.
          </p>
        </div>
      </div>

      {/* ── Zoom controls ────────────────────────────────────────────────── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg text-white text-xl hover:bg-slate-800 transition-colors"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg text-white text-xl hover:bg-slate-800 transition-colors"
        >
          -
        </button>
      </div>

      {/* ── Bottom hint ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-1.5 text-slate-400 text-xs">
          Scroll to zoom &middot; Arrow keys to pan map &middot; Drag polygon to reposition
        </div>
      </div>
    </div>
  )
}
