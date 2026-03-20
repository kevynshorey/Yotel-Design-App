"""
Geospatial context fetch/clean utilities.

Active source:
- OpenStreetMap Overpass API

Schema is normalized for viewer use with local-metre coordinates.
"""

from __future__ import annotations

import json
import math
from typing import Any, Dict, List
from urllib.parse import quote
from urllib.request import Request, urlopen

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Requested default extent: 3x3km square with site centred.
DEFAULT_RADIUS_M = 1500


def latlon_to_local(node_lat: float, node_lon: float, ref_lat: float, ref_lon: float):
    """Convert lat/lon to local metres relative to reference point."""
    dx = (node_lon - ref_lon) * 111320 * math.cos(math.radians(ref_lat))
    dy = (node_lat - ref_lat) * 111320
    return round(dx, 3), round(dy, 3)


def make_bbox(lat: float, lon: float, radius_m: int):
    """Calculate bbox (south,west,north,east) from centre+radius."""
    lat_off = radius_m / 111320
    lon_off = radius_m / (111320 * max(1e-12, math.cos(math.radians(lat))))
    south, west, north, east = lat - lat_off, lon - lon_off, lat + lat_off, lon + lon_off
    return south, west, north, east


def bbox_string(lat: float, lon: float, radius_m: int):
    south, west, north, east = make_bbox(lat, lon, radius_m)
    return f"{south},{west},{north},{east}"


def _overpass_query(query_body: str, timeout: int = 60):
    full = f"[out:json][timeout:{timeout}];{query_body}out body;>;out skel qt;"
    url = f"{OVERPASS_URL}?data={quote(full)}"
    try:
        req = Request(url, headers={"User-Agent": "Barbados-App/OSM-Fetch/1.0"})
        resp = urlopen(req, timeout=timeout)
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("elements", [])
    except Exception:
        return []


def _nodes_lookup(elements: List[Dict[str, Any]]):
    return {
        e["id"]: (e["lat"], e["lon"])
        for e in elements
        if e.get("type") == "node" and "lat" in e and "lon" in e
    }


def _way_points(way: Dict[str, Any], nodes: Dict[int, Any], ref_lat: float, ref_lon: float):
    points = []
    for nid in way.get("nodes", []):
        if nid not in nodes:
            continue
        x, y = latlon_to_local(*nodes[nid], ref_lat, ref_lon)
        points.append({"x": x, "y": y})
    return points


def _clean_points(points: List[Dict[str, Any]]):
    cleaned = []
    for p in points or []:
        try:
            x = float(p["x"])
            y = float(p["y"])
        except Exception:
            continue
        cleaned.append({"x": round(x, 3), "y": round(y, 3)})
    return cleaned


def _clean_context(ctx: Dict[str, Any]):
    for key in ("buildings", "roads", "road_centerlines", "coastline", "landuse", "waterways"):
        rows = []
        for f in ctx.get(key, []):
            pts = _clean_points(f.get("points", []))
            if len(pts) < 2:
                continue
            out = dict(f)
            out["points"] = pts
            rows.append(out)
        ctx[key] = rows

    trees = []
    for t in ctx.get("trees", []):
        try:
            trees.append({"x": round(float(t["x"]), 3), "y": round(float(t["y"]), 3)})
        except Exception:
            continue
    ctx["trees"] = trees
    return ctx


