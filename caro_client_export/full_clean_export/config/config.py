
# ─────────────────────────────────────────────────────────
# 0. COORDINATE CONVENTION
# ─────────────────────────────────────────────────────────
# +X = EAST  (inland)
# -X = WEST  (toward Carlisle Bay / beach)
# +Y = NORTH
# -Y = SOUTH
# Z  = UP
# The WEST face (-X) of the building = beach-facing side
# Outdoor space attaches to the WEST (min-X) edge

# ─────────────────────────────────────────────────────────
# 1. SITE BOUNDARY (hierarchy root — may change)
# ─────────────────────────────────────────────────────────
SITE = {
    "name": "Woodside, Bay Street, Bridgetown",
    "gross_area_m2": 3250,           # estimated 3,000–3,500; midpoint
    "net_area_m2": 3000,             # after access roads / easements
    "max_coverage_pct": 0.50,        # Class VI regulation
    "project_coverage_pct": 0.26,    # 770 / 3000
    "max_height_storeys": 6,         # Ground + 5 upper
    "max_height_m": 21.0,            # to parapet incl plant screen
    "setback_side_m": 3.0,           # min side/rear
    "setback_front_m": 6.5,          # Bay Street building line (est.)
    "coastal_setback_m": 0,          # second-line plot — not applicable
    "is_heritage": False,
    # Approximate boundary polygon (m) — origin at SW corner
    # Simplified from survey for parametric use; replace with exact coords
    "boundary_pts": [
        (0, 0),        # SW corner (Bay Street / south)
        (27, 0),       # along Bay Street frontage
        (70, 5),       # widens east
        (70, 55),      # NE corner
        (5, 55),       # NW corner
        (0, 27),       # back to Bay Street
    ],
    # Pre-offset boundary (already cleaned, as user stated)
    "offset_applied_m": 3.0,
}

# ─────────────────────────────────────────────────────────
# 2. BUILDING FOOTPRINT (derived from boundary)
# ─────────────────────────────────────────────────────────
BUILDING = {
    "length_m": 55.0,               # east–west (long axis)
    "width_m": 14.0,                # north–south (dual aspect)
    "footprint_m2": 770,            # 55 × 14
    "storeys": 6,                   # G + 5 upper
    "floor_to_floor_m": 3.2,        # min 3.0 per brand std; 3.2 typical
    "ground_floor_height_m": 4.5,   # target for Komyuniti (min 3.0, target 4.5)
    "total_height_m": 20.5,         # 4.5 + 5×3.2 = 20.5
    "orientation_deg": 0,           # 0 = long axis runs E–W
    # Footprint placed at origin for clarity
    "origin": (0, 0, 0),            # SW corner of building
    # West face = min-X = beach side
}

# ─────────────────────────────────────────────────────────
# 3. OUTDOOR SPACE (adjacent to west / beach side)
# ─────────────────────────────────────────────────────────
OUTDOOR = {
    "name": "Deck / Terrace / Pool Zone",
    "position": "WEST",             # attaches to min-X face
    "width_m": 12.0,                # depth from building face westward
    "length_m": 55.0,               # matches building length (or subset)
    "area_m2": 660,                 # 12 × 55
    "includes_pool": True,
    "includes_bar": True,           # rooftop bar also separate
    "ground_level": True,
    "rooftop_deck": True,           # "The Deck" on roof
}

# ─────────────────────────────────────────────────────────
# 4. ROOM / UNIT TYPES — from YOTEL Feasibility Guidelines D01-C08
# ─────────────────────────────────────────────────────────

# YOTEL Room Types (short stay, 1–5 nights)
YOTEL_ROOMS = {
    "Premium": {
        "label": "Premium Queen",
        "nia_m2": 16.7,
        "clear_w_mm": 3100,
        "clear_d_mm": 5400,
        "bay_w_mm": 3370,           # overall module width
        "bays": 1,
        "bed": "Queen SmartBed",
        "has_shower": True,
        "has_wc": True,             # separate cubicle
        "colour": "#7B2D8E",        # YOTEL purple
    },
    "Twin": {
        "label": "Premium Twin",
        "nia_m2": 16.7,
        "clear_w_mm": 3100,
        "clear_d_mm": 5400,
        "bay_w_mm": 3370,
        "bays": 1,
        "bed": "Twin SmartBeds",
        "has_shower": True,
        "has_wc": True,
        "colour": "#9B59B6",
    },
    "FirstClass": {
        "label": "First Class",
        "nia_m2": 26.5,
        "clear_w_mm": 4900,
        "clear_d_mm": 5400,
        "bay_w_mm": 5055,           # 1.5 bays
        "bays": 1.5,
        "bed": "King SmartBed + Sofa",
        "has_shower": True,
        "has_wc": True,
        "colour": "#6C3483",
    },
    "Accessible": {
        "label": "Accessible",
        "nia_m2": 26.5,
        "clear_w_mm": 4900,
        "clear_d_mm": 5400,
        "bay_w_mm": 5055,
        "bays": 1.5,
        "bed": "Queen SmartBed",
        "has_shower": True,         # roll-in shower
        "has_wc": True,
        "colour": "#2ECC71",
    },
    "Compact": {
        "label": "Compact",
        "nia_m2": 12.5,
        "clear_w_mm": 3100,
        "clear_d_mm": 4050,
        "bay_w_mm": 3370,
        "bays": 1,
        "bed": "Queen SmartBed",
        "has_shower": True,
        "has_wc": True,
        "colour": "#E74C3C",
    },
}

