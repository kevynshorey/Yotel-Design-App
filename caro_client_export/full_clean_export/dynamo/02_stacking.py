"""
MODULE 2 — 3D ROOM STACKING & ALLOCATION
==========================================
Dynamo CPython3 Node — generates floor-by-floor room layout
with correct YOTEL/YOTELPAD bay dimensions from brand standards.

INPUTS (wire from Dynamo):
  IN[0] = Building footprint PolyCurve (from Module 1)
  IN[1] = Building origin Point (from Module 1)
  IN[2] = Number of storeys override — default 6
  IN[3] = Custom room mix dict — optional

OUTPUTS:
  OUT[0] = List of floor solids (extruded per storey)
  OUT[1] = List of room solids (coloured by type)
  OUT[2] = Room schedule (nested list: [floor, room_type, bay_x, bay_y, area])
  OUT[3] = Summary metrics dict
  OUT[4] = Floor plan data (for 2D export)

STACKING LOGIC (from YOTEL D01-C08 §2.8):
  - 2 YOTELPAD Studios stack above 3 YOTEL Premiums (bay alignment)
  - 1 YOTELPAD 1-Bed stacks above 2 YOTEL Premiums
  - Column grid is consistent ground to roof — no transfer structures
  - YOTELPAD typically on uppermost storeys
"""

import clr
clr.AddReference('ProtoGeometry')
from Autodesk.DesignScript.Geometry import *

import math

# ─── CONFIGURATION ───────────────────────────────────────────────
# Room dimensions (mm → m)
ROOMS = {
    # YOTEL types
    "Premium":     {"w": 3.370, "d": 5.400, "nia": 16.7, "label": "YT Premium",    "rgb": (123,45,142)},
    "Twin":        {"w": 3.370, "d": 5.400, "nia": 16.7, "label": "YT Twin",       "rgb": (155,89,182)},
    "FirstClass":  {"w": 5.055, "d": 5.400, "nia": 26.5, "label": "YT First Class", "rgb": (108,52,131)},
    "Accessible":  {"w": 5.055, "d": 5.400, "nia": 26.5, "label": "YT Accessible",  "rgb": (46,204,113)},
    # YOTELPAD types
    "Studio":      {"w": 3.670, "d": 6.700, "nia": 22.0, "label": "PAD Studio",     "rgb": (243,156,18)},
    "OneBed":      {"w": 5.070, "d": 7.070, "nia": 32.0, "label": "PAD 1-Bed",      "rgb": (230,126,34)},
    "TwoBed":      {"w": 6.670, "d": 7.070, "nia": 48.0, "label": "PAD 2-Bed",      "rgb": (211,84,0)},
    "AccStudio":   {"w": 4.280, "d": 6.700, "nia": 27.0, "label": "PAD Accessible", "rgb": (39,174,96)},
}

# Construction constants
EXT_WALL = 0.400
CORRIDOR_W = 1.600
PARTITION = 0.270
FLOOR_H = 3.200     # typical upper floor
GROUND_H = 4.500    # ground floor

# ─── PARAMETERS ──────────────────────────────────────────────────
footprint = IN[0]
origin_pt = IN[1] if len(IN) > 1 and IN[1] else Point.ByCoordinates(12, 13.5, 0)
num_storeys = IN[2] if len(IN) > 2 and IN[2] else 6
custom_mix  = IN[3] if len(IN) > 3 and IN[3] else None

# Building dimensions
BLDG_LENGTH = 55.0
BLDG_WIDTH  = 14.0
ox = origin_pt.X
oy = origin_pt.Y

# ─── DEFAULT PROGRAMME ───────────────────────────────────────────
if custom_mix is None:
    floor_programme = {
        0: {"type": "ground", "label": "Ground Floor — FOH + BOH", "rooms": []},
        1: {"type": "yotel", "label": "Floor 1 — YOTEL",
            "rooms": [("Premium",20), ("Twin",6), ("FirstClass",4), ("Accessible",3)]},
        2: {"type": "yotel", "label": "Floor 2 — YOTEL",
            "rooms": [("Premium",20), ("Twin",6), ("FirstClass",4), ("Accessible",3)]},
        3: {"type": "yotel", "label": "Floor 3 — YOTEL",
            "rooms": [("Premium",21), ("Twin",6), ("FirstClass",4), ("Accessible",3)]},
        4: {"type": "yotelpad", "label": "Floor 4 — YOTELPAD",
            "rooms": [("Studio",10), ("OneBed",3), ("TwoBed",1), ("AccStudio",1)]},
        5: {"type": "yotelpad", "label": "Floor 5 — YOTELPAD",
            "rooms": [("Studio",10), ("OneBed",3), ("TwoBed",1), ("AccStudio",1)]},
    }
else:
    floor_programme = custom_mix

# ─── STEP 1: GENERATE FLOOR SLABS ───────────────────────────────
floor_solids = []
z = 0.0
for floor_idx in range(num_storeys):
    h = GROUND_H if floor_idx == 0 else FLOOR_H
    slab_base = Point.ByCoordinates(ox, oy, z)
    slab = Cuboid.ByLengths(
        Point.ByCoordinates(ox + BLDG_LENGTH/2, oy + BLDG_WIDTH/2, z + 0.15),
        BLDG_LENGTH, BLDG_WIDTH, 0.30  # 300mm slab
    )
    floor_solids.append(slab)
    z += h

# ─── STEP 2: LAYOUT ROOMS PER FLOOR ─────────────────────────────
all_room_solids = []
room_schedule = []
floor_plan_data = []

