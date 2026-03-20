"""
MODULE 0B — FETCH OSM CONTEXT DATA
====================================
Dynamo CPython3 Node — requires internet access (runs in Dynamo, not sandbox)

Fetches OpenStreetMap data around the site location via Overpass API:
  - Buildings (footprints, heights, names)
  - Roads (classification, width)
  - Coastline / waterfront
  - Amenities (restaurants, bars, transport)
  - Land use zones

Uses the lat/lon from Module 0A (site boundary extraction).

INPUTS:
  IN[0] = Site data JSON string (from Module 0A, OUT[4])
          OR dict with at minimum {"location": {"latitude": ..., "longitude": ...}}
  IN[1] = Search radius in metres (default 300)
  IN[2] = Fetch categories: list of strings, e.g. ["buildings", "roads", "coast"]
          (default: all)

OUTPUTS:
  OUT[0] = Context data dictionary (all fetched data)
  OUT[1] = Building footprints (list of point lists for Dynamo geometry)
  OUT[2] = Road centrelines (list of point lists)
  OUT[3] = Coastline points
  OUT[4] = JSON string (full context for viewer)
"""

import json
import math
import sys

# CPython3 in Dynamo has access to standard library including urllib
from urllib.request import urlopen, Request
from urllib.parse import quote

# ─── PARAMETERS ─────────────────────────────────────────────
site_input = IN[0]
radius_m = IN[1] if len(IN) > 1 and IN[1] else 300
categories = IN[2] if len(IN) > 2 and IN[2] else ["buildings", "roads", "coast", "amenities", "landuse"]

# Parse site data
if isinstance(site_input, str):
    site_data = json.loads(site_input)
elif isinstance(site_input, dict):
    site_data = site_input
else:
    # Fallback: Bay Street, Bridgetown
    site_data = {"location": {"latitude": 13.0969, "longitude": -59.6145}}

lat = site_data["location"]["latitude"]
lon = site_data["location"]["longitude"]

# ─── OVERPASS API QUERIES ───────────────────────────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Calculate bounding box from centre + radius
# 1 degree latitude ≈ 111,320m
# 1 degree longitude ≈ 111,320m × cos(lat)
lat_offset = radius_m / 111320
lon_offset = radius_m / (111320 * math.cos(math.radians(lat)))

bbox = f"{lat - lat_offset},{lon - lon_offset},{lat + lat_offset},{lon + lon_offset}"


def overpass_query(query_body, timeout=25):
    """Execute an Overpass API query and return parsed JSON."""
    full_query = f"[out:json][timeout:{timeout}];{query_body}out body;>;out skel qt;"
    url = f"{OVERPASS_URL}?data={quote(full_query)}"
    
    try:
        req = Request(url, headers={"User-Agent": "YOTEL-Masterplan/1.0"})
        response = urlopen(req, timeout=timeout)
        data = json.loads(response.read().decode('utf-8'))
        return data.get("elements", [])
    except Exception as e:
        return [{"error": str(e)}]


def latlon_to_local(node_lat, node_lon, ref_lat, ref_lon):
    """Convert lat/lon to local metres relative to reference point."""
    dx = (node_lon - ref_lon) * 111320 * math.cos(math.radians(ref_lat))
    dy = (node_lat - ref_lat) * 111320
    return round(dx, 2), round(dy, 2)


# ─── FETCH BUILDINGS ────────────────────────────────────────
buildings = []
if "buildings" in categories:
    query = f'way["building"]({bbox});'
    elements = overpass_query(query)
    
    # Build node lookup
    nodes = {}
    for e in elements:
        if e.get("type") == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
    
    for e in elements:
        if e.get("type") == "way" and "building" in e.get("tags", {}):
            tags = e.get("tags", {})
            pts = []
            for nid in e.get("nodes", []):
                if nid in nodes:
                    nlat, nlon = nodes[nid]
                    x, y = latlon_to_local(nlat, nlon, lat, lon)
                    pts.append({"x": x, "y": y})
            
            # Extract height
            height = None
            if "height" in tags:
                try:
                    height = float(tags["height"].replace("m", "").strip())
                except:
                    pass
            elif "building:levels" in tags:
                try:
                    height = float(tags["building:levels"]) * 3.2
                except:
                    pass
            
            buildings.append({
                "id": e["id"],
                "name": tags.get("name", ""),
                "type": tags.get("building", "yes"),
                "height_m": height,
                "levels": tags.get("building:levels"),
                "points": pts,
                "amenity": tags.get("amenity", ""),
                "tourism": tags.get("tourism", ""),
            })


# ─── FETCH ROADS ────────────────────────────────────────────
roads = []
if "roads" in categories:
    query = f'way["highway"]({bbox});'
    elements = overpass_query(query)
    
    nodes = {}
    for e in elements:
        if e.get("type") == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
    
    for e in elements:
        if e.get("type") == "way" and "highway" in e.get("tags", {}):
            tags = e.get("tags", {})
            pts = []
            for nid in e.get("nodes", []):
                if nid in nodes:
                    nlat, nlon = nodes[nid]
                    x, y = latlon_to_local(nlat, nlon, lat, lon)
                    pts.append({"x": x, "y": y})
            
            roads.append({
                "id": e["id"],
                "name": tags.get("name", ""),
                "highway": tags.get("highway", ""),
                "width": tags.get("width"),
                "lanes": tags.get("lanes"),
                "surface": tags.get("surface", ""),
                "oneway": tags.get("oneway", "no"),
                "points": pts,
            })


