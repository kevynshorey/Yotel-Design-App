import * as THREE from 'three'
import type { BasemapType } from '@/engine/types'

/** Site coordinates for Carlisle Bay, Bridgetown (from mapData.js). */
const SITE_LAT = 13.090456
const SITE_LON = -59.608805

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

/** Load a 7x7 grid of map tiles as ground-plane meshes.
 *  Ported from Viewer3D.jsx loadTiles(). */
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

  const cx = (0.5 - fracX) * tileM
  const cz = (fracY - 0.5) * tileM

  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const url = urlFn(zoom, tileY + dy, tileX + dx)
      const px = cx + dx * tileM
      const pz = cz + dy * tileM

      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(tileM, tileM),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
        )
        mesh.rotation.x = -Math.PI / 2
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
