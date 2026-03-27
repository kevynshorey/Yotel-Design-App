import * as THREE from 'three'
import type { BasemapType } from '@/engine/types'

/** Site coordinates for Carlisle Bay, Bridgetown — Woodside, Bay Street.
 *  Derived from survey plan "Woodside Bay St (Soft Copy)-Model.pdf"
 *  using Barbados National Grid → WGS84 conversion:
 *    T567A (SW): E 24,497.45 / N 65,180.58 → 13.087619, -59.611850
 *    SE corner:  E 24,617.78 / N 65,188.37 → 13.087689, -59.610740
 *  Full-plot centroid (~30m north of S edge): */
/** Default coordinates — overridden by localStorage 'yotel-site-position' if saved via /align */
const DEFAULT_LAT = 13.090731
const DEFAULT_LON = -59.608315

function getSiteCoords(): { lat: number; lon: number } {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('yotel-site-position')
      if (saved) {
        const { lat, lon } = JSON.parse(saved)
        if (typeof lat === 'number' && typeof lon === 'number') return { lat, lon }
      }
    } catch { /* ignore */ }
  }
  return { lat: DEFAULT_LAT, lon: DEFAULT_LON }
}

/** Tile URL generators for each basemap type. */
const TILE_URL: Record<string, (z: number, y: number, x: number) => string | null> = {
  Google: (z, y, x) =>
    `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`,
  Satellite: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  Street: (z, y, x) =>
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  'OSM Standard': (z, y, x) =>
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  'ESRI Street': (z, y, x) =>
    `https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`,
  'OSM HOT': (z, y, x) =>
    `https://tile.openstreetmap.fr/hot/${z}/${x}/${y}.png`,
  OpenTopo: (z, y, x) =>
    `https://tile.opentopomap.org/${z}/${x}/${y}.png`,
  'Carto Voyager': (z, y, x) =>
    `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`,
  'Wikimedia OSM': (z, y, x) =>
    `https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}.png`,
  Topo: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
  Copernicus: (z, y, x) =>
    `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/${z}/${y}/${x}.jpg`,
  'Mapbox Streets': (z, y, x) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return null
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/${z}/${x}/${y}@2x?access_token=${token}`
  },
  'Mapbox Satellite': (z, y, x) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return null
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/${z}/${x}/${y}@2x?access_token=${token}`
  },
  'Mapbox Outdoors': (z, y, x) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return null
    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/${z}/${x}/${y}@2x?access_token=${token}`
  },
  'MapTiler Streets': (z, y, x) => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
    if (!key) return null
    return `https://api.maptiler.com/maps/streets/256/${z}/${x}/${y}.png?key=${key}`
  },
  'MapTiler Outdoor': (z, y, x) => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
    if (!key) return null
    return `https://api.maptiler.com/maps/outdoor/256/${z}/${x}/${y}.png?key=${key}`
  },
  'MapTiler Satellite': (z, y, x) => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
    if (!key) return null
    return `https://api.maptiler.com/maps/satellite/256/${z}/${x}/${y}.png?key=${key}`
  },
}

function getBasemapZoom(basemap: BasemapType, fallbackZoom: number): number {
  if (String(basemap).startsWith('Mapbox ')) return 16
  if (String(basemap).startsWith('MapTiler ')) return 17
  if (basemap === 'OpenTopo') return 16
  return fallbackZoom
}

/** Convert lat/lon to tile coords + subpixel offset + tile size in metres. */
function getTileInfo(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const tileX = Math.floor((lon + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  const fracX = (lon + 180) / 360 * n - tileX
  const fracY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - tileY
  const tileM = 40075016.686 * Math.cos(latRad) / n
  return { tileX, tileY, fracX, fracY, tileM }
}

/** Load a 7×7 grid of map tiles as ground-plane meshes.
 *
 *  Coordinate system (Three.js world):
 *    +X = East,  -X = West
 *    +Z = South, -Z = North   (matching standard web map tile Y convention)
 *    +Y = Up
 *
 *  Map tile convention:
 *    tileX increases eastward  → maps to +X
 *    tileY increases southward → maps to +Z
 *
 *  The PlaneGeometry is placed in the XZ plane using a custom UV-aware
 *  approach: we create the plane already in XZ (no rotation needed) and
 *  manually set UVs to match the tile image orientation.
 */
export function loadBasemapTiles(
  scene: THREE.Scene,
  basemap: BasemapType = 'Google',
  zoom: number = 18,
): void {
  if (basemap === 'None' || !TILE_URL[basemap]) return

  const urlFn = TILE_URL[basemap]
  const resolvedZoom = getBasemapZoom(basemap, zoom)
  const { lat: SITE_LAT, lon: SITE_LON } = getSiteCoords()
  const { tileX, tileY, fracX, fracY, tileM } = getTileInfo(SITE_LAT, SITE_LON, resolvedZoom)
  const loader = new THREE.TextureLoader()
  loader.crossOrigin = 'anonymous'

  // Center offset: place the site coordinate at scene (0, 0, 0)
  // fracX = how far east within the center tile (0-1)
  // fracY = how far south within the center tile (0-1)
  // Scene convention: +X = East, -Z = South (negated to match Revit +Y = North)
  const cx = (0.5 - fracX) * tileM
  const cz = -(0.5 - fracY) * tileM  // negated: south tiles go to -Z

  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const url = urlFn(resolvedZoom, tileY + dy, tileX + dx)
      if (!url) continue
      // dx>0 = east tile → +X;  dy>0 = south tile → -Z (negated)
      const px = cx + dx * tileM
      const pz = cz - dy * tileM  // negated: tileY increases south → -Z

      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter

        // Create plane directly in XZ plane (no rotation needed)
        const half = tileM / 2
        const geo = new THREE.BufferGeometry()

        // Vertices in XZ plane (Y = ground level)
        // Order: SW, SE, NW, NE  (looking down from above)
        const vertices = new Float32Array([
          -half, 0, half,   // SW  (0)
           half, 0, half,   // SE  (1)
          -half, 0, -half,  // NW  (2)
           half, 0, -half,  // NE  (3)
        ])

        // UVs: map tile image pixels to world vertex positions.
        // Scene Z is negated (−Z = south), so vertex layout is:
        //   vertex 0 (+Z half) = NORTH edge, vertex 2 (−Z half) = SOUTH edge
        // Three.js flipY=true: V=0 = image top (north), V=1 = image bottom (south)
        const uvs = new Float32Array([
          0, 0,   // vertex 0 (north edge, +Z) → V=0 = image north ✓
          1, 0,   // vertex 1 (north edge, +Z) → V=0 = image north ✓
          0, 1,   // vertex 2 (south edge, −Z) → V=1 = image south ✓
          1, 1,   // vertex 3 (south edge, −Z) → V=1 = image south ✓
        ])

        const indices = new Uint16Array([0, 1, 2, 1, 3, 2])

        geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        geo.setIndex(new THREE.BufferAttribute(indices, 1))
        geo.computeVertexNormals()

        const mesh = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
        )
        mesh.position.set(px, -0.02, pz)
        mesh.receiveShadow = true
        mesh.name = 'basemap-tile'
        scene.add(mesh)
      })
    }
  }
}

/** Remove all basemap tiles from the scene. */
export function clearBasemapTiles(scene: THREE.Scene): void {
  const toRemove = scene.children.filter(c => c.name === 'basemap-tile')
  for (const child of toRemove) {
    scene.remove(child)
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (child.material instanceof THREE.Material) child.material.dispose()
    }
  }
}