# ─── FETCH COASTLINE ────────────────────────────────────────
coastline = []
if "coast" in categories:
    # Natural coastline + water bodies
    query = f'(way["natural"="coastline"]({bbox});way["natural"="water"]({bbox});way["natural"="beach"]({bbox}););'
    elements = overpass_query(query)
    
    nodes = {}
    for e in elements:
        if e.get("type") == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
    
    for e in elements:
        if e.get("type") == "way":
            tags = e.get("tags", {})
            pts = []
            for nid in e.get("nodes", []):
                if nid in nodes:
                    nlat, nlon = nodes[nid]
                    x, y = latlon_to_local(nlat, nlon, lat, lon)
                    pts.append({"x": x, "y": y})
            
            coastline.append({
                "id": e["id"],
                "type": tags.get("natural", ""),
                "name": tags.get("name", ""),
                "points": pts,
            })


# ─── FETCH AMENITIES ───────────────────────────────────────
amenities = []
if "amenities" in categories:
    query = (f'(node["amenity"]({bbox});'
             f'node["tourism"]({bbox});'
             f'node["shop"]({bbox});'
             f'node["public_transport"]({bbox}););')
    elements = overpass_query(query)
    
    for e in elements:
        if e.get("type") == "node" and e.get("tags"):
            tags = e["tags"]
            x, y = latlon_to_local(e["lat"], e["lon"], lat, lon)
            amenities.append({
                "id": e["id"],
                "name": tags.get("name", ""),
                "type": tags.get("amenity") or tags.get("tourism") or tags.get("shop") or tags.get("public_transport", ""),
                "x": x, "y": y,
                "cuisine": tags.get("cuisine", ""),
                "stars": tags.get("stars", ""),
            })


# ─── FETCH LAND USE ─────────────────────────────────────────
landuse = []
if "landuse" in categories:
    query = f'(way["landuse"]({bbox});relation["landuse"]({bbox}););'
    elements = overpass_query(query)
    
    nodes = {}
    for e in elements:
        if e.get("type") == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
    
    for e in elements:
        if e.get("type") == "way" and "landuse" in e.get("tags", {}):
            tags = e.get("tags", {})
            pts = []
            for nid in e.get("nodes", []):
                if nid in nodes:
                    nlat, nlon = nodes[nid]
                    x, y = latlon_to_local(nlat, nlon, lat, lon)
                    pts.append({"x": x, "y": y})
            
            landuse.append({
                "id": e["id"],
                "use": tags.get("landuse", ""),
                "name": tags.get("name", ""),
                "points": pts,
            })


# ─── COMPILE CONTEXT DATA ──────────────────────────────────
context = {
    "query_centre": {"lat": lat, "lon": lon},
    "radius_m": radius_m,
    "bbox": bbox,
    "coordinate_system": "local_metres_from_site_centre",
    "buildings": {
        "count": len(buildings),
        "with_height": sum(1 for b in buildings if b["height_m"]),
        "items": buildings,
    },
    "roads": {
        "count": len(roads),
        "items": roads,
    },
    "coastline": {
        "count": len(coastline),
        "items": coastline,
    },
    "amenities": {
        "count": len(amenities),
        "restaurants": sum(1 for a in amenities if a["type"] in ("restaurant", "cafe", "bar")),
        "transport": sum(1 for a in amenities if a["type"] in ("bus_station", "ferry_terminal", "taxi")),
        "hotels": sum(1 for a in amenities if a["type"] == "hotel"),
        "items": amenities,
    },
    "landuse": {
        "count": len(landuse),
        "items": landuse,
    },
    "summary": {
        "total_elements": len(buildings) + len(roads) + len(coastline) + len(amenities) + len(landuse),
        "nearest_road": roads[0]["name"] if roads else "unknown",
        "nearest_road_type": roads[0]["highway"] if roads else "unknown",
        "max_nearby_building_height": max((b["height_m"] for b in buildings if b["height_m"]), default=0),
        "avg_nearby_building_height": (
            sum(b["height_m"] for b in buildings if b["height_m"]) / 
            max(1, sum(1 for b in buildings if b["height_m"]))
        ) if buildings else 0,
    }
}

# ─── BUILD DYNAMO GEOMETRY LISTS ────────────────────────────
# Building footprints as lists of Point
import clr
clr.AddReference('ProtoGeometry')
from Autodesk.DesignScript.Geometry import Point as DynPoint

building_footprints = []
for b in buildings:
    if len(b["points"]) >= 3:
        pts = [DynPoint.ByCoordinates(p["x"], p["y"], 0) for p in b["points"]]
        building_footprints.append(pts)

road_lines = []
for r in roads:
    if len(r["points"]) >= 2:
        pts = [DynPoint.ByCoordinates(p["x"], p["y"], 0) for p in r["points"]]
        road_lines.append(pts)

coast_pts = []
for c in coastline:
    for p in c["points"]:
        coast_pts.append(DynPoint.ByCoordinates(p["x"], p["y"], 0))

json_str = json.dumps(context, indent=2, default=str)

# ─── OUTPUT ─────────────────────────────────────────────────
OUT = [
    context,              # 0: Full context dictionary
    building_footprints,  # 1: List of point lists (building outlines)
    road_lines,           # 2: List of point lists (road centrelines)
    coast_pts,            # 3: Coastline points
    json_str,             # 4: JSON string for viewer
]
