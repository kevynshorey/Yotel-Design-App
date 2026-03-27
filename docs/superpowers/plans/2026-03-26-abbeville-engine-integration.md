# Abbeville Engine Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Abbeville YOTELPAD as a second project in the studio engine, selectable alongside the existing Carlisle Bay project.

**Architecture:** Create a project config system that routes all engine functions to project-specific config files. Abbeville gets its own site, programme, financials, and rules configs. The engine remains project-agnostic — it reads from whichever project config is active. A project selector in the UI switches between projects.

**Tech Stack:** TypeScript, Next.js App Router (existing studio app), React state for project selection

---

### Task 1: Create Project Type and Config Router

**Files:**
- Create: `studio/src/config/projects.ts`
- Modify: `studio/src/engine/types.ts` (add ProjectId type)

- [ ] **Step 1: Add ProjectId type**

In `studio/src/engine/types.ts`, add at the top after existing type exports:

```typescript
export type ProjectId = 'carlisle-bay' | 'abbeville'
```

- [ ] **Step 2: Create project config router**

Create `studio/src/config/projects.ts`:

```typescript
import type { ProjectId } from '@/engine/types'

// Carlisle Bay configs (existing)
import { SITE as CB_SITE, PLANNING_REGS as CB_REGS, OFFSETS as CB_OFFSETS, ORIGINAL_BOUNDARY as CB_BOUNDARY, OFFSET_BOUNDARY as CB_OFFSET_BOUNDARY, BUILDING_PLACEMENT as CB_PLACEMENT, TAX_INCENTIVES as CB_TAX } from './site'
import { YOTEL_ROOMS as CB_YT_ROOMS, YOTELPAD_UNITS as CB_PAD_UNITS, PROGRAMME as CB_PROGRAMME } from './programme'

// Abbeville configs (new)
import { SITE as AB_SITE, PLANNING_REGS as AB_REGS, OFFSETS as AB_OFFSETS, ORIGINAL_BOUNDARY as AB_BOUNDARY, OFFSET_BOUNDARY as AB_OFFSET_BOUNDARY, BUILDING_PLACEMENT as AB_PLACEMENT, TAX_INCENTIVES as AB_TAX } from './abbeville/site'
import { PAD_UNITS as AB_PAD_UNITS, PROGRAMME as AB_PROGRAMME } from './abbeville/programme'

export interface ProjectConfig {
  id: ProjectId
  name: string
  site: typeof CB_SITE
  planningRegs: typeof CB_REGS
  offsets: typeof CB_OFFSETS
  boundary: typeof CB_BOUNDARY
  offsetBoundary: typeof CB_OFFSET_BOUNDARY
  buildingPlacement: typeof CB_PLACEMENT
  taxIncentives: typeof CB_TAX
  programme: typeof CB_PROGRAMME
  roomTypes: Record<string, any>
}

export const PROJECTS: Record<ProjectId, { name: string; description: string }> = {
  'carlisle-bay': {
    name: 'YOTEL + YOTELPAD Carlisle Bay',
    description: '130 keys | Bridgetown | YOTEL city + YOTELPAD extended-stay',
  },
  'abbeville': {
    name: 'YOTELPAD Abbeville',
    description: '60 units | Worthing | 4 towers | YOTELPAD resort',
  },
}

export function getProjectConfig(id: ProjectId) {
  switch (id) {
    case 'carlisle-bay':
      return {
        id,
        name: PROJECTS[id].name,
        site: CB_SITE,
        planningRegs: CB_REGS,
        offsets: CB_OFFSETS,
        boundary: CB_BOUNDARY,
        offsetBoundary: CB_OFFSET_BOUNDARY,
        buildingPlacement: CB_PLACEMENT,
        taxIncentives: CB_TAX,
        programme: CB_PROGRAMME,
        roomTypes: { yotel: CB_YT_ROOMS, yotelpad: CB_PAD_UNITS },
      }
    case 'abbeville':
      return {
        id,
        name: PROJECTS[id].name,
        site: AB_SITE,
        planningRegs: AB_REGS,
        offsets: AB_OFFSETS,
        boundary: AB_BOUNDARY,
        offsetBoundary: AB_OFFSET_BOUNDARY,
        buildingPlacement: AB_PLACEMENT,
        taxIncentives: AB_TAX,
        programme: AB_PROGRAMME,
        roomTypes: { yotelpad: AB_PAD_UNITS },
      }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add studio/src/engine/types.ts studio/src/config/projects.ts
git commit -m "feat: add project config router for multi-project support"
```

---

### Task 2: Create Abbeville Site Config

**Files:**
- Create: `studio/src/config/abbeville/site.ts`

