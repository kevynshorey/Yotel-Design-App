# YOTEL Development Studio — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working 3D massing tool with command center shell — generate, validate, score, and visualize parametric building designs for the YOTEL Barbados project.

**Architecture:** Next.js 16 App Router with TypeScript massing engine running client-side (browser). Three.js 3D viewer with Esri satellite basemap. Command center layout with dark icon rail + floating frosted-glass panels over map viewport. All config from v2 equalized parameters.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Geist fonts, Three.js, Vitest

**Spec:** `docs/superpowers/specs/2026-03-20-yotel-development-studio-design.md`

**Source code to port:** `caro_client_export/full_clean_export/backend/engine/` (Python) + `caro_client_export/full_clean_export/frontend/src/` (React/Three.js)

---

## File Map

### New files to create (in `studio/`)

**Config (ported from Python config.py + site.py):**
- `src/config/site.ts` — Site boundary vertices, offsets, buildable zone metrics (from site.py)
- `src/config/programme.ts` — Room types, counts, floor allocation (from config.py §4-5)
- `src/config/financials.ts` — v2 equalized financial parameters (from CONFLICT_RESOLUTION_v2)
- `src/config/rules.ts` — Planning + brand validation thresholds (from rules.yml)
- `src/config/scoring-weights.ts` — 9-criteria default weights (from scorer.py)
- `src/config/construction.ts` — Building systems, FOH/BOH areas (from config.py §6-8)

**Engine (ported from Python engine/):**
- `src/engine/types.ts` — All shared types (FormType, Wing, Floor, DesignOption, etc.)
- `src/engine/forms.ts` — Wing geometry generation for BAR/BAR_NS/L/U/C (from forms.py, 107 lines)
- `src/engine/rooms.ts` — Room layout + floor programming (from rooms.py, 128 lines)
- `src/engine/validator.ts` — Rule checking with point-in-polygon (from validator.py, 159 lines)
- `src/engine/scorer.ts` — 9-criteria weighted scoring with v2 thresholds (from scorer.py, 125 lines)
- `src/engine/cost.ts` — Cost model with form multipliers (from cost.py, 99 lines)
- `src/engine/revenue.ts` — Revenue projection + scoring (from revenue.py, 197 lines)
- `src/engine/generator.ts` — Design space sweep + option builder (from generator.py, 241 lines)

**Shell components:**
- `src/components/shell/icon-rail.tsx` — Dark navy 56px navigation rail with module icons
- `src/components/shell/floating-panel.tsx` — Frosted glass overlay container (reusable)
- `src/components/shell/command-bar.tsx` — Top action bar (project name, actions)

**3D Viewer components (ported from Viewer3D.jsx, NewF.jsx):**
- `src/components/viewer/viewer-3d.tsx` — Main Three.js canvas (client component)
- `src/components/viewer/scene-setup.ts` — Renderer, camera, lights, controls init
- `src/components/viewer/basemap.ts` — Esri/OSM/Topo tile loader (from Viewer3D.jsx getTileInfo/loadTiles)
- `src/components/viewer/building-renderer.ts` — Floor-by-floor building geometry with brand colors
- `src/components/viewer/site-overlays.ts` — Site boundary + offset boundary overlays
- `src/components/viewer/camera-presets.ts` — Named view positions (3D, Iso, Elevation, Plan)
- `src/components/viewer/context-layer.ts` — OSM buildings/roads/trees (future — stub for now)

**Design module components (ported from App.jsx, OptionCard.jsx, MetricsPanel.jsx, ScoringPanel.jsx):**
- `src/components/design/options-sidebar.tsx` — Collapsible right sidebar with option cards
- `src/components/design/option-card.tsx` — Single option card (score, form, metrics)
- `src/components/design/generator-controls.tsx` — Parameter sliders (form, rooms, storeys, etc.)
- `src/components/design/metrics-panel.tsx` — Floating overlay with key metrics
- `src/components/design/scoring-panel.tsx` — Score breakdown with weight adjustment
- `src/components/design/compliance-badge.tsx` — Pass/fail indicators

**App Router pages:**
- `src/app/layout.tsx` — Root layout (Geist fonts, metadata, providers)
- `src/app/page.tsx` — Redirect to /design
- `src/app/(studio)/layout.tsx` — Command center shell (icon rail + viewport)
- `src/app/(studio)/design/page.tsx` — Massing tool page

**Lib:**
- `src/lib/rate-limit.ts` — In-memory per-IP rate limiter
- `src/lib/utils.ts` — cn() utility for Tailwind class merging

**Styles:**
- `src/styles/globals.css` — Tailwind directives + CSS custom properties for theme

**Tests:**
- `src/engine/__tests__/forms.test.ts`
- `src/engine/__tests__/rooms.test.ts`
- `src/engine/__tests__/validator.test.ts`
- `src/engine/__tests__/scorer.test.ts`
- `src/engine/__tests__/cost.test.ts`
- `src/engine/__tests__/revenue.test.ts`
- `src/engine/__tests__/generator.test.ts`

**Root config:**
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `vitest.config.ts`
- `.env.example`
- `components.json` (shadcn/ui config)

---

## Task Breakdown

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `studio/package.json`
- Create: `studio/next.config.ts`
- Create: `studio/tsconfig.json`
- Create: `studio/tailwind.config.ts`
- Create: `studio/vitest.config.ts`
- Create: `studio/.env.example`
- Create: `studio/src/styles/globals.css`
- Create: `studio/src/lib/utils.ts`
- Create: `studio/src/app/layout.tsx`
- Create: `studio/src/app/page.tsx`

- [ ] **Step 1: Create Next.js 16 project**

```bash
cd "/Users/kevynshorey/claude-sandbox/Yotel Design App"
npx create-next-app@latest studio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Accept defaults. This creates the scaffold with Next.js 16, TypeScript, Tailwind, App Router, src/ directory.

- [ ] **Step 2: Install dependencies**

```bash
cd studio
npm install three @types/three recharts geist clsx tailwind-merge
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `studio/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add to `package.json` scripts: `"test": "vitest", "test:run": "vitest run"`

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Slate base color, CSS variables. This creates `components.json` and `src/components/ui/`.

- [ ] **Step 5: Add core shadcn components**

```bash
npx shadcn@latest add button card badge slider tooltip scroll-area separator skeleton tabs sheet
```

- [ ] **Step 6: Configure Geist fonts in root layout**

Update `studio/src/app/layout.tsx`:
```tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'

export const metadata = {
  title: 'YOTEL Development Studio',
  description: 'Parametric design platform for YOTEL Barbados',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50">{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Set up CSS custom properties**

Update `studio/src/styles/globals.css` to include the spec's color system:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --yotel-brand: 161 36% 35%;       /* #2E8A76 teal */
    --yotelpad-brand: 341 44% 53%;    /* #B8456A mauve */
    --ground-floor: 108 17% 52%;      /* #7A9A70 sage */
    --panel-bg: 0 0% 100% / 0.92;
    --panel-border: 0 0% 0% / 0.08;
    --accent: 199 89% 60%;            /* #38bdf8 sky-400 */
    --rail-bg: 222 47% 11%;           /* #0f172a slate-900 */
    --font-mono: var(--font-geist-mono);
  }
}
```

- [ ] **Step 8: Create .env.example**

Create `studio/.env.example`:
```
# Database (Neon Postgres — Phase 2)
# DATABASE_URL=

# Auth
# JWT_SECRET=
# MAGIC_LINK_SECRET=

# Share links
# SHARE_HMAC_SECRET=

# Esri basemap (free tier for dev)
# ESRI_API_KEY=
```

- [ ] **Step 9: Create redirect page**

Update `studio/src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/design')
}
```

- [ ] **Step 10: Verify dev server starts**

```bash
cd studio && npm run dev -- --port 3001
```

Expected: Next.js dev server on port 3001, no errors.

- [ ] **Step 11: Commit**

```bash
git add studio/
git commit -m "feat(studio): scaffold Next.js 16 project with shadcn/ui, Geist, Vitest"
```

---

### Task 2: Engine Types

**Files:**
- Create: `studio/src/engine/types.ts`

Reference: Spec §5 Core TypeScript Types + Python config.py room types

- [ ] **Step 1: Create engine types file**

Create `studio/src/engine/types.ts` with all shared types from the spec:

```typescript
// Form types
export type FormType = 'BAR' | 'BAR_NS' | 'L' | 'U' | 'C'
export type CorridorType = 'single_loaded' | 'double_loaded'
export type OutdoorPosition = 'WEST' | 'ROOFTOP' | 'BOTH'
export type VisualStyle = 'Realistic' | 'Shaded' | 'Wireframe' | 'Consistent'
export type BasemapType = 'Satellite' | 'Street' | 'Topo' | 'None'

// Geometry
export interface Point2D {
  x: number
  y: number
}

export interface Wing {
  id: string
  label: string
  x: number           // position from origin (m)
  y: number
  length: number      // metres
  width: number       // metres
  direction: 'EW' | 'NS'
  floors: number
}

export interface FormResult {
  form: FormType
  wings: Wing[]
  footprint: number   // m²
  westFacade: number  // m (beach-facing)
  totalFacade: number // m
  courtyard: number   // m² (U/C forms)
  boundingLength: number
  boundingWidth: number
}

// Room types
export interface RoomType {
  label: string
  nia: number          // m² net internal area
  bayWidth: number     // m module width
  bays: number
  pct: number          // target mix percentage
  color: string
}

export interface RoomAllocation {
  type: string
  count: number
  nia: number
}

// Floor programming
export type FloorUse = 'FOH_BOH' | 'YOTEL' | 'YOTELPAD' | 'ROOFTOP'

export interface Floor {
  level: number
  use: FloorUse
  rooms: RoomAllocation[]
  gia: number
}

// Validation
export type ViolationSeverity = 'fatal' | 'warning'

export interface Violation {
  rule: string
  actual: number | string
  limit: number | string
  severity: ViolationSeverity
}

export interface ValidationResult {
  isValid: boolean
  violations: Violation[]
  warnings: string[]
}

// Scoring
export interface ScoreBreakdown {
  raw: number
  weighted: number
  reason: string
}

export interface ScoringWeights {
  room_count: number
  gia_efficiency: number
  sea_views: number
  building_height: number
  outdoor_amenity: number
  cost_per_key: number
  daylight_quality: number
  pad_mix: number
  form_simplicity: number
}

// Cost
export interface CostEstimate {
  total: number
  perKey: number
  breakdown: {
    construction: number
    facade: number
    ffe: number
    technology: number
    outdoor: number
    land: number
    siteWorks: number
    softCosts: number
    contingency: number
  }
}

// Revenue
export interface YearlyRevenue {
  year: number
  yotelOcc: number
  padOcc: number
  yotelAdr: number
  padAdr: number
  totalRevenue: number
  gop: number
  noi: number
}

export interface RevenueProjection {
  years: YearlyRevenue[]
  stabilisedNoi: number
  stabilisedNoiPerKey: number
  gopMargin: number
  revPar: number
}

