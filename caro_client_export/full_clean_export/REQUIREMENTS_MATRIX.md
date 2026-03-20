# Requirements Matrix (PDF rules -> code enforcement)

## How to read this file
- **Requirement type**:
  - **Hard** = should invalidate / fail generation when you have enough geometry to validate it.
  - **Guideline** = used for scoring, clustering, or early constraints where validation is not yet feasible.
- **Enforcement status (current repo)** is based on what the code actually checks/uses today.

## Source
- `docs/Project Docs/YOTEL Feasibility Guidelines D01-C08.pdf`

## Current code locations (most relevant)
- Constants / derived numeric constraints: `config/config.py`
- Planning/feasibility checks: `backend/engine/validator.py`
- Massing generation: `backend/engine/forms.py` + `backend/engine/generator.py`
- Room-type allocation: `backend/engine/rooms.py`
- Frontend “live generator” (client-side approximation): `src/utils/generateOption.js` + `src/hooks/useOptions.js`
- Dynamo simplified geometry: `dynamo/01_footprint.py` + `dynamo/02_stacking.py`

---

| Rule | Numeric value(s) from PDF | Requirement type (recommended) | Enforced today? | Where it is (or isn’t) validated |
|---|---:|---|---|---|
| Planning coverage | max coverage `50%` | Hard | **Yes** | `backend/engine/validator.py` (`PLANNING["max_coverage_pct"]`) |
| Max height (planning envelope) | max height about `25m` | Hard | **Yes** | `backend/engine/validator.py` |
| Corridor clear width | min clear width `1600mm`; if not possible, turning circle fallback (`1800mm` diameter) | Hard | **Partially** | `config/config.py` sets `corridor_width_mm=1600`, but corridor geometry + travel validation is not computed |
| Dead-end corridors | max dead-end corridor length `10m` (dead-ends should be avoided) | Hard | **No** | No corridor graph / path validation exists in `backend/engine` or Dynamo layout stage |
| Max travel distance | maximum travel distance (two directions) `35m` or local code | Hard | **No** | No shortest-path / egress distance computation is implemented |
| Corridor clear height | min suspended light/detection height `2400mm` | Hard | **No** | Vertical “clear height” is not modeled at corridor level |
| Room clear internal ceiling height | min clear internal ceiling `2500mm` | Hard | **Partially** | Constants exist; actual clearance isn’t modeled in geometry for phase-1 |
| Bathroom clear internal ceiling height | min clear ceiling in bathroom areas `2200mm` | Hard | **Partially** | Constants exist; not enforced in geometry generation |
| Guest core requirement | property must have **one** main passenger lift core directly accessible on a clear guest route | Hard (phase-2) | **No** | Current massing generation has no lift-core placement algorithm |
| Lift car minimum dimensions | passenger lift min `1400mm x 1100mm x 2200mm` (W x D x H); doors min `900mm x 2100mm` | Hard (phase-2) | **No** | Lift core dimensions are not modeled in option generation |
| Lift lobby sizing | lift lobby must be at least `1.5x` passenger lift car depth | Hard (phase-2) | **No** | Not computed |
| Stairs / egress | min **two exit stairs** per floor; smoke-proof enclosure per code; no open external egress stairs | Hard (phase-2) | **No** | Not computed; no stair geometry or egress logic exists |
| Accessibility minimum | `5%` accessible keys with accessible en-suite shower (minimum) | Hard | **Not fully** | `backend/engine/validator.py` produces a **warning** if below 5% |
| Room types + clear dimensions | Premium/Compact/FirstClass/Accessible clear dims and NIA/areas (e.g. Premium clear `3100 x 5400mm`, Compact clear `3100 x 4050mm`, FirstClass/Accessible clear `4900 x 5400mm`) | Hard | **Partially** | `config/config.py` + `exports/generate_unit_plans.py` + `dynamo/02_stacking.py` use these dimensions; option generator uses only “bay widths” for counts |
| Modular transport limits | module shipping limits (e.g. max total module length `17500mm`, max width `4500mm`, max height `3500mm`) | Hard | **No** | Constants exist; generator doesn’t validate shipping constraints |
| Modular construction guidance | room-corridor-room regular approach; avoid complex setbacks/cantilevers | Guideline (phase-1), Hard (phase-2) | **No/soft** | Not validated; only reflected qualitatively in form choices |

---

## Recommended “Phase 1” classification (what to enforce now)
For your current “app-first massing + layout options + room counts” stage, enforce:
- **Hard**: planning envelope checks (coverage, height), and room-type counts/mix derived from bay dims
- **Guideline**: corridor travel / dead-end / lift lobby / egress rules (for now) until you implement a real corridor graph and core placement

## Phase 2 unlocks (what to implement next)
To turn “No” into “Yes” for corridor/egress rules you need:
- corridor graph + node/edge model derived from circulation layout
- “core nodes” representing lifts + stairs, with their adjacency to rooms
- travel distance computation (shortest path) + dead-end length computation
- then promote those rules from guideline -> hard fails in `validator.py`

