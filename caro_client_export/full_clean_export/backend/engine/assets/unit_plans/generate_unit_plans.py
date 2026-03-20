"""
MODULE 2B — LABELLED UNIT PLAN EXPORT
======================================
Generates SVG floor plan diagrams for each room type.
Run with: python3 generate_unit_plans.py
Output: SVG files in this folder.
"""

import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Room type definitions with furniture zones (x, y, w, h as % of room)
UNIT_TYPES = {
    "YT_Premium": {
        "title": "YOTEL Premium Room",
        "subtitle": "16.7 m² NIA · 3,100 × 5,400mm",
        "w_mm": 3100, "d_mm": 5400,
        "colour": "#7B2D8E", "accent": "#9B59B6",
        "zones": [
            {"label": "SmartBed™\nQueen", "x": 5, "y": 5, "w": 55, "h": 40, "fill": "#7B2D8E"},
            {"label": "Shower\n+ WC", "x": 62, "y": 5, "w": 33, "h": 40, "fill": "#3498DB"},
            {"label": "Desk +\nTask Light", "x": 5, "y": 48, "w": 30, "h": 22, "fill": "#2C3E50"},
            {"label": "Vanity\n+ Mirror", "x": 62, "y": 48, "w": 33, "h": 22, "fill": "#8E44AD"},
            {"label": "Wardrobe\n+ Safe", "x": 38, "y": 48, "w": 22, "h": 22, "fill": "#34495E"},
            {"label": "Entry\n+ Hooks", "x": 5, "y": 73, "w": 90, "h": 12, "fill": "#95A5A6"},
            {"label": "Technowall + TV 43\"", "x": 5, "y": 87, "w": 90, "h": 10, "fill": "#1A1A2E"},
        ],
    },
    "YT_Twin": {
        "title": "YOTEL Twin Room",
        "subtitle": "16.7 m² NIA · 3,100 × 5,400mm",
        "w_mm": 3100, "d_mm": 5400,
        "colour": "#9B59B6", "accent": "#7B2D8E",
        "zones": [
            {"label": "SmartBed\nTwin A", "x": 5, "y": 5, "w": 27, "h": 40, "fill": "#7B2D8E"},
            {"label": "SmartBed\nTwin B", "x": 34, "y": 5, "w": 27, "h": 40, "fill": "#9B59B6"},
            {"label": "Shower\n+ WC", "x": 63, "y": 5, "w": 32, "h": 40, "fill": "#3498DB"},
            {"label": "Desk", "x": 5, "y": 48, "w": 25, "h": 22, "fill": "#2C3E50"},
            {"label": "Vanity", "x": 63, "y": 48, "w": 32, "h": 22, "fill": "#8E44AD"},
            {"label": "Storage", "x": 33, "y": 48, "w": 28, "h": 22, "fill": "#34495E"},
            {"label": "Entry + Hooks", "x": 5, "y": 73, "w": 90, "h": 12, "fill": "#95A5A6"},
            {"label": "Technowall + TV", "x": 5, "y": 87, "w": 90, "h": 10, "fill": "#1A1A2E"},
        ],
    },
    "YT_FirstClass": {
        "title": "YOTEL First Class Room",
        "subtitle": "26.5 m² NIA · 4,900 × 5,400mm · 1.5 bays",
        "w_mm": 4900, "d_mm": 5400,
        "colour": "#6C3483", "accent": "#9B59B6",
        "zones": [
            {"label": "SmartBed™\nKing", "x": 5, "y": 5, "w": 40, "h": 38, "fill": "#6C3483"},
            {"label": "Sofa +\nCoffee Table", "x": 5, "y": 46, "w": 40, "h": 25, "fill": "#2C3E50"},
            {"label": "Bathroom\nShower + WC\n+ Vanity", "x": 48, "y": 5, "w": 47, "h": 45, "fill": "#3498DB"},
            {"label": "Desk +\nTask Light", "x": 48, "y": 53, "w": 22, "h": 18, "fill": "#34495E"},
            {"label": "Wardrobe\n+ Safe", "x": 72, "y": 53, "w": 23, "h": 18, "fill": "#8E44AD"},
            {"label": "Entry + Shelf + TV", "x": 5, "y": 74, "w": 90, "h": 12, "fill": "#95A5A6"},
            {"label": "RGBW Lighting Shelf", "x": 5, "y": 88, "w": 90, "h": 8, "fill": "#1A1A2E"},
        ],
    },
    "PAD_Studio": {
        "title": "YOTELPAD Studio",
        "subtitle": "22–23 m² NIA · 3,425 × 6,700mm",
        "w_mm": 3425, "d_mm": 6700,
        "colour": "#F39C12", "accent": "#E67E22",
        "zones": [
            {"label": "SmartBed™\nQueen\n+ Slat Ceiling", "x": 5, "y": 3, "w": 55, "h": 30, "fill": "#F39C12"},
            {"label": "Wardrobe\n+ Shoe\nStorage", "x": 62, "y": 3, "w": 33, "h": 18, "fill": "#D35400"},
            {"label": "Shower\n+ WC\n+ Vanity", "x": 62, "y": 23, "w": 33, "h": 30, "fill": "#3498DB"},
            {"label": "Kitchenette\nHob · Sink · MW\nFridge · DW", "x": 5, "y": 35, "w": 55, "h": 18, "fill": "#27AE60"},
            {"label": "Window\nCorner Seat\n+ Adj Table", "x": 5, "y": 55, "w": 30, "h": 20, "fill": "#2C3E50"},
            {"label": "Desk +\nDining\nFlip Table", "x": 37, "y": 55, "w": 28, "h": 20, "fill": "#34495E"},
            {"label": "TV + Storage Wall", "x": 5, "y": 77, "w": 60, "h": 10, "fill": "#1A1A2E"},
            {"label": "Entry · Mirror · Luggage", "x": 5, "y": 89, "w": 90, "h": 8, "fill": "#95A5A6"},
            {"label": "Sliding\nDoor", "x": 62, "y": 55, "w": 33, "h": 10, "fill": "#BDC3C7"},
        ],
    },
    "PAD_OneBed": {
        "title": "YOTELPAD 1-Bedroom",
        "subtitle": "32–34 m² NIA · 4,800 × 7,070mm",
        "w_mm": 4800, "d_mm": 7070,
        "colour": "#E67E22", "accent": "#F39C12",
        "zones": [
            {"label": "SmartBed™\n+ Shelf\n+ Ceiling\nFeature", "x": 55, "y": 3, "w": 40, "h": 35, "fill": "#E67E22"},
            {"label": "Wardrobe\n+ Safe\n+ Storage", "x": 55, "y": 40, "w": 40, "h": 15, "fill": "#D35400"},
            {"label": "Bathroom\nShower + WC\nVanity · Glass\nSliding Door", "x": 55, "y": 57, "w": 40, "h": 30, "fill": "#3498DB"},
            {"label": "Living\nSleeper Sofa\n+ Coffee Tbl", "x": 5, "y": 3, "w": 47, "h": 30, "fill": "#2C3E50"},
            {"label": "Kitchenette\nHob · Sink · MW · Fridge\nDW · Coffee Machine", "x": 5, "y": 35, "w": 47, "h": 18, "fill": "#27AE60"},
            {"label": "Desk +\nFlip Dining\nTable", "x": 5, "y": 55, "w": 25, "h": 18, "fill": "#34495E"},
            {"label": "Occ.\nChair", "x": 32, "y": 55, "w": 20, "h": 18, "fill": "#8E44AD"},
            {"label": "TV", "x": 5, "y": 75, "w": 20, "h": 8, "fill": "#1A1A2E"},
            {"label": "Entry · Luggage · Mirror", "x": 5, "y": 85, "w": 90, "h": 8, "fill": "#95A5A6"},
            {"label": "Glass\nSliding\nDoor", "x": 48, "y": 3, "w": 5, "h": 55, "fill": "#BDC3C7"},
        ],
    },
}