def fetch_context(lat: float, lon: float, radius_m: int = DEFAULT_RADIUS_M):
    """
    Fetch OSM context in a viewer-ready schema for a 3x3km default window.
    """
    bbox = bbox_string(lat, lon, radius_m)
    south, west, north, east = make_bbox(lat, lon, radius_m)

    result: Dict[str, Any] = {
        "source": "osm_overpass",
        "centre": {"lat": lat, "lon": lon},
        "radius_m": radius_m,
        "bbox": {"south": south, "west": west, "north": north, "east": east},
        "coordinate_system": "local_metres_from_site_centre",
        "buildings": [],
        "roads": [],
        "road_centerlines": [],
        "coastline": [],
        "landuse": [],
        "waterways": [],
        "amenities": [],
        "trees": [],
        "terrain": {
            "status": "pending_external_source",
            "preferred_sources": ["copernicus_dem", "esri_elevation", "mapbox_terrain"],
        },
        "imagery": {
            "status": "pending_external_source",
            "preferred_sources": ["esri_world_imagery", "mapbox_satellite", "copernicus"],
        },
    }

    # Buildings
    elems = _overpass_query(f'way["building"]({bbox});')
    nodes = _nodes_lookup(elems)
    for e in elems:
        if e.get("type") != "way" or "building" not in e.get("tags", {}):
            continue
        tags = e.get("tags", {})
        points = _way_points(e, nodes, lat, lon)
        height = None
        if "height" in tags:
            try:
                height = float(str(tags["height"]).replace("m", "").strip())
            except Exception:
                height = None
        elif "building:levels" in tags:
            try:
                height = float(tags["building:levels"]) * 3.2
            except Exception:
                height = None
        result["buildings"].append(
            {
                "id": str(e["id"]),
                "name": tags.get("name", ""),
                "type": tags.get("building", "yes"),
                "height_m": height,
                "levels": tags.get("building:levels"),
                "points": points,
                "source": "osm_overpass",
            }
        )

    # Roads + centerlines
    elems = _overpass_query(f'way["highway"]({bbox});')
    nodes = _nodes_lookup(elems)
    for e in elems:
        if e.get("type") != "way" or "highway" not in e.get("tags", {}):
            continue
        tags = e.get("tags", {})
        points = _way_points(e, nodes, lat, lon)
        row = {
            "id": str(e["id"]),
            "name": tags.get("name", ""),
            "highway": tags.get("highway", ""),
            "lanes": tags.get("lanes"),
            "points": points,
            "source": "osm_overpass",
        }
        result["roads"].append(row)
        result["road_centerlines"].append(dict(row))

    # Coast + water + beaches
    elems = _overpass_query(
        f'(way["natural"="coastline"]({bbox});way["natural"="beach"]({bbox});way["waterway"]({bbox}););'
    )
    nodes = _nodes_lookup(elems)
    for e in elems:
        if e.get("type") != "way":
            continue
        tags = e.get("tags", {})
        points = _way_points(e, nodes, lat, lon)
        if tags.get("natural") in ("coastline", "beach"):
            result["coastline"].append(
                {
                    "id": str(e["id"]),
                    "type": tags.get("natural", ""),
                    "points": points,
                    "source": "osm_overpass",
                }
            )
        elif "waterway" in tags:
            result["waterways"].append(
                {
                    "id": str(e["id"]),
                    "type": tags.get("waterway", ""),
                    "points": points,
                    "source": "osm_overpass",
                }
            )

    # Land use
    elems = _overpass_query(f'way["landuse"]({bbox});')
    nodes = _nodes_lookup(elems)
    for e in elems:
        if e.get("type") != "way" or "landuse" not in e.get("tags", {}):
            continue
        tags = e.get("tags", {})
        result["landuse"].append(
            {
                "id": str(e["id"]),
                "type": tags.get("landuse", ""),
                "name": tags.get("name", ""),
                "points": _way_points(e, nodes, lat, lon),
                "source": "osm_overpass",
            }
        )

    # Amenities + trees
    elems = _overpass_query(f'(node["amenity"]({bbox});node["tourism"]({bbox});node["natural"="tree"]({bbox}););')
    for e in elems:
        if e.get("type") != "node":
            continue
        if "lat" not in e or "lon" not in e:
            continue
        x, y = latlon_to_local(e["lat"], e["lon"], lat, lon)
        tags = e.get("tags", {})
        if tags.get("natural") == "tree":
            result["trees"].append({"x": x, "y": y, "source": "osm_overpass"})
            continue
        if tags.get("amenity") or tags.get("tourism"):
            result["amenities"].append(
                {
                    "id": str(e["id"]),
                    "name": tags.get("name", ""),
                    "type": tags.get("amenity") or tags.get("tourism", ""),
                    "x": x,
                    "y": y,
                    "source": "osm_overpass",
                }
            )

    return _clean_context(result)