# YOTELPAD Unit Types (extended stay, 1 day – 1 year)
YOTELPAD_UNITS = {
    "Studio": {
        "label": "PAD Studio",
        "nia_m2": 22.0,
        "clear_w_mm": 3425,
        "clear_d_mm": 6700,
        "bay_w_mm": 3670,           # from Anytown plans (some docs say 4120 overall)
        "bays": 1,
        "bed": "SmartBed (Queen)",
        "has_kitchen": True,
        "has_shower": True,
        "has_wc": True,
        "has_washer": False,        # communal Wash+Go
        "colour": "#F39C12",
    },
    "OneBed": {
        "label": "PAD 1-Bedroom",
        "nia_m2": 32.0,
        "clear_w_mm": 4800,
        "clear_d_mm": 7070,
        "bay_w_mm": 5070,
        "bays": 1.5,
        "bed": "SmartBed + Murphy Sofa",
        "has_kitchen": True,
        "has_shower": True,
        "has_wc": True,
        "has_washer": True,
        "colour": "#E67E22",
    },
    "TwoBed": {
        "label": "PAD 2-Bedroom",
        "nia_m2": 48.0,
        "clear_w_mm": 6400,
        "clear_d_mm": 7070,
        "bay_w_mm": 6670,
        "bays": 2,
        "bed": "SmartBed × 2",
        "has_kitchen": True,
        "has_shower": True,
        "has_wc": True,
        "has_washer": True,
        "colour": "#D35400",
    },
    "AccessibleStudio": {
        "label": "PAD Accessible",
        "nia_m2": 27.0,
        "clear_w_mm": 4010,
        "clear_d_mm": 6700,
        "bay_w_mm": 4280,
        "bays": 1.2,
        "bed": "SmartBed (Queen)",
        "has_kitchen": True,
        "has_shower": True,         # roll-in
        "has_wc": True,
        "has_washer": False,
        "colour": "#27AE60",
    },
}

# ─────────────────────────────────────────────────────────
# 5. PROGRAMME — Barbados 130-key mix
# ─────────────────────────────────────────────────────────
PROGRAMME = {
    "total_keys": 130,
    "yotel_keys": 100,
    "yotelpad_keys": 30,
    # Floor allocation (from feasibility doc)
    "ground": {
        "use": "FOH + BOH",
        "gia_m2": 770,
        "rooms": 0,
    },
    "yotel_floors": {
        "floors": [1, 2, 3],
        "rooms_per_floor": 33,      # ~33 per dual-aspect floor
        "mix_per_floor": {
            "Premium": 20,
            "Twin": 6,
            "FirstClass": 4,
            "Accessible": 3,
        },
        "total": 100,               # includes 1 extra accessible
    },
    "yotelpad_floors": {
        "floors": [4, 5],
        "units_per_floor": 15,
        "mix_per_floor": {
            "Studio": 10,
            "OneBed": 3,
            "TwoBed": 1,
            "AccessibleStudio": 1,
        },
        "total": 30,
    },
    "rooftop": {
        "use": "Plant + Deck (optional terrace)",
        "gia_m2": 80,
    },
}

# ─────────────────────────────────────────────────────────
# 6. BUILDING SYSTEMS — from brand standards
# ─────────────────────────────────────────────────────────
CONSTRUCTION = {
    "type": "Prefab modular on steel frame",
    "ext_wall_mm": 400,
    "modular_partition_mm": 270,
    "internal_wall_mm": 200,
    "corridor_width_mm": 1600,
    "floor_ceiling_mm": 500,        # room floor/ceiling build-up
    "bathroom_floor_ceiling_mm": 800,
    "corridor_floor_ceiling_mm": 700,
    "min_room_ceiling_mm": 2500,
    "min_bathroom_ceiling_mm": 2200,
    "min_pad_ceiling_mm": 2600,
    "min_pad_bathroom_ceiling_mm": 2300,
    "min_corridor_ceiling_mm": 2300,
    "max_module_length_mm": 17500,
    "max_module_width_mm": 4500,
    "max_module_height_mm": 3500,
}

