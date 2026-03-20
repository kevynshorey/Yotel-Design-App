"""
MODULE 1 — SITE BOUNDARY → FOOTPRINT → OUTDOOR SPACE
=====================================================
Dynamo CPython3 Node — paste into a single Python Script node.

INPUTS (wire from Dynamo):
  IN[0] = Site boundary PolyCurve (already offset/cleaned)
          OR None to use default coordinates from config
  IN[1] = Building length override (m) — optional, default 55
  IN[2] = Building width override (m)  — optional, default 14
  IN[3] = Outdoor depth override (m)   — optional, default 12

OUTPUTS:
  OUT[0] = Building footprint rectangle (PolyCurve)
  OUT[1] = Outdoor space rectangle (PolyCurve)
  OUT[2] = Site metrics dictionary
  OUT[3] = Building origin point (SW corner)

COORDINATE CONVENTION:
  +X = East (inland), -X = West (beach / Carlisle Bay)
  +Y = North, -Y = South
  The building long axis runs E–W. The WEST face (min-X) = beach.
  Outdoor space is placed WEST of the building (toward beach).
"""

import clr
clr.AddReference('ProtoGeometry')
from Autodesk.DesignScript.Geometry import *

import sys, math

# ─── PARAMETERS (override via IN ports or use defaults) ──────────
site_boundary = IN[0] if IN[0] is not None else None
bldg_length   = IN[1] if len(IN) > 1 and IN[1] else 55.0    # E–W
bldg_width    = IN[2] if len(IN) > 2 and IN[2] else 14.0    # N–S
outdoor_depth = IN[3] if len(IN) > 3 and IN[3] else 12.0    # westward from bldg

# ─── STEP 1: RESOLVE SITE BOUNDARY ──────────────────────────────
if site_boundary is not None:
    # User supplied a PolyCurve — extract bounding box
    bbox = BoundingBox.ByGeometry(site_boundary)
    site_min = bbox.MinPoint
    site_max = bbox.MaxPoint
    site_area = (site_max.X - site_min.X) * (site_max.Y - site_min.Y)
    site_cx = (site_min.X + site_max.X) / 2
    site_cy = (site_min.Y + site_max.Y) / 2
else:
    # No boundary wired — use default from config (approx site)
    site_min = Point.ByCoordinates(0, 0, 0)
    site_max = Point.ByCoordinates(70, 55, 0)
    site_area = 3250  # estimated
    site_cx = 35
    site_cy = 27.5

# ─── STEP 2: PLACE BUILDING FOOTPRINT ───────────────────────────
# Strategy: Centre the building N–S within the site,
# push it EAST from the Bay Street frontage to leave room for outdoor.
# Bay Street = west edge. Building starts after outdoor zone.

# Building origin = SW corner of the building rectangle
# Outdoor is WEST of building, so building.x starts at outdoor_depth
bldg_origin_x = outdoor_depth  # leave room for outdoor to the west
bldg_origin_y = site_cy - bldg_width / 2  # centre N–S

bldg_origin = Point.ByCoordinates(bldg_origin_x, bldg_origin_y, 0)

# Create building footprint rectangle
bldg_pts = [
    Point.ByCoordinates(bldg_origin_x,               bldg_origin_y, 0),                # SW
    Point.ByCoordinates(bldg_origin_x + bldg_length,  bldg_origin_y, 0),                # SE
    Point.ByCoordinates(bldg_origin_x + bldg_length,  bldg_origin_y + bldg_width, 0),   # NE
    Point.ByCoordinates(bldg_origin_x,               bldg_origin_y + bldg_width, 0),    # NW
]
bldg_footprint = PolyCurve.ByPoints(bldg_pts, True)

# ─── STEP 3: OUTDOOR SPACE (WEST OF BUILDING) ───────────────────
# The outdoor zone sits between Bay Street and the building west face.
# It spans the full building length (or could be a subset).
outdoor_pts = [
    Point.ByCoordinates(0,              bldg_origin_y, 0),                              # SW (at Bay St)
    Point.ByCoordinates(outdoor_depth,  bldg_origin_y, 0),                              # SE (meets bldg)
    Point.ByCoordinates(outdoor_depth,  bldg_origin_y + bldg_width, 0),                 # NE
    Point.ByCoordinates(0,              bldg_origin_y + bldg_width, 0),                 # NW
]
outdoor_rect = PolyCurve.ByPoints(outdoor_pts, True)

# ─── STEP 4: COMPUTE METRICS ────────────────────────────────────
footprint_area = bldg_length * bldg_width
outdoor_area = outdoor_depth * bldg_width  # using bldg width as outdoor length for now
total_ground_coverage = footprint_area + outdoor_area
coverage_pct = footprint_area / site_area * 100

metrics = {
    "site_area_m2": round(site_area, 1),
    "footprint_m2": round(footprint_area, 1),
    "outdoor_m2": round(outdoor_area, 1),
    "coverage_pct": round(coverage_pct, 1),
    "bldg_length_m": bldg_length,
    "bldg_width_m": bldg_width,
    "outdoor_depth_m": outdoor_depth,
    "west_face": "BEACH (Carlisle Bay)",
    "east_face": "Inland / Henry's Lane",
    "north_face": "Northern road (BOH access)",
    "south_face": "Toward Dunlow Lane",
    "origin_x": bldg_origin_x,
    "origin_y": bldg_origin_y,
    "compliant": coverage_pct <= 50.0,
}

# ─── OUTPUT ──────────────────────────────────────────────────────
OUT = [bldg_footprint, outdoor_rect, metrics, bldg_origin]
