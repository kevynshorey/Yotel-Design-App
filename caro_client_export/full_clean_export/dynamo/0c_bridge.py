"""
MODULE 0C — DYNAMO → ENGINE → VIEWER BRIDGE
=============================================
Dynamo CPython3 Node

Takes the outputs of Module 0A (site boundary) and Module 0B (OSM context),
combines them with Revit model context, runs the options engine, and
outputs JSON for the React viewer + geometry for Dynamo visualization.

Also extracts from the active Revit model:
  - Levels (floor elevations)
  - Existing building masses (if any)
  - Grid lines
  - Views (for reference)

INPUTS:
  IN[0] = Site data JSON (from Module 0A, OUT[4])
  IN[1] = OSM context JSON (from Module 0B, OUT[4])  — can be None if offline
  IN[2] = Options engine constraints override (dict) — optional
  IN[3] = Number of options to generate (default 20)

OUTPUTS:
  OUT[0] = Combined project data dict (site + context + options)
  OUT[1] = Options list (for Dynamo visualization downstream)
  OUT[2] = JSON string for React viewer (write to file for web use)
  OUT[3] = Revit context data (levels, grids, etc.)
  OUT[4] = File path if JSON was saved to disk
"""

import clr
import json
import math
import os
import sys

clr.AddReference('RevitAPI')
clr.AddReference('RevitServices')
from Autodesk.Revit.DB import *
from RevitServices.Persistence import DocumentManager

doc = DocumentManager.Instance.CurrentDBDocument

# ─── PARAMETERS ─────────────────────────────────────────────
site_json = IN[0] if IN[0] else None
osm_json = IN[1] if len(IN) > 1 and IN[1] else None
constraints_override = IN[2] if len(IN) > 2 and IN[2] else None
num_options = IN[3] if len(IN) > 3 and IN[3] else 20

FT_TO_M = 0.3048

# ─── PARSE INPUTS ───────────────────────────────────────────
site_data = json.loads(site_json) if isinstance(site_json, str) else (site_json or {})
osm_data = json.loads(osm_json) if isinstance(osm_json, str) else (osm_json or {})


# ─── EXTRACT REVIT CONTEXT ──────────────────────────────────
def get_revit_levels():
    """Extract all levels from Revit model."""
    collector = FilteredElementCollector(doc)\
        .OfClass(Level)\
        .WhereElementIsNotElementType()\
        .ToElements()
    
    levels = []
    for lvl in sorted(collector, key=lambda l: l.Elevation):
        levels.append({
            "name": lvl.Name,
            "elevation_m": round(lvl.Elevation * FT_TO_M, 3),
            "id": lvl.Id.IntegerValue,
        })
    return levels


def get_revit_grids():
    """Extract grid lines from Revit model."""
    collector = FilteredElementCollector(doc)\
        .OfClass(Grid)\
        .WhereElementIsNotElementType()\
        .ToElements()
    
    grids = []
    for grid in collector:
        curve = grid.Curve
        p0 = curve.GetEndPoint(0)
        p1 = curve.GetEndPoint(1)
        grids.append({
            "name": grid.Name,
            "start": {"x": round(p0.X * FT_TO_M, 2), "y": round(p0.Y * FT_TO_M, 2)},
            "end": {"x": round(p1.X * FT_TO_M, 2), "y": round(p1.Y * FT_TO_M, 2)},
        })
    return grids


def get_existing_masses():
    """Extract any existing massing elements (conceptual mass, in-place mass)."""
    masses = []
    try:
        collector = FilteredElementCollector(doc)\
            .OfCategory(BuiltInCategory.OST_Mass)\
            .WhereElementIsNotElementType()\
            .ToElements()
        
        for mass in collector:
            bb = mass.get_BoundingBox(None)
            if bb:
                masses.append({
                    "name": mass.Name or "Unnamed Mass",
                    "id": mass.Id.IntegerValue,
                    "min": {"x": round(bb.Min.X * FT_TO_M, 2), "y": round(bb.Min.Y * FT_TO_M, 2), "z": round(bb.Min.Z * FT_TO_M, 2)},
                    "max": {"x": round(bb.Max.X * FT_TO_M, 2), "y": round(bb.Max.Y * FT_TO_M, 2), "z": round(bb.Max.Z * FT_TO_M, 2)},
                })
    except:
        pass
    return masses


