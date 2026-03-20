"""
Main option generator — sweeps the design space, builds options,
validates, scores, deduplicates, ranks, and exports.
"""

import math
import json
from typing import Any, Dict, List, Optional

from .forms import generate_form
from .rooms import rooms_per_floor, build_floor_programme, YT_TYPES, PAD_TYPES
from backend.engine.validation.validator import validate
from backend.engine.validation.rules import get_rules
from backend.engine.scoring.scorer import score_option
from backend.engine.scoring.cost import estimate_cost

# Brand constants
GROUND_H = 4.5
FLOOR_H = 3.2

_PLANNING = get_rules().get("planning", {})

# Design space — expanded for real site (4,213 m² buildable, 97×55m envelope)
DESIGN_SPACE = {
    "forms":          ["BAR", "BAR_NS", "L", "U", "C"],
    "floor_areas":    [600, 700, 770, 850, 950, 1100, 1300, 1500],  # up to max coverage
    "wing_widths":    [13.6, 14.0, 16.1, 18.0],
    "storeys":        [4, 5, 6, 7, 8],
    "yt_rooms":       [80, 90, 100, 110, 120, 140],
    "pad_units":      [20, 25, 30, 35, 40, 50],
    "corridors":      ["double", "single"],
    "outdoor_opts":   ["WEST", "ROOFTOP", "BOTH"],
    "outdoor_depths": [8, 10, 12, 15],
    "foh_pcts":       [0.55, 0.60, 0.65],
}


