import * as THREE from 'three'

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  return renderer
}

export function createCamera(aspect: number) {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000)
  camera.position.set(120, 80, 120)
  camera.lookAt(75, 0, 33)
  return camera
}

export function createLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 1.2)
  directional.position.set(50, 100, 50)
  directional.castShadow = true
  directional.shadow.mapSize.set(2048, 2048)
  directional.shadow.camera.near = 0.5
  directional.shadow.camera.far = 500
  directional.shadow.camera.left = -100
  directional.shadow.camera.right = 100
  directional.shadow.camera.top = 100
  directional.shadow.camera.bottom = -100
  scene.add(directional)

  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x555555, 0.4)
  scene.add(hemi)
}
