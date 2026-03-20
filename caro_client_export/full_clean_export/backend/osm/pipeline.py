"""
Multi-source geospatial context pipeline.

Active fetcher:
- OSM Overpass

Adapter stubs included for:
- Overture
- ESRI
- Copernicus
- Mapbox
- Places APIs
- DWG/DXF boundary import
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List

from .fetcher import fetch_context


def _merge_lists(base: Dict[str, Any], incoming: Dict[str, Any], keys: List[str]):
    for key in keys:
        base.setdefault(key, [])
        base[key].extend(incoming.get(key, []))


def _empty_context(lat: float, lon: float, radius_m: int):
    return {
        "centre": {"lat": lat, "lon": lon},
        "radius_m": radius_m,
        "coordinate_system": "local_metres_from_site_centre",
        "buildings": [],
        "roads": [],
        "road_centerlines": [],
        "coastline": [],
        "landuse": [],
        "waterways": [],
        "amenities": [],
        "trees": [],
        "terrain": {"status": "pending"},
        "imagery": {"status": "pending"},
        "sources_used": [],
        "warnings": [],
    }


def _load_json_source(path: str):
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _not_implemented(source_name: str):
    return {"_warning": f"Source adapter not implemented yet: {source_name}"}


def build_context(
    lat: float,
    lon: float,
    radius_m: int = 1500,
    sources: List[str] | None = None,
    local_source_files: List[str] | None = None,
):
    """
    Build stitched context from selected sources.
    """
    selected = sources or ["osm_overpass"]
    out = _empty_context(lat, lon, radius_m)
    geom_keys = [
        "buildings",
        "roads",
        "road_centerlines",
        "coastline",
        "landuse",
        "waterways",
        "amenities",
        "trees",
    ]

    if "osm_overpass" in selected:
        ctx = fetch_context(lat, lon, radius_m)
        _merge_lists(out, ctx, geom_keys)
        out["terrain"] = ctx.get("terrain", out["terrain"])
        out["imagery"] = ctx.get("imagery", out["imagery"])
        out["sources_used"].append("osm_overpass")

    # Adapter stubs requested by project.
    for source_name in ("overture", "esri", "copernicus", "mapbox", "places_api", "dwg"):
        if source_name in selected:
            warning = _not_implemented(source_name)["_warning"]
            out["warnings"].append(warning)
            out["sources_used"].append(source_name)

    for file_path in local_source_files or []:
        local_ctx = _load_json_source(file_path)
        if not local_ctx:
            out["warnings"].append(f"Could not load local source file: {file_path}")
            continue
        _merge_lists(out, local_ctx, geom_keys)
        out["sources_used"].append(f"file:{file_path}")

    return out