// Metrics
export interface OptionMetrics {
  totalKeys: number
  yotelKeys: number
  padUnits: number
  gia: number
  giaPerKey: number
  footprint: number
  coverage: number
  buildingHeight: number
  westFacade: number
  outdoorTotal: number
  costPerKey: number
  tdc: number
  corridorType: CorridorType
  form: FormType
}

// Complete design option
export interface DesignOption {
  id: string
  form: FormType
  params: GenerationParams
  wings: Wing[]
  floors: Floor[]
  metrics: OptionMetrics
  cost: CostEstimate
  revenue: RevenueProjection
  score: number
  scoringBreakdown: Record<string, ScoreBreakdown>
  validation: ValidationResult
}

// Generation parameters (what the user controls)
export interface GenerationParams {
  form: FormType
  targetFloorArea: number
  wingWidth: number
  storeys: number
  corridorType: CorridorType
  ytRooms: number
  padUnits: number
  outdoorPosition: OutdoorPosition
}

// Option groups
export interface OptionGroups {
  best_overall: string[]
  most_rooms: string[]
  lowest_height: string[]
  best_views: string[]
  lowest_cost: string[]
  most_outdoor: string[]
  most_efficient: string[]
  pad_heavy: string[]
}

// Camera
export interface CameraPreset {
  name: string
  group: string
  position: [number, number, number]
  target: [number, number, number]
  isOrthographic: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add studio/src/engine/types.ts
git commit -m "feat(engine): add all shared TypeScript types"
```

---

### Task 3: Config Files (Port from Python)

**Files:**
- Create: `studio/src/config/site.ts` (from site.py)
- Create: `studio/src/config/programme.ts` (from config.py §4-5)
- Create: `studio/src/config/construction.ts` (from config.py §6-8)
- Create: `studio/src/config/financials.ts` (v2 equalized values)
- Create: `studio/src/config/rules.ts` (from rules.yml)
- Create: `studio/src/config/scoring-weights.ts` (from scorer.py)

Reference: Spec §1a Canonical Values + Python source files

- [ ] **Step 1: Create site.ts**

Port from `caro_client_export/full_clean_export/config/site.py`. Use the 10-vertex survey boundaries (NOT config.py's 6-point simplified boundary).

```typescript
import type { Point2D } from '@/engine/types'

/** Original site boundary — 10 vertices from Dynamo/Revit survey export.
 *  Units: metres from Revit project base point. */
export const ORIGINAL_BOUNDARY: Point2D[] = [
  { x: 1.009, y: -0.301 },
  { x: -10.767, y: 26.325 },
  { x: 9.350, y: 34.945 },
  { x: 41.455, y: 54.551 },
  { x: 70.225, y: 57.869 },
  { x: 99.271, y: 64.064 },
  { x: 116.286, y: 65.293 },
  { x: 120.661, y: 7.772 },
  { x: 71.756, y: 5.659 },
  { x: 23.308, y: 3.414 },
]

/** Offset boundary (buildable zone) — after directional setbacks. */
export const OFFSET_BOUNDARY: Point2D[] = [
  { x: 66.161, y: 8.403 },
  { x: 35.597, y: 8.403 },
  { x: 35.597, y: 46.533 },
  { x: 42.789, y: 50.678 },
  { x: 70.873, y: 53.917 },
  { x: 85.741, y: 57.088 },
  { x: 113.901, y: 57.088 },
  { x: 115.434, y: 36.933 },
  { x: 115.434, y: 10.549 },
  { x: 71.622, y: 8.656 },
]

/** Building placement from existing Three.js viewer. */
export const BUILDING_PLACEMENT = { x: 65, y: 9, rotDeg: 8 } as const

/** Directional setbacks (metres). */
export const OFFSETS = { W: 55, N: 8, E: 5, S: 5 } as const

/** Computed site metrics. */
export const SITE = {
  grossArea: 5965,
  buildableArea: 3599.1,
  maxCoverage: 0.50,
  maxFootprint: 1800,
  maxHeight: 25.0,
  buildableEW: 79.84,
  buildableNS: 48.69,
  buildableMinX: 35.597,
  buildableMaxX: 115.434,
  buildableMinY: 8.403,
  buildableMaxY: 57.088,
  beachSide: 'W' as const,
  centroidX: 75.52,
  centroidY: 32.75,
} as const
```

- [ ] **Step 2: Create programme.ts**

Port room types from config.py §4-5. Include NIA, bay widths, and mix percentages.

```typescript
import type { RoomType } from '@/engine/types'

export const YOTEL_ROOMS: Record<string, RoomType> = {
  Premium:     { label: 'Premium Queen',  nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.61, color: '#2E8A76' },
  Twin:        { label: 'Premium Twin',   nia: 16.7, bayWidth: 3.37, bays: 1,   pct: 0.18, color: '#3BA68E' },
  FirstClass:  { label: 'First Class',    nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.12, color: '#1D6B5A' },
  Accessible:  { label: 'Accessible',     nia: 26.5, bayWidth: 5.055, bays: 1.5, pct: 0.09, color: '#16a34a' },
}

export const YOTELPAD_UNITS: Record<string, RoomType> = {
  Studio:           { label: 'PAD Studio',     nia: 22.0, bayWidth: 3.67, bays: 1,   pct: 0.67, color: '#B8456A' },
  OneBed:           { label: 'PAD 1-Bedroom',  nia: 32.0, bayWidth: 5.07, bays: 1.5, pct: 0.20, color: '#A03B5C' },
  TwoBed:           { label: 'PAD 2-Bedroom',  nia: 48.0, bayWidth: 6.67, bays: 2,   pct: 0.07, color: '#8A3050' },
  AccessibleStudio: { label: 'PAD Accessible', nia: 27.0, bayWidth: 4.28, bays: 1.2, pct: 0.07, color: '#16a34a' },
}

export const PROGRAMME = {
  totalKeys: 130,
  yotelKeys: 100,
  yotelpadKeys: 30,
  groundFloor: { use: 'FOH_BOH' as const, gia: 770, rooms: 0 },
  yotelFloors: { floors: [1, 2, 3], roomsPerFloor: 33 },
  yotelpadFloors: { floors: [4, 5], unitsPerFloor: 15 },
  rooftop: { use: 'ROOFTOP' as const, gia: 80 },
} as const
```

- [ ] **Step 3: Create construction.ts**

Port building systems from config.py §6-8.

```typescript
export const CONSTRUCTION = {
  type: 'Prefab modular on steel frame',
  extWall: 0.4,           // m
  modularPartition: 0.27,
  internalWall: 0.2,
  corridorWidth: 1.6,     // m clear
  floorCeiling: 0.5,
  floorToFloor: 3.2,      // m (upper floors)
  groundFloorHeight: 4.5, // m
  minRoomCeiling: 2.5,
  maxModuleLength: 17.5,  // m
  maxModuleWidth: 4.5,
} as const

export const CORE = {
  areaPerFloor: 40,       // m²
  guestLifts: 2,
  bohLifts: 1,
  staircases: 2,
  maxDeadEnd: 10,         // m
  maxTravelDistance: 35,   // m
  linenStorePerFloor: 13, // m²
} as const

export const FOH = {
  missionControl: 50,     // m²
  komyuniti: 245,
  hub: 14,                // × 2
  gym: 55,
  publicWC: 27,
  luggage: 19,
  podcastStudio: 15,
  gamingLounge: 25,
} as const

export const BOH = {
  kitchen: 47,
  coldStorage: 13,
  dryStorage: 9,
  barStorage: 9,
  administration: 40,
  crewRoom: 26,
  crewFacilities: 38,
  housekeeping: 42,
  fixIt: 18,
  plant: 60,
  itServer: 8,
  waste: 18,
  generalStorage: 10,
} as const
```

- [ ] **Step 4: Create financials.ts**

Use v2 equalized values from CONFLICT_RESOLUTION_v2 (NOT config.py).

```typescript
/** v2 Equalized Financial Parameters — from sponsor directives.
 *  DO NOT use config.py FINANCIALS (stale: TDC=$32.5M, GOP=44%). */
export const FINANCIALS = {
  tdc: 40_000_000,
  hardCostPerSf: 350,
  totalGia_sf: 75_000,
  land: 3_500_000,

  // Revenue (Year 3 stabilised)
  yotelAdr: 195,
  yotelpadAdr: 270,
  yotelOcc: 0.78,
  yotelpadOcc: 0.75,

  // Operating
  gopMargin: 0.51,
  yotelFees: 0.155, // inclusive of all brand fees

  // Capital stack (indicative)
  seniorDebt: 24_000_000,
  seniorRate: 0.065,
  mezzDebt: 5_000_000,
  mezzRate: 0.11,
  lpEquity: 10_000_000,
  gpEquity: 1_000_000,

  // Exit
  exitCap: 0.085,

  // Revenue ramp (Year 1 → 5)
  yotelOccRamp: [0.55, 0.68, 0.78, 0.79, 0.79],
  yotelAdrRamp: [155, 175, 195, 203, 211],
  yotelpadOccRamp: [0.50, 0.63, 0.75, 0.76, 0.76],
  yotelpadAdrRamp: [220, 248, 270, 281, 292],

  // Ancillary
  fnbPerOccupiedRoom: 45,
  otherPerOccupiedRoom: 12,
} as const
```

- [ ] **Step 5: Create rules.ts**

Port from rules.yml (JSON format). Use canonical values from site.py.

```typescript
/** Validation rules — planning (T1 statute) + brand (T3 YOTEL D01-C08). */
export const RULES = {
  planning: {
    maxCoverage: 0.50,
    maxHeight: 25.0,         // m (planning limit, not 21m building target)
    siteArea: 3599.1,        // m² buildable (from site.py)
    siteLength: 79.84,       // m E-W
    siteWidth: 48.69,        // m N-S
  },
  brand: {
    dualMinWidth: 13.6,      // m YOTEL
    singleMinWidth: 8.0,     // m
    padDualMinWidth: 16.1,   // m YOTELPAD
    maxTravel: 35,           // m
    minAccessiblePct: 0.05,
    yotelAccessiblePct: 0.10,
    yotelpadAccessiblePct: 0.07,
    fohLiftsPerHundred: 2,
    minKomyuniti: 150,       // m²
    minMissionControl: 35,
    minGym: 40,
    minKitchen: 35,
  },
  circulation: {
    minCorridorWidth: 1.6,   // m
    maxDeadEnd: 10,          // m
    maxTravelDistance: 35,    // m
    minCorridorHeight: 2.4,  // m
  },
} as const
```

- [ ] **Step 6: Create scoring-weights.ts**

From scorer.py DEFAULT_WEIGHTS (canonical source). Include descriptions for UI.

```typescript
import type { ScoringWeights } from '@/engine/types'

export const DEFAULT_WEIGHTS: ScoringWeights = {
  room_count: 0.18,
  gia_efficiency: 0.14,
  sea_views: 0.14,
  building_height: 0.10,
  outdoor_amenity: 0.10,
  cost_per_key: 0.12,
  daylight_quality: 0.08,
  pad_mix: 0.06,
  form_simplicity: 0.08,
}

export const WEIGHT_DESCRIPTIONS: Record<keyof ScoringWeights, string> = {
  room_count: 'Total keys vs 130 target. More = more revenue.',
  gia_efficiency: 'GIA per key. Sweet spot 33-38 m²/key.',
  sea_views: 'West-facing facade length. More = more premium rooms.',
  building_height: 'Lower = easier planning approval.',
  outdoor_amenity: 'Total outdoor area (ground + roof + courtyard).',
  cost_per_key: 'Lower cost/key = better investment return.',
  daylight_quality: 'Natural light in corridors and rooms.',
  pad_mix: 'YOTELPAD ratio. 18-28% is revenue-optimal.',
  form_simplicity: 'Simpler forms = lower cost, faster build.',
}
```

- [ ] **Step 7: Commit**

```bash
git add studio/src/config/
git commit -m "feat(config): port all project config from Python to TypeScript with v2 values"
```

---

### Task 4: Engine — Forms Module

**Files:**
- Create: `studio/src/engine/forms.ts`
- Create: `studio/src/engine/__tests__/forms.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/generation/forms.py` (107 lines)

- [ ] **Step 1: Write failing tests**

Create `studio/src/engine/__tests__/forms.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateForm } from '../forms'

