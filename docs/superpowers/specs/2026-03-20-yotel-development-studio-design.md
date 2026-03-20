# YOTEL Development Studio — Design Specification

**Date:** 2026-03-20
**Status:** Approved
**Author:** Kevyn Shorey (Coruscant Developments) + Claude

---

## 1. Product Summary

A presentation-grade internal development platform for the YOTEL + YOTELPAD Carlisle Bay project. Combines a parametric 3D massing tool, planning compliance tracker, financial dashboard, project dataroom, and investor portal into a single application. Designed for investor demos and potential future SaaS commercialization.

### Users
- **Primary:** Kevyn Shorey (development sponsor) — design decisions, financial modeling, investor presentations
- **Secondary:** Investors, lenders, DFIs — read-only project views via time-limited share links
- **Future:** Other hotel/real estate developers (SaaS)

### Key Decisions
- **Layout:** Command Center — icon rail + map-first viewport + floating panels
- **Visual Style:** Map-first with frosted-glass floating overlays on satellite basemap
- **Tech Stack:** Next.js 16, TypeScript, shadcn/ui, Three.js, Drizzle + Neon Postgres
- **Auth:** Magic link + JWT (upgrade path to Clerk for SaaS)
- **Massing Engine:** Full TypeScript rewrite of Python engine (runs client-side)
- **Deploy:** Vercel

---

## 1a. Canonical Values Reference

Every numeric parameter the engine uses is listed here with its authoritative value and source. When sources conflict, site.py (T2 survey) overrides config.py (T5 assumptions).

### Site Geometry (canonical source: `site.py` — Dynamo/Revit survey export)

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| Gross site area | 5,965 m² | site.py (survey) | config.py says 3,250 — that is an early estimate, superseded |
| Buildable area | 3,599.1 m² | site.py (offset boundary) | After directional setbacks W=55m, N=8m, E=5m, S=5m |
| Max coverage | 50% | PDP 2023 (T1) | Consistent across all sources |
| Max footprint | 1,800 m² | site.py (3,599 × 0.50) | |
| Max height | 25.0 m | site.py + rules.yml (T1) | config.py says 21m — that was the building target, not the planning limit |
| Buildable E-W span | 79.84 m | site.py | |
| Buildable N-S span | 48.69 m | site.py | |
| Original boundary vertices | 10 points | site.py `ORIGINAL_BOUNDARY` | Survey-derived, Revit base point origin |
| Offset boundary vertices | 10 points | site.py `OFFSET_BOUNDARY` | Buildable zone after setbacks |
| Building placement | x=65, y=9, rot=8° | site.py `VIEWER_BUILDING_PLACEMENT` | Used by existing Three.js viewer |

**Migration note**: config.py `SITE["boundary_pts"]` (6 simplified points) must NOT be used in the TypeScript port. Use site.py's 10-vertex `ORIGINAL_BOUNDARY` and `OFFSET_BOUNDARY` arrays.

### Scoring Weights (canonical source: `scorer.py` — the actual implementation)

| Criterion | Weight | scorer.py key | Notes |
|-----------|--------|--------------|-------|
| Room count | 0.18 | `room_count` | Target 120-140 keys |
| GIA efficiency | 0.14 | `gia_efficiency` | Sweet spot 33-38 m²/key |
| Sea views | 0.14 | `sea_views` | West-facing facade length |
| Building height | 0.10 | `building_height` | Lower = easier planning |
| Outdoor amenity | 0.10 | `outdoor_amenity` | Total outdoor area |
| Cost per key | 0.12 | `cost_per_key` | **Thresholds recalibrated for v2** (see below) |
| Daylight quality | 0.08 | `daylight_quality` | Corridor natural light |
| PAD mix | 0.06 | `pad_mix` | 18-28% YOTELPAD optimal |
| Form simplicity | 0.08 | `form_simplicity` | BAR=1.0, L=0.75, C=0.6, U=0.5 |

**Divergence from config.py**: config.py `SCORE_WEIGHTS` has only 8 criteria (includes `far` and `outdoor_ratio`, omits `pad_mix` and `form_simplicity`) with different weight values. The TypeScript port must use scorer.py's 9-criteria system — config.py weights are stale.

