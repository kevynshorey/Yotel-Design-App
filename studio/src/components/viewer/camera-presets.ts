import type { CameraPreset } from '@/engine/types'

export const CAMERA_PRESETS: CameraPreset[] = [
  { name: '3D', group: '3D', position: [120, 80, 120], target: [75, 0, 33], isOrthographic: false },
  { name: 'SE Iso', group: '3D', position: [160, 60, -20], target: [75, 0, 33], isOrthographic: false },
  { name: 'NW Iso', group: '3D', position: [-10, 60, 90], target: [75, 0, 33], isOrthographic: false },
  { name: 'West', group: 'Elevations', position: [-40, 20, 33], target: [75, 0, 33], isOrthographic: false },
  { name: 'East', group: 'Elevations', position: [190, 20, 33], target: [75, 0, 33], isOrthographic: false },
  { name: 'South', group: 'Elevations', position: [75, 20, -40], target: [75, 0, 33], isOrthographic: false },
  { name: 'North', group: 'Elevations', position: [75, 20, 100], target: [75, 0, 33], isOrthographic: false },
  { name: 'Site Plan', group: 'Plans', position: [75, 150, 33], target: [75, 0, 33], isOrthographic: true },
  { name: 'Floor Plan', group: 'Plans', position: [75, 30, 33], target: [75, 0, 33], isOrthographic: true },
]
