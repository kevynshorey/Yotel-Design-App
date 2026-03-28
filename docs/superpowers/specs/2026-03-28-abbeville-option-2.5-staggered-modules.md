# Abbeville Option 2.5: Staggered Modules Design Spec

**Date:** 2026-03-28
**Status:** Approved

## Concept

Add a 4th design option ("Option 2.5 — Staggered Modules") to the Abbeville YOTELPAD generator. This option uses **3 interlocking rectangular modules** on a 1-storey podium with 7 residential floors, creating a staggered stepped massing that maximizes sea views through offset view corridors.

## Building Geometry

- **Podium:** 1 storey (4.5m), full ground floor — same as Options A/B/C
- **Modules:** 3 rectangular blocks, each ~20m x 10m (2:1 length-to-width ratio)
- **Floors per module:** 7 residential floors (3.2m each)
- **Total height:** 4.5 + 7 x 3.2 = **26.9m** (requires height variance)
- **Rotation:** 30 degrees for SW sea view corridors

## Module Positions (staggered diagonal)

Modules step diagonally from SW (beach) to NE (road), so no module blocks another's sea view:

| Module | Position (x, y) | Description |
|--------|-----------------|-------------|
| Module A | x=2, y=2 | SW — closest to sea |
| Module B | x=14, y=8 | Center — offset 12m E, 6m N |
| Module C | x=26, y=14 | NE — closest to road |

## Programme

- **Unit count:** 3 modules x 7 floors x 4 units/floor = **84 YOTELPAD units**
- **Unit mix:** Same as Options A/B/C (Studios 20%, 1-Beds 33%, 2-Beds 27%, Accessible 7%, Long-stay 13%)
- **Financial model:** Same FINANCIALS from programme.ts
- **Score:** 78 (high unit count, but height variance risk + structural complexity)

## Implementation

1. Add `buildOptionD()` to `abbeville-generator.ts` — wings = podium + 3 modules at staggered positions
2. The existing viewer `isTowersOnPodium` rendering path already handles this — modules are just wings with different positions
3. No viewer changes needed — the wing loop already places each wing at its (x, y) and stacks floors above the podium

## Validation Warnings

- Height 26.9m exceeds 20.5m site maximum — requires planning height variance
- 3 cantilevered modules increase structural complexity vs 4 smaller towers