- [ ] **Step 1: Create Abbeville site config**

Create `studio/src/config/abbeville/site.ts` with all v4 Campus Design parameters:

```typescript
import type { Point2D } from '@/engine/types'

/** Abbeville site boundary — approximated from plot plan + aerial.
 *  GPS: 13.073710, -59.587430 | Worthing, Christ Church, Barbados */
export const ORIGINAL_BOUNDARY: Point2D[] = [
  // Approximate 8-vertex polygon from plot plan overlay
  // Worthing Main Road (south), Side Road (east), Private Road (north), boundary (west)
  { x: 0, y: 0 },        // SW corner (Worthing Main Rd + west boundary)
  { x: 55, y: 0 },       // SE corner (Worthing Main Rd + Side Road)
  { x: 58, y: 10 },      // NE jog at side road
  { x: 60, y: 55 },      // NE corner (Side Road + Private Road)
  { x: 5, y: 60 },       // NW corner (Private Road + west boundary)
  { x: 0, y: 50 },       // West boundary jog
  { x: -2, y: 30 },      // West boundary mid
  { x: 0, y: 0 },        // Close polygon
]

/** Offset boundary (buildable zone) — after setbacks.
 *  South: 10m (Hwy 7 Class I-III), East: 5m, North: 3m, West: 3m */
export const OFFSET_BOUNDARY: Point2D[] = [
  { x: 3, y: 10 },       // SW (3m west + 10m south setback)
  { x: 50, y: 10 },      // SE
  { x: 53, y: 15 },      // East jog
  { x: 55, y: 52 },      // NE
  { x: 8, y: 57 },       // NW
  { x: 3, y: 47 },       // West jog
  { x: 1, y: 30 },       // West mid
  { x: 3, y: 10 },       // Close
]

export const BUILDING_PLACEMENT = { x: 3, y: 10, rotDeg: 30 } as const

export const OFFSETS = { W: 3, N: 3, E: 5, S: 10 } as const

export const SITE = {
  grossArea: 4008,        // m² (43,137 sf)
  buildableArea: 3036,    // m² (after setbacks)
  maxCoverage: 0.50,      // commercial (GDO)
  maxFootprint: 1518,     // 50% of buildable
  maxHeight: 20.5,        // metres (5 floors + podium, PDP Urban Corridor)
  buildableEW: 52,        // approximate
  buildableNS: 47,        // approximate
  buildableMinX: 3,
  buildableMaxX: 55,
  buildableMinY: 10,
  buildableMaxY: 57,
  beachSide: 'SW' as const,
  centroidX: 29,
  centroidY: 33.5,
} as const

export const PLANNING_REGS = {
  coastalSetback: 0,              // no coastal constraint (sponsor confirmed)
  maxCoverage: 0.50,              // commercial/tourism
  maxHeight: 20.5,                // metres
  heightPrecedent: { iRArchitecture: 8 },
  roadSetbackClassI: 15.24,
  roadSetbackClassII: 9.75,
  roadSetbackClassIII: 5.79,
  sideSetback: 1.83,
  rearSetback: 1.83,
  eiaRequired: true,
  heritageZoneProximity: false,
  parkingRatioMin: 0.25,
  parkingRatioMax: 0.5,
} as const

export const TAX_INCENTIVES = {
  dutyFreeImports: false,         // TBD — depends on SDA confirmation
  vatExempt: false,               // TBD
  capitalWriteOff: 15,
  interestDeduction: 1.5,
  equipmentTaxCredit: 0,
  tourismDevAct: true,            // available anywhere in Barbados
  sdaStatus: 'pending' as const,  // may be within St. Lawrence Gap SDA
} as const
```

- [ ] **Step 2: Commit**

```bash
git add studio/src/config/abbeville/site.ts
git commit -m "feat: add Abbeville site config (v4 campus design parameters)"
```

---

### Task 3: Create Abbeville Programme Config

**Files:**
- Create: `studio/src/config/abbeville/programme.ts`

- [ ] **Step 1: Create Abbeville programme config**

Create `studio/src/config/abbeville/programme.ts` with v4 unit types and mix:

