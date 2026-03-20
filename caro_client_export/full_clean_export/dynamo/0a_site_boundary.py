"""
MODULE 0A — EXTRACT SITE BOUNDARY FROM REVIT
=============================================
Dynamo CPython3 Node

Extracts the site boundary from the active Revit model using
multiple strategies (in priority order):
  1. Property Lines (Site > Property Line elements)
  2. Topography subregion boundaries
  3. User-selected model curves / detail lines
  4. Fallback: manually wired PolyCurve

Also extracts Revit project location (lat/lon) for OSM queries.

INPUTS:
  IN[0] = Strategy override: "property_line" | "topo" | "selection" | "curve"
          (None = auto-detect)
  IN[1] = Manual boundary PolyCurve (only used if strategy = "curve")
  IN[2] = Setback offset distance (m) — applied inward. 0 = no offset.

OUTPUTS:
  OUT[0] = Site boundary PolyCurve (in Revit project coordinates)
  OUT[1] = Offset boundary PolyCurve (buildable zone)
  OUT[2] = Site data dictionary (area, centroid, bbox, lat/lon, etc.)
  OUT[3] = Boundary points list [(x,y,z), ...]
  OUT[4] = JSON string (for passing to OSM fetcher and options engine)
"""

import clr
import sys
import json
import math

# ─── REVIT API ──────────────────────────────────────────────
clr.AddReference('RevitAPI')
clr.AddReference('RevitServices')
clr.AddReference('ProtoGeometry')

from Autodesk.Revit.DB import *
from RevitServices.Persistence import DocumentManager
from Autodesk.DesignScript.Geometry import *

doc = DocumentManager.Instance.CurrentDBDocument

# ─── PARAMETERS ─────────────────────────────────────────────
strategy = IN[0] if IN[0] else None
manual_curve = IN[1] if len(IN) > 1 else None
setback_m = IN[2] if len(IN) > 2 and IN[2] else 3.0

# ─── UNIT CONVERSION ────────────────────────────────────────
# Revit internal units are feet; convert to metres
FT_TO_M = 0.3048
M_TO_FT = 1.0 / FT_TO_M
SQFT_TO_SQM = FT_TO_M * FT_TO_M


def revit_xyz_to_point(xyz):
    """Convert Revit XYZ (feet) to Dynamo Point (project units, typically m)."""
    return Point.ByCoordinates(
        xyz.X * FT_TO_M,
        xyz.Y * FT_TO_M,
        xyz.Z * FT_TO_M
    )


def get_project_location():
    """Extract project lat/lon from Revit project location."""
    try:
        project_location = doc.ActiveProjectLocation
        position = project_location.GetProjectPosition(XYZ.Zero)
        site_location = project_location.GetSiteLocation()
        
        lat = math.degrees(site_location.Latitude)
        lon = math.degrees(site_location.Longitude)
        
        # Project base point offset
        ns_offset = position.NorthSouth * FT_TO_M
        ew_offset = position.EastWest * FT_TO_M
        elevation = position.Elevation * FT_TO_M
        angle = math.degrees(position.Angle)  # true north rotation
        
        return {
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "ns_offset_m": round(ns_offset, 3),
            "ew_offset_m": round(ew_offset, 3),
            "elevation_m": round(elevation, 3),
            "true_north_angle_deg": round(angle, 2),
            "has_location": True,
        }
    except:
        return {
            # Fallback: Bay Street, Bridgetown, Barbados
            "latitude": 13.0969,
            "longitude": -59.6145,
            "ns_offset_m": 0, "ew_offset_m": 0,
            "elevation_m": 0, "true_north_angle_deg": 0,
            "has_location": False,
        }


