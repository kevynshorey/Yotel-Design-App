'use client'

import { useState, useMemo } from 'react'
import type { DesignOption, Wing, Floor, FloorUse } from '@/engine/types'
import { CONSTRUCTION, CORE, FOH, BOH } from '@/config/construction'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'

interface FloorPlanProps {
  option: DesignOption | null
  floorIndex: number
  onFloorChange: (index: number) => void
}

// Constants
const EXT_WALL = CONSTRUCTION.extWall           // 0.4m
const CORRIDOR_W = CONSTRUCTION.corridorWidth    // 1.6m
const CORE_AREA = CORE.areaPerFloor              // 40m^2
const CORE_SIDE = Math.round(Math.sqrt(CORE_AREA) * 10) / 10 // ~6.3m
const STAIR_W = 2.5
const STAIR_D = 3.5

// Colours
const COLORS = {
  yotel: '#2dd4bf',      // teal-400
  pad: '#fb923c',        // orange-400 (coral)
  accessible: '#fbbf24', // amber-400
  corridor: '#475569',   // slate-600
  core: '#64748b',       // slate-500
  stairs: '#94a3b8',     // slate-400
  foh: '#d4a574',        // warm sand
  boh: '#94a3b8',        // cool gray
  wall: '#334155',       // slate-700
  wing: '#1e293b',       // slate-800
} as const

// Legend items
const LEGEND_ITEMS = [
  { label: 'YOTEL Room', color: COLORS.yotel },
  { label: 'PAD Unit', color: COLORS.pad },
  { label: 'Accessible', color: COLORS.accessible },
  { label: 'Corridor', color: COLORS.corridor },
  { label: 'Core', color: COLORS.core },
  { label: 'FOH', color: COLORS.foh },
  { label: 'BOH', color: COLORS.boh },
  { label: 'Studio', color: '#d946ef' },
  { label: 'Entertainment', color: '#a78bfa' },
  { label: 'Retail', color: '#a3e635' },
]

// FOH zones for ground floor — residential block
const FOH_ZONES = [
  { label: 'Mission Control', area: FOH.missionControl, color: COLORS.foh },
  { label: 'Komyuniti Restaurant', area: FOH.komyuniti, color: COLORS.foh },
  { label: 'Grab & Go Market', area: FOH.grabAndGo, color: '#a3e635' },
  { label: 'Komyuniti Lounge', area: FOH.komyunitiLounge, color: COLORS.foh },
  { label: 'Public WC', area: FOH.publicWC, color: COLORS.foh },
]

// First floor amenity block spaces
const AMENITY_UPPER_ZONES = [
  { label: 'Gym', area: FOH.gym, color: '#fb7185' },
  { label: 'Recording Studio', area: FOH.recordingStudio, color: '#d946ef' },
  { label: 'Podcast Studio', area: FOH.podcastStudio, color: '#d946ef' },
  { label: 'Sim Racing Room', area: FOH.simRacingRoom, color: '#a78bfa' },
  { label: 'Business Centre', area: FOH.businessCenter, color: '#34d399' },
]

const BOH_ZONES = [
  { label: 'Kitchen', area: BOH.mainKitchen, color: COLORS.boh },
  { label: 'Housekeeping', area: BOH.housekeeping, color: COLORS.boh },
  { label: 'Admin', area: BOH.backOffice + BOH.generalManager, color: COLORS.boh },
  { label: 'Plant', area: BOH.mainPlantRoom, color: COLORS.boh },
  { label: 'Staff', area: BOH.staffBreakRoom + BOH.maleChanging + BOH.femaleChanging, color: COLORS.boh },
]

function getFloorLabel(index: number, totalFloors: number): string {
  if (index === 0) return 'G'
  if (index === totalFloors - 1) return 'R'
  return String(index)
}