revit_context = {
    "levels": get_revit_levels(),
    "grids": get_revit_grids(),
    "existing_masses": get_existing_masses(),
    "project_name": doc.Title if doc else "Unknown",
    "units": "metres",
}


# ─── DERIVE SITE CONSTRAINTS FROM BOUNDARY ──────────────────
# Use actual boundary geometry to set options engine parameters
site_area = site_data.get("area_m2", 3000)
bbox = site_data.get("bbox", {})
site_length = bbox.get("length_m", 70)
site_width = bbox.get("width_m", 55)
west_potential = site_data.get("west_facade_potential_m", 50)

# Derive max building envelope from site
max_footprint_area = site_area * 0.50  # 50% max coverage
setback = site_data.get("setback_applied_m", 3.0)
buildable_length = site_length - 2 * setback
buildable_width = site_width - 2 * setback

# Use OSM context to inform constraints
max_nearby_height = 0
avg_nearby_height = 0
if osm_data and "summary" in osm_data:
    max_nearby_height = osm_data["summary"].get("max_nearby_building_height", 0)
    avg_nearby_height = osm_data["summary"].get("avg_nearby_building_height", 0)

# Suggested height: don't exceed tallest neighbour by more than 50%
suggested_max_height = max(21, max_nearby_height * 1.5) if max_nearby_height > 0 else 25


# ─── OPTIONS ENGINE (EMBEDDED) ──────────────────────────────
# Simplified version of options_engine_v2 that runs inside Dynamo