def build_option(params: Dict[str, Any], option_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Build a single fully-calculated option from a parameter set."""
    form_type = params["form"]
    fa = params.get("target_floor_area_m2", params.get("floor_area", 770))
    ww = params["wing_width_m"]
    storeys = params["storeys"]
    ct = params["corridor_type"]
    yt_target = params["yt_rooms"]
    pad_target = params["pad_units"]
    od_pos = params.get("outdoor_pos", "WEST")
    od_depth = params.get("outdoor_depth_m", 12)

    # Form geometry
    form = generate_form(form_type, fa, ww)
    if form is None:
        return None

    # Rooms per floor
    yt_rpf = rooms_per_floor(form, ct, YT_TYPES)
    pad_rpf = rooms_per_floor(form, ct, PAD_TYPES)

    # Floor counts
    yt_floors = min(math.ceil(yt_target / yt_rpf), storeys - 1) if yt_target > 0 else 0
    pad_floors = min(math.ceil(pad_target / pad_rpf), storeys - 1 - yt_floors) if pad_target > 0 else 0

    actual_yt = min(yt_target, yt_floors * yt_rpf)
    actual_pad = min(pad_target, pad_floors * pad_rpf)
    total_keys = actual_yt + actual_pad
    if total_keys < 50:
        return None

    # Build floors
    build_params = {**params, "yt_rooms": actual_yt, "pad_units": actual_pad,
                    "length_m": form["bounding_L"], "width_m": form["bounding_W"]}
    floors = build_floor_programme(build_params, yt_rpf, pad_rpf)

    actual_floor_count = len(floors)
    fp = form["footprint_m2"]
    gia = fp * actual_floor_count
    height = GROUND_H + (actual_floor_count - 1) * FLOOR_H

    # NIA
    nia = 0
    for fl in floors:
        for r in fl.get("rooms", []):
            rt = YT_TYPES.get(r["type"]) or PAD_TYPES.get(r["type"])
            if rt:
                nia += rt["nia"] * r["count"]

    # Outdoor
    od_ground = od_depth * form["west_facade_m"] if od_pos in ("WEST", "BOTH") else 0
    od_roof = fp * 0.5 if od_pos in ("ROOFTOP", "BOTH") else 0
    od_court = form["courtyard_m2"]
    od_total = od_ground + od_roof + od_court

    # Facade area
    facade_area = form["total_facade_m"] * height

    # Accessible count
    acc = sum(
        r["count"] for fl in floors for r in fl.get("rooms", [])
        if r["type"] in ("Accessible", "AccStudio")
    )

    metrics = {
        "form": form_type,
        "total_keys": total_keys, "yt_rooms": actual_yt, "pad_units": actual_pad,
        "storeys": actual_floor_count,
        "footprint_m2": round(fp), "gia_m2": round(gia),
        "gia_per_key": round(gia / total_keys, 1),
        "nia_m2": round(nia), "nia_gia_pct": round(nia / max(1, gia) * 100, 1),
        "building_height_m": round(height, 1),
        "coverage_pct": round(fp / _PLANNING.get("site_area_m2", 4213) * 100, 1),
        "far": round(gia / _PLANNING.get("site_area_m2", 4213), 2),
        "west_facade_m": form["west_facade_m"],
        "total_facade_m": form["total_facade_m"],
        "total_facade_m2": round(facade_area),
        "outdoor_ground_m2": round(od_ground),
        "outdoor_roof_m2": round(od_roof),
        "outdoor_courtyard_m2": round(od_court),
        "outdoor_total_m2": round(od_total),
        "accessible_count": acc,
        "corridor_type": ct, "outdoor_pos": od_pos,
        "wing_width_m": ww,
        "yt_per_floor": yt_rpf, "pad_per_floor": pad_rpf,
        "bounding_L": form["bounding_L"], "bounding_W": form["bounding_W"],
        "wings": form["wings"],
    }

    # Cost
    cost = estimate_cost(metrics)
    metrics.update(cost)
    metrics["cost_per_key_usd"] = cost["per_key_usd"]

    # Assemble option
    opt = {"params": params, "metrics": metrics, "floors": floors, "form_data": form}

    # Validate
    is_valid, violations, warnings = validate(opt)
    opt["is_valid"] = is_valid
    opt["violations"] = violations
    opt["warnings"] = warnings

    # Score
    score, breakdown = score_option(opt)
    opt["id"] = option_id or f"OPT-{abs(hash(json.dumps(params, sort_keys=True, default=str))) % 1000000:06d}"
    opt["score"] = score
    opt["score_breakdown"] = breakdown
    opt["rank"] = 0

    return opt


def generate_all(max_options: int = 30, include_invalid: bool = False) -> List[Dict[str, Any]]:
    """Sweep the design space and generate all valid unique options."""
    configs = []

    # Sweep 1: Form × floor area (main axis)
    for f in DESIGN_SPACE["forms"]:
        for fa in DESIGN_SPACE["floor_areas"]:
            for ww in DESIGN_SPACE["wing_widths"]:
                configs.append({
                    "form": f, "target_floor_area_m2": fa, "wing_width_m": ww,
                    "storeys": 6, "corridor_type": "double", "yt_rooms": 100,
                    "pad_units": 30, "outdoor_pos": "WEST", "outdoor_depth_m": 12,
                })

    # Sweep 2: Programme variations
    for f in ["BAR", "BAR_NS", "L"]:
        for yt in DESIGN_SPACE["yt_rooms"]:
            for pad in DESIGN_SPACE["pad_units"]:
                configs.append({
                    "form": f, "target_floor_area_m2": 770, "wing_width_m": 14.0,
                    "storeys": 6, "corridor_type": "double", "yt_rooms": yt,
                    "pad_units": pad, "outdoor_pos": "WEST", "outdoor_depth_m": 12,
                })

    # Sweep 3: Height × outdoor
    for s in DESIGN_SPACE["storeys"]:
        for od in DESIGN_SPACE["outdoor_opts"]:
            for f in ["BAR", "L", "U"]:
                configs.append({
                    "form": f, "target_floor_area_m2": 770, "wing_width_m": 14.0,
                    "storeys": s, "corridor_type": "double", "yt_rooms": 100,
                    "pad_units": 30, "outdoor_pos": od, "outdoor_depth_m": 12,
                })

    # Sweep 4: Single-loaded
    for f in ["BAR_NS", "L"]:
        for ww in [8.0, 9.25]:
            configs.append({
                "form": f, "target_floor_area_m2": 770, "wing_width_m": ww,
                "storeys": 7, "corridor_type": "single", "yt_rooms": 100,
                "pad_units": 30, "outdoor_pos": "WEST", "outdoor_depth_m": 12,
            })

    # Generate and dedup
    options = []
    seen = set()

    for cfg in configs:
        try:
            opt = build_option(cfg)
        except Exception:
            continue
        if opt is None or (not opt["is_valid"] and not include_invalid):
            continue

        m = opt["metrics"]
        sig = (m["form"], m["total_keys"], m["yt_rooms"], m["pad_units"],
               m["storeys"], m["gia_per_key"], m["building_height_m"],
               m["west_facade_m"], m["corridor_type"], m["outdoor_pos"])
        if sig in seen:
            continue
        seen.add(sig)
        options.append(opt)

    # Sort, dedup output, assign IDs
    options.sort(key=lambda x: x["score"], reverse=True)

    for i, opt in enumerate(options[:max_options]):
        opt["rank"] = i + 1
        letter = chr(65 + i // 9)
        digit = (i % 9) + 1
        opt["id"] = f"OPT-{letter}{digit}"

    return options[:max_options]


def group_options(options: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """Group options by outcome category."""
    if not options:
        return {}
    return {
        "best_overall":   [o["id"] for o in sorted(options, key=lambda x: x["score"], reverse=True)[:5]],
        "most_rooms":     [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["total_keys"], reverse=True)[:5]],
        "lowest_height":  [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["building_height_m"])[:5]],
        "best_views":     [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["west_facade_m"], reverse=True)[:5]],
        "lowest_cost":    [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["cost_per_key_usd"])[:5]],
        "most_outdoor":   [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["outdoor_total_m2"], reverse=True)[:5]],
        "most_efficient": [o["id"] for o in sorted(options, key=lambda x: abs(x["metrics"]["gia_per_key"] - 36))[:5]],
        "pad_heavy":      [o["id"] for o in sorted(options, key=lambda x: x["metrics"]["pad_units"], reverse=True)[:5]],
    }