describe('generateForm', () => {
  it('generates BAR form with single wing E-W', () => {
    const result = generateForm('BAR', 770, 14)
    expect(result.form).toBe('BAR')
    expect(result.wings).toHaveLength(1)
    expect(result.wings[0].direction).toBe('EW')
    expect(result.footprint).toBeCloseTo(770, -1)
    expect(result.westFacade).toBeCloseTo(14, 0)
  })

  it('generates BAR_NS form with single wing N-S', () => {
    const result = generateForm('BAR_NS', 770, 14)
    expect(result.wings[0].direction).toBe('NS')
    expect(result.westFacade).toBeGreaterThan(result.wings[0].width)
  })

  it('generates L form with 2 wings', () => {
    const result = generateForm('L', 900, 14)
    expect(result.wings).toHaveLength(2)
  })

  it('generates U form with 3 wings', () => {
    const result = generateForm('U', 1200, 14)
    expect(result.wings).toHaveLength(3)
    expect(result.courtyard).toBeGreaterThan(0)
  })

  it('generates C form with 3 wings', () => {
    const result = generateForm('C', 1200, 14)
    expect(result.wings).toHaveLength(3)
    expect(result.courtyard).toBeGreaterThan(0)
  })

  it('deducts corner overlap for L-form footprint', () => {
    const result = generateForm('L', 900, 14)
    // L-form: main + branch - overlap at corner (W * W)
    const rawArea = result.wings.reduce((sum, w) => sum + w.length * w.width, 0)
    expect(result.footprint).toBeLessThan(rawArea) // must deduct overlap
    expect(result.footprint).toBeCloseTo(900, -1) // should approximate target
  })

  it('clamps wing length to site dimensions', () => {
    const result = generateForm('BAR', 5000, 14) // very large area
    expect(result.wings[0].length).toBeLessThanOrEqual(79.84) // site E-W span
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd studio && npx vitest run src/engine/__tests__/forms.test.ts
```

Expected: FAIL — module `../forms` does not exist.

- [ ] **Step 3: Implement forms.ts**

Create `studio/src/engine/forms.ts` — port from forms.py:

```typescript
import type { FormType, FormResult, Wing } from './types'
import { SITE } from '@/config/site'

let wingCounter = 0
function wingId(): string {
  return `w${++wingCounter}`
}

/** Clamp length to site buildable span. */
function clamp(len: number, maxL: number): number {
  return Math.round(Math.min(len, maxL) * 10) / 10
}

export function generateForm(
  formType: FormType,
  targetFloorArea: number,
  wingWidth: number,
): FormResult {
  wingCounter = 0
  const wings: Wing[] = []
  let courtyard = 0
  let footprintOverlap = 0 // corner overlap for L/U/C forms
  const maxL = SITE.buildableEW // 79.84m
  const maxW = SITE.buildableNS // 48.69m
  const W = wingWidth

  switch (formType) {
    case 'BAR': {
      const length = clamp(targetFloorArea / W, maxL)
      wings.push({
        id: wingId(), label: 'Main', x: 0, y: 0,
        length, width: W, direction: 'EW', floors: 0,
      })
      break
    }
    case 'BAR_NS': {
      const length = clamp(targetFloorArea / W, maxW)
      wings.push({
        id: wingId(), label: 'Main', x: 0, y: 0,
        length, width: W, direction: 'NS', floors: 0,
      })
      break
    }
    case 'L': {
      // 0.6/0.4 split per Python forms.py line 54-55
      const mainArea = targetFloorArea * 0.6
      const branchArea = targetFloorArea * 0.4
      const La = clamp(mainArea / W, maxL)
      const Lb = clamp(branchArea / W, maxW)
      wings.push({
        id: wingId(), label: 'Main (E-W)', x: 0, y: 0,
        length: La, width: W, direction: 'EW', floors: 0,
      })
      wings.push({
        id: wingId(), label: 'Branch (N-S)', x: La - W, y: 0,
        length: Lb, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = W * W // corner overlap
      break
    }
    case 'U': {
      const Lw = clamp(targetFloorArea / (3 * W), maxL)
      const gap = Math.max(8, Lw) // dynamic gap per Python line 72
      // South wing
      wings.push({
        id: wingId(), label: 'South', x: 0, y: 0,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      // North wing
      wings.push({
        id: wingId(), label: 'North', x: 0, y: gap + W,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      // East connector
      const connLen = gap + 2 * W
      wings.push({
        id: wingId(), label: 'East Connector', x: Lw - W, y: 0,
        length: connLen, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = 2 * W * W // two corner overlaps
      courtyard = (Lw - W) * gap
      break
    }
    case 'C': {
      const Lw = clamp(targetFloorArea / (3 * W), maxL)
      const gap = Math.max(8, Lw)
      // South wing
      wings.push({
        id: wingId(), label: 'South', x: 0, y: 0,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      // North wing
      wings.push({
        id: wingId(), label: 'North', x: 0, y: gap + W,
        length: Lw, width: W, direction: 'EW', floors: 0,
      })
      // West connector
      const connLen = gap + 2 * W
      wings.push({
        id: wingId(), label: 'West Connector', x: 0, y: 0,
        length: connLen, width: W, direction: 'NS', floors: 0,
      })
      footprintOverlap = 2 * W * W
      courtyard = (Lw - W) * gap
      break
    }
  }

  const rawArea = wings.reduce((sum, w) => sum + w.length * w.width, 0)
  const footprint = rawArea - footprintOverlap

  // West facade calculation per Python forms.py
  let westFacade: number
  switch (formType) {
    case 'BAR': westFacade = W; break
    case 'BAR_NS': westFacade = wings[0].length; break
    case 'L': westFacade = W + wings[1].length; break // main width + branch length
    case 'U': case 'C': {
      const gap = Math.max(8, wings[0].length)
      westFacade = gap + 2 * W // full U/C west face
      break
    }
    default: westFacade = W
  }

  const totalFacade = wings.reduce((sum, w) => sum + 2 * (w.length + w.width), 0)
  const boundingLength = Math.max(...wings.map(w =>
    w.direction === 'EW' ? w.x + w.length : w.x + w.width))
  const boundingWidth = Math.max(...wings.map(w =>
    w.direction === 'EW' ? w.y + w.width : w.y + w.length))

  return {
    form: formType, wings, footprint, westFacade,
    totalFacade, courtyard, boundingLength, boundingWidth,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd studio && npx vitest run src/engine/__tests__/forms.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/forms.ts studio/src/engine/__tests__/forms.test.ts
git commit -m "feat(engine): add forms module — BAR/BAR_NS/L/U/C wing geometry"
```

---

### Task 5: Engine — Rooms Module

**Files:**
- Create: `studio/src/engine/rooms.ts`
- Create: `studio/src/engine/__tests__/rooms.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/generation/rooms.py` (128 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { roomsPerFloor, makeFloorMix, buildFloorProgramme } from '../rooms'
import { YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'

describe('roomsPerFloor', () => {
  it('calculates rooms for a dual-loaded EW wing', () => {
    const count = roomsPerFloor(
      [{ length: 55, width: 14, direction: 'EW' }],
      'double_loaded',
      YOTEL_ROOMS,
    )
    expect(count).toBeGreaterThan(20)
    expect(count).toBeLessThan(45)
  })
})

describe('makeFloorMix', () => {
  it('distributes 33 rooms by target percentages', () => {
    const mix = makeFloorMix(33, YOTEL_ROOMS)
    const total = mix.reduce((sum, r) => sum + r.count, 0)
    expect(total).toBe(33)
    expect(mix.find(r => r.type === 'Accessible')!.count).toBeGreaterThanOrEqual(3)
  })
})

describe('buildFloorProgramme', () => {
  it('builds complete floor stack for 100 YOTEL + 30 PAD', () => {
    const floors = buildFloorProgramme({
      storeys: 6,
      ytPerFloor: 33,
      padPerFloor: 15,
      ytFloors: [1, 2, 3],
      padFloors: [4, 5],
      footprint: 770,
    })
    expect(floors).toHaveLength(7) // G + 5 upper + rooftop
    expect(floors[0].use).toBe('FOH_BOH')
    expect(floors[1].use).toBe('YOTEL')
    expect(floors[4].use).toBe('YOTELPAD')
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

```bash
cd studio && npx vitest run src/engine/__tests__/rooms.test.ts
```

- [ ] **Step 3: Implement rooms.ts**

Port from rooms.py. Key functions: `roomsPerFloor`, `makeFloorMix`, `buildFloorProgramme`.

```typescript
import type { Wing, RoomType, RoomAllocation, Floor, FloorUse, CorridorType } from './types'
import { YOTEL_ROOMS, YOTELPAD_UNITS, PROGRAMME } from '@/config/programme'
import { CONSTRUCTION } from '@/config/construction'

const EXT_WALL = 0.4
const CORE_LENGTH = 5.5

export function roomsPerFloor(
  wings: Pick<Wing, 'length' | 'width' | 'direction'>[],
  corridorType: CorridorType,
  roomTypes: Record<string, RoomType>,
): number {
  const avgBayWidth = Object.values(roomTypes).reduce((s, r) => s + r.bayWidth * r.pct, 0)
  let total = 0
  for (const w of wings) {
      // Python rooms.py always uses wing["l"] (the long dimension) regardless of direction.
    // In our Wing type, `length` is always the long dimension.
    const usableLength = w.length - 2 * EXT_WALL - CORE_LENGTH
    const sides = corridorType === 'double_loaded' ? 2 : 1
    total += Math.floor((usableLength / avgBayWidth) * sides)
  }
  return total
}

export function makeFloorMix(
  totalPerFloor: number,
  roomTypes: Record<string, RoomType>,
): RoomAllocation[] {
  const types = Object.entries(roomTypes)
  const mix: RoomAllocation[] = []
  let remaining = totalPerFloor

  // Allocate by percentage, rounding down
  for (const [name, rt] of types) {
    const count = Math.floor(totalPerFloor * rt.pct)
    mix.push({ type: name, count, nia: rt.nia })
    remaining -= count
  }

  // Distribute remainder to largest-pct types first
  const sorted = [...mix].sort((a, b) => {
    const pctA = roomTypes[a.type].pct
    const pctB = roomTypes[b.type].pct
    return pctB - pctA
  })
  for (let i = 0; remaining > 0; i++) {
    sorted[i % sorted.length].count++
    remaining--
  }

  return mix
}

export function buildFloorProgramme(params: {
  storeys: number
  ytPerFloor: number
  padPerFloor: number
  ytFloors: number[]
  padFloors: number[]
  footprint: number
}): Floor[] {
  const floors: Floor[] = []

  // Ground floor (level 0)
  floors.push({
    level: 0,
    use: 'FOH_BOH',
    rooms: [],
    gia: params.footprint,
  })

  // YOTEL floors
  for (const level of params.ytFloors) {
    floors.push({
      level,
      use: 'YOTEL',
      rooms: makeFloorMix(params.ytPerFloor, YOTEL_ROOMS),
      gia: params.footprint,
    })
  }

  // YOTELPAD floors
  for (const level of params.padFloors) {
    floors.push({
      level,
      use: 'YOTELPAD',
      rooms: makeFloorMix(params.padPerFloor, YOTELPAD_UNITS),
      gia: params.footprint,
    })
  }

  // Rooftop
  floors.push({
    level: params.storeys,
    use: 'ROOFTOP',
    rooms: [],
    gia: PROGRAMME.rooftop.gia,
  })

  return floors.sort((a, b) => a.level - b.level)
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
cd studio && npx vitest run src/engine/__tests__/rooms.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/rooms.ts studio/src/engine/__tests__/rooms.test.ts
git commit -m "feat(engine): add rooms module — floor programming and room distribution"
```

---

### Task 6: Engine — Validator Module

**Files:**
- Create: `studio/src/engine/validator.ts`
- Create: `studio/src/engine/__tests__/validator.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/validation/validator.py` (159 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { validate, pointInPolygon } from '../validator'
import type { OptionMetrics, Wing } from '../types'
import { OFFSET_BOUNDARY } from '@/config/site'

describe('pointInPolygon', () => {
  it('returns true for point inside offset boundary', () => {
    expect(pointInPolygon(75, 30, OFFSET_BOUNDARY)).toBe(true)
  })

  it('returns false for point outside offset boundary', () => {
    expect(pointInPolygon(0, 0, OFFSET_BOUNDARY)).toBe(false)
  })
})

describe('validate', () => {
  const validMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 14, outdoorTotal: 660,
    costPerKey: 307692, tdc: 40_000_000,
    corridorType: 'double_loaded', form: 'BAR',
  }

  it('passes a valid option', () => {
    const result = validate(validMetrics, [])
    expect(result.isValid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('fails when coverage exceeds 50%', () => {
    const result = validate({ ...validMetrics, coverage: 0.55 }, [])
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.rule.includes('coverage'))).toBe(true)
  })

  it('fails when height exceeds 25m', () => {
    const result = validate({ ...validMetrics, buildingHeight: 26 }, [])
    expect(result.isValid).toBe(false)
  })

  it('fails when building extends outside offset boundary', () => {
    // Wing placed way outside the buildable zone
    const wings = [{ id: 'test', label: 'Main', x: -50, y: -50, length: 55, width: 14, direction: 'EW' as const, floors: 6 }]
    const result = validate(validMetrics, wings)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.rule.includes('offset boundary'))).toBe(true)
  })

  it('passes when building is within offset boundary', () => {
    // Wing at origin — after rotation + placement (65,9) lands inside offset boundary
    const wings = [{ id: 'test', label: 'Main', x: 0, y: 0, length: 55, width: 14, direction: 'EW' as const, floors: 6 }]
    const result = validate(validMetrics, wings)
    expect(result.violations.some(v => v.rule.includes('offset boundary'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement validator.ts**

Port from validator.py with point-in-polygon ray casting:

```typescript
import type { OptionMetrics, Wing, Point2D, ValidationResult, Violation } from './types'
import { RULES } from '@/config/rules'
import { OFFSET_BOUNDARY, BUILDING_PLACEMENT, SITE } from '@/config/site'

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(x: number, y: number, poly: Point2D[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** Rotate a 2D point around origin by angle in radians (per validator.py). */
function rotatePoint(x: number, y: number, angRad: number): [number, number] {
  const c = Math.cos(angRad), s = Math.sin(angRad)
  return [x * c - y * s, x * s + y * c]
}

export function validate(metrics: OptionMetrics, wings: Wing[]): ValidationResult {
  const violations: Violation[] = []
  const warnings: string[] = []

  // Coverage
  if (metrics.coverage > RULES.planning.maxCoverage) {
    violations.push({
      rule: 'Max site coverage',
      actual: `${(metrics.coverage * 100).toFixed(1)}%`,
      limit: `${RULES.planning.maxCoverage * 100}%`,
      severity: 'fatal',
    })
  }

  // Height
  if (metrics.buildingHeight > RULES.planning.maxHeight) {
    violations.push({
      rule: 'Max building height',
      actual: `${metrics.buildingHeight}m`,
      limit: `${RULES.planning.maxHeight}m`,
      severity: 'fatal',
    })
  }

  // ── Offset boundary containment (per validator.py) ──
  // Transform wing corners through building rotation + placement,
  // then check all corners are inside the offset boundary polygon.
  const angRad = BUILDING_PLACEMENT.rotDeg * Math.PI / 180
  const tx = BUILDING_PLACEMENT.x
  const ty = BUILDING_PLACEMENT.y
  let outsideCorners = 0
  for (const wing of wings) {
    // Match viewer geometry: EW wings have (length along X) × (width along Z)
    // NS wings have (width along X) × (length along Z)
    const rectLx = wing.direction === 'NS' ? wing.width : wing.length
    const rectWy = wing.direction === 'NS' ? wing.length : wing.width
    const corners: [number, number][] = [
      [wing.x, wing.y],
      [wing.x + rectLx, wing.y],
      [wing.x + rectLx, wing.y + rectWy],
      [wing.x, wing.y + rectWy],
    ]
    for (const [cx, cy] of corners) {
      const [rx, ry] = rotatePoint(cx, cy, angRad)
      if (!pointInPolygon(rx + tx, ry + ty, OFFSET_BOUNDARY)) {
        outsideCorners++
      }
    }
  }
  if (outsideCorners > 0) {
    violations.push({
      rule: 'Building footprint exceeds offset boundary (buildable zone)',
      actual: `${outsideCorners} corners outside`,
      limit: '0',
      severity: 'fatal',
    })
  }

  // Wing widths
  for (const wing of wings) {
    const minWidth = metrics.corridorType === 'double_loaded'
      ? RULES.brand.dualMinWidth
      : RULES.brand.singleMinWidth ?? 8.0
    if (wing.width < minWidth) {
      violations.push({
        rule: `Min ${metrics.corridorType === 'double_loaded' ? 'dual' : 'single'}-loaded width (${wing.label})`,
        actual: `${wing.width}m`,
        limit: `${minWidth}m`,
        severity: 'fatal',
      })
    }
    // PAD dual-aspect width warning (per validator.py)
    if (metrics.padUnits > 0 && metrics.corridorType === 'double_loaded'
        && wing.width * 1000 < RULES.brand.padDualMinWidth * 1000) {
      warnings.push(`PAD dual-aspect needs ${RULES.brand.padDualMinWidth}m; wing is ${wing.width}m`)
    }
  }

  // GIA efficiency sanity
  if (metrics.giaPerKey < 25) {
    violations.push({
      rule: 'GIA/key impossibly tight',
      actual: `${metrics.giaPerKey.toFixed(1)}m²`,
      limit: '25m²',
      severity: 'fatal',
    })
  } else if (metrics.giaPerKey < 29 || metrics.giaPerKey > 48) {
    warnings.push(`GIA/key ${metrics.giaPerKey.toFixed(1)} m² — outside benchmark (29-48)`)
  }

  // Footprint within buildable area
  if (metrics.footprint > SITE.maxFootprint) {
    violations.push({
      rule: 'Max footprint (50% of buildable)',
      actual: `${metrics.footprint}m²`,
      limit: `${SITE.maxFootprint}m²`,
      severity: 'fatal',
    })
  }

  return {
    isValid: violations.filter(v => v.severity === 'fatal').length === 0,
    violations,
    warnings,
  }
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/validator.ts studio/src/engine/__tests__/validator.test.ts
git commit -m "feat(engine): add validator — planning + brand rule checking"
```

---

### Task 7: Engine — Cost Module

**Files:**
- Create: `studio/src/engine/cost.ts`
- Create: `studio/src/engine/__tests__/cost.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/scoring/cost.py` (99 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { estimateCost } from '../cost'
import type { OptionMetrics } from '../types'

describe('estimateCost', () => {
  const baseMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 14, outdoorTotal: 660,
    costPerKey: 0, tdc: 0,
    corridorType: 'double_loaded', form: 'BAR',
  }

  it('estimates total cost near $40M for 130-key BAR', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.total).toBeGreaterThan(30_000_000)
    expect(cost.total).toBeLessThan(50_000_000)
  })

  it('includes land at $3.5M', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.breakdown.land).toBe(3_500_000)
  })

  it('applies form multiplier for L-shape', () => {
    const barCost = estimateCost(baseMetrics)
    const lCost = estimateCost({ ...baseMetrics, form: 'L' })
    expect(lCost.breakdown.construction).toBeGreaterThan(barCost.breakdown.construction)
  })

  it('calculates per-key cost', () => {
    const cost = estimateCost(baseMetrics)
    expect(cost.perKey).toBeCloseTo(cost.total / 130, -3)
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement cost.ts**

Port from cost.py with v2 recalibrated rates:

```typescript
import type { OptionMetrics, CostEstimate, FormType } from './types'
import { FINANCIALS } from '@/config/financials'

const RATES = {
  modularPerM2: 2800,
  facadePerM2: 450,
  ffePerKey: { yotel: 22000, pad: 28000 },
  techPerKey: 8000,
  outdoorPerM2: 800,
  siteWorks: 2_200_000,
  softCostPct: 0.12,
  contingencyPct: 0.08,
} as const

const FORM_MULTIPLIER: Record<FormType, number> = {
  BAR: 1.0, BAR_NS: 1.0, L: 1.08, U: 1.14, C: 1.11,
}

export function estimateCost(metrics: OptionMetrics): CostEstimate {
  const mult = FORM_MULTIPLIER[metrics.form]

  const construction = metrics.gia * RATES.modularPerM2 * mult
  const facade = metrics.gia * 0.3 * RATES.facadePerM2 // ~30% of GIA as facade area
  const ffe = metrics.yotelKeys * RATES.ffePerKey.yotel +
              metrics.padUnits * RATES.ffePerKey.pad
  const technology = metrics.totalKeys * RATES.techPerKey
  const outdoor = metrics.outdoorTotal * RATES.outdoorPerM2
  const land = FINANCIALS.land
  const siteWorks = RATES.siteWorks

  const hardSubtotal = construction + facade + ffe + technology + outdoor + siteWorks
  const softCosts = hardSubtotal * RATES.softCostPct
  const contingency = hardSubtotal * RATES.contingencyPct

  const total = land + hardSubtotal + softCosts + contingency
  const perKey = total / Math.max(1, metrics.totalKeys)

  return {
    total: Math.round(total),
    perKey: Math.round(perKey),
    breakdown: {
      construction: Math.round(construction),
      facade: Math.round(facade),
      ffe: Math.round(ffe),
      technology: Math.round(technology),
      outdoor: Math.round(outdoor),
      land,
      siteWorks,
      softCosts: Math.round(softCosts),
      contingency: Math.round(contingency),
    },
  }
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/cost.ts studio/src/engine/__tests__/cost.test.ts
git commit -m "feat(engine): add cost model with form multipliers and v2 rates"
```

---

### Task 8: Engine — Scorer Module

**Files:**
- Create: `studio/src/engine/scorer.ts`
- Create: `studio/src/engine/__tests__/scorer.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/scoring/scorer.py` (125 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { scoreOption } from '../scorer'
import type { OptionMetrics, ScoringWeights } from '../types'
import { DEFAULT_WEIGHTS } from '@/config/scoring-weights'

describe('scoreOption', () => {
  const baseMetrics: OptionMetrics = {
    totalKeys: 130, yotelKeys: 100, padUnits: 30,
    gia: 4620, giaPerKey: 35.5, footprint: 770,
    coverage: 0.21, buildingHeight: 20.5,
    westFacade: 40, outdoorTotal: 660,
    costPerKey: 307692, tdc: 40_000_000,
    corridorType: 'double_loaded', form: 'BAR',
  }

  it('scores a baseline 130-key BAR between 50 and 85', () => {
    const [score] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(score).toBeGreaterThan(50)
    expect(score).toBeLessThan(85)
  })

  it('returns breakdown for all 9 criteria', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(Object.keys(breakdown)).toHaveLength(9)
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
      expect(breakdown[key]).toBeDefined()
      expect(breakdown[key].raw).toBeGreaterThanOrEqual(0)
      expect(breakdown[key].raw).toBeLessThanOrEqual(1)
    }
  })

  it('gives room_count score of 1.0 for 130 keys (in 120-140 range)', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(breakdown.room_count.raw).toBe(1)
  })

  it('uses v2 recalibrated cost thresholds — $307k scores on-budget (0.75)', () => {
    const [, breakdown] = scoreOption(baseMetrics, DEFAULT_WEIGHTS)
    expect(breakdown.cost_per_key.raw).toBe(0.75)
  })

  it('penalizes high buildings', () => {
    const [score1] = scoreOption({ ...baseMetrics, buildingHeight: 20 }, DEFAULT_WEIGHTS)
    const [score2] = scoreOption({ ...baseMetrics, buildingHeight: 24 }, DEFAULT_WEIGHTS)
    expect(score1).toBeGreaterThan(score2)
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement scorer.ts**

Port from scorer.py with v2 recalibrated cost/key thresholds:

```typescript
import type { OptionMetrics, ScoringWeights, ScoreBreakdown } from './types'

type ScoringResult = [number, Record<string, ScoreBreakdown>]

export function scoreOption(
  metrics: OptionMetrics,
  weights: ScoringWeights,
): ScoringResult {
  const bd: Record<string, ScoreBreakdown> = {}

  // 1. Room count
  const keys = metrics.totalKeys
  let s: number, r: string
  if (keys >= 120 && keys <= 140) { s = 1.0; r = `${keys} keys — in target range` }
  else if (keys >= 100 && keys < 120) { s = 0.7 + (keys - 100) / 100; r = `${keys} keys — slightly below` }
  else if (keys > 140) { s = Math.max(0.5, 1.0 - (keys - 140) / 100); r = `${keys} keys — above target` }
  else { s = Math.max(0.2, keys / 130); r = `${keys} keys — below minimum` }
  bd.room_count = { raw: round(s), weighted: round(s * weights.room_count), reason: r }

  // 2. GIA efficiency
  const gk = metrics.giaPerKey
  if (gk >= 33 && gk <= 38) { s = 1.0; r = `${gk} m²/key — optimal` }
  else if (gk >= 29 && gk <= 42) { s = 0.7; r = `${gk} m²/key — acceptable` }
  else { s = Math.max(0.2, 1 - Math.abs(gk - 35.5) / 35.5); r = `${gk} m²/key — review` }
  bd.gia_efficiency = { raw: round(s), weighted: round(s * weights.gia_efficiency), reason: r }

  // 3. Sea views
  const wf = metrics.westFacade
  s = Math.min(1.0, wf / 50)
  bd.sea_views = { raw: round(s), weighted: round(s * weights.sea_views), reason: `${wf.toFixed(0)}m west facade` }

  // 4. Building height
  const h = metrics.buildingHeight
  if (h <= 21) { s = 1.0; r = `${h}m — within envelope` }
  else if (h <= 25) { s = 0.6; r = `${h}m — needs approval` }
  else { s = 0.2; r = `${h}m — exceeds limit` }
  bd.building_height = { raw: round(s), weighted: round(s * weights.building_height), reason: r }

  // 5. Outdoor amenity
  const out = metrics.outdoorTotal
  s = Math.min(1.0, out / 900)
  bd.outdoor_amenity = { raw: round(s), weighted: round(s * weights.outdoor_amenity), reason: `${out.toFixed(0)}m² outdoor` }

  // 6. Cost per key — v2 RECALIBRATED thresholds
  const cpk = metrics.costPerKey
  if (cpk <= 290_000) { s = 1.0; r = `$${(cpk / 1000).toFixed(0)}k/key — excellent` }
  else if (cpk <= 320_000) { s = 0.75; r = `$${(cpk / 1000).toFixed(0)}k/key — on budget` }
  else if (cpk <= 360_000) { s = 0.5; r = `$${(cpk / 1000).toFixed(0)}k/key — above target` }
  else { s = 0.2; r = `$${(cpk / 1000).toFixed(0)}k/key — review scope` }
  bd.cost_per_key = { raw: round(s), weighted: round(s * weights.cost_per_key), reason: r }

  // 7. Daylight quality
  const ct = metrics.corridorType
  const form = metrics.form
  if (ct === 'single_loaded') { s = 1.0; r = 'Single-loaded — natural light' }
  else if (form === 'U' || form === 'C') { s = 0.75; r = `${form}-shape with courtyard daylight` }
  else if (form === 'L') { s = 0.65; r = 'L-shape — some corner daylight' }
  else { s = 0.5; r = 'Double-loaded bar — standard' }
  bd.daylight_quality = { raw: round(s), weighted: round(s * weights.daylight_quality), reason: r }

  // 8. PAD mix
  const padPct = metrics.padUnits / Math.max(1, metrics.totalKeys)
  if (padPct >= 0.18 && padPct <= 0.28) { s = 1.0; r = `${(padPct * 100).toFixed(0)}% PAD — optimal` }
  else if (padPct >= 0.12 && padPct <= 0.35) { s = 0.7; r = `${(padPct * 100).toFixed(0)}% PAD — acceptable` }
  else { s = 0.4; r = `${(padPct * 100).toFixed(0)}% PAD — outside range` }
  bd.pad_mix = { raw: round(s), weighted: round(s * weights.pad_mix), reason: r }

  // 9. Form simplicity
  const formScores: Record<string, number> = { BAR: 1.0, BAR_NS: 1.0, L: 0.75, C: 0.6, U: 0.5 }
  s = formScores[form] ?? 0.5
  r = `${form} — ${s >= 0.9 ? 'simplest' : s >= 0.6 ? 'moderate' : 'complex'}`
  bd.form_simplicity = { raw: round(s), weighted: round(s * weights.form_simplicity), reason: r }

  const total = Object.values(bd).reduce((sum, v) => sum + v.weighted, 0)
  return [Math.round(total * 1000) / 10, bd] // 0-100 with 1 decimal
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/scorer.ts studio/src/engine/__tests__/scorer.test.ts
git commit -m "feat(engine): add scorer — 9-criteria with v2 recalibrated cost thresholds"
```

---

### Task 9: Engine — Revenue Module

**Files:**
- Create: `studio/src/engine/revenue.ts`
- Create: `studio/src/engine/__tests__/revenue.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/scoring/revenue.py` (197 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { projectRevenue } from '../revenue'

describe('projectRevenue', () => {
  it('projects 5 years of revenue for 100 YOTEL + 30 PAD', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.years).toHaveLength(5)
  })

  it('revenue ramps up year over year', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.years[2].totalRevenue).toBeGreaterThan(result.years[0].totalRevenue)
  })

  it('achieves ~51% GOP margin at stabilisation', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.gopMargin).toBeGreaterThan(0.45)
    expect(result.gopMargin).toBeLessThan(0.55)
  })

  it('calculates stabilised NOI > $3M', () => {
    const result = projectRevenue(100, 30, 5)
    expect(result.stabilisedNoi).toBeGreaterThan(3_000_000)
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement revenue.ts**

Port from revenue.py using v2 financial parameters:

```typescript
import type { RevenueProjection, YearlyRevenue } from './types'
import { FINANCIALS } from '@/config/financials'

/** Bottom-up opex ratios (from revenue.py) — % of total revenue. */
const OPEX_RATIOS = {
  rooms_expense:    0.139,
  fnb_expense:      0.125,
  sales_marketing:  0.070,
  ga_tech:          0.090,
  pom_utilities:    0.060,
  management_fee:   0.075,
} as const

/** Below-GOP charges (from revenue.py). */
const FFR_RESERVE_PCT = 0.04
const INSURANCE_TAX_PCT = 0.112

export function projectRevenue(
  ytRooms: number,
  padUnits: number,
  years: number = 5,
): RevenueProjection {
  const yearlyData: YearlyRevenue[] = []
  const totalKeys = ytRooms + padUnits

  for (let y = 0; y < years; y++) {
    const ytOcc = FINANCIALS.yotelOccRamp[Math.min(y, FINANCIALS.yotelOccRamp.length - 1)]
    const ytAdr = FINANCIALS.yotelAdrRamp[Math.min(y, FINANCIALS.yotelAdrRamp.length - 1)]
    const padOcc = FINANCIALS.yotelpadOccRamp[Math.min(y, FINANCIALS.yotelpadOccRamp.length - 1)]
    const padAdr = FINANCIALS.yotelpadAdrRamp[Math.min(y, FINANCIALS.yotelpadAdrRamp.length - 1)]

    // Room nights (per revenue.py: partial first year = 210 days)
    const days = y === 0 ? 210 : 365

    const ytRoomNights = ytRooms * days * ytOcc
    const padRoomNights = padUnits * days * padOcc
    const totalNights = ytRoomNights + padRoomNights

    // Revenue
    const roomRevenue = ytRoomNights * ytAdr + padRoomNights * padAdr
    const fnbRevenue = totalNights * FINANCIALS.fnbPerOccupiedRoom
    const otherRevenue = totalNights * FINANCIALS.otherPerOccupiedRoom
    const totalRevenue = roomRevenue + fnbRevenue + otherRevenue

    // Bottom-up operating expenses (from revenue.py OPEX_RATIOS)
    const totalOpex = Object.values(OPEX_RATIOS).reduce(
      (sum, ratio) => sum + totalRevenue * ratio, 0,
    )

    // GOP = revenue - opex (NOT a flat margin)
    const gop = totalRevenue - totalOpex
    const gopMargin = totalRevenue > 0 ? gop / totalRevenue : 0

    // NOI = GOP - FF&R reserve - insurance/tax (from revenue.py)
    const ffr = totalRevenue * FFR_RESERVE_PCT
    const insTax = totalRevenue * INSURANCE_TAX_PCT
    const noi = gop - ffr - insTax

    yearlyData.push({
      year: y + 1,
      yotelOcc: ytOcc,
      padOcc: padOcc,
      yotelAdr: ytAdr,
      padAdr: padAdr,
      totalRevenue: Math.round(totalRevenue),
      gop: Math.round(gop),
      noi: Math.round(noi),
    })
  }

  const stabilised = yearlyData[Math.min(2, yearlyData.length - 1)] // Year 3
  const stabilisedGopMargin = stabilised.totalRevenue > 0
    ? stabilised.gop / stabilised.totalRevenue : 0

  return {
    years: yearlyData,
    stabilisedNoi: stabilised.noi,
    stabilisedNoiPerKey: Math.round(stabilised.noi / Math.max(1, totalKeys)),
    gopMargin: stabilisedGopMargin,
    revPar: Math.round(stabilised.totalRevenue / (totalKeys * 365)),
  }
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add studio/src/engine/revenue.ts studio/src/engine/__tests__/revenue.test.ts
git commit -m "feat(engine): add revenue projection with v2 ramp parameters"
```

---

### Task 10: Engine — Generator Module

**Files:**
- Create: `studio/src/engine/generator.ts`
- Create: `studio/src/engine/__tests__/generator.test.ts`

Reference: `caro_client_export/full_clean_export/backend/engine/generation/generator.py` (241 lines)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { buildOption, generateAll, groupOptions } from '../generator'
import type { GenerationParams } from '../types'

describe('buildOption', () => {
  it('builds a complete option from params', () => {
    const params: GenerationParams = {
      form: 'BAR', targetFloorArea: 770, wingWidth: 14,
      storeys: 6, corridorType: 'double_loaded',
      ytRooms: 100, padUnits: 30, outdoorPosition: 'WEST',
    }
    const option = buildOption(params)
    expect(option.id).toBeTruthy()
    expect(option.form).toBe('BAR')
    expect(option.metrics.totalKeys).toBe(130)
    expect(option.score).toBeGreaterThan(0)
    expect(option.floors.length).toBeGreaterThan(0)
    expect(option.cost.total).toBeGreaterThan(0)
  })
})

describe('generateAll', () => {
  it('generates multiple options across design space', () => {
    const options = generateAll(20)
    expect(options.length).toBeGreaterThan(5)
    expect(options.length).toBeLessThanOrEqual(20)
    // Should be sorted by score descending
    for (let i = 1; i < options.length; i++) {
      expect(options[i - 1].score).toBeGreaterThanOrEqual(options[i].score)
    }
  })
})

describe('groupOptions', () => {
  it('groups options into categories', () => {
    const options = generateAll(20)
    const groups = groupOptions(options)
    expect(groups.best_overall).toBeDefined()
    expect(groups.best_overall.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement generator.ts**

Port from generator.py — the main option builder and design space sweep:

```typescript
import type {
  GenerationParams, DesignOption, FormType, CorridorType,
  OutdoorPosition, OptionMetrics, OptionGroups,
} from './types'
import { generateForm } from './forms'
import { roomsPerFloor, buildFloorProgramme } from './rooms'
import { validate } from './validator'
import { scoreOption } from './scorer'
import { estimateCost } from './cost'
import { projectRevenue } from './revenue'
import { CONSTRUCTION } from '@/config/construction'
import { SITE } from '@/config/site'
import { PROGRAMME, YOTEL_ROOMS, YOTELPAD_UNITS } from '@/config/programme'
import { DEFAULT_WEIGHTS } from '@/config/scoring-weights'

const GROUND_H = 4.5
const FLOOR_H = 3.2

const DESIGN_SPACE = {
  forms: ['BAR', 'BAR_NS', 'L', 'U', 'C'] as FormType[],
  floorAreas: [650, 770, 900, 1050],
  wingWidths: [13.6, 14.0, 16.1],
  storeys: [5, 6, 7],
  corridors: ['double_loaded'] as CorridorType[],
  ytRooms: [80, 90, 100, 110],
  padUnits: [20, 25, 30, 35],
  outdoor: ['WEST'] as OutdoorPosition[],
}

let optionCounter = 0

export function buildOption(params: GenerationParams): DesignOption {
  const id = `opt-${++optionCounter}`

  // Generate form geometry
  const formResult = generateForm(params.form, params.targetFloorArea, params.wingWidth)

  // Assign storeys to wings
  const wings = formResult.wings.map(w => ({ ...w, floors: params.storeys }))

  // Calculate rooms per floor dynamically (per generator.py)
  const ytPerFloor = roomsPerFloor(wings, params.corridorType, YOTEL_ROOMS)
  const padPerFloor = roomsPerFloor(wings, params.corridorType, YOTELPAD_UNITS)

  // Dynamic floor allocation (per generator.py lines 60-61):
  // YOTEL floors = min(ceil(target / rpf), storeys - 1)
  // PAD floors = min(ceil(target / rpf), storeys - 1 - ytFloorCount)
  const upperFloors = params.storeys - 1  // exclude ground
  const ytFloorCount = params.ytRooms > 0
    ? Math.min(Math.ceil(params.ytRooms / Math.max(1, ytPerFloor)), upperFloors)
    : 0
  const padFloorCount = params.padUnits > 0
    ? Math.min(Math.ceil(params.padUnits / Math.max(1, padPerFloor)), upperFloors - ytFloorCount)
    : 0

  const ytFloors = Array.from({ length: ytFloorCount }, (_, i) => i + 1)
  const actualPadFloors = Array.from({ length: padFloorCount }, (_, i) => i + 1 + ytFloorCount)

  // Actual room counts (clamped to what fits)
  const actualYtRooms = Math.min(params.ytRooms, ytFloorCount * ytPerFloor)
  const actualPadUnits = Math.min(params.padUnits, padFloorCount * padPerFloor)

  const floors = buildFloorProgramme({
    storeys: params.storeys,
    ytPerFloor: Math.round(ytPerFloor),
    padPerFloor: Math.round(padPerFloor),
    ytFloors,
    padFloors: actualPadFloors,
    footprint: formResult.footprint,
  })

  // Calculate metrics (use actual clamped counts, not targets)
  const totalGia = floors.reduce((sum, f) => sum + f.gia, 0)
  const totalKeys = actualYtRooms + actualPadUnits
  if (totalKeys < 50) throw new Error('Too few keys')
  const height = GROUND_H + (params.storeys - 1) * FLOOR_H
  const coverage = formResult.footprint / SITE.buildableArea
  const outdoorTotal = params.outdoorPosition === 'BOTH' ? 660 + 80 :
                       params.outdoorPosition === 'ROOFTOP' ? 80 : 660

  const metrics: OptionMetrics = {
    totalKeys,
    yotelKeys: actualYtRooms,
    padUnits: actualPadUnits,
    gia: totalGia,
    giaPerKey: totalGia / Math.max(1, totalKeys),
    footprint: formResult.footprint,
    coverage,
    buildingHeight: height,
    westFacade: formResult.westFacade,
    outdoorTotal,
    costPerKey: 0, // filled below
    tdc: 0,        // filled below
    corridorType: params.corridorType,
    form: params.form,
  }

  // Cost
  const cost = estimateCost(metrics)
  metrics.tdc = cost.total
  metrics.costPerKey = cost.perKey

  // Revenue
  const revenue = projectRevenue(actualYtRooms, actualPadUnits, 5)

  // Validate
  const validation = validate(metrics, wings)

  // Score
  const [score, scoringBreakdown] = scoreOption(metrics, DEFAULT_WEIGHTS)

  return {
    id, form: params.form, params, wings, floors, metrics,
    cost, revenue, score, scoringBreakdown, validation,
  }
}

export function generateAll(maxOptions: number = 50): DesignOption[] {
  optionCounter = 0
  const options: DesignOption[] = []

  for (const form of DESIGN_SPACE.forms) {
    for (const area of DESIGN_SPACE.floorAreas) {
      for (const width of DESIGN_SPACE.wingWidths) {
        for (const storeys of DESIGN_SPACE.storeys) {
          for (const yt of DESIGN_SPACE.ytRooms) {
            for (const pad of DESIGN_SPACE.padUnits) {
              const params: GenerationParams = {
                form, targetFloorArea: area, wingWidth: width,
                storeys, corridorType: 'double_loaded',
                ytRooms: yt, padUnits: pad, outdoorPosition: 'WEST',
              }
              try {
                const opt = buildOption(params)
                if (opt.validation.isValid) options.push(opt)
              } catch {
                // Skip invalid parameter combinations
              }
            }
          }
        }
      }
    }
  }

  // Sort by score descending, take top N
  options.sort((a, b) => b.score - a.score)
  return options.slice(0, maxOptions)
}

export function groupOptions(options: DesignOption[]): OptionGroups {
  const sorted = [...options]
  return {
    best_overall: sorted.slice(0, 5).map(o => o.id),
    most_rooms: [...sorted].sort((a, b) => b.metrics.totalKeys - a.metrics.totalKeys).slice(0, 3).map(o => o.id),
    lowest_height: [...sorted].sort((a, b) => a.metrics.buildingHeight - b.metrics.buildingHeight).slice(0, 3).map(o => o.id),
    best_views: [...sorted].sort((a, b) => b.metrics.westFacade - a.metrics.westFacade).slice(0, 3).map(o => o.id),
    lowest_cost: [...sorted].sort((a, b) => a.metrics.costPerKey - b.metrics.costPerKey).slice(0, 3).map(o => o.id),
    most_outdoor: [...sorted].sort((a, b) => b.metrics.outdoorTotal - a.metrics.outdoorTotal).slice(0, 3).map(o => o.id),
    most_efficient: [...sorted].sort((a, b) => a.metrics.giaPerKey - b.metrics.giaPerKey).slice(0, 3).map(o => o.id),
    pad_heavy: [...sorted].sort((a, b) => b.metrics.padUnits - a.metrics.padUnits).slice(0, 3).map(o => o.id),
  }
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Run ALL engine tests**

```bash
cd studio && npx vitest run src/engine/
```

Expected: All tests pass across all 7 engine modules.

- [ ] **Step 6: Commit**

```bash
git add studio/src/engine/generator.ts studio/src/engine/__tests__/generator.test.ts
git commit -m "feat(engine): add generator — design space sweep and option builder"
```

---

### Task 11: Command Center Shell

**Files:**
- Create: `studio/src/components/shell/icon-rail.tsx`
- Create: `studio/src/components/shell/floating-panel.tsx`
- Create: `studio/src/components/shell/command-bar.tsx`
- Create: `studio/src/app/(studio)/layout.tsx`

Reference: Spec §3 Visual Design — Layout Zones

- [ ] **Step 1: Create icon-rail.tsx**

Dark navy 56px rail with module icons. Uses Lucide icons (bundled with shadcn/ui).

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Box, FileCheck, BarChart3, FolderOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const modules = [
  { href: '/design', icon: Box, label: 'Design', shortcut: '1' },
  { href: '/planning', icon: FileCheck, label: 'Planning', shortcut: '2' },
  { href: '/finance', icon: BarChart3, label: 'Finance', shortcut: '3' },
  { href: '/dataroom', icon: FolderOpen, label: 'Dataroom', shortcut: '4' },
  { href: '/invest', icon: Users, label: 'Investors', shortcut: '5' },
]

export function IconRail() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex h-full w-14 flex-col items-center gap-1 bg-[--rail-bg] py-3">
        {/* Logo */}
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-sky-400/20 text-xs font-bold text-sky-400">
          YB
        </div>

        {modules.map((mod) => {
          const isActive = pathname.startsWith(mod.href)
          return (
            <Tooltip key={mod.href}>
              <TooltipTrigger asChild>
                <Link
                  href={mod.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-sky-400/20 text-sky-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <mod.icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {mod.label} <kbd className="ml-1 text-[10px] text-muted-foreground">{mod.shortcut}</kbd>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
```

- [ ] **Step 2: Create floating-panel.tsx**

Reusable frosted glass overlay container:

```tsx
import { cn } from '@/lib/utils'

interface FloatingPanelProps {
  children: React.ReactNode
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const positionClasses = {
  'top-left': 'top-3 left-3',
  'top-right': 'top-3 right-3',
  'bottom-left': 'bottom-3 left-3',
  'bottom-right': 'bottom-3 right-3',
}

export function FloatingPanel({ children, className, position }: FloatingPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/92 px-3 py-2 shadow-lg backdrop-blur-xl',
        position && `absolute ${positionClasses[position]}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create command-bar.tsx**

Top bar with project name and actions:

```tsx
export function CommandBar() {
  return (
    <div className="flex h-10 items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">YOTEL Barbados</span>
        <span className="text-xs text-slate-500">Carlisle Bay, Bridgetown</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-mono">130 keys</span>
        <span>·</span>
        <span className="font-mono">$40M TDC</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create studio layout**

Create `studio/src/app/(studio)/layout.tsx`:

```tsx
import { IconRail } from '@/components/shell/icon-rail'
import { CommandBar } from '@/components/shell/command-bar'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <IconRail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CommandBar />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create placeholder design page**

Create `studio/src/app/(studio)/design/page.tsx`:

```tsx
export default function DesignPage() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">3D Viewer loads here</p>
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Start dev server and verify:
- Dark navy rail on left with 5 icons
- Active icon (Design) highlighted in sky-400
- Command bar at top with project name
- Main viewport area fills remaining space

- [ ] **Step 7: Commit**

```bash
git add studio/src/components/shell/ studio/src/app/\(studio\)/
git commit -m "feat(shell): add command center layout — icon rail, floating panel, command bar"
```

---

### Task 12: Three.js 3D Viewer — Scene Setup

**Files:**
- Create: `studio/src/components/viewer/scene-setup.ts`
- Create: `studio/src/components/viewer/camera-presets.ts`
- Create: `studio/src/components/viewer/basemap.ts`
- Create: `studio/src/components/viewer/site-overlays.ts`
- Create: `studio/src/components/viewer/viewer-3d.tsx`

Reference: `caro_client_export/full_clean_export/frontend/src/components/Viewer3D.jsx` (263 lines) + `caro_client_export/full_clean_export/frontend/src/utils/mapData.js` (236 lines)

- [ ] **Step 1: Create camera-presets.ts**

Port view positions from the existing viewer:

```typescript
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
```

- [ ] **Step 2: Create scene-setup.ts**

Initialize Three.js renderer, camera, lights:

```typescript
import * as THREE from 'three'

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
```

- [ ] **Step 3: Create basemap.ts**

Port satellite/street/topo tile loading from Viewer3D.jsx `getTileInfo`/`loadTiles` + mapData.js. This is the ground-plane basemap that gives spatial context.

```typescript
import * as THREE from 'three'
import type { BasemapType } from '@/engine/types'

/** Site coordinates for Carlisle Bay, Bridgetown (from mapData.js). */
const SITE_LAT = 13.090456
const SITE_LON = -59.608805

/** Tile URL generators for each basemap type. */
const TILE_URL: Record<string, (z: number, y: number, x: number) => string> = {
  Satellite: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  Street: (z, y, x) =>
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  Topo: (z, y, x) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
}

/** Convert lat/lon to tile coords + subpixel offset + tile size in metres. */
function getTileInfo(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const tileX = Math.floor((lon + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  const fracX = (lon + 180) / 360 * n - tileX
  const fracY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - tileY
  const tileM = 40075016.686 * Math.cos(latRad) / n  // tile size in metres
  return { tileX, tileY, fracX, fracY, tileM }
}

/** Load a 5×5 grid of map tiles as ground-plane meshes.
 *  Ported from Viewer3D.jsx loadTiles(). */
export function loadBasemapTiles(
  scene: THREE.Scene,
  basemap: BasemapType = 'Satellite',
  zoom: number = 17,
): void {
  if (basemap === 'None' || !TILE_URL[basemap]) return

  const urlFn = TILE_URL[basemap]
  const { tileX, tileY, fracX, fracY, tileM } = getTileInfo(SITE_LAT, SITE_LON, zoom)
  const loader = new THREE.TextureLoader()
  loader.crossOrigin = 'anonymous'

  // Origin (0,0) at site centre; tiles positioned relative
  const cx = (0.5 - fracX) * tileM
  const cz = (fracY - 0.5) * tileM

  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const url = urlFn(zoom, tileY + dy, tileX + dx)
      const px = cx + dx * tileM
      const pz = cz - dy * tileM  // south in grid = negative z in scene

      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(tileM, tileM),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
        )
        mesh.rotation.x = Math.PI / 2  // lay flat, north→+Z
        mesh.position.set(px, -0.02, pz)
        mesh.receiveShadow = true
        mesh.name = 'basemap-tile'
        scene.add(mesh)
      })
    }
  }
}

/** Remove all basemap tiles from the scene (for switching basemap type). */
export function clearBasemapTiles(scene: THREE.Scene): void {
  const toRemove = scene.children.filter(c => c.name === 'basemap-tile')
  for (const child of toRemove) {
    scene.remove(child)
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (child.material instanceof THREE.Material) child.material.dispose()
    }
  }
}
```

- [ ] **Step 4: Create site-overlays.ts**

Render site boundary and offset boundary:

```typescript
import * as THREE from 'three'
import { ORIGINAL_BOUNDARY, OFFSET_BOUNDARY } from '@/config/site'
import type { Point2D } from '@/engine/types'

function createBoundaryLine(
  points: Point2D[],
  color: number,
  dashed: boolean = false,
  y: number = 0.1,
): THREE.Line {
  const positions = points.flatMap(p => [p.x, y, p.y])
  // Close the loop
  positions.push(points[0].x, y, points[0].y)

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
  // Original boundary — red dashed
  scene.add(createBoundaryLine(ORIGINAL_BOUNDARY, 0xff4444, true))

  // Offset/buildable boundary — blue solid
  scene.add(createBoundaryLine(OFFSET_BOUNDARY, 0x3b82f6, false))

  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d4, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.set(60, -0.01, 30)
  ground.receiveShadow = true
  scene.add(ground)
}
```

- [ ] **Step 5: Create viewer-3d.tsx**

Client component that renders the Three.js scene:

```tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createRenderer, createCamera, createLights } from './scene-setup'
import { loadBasemapTiles } from './basemap'
import { addSiteOverlays } from './site-overlays'
import { CAMERA_PRESETS } from './camera-presets'
import type { DesignOption, BasemapType } from '@/engine/types'

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
    loadBasemapTiles(scene, 'Satellite')  // Esri satellite basemap
    addSiteOverlays(scene)

    // Building group (will be updated when option changes)
    const buildingGroup = new THREE.Group()
    scene.add(buildingGroup)
    buildingGroupRef.current = buildingGroup

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.target.set(75, 0, 33)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.maxPolarAngle = Math.PI / 2.1

    // Resize
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    resizeObserver.observe(canvas)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    // Animate
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

  // Update building when option changes
  useEffect(() => {
    const group = buildingGroupRef.current
    if (!group) return

    // Clear existing building
    while (group.children.length) group.remove(group.children[0])

    if (!selectedOption) return

    // Render floors
    const GROUND_H = 4.5
    const FLOOR_H = 3.2
    const COLORS: Record<string, number> = {
      FOH_BOH: 0x7A9A70,   // sage
      YOTEL: 0x2E8A76,     // teal
      YOTELPAD: 0xB8456A,  // mauve
      ROOFTOP: 0x94a3b8,   // slate
    }

    const { wings } = selectedOption
    for (const wing of wings) {
      let currentY = 0
      for (const floor of selectedOption.floors) {
        const h = floor.level === 0 ? GROUND_H : FLOOR_H
        const color = COLORS[floor.use] ?? 0xcccccc

        const geometry = new THREE.BoxGeometry(
          wing.direction === 'EW' ? wing.length : wing.width,
          h - 0.1, // small gap between floors
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

        // Edge wireframe
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
```

- [ ] **Step 6: Commit**

```bash
git add studio/src/components/viewer/
git commit -m "feat(viewer): add Three.js 3D viewer with basemap tiles, site overlays, and building renderer"
```

---

### Task 13: Design Page — Full Integration

**Files:**
- Create: `studio/src/components/design/option-card.tsx`
- Create: `studio/src/components/design/options-sidebar.tsx`
- Create: `studio/src/components/design/generator-controls.tsx`
- Create: `studio/src/components/design/metrics-panel.tsx`
- Create: `studio/src/components/design/scoring-panel.tsx`
- Create: `studio/src/components/design/compliance-badge.tsx`
- Modify: `studio/src/app/(studio)/design/page.tsx`

This is the largest task — it wires the engine to the viewer and UI. Build each component then assemble.

- [ ] **Step 1: Create compliance-badge.tsx**

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ComplianceBadgeProps {
  isValid: boolean
  violationCount: number
  warningCount: number
}

export function ComplianceBadge({ isValid, violationCount, warningCount }: ComplianceBadgeProps) {
  if (isValid && warningCount === 0) {
    return <Badge className="bg-green-600 text-white">PASS</Badge>
  }
  if (isValid && warningCount > 0) {
    return <Badge className="bg-amber-500 text-white">{warningCount} warning{warningCount > 1 ? 's' : ''}</Badge>
  }
  return <Badge variant="destructive">{violationCount} violation{violationCount > 1 ? 's' : ''}</Badge>
}
```

- [ ] **Step 2: Create option-card.tsx**

Port from OptionCard.jsx — compact card showing score, form, key metrics:

```tsx
import type { DesignOption } from '@/engine/types'
import { ComplianceBadge } from './compliance-badge'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  option: DesignOption
  isSelected: boolean
  onSelect: (id: string) => void
}

export function OptionCard({ option, isSelected, onSelect }: OptionCardProps) {
  const { metrics, score, validation, form } = option
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-all',
        isSelected
          ? 'border-sky-400 bg-sky-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500">{form}</span>
        <span className="font-mono text-lg font-semibold text-slate-900">{score.toFixed(1)}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        <Metric label="Keys" value={metrics.totalKeys} />
        <Metric label="GFA" value={`${metrics.gia}m²`} />
        <Metric label="Storeys" value={Math.round(metrics.buildingHeight / 3.2 + 1)} />
        <Metric label="$/key" value={`${(metrics.costPerKey / 1000).toFixed(0)}k`} />
        <Metric label="Coverage" value={`${(metrics.coverage * 100).toFixed(0)}%`} />
        <Metric label="Views" value={`${metrics.westFacade.toFixed(0)}m`} />
      </div>
      <div className="mt-2">
        <ComplianceBadge
          isValid={validation.isValid}
          violationCount={validation.violations.length}
          warningCount={validation.warnings.length}
        />
      </div>
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-slate-400">{label}</div>
      <div className="font-mono font-medium text-slate-700">{value}</div>
    </div>
  )
}
```

- [ ] **Step 3: Create options-sidebar.tsx**

Collapsible right sidebar with scrollable option cards:

```tsx
'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import type { DesignOption } from '@/engine/types'
import { OptionCard } from './option-card'
import { cn } from '@/lib/utils'

interface OptionsSidebarProps {
  options: DesignOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function OptionsSidebar({ options, selectedId, onSelect }: OptionsSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={cn('relative flex h-full flex-col border-l border-slate-200 bg-white/80 backdrop-blur-sm transition-all', isOpen ? 'w-60' : 'w-0')}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-8 top-3 z-10 h-6 w-6 rounded-full border bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
      {isOpen && (
        <>
          <div className="border-b px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-900">{options.length} Options</h3>
          </div>
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="flex flex-col gap-2">
              {options.map((opt) => (
                <OptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={opt.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create generator-controls.tsx**

Floating panel with parameter sliders:

```tsx
'use client'

import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { FloatingPanel } from '@/components/shell/floating-panel'
import { Play } from 'lucide-react'
import type { FormType } from '@/engine/types'

interface GeneratorControlsProps {
  onGenerate: () => void
  isGenerating: boolean
}

export function GeneratorControls({ onGenerate, isGenerating }: GeneratorControlsProps) {
  return (
    <FloatingPanel position="bottom-left" className="w-72">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Generator</h3>
        <Button size="sm" onClick={onGenerate} disabled={isGenerating} className="h-7 gap-1 text-xs">
          <Play className="h-3 w-3" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Sweeps 5 form types across parameter space. Takes ~2 seconds.
      </p>
    </FloatingPanel>
  )
}
```

- [ ] **Step 5: Create metrics-panel.tsx**

Floating overlay with key metrics for selected option:

```tsx
import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption } from '@/engine/types'

interface MetricsPanelProps {
  option: DesignOption | null
}

export function MetricsPanel({ option }: MetricsPanelProps) {
  if (!option) return null

  const { metrics } = option
  return (
    <FloatingPanel position="top-left">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <Metric label="Keys" value={metrics.totalKeys} />
        <Metric label="YOTEL" value={metrics.yotelKeys} />
        <Metric label="YOTELPAD" value={metrics.padUnits} />
        <Metric label="GFA" value={`${metrics.gia.toLocaleString()} m²`} />
        <Metric label="Coverage" value={`${(metrics.coverage * 100).toFixed(1)}%`} />
        <Metric label="Height" value={`${metrics.buildingHeight.toFixed(1)}m`} />
      </div>
    </FloatingPanel>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-medium text-slate-900">{value}</span>
    </div>
  )
}
```

- [ ] **Step 6: Create scoring-panel.tsx**

Score breakdown display:

```tsx
import { FloatingPanel } from '@/components/shell/floating-panel'
import type { DesignOption, ScoreBreakdown } from '@/engine/types'
import { WEIGHT_DESCRIPTIONS } from '@/config/scoring-weights'
import { cn } from '@/lib/utils'

interface ScoringPanelProps {
  option: DesignOption | null
}

export function ScoringPanel({ option }: ScoringPanelProps) {
  if (!option) return null

  return (
    <FloatingPanel position="bottom-right" className="w-64">
      <h3 className="text-xs font-semibold text-slate-900">
        Score: <span className="font-mono text-base">{option.score.toFixed(1)}</span>
      </h3>
      <div className="mt-2 flex flex-col gap-1">
        {Object.entries(option.scoringBreakdown).map(([key, bd]) => (
          <ScoreRow key={key} name={key} breakdown={bd} />
        ))}
      </div>
    </FloatingPanel>
  )
}

function ScoreRow({ name, breakdown }: { name: string; breakdown: ScoreBreakdown }) {
  const pct = Math.round(breakdown.raw * 100)
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-20 truncate text-slate-500">{name.replace(/_/g, ' ')}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full',
            pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 font-mono text-right text-slate-700">{pct}</span>
    </div>
  )
}
```

- [ ] **Step 7: Wire up the design page**

Update `studio/src/app/(studio)/design/page.tsx` to connect everything:

```tsx
'use client'

import { useState, useCallback, useTransition } from 'react'
import { Viewer3D } from '@/components/viewer/viewer-3d'
import { OptionsSidebar } from '@/components/design/options-sidebar'
import { GeneratorControls } from '@/components/design/generator-controls'
import { MetricsPanel } from '@/components/design/metrics-panel'
import { ScoringPanel } from '@/components/design/scoring-panel'
import { generateAll } from '@/engine/generator'
import type { DesignOption } from '@/engine/types'

export default function DesignPage() {
  const [options, setOptions] = useState<DesignOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedOption = options.find(o => o.id === selectedId) ?? null

  const handleGenerate = useCallback(() => {
    startTransition(() => {
      const generated = generateAll(40)
      setOptions(generated)
      if (generated.length > 0) setSelectedId(generated[0].id)
    })
  }, [])

  return (
    <div className="flex h-full">
      {/* Main viewport */}
      <div className="relative flex-1">
        <Viewer3D selectedOption={selectedOption} className="h-full w-full" />

        {/* Floating overlays */}
        <MetricsPanel option={selectedOption} />
        <ScoringPanel option={selectedOption} />
        <GeneratorControls onGenerate={handleGenerate} isGenerating={isPending} />
      </div>

      {/* Right sidebar */}
      <OptionsSidebar
        options={options}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  )
}
```

- [ ] **Step 8: Verify end-to-end in browser**

Start dev server, navigate to /design:
1. See command center layout (icon rail + top bar + viewport)
2. Click Generate — options appear in right sidebar
3. Click an option card — building renders in 3D viewer
4. Floating panels show metrics and scoring breakdown
5. Site boundaries visible (red dashed = original, blue = buildable)

- [ ] **Step 9: Commit**

```bash
git add studio/src/components/design/ studio/src/app/\(studio\)/design/
git commit -m "feat(design): wire up massing tool — generator, 3D viewer, options sidebar, floating panels"
```

---

### Task 14: Placeholder Pages for Other Modules

**Files:**
- Create: `studio/src/app/(studio)/planning/page.tsx`
- Create: `studio/src/app/(studio)/finance/page.tsx`
- Create: `studio/src/app/(studio)/dataroom/page.tsx`
- Create: `studio/src/app/(studio)/invest/page.tsx`

- [ ] **Step 1: Create placeholder pages**

Each placeholder shows the module name and "Coming in Phase 2/3":

```tsx
// planning/page.tsx
export default function PlanningPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <h1 className="text-lg font-semibold text-slate-900">Planning Compliance</h1>
      <p className="text-sm text-slate-500">5-track approval workflow — Phase 2</p>
    </div>
  )
}
```

Create similar files for finance, dataroom, invest.

- [ ] **Step 2: Verify icon rail navigation**

Click each icon in the rail — verify page changes and active indicator moves.

- [ ] **Step 3: Commit**

```bash
git add studio/src/app/\(studio\)/
git commit -m "feat(pages): add placeholder pages for planning, finance, dataroom, investor"
```

---

### Task 15: Run Full Test Suite + Final Verification

- [ ] **Step 1: Run all engine tests**

```bash
cd studio && npx vitest run
```

Expected: All engine tests pass (forms, rooms, validator, scorer, cost, revenue, generator).

- [ ] **Step 2: Run linter**

```bash
cd studio && npx next lint
```

Fix any linting errors.

- [ ] **Step 3: Run type check**

```bash
cd studio && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 4: Verify dev server**

```bash
cd studio && npm run dev -- --port 3001
```

Navigate to localhost:3001/design. Complete end-to-end check:
- Command center layout renders correctly
- Generate button produces options
- 3D viewer shows building with floor colors (teal/mauve/sage)
- Site boundaries visible
- Option cards are clickable and update the viewer
- Floating panels show metrics and scores
- Icon rail navigation works for all 5 modules

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(studio): fix lint and type errors, finalize Phase 1"
```

---

## Summary

| Task | What it builds | Estimated complexity |
|------|---------------|---------------------|
| 1 | Next.js scaffold + deps | Setup |
| 2 | Engine types | Small |
| 3 | Config files (6 files) | Medium |
| 4 | Forms module + tests | Medium |
| 5 | Rooms module + tests | Medium |
| 6 | Validator module + tests | Medium |
| 7 | Cost module + tests | Small |
| 8 | Scorer module + tests | Medium |
| 9 | Revenue module + tests | Medium |
| 10 | Generator module + tests | Large |
| 11 | Command center shell | Medium |
| 12 | Three.js 3D viewer | Large |
| 13 | Design page integration | Large |
| 14 | Placeholder pages | Small |
| 15 | Final test + verification | Verification |

**Total: 15 tasks, ~60 files created.**

Phase 1 delivers: working massing tool with 3D viewer, parametric engine, scoring, and command center shell. No database, no auth, no server-side persistence — all client-side for Phase 1.