```typescript
import type { RoomType } from '@/engine/types'

/** YOTELPAD unit types for Abbeville — YOTELPAD brand sizes, Barbados resort mix.
 *  Source: YOTEL Feasibility Guidelines D01-C08 (Feb 2025) */
export const PAD_UNITS: Record<string, RoomType> = {
  PadStudio: {
    label: 'PAD Studio',
    nia: 23,              // m² (D01-C08 p.45: 3,425×6,700mm)
    bayWidth: 3.67,       // m (standard YOTELPAD bay)
    bays: 1,
    pct: 0.20,            // 12 of 60 = 20%
    color: '#2a5a8a',
  },
  Pad1Bed: {
    label: 'PAD 1-Bed',
    nia: 34,              // m² (D01-C08 p.47: 4,800×7,070mm)
    bayWidth: 4.80,
    bays: 1,
    pct: 0.33,            // 20 of 60 = 33%
    color: '#3a6a9a',
  },
  Pad2Bed: {
    label: 'PAD 2-Bed',
    nia: 48,              // m² (Barbados bespoke: ~6,500×7,070mm)
    bayWidth: 6.50,
    bays: 2,
    pct: 0.27,            // 16 of 60 = 27%
    color: '#4a7aaa',
  },
  PadAccessible: {
    label: 'PAD Accessible',
    nia: 27,              // m² (D01-C08 p.48: 4,010×6,700mm)
    bayWidth: 4.01,
    bays: 1,
    pct: 0.07,            // 4 of 60 = 7%
    color: '#5a8aba',
  },
  Pad1BedLongStay: {
    label: 'PAD 1-Bed LS',
    nia: 34,              // same physical unit as Pad1Bed, different lease model
    bayWidth: 4.80,
    bays: 1,
    pct: 0.13,            // 8 of 60 = 13%
    color: '#6a9aca',
  },
}

/** Building programme — 4 identical towers, 5 floors each, ground podium */
export const PROGRAMME = {
  totalUnits: 60,
  towers: 4,
  unitsPerTower: 15,
  floorsPerTower: 5,
  unitsPerFloor: 3,
  groundFloorUse: 'AMENITY_RETAIL' as const,
  rooftop: false,
  towerFootprint: 147,    // m² GIA per floor (constant — all floors identical)
  coreArea: 23,           // m² (2 stairs + service lift + riser 2.5m² + linen + LAN + chute)
  corridorWidth: 1.6,     // m (YOTELPAD standard)
  stairsPerTower: 2,      // fire compliant
  liftsPerTower: 2,       // 1 passenger + 1 service
  floorToFloor: 3.2,      // m
  groundFloorHeight: 4.5, // m
  buildingRotation: 30,   // degrees off road grid (iR Architecture concept)
  podiumGIA: 786,         // m² (enclosed, excl. tower footprints)
  poolDeck: 300,          // m² (external)
  parking: 17,            // bays (14 std + 2 accessible + 1 van)
} as const

/** Ground floor programme */
export const PODIUM = {
  missionControl: 40,     // m² (YOTELPAD Anytown: 40m²)
  padLounge: 130,         // m² (YOTELPAD Anytown: 130m²)
  gym: 60,                // m² (YOTELPAD Anytown: 60m²)
  guestLaundry: 25,       // m²
  padStorage: 14,         // m²
  cycleStorage: 12,       // m²
  beachGearStorage: 10,   // m²
  publicWCs: 14,          // m²
  poolAccess: 25,         // m²
  retailA: 45,            // m² (café)
  retailB: 45,            // m² (convenience/beach)
  boh: 296,               // m² (all BOH per YOTELPAD Anytown + Barbados MEP)
} as const

/** Abbeville financial parameters */
export const FINANCIALS = {
  land: 2_750_000,
  hardCostPerM2Podium: 3200,
  hardCostPerM2Tower: 3800,
  softCostPct: 0.138,
  contingencyPct: 0.07,
  hurricaneSeismicUplift: 0.18,
  islandFactorsPct: 0.12,
  ffePerUnit: 20_000,
  mepPerM2: 395,
  gopMargin: 0.55,
  padStudioADR: 220,
  pad1BedADR: 295,
  pad2BedADR: 380,
  padAccessibleADR: 220,
  pad1BedLSMonthly: 6500,
  padOccupancy: 0.78,
  longStayOccupancy: 0.88,
  retailNNN: 54_000,
  otherIncome: 100_000,
  staffFTE: 10,
  ftePerKey: 0.17,
} as const
```

- [ ] **Step 2: Commit**

```bash
git add studio/src/config/abbeville/programme.ts
git commit -m "feat: add Abbeville programme config (v4 — 60 units, 4 towers, YOTELPAD brand)"
```

---

### Task 4: Add Project Selector to UI

**Files:**
- Create: `studio/src/components/project-selector.tsx`
- Modify: `studio/src/app/(studio)/layout.tsx` (add selector to sidebar/header)

- [ ] **Step 1: Create project selector component**