### Cost/Key Scorer Recalibration (v2)

With v2 equalized TDC of $40M / 130 keys = **$307,692/key**, the original scorer thresholds need updating:

| Rating | Original (config.py era) | Recalibrated (v2) |
|--------|--------------------------|-------------------|
| Excellent (1.0) | ≤ $230,000 | ≤ $290,000 |
| On budget (0.75) | ≤ $270,000 | ≤ $320,000 |
| Above target (0.5) | ≤ $320,000 | ≤ $360,000 |
| Review scope (0.2) | > $320,000 | > $360,000 |

These thresholds will be implemented in `engine/scorer.ts`. The recalibration ensures the baseline 130-key option scores ~0.75 ("on budget") rather than penalizing the approved v2 budget.

### Financial Parameters (canonical source: `CONFLICT_RESOLUTION_v2.md` — sponsor directives)

| Parameter | Value | Source |
|-----------|-------|--------|
| TDC | $40,000,000 | Sponsor directive |
| Hard cost | $350/sf × 75,000 sf | Sponsor directive |
| Land | $3,500,000 | Signed HoT |
| YOTEL ADR (Yr 3) | $195 | Brand guidelines |
| YOTELPAD ADR | $270 | Brand guidelines |
| YOTEL Occupancy (Yr 3) | 78% | Industry benchmark |
| YOTELPAD Occupancy (Yr 3) | 75% | config.py (extended-stay dynamics) |
| GOP margin | 51% | Sponsor directive |
| YOTEL fees | 15.5% inclusive | Sponsor directive |
| Senior debt | $24M at 6.5% I/O | Indicative |
| Mezz | $5M at 11% PIK | Indicative |

**Note**: config.py `FINANCIALS` still has old values (TDC=$32.5M, GOP=44%, cost/key=$250k). The TypeScript `config/financials.ts` must use v2 equalized values above.

---

