"""
Caro Basic Data (client export)

Very small Python module that provides simple viewer defaults and layers.
No advanced engine logic.
"""

from __future__ import annotations

from typing import Dict, List


def get_default_toolbar_state() -> Dict[str, str]:
    """Return basic default toolbar selections."""
    return {"view": "3D", "style": "Real"}


def get_default_layers() -> List[Dict[str, object]]:
    """Return a very simple layer list for demo purposes."""
    return [
        {"key": "terrain", "label": "Terrain", "group": "Site", "color": "#B0B8A4", "enabled": True},
        {"key": "roads", "label": "Roads", "group": "Site", "color": "#BBBEC4", "enabled": False},
        {"key": "vegetation", "label": "Vegetation", "group": "Site", "color": "#3A6830", "enabled": False},
        {"key": "building", "label": "Building", "group": "Model", "color": "#2E8A76", "enabled": True},
        {"key": "outdoor", "label": "Outdoor", "group": "Model", "color": "#4E8E3E", "enabled": True},
        {"key": "context", "label": "Context Buildings", "group": "Context", "color": "#9CA4AE", "enabled": False},
    ]


def get_viewer_label(view: str, style: str) -> str:
    """Build a display label for the basic viewer."""
    return f"Caro Viewer - View: {view} - Style: {style}"


if __name__ == "__main__":
    state = get_default_toolbar_state()
    layers = get_default_layers()
    print(get_viewer_label(state["view"], state["style"]))
    print(f"Layers: {len(layers)}")
