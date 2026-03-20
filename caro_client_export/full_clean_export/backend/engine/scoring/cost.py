"""
Cost estimation model for Caribbean hotel development.
Sources: Turner & Townsend, Rider Levett Bucknall Caribbean,
BCQS Barbados, YOTEL investor presentation ($250k/key baseline).
"""

RATES = {
    # Construction (USD per m² GIA)
    "modular_per_m2": 2800,
    "ground_floor_premium": 1.25,     # 25% more for open-plan FOH/BOH
    "facade_per_m2": 650,             # curtain wall / cladding
    "rooftop_deck_per_m2": 450,       # outdoor terrace fit-out

    # Per-key
    "ffe_per_yt_key": 22000,          # FF&E per YOTEL room
    "ffe_per_pad_key": 30000,         # FF&E per YOTELPAD (kitchen, washer)
    "technology_per_key": 3500,       # SmartBed, keyless, PMS, WiFi

    # Fixed / site
    "land_usd": 3_500_000,
    "site_works_usd": 2_200_000,      # grading, utilities, foundations
    "soft_costs_pct": 0.08,           # A&E, permits, legal, franchise
    "contingency_pct": 0.065,         # 6.5% construction risk

    # Form multipliers (cost premium for non-rectangular)
    "form_multiplier": {
        "BAR": 1.00, "BAR_NS": 1.00,
        "L": 1.08,   # corner detailing, extra facade
        "U": 1.14,   # two corners, courtyard waterproofing
        "C": 1.11,   # one open end, partial courtyard
    },
}


def estimate_cost(metrics):
    """
    Estimate total development cost from option metrics.
    
    Args:
        metrics: dict with form, footprint_m2, gia_m2, yt_rooms, pad_units,
                 total_keys, total_facade_m2, outdoor_total_m2
    
    Returns:
        dict with total_usd, per_key_usd, and itemised breakdown
    """
    form = metrics.get("form", "BAR")
    keys = metrics.get("total_keys", 130)
    gia = metrics.get("gia_m2", 4620)
    fp = metrics.get("footprint_m2", 770)
    yt = metrics.get("yt_rooms", 100)
    pad = metrics.get("pad_units", 30)
    facade_area = metrics.get("total_facade_m2", 0)
    outdoor = metrics.get("outdoor_total_m2", 0)

    fm = RATES["form_multiplier"].get(form, 1.0)
    base = RATES["modular_per_m2"]

    # Construction
    ground_cost = fp * base * RATES["ground_floor_premium"] * fm
    upper_cost = (gia - fp) * base * fm
    construction = ground_cost + upper_cost

    # Facade
    facade_cost = facade_area * RATES["facade_per_m2"]

    # FF&E + Technology
    ffe = (yt * RATES["ffe_per_yt_key"] +
           pad * RATES["ffe_per_pad_key"] +
           keys * RATES["technology_per_key"])

    # Outdoor
    outdoor_cost = outdoor * RATES["rooftop_deck_per_m2"]

    # Hard costs subtotal
    hard = construction + facade_cost + ffe + outdoor_cost

    # Land + site
    land_site = RATES["land_usd"] + RATES["site_works_usd"]

    # Soft costs + contingency
    soft = hard * RATES["soft_costs_pct"]
    contingency = hard * RATES["contingency_pct"]

    total = hard + land_site + soft + contingency
    per_key = total / max(1, keys)

    return {
        "total_usd": round(total),
        "per_key_usd": round(per_key),
        "construction_usd": round(construction),
        "facade_usd": round(facade_cost),
        "ffe_tech_usd": round(ffe),
        "outdoor_usd": round(outdoor_cost),
        "land_site_usd": round(land_site),
        "soft_costs_usd": round(soft),
        "contingency_usd": round(contingency),
        "form_multiplier": fm,
    }
