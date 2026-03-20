"""
Cache and persistence for geospatial context used by the web viewer.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG_OSM_DIR = os.path.join(PROJECT_ROOT, "config", "osm")
CACHE_DIR = os.path.join(CONFIG_OSM_DIR, "cache")
LATEST_CONTEXT_PATH = os.path.join(CONFIG_OSM_DIR, "osm_context.json")


def cache_path(lat: float, lon: float, radius: int):
    return os.path.join(CACHE_DIR, f"osm_cache_{lat:.4f}_{lon:.4f}_{radius}m.json")


def load_cache(lat: float, lon: float, radius: int, max_age_hours: int = 24):
    path = cache_path(lat, lon, radius)
    if not os.path.exists(path):
        return None
    age = time.time() - os.path.getmtime(path)
    if age > max_age_hours * 3600:
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _with_meta(data: Dict[str, Any], lat: float, lon: float, radius: int, from_cache: bool):
    out = dict(data)
    out["_meta"] = {
        "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
        "lat": lat,
        "lon": lon,
        "radius_m": radius,
        "from_cache": from_cache,
    }
    out["_from_cache"] = from_cache
    return out


def save_cache(lat: float, lon: float, radius: int, data: Dict[str, Any]):
    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(CONFIG_OSM_DIR, exist_ok=True)
    path = cache_path(lat, lon, radius)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(_with_meta(data, lat, lon, radius, False), f, indent=2)
    # Maintain latest stitched context for the viewer under config/osm.
    with open(LATEST_CONTEXT_PATH, "w", encoding="utf-8") as f:
        json.dump(_with_meta(data, lat, lon, radius, False), f, indent=2)
    return path


def fetch_with_cache(
    lat: float,
    lon: float,
    radius: int = 1500,
    max_age_hours: int = 24,
    sources=None,
    local_source_files=None,
):
    """
    Fetch context data, preferring fresh cache, and persist to config/osm.
    """
    cached = load_cache(lat, lon, radius, max_age_hours)
    if cached:
        cached["_from_cache"] = True
        return cached

    from .pipeline import build_context

    data = build_context(lat, lon, radius, sources=sources, local_source_files=local_source_files)
    save_cache(lat, lon, radius, data)
    data["_from_cache"] = False
    return data
