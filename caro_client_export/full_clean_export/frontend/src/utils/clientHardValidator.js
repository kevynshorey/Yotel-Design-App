import rules from "../data/rules.json";
import { OFFSET_BOUNDARY, BUILDING_PLACEMENT } from "./siteBoundaries";

function ensureNumber(x, fallback = null) {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

/**
 * Phase-1 hard validation for client-generated options.
 * Mirrors backend hard checks where the client has enough data.
 *
 * Returns:
 *   { isValid: boolean, hardViolations: string[], hardWarnings: string[] }
 */
export function validateOptionHardPhase1(option) {
  const violations = [];
  const warnings = [];

  const planning = rules?.planning || {};
  const brand = rules?.brand || {};

  const siteArea = planning.site_area_m2 ?? 3599.1;
  const maxCoverage = planning.max_coverage_pct ?? 50;
  const maxHeight = planning.max_height_m ?? 25;

  // Frontend option fields (from frontend/src/utils/generateOption.js)
  const footprintM2 = ensureNumber(option?.fp) ?? ensureNumber(option?.footprint) ?? null;
  const coveragePct = footprintM2 !== null ? (footprintM2 / siteArea) * 100 : null;
  const heightM = ensureNumber(option?.ht) ?? ensureNumber(option?.building_height_m) ?? null;

  const wingWidthM = ensureNumber(option?.wingWidth) ?? ensureNumber(option?.wing_width_m) ?? 14;
  const widthMm = wingWidthM * 1000;

  const corridorType = option?.corridor ?? option?.corridor_type ?? "double";
  const padUnits = ensureNumber(option?.padUnits) ?? 0;

  const bL = ensureNumber(option?.bL) ?? ensureNumber(option?.bounding_L) ?? 0;
  const bW = ensureNumber(option?.bW) ?? ensureNumber(option?.bounding_W) ?? 0;
  const minSideSetbackM = planning.min_side_setback_m ?? 0;
  const siteLengthM = planning.site_length_m ?? 79.84;
  const siteWidthM = planning.site_width_m ?? 48.69;

  // ---- Hard: cannot exceed offset boundary polygon (buildable zone)
  // Viewer places the building at BUILDING_PLACEMENT and rotates it; validate against same transform.
  function pointInPoly(pt, poly) {
    const [x, y] = pt;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function rot2D(x, y, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return [x * c - y * s, x * s + y * c];
  }

  function wingCornersWorld(wing) {
    // In the generator, wings are defined in plan coordinates:
    // - EW: x->east, y->north (viewer uses y as z)
    // - NS: viewer swaps l/w for geometry, so footprint corners must also swap extents.
    let x0 = wing.x || 0;
    let y0 = wing.y || 0;
    let L = wing.l || 0;
    let W = wing.w || 0;
    // Match Viewer3D:
    // - EW wings: X extent = l, Z extent = w
    // - NS wings: X extent = w, Z extent = l
    if (wing.dir === "NS") {
      const tmp = L;
      L = W;
      W = tmp;
    }
    const pts = [
      [x0, y0],
      [x0 + L, y0],
      [x0 + L, y0 + W],
      [x0, y0 + W],
    ];
    const ang = (BUILDING_PLACEMENT.rotDeg * Math.PI) / 180;
    return pts.map(([lx, ly]) => {
      const [rx, ry] = rot2D(lx, ly, ang);
      return [rx + BUILDING_PLACEMENT.x, ry + BUILDING_PLACEMENT.z];
    });
  }

  try {
    const wings = option?.wings || [];
    let outsideCount = 0;
    wings.forEach(w => {
      const corners = wingCornersWorld(w);
      corners.forEach(c => {
        if (!pointInPoly(c, OFFSET_BOUNDARY)) outsideCount += 1;
      });
    });
    if (outsideCount > 0) {
      violations.push("Building footprint exceeds the offset border (buildable zone)");
    }
  } catch {
    // If geometry is missing, skip polygon check (other checks will still run).
  }

  // ---- Hard: planning envelope
  if (coveragePct !== null && coveragePct > maxCoverage + 1e-6) {
    violations.push(`Coverage ${Math.round(coveragePct)}% > ${maxCoverage}% max`);
  }
  if (heightM !== null && heightM > maxHeight + 1e-6) {
    violations.push(`Height ${heightM.toFixed(1)}m > ${maxHeight}m max`);
  }

  // ---- Hard: envelope fit along bounding dimensions
  if (bL + 2 * minSideSetbackM > siteLengthM + 1e-6) {
    violations.push(`Building length ${bL}m + setbacks > site length ${siteLengthM}m`);
  }
  if (bW + 2 * minSideSetbackM > siteWidthM + 1e-6) {
    violations.push(`Building width ${bW}m + setbacks > site width ${siteWidthM}m`);
  }

  // ---- Brand width minima
  if (corridorType === "double") {
    if (widthMm < (brand.dual_min_width_mm ?? 13600)) {
      violations.push(`Dual-aspect needs >= ${brand.dual_min_width_mm ?? 13600}mm; got ${Math.round(widthMm)}mm`);
    }
    if (padUnits > 0 && widthMm < (brand.pad_dual_min_width_mm ?? 16100)) {
      warnings.push(`PAD dual-aspect needs ${brand.pad_dual_min_width_mm ?? 16100}mm; building is ${Math.round(widthMm)}mm`);
    }
  } else {
    if (widthMm < (brand.single_min_width_mm ?? 8000)) {
      violations.push(`Single-aspect needs >= ${brand.single_min_width_mm ?? 8000}mm; got ${Math.round(widthMm)}mm`);
    }
  }

  // ---- Accessibility (phase-1 approximation)
  const totalKeys = ensureNumber(option?.totalKeys) ?? 0;
  const ytRooms = ensureNumber(option?.ytRooms) ?? 0;
  const estYotelAccessible = ytRooms * (brand?.accessibility?.yotel_accessible_pct_of_yt_rooms ?? 0.1);
  const padAccessiblePct = brand?.accessibility?.yotelpad_accessible_pct_of_pad_units ?? 0.07;
  const estPadAccessible = padUnits * padAccessiblePct;
  const estAccessibleCount = estYotelAccessible + estPadAccessible;

  const minAccKeys = Math.max(1, Math.ceil(totalKeys * (brand.min_accessible_pct ?? 0.05)));
  if (estAccessibleCount + 1e-9 < minAccKeys) {
    warnings.push(`Accessibility approx: need ~${minAccKeys} keys (5% min); estimate ~${Math.round(estAccessibleCount)}`);
  }

  return {
    isValid: violations.length === 0,
    hardViolations: violations,
    hardWarnings: warnings,
  };
}

