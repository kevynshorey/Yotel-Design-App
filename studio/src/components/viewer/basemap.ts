import * as THREE from 'three'
import type { BasemapType } from '@/engine/types'

/** Site coordinates for Carlisle Bay, Bridgetown.
 *  Source: Google Maps pin from development sponsor (Kevyn Shorey).
 *  https://maps.app.goo.gl/N2GWpi8wS577mAvi8
 *  Adjusted ~35m south to align boundary with correct parcel. */
const SITE_LAT = 13.090330
const SITE_LON = -59.608705

/** Tile URL generators for each basemap type. */
const TILE_URL: Record<string, (z: number, y: number, x: number) => string> = {
  Google: (z, y, x) =>
    `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`,
  Satellite: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  Street: (z, y, x) =>
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  Topo: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
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
  const { tileX, tileY, fracX, fracY, tileM } = getTileInfo(SITE_LAT, SITE_LON, zoom)
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
      const url = urlFn(zoom, tileY + dy, tileX + dx)
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