/** Render rooms inside a wing rectangle for upper floors */
function renderWingRooms(
  wing: Wing,
  floor: Floor,
  corridorType: 'single_loaded' | 'double_loaded',
): React.ReactNode[] {
  const elements: React.ReactNode[] = []

  // Wing local coordinates
  const isEW = wing.direction === 'EW'
  const wLen = wing.length
  const wWid = wing.width
  const wx = wing.x
  const wy = wing.y

  // Core at one end (east end for EW, south end for NS)
  const coreX = isEW ? wx + wLen - CORE_SIDE - EXT_WALL : wx + (wWid - CORE_SIDE) / 2
  const coreY = isEW ? wy + (wWid - CORE_SIDE) / 2 : wy + wLen - CORE_SIDE - EXT_WALL

  elements.push(
    <rect
      key={`core-${wing.id}`}
      x={coreX}
      y={coreY}
      width={CORE_SIDE}
      height={CORE_SIDE}
      fill={COLORS.core}
      stroke={COLORS.wall}
      strokeWidth={0.15}
    />,
    <text
      key={`core-label-${wing.id}`}
      x={coreX + CORE_SIDE / 2}
      y={coreY + CORE_SIDE / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill="white"
      fontSize={1.2}
      fontWeight={600}
    >
      Core
    </text>,
  )

  // Stairs near core
  const stairOffsetX = isEW ? coreX - STAIR_W - 0.5 : coreX - STAIR_W - 0.5
  const stairOffsetY = isEW ? wy + EXT_WALL : coreY - STAIR_D - 0.5
  elements.push(
    <rect
      key={`stair1-${wing.id}`}
      x={stairOffsetX}
      y={stairOffsetY}
      width={STAIR_W}
      height={STAIR_D}
      fill={COLORS.stairs}
      stroke={COLORS.wall}
      strokeWidth={0.1}
    />,
    <rect
      key={`stair2-${wing.id}`}
      x={stairOffsetX}
      y={isEW ? wy + wWid - EXT_WALL - STAIR_D : stairOffsetY - STAIR_D - 0.5}
      width={STAIR_W}
      height={STAIR_D}
      fill={COLORS.stairs}
      stroke={COLORS.wall}
      strokeWidth={0.1}
    />,
  )

  // Corridor along long axis
  if (isEW) {
    const corrY = wy + (wWid - CORRIDOR_W) / 2
    elements.push(
      <rect
        key={`corr-${wing.id}`}
        x={wx + EXT_WALL}
        y={corrY}
        width={wLen - 2 * EXT_WALL}
        height={CORRIDOR_W}
        fill={COLORS.corridor}
        stroke={COLORS.wall}
        strokeWidth={0.1}
      />,
    )

    // Rooms on each side
    const usableLen = wLen - 2 * EXT_WALL - CORE_SIDE - 1
    const sides = corridorType === 'double_loaded' ? 2 : 1
    const roomTypes = floor.use === 'YOTEL' ? YOTEL_ROOMS : YOTELPAD_UNITS

    const avgBayWidth = Object.values(roomTypes).reduce((s, r) => s + r.bayWidth * r.pct, 0)
    const roomCount = Math.floor(usableLen / avgBayWidth)

    // South side rooms
    const southRoomDepth = (wWid - CORRIDOR_W) / 2 - EXT_WALL
    let xCursor = wx + EXT_WALL
    for (let i = 0; i < roomCount; i++) {
      const roomColor = getRoomColor(i, roomCount, floor.use)
      elements.push(
        <rect
          key={`room-s-${wing.id}-${i}`}
          x={xCursor}
          y={wy + EXT_WALL}
          width={avgBayWidth}
          height={southRoomDepth}
          fill={roomColor}
          stroke={COLORS.wall}
          strokeWidth={0.1}
          opacity={0.85}
        />,
      )
      xCursor += avgBayWidth
    }

    // North side rooms (double loaded)
    if (sides === 2) {
      const northY = corrY + CORRIDOR_W
      const northDepth = wWid - EXT_WALL - (corrY + CORRIDOR_W - wy)
      xCursor = wx + EXT_WALL
      for (let i = 0; i < roomCount; i++) {
        const roomColor = getRoomColor(i, roomCount, floor.use)
        elements.push(
          <rect
            key={`room-n-${wing.id}-${i}`}
            x={xCursor}
            y={northY}
            width={avgBayWidth}
            height={northDepth}
            fill={roomColor}
            stroke={COLORS.wall}
            strokeWidth={0.1}
            opacity={0.85}
          />,
        )
        xCursor += avgBayWidth
      }
    }
  } else {
    // NS direction — corridor along length (vertical)
    const corrX = wx + (wWid - CORRIDOR_W) / 2
    elements.push(
      <rect
        key={`corr-${wing.id}`}
        x={corrX}
        y={wy + EXT_WALL}
        width={CORRIDOR_W}
        height={wLen - 2 * EXT_WALL}
        fill={COLORS.corridor}
        stroke={COLORS.wall}
        strokeWidth={0.1}
      />,
    )

    const usableLen = wLen - 2 * EXT_WALL - CORE_SIDE - 1
    const sides = corridorType === 'double_loaded' ? 2 : 1
    const roomTypes = floor.use === 'YOTEL' ? YOTEL_ROOMS : YOTELPAD_UNITS
    const avgBayWidth = Object.values(roomTypes).reduce((s, r) => s + r.bayWidth * r.pct, 0)
    const roomCount = Math.floor(usableLen / avgBayWidth)

    // West side rooms
    const westRoomDepth = (wWid - CORRIDOR_W) / 2 - EXT_WALL
    let yCursor = wy + EXT_WALL
    for (let i = 0; i < roomCount; i++) {
      const roomColor = getRoomColor(i, roomCount, floor.use)
      elements.push(
        <rect
          key={`room-w-${wing.id}-${i}`}
          x={wx + EXT_WALL}
          y={yCursor}
          width={westRoomDepth}
          height={avgBayWidth}
          fill={roomColor}
          stroke={COLORS.wall}
          strokeWidth={0.1}
          opacity={0.85}
        />,
      )
      yCursor += avgBayWidth
    }

    // East side rooms (double loaded)
    if (sides === 2) {
      const eastX = corrX + CORRIDOR_W
      const eastDepth = wWid - EXT_WALL - (corrX + CORRIDOR_W - wx)
      yCursor = wy + EXT_WALL
      for (let i = 0; i < roomCount; i++) {
        const roomColor = getRoomColor(i, roomCount, floor.use)
        elements.push(
          <rect
            key={`room-e-${wing.id}-${i}`}
            x={eastX}
            y={yCursor}
            width={eastDepth}
            height={avgBayWidth}
            fill={roomColor}
            stroke={COLORS.wall}
            strokeWidth={0.1}
            opacity={0.85}
          />,
        )
        yCursor += avgBayWidth
      }
    }
  }

  return elements
}

/** Get room colour based on position in the mix */
function getRoomColor(index: number, total: number, use: FloorUse): string {
  // Accessible rooms at ~9% = last 9% of rooms
  const accessibleStart = Math.floor(total * 0.91)
  if (index >= accessibleStart) return COLORS.accessible
  return use === 'YOTEL' ? COLORS.yotel : COLORS.pad
}

/** Render ground floor FOH/BOH zones */
function renderGroundFloor(wings: Wing[]): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  if (wings.length === 0) return elements

  // Use the first wing as the primary ground floor container
  const mainWing = wings[0]
  const isEW = mainWing.direction === 'EW'
  const wLen = isEW ? mainWing.length : mainWing.width
  const wWid = isEW ? mainWing.width : mainWing.length
  const wx = mainWing.x
  const wy = mainWing.y

  // Split wing into FOH (west/beach side) and BOH (east/road side)
  const fohWidth = wLen * 0.6
  const bohWidth = wLen * 0.4

  // Render FOH zones stacked vertically in the west portion
  let yCursor = wy + EXT_WALL
  const fohZoneHeight = (wWid - 2 * EXT_WALL) / FOH_ZONES.length
  for (let i = 0; i < FOH_ZONES.length; i++) {
    const zone = FOH_ZONES[i]
    elements.push(
      <rect
        key={`foh-${i}`}
        x={wx + EXT_WALL}
        y={yCursor}
        width={fohWidth - EXT_WALL}
        height={fohZoneHeight - 0.3}
        fill={zone.color}
        stroke={COLORS.wall}
        strokeWidth={0.1}
        opacity={0.75}
      />,
      <text
        key={`foh-label-${i}`}
        x={wx + EXT_WALL + (fohWidth - EXT_WALL) / 2}
        y={yCursor + fohZoneHeight / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1e293b"
        fontSize={1.1}
        fontWeight={600}
      >
        {zone.label} ({zone.area}m\u00B2)
      </text>,
    )
    yCursor += fohZoneHeight
  }

  // Render BOH zones in the east portion
  yCursor = wy + EXT_WALL
  const bohZoneHeight = (wWid - 2 * EXT_WALL) / BOH_ZONES.length
  const bohX = wx + fohWidth
  for (let i = 0; i < BOH_ZONES.length; i++) {
    const zone = BOH_ZONES[i]
    elements.push(
      <rect
        key={`boh-${i}`}
        x={bohX}
        y={yCursor}
        width={bohWidth - EXT_WALL}
        height={bohZoneHeight - 0.3}
        fill={zone.color}
        stroke={COLORS.wall}
        strokeWidth={0.1}
        opacity={0.65}
      />,
      <text
        key={`boh-label-${i}`}
        x={bohX + (bohWidth - EXT_WALL) / 2}
        y={yCursor + bohZoneHeight / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1e293b"
        fontSize={1.0}
        fontWeight={500}
      >
        {zone.label} ({zone.area}m\u00B2)
      </text>,
    )
    yCursor += bohZoneHeight
  }

  // Dividing line between FOH and BOH
  elements.push(
    <line
      key="foh-boh-divider"
      x1={bohX}
      y1={wy + EXT_WALL}
      x2={bohX}
      y2={wy + wWid - EXT_WALL}
      stroke="#f8fafc"
      strokeWidth={0.2}
      strokeDasharray="0.8 0.4"
    />,
  )

  // Labels
  elements.push(
    <text
      key="foh-title"
      x={wx + EXT_WALL + (fohWidth - EXT_WALL) / 2}
      y={wy - 1}
      textAnchor="middle"
      fill="#d4a574"
      fontSize={1.4}
      fontWeight={700}
    >
      FOH (Front of House)
    </text>,
    <text
      key="boh-title"
      x={bohX + (bohWidth - EXT_WALL) / 2}
      y={wy - 1}
      textAnchor="middle"
      fill="#94a3b8"
      fontSize={1.4}
      fontWeight={700}
    >
      BOH (Back of House)
    </text>,
  )

  // Render additional wings' ground floor simply as labeled zones
  for (let w = 1; w < wings.length; w++) {
    const wing = wings[w]
    const isWingEW = wing.direction === 'EW'
    elements.push(
      <rect
        key={`gf-wing-${w}`}
        x={wing.x + EXT_WALL}
        y={wing.y + EXT_WALL}
        width={(isWingEW ? wing.length : wing.width) - 2 * EXT_WALL}
        height={(isWingEW ? wing.width : wing.length) - 2 * EXT_WALL}
        fill={COLORS.foh}
        stroke={COLORS.wall}
        strokeWidth={0.1}
        opacity={0.5}
      />,
      <text
        key={`gf-wing-label-${w}`}
        x={wing.x + (isWingEW ? wing.length : wing.width) / 2}
        y={wing.y + (isWingEW ? wing.width : wing.length) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e2e8f0"
        fontSize={1.2}
        fontWeight={500}
      >
        {wing.label}
      </text>,
    )
  }

  return elements
}

/** Render amenity block upper floor (Level 1) — studios, gym, sim racing, business centre */
function renderAmenityUpperFloor(wings: Wing[]): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  if (wings.length === 0) return elements

  const mainWing = wings[0]
  const isEW = mainWing.direction === 'EW'
  const wLen = isEW ? mainWing.length : mainWing.width
  const wWid = isEW ? mainWing.width : mainWing.length
  const wx = mainWing.x
  const wy = mainWing.y

  // Render amenity upper zones filling the wing
  const zones = AMENITY_UPPER_ZONES
  const totalArea = zones.reduce((s, z) => s + z.area, 0)
  let xCursor = wx + EXT_WALL
  const availW = wLen - 2 * EXT_WALL
  const zoneH = wWid - 2 * EXT_WALL

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i]
    const zoneW = (zone.area / totalArea) * availW

    elements.push(
      <rect
        key={`amenity-l1-${i}`}
        x={xCursor}
        y={wy + EXT_WALL}
        width={zoneW - 0.3}
        height={zoneH}
        fill={zone.color}
        stroke={COLORS.wall}
        strokeWidth={0.1}
        opacity={0.75}
      />,
      <text
        key={`amenity-l1-label-${i}`}
        x={xCursor + (zoneW - 0.3) / 2}
        y={wy + EXT_WALL + zoneH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1e293b"
        fontSize={1.0}
        fontWeight={600}
      >
        {zone.label} ({zone.area}m\u00B2)
      </text>,
    )
    xCursor += zoneW
  }

  // Title
  elements.push(
    <text
      key="amenity-l1-title"
      x={wx + wLen / 2}
      y={wy - 1}
      textAnchor="middle"
      fill="#d946ef"
      fontSize={1.4}
      fontWeight={700}
    >
      Amenity Block — Level 1
    </text>,
  )

  // Additional wings as labeled zones
  for (let w = 1; w < wings.length; w++) {
    const wing = wings[w]
    const isWingEW = wing.direction === 'EW'
    elements.push(
      <rect
        key={`l1-wing-${w}`}
        x={wing.x + EXT_WALL}
        y={wing.y + EXT_WALL}
        width={(isWingEW ? wing.length : wing.width) - 2 * EXT_WALL}
        height={(isWingEW ? wing.width : wing.length) - 2 * EXT_WALL}
        fill={COLORS.foh}
        stroke={COLORS.wall}
        strokeWidth={0.1}
        opacity={0.5}
      />,
      <text
        key={`l1-wing-label-${w}`}
        x={wing.x + (isWingEW ? wing.length : wing.width) / 2}
        y={wing.y + (isWingEW ? wing.width : wing.length) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e2e8f0"
        fontSize={1.2}
        fontWeight={500}
      >
        {wing.label}
      </text>,
    )
  }

  return elements
}

export function FloorPlan({ option, floorIndex, onFloorChange }: FloorPlanProps) {
  if (!option) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Select a design option to view floor plans</p>
      </div>
    )
  }

  const { wings, floors, metrics } = option
  const totalFloors = floors.length
  const currentFloor = floors.find((f) => f.level === floorIndex) ?? floors[0]
  const isGround = currentFloor.level === 0
  const isRooftop = currentFloor.use === 'ROOFTOP'

  // Compute bounding box
  const pad = 6
  const allCoords = wings.flatMap((w) => {
    const isEW = w.direction === 'EW'
    return [
      { x: w.x, y: w.y },
      {
        x: w.x + (isEW ? w.length : w.width),
        y: w.y + (isEW ? w.width : w.length),
      },
    ]
  })
  const minX = Math.min(...allCoords.map((c) => c.x)) - pad
  const minY = Math.min(...allCoords.map((c) => c.y)) - pad - 3 // extra for labels
  const maxX = Math.max(...allCoords.map((c) => c.x)) + pad
  const maxY = Math.max(...allCoords.map((c) => c.y)) + pad + 4 // extra for scale
  const vbW = maxX - minX
  const vbH = maxY - minY

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* SVG Plan */}
      <div className="flex-1 overflow-hidden p-2">
        <svg
          viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Wing outlines */}
          {wings.map((w) => {
            const isEW = w.direction === 'EW'
            return (
              <rect
                key={`outline-${w.id}`}
                x={w.x}
                y={w.y}
                width={isEW ? w.length : w.width}
                height={isEW ? w.width : w.length}
                fill={COLORS.wing}
                stroke={COLORS.wall}
                strokeWidth={0.25}
              />
            )
          })}

          {/* Floor content */}
          {isGround && renderGroundFloor(wings)}
          {currentFloor.level === 1 && currentFloor.use === 'FOH_BOH' && renderAmenityUpperFloor(wings)}
          {isRooftop && (
            <text
              x={wings[0].x + (wings[0].direction === 'EW' ? wings[0].length : wings[0].width) / 2}
              y={wings[0].y + (wings[0].direction === 'EW' ? wings[0].width : wings[0].length) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#38bdf8"
              fontSize={2}
              fontWeight={700}
            >
              Rooftop Terrace &amp; Pool Deck ({currentFloor.gia}m\u00B2)
            </text>
          )}
          {!isGround &&
            !isRooftop &&
            !(currentFloor.level === 1 && currentFloor.use === 'FOH_BOH') &&
            wings.map((w) => (
              <g key={`rooms-${w.id}`}>
                {renderWingRooms(w, currentFloor, metrics.corridorType)}
              </g>
            ))}

          {/* Dimension labels on wings */}
          {wings.map((w) => {
            const isEW = w.direction === 'EW'
            const wLen = isEW ? w.length : w.width
            const wWid = isEW ? w.width : w.length
            return (
              <g key={`dim-${w.id}`}>
                {/* Length dimension (below wing) */}
                <line
                  x1={w.x}
                  y1={w.y + wWid + 1}
                  x2={w.x + (isEW ? w.length : w.width)}
                  y2={w.y + wWid + 1}
                  stroke="#64748b"
                  strokeWidth={0.1}
                  markerStart="url(#dim-arrow)"
                  markerEnd="url(#dim-arrow)"
                />
                <text
                  x={w.x + (isEW ? w.length : w.width) / 2}
                  y={w.y + wWid + 2.2}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={1.1}
                >
                  {wLen.toFixed(1)}m
                </text>
                {/* Width dimension (left of wing) */}
                <line
                  x1={w.x - 1}
                  y1={w.y}
                  x2={w.x - 1}
                  y2={w.y + (isEW ? w.width : w.length)}
                  stroke="#64748b"
                  strokeWidth={0.1}
                />
                <text
                  x={w.x - 2}
                  y={w.y + (isEW ? w.width : w.length) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={1.1}
                  transform={`rotate(-90, ${w.x - 2}, ${w.y + (isEW ? w.width : w.length) / 2})`}
                >
                  {wWid.toFixed(1)}m
                </text>
              </g>
            )
          })}

          {/* Scale bar */}
          {(() => {
            const scaleY = maxY - 2
            const scaleX = minX + pad
            return (
              <g>
                <line x1={scaleX} y1={scaleY} x2={scaleX + 20} y2={scaleY} stroke="#64748b" strokeWidth={0.15} />
                <line x1={scaleX} y1={scaleY - 0.5} x2={scaleX} y2={scaleY + 0.5} stroke="#64748b" strokeWidth={0.15} />
                <line x1={scaleX + 10} y1={scaleY - 0.3} x2={scaleX + 10} y2={scaleY + 0.3} stroke="#64748b" strokeWidth={0.1} />
                <line x1={scaleX + 20} y1={scaleY - 0.5} x2={scaleX + 20} y2={scaleY + 0.5} stroke="#64748b" strokeWidth={0.15} />
                <text x={scaleX} y={scaleY + 1.5} fill="#94a3b8" fontSize={0.9}>0</text>
                <text x={scaleX + 10} y={scaleY + 1.5} fill="#94a3b8" fontSize={0.9} textAnchor="middle">10m</text>
                <text x={scaleX + 20} y={scaleY + 1.5} fill="#94a3b8" fontSize={0.9} textAnchor="middle">20m</text>
              </g>
            )
          })()}

          {/* Compass */}
          <g transform={`translate(${maxX - 4}, ${minY + 4})`}>
            <circle r={2.5} fill="none" stroke="#475569" strokeWidth={0.1} />
            <line x1={0} y1={1.8} x2={0} y2={-1.8} stroke="#94a3b8" strokeWidth={0.15} />
            <line x1={-1.8} y1={0} x2={1.8} y2={0} stroke="#94a3b8" strokeWidth={0.15} />
            <text x={0} y={-2} textAnchor="middle" fill="#f8fafc" fontSize={1} fontWeight={700}>N</text>
            <text x={0} y={3} textAnchor="middle" fill="#64748b" fontSize={0.7}>S</text>
            <text x={-2.5} y={0.3} textAnchor="middle" fill="#64748b" fontSize={0.7}>W</text>
            <text x={2.5} y={0.3} textAnchor="middle" fill="#64748b" fontSize={0.7}>E</text>
          </g>

          {/* Dimension marker def */}
          <defs>
            <marker id="dim-arrow" markerWidth={2} markerHeight={2} refX={1} refY={1} orient="auto">
              <line x1={0} y1={0} x2={0} y2={2} stroke="#64748b" strokeWidth={0.3} />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 border-t border-slate-800 px-4 py-2">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Floor selector */}
      <div className="flex items-center gap-1 border-t border-slate-800 px-4 py-2">
        <span className="mr-2 text-xs text-slate-500">Floor:</span>
        {floors.map((f) => {
          const label = getFloorLabel(f.level, totalFloors)
          const isActive = f.level === floorIndex
          return (
            <button
              key={f.level}
              onClick={() => onFloorChange(f.level)}
              className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          )
        })}
        <span className="ml-3 text-xs text-slate-500">
          Level {currentFloor.level} &mdash; {currentFloor.use.replace('_', '/')}
          {!isGround && !isRooftop && (
            <> &mdash; {currentFloor.rooms.reduce((s, r) => s + r.count, 0)} rooms</>
          )}
        </span>
      </div>
    </div>
  )
}
