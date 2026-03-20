"""
Building form geometry generator.
Derives wing geometry from form type + target floor area + wing width.
Forms: BAR, BAR_NS, L, U, C
"""

SITE = {
    "area_m2": 3599.1, "length_m": 79.84, "width_m": 48.69,
    "max_coverage_pct": 50, "min_setback_m": 0,  # already offset
}


def generate_form(form_type, target_floor_area, wing_width, **kwargs):
    """
    Generate building geometry for a given form type.
    
    Args:
        form_type: "BAR" | "BAR_NS" | "L" | "U" | "C"
        target_floor_area: target m² per floor
        wing_width: building wing depth (m)
    
    Returns dict with wings, footprint_m2, west_facade_m, total_facade_m,
    courtyard_m2, bounding_L, bounding_W.
    """
    W = wing_width
    max_L = SITE["length_m"] - 2 * SITE["min_setback_m"]
    max_W = SITE["width_m"] - 2 * SITE["min_setback_m"]

    if form_type == "BAR":
        L = min(round(target_floor_area / W), max_L)
        return {
            "form": "BAR",
            "wings": [{"x": 0, "y": 0, "l": L, "w": W, "dir": "EW", "label": "Main Bar"}],
            "footprint_m2": round(L * W, 1),
            "west_facade_m": round(W, 1),
            "total_facade_m": round(2 * (L + W), 1),
            "courtyard_m2": 0,
            "bounding_L": L, "bounding_W": W,
        }

    elif form_type == "BAR_NS":
        L = min(round(target_floor_area / W), max_W)
        return {
            "form": "BAR_NS",
            "wings": [{"x": 0, "y": 0, "l": L, "w": W, "dir": "NS", "label": "Main Bar (N-S)"}],
            "footprint_m2": round(L * W, 1),
            "west_facade_m": round(L, 1),  # long side faces west
            "total_facade_m": round(2 * (L + W), 1),
            "courtyard_m2": 0,
            "bounding_L": W, "bounding_W": L,
        }

    elif form_type == "L":
        La = min(round(target_floor_area * 0.6 / W), max_L)
        Lb = min(round(target_floor_area * 0.4 / W), max_W)
        fp = La * W + Lb * W - W * W
        return {
            "form": "L",
            "wings": [
                {"x": 0, "y": 0, "l": La, "w": W, "dir": "EW", "label": "Wing A (E-W)"},
                {"x": La - W, "y": 0, "l": Lb, "w": W, "dir": "NS", "label": "Wing B (N-S)"},
            ],
            "footprint_m2": round(fp, 1),
            "west_facade_m": round(W + Lb, 1),
            "total_facade_m": round(2 * La + 2 * Lb, 1),
            "courtyard_m2": 0,
            "bounding_L": La, "bounding_W": Lb + W,
        }

    elif form_type == "U":
        Lw = round(target_floor_area / 3 / W)
        gap = max(8, Lw)
        fp = 2 * Lw * W + (gap + 2 * W) * W - 2 * W * W
        return {
            "form": "U",
            "wings": [
                {"x": 0, "y": 0, "l": Lw, "w": W, "dir": "EW", "label": "South Wing"},
                {"x": 0, "y": gap + W, "l": Lw, "w": W, "dir": "EW", "label": "North Wing"},
                {"x": Lw - W, "y": 0, "l": gap + 2 * W, "w": W, "dir": "NS", "label": "East Connector"},
            ],
            "footprint_m2": round(fp, 1),
            "west_facade_m": round(gap + 2 * W, 1),
            "total_facade_m": round(4 * Lw + 2 * (gap + 2 * W), 1),
            "courtyard_m2": round(Lw * gap, 1),
            "bounding_L": Lw, "bounding_W": gap + 2 * W,
        }

    elif form_type == "C":
        Lw = round(target_floor_area / 3 / W)
        gap = max(8, Lw)
        fp = 2 * Lw * W + (gap + 2 * W) * W - 2 * W * W
        return {
            "form": "C",
            "wings": [
                {"x": 0, "y": 0, "l": Lw, "w": W, "dir": "EW", "label": "South Wing"},
                {"x": 0, "y": gap + W, "l": Lw, "w": W, "dir": "EW", "label": "North Wing"},
                {"x": 0, "y": 0, "l": gap + 2 * W, "w": W, "dir": "NS", "label": "West Connector"},
            ],
            "footprint_m2": round(fp, 1),
            "west_facade_m": round(gap + 2 * W, 1),
            "total_facade_m": round(4 * Lw + 2 * (gap + 2 * W), 1),
            "courtyard_m2": round((Lw - W) * gap, 1),
            "bounding_L": Lw, "bounding_W": gap + 2 * W,
        }

    return None
