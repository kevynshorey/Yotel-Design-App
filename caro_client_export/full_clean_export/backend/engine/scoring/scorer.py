"""
Transparent, weighted multi-criteria scoring.
Each criterion scores 0.0–1.0, multiplied by weight, summed to 0–100.
Weights are adjustable by the client.
"""

from typing import Any, Dict, Optional, Tuple

DEFAULT_WEIGHTS = {
    "room_count":     {"weight": 0.18, "desc": "Total keys vs 130 target. More = more revenue."},
    "gia_efficiency": {"weight": 0.14, "desc": "GIA per key. Sweet spot 33-38 m²/key."},
    "sea_views":      {"weight": 0.14, "desc": "West-facing facade length. More = more premium rooms."},
    "building_height":{"weight": 0.10, "desc": "Lower = easier planning approval."},
    "outdoor_amenity": {"weight": 0.10, "desc": "Total outdoor area (ground + roof + courtyard)."},
    "cost_per_key":   {"weight": 0.12, "desc": "Lower cost/key = better investment return."},
    "daylight_quality":{"weight": 0.08, "desc": "Natural light in corridors and rooms."},
    "pad_mix":        {"weight": 0.06, "desc": "YOTELPAD ratio. 20-28% is revenue-optimal."},
    "form_simplicity":{"weight": 0.08, "desc": "Simpler forms = lower cost, faster build."},
}


def score_option(opt: Dict[str, Any], weights: Optional[Dict[str, float]] = None) -> Tuple[float, Dict[str, Dict[str, Any]]]:
    """
    Score an option 0-100.
    
    Args:
        opt: dict with "metrics", "params", "warnings"
        weights: dict {criterion_name: float} — overrides DEFAULT_WEIGHTS
    
    Returns:
        (total_score: float, breakdown: dict)
        breakdown[criterion] = {"raw": float, "weighted": float, "reason": str}
    """
    w = weights or {k: v["weight"] for k, v in DEFAULT_WEIGHTS.items()}
    m = opt["metrics"]
    bd = {}

    # 1. Room count
    keys = m["total_keys"]
    if 120 <= keys <= 140:
        s, r = 1.0, f"{keys} keys — in target range"
    elif 100 <= keys < 120:
        s, r = 0.7 + (keys - 100) / 100, f"{keys} keys — slightly below target"
    elif keys > 140:
        s, r = max(0.5, 1.0 - (keys - 140) / 100), f"{keys} keys — above target"
    else:
        s, r = max(0.2, keys / 130), f"{keys} keys — below minimum viable"
    bd["room_count"] = {"raw": round(s, 3), "weighted": round(s * w.get("room_count", 0), 3), "reason": r}

    # 2. GIA efficiency
    gk = m.get("gia_per_key", 0)
    if 33 <= gk <= 38:
        s, r = 1.0, f"{gk} m²/key — optimal"
    elif 29 <= gk <= 42:
        s, r = 0.7, f"{gk} m²/key — acceptable"
    else:
        s, r = max(0.2, 1.0 - abs(gk - 35.5) / 35.5), f"{gk} m²/key — review layout"
    bd["gia_efficiency"] = {"raw": round(s, 3), "weighted": round(s * w.get("gia_efficiency", 0), 3), "reason": r}

    # 3. Sea views
    wf = m.get("west_facade_m", 0)
    s = min(1.0, wf / 50)
    r = f"{wf:.0f}m west facade"
    bd["sea_views"] = {"raw": round(s, 3), "weighted": round(s * w.get("sea_views", 0), 3), "reason": r}

    # 4. Building height
    h = m.get("building_height_m", 0)
    if h <= 21:
        s, r = 1.0, f"{h}m — within 6-storey envelope"
    elif h <= 25:
        s, r = 0.6, f"{h}m — needs 7+ storey approval"
    else:
        s, r = 0.2, f"{h}m — exceeds planning limit"
    bd["building_height"] = {"raw": round(s, 3), "weighted": round(s * w.get("building_height", 0), 3), "reason": r}

    # 5. Outdoor amenity
    outdoor = m.get("outdoor_total_m2", 0)
    s = min(1.0, outdoor / 900)
    r = f"{outdoor:.0f}m² total outdoor"
    bd["outdoor_amenity"] = {"raw": round(s, 3), "weighted": round(s * w.get("outdoor_amenity", 0), 3), "reason": r}

    # 6. Cost per key
    cpk = m.get("cost_per_key_usd", 250000)
    if cpk <= 230000:
        s, r = 1.0, f"${cpk:,.0f}/key — excellent"
    elif cpk <= 270000:
        s, r = 0.75, f"${cpk:,.0f}/key — on budget"
    elif cpk <= 320000:
        s, r = 0.5, f"${cpk:,.0f}/key — above target"
    else:
        s, r = 0.2, f"${cpk:,.0f}/key — review scope"
    bd["cost_per_key"] = {"raw": round(s, 3), "weighted": round(s * w.get("cost_per_key", 0), 3), "reason": r}

    # 7. Daylight quality
    ct = m.get("corridor_type", "double")
    form = m.get("form", "BAR")
    if ct == "single":
        s, r = 1.0, "Single-loaded — natural light throughout"
    elif form in ("U", "C"):
        s, r = 0.75, f"{form}-shape with courtyard daylight"
    elif form == "L":
        s, r = 0.65, "L-shape — some corner daylight"
    else:
        s, r = 0.5, "Double-loaded bar — standard corridors"
    bd["daylight_quality"] = {"raw": round(s, 3), "weighted": round(s * w.get("daylight_quality", 0), 3), "reason": r}

    # 8. PAD mix
    pad_pct = m.get("pad_units", 0) / max(1, m.get("total_keys", 1))
    if 0.18 <= pad_pct <= 0.28:
        s, r = 1.0, f"{pad_pct*100:.0f}% PAD — revenue-optimal"
    elif 0.12 <= pad_pct <= 0.35:
        s, r = 0.7, f"{pad_pct*100:.0f}% PAD — acceptable"
    else:
        s, r = 0.4, f"{pad_pct*100:.0f}% PAD — outside ideal range"
    bd["pad_mix"] = {"raw": round(s, 3), "weighted": round(s * w.get("pad_mix", 0), 3), "reason": r}

    # 9. Form simplicity
    form_scores = {"BAR": 1.0, "BAR_NS": 1.0, "L": 0.75, "C": 0.6, "U": 0.5}
    s = form_scores.get(form, 0.5)
    r = f"{form} — {'simplest' if s >= 0.9 else 'moderate' if s >= 0.6 else 'complex'}"
    bd["form_simplicity"] = {"raw": round(s, 3), "weighted": round(s * w.get("form_simplicity", 0), 3), "reason": r}

    total = sum(v["weighted"] for v in bd.values())
    return round(total * 100, 1), bd