def generate_svg(key, unit):
    """Generate a labelled SVG plan for a room type."""
    svg_w, svg_h = 480, 620
    pad_x, pad_y = 30, 60
    plan_w = svg_w - 2 * pad_x
    plan_h = svg_h - pad_y - 50

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" width="{svg_w}" height="{svg_h}">')
    lines.append(f'<rect width="{svg_w}" height="{svg_h}" fill="#0F1923"/>')

    # Title
    lines.append(f'<text x="{svg_w/2}" y="22" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" '
                  f'font-size="16" font-weight="bold" fill="{unit["colour"]}">{unit["title"]}</text>')
    lines.append(f'<text x="{svg_w/2}" y="42" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" '
                  f'font-size="11" fill="#8E8E93">{unit["subtitle"]}</text>')

    # Room outline
    lines.append(f'<rect x="{pad_x}" y="{pad_y}" width="{plan_w}" height="{plan_h}" '
                  f'fill="none" stroke="{unit["colour"]}" stroke-width="2" rx="3"/>')

    # Zones
    for z in unit["zones"]:
        zx = pad_x + z["x"] / 100 * plan_w
        zy = pad_y + z["y"] / 100 * plan_h
        zw = z["w"] / 100 * plan_w
        zh = z["h"] / 100 * plan_h

        lines.append(f'<rect x="{zx:.1f}" y="{zy:.1f}" width="{zw:.1f}" height="{zh:.1f}" '
                      f'fill="{z["fill"]}" fill-opacity="0.25" stroke="{z["fill"]}" '
                      f'stroke-opacity="0.5" stroke-width="1" rx="2"/>')

        # Label (multi-line)
        label_lines = z["label"].split("\n")
        total_h = len(label_lines) * 12
        start_y = zy + zh / 2 - total_h / 2 + 10
        for li, txt in enumerate(label_lines):
            ty = start_y + li * 12
            lines.append(f'<text x="{zx + zw/2:.1f}" y="{ty:.1f}" text-anchor="middle" '
                          f'font-family="Helvetica,Arial,sans-serif" font-size="9" '
                          f'font-weight="bold" fill="#FAFAFA">{txt}</text>')

    # Dimension annotations
    # Width
    dim_y = pad_y + plan_h + 18
    lines.append(f'<line x1="{pad_x}" y1="{dim_y}" x2="{pad_x + plan_w}" y2="{dim_y}" '
                  f'stroke="#8E8E93" stroke-width="0.5"/>')
    lines.append(f'<text x="{svg_w/2}" y="{dim_y + 14}" text-anchor="middle" '
                  f'font-family="Helvetica,Arial,sans-serif" font-size="10" fill="#8E8E93">'
                  f'{unit["w_mm"]}mm</text>')

    # Depth
    dim_x = pad_x - 14
    lines.append(f'<line x1="{dim_x}" y1="{pad_y}" x2="{dim_x}" y2="{pad_y + plan_h}" '
                  f'stroke="#8E8E93" stroke-width="0.5"/>')
    lines.append(f'<text x="{dim_x}" y="{pad_y + plan_h/2}" text-anchor="middle" '
                  f'font-family="Helvetica,Arial,sans-serif" font-size="10" fill="#8E8E93" '
                  f'transform="rotate(-90,{dim_x},{pad_y + plan_h/2})">{unit["d_mm"]}mm</text>')

    # Window indicator (west/facade side = top of plan)
    lines.append(f'<rect x="{pad_x + 5}" y="{pad_y - 4}" width="{plan_w - 10}" height="4" '
                  f'fill="#3498DB" fill-opacity="0.5" rx="2"/>')
    lines.append(f'<text x="{svg_w/2}" y="{pad_y - 8}" text-anchor="middle" '
                  f'font-family="Helvetica,Arial,sans-serif" font-size="8" fill="#3498DB">'
                  f'↑ FACADE / WINDOW (Floor-to-ceiling glazing)</text>')

    # Corridor indicator (bottom)
    lines.append(f'<text x="{svg_w/2}" y="{dim_y + 30}" text-anchor="middle" '
                  f'font-family="Helvetica,Arial,sans-serif" font-size="8" fill="#95A5A6">'
                  f'↓ CORRIDOR (1,600mm)</text>')

    lines.append('</svg>')
    return '\n'.join(lines)


if __name__ == "__main__":
    for key, unit in UNIT_TYPES.items():
        svg_content = generate_svg(key, unit)
        filepath = os.path.join(OUTPUT_DIR, f"{key}.svg")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"  OK {filepath}")

    print(f"\nGenerated {len(UNIT_TYPES)} unit plan SVGs in {OUTPUT_DIR}")
