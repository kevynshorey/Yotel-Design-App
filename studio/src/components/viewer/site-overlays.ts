import * as THREE from 'three'
import { ORIGINAL_BOUNDARY, OFFSET_BOUNDARY } from '@/config/site'
import type { Point2D } from '@/engine/types'
import type { ViewerSiteConfig } from './project-site-config'

/** Site centroid used to align boundary with basemap center (world origin).
 *  From SITE config: centroidX = 75.52, centroidY = 32.75 */
const SITE_CX = 75.52
const SITE_CY = 32.75

/** Map site coordinates to Three.js world coordinates.
 *  Revit/Dynamo: +X = East, +Y = North
 *  Three.js:     +X = East, +Z = South (i.e. -Y)
 *  We center the boundary on the basemap origin and negate Y → Z. */
function siteToWorld(p: Point2D, cx: number = SITE_CX, cy: number = SITE_CY): [number, number] {
  return [p.x - cx, -(p.y - cy)]
}

function createBoundaryLine(
  points: Point2D[],
  color: number,
  dashed: boolean = false,
  y: number = 0.1,
  cx: number = SITE_CX,
  cy: number = SITE_CY,
): THREE.Line {
  const positions = points.flatMap(p => {
    const [wx, wz] = siteToWorld(p, cx, cy)
    return [wx, y, wz]
  })
  const [closex, closez] = siteToWorld(points[0], cx, cy)
  positions.push(closex, y, closez)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 2, gapSize: 1, linewidth: 1 })
    : new THREE.LineBasicMaterial({ color, linewidth: 1 })

  const line = new THREE.Line(geometry, material)
  if (dashed) line.computeLineDistances()
  return line
}

export function addSiteOverlays(scene: THREE.Scene, siteConfig?: ViewerSiteConfig) {
  const origBoundary = siteConfig?.originalBoundary ?? ORIGINAL_BOUNDARY
  const offsetBoundary = siteConfig?.offsetBoundary ?? OFFSET_BOUNDARY
  const cx = siteConfig?.centroidX ?? SITE_CX
  const cy = siteConfig?.centroidY ?? SITE_CY

  scene.add(createBoundaryLine(origBoundary, 0xff4444, true, 0.1, cx, cy))
  scene.add(createBoundaryLine(offsetBoundary, 0x3b82f6, false, 0.1, cx, cy))

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d4, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(0, -0.01, 0)
  ground.receiveShadow = true
  scene.add(ground)
}