Create `studio/src/components/project-selector.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { PROJECTS } from '@/config/projects'
import type { ProjectId } from '@/engine/types'

interface ProjectSelectorProps {
  currentProject: ProjectId
  onProjectChange: (id: ProjectId) => void
}

export function ProjectSelector({ currentProject, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="flex gap-2">
      {(Object.entries(PROJECTS) as [ProjectId, typeof PROJECTS[ProjectId]][]).map(([id, project]) => (
        <button
          key={id}
          onClick={() => onProjectChange(id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentProject === id
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <div className="font-semibold">{project.name}</div>
          <div className="text-xs opacity-70">{project.description}</div>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Read the studio layout to understand where to add the selector**

Read `studio/src/app/(studio)/layout.tsx` and identify the right insertion point.

- [ ] **Step 3: Add project state and selector to layout**

Add `ProjectSelector` component and project state management. The specific integration depends on the existing layout structure (discovered in step 2).

- [ ] **Step 4: Commit**

```bash
git add studio/src/components/project-selector.tsx studio/src/app/\(studio\)/layout.tsx
git commit -m "feat: add project selector UI for switching between Carlisle Bay and Abbeville"
```

---

### Task 5: Wire Generator to Project Config

**Files:**
- Modify: `studio/src/engine/generator.ts` (accept ProjectId, use project config)

- [ ] **Step 1: Update generator imports**

Replace hardcoded config imports with project config router:

```typescript
// Replace:
import { SITE } from '@/config/site'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'

// With:
import { getProjectConfig } from '@/config/projects'
import type { ProjectId } from './types'
```

- [ ] **Step 2: Update buildOption to accept project config**

Add `projectId` parameter to `buildOption` and `generateAll`. Use `getProjectConfig(projectId)` to get the right site, programme, and room types.

- [ ] **Step 3: Update DESIGN_SPACE to be project-specific**

For Abbeville, the design space is different: no BAR/L/U/C forms (it's a multi-tower campus), different floor areas, different room types. The generator may need a project-specific design space configuration.

- [ ] **Step 4: Run TypeScript compiler to verify no type errors**

```bash
cd studio && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/generator.ts
git commit -m "feat: wire generator to project config router"
```

---

### Task 6: Wire Validator to Project Config

**Files:**
- Modify: `studio/src/engine/validator.ts`

- [ ] **Step 1: Update validator to accept project-specific planning regs**

Replace hardcoded references to `SITE` and `PLANNING_REGS` with project config parameters passed as arguments.

- [ ] **Step 2: Commit**

```bash
git add studio/src/engine/validator.ts
git commit -m "feat: wire validator to project-specific planning regs"
```

---

### Task 7: Wire Cost and Revenue to Project Config

**Files:**
- Modify: `studio/src/engine/cost.ts`
- Modify: `studio/src/engine/revenue.ts`

- [ ] **Step 1: Update cost estimator**

Pass project-specific cost rates (hard cost/m², MEP/m², FF&E/unit) instead of hardcoded values.

- [ ] **Step 2: Update revenue projector**

Pass project-specific ADRs, occupancy rates, and income streams.

- [ ] **Step 3: Commit**

```bash
git add studio/src/engine/cost.ts studio/src/engine/revenue.ts
git commit -m "feat: wire cost and revenue engines to project config"
```

---

### Task 8: Verify End-to-End

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd studio && npm run dev
```

- [ ] **Step 2: Verify Carlisle Bay still works**

Select Carlisle Bay project, generate options, verify metrics match existing values.

- [ ] **Step 3: Switch to Abbeville**

Select Abbeville, verify project config loads, check that the site parameters (4,008 m² gross, 3,036 m² buildable, 20.5m max height) display correctly.

- [ ] **Step 4: Generate Abbeville options**

Run generator with Abbeville config, verify 60-unit target, check TDC near $30.5M, verify yield near 8.5%.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve integration issues found during e2e verification"
```

---

## Notes

- The Abbeville generator may need a **campus-specific generator** rather than using the existing single-building generator. The current generator produces single-building options (BAR, L, U, C forms). Abbeville is a 4-tower campus. Options:
  - A) Create an `abbeville-generator.ts` that produces fixed 4-tower campus layouts with parametric unit mix variation
  - B) Modify the existing generator to support multi-tower configurations
  - Option A is recommended — simpler, doesn't risk breaking Carlisle Bay

- The **site-layout.ts** engine places elements on a single building + amenity block campus. Abbeville has 4 towers + podium. This will need either:
  - A new `abbeville-site-layout.ts`
  - Or the existing layout engine extended to support multi-tower placement

- The **3D viewer** (interactive-planner.tsx) renders a single building. Rendering 4 staggered towers will need viewer modifications.

These are noted as follow-up tasks after the core config integration is working.