## 2. Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│  BROWSER (Client Components)                            │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │ Three.js │ │ Massing  │ │shadcn/ │ │  Recharts    │ │
│  │ 3D View  │ │ Engine   │ │ ui     │ │  Charts      │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────┤
│  NEXT.JS APP ROUTER (Server + API Routes)               │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │ Layout   │ │ Auth     │ │ Share  │ │ Project Data │ │
│  │ Shell    │ │ Magic Lnk│ │ Links  │ │ API          │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────┤
│  DATA LAYER                                             │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────────┐  │
│  │ Neon     │ │ Vercel   │ │ Project Config (TS)    │  │
│  │ Postgres │ │ Blob     │ │ (seed params, rules)   │  │
│  └──────────┘ └──────────┘ └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
studio/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Geist font, providers)
│   │   ├── page.tsx                  # Redirect to /design
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Magic link request
│   │   │   └── verify/page.tsx       # Token verification
│   │   ├── (studio)/                 # Authenticated layout group
│   │   │   ├── layout.tsx            # Command center shell (icon rail)
│   │   │   ├── design/page.tsx       # Module 1: 3D Massing Tool
│   │   │   ├── planning/page.tsx     # Module 2: Planning Compliance
│   │   │   ├── finance/page.tsx      # Module 3: Financial Dashboard
│   │   │   ├── dataroom/page.tsx     # Module 4: Project Dataroom
│   │   │   └── invest/page.tsx       # Module 5: Investor Portal
│   │   ├── share/[token]/page.tsx    # Public share link (read-only)
│   │   └── api/
│   │       ├── auth/                 # Magic link send/verify
│   │       ├── projects/             # Project CRUD
│   │       ├── options/              # Design option persistence
│   │       ├── documents/            # Document upload/manage
│   │       └── share/                # Share link generation
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── shell/                    # Command center chrome
│   │   │   ├── icon-rail.tsx         # Left navigation rail
│   │   │   ├── floating-panel.tsx    # Frosted glass overlay
│   │   │   └── command-bar.tsx       # Top action bar
│   │   ├── viewer/                   # 3D visualization
│   │   │   ├── viewer-3d.tsx         # Three.js viewport (client)
│   │   │   ├── basemap.ts           # Satellite tile loader
│   │   │   ├── context-layer.ts     # OSM buildings/roads/trees
│   │   │   ├── building-renderer.ts # Building geometry
│   │   │   ├── camera-presets.ts    # View positions
│   │   │   └── controls.ts         # Orbit controls
│   │   ├── design/                   # Massing tool UI
│   │   │   ├── options-list.tsx      # Option cards sidebar
│   │   │   ├── generator-controls.tsx # Parameter sliders
│   │   │   ├── metrics-panel.tsx     # Floating metrics overlay
│   │   │   ├── scoring-panel.tsx     # Score breakdown
│   │   │   └── compliance-badge.tsx  # Pass/fail indicators
│   │   ├── finance/                  # Financial dashboard
│   │   │   ├── proforma-table.tsx    # 10-year proforma
│   │   │   ├── capital-stack.tsx     # Waterfall visualization
│   │   │   ├── sensitivity.tsx       # Sensitivity sliders
│   │   │   └── returns-card.tsx      # IRR/MOIC/DSCR
│   │   ├── planning/                 # Planning compliance
│   │   │   ├── track-board.tsx       # 5-track approval status
│   │   │   ├── checklist.tsx         # Document/action checklist
│   │   │   └── timeline.tsx          # Critical path view
│   │   ├── dataroom/                 # Document management
│   │   │   ├── document-table.tsx    # Register with tier badges
│   │   │   ├── risk-board.tsx        # Risk register cards
│   │   │   └── open-items.tsx        # Kanban-style tracker
│   │   └── investor/                 # Investor portal
│   │       ├── project-summary.tsx   # One-page overview
│   │       ├── share-manager.tsx     # Link generation/tracking
│   │       └── viewer-readonly.tsx   # Read-only 3D embed
│   ├── engine/                       # TypeScript massing engine
│   │   ├── generator.ts             # Main option builder
│   │   ├── forms.ts                 # BAR/L/U/C geometry
│   │   ├── rooms.ts                 # Room layout + floor programming
│   │   ├── validator.ts             # Planning + brand rule checking
│   │   ├── scorer.ts                # 9-criteria weighted scoring
│   │   ├── cost.ts                  # Cost model ($350/sf, v2 params)
│   │   └── types.ts                 # Shared types (Option, Floor, Wing, etc.)
│   ├── config/                       # Project configuration
│   │   ├── site.ts                  # Site boundary + setbacks
│   │   ├── programme.ts             # Room types, counts, areas
│   │   ├── financials.ts            # v2 equalized parameters
│   │   ├── rules.ts                 # Planning + brand thresholds
│   │   └── scoring-weights.ts       # 9-criteria defaults
│   ├── lib/                          # Shared utilities
│   │   ├── db.ts                    # Drizzle client + schema
│   │   ├── auth.ts                  # JWT + magic link helpers
│   │   ├── share.ts                 # Signed URL generation
│   │   └── rate-limit.ts            # Per-IP rate limiter
│   └── styles/
│       └── globals.css              # Tailwind + custom properties
├── drizzle/                          # Database migrations
├── public/                           # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 3. Visual Design

### Theme: Map-First / Floating Panels

The satellite/aerial viewport dominates the screen. UI elements float as frosted-glass overlays on top of the map, similar to Google Earth's control style.

**Color System:**
- Background: `#f8fafc` (slate-50) — visible only behind the rail and when panels are expanded
- Icon rail: `#0f172a` (slate-900) — dark navy, always visible
- Active accent: `#38bdf8` (sky-400) — module indicator on rail
- Floating panels: `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(12px)`
- Panel borders: `rgba(0, 0, 0, 0.08)`
- Text primary: `#0f172a` (slate-900)
- Text secondary: `#64748b` (slate-500)
- Success: `#16a34a` (green-600)
- Warning: `#f59e0b` (amber-500)
- Error: `#dc2626` (red-600)
- YOTEL brand: `#2E8A76` (teal)
- YOTELPAD brand: `#B8456A` (mauve)
- Ground floor: `#7A9A70` (sage)

