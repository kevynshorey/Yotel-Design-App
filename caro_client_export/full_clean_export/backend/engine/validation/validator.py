"""
Validation against YOTEL D01-C08 brand standards and Barbados Class VI planning rules.
Returns (is_valid, violations, warnings).
"""

import math
from typing import Any, Dict, List, Tuple

from .rules import get_rules
from config.site import OFFSET_BOUNDARY, VIEWER_BUILDING_PLACEMENT


def _point_in_poly(x: float, y: float, poly: List[Dict[str, float]]) -> bool:
    """
    Ray casting point-in-polygon test.

    Args:
        x, y: point in local metres
        poly: polygon points as [{"x":..., "y":...}, ...]
    """
    def _point_on_segment(px: float, py: float, ax: float, ay: float, bx: float, by: float, eps: float = 1e-9) -> bool:
        # Check colinearity via cross-product + bounding-box containment via dot product.
        cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax)
        if abs(cross) > eps:
            return False
        dot = (px - ax) * (px - bx) + (py - ay) * (py - by)
        return dot <= eps

    # Treat points exactly on the boundary as "inside".
    n = len(poly)
    for i in range(n):
        a = poly[i]
        b = poly[(i + 1) % n]
        if _point_on_segment(x, y, a["x"], a["y"], b["x"], b["y"]):
            return True

    inside = False
    for i in range(n):
        x1, y1 = poly[i]["x"], poly[i]["y"]
        x2, y2 = poly[(i - 1) % n]["x"], poly[(i - 1) % n]["y"]
        if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-12) + x1):
            inside = not inside
    return inside


def _rotate_point(x: float, y: float, ang_rad: float) -> Tuple[float, float]:
    """2D rotation around origin by angle in radians."""
    c = math.cos(ang_rad)
    s = math.sin(ang_rad)
    return x * c - y * s, x * s + y * c


def validate(opt: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    """
    Validate an option against all rules.
    
    Args:
        opt: dict with "metrics" and "params" keys
    
    Returns:
        (is_valid: bool, violations: list[str], warnings: list[str])
        Violations = hard fail. Warnings = soft issues.
    """
    violations = []
    warnings = []
    m = opt["metrics"]
    p = opt.get("params", {})

    rules = get_rules()
    PLANNING = rules.get("planning", {})
    BRAND = rules.get("brand", {})

    # ── Planning rules ──────────────────────────────────
    if m["coverage_pct"] > PLANNING["max_coverage_pct"]:
        violations.append(f"Coverage {m['coverage_pct']:.0f}% > {PLANNING['max_coverage_pct']}% max")

    if m["building_height_m"] > PLANNING["max_height_m"]:
        violations.append(f"Height {m['building_height_m']:.1f}m > {PLANNING['max_height_m']}m max")

    # ── Offset boundary containment (buildable zone) ─────
    # Enforce that the generated footprint does not extend outside the offset boundary polygon.
    # Uses the same placement/rotation as the canonical viewer.
    try:
        ang = VIEWER_BUILDING_PLACEMENT.get("rot_deg", 0) * math.pi / 180
        tx = VIEWER_BUILDING_PLACEMENT.get("x", 0)
        ty = VIEWER_BUILDING_PLACEMENT.get("y", 0)
        outside = 0
        for wing in m.get("wings", []):
            x0 = wing.get("x", 0)
            y0 = wing.get("y", 0)
            # Match Viewer3D geometry rules:
            # - viewer draws EW wings as (l along X) × (w along Z)
            # - viewer draws NS wings as (w along X) × (l along Z)
            L = wing.get("l", 0)
            W = wing.get("w", 0)
            if wing.get("dir") == "NS":
                rect_Lx, rect_Wy = W, L
            else:
                rect_Lx, rect_Wy = L, W
            corners = [(x0, y0), (x0 + rect_Lx, y0), (x0 + rect_Lx, y0 + rect_Wy), (x0, y0 + rect_Wy)]
            for cx, cy in corners:
                rx, ry = _rotate_point(cx, cy, ang)
                wx, wy = rx + tx, ry + ty
                if not _point_in_poly(wx, wy, OFFSET_BOUNDARY):
                    outside += 1
        if outside > 0:
            violations.append("Building footprint exceeds the offset boundary (buildable zone)")
    except Exception:
        # keep validator resilient
        pass

    bL = m.get("bounding_L", 0)
    bW = m.get("bounding_W", 0)
    if bL + 2 * PLANNING["min_side_setback_m"] > PLANNING["site_length_m"]:
        violations.append(f"Building length {bL}m + setbacks > site length {PLANNING['site_length_m']}m")
    if bW + 2 * PLANNING["min_side_setback_m"] > PLANNING["site_width_m"]:
        violations.append(f"Building width {bW}m + setbacks > site width {PLANNING['site_width_m']}m")

    # ── Brand width rules ───────────────────────────────
    width_mm = m.get("wing_width_m", 14) * 1000
    ct = m.get("corridor_type", "double")
    if ct == "double":
        if width_mm < BRAND["dual_min_width_mm"]:
            violations.append(f"Dual-aspect needs ≥{BRAND['dual_min_width_mm']}mm; got {width_mm:.0f}mm")
        if m.get("pad_units", 0) > 0 and width_mm < BRAND["pad_dual_min_width_mm"]:
            warnings.append(f"PAD dual-aspect needs {BRAND['pad_dual_min_width_mm']}mm; building is {width_mm:.0f}mm")
    else:
        if width_mm < BRAND["single_min_width_mm"]:
            violations.append(f"Single-aspect needs ≥{BRAND['single_min_width_mm']}mm; got {width_mm:.0f}mm")

    # ── GIA/key sanity ──────────────────────────────────
    gk = m.get("gia_per_key", 0)
    if gk < 25:
        violations.append(f"GIA/key {gk}m² impossibly tight")
    elif gk < 29:
        warnings.append(f"GIA/key {gk}m² below YOTEL benchmark (29m²)")
    elif gk > 48:
        warnings.append(f"GIA/key {gk}m² — inefficient")

    # ── Accessibility ───────────────────────────────────
    total_keys = m.get("total_keys", 0)
    needed = max(1, math.ceil(total_keys * BRAND["min_accessible_pct"]))
    actual = m.get("accessible_count", 0)
    if actual < needed:
        warnings.append(f"Need {needed} accessible keys (5%); confirm during detail design")

    # ── FOH space adequacy ──────────────────────────────
    fp = m.get("footprint_m2", 0)
    foh_area = fp * p.get("ground_foh_pct", 0.60)
    min_foh = BRAND["min_komyuniti_m2"] + BRAND["min_mission_control_m2"] + BRAND["min_gym_m2"]
    if foh_area < min_foh:
        warnings.append(f"FOH area {foh_area:.0f}m² tight for Komyuniti+MC+Gym")

    # ── Lifts ───────────────────────────────────────────
    m["required_foh_lifts"] = 1 + math.ceil(total_keys / 100)
    m["required_boh_lifts"] = max(1, math.ceil(total_keys / 300))

    return len(violations) == 0, violations, warnings