# ─────────────────────────────────────────────────────────
# 7. CORE / CIRCULATION
# ─────────────────────────────────────────────────────────
CORE = {
    "area_per_floor_m2": 40,        # from feasibility doc
    "guest_lifts": 2,               # 1 + 1 per 100 rooms
    "boh_lifts": 1,                 # 1 per 300 rooms
    "staircases": 2,                # one each end, fire code
    "max_dead_end_m": 10,
    "max_travel_distance_m": 35,
    "linen_chute": True,
    "linen_store_per_floor_m2": 13,
    "lan_room_per_floor_m2": 1,
}

# ─────────────────────────────────────────────────────────
# 8. FOH / BOH AREAS — Ground Floor (from Anytown, scaled)
# ─────────────────────────────────────────────────────────
FOH = {
    "Mission_Control_m2": 50,
    "Komyuniti_m2": 245,
    "Hub_m2": 14,                   # × 2
    "Gym_m2": 55,
    "Public_WC_m2": 27,
    "Luggage_m2": 19,
    "GrabGo": "integrated into Komyuniti",
    "Podcast_Studio_m2": 15,        # Barbados-specific plug-in
    "Gaming_Lounge_m2": 25,         # Barbados-specific plug-in
}

BOH = {
    "Kitchen_m2": 47,
    "Cold_Storage_m2": 13,
    "Dry_Storage_m2": 9,
    "Bar_Storage_m2": 9,
    "Administration_m2": 40,
    "Crew_Room_m2": 26,
    "Crew_Facilities_m2": 38,
    "Housekeeping_m2": 42,
    "FixIt_m2": 18,
    "Plant_m2": 60,
    "IT_Server_m2": 8,
    "Waste_m2": 18,
    "General_Storage_m2": 10,
}

# ─────────────────────────────────────────────────────────
# 9. FINANCIAL PARAMETERS (from investor presentation)
# ─────────────────────────────────────────────────────────
FINANCIALS = {
    "total_investment_usd": 32_500_000,
    "cost_per_key_usd": 250_000,
    "land_usd": 3_500_000,
    "prefab_modules_usd": 14_300_000,
    "ffe_tech_usd": 3_250_000,
    "yotel_adr_stabilised_usd": 195,
    "yotelpad_adr_stabilised_usd": 270,
    "yotel_occ_stabilised": 0.78,
    "yotelpad_occ_stabilised": 0.75,
    "gop_margin": 0.44,
    "projected_irr_pct": "17-21%",
}

# ─────────────────────────────────────────────────────────
# 10. SCORING METRICS for option comparison
# ─────────────────────────────────────────────────────────
SCORE_WEIGHTS = {
    "room_count":      0.20,
    "gia_efficiency":  0.15,  # GIA/key
    "sea_view_pct":    0.15,  # % rooms with west-facing view
    "building_height": 0.10,  # lower = better for planning
    "outdoor_ratio":   0.10,  # outdoor area / site area
    "far":             0.10,
    "cost_per_key":    0.10,
    "daylighting":     0.10,  # corridor natural light score
}

# ─────────────────────────────────────────────────────────
# 11. OPTION VARIABLES (what the options engine changes)
# ─────────────────────────────────────────────────────────
OPTION_VARIABLES = {
    "corridor_type": ["single_loaded", "double_loaded"],
    "yotel_room_count": range(80, 121, 10),
    "yotelpad_unit_count": range(20, 41, 5),
    "storeys": range(5, 9),
    "building_length_m": [45, 50, 55, 60],
    "building_width_m": [13.6, 14.0, 16.1],   # min dual-aspect widths
    "outdoor_position": ["WEST", "ROOFTOP", "BOTH"],
    "pad_on_top": [True, False],               # PAD above YOTEL or side-by-side
}


if __name__ == "__main__":
    total_gia = BUILDING["footprint_m2"] * BUILDING["storeys"]
    print(f"YOTEL + YOTELPAD Barbados — {PROGRAMME['total_keys']} keys")
    print(f"Building: {BUILDING['length_m']}m × {BUILDING['width_m']}m × {BUILDING['storeys']} storeys")
    print(f"Total GIA: {total_gia} m²  |  GIA/key: {total_gia/PROGRAMME['total_keys']:.1f} m²")
    print(f"Site coverage: {BUILDING['footprint_m2']/SITE['net_area_m2']*100:.0f}%")
    print(f"West face = BEACH (Carlisle Bay)")