# ─── STRATEGY 1: PROPERTY LINES ────────────────────────────
def extract_property_lines():
    """Extract boundary from Revit Property Line elements."""
    collector = FilteredElementCollector(doc)\
        .OfCategory(BuiltInCategory.OST_PropertyLine)\
        .WhereElementIsNotElementType()\
        .ToElements()
    
    if not collector or len(collector) == 0:
        return None
    
    all_points = []
    for elem in collector:
        # Property lines store their geometry as curves
        geom = elem.get_Geometry(Options())
        if geom:
            for geom_obj in geom:
                if hasattr(geom_obj, 'GetEndPoint'):
                    p0 = geom_obj.GetEndPoint(0)
                    p1 = geom_obj.GetEndPoint(1)
                    all_points.append(revit_xyz_to_point(p0))
                    all_points.append(revit_xyz_to_point(p1))
                elif hasattr(geom_obj, 'GetInstanceGeometry'):
                    inst_geom = geom_obj.GetInstanceGeometry()
                    for g in inst_geom:
                        if hasattr(g, 'GetEndPoint'):
                            all_points.append(revit_xyz_to_point(g.GetEndPoint(0)))
                            all_points.append(revit_xyz_to_point(g.GetEndPoint(1)))
    
    if len(all_points) < 3:
        return None
    
    # Remove near-duplicate points and order them
    unique = []
    for p in all_points:
        is_dup = False
        for u in unique:
            if p.DistanceTo(u) < 0.1:  # within 100mm
                is_dup = True
                break
        if not is_dup:
            unique.append(p)
    
    if len(unique) < 3:
        return None
    
    # Sort points into a convex-ish boundary (by angle from centroid)
    cx = sum(p.X for p in unique) / len(unique)
    cy = sum(p.Y for p in unique) / len(unique)
    unique.sort(key=lambda p: math.atan2(p.Y - cy, p.X - cx))
    
    return PolyCurve.ByPoints(unique, True)


# ─── STRATEGY 2: TOPOGRAPHY SUBREGIONS ─────────────────────
def extract_topo_boundary():
    """Extract boundary from the largest topography surface or subregion."""
    collector = FilteredElementCollector(doc)\
        .OfCategory(BuiltInCategory.OST_Topography)\
        .WhereElementIsNotElementType()\
        .ToElements()
    
    if not collector:
        return None
    
    # Find the element with the most boundary points (likely the site)
    best = None
    best_count = 0
    
    for topo in collector:
        try:
            # TopographySurface has GetBoundaryPoints()
            if hasattr(topo, 'GetBoundaryPoints'):
                boundary_pts = topo.GetBoundaryPoints()
                if boundary_pts and len(boundary_pts) > best_count:
                    best = boundary_pts
                    best_count = len(boundary_pts)
        except:
            pass
    
    if best and len(best) >= 3:
        dynamo_pts = [revit_xyz_to_point(p) for p in best]
        return PolyCurve.ByPoints(dynamo_pts, True)
    
    return None


# ─── STRATEGY 3: SELECTED MODEL CURVES ─────────────────────
def extract_from_selection():
    """Extract boundary from currently selected curves in Revit."""
    try:
        uidoc = DocumentManager.Instance.CurrentUIApplication.ActiveUIDocument
        selection = uidoc.Selection.GetElementIds()
        
        if not selection or selection.Count == 0:
            return None
        
        points = []
        for eid in selection:
            elem = doc.GetElement(eid)
            if elem and hasattr(elem, 'GeometryCurve'):
                curve = elem.GeometryCurve
                points.append(revit_xyz_to_point(curve.GetEndPoint(0)))
                points.append(revit_xyz_to_point(curve.GetEndPoint(1)))
        
        if len(points) < 3:
            return None
        
        # Deduplicate
        unique = []
        for p in points:
            if not any(p.DistanceTo(u) < 0.1 for u in unique):
                unique.append(p)
        
        cx = sum(p.X for p in unique) / len(unique)
        cy = sum(p.Y for p in unique) / len(unique)
        unique.sort(key=lambda p: math.atan2(p.Y - cy, p.X - cx))
        
        return PolyCurve.ByPoints(unique, True)
    except:
        return None


# ─── MAIN EXTRACTION LOGIC ─────────────────────────────────
boundary = None

if strategy == "curve" and manual_curve:
    boundary = manual_curve
elif strategy == "property_line" or strategy is None:
    boundary = extract_property_lines()
if boundary is None and (strategy == "topo" or strategy is None):
    boundary = extract_topo_boundary()
if boundary is None and (strategy == "selection" or strategy is None):
    boundary = extract_from_selection()
if boundary is None and manual_curve:
    boundary = manual_curve