**Typography:**
- Font: Geist Sans (UI), Geist Mono (numbers, IDs, metrics)
- Heading: 600 weight, slate-900
- Body: 400 weight, slate-600
- Metric values: Geist Mono, 500 weight

**Layout Zones:**
1. **Icon Rail** (56px, left) — dark navy, module icons, user avatar at bottom
2. **Map Viewport** (remaining space) — Three.js canvas, satellite basemap default, full bleed
3. **Floating Overlays** (positioned on viewport):
   - Top-left: Metrics panel (keys, GFA, coverage, storeys)
   - Top-right: View controls (3D/Satellite/Street, camera presets)
   - Bottom-left: Location label + compliance badges
   - Bottom-right: Financial summary (TDC, NOI, DSCR)
4. **Options Sidebar** (240px, right, collapsible) — option cards, sort/filter, generator controls

### Module-Specific Layouts

**Design (Massing Tool):** Full map viewport with floating overlays. Options sidebar on right. Generator controls in collapsible bottom sheet.

**Planning:** Split view — left shows approval track board (5 tracks, step-by-step), right shows 3D viewer with setback/compliance overlays rendered on the map.

**Finance:** Full-width dashboard with proforma table, capital stack chart, sensitivity sliders, returns cards. 3D viewer minimized to corner thumbnail.

**Dataroom:** Table-driven — document register, risk board, open items. No 3D viewer.

**Investor Portal:** Curated read-only view — project summary hero, embedded 3D viewer (best option), financial highlights, planning progress timeline. This is what share links render.

---

## 4. Module Specifications

### Module 1: 3D Massing Tool (Priority 1)

**Purpose:** Generate, validate, score, and visualize parametric building design options on the Carlisle Bay site.

**TypeScript Engine (client-side):**
- Port of Python backend (~800 lines) to TypeScript
- Runs entirely in the browser for instant feedback
- Design space: 5 form types × multiple parameter combinations
- Generates 30-50 valid options per run

**Form Types:**
| Form | Description | Wings |
|------|-------------|-------|
| BAR | Simple bar, long axis E-W | 1 |
| BAR_NS | Rotated bar, long axis N-S | 1 |
| L | E-W main + N-S branch | 2 |
| U | South + North wings + East connector | 3 |
| C | South + North wings + West connector | 3 |

**Validation Rules (from `rules.yml` — note: file is actually JSON despite `.yml` extension):**
- Coverage ≤ 50% of buildable area (3,599 m²) → max footprint 1,800 m² (PDP 2023)
- Height ≤ 25m (planning limit from site.py/rules.yml — not the 21m building target in config.py)
- Offset boundary containment (10-vertex polygon from site.py `OFFSET_BOUNDARY`)
- YOTEL accessible ≥ 10% of YOTEL rooms, YOTELPAD accessible ≥ 7% of PAD units
- Min accessible overall ≥ 5% (brand)
- Corridor width ≥ 1.6m clear (brand)
- Max dead-end ≤ 10m (fire)
- Max travel distance ≤ 35m two-direction (fire)
- FOH lifts ≥ 2 per 100 rooms
- Min Komyuniti 150m², Mission Control 35m², Gym 40m², Kitchen 35m²
- Dual-loaded wing min width: 13.6m (YOTEL), 16.1m (YOTELPAD)
- Single-loaded wing min width: 8.0m

**Scoring (9 criteria, 0-100 — see §1a for canonical weights and recalibrated thresholds):**
| Criterion | Weight | Optimal | Scoring Logic |
|-----------|--------|---------|---------------|
| Room count | 0.18 | 120-140 keys | 1.0 in range, linear decay outside |
| GIA efficiency | 0.14 | 33-38 m²/key | 1.0 in range, 0.7 for 29-42, decay outside |
| Sea views | 0.14 | Max west facade | Linear: `min(1.0, west_facade_m / 50)` |
| Building height | 0.10 | ≤ 21m | 1.0 ≤21m, 0.6 ≤25m, 0.2 >25m |
| Outdoor amenity | 0.10 | Max outdoor area | Linear: `min(1.0, outdoor_m2 / 900)` |
| Cost per key | 0.12 | ≤ $290k (v2) | **Recalibrated** — see §1a Cost/Key table |
| Daylight quality | 0.08 | Single-loaded corridors | 1.0 single, 0.75 U/C, 0.65 L, 0.5 double |
| PAD mix | 0.06 | 18-28% YOTELPAD | 1.0 in range, 0.7 for 12-35%, 0.4 outside |
| Form simplicity | 0.08 | BAR (simplest) | BAR/BAR_NS=1.0, L=0.75, C=0.6, U=0.5 |