z = 0.0
for floor_idx in range(num_storeys):
    h = GROUND_H if floor_idx == 0 else FLOOR_H
    floor_info = floor_programme.get(floor_idx, {"type": "empty", "rooms": []})
    floor_rooms_data = []

    if floor_info["type"] == "ground":
        # Ground floor: FOH + BOH zones as single blocks
        # Komyuniti (west-facing, Bay Street side)
        komyuniti = Cuboid.ByLengths(
            Point.ByCoordinates(ox + 15, oy + BLDG_WIDTH/2, z + h/2),
            30, BLDG_WIDTH - 1, h - 0.5
        )
        all_room_solids.append({"solid": komyuniti, "type": "Komyuniti", "floor": 0})
        floor_rooms_data.append({
            "type": "Komyuniti", "x": ox, "y": oy, "w": 30, "d": BLDG_WIDTH,
            "label": "Komyuniti / Mission Control / Gym",
        })
        # BOH (east end)
        boh = Cuboid.ByLengths(
            Point.ByCoordinates(ox + 42.5, oy + BLDG_WIDTH/2, z + h/2),
            25, BLDG_WIDTH - 1, h - 0.5
        )
        all_room_solids.append({"solid": boh, "type": "BOH", "floor": 0})
        floor_rooms_data.append({
            "type": "BOH", "x": ox + 30, "y": oy, "w": 25, "d": BLDG_WIDTH,
            "label": "Kitchen / Admin / Plant / Crew",
        })

    elif floor_info["type"] in ("yotel", "yotelpad"):
        # Dual-aspect layout: rooms on SOUTH side, corridor, rooms on NORTH side
        room_list = floor_info["rooms"]
        
        # Calculate corridor Y position
        south_depth = ROOMS[room_list[0][0]]["d"] if room_list else 5.4
        corridor_y_start = oy + EXT_WALL + south_depth
        corridor_y_end = corridor_y_start + CORRIDOR_W
        north_room_y = corridor_y_end

        # Layout rooms along X axis
        # South side first, then north side
        cursor_x_south = ox + EXT_WALL
        cursor_x_north = ox + EXT_WALL

        room_idx = 0
        flat_rooms = []
        for rtype, count in room_list:
            for _ in range(count):
                flat_rooms.append(rtype)

        # Split rooms: half south, half north (approximately)
        half = len(flat_rooms) // 2
        south_rooms = flat_rooms[:half]
        north_rooms = flat_rooms[half:]

        # Reserve space for core (stairs + lifts) ~ 8m in the middle
        core_start_x = ox + BLDG_LENGTH/2 - 4
        core_end_x = ox + BLDG_LENGTH/2 + 4

        for side, side_rooms, cursor_x, room_y in [
            ("south", south_rooms, cursor_x_south, oy + EXT_WALL),
            ("north", north_rooms, cursor_x_north, north_room_y)
        ]:
            cx = cursor_x
            for rtype in side_rooms:
                rm = ROOMS[rtype]
                rw = rm["w"]
                rd = rm["d"]
                
                # Skip over core zone
                if cx < core_end_x and cx + rw > core_start_x:
                    cx = core_end_x + PARTITION

                if cx + rw > ox + BLDG_LENGTH - EXT_WALL:
                    break  # no more space on this side

                # Create room solid
                room_centre = Point.ByCoordinates(
                    cx + rw/2,
                    room_y + rd/2,
                    z + h/2
                )
                room_solid = Cuboid.ByLengths(room_centre, rw - 0.05, rd - 0.05, h - 0.6)
                all_room_solids.append({
                    "solid": room_solid,
                    "type": rtype,
                    "floor": floor_idx
                })

                room_schedule.append([
                    floor_idx, rtype, round(cx, 2), round(room_y, 2),
                    rm["nia"], rm["label"], side
                ])

                floor_rooms_data.append({
                    "type": rtype, "x": round(cx, 2), "y": round(room_y, 2),
                    "w": rw, "d": rd, "label": rm["label"], "side": side,
                    "nia": rm["nia"],
                })

                cx += rw + PARTITION

    floor_plan_data.append({
        "floor": floor_idx,
        "label": floor_info.get("label", f"Floor {floor_idx}"),
        "z": z,
        "height": h,
        "rooms": floor_rooms_data,
    })
    z += h

# ─── STEP 3: SUMMARY METRICS ────────────────────────────────────
total_yotel = sum(1 for r in room_schedule if r[1] in ("Premium","Twin","FirstClass","Accessible"))
total_pad = sum(1 for r in room_schedule if r[1] in ("Studio","OneBed","TwoBed","AccStudio"))
total_keys = total_yotel + total_pad
total_gia = BLDG_LENGTH * BLDG_WIDTH * num_storeys
total_nia = sum(r[4] for r in room_schedule)

metrics = {
    "total_keys": total_keys,
    "yotel_rooms": total_yotel,
    "yotelpad_units": total_pad,
    "total_gia_m2": round(total_gia, 0),
    "total_nia_m2": round(total_nia, 0),
    "gia_per_key": round(total_gia / max(total_keys, 1), 1),
    "nia_gia_ratio": round(total_nia / total_gia * 100, 1),
    "west_facing_rooms": sum(1 for r in room_schedule if r[1] in ("Premium","Studio") and r[6] == "south"),
    "building_height_m": GROUND_H + (num_storeys - 1) * FLOOR_H,
    "num_floors": num_storeys,
}

# ─── OUTPUT ──────────────────────────────────────────────────────
OUT = [
    floor_solids,
    [r["solid"] for r in all_room_solids],
    room_schedule,
    metrics,
    floor_plan_data,
]
