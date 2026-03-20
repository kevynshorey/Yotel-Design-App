import unittest
import math

from backend.engine.generation.generator import build_option
from backend.engine.scoring.scorer import score_option
from backend.engine.validation.rules import get_rules
from backend.engine.validation.validator import validate
from config.site import OFFSET_BOUNDARY, VIEWER_BUILDING_PLACEMENT


class GenerationBoundaryTests(unittest.TestCase):
    def test_build_option_returns_none_when_too_small(self):
        # Intentionally tiny programme: should never reach minimum keys threshold.
        params = {
            "form": "BAR",
            "target_floor_area_m2": 600,
            "wing_width_m": 14.0,
            "storeys": 2,  # ground + 1 upper
            "corridor_type": "double",
            "yt_rooms": 10,
            "pad_units": 0,
            "outdoor_pos": "WEST",
            "outdoor_depth_m": 8,
        }

        opt = build_option(params)
        self.assertIsNone(opt)


class ValidationBoundaryTests(unittest.TestCase):
    def _base_metrics(self):
        return {
            "form": "BAR",
            "total_keys": 130,
            "yt_rooms": 100,
            "pad_units": 30,
            "storeys": 6,
            "footprint_m2": 770,
            "gia_m2": 4620,
            "gia_per_key": 35.0,
            "building_height_m": 20.5,
            "coverage_pct": 40.0,
            "far": 1.1,
            "west_facade_m": 50.0,
            "total_facade_m": 200.0,
            "total_facade_m2": 200.0,
            "outdoor_ground_m2": 500.0,
            "outdoor_roof_m2": 385.0,
            "outdoor_courtyard_m2": 0.0,
            "outdoor_total_m2": 885.0,
            "accessible_count": 7,
            "corridor_type": "double",
            "outdoor_pos": "WEST",
            "wing_width_m": 14.0,
            "yt_per_floor": 33,
            "pad_per_floor": 15,
            "bounding_L": 50.0,
            "bounding_W": 14.0,
            "wings": [],
        }

    def test_validate_coverage_violation(self):
        rules = get_rules()
        max_cov = rules["planning"]["max_coverage_pct"]

        m = self._base_metrics()
        m["coverage_pct"] = float(max_cov) + 1.0
        opt = {"metrics": m, "params": {}}

        is_valid, violations, warnings = validate(opt)
        self.assertFalse(is_valid)
        self.assertTrue(any("Coverage" in v for v in violations))

    def test_validate_offset_boundary_violation(self):
        # Keep coverage/height within limits, but force one wing far outside offset polygon.
        m = self._base_metrics()
        m["coverage_pct"] = rules_cov = float(get_rules()["planning"]["max_coverage_pct"]) - 1.0
        m["building_height_m"] = float(get_rules()["planning"]["max_height_m"]) - 1.0

        m["wings"] = [
            # Far away rectangle so at least one corner lands outside OFFSET_BOUNDARY after placement.
            {"x": -1000.0, "y": -1000.0, "l": 10.0, "w": 10.0},
        ]
        opt = {"metrics": m, "params": {}}

        is_valid, violations, warnings = validate(opt)
        self.assertFalse(is_valid)
        self.assertTrue(any("offset boundary" in v.lower() for v in violations))

    def test_validate_offset_boundary_violation_ns_dir_swaps_lw(self):
        """
        Regression test:
        Viewer3D swaps l/w for `wing.dir === "NS"`.
        The backend validator must do the same, otherwise options can be marked valid
        while the rendered mass crosses the offset border.
        """

        def point_on_segment(px, py, ax, ay, bx, by, eps=1e-9) -> bool:
            cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax)
            if abs(cross) > eps:
                return False
            dot = (px - ax) * (px - bx) + (py - ay) * (py - by)
            return dot <= eps

        def point_in_poly(pt, poly):
            x, y = pt
            n = len(poly)
            for i in range(n):
                a = poly[i]
                b = poly[(i + 1) % n]
                if point_on_segment(x, y, a["x"], a["y"], b["x"], b["y"]):
                    return True
            inside = False
            for i in range(n):
                x1, y1 = poly[i]["x"], poly[i]["y"]
                x2, y2 = poly[(i - 1) % n]["x"], poly[(i - 1) % n]["y"]
                if ((y1 > y) != (y2 > y)) and (
                    x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-12) + x1
                ):
                    inside = not inside
            return inside

        ang = VIEWER_BUILDING_PLACEMENT.get("rot_deg", 0) * math.pi / 180
        tx = VIEWER_BUILDING_PLACEMENT.get("x", 0)
        ty = VIEWER_BUILDING_PLACEMENT.get("y", 0)

        def rot_translate(lx, ly):
            c, s = math.cos(ang), math.sin(ang)
            rx = lx * c - ly * s
            ry = lx * s + ly * c
            return (rx + tx, ry + ty)

        # Pick a l >> w rectangle so the swap matters.
        L = 40.0
        W = 10.0

        found = None
        # Local wing origin search space (plan coordinates).
        for x0 in range(-10, 90):
            for y0 in range(-10, 90):
                # Old (wrong) mapping: X extent uses l, Y extent uses w.
                old_corners = [
                    (x0, y0),
                    (x0 + L, y0),
                    (x0 + L, y0 + W),
                    (x0, y0 + W),
                ]
                old_inside = all(
                    point_in_poly(rot_translate(lx, ly), OFFSET_BOUNDARY) for lx, ly in old_corners
                )
                if not old_inside:
                    continue

                # New (correct) mapping for NS: X extent uses w, Y extent uses l.
                new_corners = [
                    (x0, y0),
                    (x0 + W, y0),
                    (x0 + W, y0 + L),
                    (x0, y0 + L),
                ]
                new_outside = any(
                    not point_in_poly(rot_translate(lx, ly), OFFSET_BOUNDARY) for lx, ly in new_corners
                )
                if new_outside:
                    found = (float(x0), float(y0))
                    break
            if found:
                break

        self.assertIsNotNone(found, "Failed to find a test case where NS swap changes containment.")
        x0, y0 = found

        # Build a minimal metrics dict for validator (keep within other hard constraints).
        m = self._base_metrics()
        rules = get_rules()
        m["coverage_pct"] = float(rules["planning"]["max_coverage_pct"]) - 1.0
        m["building_height_m"] = float(rules["planning"]["max_height_m"]) - 1.0
        m["wings"] = [{"x": x0, "y": y0, "l": L, "w": W, "dir": "NS"}]

        opt = {"metrics": m, "params": {}}
        is_valid, violations, _warnings = validate(opt)
        self.assertFalse(is_valid)
        self.assertTrue(any("offset boundary" in v.lower() for v in violations))