**3D Viewer (Three.js):**
- Satellite basemap tiles (Esri) — default view
- OSM context: surrounding buildings, roads, trees, coastline
- Building rendered floor-by-floor with brand colors (teal=YOTEL, mauve=YOTELPAD, sage=ground)
- Outdoor deck + pool geometry
- Site boundary overlay (red dashed)
- Offset/buildable boundary (blue filled)
- Camera presets: 3D, SE Iso, NW Iso, West, East, South, North, Site Plan, Floor Plan
- Visual styles: Realistic, Shaded, Wireframe, Consistent
- Orbit controls (mouse/touch)
- Shadow mapping with soft shadows

**Financial Integration:**
- Each option auto-calculates: TDC, cost/key, revenue, NOI, DSCR
- Uses v2 equalized parameters: $350/sf, 51% GOP, $195 ADR, 78% occ
- Results appear in floating financial panel

### Module 2: Planning Compliance Tracker (Priority 2)

**Purpose:** Track regulatory approval workflow and design compliance.

**5 Approval Tracks:**
| Track | Name | Steps |
|-------|------|-------|
| A | Planning Permission | Pre-app → Formal app → CTP → Approval → Conditions |
| B | Building Permit | Design cert → Submit → Review → Permit |
| C | SDA Approved Developer | Application → Review → Designation |
| D | Tourism Project Designation | Application → Review → Designation |
| E | EIA | Screening → TOR → Assessment → Review → Clearance |

**Features:**
- Track board showing step-by-step status per track
- Document checklist per step (what's needed, what's submitted)
- Design controls dashboard (setbacks, coverage, height — confirmed vs unresolved)
- Critical path timeline view
- Compliance overlay on 3D viewer (setback lines, boundary zones)
- Data seeded from PLANNING_COMPLIANCE.md

### Module 3: Financial Dashboard (Priority 3)

**Purpose:** Live proforma modeling with sensitivity analysis.

**Features:**
- 10-year proforma table (v2 parameters)
- Revenue ramp visualization (Year 1-10)
- Capital stack waterfall chart ($24M senior + $5M mezz + $10M LP + $1M GP)
- Sensitivity sliders: ADR (±20%), occupancy (±10%), cap rate (±200bps), GOP (±10%)
- Real-time recalculation of: IRR, MOIC, DSCR, exit value, LP multiple
- TDC build-up breakdown (land, hard, FFE, soft, contingency, pre-opening)
- Connected to massing tool — changing key count recalculates everything

**Parameters (from CONFLICT_RESOLUTION_v2):**
- TDC: $40,000,000
- Hard cost: $350/sf × 75,000 sf
- YOTEL ADR: $195 (Yr 3), ramp from $155
- YOTELPAD ADR: $270
- YOTEL Occupancy: 78% (Yr 3), ramp from 55%
- YOTELPAD Occupancy: 75% (Yr 3), ramp from 50% — lower per config.py; extended-stay has different dynamics
- GOP: 51%
- YOTEL fees: 15.5% inclusive
- Senior debt: $24M at 6.5% I/O
- Mezz: $5M at 11% PIK
- Exit cap: 8.5%

### Module 4: Project Dataroom (Priority 4)

**Purpose:** Interactive document management, risk tracking, open items.

**Features:**
- Document register table with source tier badges (T1-T5)
- Category filtering and search
- Document upload (Vercel Blob) with auto-classification
- Risk register cards with severity coloring
- Open items Kanban board (Critical → High → Medium → Advisory)
- Resolution log with audit trail
- Data seeded from DOCUMENT_REGISTER.md, RISK_REGISTER.md, OPEN_ITEMS.md

