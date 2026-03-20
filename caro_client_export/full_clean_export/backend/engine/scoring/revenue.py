"""
Revenue projection model for YOTEL + YOTELPAD Barbados.
Sources: YOTEL Barbados Investor Presentation (Feb 2026),
Caribbean hotel market data (2025 YTD).

Projects 5-year revenue, GOP, NOI from option metrics.
Feeds into scorer as an additional criterion.
"""

# ADR and occupancy trajectories (from investor presentation)
YOTEL_TRAJECTORY = {
    # year: (occupancy, adr_usd)
    1: (0.55, 155),   # opening year (partial, conservative)
    2: (0.72, 185),
    3: (0.78, 195),   # stabilised
    4: (0.78, 203),
    5: (0.79, 211),
}

YOTELPAD_TRAJECTORY = {
    1: (0.60, 220),
    2: (0.72, 255),
    3: (0.75, 270),   # stabilised
    4: (0.75, 281),
    5: (0.76, 292),
}

# Ancillary revenue per occupied room night
FNB_PER_OCCUPIED_ROOM = 45    # rooftop bar, restaurant, grab+go
OTHER_PER_OCCUPIED_ROOM = 12  # parking, co-working, podcast/gaming

# Operating cost ratios (% of total revenue)
OPEX_RATIOS = {
    "rooms_expense":    0.139,
    "fnb_expense":      0.125,
    "sales_marketing":  0.070,
    "ga_tech":          0.090,   # tech-enabled lean ops
    "pom_utilities":    0.060,
    "management_fee":   0.075,
}

# Below GOP
FFR_RESERVE_PCT = 0.04         # 4% FF&R reserve
INSURANCE_TAX_PCT = 0.112      # ~11.2% of revenue


def project_revenue(yt_rooms, pad_units, years=5):
    """
    Project annual revenue, GOP, and NOI for a given room mix.
    
    Args:
        yt_rooms: number of YOTEL rooms
        pad_units: number of YOTELPAD units
        years: projection horizon (default 5)
    
    Returns:
        list of yearly dicts + summary dict
    """
    total_keys = yt_rooms + pad_units
    projections = []
    
    for year in range(1, years + 1):
        yt_occ, yt_adr = YOTEL_TRAJECTORY.get(year, YOTEL_TRAJECTORY[5])
        pad_occ, pad_adr = YOTELPAD_TRAJECTORY.get(year, YOTELPAD_TRAJECTORY[5])
        
        # Room nights (365 days, adjusted for opening year)
        days = 210 if year == 1 else 365  # partial first year (June opening)
        
        yt_room_nights = yt_rooms * days * yt_occ
        pad_room_nights = pad_units * days * pad_occ
        total_room_nights = yt_room_nights + pad_room_nights
        
        # Revenue
        yt_rooms_rev = yt_room_nights * yt_adr
        pad_rooms_rev = pad_room_nights * pad_adr
        total_rooms_rev = yt_rooms_rev + pad_rooms_rev
        
        fnb_rev = total_room_nights * FNB_PER_OCCUPIED_ROOM
        other_rev = total_room_nights * OTHER_PER_OCCUPIED_ROOM
        total_rev = total_rooms_rev + fnb_rev + other_rev
        
        # Operating expenses
        total_opex = sum(total_rev * r for r in OPEX_RATIOS.values())
        
        # GOP
        gop = total_rev - total_opex
        gop_margin = gop / total_rev if total_rev > 0 else 0
        
        # NOI
        ffr = total_rev * FFR_RESERVE_PCT
        ins_tax = total_rev * INSURANCE_TAX_PCT
        noi = gop - ffr - ins_tax
        
        # RevPAR
        yt_revpar = yt_adr * yt_occ
        pad_revpar = pad_adr * pad_occ
        blended_revpar = total_rooms_rev / (total_keys * days) if total_keys * days > 0 else 0
        
        projections.append({
            "year": year,
            "days": days,
            "yt_occ": yt_occ, "yt_adr": yt_adr,
            "pad_occ": pad_occ, "pad_adr": pad_adr,
            "yt_room_nights": round(yt_room_nights),
            "pad_room_nights": round(pad_room_nights),
            "rooms_revenue": round(total_rooms_rev),
            "fnb_revenue": round(fnb_rev),
            "other_revenue": round(other_rev),
            "total_revenue": round(total_rev),
            "total_opex": round(total_opex),
            "gop": round(gop),
            "gop_margin": round(gop_margin, 3),
            "noi": round(noi),
            "yt_revpar": round(yt_revpar, 1),
            "pad_revpar": round(pad_revpar, 1),
            "blended_revpar": round(blended_revpar, 1),
        })
    
    # Summary
    stabilised = projections[2] if len(projections) >= 3 else projections[-1]
    five_year_rev = sum(p["total_revenue"] for p in projections)
    five_year_noi = sum(p["noi"] for p in projections)
    
    summary = {
        "total_keys": total_keys,
        "yt_rooms": yt_rooms,
        "pad_units": pad_units,
        "stabilised_year": 3,
        "stabilised_revenue": stabilised["total_revenue"],
        "stabilised_gop": stabilised["gop"],
        "stabilised_gop_margin": stabilised["gop_margin"],
        "stabilised_noi": stabilised["noi"],
        "stabilised_revpar": stabilised["blended_revpar"],
        "five_year_total_revenue": five_year_rev,
        "five_year_total_noi": five_year_noi,
        "noi_per_key": round(stabilised["noi"] / total_keys) if total_keys > 0 else 0,
    }
    
    return projections, summary


def revenue_score(metrics):
    """
    Score an option's revenue potential (0.0–1.0).
    Used as optional criterion in scorer.
    
    Scoring logic:
      - Stabilised NOI/key: $20k+ = 1.0, $15k = 0.7, <$10k = 0.3
      - Stabilised GOP margin: 44%+ = 1.0, 38% = 0.7, <32% = 0.3
      - Blended RevPAR: $150+ = 1.0, $120 = 0.7, <$90 = 0.3
    """
    yt = metrics.get("yt_rooms", 100)
    pad = metrics.get("pad_units", 30)
    
    _, summary = project_revenue(yt, pad)
    
    noi_per_key = summary["noi_per_key"]
    gop_margin = summary["stabilised_gop_margin"]
    revpar = summary["stabilised_revpar"]
    
    # NOI/key score
    if noi_per_key >= 20000:
        s1 = 1.0
    elif noi_per_key >= 15000:
        s1 = 0.7
    elif noi_per_key >= 10000:
        s1 = 0.5
    else:
        s1 = 0.3
    
    # GOP margin score
    if gop_margin >= 0.44:
        s2 = 1.0
    elif gop_margin >= 0.38:
        s2 = 0.7
    else:
        s2 = 0.3
    
    # RevPAR score
    if revpar >= 150:
        s3 = 1.0
    elif revpar >= 120:
        s3 = 0.7
    elif revpar >= 90:
        s3 = 0.5
    else:
        s3 = 0.3
    
    # Weighted blend
    score = s1 * 0.4 + s2 * 0.3 + s3 * 0.3
    
    reason = (f"NOI/key ${noi_per_key:,}, "
              f"GOP {gop_margin:.0%}, "
              f"RevPAR ${revpar:.0f}")
    
    return round(score, 3), reason, summary