class ScoringBoundaryTests(unittest.TestCase):
    def _make_opt(
        self,
        *,
        total_keys,
        gia_per_key,
        west_facade_m,
        building_height_m,
        outdoor_total_m2,
        cost_per_key_usd,
        corridor_type,
        form,
        pad_units,
    ):
        return {
            "metrics": {
                "total_keys": total_keys,
                "gia_per_key": gia_per_key,
                "west_facade_m": west_facade_m,
                "building_height_m": building_height_m,
                "outdoor_total_m2": outdoor_total_m2,
                "cost_per_key_usd": cost_per_key_usd,
                "corridor_type": corridor_type,
                "form": form,
                "pad_units": pad_units,
            }
        }

    def test_score_room_count_at_120_keys(self):
        # For 120 keys: room_count score s=1.0.
        # With all other criteria set to max except daylight_quality (0.5 for BAR, double corridor),
        # expected weighted total = 0.96 => score 96.0
        opt = self._make_opt(
            total_keys=120,
            gia_per_key=35.0,
            west_facade_m=50.0,
            building_height_m=20.0,
            outdoor_total_m2=900.0,
            cost_per_key_usd=200000,
            corridor_type="double",
            form="BAR",
            pad_units=24,  # 20% pad => pad_mix s=1.0
        )

        total, breakdown = score_option(opt)
        self.assertAlmostEqual(total, 96.0, places=1)
        self.assertIn("room_count", breakdown)

    def test_score_room_count_between_100_and_120(self):
        # For 110 keys: room_count s=0.8.
        # Expected: 0.78 (everything except room_count and daylight) + 0.18*0.8=0.924 => 92.4
        opt = self._make_opt(
            total_keys=110,
            gia_per_key=35.0,
            west_facade_m=50.0,
            building_height_m=20.0,
            outdoor_total_m2=900.0,
            cost_per_key_usd=200000,
            corridor_type="double",
            form="BAR",
            pad_units=22,  # 20% pad => pad_mix s=1.0
        )

        total, breakdown = score_option(opt)
        self.assertAlmostEqual(total, 92.4, places=1)
        self.assertIn("room_count", breakdown)


if __name__ == "__main__":
    unittest.main()

