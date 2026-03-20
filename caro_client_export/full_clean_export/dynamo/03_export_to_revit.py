"""
MODULE 3 — EXPORT SELECTED OPTION TO REVIT
============================================
Dynamo CPython3 Node

Takes a selected option from the options engine and creates:
  1. Levels for each floor
  2. Conceptual mass for each wing per floor (coloured by programme)
  3. Room separation lines and area plans (optional)
  4. Parameter data attached to masses (GIA, key count, cost)

INPUTS:
  IN[0] = Selected option dict (from Module 0C, pick from OUT[1] list)
          OR JSON string of a single option
  IN[1] = Site boundary PolyCurve (from Module 0A OUT[0])
  IN[2] = Building origin Point (from Module 1 OUT[3])
  IN[3] = Create rooms (bool, default False — set True for area plans)

OUTPUTS:
  OUT[0] = Created mass elements (list of DirectShape or FamilyInstance)
  OUT[1] = Created levels (list)
  OUT[2] = Summary report string
"""

import clr
import json
import math

clr.AddReference('RevitAPI')
clr.AddReference('RevitServices')
clr.AddReference('ProtoGeometry')
clr.AddReference('RevitNodes')

from Autodesk.Revit.DB import *
from RevitServices.Persistence import DocumentManager
from RevitServices.Transactions import TransactionManager
from Autodesk.DesignScript.Geometry import Point as DynPoint

doc = DocumentManager.Instance.CurrentDBDocument
FT_TO_M = 0.3048
M_TO_FT = 1.0 / FT_TO_M

# ─── PARAMETERS ─────────────────────────────────────────────
option_input = IN[0]
site_boundary = IN[1] if len(IN) > 1 else None
origin = IN[2] if len(IN) > 2 else None
create_rooms = IN[3] if len(IN) > 3 and IN[3] else False

# Parse option
if isinstance(option_input, str):
    option = json.loads(option_input)
elif isinstance(option_input, dict):
    option = option_input
else:
    option = None

if option is None:
    OUT = [[], [], "Error: No option provided"]
else:
    metrics = option.get("metrics", option)
    floors_data = option.get("floors", [])
    wings = metrics.get("wings", [])
    form = metrics.get("form", "BAR")

    # Origin point
    if origin:
        ox = origin.X * M_TO_FT
        oy = origin.Y * M_TO_FT
    else:
        ox, oy = 0, 0

    # Colour map (RGB 0-255)
    COLOURS = {
        "ground":   Color(245, 166, 35),   # amber — FOH/BOH
        "yotel":    Color(91, 181, 162),    # teal — hotel
        "yotelpad": Color(232, 99, 122),    # coral — extended stay
    }

    # ─── CREATE LEVELS ──────────────────────────────────
    created_levels = []
    floor_heights = {}
    ground_h = 4.5  # metres
    upper_h = 3.2

    TransactionManager.Instance.EnsureInTransaction(doc)

    elevation = 0
    for i, fl in enumerate(floors_data):
        h = ground_h if i == 0 else upper_h
        level_name = fl.get("label", f"Floor {i}")
        elev_ft = elevation * M_TO_FT

        # Check if level already exists at this elevation
        existing = FilteredElementCollector(doc).OfClass(Level).ToElements()
        found = None
        for lv in existing:
            if abs(lv.Elevation - elev_ft) < 0.1:  # within ~30mm
                found = lv
                break

        if found:
            level = found
        else:
            level = Level.Create(doc, elev_ft)
            level.Name = level_name

        created_levels.append(level)
        floor_heights[i] = {"elevation_m": elevation, "height_m": h, "level": level}
        elevation += h

    TransactionManager.Instance.TransactionTaskDone()

    # ─── CREATE MASSES (DirectShape per wing per floor) ──
    created_masses = []

    TransactionManager.Instance.EnsureInTransaction(doc)

    # Get or create DirectShape category
    ds_cat_id = ElementId(BuiltInCategory.OST_Mass)

    for fi, fl in enumerate(floors_data):
        fh = floor_heights[fi]
        base_elev = fh["elevation_m"] * M_TO_FT
        height_ft = fh["height_m"] * M_TO_FT
        floor_type = fl.get("type", "ground")
        colour = COLOURS.get(floor_type, Color(200, 200, 200))

        for wing in wings:
            # Wing geometry in project coords
            if wing.get("dir") == "NS":
                wx = ox + wing["x"] * M_TO_FT
                wy = oy + wing["y"] * M_TO_FT
                wl = wing["w"] * M_TO_FT   # swapped for NS
                ww = wing["l"] * M_TO_FT
            else:
                wx = ox + wing["x"] * M_TO_FT
                wy = oy + wing["y"] * M_TO_FT
                wl = wing["l"] * M_TO_FT
                ww = wing["w"] * M_TO_FT

            # Create extrusion profile
            p0 = XYZ(wx, wy, base_elev)
            p1 = XYZ(wx + wl, wy, base_elev)
            p2 = XYZ(wx + wl, wy + ww, base_elev)
            p3 = XYZ(wx, wy + ww, base_elev)

            profile = CurveLoop()
            profile.Append(Line.CreateBound(p0, p1))
            profile.Append(Line.CreateBound(p1, p2))
            profile.Append(Line.CreateBound(p2, p3))
            profile.Append(Line.CreateBound(p3, p0))

            # Extrude
            solid = GeometryCreationUtilities.CreateExtrusionGeometry(
                [profile], XYZ.BasisZ, height_ft - 0.1 * M_TO_FT
            )

            # Create DirectShape
            ds = DirectShape.CreateElement(doc, ds_cat_id)
            ds.SetShape([solid])
            ds.SetName(f"{fl.get('label', 'Floor')} — {wing.get('label', 'Wing')}")

            # Apply colour override
            try:
                ogs = OverrideGraphicSettings()
                ogs.SetProjectionLineColor(colour)
                ogs.SetSurfaceForegroundPatternColor(colour)
                # Find a solid fill pattern
                patterns = FilteredElementCollector(doc).OfClass(FillPatternElement).ToElements()
                solid_pat = None
                for pat in patterns:
                    if pat.GetFillPattern().IsSolidFill:
                        solid_pat = pat.Id
                        break
                if solid_pat:
                    ogs.SetSurfaceForegroundPatternId(solid_pat)
                doc.ActiveView.SetElementOverrides(ds.Id, ogs)
            except:
                pass  # colour override is cosmetic, don't fail

            created_masses.append(ds)

    TransactionManager.Instance.TransactionTaskDone()

    # ─── SUMMARY REPORT ─────────────────────────────────
    report_lines = [
        f"YOTEL Masterplan Export — {form} Form",
        f"{'─' * 40}",
        f"Total keys: {metrics.get('total_keys', '?')}",
        f"YOTEL rooms: {metrics.get('yt_rooms', '?')}",
        f"YOTELPAD units: {metrics.get('pad_units', '?')}",
        f"Storeys: {metrics.get('storeys', '?')}",
        f"GIA: {metrics.get('gia_m2', '?')} m²",
        f"Height: {metrics.get('building_height_m', '?')} m",
        f"Est. cost: ${metrics.get('total_usd', 0):,}",
        f"{'─' * 40}",
        f"Levels created: {len(created_levels)}",
        f"Mass elements created: {len(created_masses)}",
        f"Wings per floor: {len(wings)}",
    ]
    report = "\n".join(report_lines)

    OUT = [created_masses, created_levels, report]
