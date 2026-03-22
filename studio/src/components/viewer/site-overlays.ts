import * as THREE from 'three'
import { ORIGINAL_BOUNDARY, OFFSET_BOUNDARY } from '@/config/site'
import type { Point2D } from '@/engine/types'

/** Map site coordinates to Three.js world coordinates.
 *  Revit/Dynamo: +X = East, +Y = North
 *  Three.js:     +X = East, +Z = South (i.e. -Y)
 *  We negate Y → Z so north stays north on the satellite basemap. */
function siteToWorld(p: Point2D): [number, number] {
  return [p.x, -p.y]
}

function createBoundaryLine(
  points: Point2D[],
  color: number,
  dashed: boolean = false,
  y: number = 0.1,
): THREE.Line {
  const positions = points.flatMap(p => {
    const [wx, wz] = siteToWorld(p)
    return [wx, y, wz]
  })
  const [cx, cz] = siteToWorld(points[0])
  positions.push(cx, y, cz)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 2, gapSize: 1, linewidth: 1 })
    : new THREE.LineBasicMaterial({ color, linewidth: 1 })

  const line = new THREE.Line(geometry, material)
  if (dashed) line.computeLineDistances()
  return line
}

export function addSiteOverlays(scene: THREE.Scene) {
  scene.add(createBoundaryLine(ORIGINAL_BOUNDARY, 0xff4444, true))
  scene.add(createBoundaryLine(OFFSET_BOUNDARY, 0x3b82f6, false))

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d4, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(60, -0.01, -30)
  ground.receiveShadow = true
  scene.add(ground)
}
