"""
Export preparation helpers for engine outputs.
"""

import json

from backend.engine.scoring.scorer import DEFAULT_WEIGHTS


def export_json(options, groups, filepath):
    """Export options as JSON for the React viewer."""
    data = {
        "project": {
            "name": "YOTEL+YOTELPAD Barbados",
            "client": "Coruscant Developments",
            "date": "2026-03",
        },
        "scoring": {
            key: {"weight": value["weight"], "description": value["desc"]}
            for key, value in DEFAULT_WEIGHTS.items()
        },
        "groups": groups,
        "options": [
            {
                "id": option["id"],
                "rank": option["rank"],
                "score": option["score"],
                "is_valid": option["is_valid"],
                "violations": option["violations"],
                "warnings": option["warnings"],
                "score_breakdown": option["score_breakdown"],
                "metrics": option["metrics"],
                "floors": [
                    {
                        "level": floor["level"],
                        "type": floor["type"],
                        "label": floor["label"],
                        "rooms": floor.get("rooms", []),
                    }
                    for floor in option["floors"]
                ],
            }
            for option in options
        ],
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    return filepath


def export_csv(options, filepath):
    """Export summary CSV."""
    header = (
        "Rank,ID,Score,Form,Keys,YT,PAD,Storeys,GIA,GIA/Key,Height,"
        "Coverage%,FAR,WestFacade,Outdoor,CostTotal,Cost/Key,Warnings"
    )
    rows = [header]
    for option in options:
        metrics = option["metrics"]
        rows.append(
            ",".join(
                str(value)
                for value in [
                    option["rank"],
                    option["id"],
                    option["score"],
                    metrics["form"],
                    metrics["total_keys"],
                    metrics["yt_rooms"],
                    metrics["pad_units"],
                    metrics["storeys"],
                    metrics["gia_m2"],
                    metrics["gia_per_key"],
                    metrics["building_height_m"],
                    metrics["coverage_pct"],
                    metrics["far"],
                    metrics["west_facade_m"],
                    metrics["outdoor_total_m2"],
                    f"${metrics['total_usd']:,}",
                    f"${metrics['cost_per_key_usd']:,}",
                    len(option["warnings"]),
                ]
            )
        )
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))
    return filepath
