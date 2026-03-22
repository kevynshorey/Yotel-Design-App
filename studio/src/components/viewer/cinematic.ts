import * as THREE from 'three'

export interface CinematicKeyframe {
  position: THREE.Vector3
  target: THREE.Vector3
  duration: number  // seconds for this segment
}

/** Pre-defined cinematic path around the Carlisle Bay site */
export function getCinematicPath(buildingCenter: THREE.Vector3): CinematicKeyframe[] {
  const cx = buildingCenter.x
  const cz = buildingCenter.z

  return [
    // 1. Approach from ocean (west), low angle
    {
      position: new THREE.Vector3(cx - 80, 8, cz),
      target: new THREE.Vector3(cx, 15, cz),
      duration: 4,
    },
    // 2. Rise up over pool deck
    {
      position: new THREE.Vector3(cx - 30, 25, cz + 10),
      target: new THREE.Vector3(cx + 20, 10, cz),
      duration: 3,
    },
    // 3. Sweep around south side
    {
      position: new THREE.Vector3(cx + 20, 40, cz + 60),
      target: new THREE.Vector3(cx, 10, cz),
      duration: 4,
    },
    // 4. High aerial from southeast
    {
      position: new THREE.Vector3(cx + 80, 60, cz + 40),
      target: new THREE.Vector3(cx, 0, cz),
      duration: 4,
    },
    // 5. Swing to northeast, eye-level
    {
      position: new THREE.Vector3(cx + 60, 12, cz - 40),
      target: new THREE.Vector3(cx, 8, cz),
      duration: 3,
    },
    // 6. Return to ocean view, golden hour angle
    {
      position: new THREE.Vector3(cx - 50, 20, cz - 20),
      target: new THREE.Vector3(cx, 12, cz),
      duration: 4,
    },
    // 7. Final overhead plan view
    {
      position: new THREE.Vector3(cx, 100, cz),
      target: new THREE.Vector3(cx, 0, cz),
      duration: 3,
    },
  ]
}

export class CinematicController {
  private camera: THREE.PerspectiveCamera
  private keyframes: CinematicKeyframe[]
  private currentIndex: number = 0
  private progress: number = 0  // 0-1 within current segment
  private playing: boolean = false
  private lastTime: number = 0
  public onComplete?: () => void

  constructor(camera: THREE.PerspectiveCamera, keyframes: CinematicKeyframe[]) {
    this.camera = camera
    this.keyframes = keyframes
  }

  play() {
    this.currentIndex = 0
    this.progress = 0
    this.playing = true
    this.lastTime = performance.now()
  }

  stop() {
    this.playing = false
  }

  get isPlaying() { return this.playing }

  update() {
    if (!this.playing || this.keyframes.length === 0) return

    const now = performance.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now

    const kf = this.keyframes[this.currentIndex]
    this.progress += dt / kf.duration

    if (this.progress >= 1) {
      this.currentIndex++
      this.progress = 0
      if (this.currentIndex >= this.keyframes.length) {
        this.playing = false
        this.onComplete?.()
        return
      }
    }

    // Smooth interpolation (ease in-out)
    const t = this.smoothstep(this.progress)

    // Get current and next keyframe
    const from = this.currentIndex === 0
      ? this.keyframes[0]
      : this.keyframes[this.currentIndex - 1]
    const to = this.keyframes[this.currentIndex]

    // Interpolate position
    this.camera.position.lerpVectors(
      this.currentIndex === 0 && this.progress < 0.01 ? to.position : from.position,
      to.position,
      t,
    )

    // Interpolate look target
    const targetPos = new THREE.Vector3().lerpVectors(
      this.currentIndex === 0 && this.progress < 0.01 ? to.target : from.target,
      to.target,
      t,
    )
    this.camera.lookAt(targetPos)
  }

  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t)
  }
}