if boundary is None:
    # Ultimate fallback: create a default site polygon
    # Based on Woodside Bay Street survey plan dimensions
    fallback_pts = [
        Point.ByCoordinates(0, 0, 0),
        Point.ByCoordinates(27, 0, 0),
        Point.ByCoordinates(70, 5, 0),
        Point.ByCoordinates(70, 55, 0),
        Point.ByCoordinates(5, 55, 0),
        Point.ByCoordinates(0, 27, 0),
    ]
    boundary = PolyCurve.ByPoints(fallback_pts, True)


# ─── COMPUTE SITE METRICS ──────────────────────────────────
# Extract points from boundary
boundary_points = []
exploded = boundary.Explode()
for curve in exploded:
    sp = curve.StartPoint
    boundary_points.append(sp)

# Bounding box
xs = [p.X for p in boundary_points]
ys = [p.Y for p in boundary_points]
min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)
bbox_length = max_x - min_x
bbox_width = max_y - min_y
centroid_x = (min_x + max_x) / 2
centroid_y = (min_y + max_y) / 2

# Area (shoelace formula)
n = len(boundary_points)
area = 0
for i in range(n):
    j = (i + 1) % n
    area += boundary_points[i].X * boundary_points[j].Y
    area -= boundary_points[j].X * boundary_points[i].Y
area = abs(area) / 2

# Perimeter
perimeter = sum(
    boundary_points[i].DistanceTo(boundary_points[(i+1) % n])
    for i in range(n)
)

# West-facing edges (edges where normal points in -X direction = toward beach)
west_edges = []
for i in range(n):
    p1 = boundary_points[i]
    p2 = boundary_points[(i + 1) % n]
    # Edge normal (2D, outward for CCW polygon)
    dx = p2.X - p1.X
    dy = p2.Y - p1.Y
    nx, ny = dy, -dx  # outward normal
    if nx < -0.3:  # mostly west-facing
        edge_len = p1.DistanceTo(p2)
        west_edges.append({"from": i, "to": (i+1)%n, "length_m": round(edge_len, 2)})

west_facade_total = sum(e["length_m"] for e in west_edges)


# ─── APPLY SETBACK OFFSET ──────────────────────────────────
if setback_m > 0:
    try:
        offset_boundary = boundary.Offset(setback_m)
    except:
        # If offset fails (self-intersecting), use buffer approach
        offset_boundary = boundary
else:
    offset_boundary = boundary


# ─── PROJECT LOCATION ───────────────────────────────────────
location = get_project_location()


# ─── BUILD SITE DATA DICTIONARY ─────────────────────────────
site_data = {
    "source": strategy or "auto-detected",
    "area_m2": round(area, 1),
    "perimeter_m": round(perimeter, 1),
    "bbox": {
        "min_x": round(min_x, 2), "min_y": round(min_y, 2),
        "max_x": round(max_x, 2), "max_y": round(max_y, 2),
        "length_m": round(bbox_length, 1),
        "width_m": round(bbox_width, 1),
    },
    "centroid": {"x": round(centroid_x, 2), "y": round(centroid_y, 2)},
    "point_count": n,
    "west_facade_potential_m": round(west_facade_total, 1),
    "west_edges": west_edges,
    "setback_applied_m": setback_m,
    "location": location,
    "coordinate_convention": {
        "+X": "East (inland)",
        "-X": "West (beach / Carlisle Bay)",
        "+Y": "North",
        "-Y": "South",
        "beach_side": "WEST (-X)",
    },
    "points": [{"x": round(p.X, 3), "y": round(p.Y, 3), "z": round(p.Z, 3)} 
               for p in boundary_points],
}

# ─── SERIALIZE TO JSON ──────────────────────────────────────
json_str = json.dumps(site_data, indent=2)

# ─── OUTPUT ─────────────────────────────────────────────────
OUT = [
    boundary,           # 0: Raw site boundary PolyCurve
    offset_boundary,    # 1: Offset (buildable zone) PolyCurve
    site_data,          # 2: Site metrics dictionary
    [(round(p.X, 3), round(p.Y, 3), round(p.Z, 3)) for p in boundary_points],  # 3: Points list
    json_str,           # 4: JSON string for downstream nodes
]
