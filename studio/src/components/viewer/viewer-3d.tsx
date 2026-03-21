'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createRenderer, createCamera, createLights } from './scene-setup'
import { loadBasemapTiles } from './basemap'
import { addSiteOverlays } from './site-overlays'
import type { DesignOption } from '@/engine/types'

interface Viewer3DProps {
  selectedOption?: DesignOption | null
  className?: string
}

export function Viewer3D({ selectedOption, className }: Viewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const buildingGroupRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)
    sceneRef.current = scene

    const renderer = createRenderer(canvas)
    const camera = createCamera(canvas.clientWidth / canvas.clientHeight)
    createLights(scene)
    loadBasemapTiles(scene, 'Satellite')
    addSiteOverlays(scene)

    const buildingGroup = new THREE.Group()
    scene.add(buildingGroup)
    buildingGroupRef.current = buildingGroup

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(75, 0, 33)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.maxPolarAngle = Math.PI / 2.1

    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(canvas)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    let frameId: number
    function animate() {
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    const group = buildingGroupRef.current
    if (!group) return

    while (group.children.length) group.remove(group.children[0])

    if (!selectedOption) return

    const GROUND_H = 4.5
    const FLOOR_H = 3.2
    const COLORS: Record<string, number> = {
      FOH_BOH: 0x7A9A70,
      YOTEL: 0x2E8A76,
      YOTELPAD: 0xB8456A,
      ROOFTOP: 0x94a3b8,
    }

    const { wings } = selectedOption
    for (const wing of wings) {
      let currentY = 0
      for (const floor of selectedOption.floors) {
        const h = floor.level === 0 ? GROUND_H : FLOOR_H
        const color = COLORS[floor.use] ?? 0xcccccc

        const geometry = new THREE.BoxGeometry(
          wing.direction === 'EW' ? wing.length : wing.width,
          h - 0.1,
          wing.direction === 'EW' ? wing.width : wing.length,
        )
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.1,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          wing.x + (wing.direction === 'EW' ? wing.length / 2 : wing.width / 2) + 65,
          currentY + h / 2,
          wing.y + (wing.direction === 'EW' ? wing.width / 2 : wing.length / 2) + 9,
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        group.add(mesh)

        const edges = new THREE.EdgesGeometry(geometry)
        const lineMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.3 })
        const wireframe = new THREE.LineSegments(edges, lineMat)
        wireframe.position.copy(mesh.position)
        group.add(wireframe)

        currentY += h
      }
    }
  }, [selectedOption])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
