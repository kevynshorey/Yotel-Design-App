#!/usr/bin/env python3
"""
CLI entry point — generates options and exports to frontend/src/data/ and exports/.

Run from project root:
    python backend/run_engine.py              # default 30 options
    python backend/run_engine.py --max 50     # 50 options
    python backend/run_engine.py --osm        # also fetch OSM context
"""

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone

# Ensure project root is on path regardless of where script is called from
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
sys.path.insert(0, project_root)

from backend.engine.generation.generator import generate_all, group_options
from backend.engine.export_prep.exporters import export_json, export_csv


def main():
    parser = argparse.ArgumentParser(description="YOTEL Masterplan Options Generator")
    parser.add_argument("--max", type=int, default=30, help="Max options to generate")
    parser.add_argument("--osm", action="store_true", help="Fetch OSM context data")
    parser.add_argument("--lat", type=float, default=13.0969, help="Site latitude")
    parser.add_argument("--lon", type=float, default=-59.6145, help="Site longitude")
    parser.add_argument("--radius", type=int, default=1500, help="Context search radius (m)")
    args = parser.parse_args()

    root = project_root

    print("=" * 60)
    print("  YOTEL+YOTELPAD Barbados — Options Engine")
    print("=" * 60)

    # Generate options
    print(f"\nGenerating up to {args.max} options...")
    options = generate_all(max_options=args.max)
    groups = group_options(options)
    # Use ASCII only so Windows console encoding doesn't crash.
    print(f"  -> {len(options)} valid unique options")

    # Export directories (pipeline-oriented structure)
    exports_dir = os.path.join(root, "exports")
    pipeline_root = os.path.join(exports_dir, "engine_pipeline")
    options_export_dir = os.path.join(pipeline_root, "options")
    context_export_dir = os.path.join(pipeline_root, "context")
    manifest_path = os.path.join(pipeline_root, "manifest.json")
    frontend_data = os.path.join(root, "frontend", "src", "data")

    os.makedirs(exports_dir, exist_ok=True)
    os.makedirs(pipeline_root, exist_ok=True)
    os.makedirs(options_export_dir, exist_ok=True)
    os.makedirs(context_export_dir, exist_ok=True)
    os.makedirs(frontend_data, exist_ok=True)

    # Primary pipeline exports
    json_path = export_json(options, groups, os.path.join(options_export_dir, "options.json"))
    csv_path = export_csv(options, os.path.join(options_export_dir, "options.csv"))

    # Backward-compatible mirror paths used by older docs/scripts.
    legacy_json_path = export_json(options, groups, os.path.join(exports_dir, "options.json"))
    legacy_csv_path = export_csv(options, os.path.join(exports_dir, "options.csv"))

    # Also copy to frontend data dir
    export_json(options, groups, os.path.join(frontend_data, "options.json"))

    print(f"\nExported:")
    print(f"  {json_path}")
    print(f"  {csv_path}")
    print(f"  {legacy_json_path}")
    print(f"  {legacy_csv_path}")
    print(f"  {os.path.join(frontend_data, 'options.json')}")

    # Print top 10
    print(f"\n{'Rk':<4} {'ID':<9} {'Scr':<6} {'Form':<7} {'Keys':<5} {'$/Key':<9}")
    # ASCII only to avoid Windows console encoding issues.
    print("-" * 45)
    for o in options[:10]:
        m = o["metrics"]
        print(f"{o['rank']:<4} {o['id']:<9} {o['score']:<6} {m['form']:<7} "
              f"{m['total_keys']:<5} ${m['cost_per_key_usd']:>7,}")

    # Boundary control export (always produced for pipeline traceability).
    boundary_src = os.path.join(root, "config", "osm", "boundary_control.json")
    boundary_dst = os.path.join(context_export_dir, "boundary_control.json")
    if os.path.exists(boundary_src):
        shutil.copyfile(boundary_src, boundary_dst)
        print(f"\nBoundary:")
        print(f"  {boundary_dst}")
    else:
        print("\nBoundary:")
        print("  skipped (config/osm/boundary_control.json not found)")

    # OSM
    if args.osm:
        print(f"\nFetching OSM context ({args.lat}, {args.lon}, {args.radius}m)...")
        try:
            from backend.osm.cache import fetch_with_cache
            ctx = fetch_with_cache(
                args.lat,
                args.lon,
                args.radius,
                sources=["osm_overpass", "overture", "esri", "copernicus", "mapbox", "places_api", "dwg"],
                local_source_files=[
                    os.path.join(root, "config", "osm", "context_seed.json"),
                    os.path.join(root, "config", "osm", "osm_context.json"),
                ],
            )
            bldgs = len(ctx.get("buildings", []))
            roads = len(ctx.get("roads", []))
            print(f"  -> {bldgs} buildings, {roads} roads")
            print(f"  -> {len(ctx.get('road_centerlines', []))} road centerlines, {len(ctx.get('trees', []))} trees")
            print(f"  -> Sources: {', '.join(ctx.get('sources_used', []))}")
            if ctx.get("warnings"):
                print(f"  -> Warnings: {len(ctx.get('warnings', []))} source adapters pending implementation")
            print(f"  -> {'From cache' if ctx.get('_from_cache') else 'Fresh fetch'}")

            # Export context snapshot and boundary control alongside options.
            osm_export_path = os.path.join(context_export_dir, "osm_context.json")
            with open(osm_export_path, "w", encoding="utf-8") as f:
                json.dump(ctx, f, indent=2)

            # Boundary file is already exported above on every run.
            print(f"  -> OSM export: {osm_export_path}")
        except Exception as e:
            print(f"  -> OSM fetch failed: {e}")

    # Write a compact manifest for quick pipeline status checks.
    manifest = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "engine_pipeline": {
            "options_json": os.path.join(options_export_dir, "options.json"),
            "options_csv": os.path.join(options_export_dir, "options.csv"),
            "legacy_options_json": os.path.join(exports_dir, "options.json"),
            "legacy_options_csv": os.path.join(exports_dir, "options.csv"),
            "frontend_options_json": os.path.join(frontend_data, "options.json"),
            "osm_context_json": os.path.join(context_export_dir, "osm_context.json"),
            "boundary_control_json": os.path.join(context_export_dir, "boundary_control.json"),
        },
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest:")
    print(f"  {manifest_path}")


if __name__ == "__main__":
    main()