def generate_option_embedded(params, option_id):
    """Generate a single option — embedded version for Dynamo."""
    form = params.get("form", "BAR")
    fa = params.get("floor_area", 770)
    ww = params.get("wing_width", 14.0)
    storeys = params.get("storeys", 6)
    ct = params.get("corridor", "double")
    yt_target = params.get("yt_rooms", 100)
    pad_target = params.get("pad_units", 30)
    outdoor = params.get("outdoor_pos", "WEST")
    
    # Form geometry (simplified)
    W = ww
    if form in ("BAR", "BAR_NS"):
        L = round(fa / W)
        footprint = L * W
        west_fac = L if form == "BAR_NS" else W
        total_fac = 2 * (L + W)
        courtyard = 0
        bL, bW = (W, L) if form == "BAR_NS" else (L, W)
    elif form == "L":
        La = round(fa * 0.6 / W)
        Lb = round(fa * 0.4 / W)
        footprint = La * W + Lb * W - W * W
        west_fac = W + Lb
        total_fac = 2 * La + 2 * Lb
        courtyard = 0
        bL, bW = La, Lb + W
    elif form in ("U", "C"):
        Lw = round(fa / 3 / W)
        gap = max(8, Lw)
        footprint = 2 * Lw * W + (gap + 2 * W) * W - 2 * W * W
        west_fac = gap + 2 * W
        total_fac = 4 * Lw + 2 * (gap + 2 * W)
        courtyard = Lw * gap
        bL, bW = Lw, gap + 2 * W
    else:
        return None
    
    # Check fits in site
    if bL > buildable_length or bW > buildable_width:
        return None
    if footprint > max_footprint_area:
        return None
    
    # Rooms per floor
    core = 5.5
    sides = 2 if ct == "double" else 1
    avg_yt_bay = 3.37 * 0.6 + 3.37 * 0.18 + 5.055 * 0.12 + 5.055 * 0.1
    avg_pad_bay = 3.67 * 0.67 + 5.07 * 0.2 + 6.67 * 0.06 + 4.28 * 0.07
    
    # For multi-wing forms, sum usable length across wings
    if form in ("BAR", "BAR_NS"):
        usable = max(0, (L if form == "BAR" else L) - 0.8 - core)
    elif form == "L":
        usable = max(0, La - 0.8 - core) + max(0, Lb - 0.8 - core)
    else:
        usable = 2 * max(0, Lw - 0.8 - core) + max(0, (gap + 2 * W) - 0.8 - core)
    
    yt_rpf = max(1, int(usable / avg_yt_bay) * sides)
    pad_rpf = max(1, int(usable / avg_pad_bay) * sides)
    
    yt_floors = min(math.ceil(yt_target / yt_rpf), storeys - 1)
    pad_floors = min(math.ceil(pad_target / pad_rpf), storeys - 1 - yt_floors)
    
    actual_yt = min(yt_target, yt_floors * yt_rpf)
    actual_pad = min(pad_target, pad_floors * pad_rpf)
    total_keys = actual_yt + actual_pad
    if total_keys < 50:
        return None
    
    actual_floors = 1 + yt_floors + pad_floors
    gia = footprint * actual_floors
    height = 4.5 + (actual_floors - 1) * 3.2
    
    if height > suggested_max_height + 5:
        return None  # too tall for context
    
    # Cost
    fm = {"BAR": 1, "BAR_NS": 1, "L": 1.08, "U": 1.14, "C": 1.11}.get(form, 1)
    hard = footprint * 2800 * 1.25 * fm + (gia - footprint) * 2800 * fm
    hard += total_fac * height * 650
    hard += actual_yt * 22000 + actual_pad * 30000 + total_keys * 3500
    total_cost = round(hard + 5700000 + hard * 0.145)
    
    # Outdoor
    od_g = 12 * west_fac if outdoor in ("WEST", "BOTH") else 0
    od_r = footprint * 0.5 if outdoor in ("ROOFTOP", "BOTH") else 0
    od_total = round(od_g + od_r + courtyard)
    
    return {
        "id": option_id,
        "form": form,
        "total_keys": total_keys,
        "yt_rooms": actual_yt,
        "pad_units": actual_pad,
        "storeys": actual_floors,
        "footprint_m2": round(footprint),
        "gia_m2": round(gia),
        "gia_per_key": round(gia / total_keys, 1),
        "height_m": round(height, 1),
        "coverage_pct": round(footprint / site_area * 100, 1),
        "far": round(gia / site_area, 2),
        "west_facade_m": round(west_fac, 1),
        "outdoor_m2": od_total,
        "courtyard_m2": round(courtyard),
        "total_cost_usd": total_cost,
        "cost_per_key_usd": round(total_cost / total_keys),
        "corridor": ct,
        "outdoor_pos": outdoor,
        "bounding_L": round(bL, 1),
        "bounding_W": round(bW, 1),
        "wing_width": ww,
        "fits_site": bL <= buildable_length and bW <= buildable_width,
        "context_height_ok": height <= suggested_max_height,
    }


# ─── GENERATE OPTIONS ──────────────────────────────────────
options = []
counter = 0

# Define sweep space (reduced for Dynamo percontextnce)
forms = ["BAR", "BAR_NS", "L", "U", "C"]
floor_areas = [650, 770, 850, 950]
wing_widths = [13.6, 14.0, 16.1]
storey_opts = [5, 6, 7]
yt_opts = [80, 100, 120]
pad_opts = [20, 30, 40]
outdoor_opts = ["WEST", "BOTH"]

# Apply constraint overrides
if constraints_override:
    if "forms" in constraints_override:
        forms = constraints_override["forms"]
    if "yt_range" in constraints_override:
        yt_opts = constraints_override["yt_range"]
    if "pad_range" in constraints_override:
        pad_opts = constraints_override["pad_range"]

