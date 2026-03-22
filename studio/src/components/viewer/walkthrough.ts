import * as THREE from 'three'

export class WalkthroughController {
  camera: THREE.PerspectiveCamera
  domElement: HTMLElement
  enabled: boolean = false

  moveSpeed: number = 0.3      // metres per frame
  lookSpeed: number = 0.002    // radians per pixel
  eyeHeight: number = 1.7     // metres (standing eye level)

  private keys: Set<string> = new Set()
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ')
  private isLocked: boolean = false
  private _cleanupFns: (() => void)[] = []

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera
    this.domElement = domElement
  }

  enable(startPosition?: THREE.Vector3) {
    this.enabled = true
    if (startPosition) {
      this.camera.position.copy(startPosition)
      this.camera.position.y = this.eyeHeight
    }
    this.euler.setFromQuaternion(this.camera.quaternion)

    // Keyboard listeners
    const onKeyDown = (e: KeyboardEvent) => { this.keys.add(e.code) }
    const onKeyUp = (e: KeyboardEvent) => { this.keys.delete(e.code) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    // Pointer lock for mouse look
    const onCanvasClick = () => {
      if (this.enabled) this.domElement.requestPointerLock()
    }
    this.domElement.addEventListener('click', onCanvasClick)

    const onPointerLockChange = () => {
      this.isLocked = document.pointerLockElement === this.domElement
    }
    document.addEventListener('pointerlockchange', onPointerLockChange)

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isLocked || !this.enabled) return
      this.euler.y -= e.movementX * this.lookSpeed
      this.euler.x -= e.movementY * this.lookSpeed
      this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))
      this.camera.quaternion.setFromEuler(this.euler)
    }
    document.addEventListener('mousemove', onMouseMove)

    this._cleanupFns = [
      () => document.removeEventListener('keydown', onKeyDown),
      () => document.removeEventListener('keyup', onKeyUp),
      () => this.domElement.removeEventListener('click', onCanvasClick),
      () => document.removeEventListener('pointerlockchange', onPointerLockChange),
      () => document.removeEventListener('mousemove', onMouseMove),
    ]
  }

  disable() {
    this.enabled = false
    this.keys.clear()
    if (document.pointerLockElement) document.exitPointerLock()
    this._cleanupFns.forEach(fn => fn())
    this._cleanupFns = []
  }

  update() {
    if (!this.enabled) return

    const direction = new THREE.Vector3()
    const right = new THREE.Vector3()

    this.camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0))

    const velocity = new THREE.Vector3()

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) velocity.add(direction)
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) velocity.sub(direction)
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) velocity.sub(right)
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) velocity.add(right)

    if (velocity.length() > 0) {
      velocity.normalize().multiplyScalar(this.moveSpeed)
      this.camera.position.add(velocity)
      this.camera.position.y = this.eyeHeight // lock to eye height
    }
  }
}