### Module 5: Investor Portal (Priority 5)

**Purpose:** Shareable read-only project view for investors.

**Features:**
- One-page project overview (hero metrics, project description, location)
- Embedded 3D viewer showing best design option (read-only orbit)
- Financial summary: returns projection, capital stack, exit scenario
- Planning progress timeline (5 tracks)
- Time-limited signed share links (configurable expiry: 24h, 7d, 30d)
- View tracking (who opened, when, how long)
- No login required for share link viewers

---

## 5. Data Model

### Core Tables

**projects**
- id (uuid, PK)
- name (text)
- site_config (jsonb) — boundary, setbacks, placement
- financial_params (jsonb) — v2 equalized parameters
- planning_status (jsonb) — 5-track progress
- created_at, updated_at

**design_options**
- id (uuid, PK)
- project_id (uuid, FK)
- form (text) — BAR/BAR_NS/L/U/C
- params (jsonb) — generation parameters
- metrics (jsonb) — calculated metrics
- floors (jsonb) — floor-by-floor programme
- wings (jsonb) — wing geometry
- score (float)
- scoring_breakdown (jsonb)
- violations (jsonb)
- warnings (jsonb)
- is_starred (boolean)
- created_at

**documents**
- id (uuid, PK)
- project_id (uuid, FK)
- name (text)
- tier (text) — T1-T5
- category (text)
- blob_url (text, nullable)
- status (text)
- notes (text)
- created_at

**risk_items**
- id (uuid, PK)
- project_id (uuid, FK)
- item_type (text) — risk | open_item
- title (text)
- severity (text) — fatal | critical | high | medium | low | advisory
- category (text)
- status (text) — open | in_progress | closed
- resolution (text, nullable)
- resolved_at (timestamp, nullable)
- owner (text)
- due_date (date, nullable)
- created_at

**users**
- id (uuid, PK)
- email (text, unique)
- magic_link_token (text, nullable)
- token_expires_at (timestamp, nullable)
- created_at

**share_links**
- id (uuid, PK)
- project_id (uuid, FK)
- token (text, unique)
- scopes (jsonb) — which modules are visible
- expires_at (timestamp)
- view_count (integer, default 0)
- last_viewed_at (timestamp, nullable)
- created_by (uuid, FK → users)
- created_at

### Database Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_design_options_project ON design_options(project_id);
CREATE INDEX idx_design_options_score ON design_options(project_id, score DESC);
CREATE INDEX idx_documents_project_cat ON documents(project_id, category);
CREATE INDEX idx_risk_items_project_status ON risk_items(project_id, status);
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_project ON share_links(project_id);
CREATE INDEX idx_users_email ON users(email);
```

### Core TypeScript Types

These types live in `engine/types.ts` and are shared across the engine, viewer, and UI:

```typescript
type FormType = 'BAR' | 'BAR_NS' | 'L' | 'U' | 'C';

interface Wing {
  id: string;
  length: number;      // metres
  width: number;       // metres
  floors: number;
  orientation: number; // degrees from E-W
  position: { x: number; y: number };
}

interface Floor {
  level: number;       // 0 = ground
  use: 'FOH_BOH' | 'YOTEL' | 'YOTELPAD' | 'ROOFTOP';
  rooms: RoomAllocation[];
  gia: number;         // m²
}

interface RoomAllocation {
  type: string;        // e.g. 'Premium', 'Studio'
  count: number;
  nia: number;         // m² per unit
}

interface DesignOption {
  id: string;
  form: FormType;
  wings: Wing[];
  floors: Floor[];
  metrics: OptionMetrics;
  score: number;
  scoringBreakdown: Record<string, { raw: number; weighted: number; reason: string }>;
  violations: Violation[];
  warnings: string[];
}

interface OptionMetrics {
  totalKeys: number;
  yotelKeys: number;
  padUnits: number;
  gia: number;
  giaPerKey: number;
  footprint: number;
  coverage: number;
  buildingHeight: number;
  westFacade: number;
  outdoorTotal: number;
  costPerKey: number;
  tdc: number;
}