seen = set()
for f in forms:
    for fa in floor_areas:
        for ww in wing_widths:
            for s in storey_opts:
                for yt in yt_opts:
                    for pad in pad_opts:
                        for od in outdoor_opts:
                            counter += 1
                            letter = chr(65 + (counter - 1) // 9)
                            digit = ((counter - 1) % 9) + 1
                            oid = f"OPT-{letter}{digit}"
                            
                            opt = generate_option_embedded({
                                "form": f, "floor_area": fa, "wing_width": ww,
                                "storeys": s, "corridor": "double",
                                "yt_rooms": yt, "pad_units": pad, "outdoor_pos": od,
                            }, oid)
                            
                            if opt and opt["fits_site"]:
                                sig = (opt["form"], opt["total_keys"], opt["yt_rooms"],
                                       opt["pad_units"], opt["storeys"], opt["gia_per_key"],
                                       opt["height_m"], opt["outdoor_pos"])
                                if sig not in seen:
                                    seen.add(sig)
                                    options.append(opt)

# Sort by a simple score
for opt in options:
    gk = opt["gia_per_key"]
    s = 0
    s += (1 if 120 <= opt["total_keys"] <= 140 else max(0, 1 - abs(opt["total_keys"] - 130) / 130)) * 18
    s += (1 if 33 <= gk <= 38 else 0.7 if 29 <= gk <= 42 else 0.3) * 14
    s += min(1, opt["west_facade_m"] / 50) * 14
    s += (1 if opt["height_m"] <= 21 else 0.6) * 10
    s += min(1, opt["outdoor_m2"] / 900) * 10
    s += (1 if opt["cost_per_key_usd"] <= 230000 else 0.75 if opt["cost_per_key_usd"] <= 270000 else 0.5) * 12
    s += (0.75 if opt["form"] in ("U", "C") else 0.5) * 8
    pp = opt["pad_units"] / max(1, opt["total_keys"])
    s += (1 if 0.18 <= pp <= 0.28 else 0.6) * 6
    s += {"BAR": 1, "BAR_NS": 1, "L": 0.75, "C": 0.6, "U": 0.5}.get(opt["form"], 0.5) * 8
    opt["score"] = round(s, 1)

options.sort(key=lambda x: x["score"], reverse=True)

# Re-assign clean IDs after sort
for i, opt in enumerate(options[:num_options]):
    opt["rank"] = i + 1
    letter = chr(65 + i // 9)
    digit = (i % 9) + 1
    opt["id"] = f"OPT-{letter}{digit}"

options = options[:num_options]


# ─── COMPILE OUTPUT ─────────────────────────────────────────
project_data = {
    "project": {
        "name": revit_context["project_name"],
        "client": "Coruscant Developments",
        "site": "Bay Street, Bridgetown, Barbados",
    },
    "site": site_data,
    "context": {
        "osm_available": bool(osm_data),
        "buildings_nearby": osm_data.get("buildings", {}).get("count", 0) if osm_data else 0,
        "max_nearby_height_m": max_nearby_height,
        "avg_nearby_height_m": round(avg_nearby_height, 1),
        "suggested_max_height_m": round(suggested_max_height, 1),
    },
    "revit": revit_context,
    "options": options,
    "generation_stats": {
        "total_generated": counter,
        "valid_unique": len(options),
        "site_area_m2": site_area,
        "buildable_envelope": f"{buildable_length:.0f}m × {buildable_width:.0f}m",
    },
}

# ─── SAVE JSON TO DISK ──────────────────────────────────────
output_path = None
try:
    # Save next to Revit file
    revit_dir = os.path.dirname(doc.PathName) if doc.PathName else ""
    if revit_dir:
        output_path = os.path.join(revit_dir, "yotel_masterplan_options.json")
    else:
        output_path = os.path.join(os.path.expanduser("~"), "Desktop", "yotel_masterplan_options.json")
    
    with open(output_path, 'w') as f:
        json.dump(project_data, f, indent=2, default=str)
except:
    output_path = "Failed to save — copy JSON from OUT[2]"

json_str = json.dumps(project_data, indent=2, default=str)

# ─── OUTPUT ─────────────────────────────────────────────────
OUT = [
    project_data,       # 0: Combined project data
    options,            # 1: Options list
    json_str,           # 2: JSON string
    revit_context,      # 3: Revit context
    output_path,        # 4: Saved file path
]
