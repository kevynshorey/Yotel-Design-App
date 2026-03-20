"""
Site boundary data — extracted from Dynamo export (dyn_siteoffset.json).
Woodside, Bay Street, Bridgetown, Barbados.
All coordinates in metres from Revit project base point.
"""

# Original site boundary (survey, 10 unique vertices)
ORIGINAL_BOUNDARY = [
    {"x": 1.009, "y": -0.301},
    {"x": -10.767, "y": 26.325},
    {"x": 9.350, "y": 34.945},
    {"x": 41.455, "y": 54.551},
    {"x": 70.225, "y": 57.869},
    {"x": 99.271, "y": 64.064},
    {"x": 116.286, "y": 65.293},
    {"x": 120.661, "y": 7.772},
    {"x": 71.756, "y": 5.659},
    {"x": 23.308, "y": 3.414},
]

# Offset boundary (buildable zone, 10 unique vertices)
# After directional setbacks: W=55m, N=8m, E=5m, S=5m
OFFSET_BOUNDARY = [
    {"x": 66.161, "y": 8.403},
    {"x": 35.597, "y": 8.403},
    {"x": 35.597, "y": 46.533},
    {"x": 42.789, "y": 50.678},
    {"x": 70.873, "y": 53.917},
    {"x": 85.741, "y": 57.088},
    {"x": 113.901, "y": 57.088},
    {"x": 115.434, "y": 36.933},
    {"x": 115.434, "y": 10.549},
    {"x": 71.622, "y": 8.656},
]

# Building placement used by the canonical viewer (`frontend/src/components/Viewer3D.jsx`).
# Keep this in sync if the viewer placement changes.
VIEWER_BUILDING_PLACEMENT = {"x": 65, "y": 9, "rot_deg": 8}

# Offsets applied per side
OFFSETS = {"W": 55, "N": 8, "E": 5, "S": 5}
SIDES_ORDER = ["W", "N", "E", "S"]

# Computed metrics
SITE = {
    # Areas
    "gross_area_m2": 5965,
    "buildable_area_m2": 3599.1,
    "max_coverage_pct": 50,
    "max_footprint_m2": 1800,       # 3599.1 * 0.50

    # Buildable bounding box
    "buildable_min_x": 35.597,
    "buildable_max_x": 115.434,
    "buildable_min_y": 8.403,
    "buildable_max_y": 57.088,
    "buildable_ew_m": 79.84,        # east-west span
    "buildable_ns_m": 48.69,        # north-south span

    # Planning
    "max_height_m": 25.0,
    "min_setback_m": 3.0,           # already applied in offset

    # Orientation
    "beach_side": "W",
    "west_edge_length_m": 31.6,     # labelled west side of offset boundary
    "coordinate_notes": "Units: metres. Origin: Revit project base point. West faces Carlisle Bay.",

    # Centroid of buildable zone
    "centroid_x": 75.52,
    "centroid_y": 32.75,
}
