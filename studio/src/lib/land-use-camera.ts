import * as THREE from 'three'

/** Horizontal compass around site origin; +X = East, +Z = South, −Z = North (matches site overlays). */
export type LandUseCompass = 'top' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

/** Plan (2D) orientation — which world direction points to the top of the screen. */
export type LandUsePlanCardinal = 'N' | 'E' | 'S' | 'W'

const R = 108
const H = 42
const PLAN_HEIGHT = 158

const COMPASS_DEG: Record<Exclude<LandUseCompass, 'top'>, number> = {
  N: -90,
  NE: -45,
  E: 0,
  SE: 45,
  S: 90,
  SW: 135,
  W: 180,
  NW: -135,
}

export function setPerspectiveFromCompass(
  camera: THREE.PerspectiveCamera,
  dir: Exclude<LandUseCompass, 'top'>,
) {
  const deg = COMPASS_DEG[dir]
  const rad = (deg * Math.PI) / 180
  const x = R * Math.cos(rad)
  const z = R * Math.sin(rad)
  camera.position.set(x, H, z)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
}

/** Top-down orthographic frustum (call `setPlanViewUp` after for north-up / rotated plan). */
export function configurePlanOrthographic(
  camera: THREE.OrthographicCamera,
  width: number,
  height: number,
  zoom = 1,
) {
  const aspect = width / Math.max(height, 1)
  const fr = 72 / zoom
  camera.left = (-fr * aspect) / 1
  camera.right = (fr * aspect) / 1
  camera.top = fr
  camera.bottom = -fr
  camera.near = 0.5
  camera.far = 4000
  camera.updateProjectionMatrix()
}

/**
 * Ortho camera above origin; `camera.up` sets which horizontal axis is “screen up”
 * (N = survey north / world −Z toward top of view).
 */
export function setPlanViewUp(camera: THREE.OrthographicCamera, cardinal: LandUsePlanCardinal) {
  switch (cardinal) {
    case 'N':
      camera.up.set(0, 0, -1)
      break
    case 'S':
      camera.up.set(0, 0, 1)
      break
    case 'E':
      camera.up.set(1, 0, 0)
      break
    case 'W':
      camera.up.set(-1, 0, 0)
      break
  }
  camera.position.set(0, PLAN_HEIGHT, 0)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
}

export function defaultPerspectiveOverview(camera: THREE.PerspectiveCamera) {
  camera.position.set(92, 88, 92)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
}
