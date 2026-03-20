"""
Single source of truth loader for design rules.

Note: This project currently has no YAML dependency installed.
`config/rules.yml` is therefore stored as a JSON-formatted object (valid YAML subset),
so we can load it using Python's built-in `json` without extra libraries.
"""

from __future__ import annotations

import json
import os
from copy import deepcopy
from typing import Any, Dict


def _project_root() -> str:
    # backend/engine/rules.py -> backend/engine -> backend -> project root
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def rules_path() -> str:
    return os.path.join(_project_root(), "config", "rules.yml")


DEFAULT_RULES: Dict[str, Any] = {
    "planning": {
        "max_coverage_pct": 50,
        "min_side_setback_m": 0,
        "max_height_m": 25.0,
        "site_area_m2": 3599.1,
        "site_length_m": 79.84,
        "site_width_m": 48.69,
    },
    "brand": {
        "dual_min_width_mm": 13600,
        "single_min_width_mm": 8000,
        "pad_dual_min_width_mm": 16100,
        "max_travel_m": 35,
        "min_accessible_pct": 0.05,
        "accessibility": {
            "yotel_accessible_pct_of_yt_rooms": 0.10,
            "yotel_accessible_type_name": "Accessible",
            "yotel_firstclass_pct_of_yt_rooms": 0.12,
            "yotelpad_accessible_pct_of_pad_units": 0.07,
            "yotelpad_accessible_type_name": "AccStudio",
        },
        "foh_lifts_per_100": 2,
        "min_komyuniti_m2": 150,
        "min_mission_control_m2": 35,
        "min_gym_m2": 40,
        "min_kitchen_m2": 35,
    },
    "circulation": {
        "min_corridor_clear_width_mm": 1600,
        "max_dead_end_corridor_length_m": 10,
        "max_travel_distance_m_two_directions": 35,
        "min_corridor_clear_height_mm": 2400,
        "luggage_clear_width_ideal_m": 1.6,
        "luggage_clear_turning_diameter_if_needed_m": 1.5,
    },
}


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively merge dicts (override wins)."""
    out = deepcopy(base)
    for k, v in (override or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def load_rules() -> Dict[str, Any]:
    """
    Load rules from `config/rules.yml` (JSON-formatted object).
    Falls back to DEFAULT_RULES if the file is missing or invalid.
    """
    path = rules_path()
    try:
        with open(path, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        if not isinstance(loaded, dict):
            return deepcopy(DEFAULT_RULES)
        return _deep_merge(DEFAULT_RULES, loaded)
    except FileNotFoundError:
        return deepcopy(DEFAULT_RULES)
    except Exception:
        # Keep the generator resilient; invalid rules shouldn't crash generation.
        return deepcopy(DEFAULT_RULES)


def normalize_rules(rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure required keys exist (and provide minimal type expectations).
    """
    r = deepcopy(rules or {})
    for section in DEFAULT_RULES.keys():
        if section not in r or not isinstance(r[section], dict):
            r[section] = deepcopy(DEFAULT_RULES[section])
    return r


def get_rules() -> Dict[str, Any]:
    """Convenience wrapper used by validator/scoring modules."""
    return normalize_rules(load_rules())

