"""
Room allocation logic.
Calculates how many rooms fit per floor, distributes room types by target mix.
"""

import math

# Room type databases
YT_TYPES = {
    "Premium":    {"nia": 16.7, "bay": 3.370, "pct": 0.60, "label": "YT Premium"},
    "Twin":       {"nia": 16.7, "bay": 3.370, "pct": 0.18, "label": "YT Twin"},
    "FirstClass": {"nia": 26.5, "bay": 5.055, "pct": 0.12, "label": "YT First Class"},
    "Accessible": {"nia": 26.5, "bay": 5.055, "pct": 0.10, "label": "YT Accessible"},
}

PAD_TYPES = {
    "Studio":     {"nia": 22.0, "bay": 3.670, "pct": 0.67, "label": "PAD Studio"},
    "OneBed":     {"nia": 32.0, "bay": 5.070, "pct": 0.20, "label": "PAD 1-Bed"},
    "TwoBed":     {"nia": 48.0, "bay": 6.670, "pct": 0.06, "label": "PAD 2-Bed"},
    "AccStudio":  {"nia": 27.0, "bay": 4.280, "pct": 0.07, "label": "PAD Accessible"},
}

# Brand constants
EXT_WALL_M = 0.400
CORE_LENGTH_M = 5.5


def rooms_per_floor(form_data, corridor_type, room_types):
    """
    Count rooms across all wings of a form.
    
    Args:
        form_data: dict from forms.generate_form() with "wings" list
        corridor_type: "double" or "single"
        room_types: YT_TYPES or PAD_TYPES dict
    
    Returns: int — total rooms per floor
    """
    total = 0
    avg_bay = sum(r["bay"] * r["pct"] for r in room_types.values())
    sides = 2 if corridor_type == "double" else 1

    for wing in form_data.get("wings", []):
        usable = wing["l"] - 2 * EXT_WALL_M - CORE_LENGTH_M
        if usable <= 0:
            continue
        bays = int(usable / avg_bay)
        total += bays * sides

    return max(1, total)


def make_floor_mix(total_per_floor, room_types):
    """
    Distribute room types across a floor based on target percentages.
    
    Args:
        total_per_floor: int — how many rooms on this floor
        room_types: dict of {type_name: {pct: float, ...}}
    
    Returns: dict {type_name: count} — only types with count > 0
    """
    mix = {}
    allocated = 0
    items = list(room_types.items())
    
    for i, (rtype, spec) in enumerate(items):
        if i == len(items) - 1:
            count = total_per_floor - allocated
        else:
            count = max(0, round(total_per_floor * spec["pct"]))
        mix[rtype] = max(0, count)
        allocated += mix[rtype]
    
    return {k: v for k, v in mix.items() if v > 0}


def build_floor_programme(params, yt_per_floor, pad_per_floor):
    """
    Build floor-by-floor programme with room mixes.
    
    Returns list of floor dicts with level, type, label, rooms, etc.
    """
    floors = []
    foh_pct = params.get("ground_foh_pct", 0.60)
    ground_gia = params["length_m"] * params["width_m"]

    # Ground floor
    floors.append({
        "level": 0, "type": "ground",
        "label": "Ground Floor — FOH + BOH",
        "gia_m2": round(ground_gia),
        "foh_m2": round(ground_gia * foh_pct),
        "boh_m2": round(ground_gia * (1 - foh_pct)),
        "rooms": [], "mix": {},
    })

    # YOTEL floors
    yt_remaining = params.get("yt_rooms", 100)
    yt_floor_count = math.ceil(yt_remaining / max(1, yt_per_floor))
    for i in range(yt_floor_count):
        this_floor = min(yt_per_floor, yt_remaining)
        mix = make_floor_mix(this_floor, YT_TYPES)
        floors.append({
            "level": i + 1, "type": "yotel",
            "label": f"Floor {i + 1} — YOTEL ({this_floor} rooms)",
            "rooms": [{"type": k, "count": v} for k, v in mix.items()],
            "mix": mix, "total": this_floor,
        })
        yt_remaining -= this_floor

    # YOTELPAD floors
    pad_remaining = params.get("pad_units", 30)
    pad_floor_count = math.ceil(pad_remaining / max(1, pad_per_floor))
    for i in range(pad_floor_count):
        this_floor = min(pad_per_floor, pad_remaining)
        mix = make_floor_mix(this_floor, PAD_TYPES)
        lvl = yt_floor_count + 1 + i
        floors.append({
            "level": lvl, "type": "yotelpad",
            "label": f"Floor {lvl} — YOTELPAD ({this_floor} units)",
            "rooms": [{"type": k, "count": v} for k, v in mix.items()],
            "mix": mix, "total": this_floor,
        })
        pad_remaining -= this_floor

    return floors