interface Violation {
  rule: string;
  actual: number | string;
  limit: number | string;
  severity: 'fatal' | 'warning';
}

interface ScoringWeights {
  room_count: number;
  gia_efficiency: number;
  sea_views: number;
  building_height: number;
  outdoor_amenity: number;
  cost_per_key: number;
  daylight_quality: number;
  pad_mix: number;
  form_simplicity: number;
}
```

### API Route Contracts

| Route | Method | Auth | Rate Limit | Request | Response |
|-------|--------|------|------------|---------|----------|
| `/api/auth/send` | POST | None | 5/min | `{ email: string }` | `{ ok: boolean }` |
| `/api/auth/verify` | POST | None | 5/min | `{ token: string }` | Sets httpOnly cookie, `{ ok: boolean }` |
| `/api/projects` | GET | JWT | 30/min | — | `Project[]` |
| `/api/projects/[id]` | GET | JWT | 30/min | — | `Project` |
| `/api/projects/[id]` | PUT | JWT | 20/min | `Partial<Project>` | `Project` |
| `/api/options` | POST | JWT | 20/min | `{ projectId, form, params }` | `DesignOption[]` (batch generate) |
| `/api/options/[id]` | GET | JWT | 30/min | — | `DesignOption` |
| `/api/options/[id]/star` | PATCH | JWT | 20/min | `{ starred: boolean }` | `{ ok: boolean }` |
| `/api/documents` | GET | JWT | 30/min | `?projectId&category` | `Document[]` |
| `/api/documents` | POST | JWT | 20/min | `FormData (file + metadata)` | `Document` |
| `/api/share` | POST | JWT | 10/min | `{ projectId, scopes, expiresIn }` | `{ url: string, token: string }` |
| `/api/share/[token]` | GET | HMAC | 30/min | — | `ShareView` (read-only project data) |

### Error, Loading, and Empty States

Every data-driven component must handle three states beyond the happy path:

- **Loading**: Skeleton placeholders matching the component's layout (use shadcn `Skeleton`)
- **Error**: Inline error banner with retry action (not a full-page error unless fatal)
- **Empty**: Contextual empty state with illustration and call-to-action (e.g., "No design options yet — click Generate to create your first batch")

The 3D viewer specifically needs:
- Loading: Progress bar for satellite tile downloads + "Loading basemap..." text
- Error: Fallback to wireframe-only view if tile server is unreachable
- WebGL not supported: Static fallback image with message

---

## 6. Auth & Security

**Magic Link Flow:**
1. User enters email at /login
2. Server generates JWT token, stores hash in users table, sends email with link
3. User clicks link → /verify?token=xxx
4. Server verifies token, sets httpOnly cookie with session JWT
5. Session JWT expires after 7 days, re-login required

**Share Links:**
1. Authenticated user generates share link with scopes (which modules visible) and expiry (24h/7d/30d)
2. Server generates cryptographically random token (32 bytes, base64url), stores hash in DB along with scopes and expiry
3. Server creates signed URL: `/share/[token]?sig=[HMAC-SHA256(token, SECRET)]`
4. Investor opens link — no login needed
5. Server verifies: token exists in DB, HMAC signature valid, not expired, scopes checked
6. View count incremented, last_viewed_at updated, IP + user-agent logged
7. Revocation: creator can delete share link from dashboard, immediate invalidation
8. **Security constraints**: tokens are single-use-trackable (not single-use — investors can revisit), HMAC prevents URL tampering, expired links return 410 Gone

**Security (per CLAUDE.md):**
- All API keys in .env, never in source
- Rate limiting on all endpoints (auth: 5/min, AI: 10/min, reads: 30/min, writes: 20/min)
- Input sanitization on all user inputs
- .env.example with placeholders
- httpOnly, secure, sameSite cookies

---

## 7. Build Phases

### Phase 1: Foundation + Massing Tool
- Next.js 16 scaffold with TypeScript, shadcn/ui, Tailwind, Geist
- Command center shell (icon rail, viewport container, floating panel system)
- TypeScript massing engine (port generator, forms, rooms, validator, scorer, cost)
- Three.js 3D viewer (satellite basemap, context, building renderer, controls)
- Options list sidebar with sort/filter
- Floating overlay panels (metrics, compliance, financials, location)
- Magic link auth (basic)
- Project config with v2 equalized parameters

### Phase 2: Planning + Finance
- Planning compliance track board (5 tracks)
- Document checklist per track
- Compliance overlay on 3D viewer (setback visualization)
- Financial proforma calculator (10-year)
- Capital stack waterfall chart
- Sensitivity analysis sliders
- Design ↔ financial live connection
- Database integration (Neon Postgres via Drizzle)

### Phase 3: Dataroom + Investor
- Document register UI with upload
- Risk register + open items board
- Investor portal (read-only project summary)
- Share link generation + tracking
- View analytics
- Multi-project support prep (SaaS foundation)

---

## 8. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Massing engine location | Client-side (browser) | Instant feedback, no server round-trip, works offline |
| 3D library | Three.js (direct) | Previous builder used it, maximum control, no R3F overhead |
| Database | Neon Postgres + Drizzle | Serverless, branching for dev, type-safe ORM |
| File storage | Vercel Blob | First-party, simple API, up to 5TB |
| Charts | Recharts | React-native, composable, sufficient for proforma/waterfall/sensitivity. D3 is overkill — no custom viz needed |
| UI components | shadcn/ui | Source-owned, customizable, Tailwind-native |
| Auth | Magic link + JWT → Clerk upgrade path | Minimal for now, production auth when SaaS |
| Basemap tiles | Esri satellite (default) + OSM street + topo | Previous builder had this working, proven approach |
| State management | React hooks + URL state (Zustand if cross-component state grows) | Start simple. 3D viewer ↔ options list ↔ metrics is manageable with lifting state. Add Zustand only if prop drilling becomes painful in Phase 2+ |
| Deployment | Vercel | Optimized for Next.js, preview URLs, easy env vars |

---

## 9. Testing Strategy

- **Engine unit tests**: The massing engine (generator, validator, scorer, cost) is pure TypeScript with no DOM dependencies. Test with Vitest — test each module independently with known inputs and expected outputs. Port Python test cases if any exist.
- **Scorer regression tests**: Lock down scorer output for a reference option (e.g., 130-key BAR at $307k/key) to prevent weight/threshold drift.
- **Component tests**: Use Vitest + React Testing Library for UI components. Focus on data-driven components (proforma table, scoring panel) rather than layout.
- **3D viewer**: Manual testing — automated Three.js tests are brittle and low-value. Verify camera presets, building geometry, and basemap loading visually.
- **API routes**: Integration tests against a Neon branch database (Neon's branching enables isolated test DBs).
- **E2E**: Defer to Phase 2+. Playwright for critical flows (login → generate options → view in 3D → star option) once the app is stable.

---

## 10. Constraints & Non-Goals

**Constraints:**
- Must use v2 equalized financial parameters throughout (see §1a Canonical Values)
- Must use site.py survey geometry, not config.py simplified boundary
- Must use scorer.py 9-criteria weights, not config.py 8-criteria weights
- Must validate against Barbados planning rules (PDP 2023, GDO 2021)
- Must validate against YOTEL brand standards (D01-C08 where available)
- Source tier hierarchy must be respected (T1 > T2 > T3 > T4 > T5)
- **Esri satellite tiles**: Esri World Imagery is free for development/non-commercial use. For commercial/SaaS use, an ArcGIS Developer account is required (free tier: 2M basemap tiles/month). Evaluate usage against free tier limits before launch. Fallback: Mapbox Satellite (similar pricing model).

**Non-Goals (for initial build):**
- Multi-tenant / multi-project support (Phase 3 prep only)
- Real-time collaboration between users
- Mobile-optimized responsive design (desktop-first)
- PDF export / presentation generation (future)
- AI-powered features (future — design suggestions, document summarization)
- Revit/BIM integration (the Dynamo scripts exist but are not in scope)

---

*This spec drives the implementation plan. All modules, parameters, and build phases are approved by the project sponsor. Canonical values are documented in §1a to prevent parameter drift between sources.*
