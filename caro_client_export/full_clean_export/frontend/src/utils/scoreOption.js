const DEFAULT_WEIGHTS = {
  room_count: 0.18,
  gia_efficiency: 0.14,
  sea_views: 0.14,
  cost_per_key: 0.12,
  building_height: 0.1,
  outdoor_amenity: 0.1,
  daylight_quality: 0.08,
  form_simplicity: 0.08,
  pad_mix: 0.06,
};

function clamp01(x) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Port of backend/engine/scorer.py.
 *
 * Returns an object compatible with `frontend/src/components/ScoringPanel.jsx`:
 *   {
 *     total: number (0..100),
 *     room_count: number (0..weight*100),
 *     ... (per-criterion points)
 *   }
 */
export function scoreOption(option, weights = DEFAULT_WEIGHTS) {
  const w = { ...DEFAULT_WEIGHTS, ...(weights || {}) };

  // normalize weights to sum=1 (avoid drift)
  const sumW = Object.values(w).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0) || 1;
  Object.keys(w).forEach(k => { w[k] = (w[k] || 0) / sumW; });

  const keys = option?.totalKeys ?? 0;
  const gk = option?.gk ?? 0;
  const wf = option?.wFac ?? 0;
  const h = option?.ht ?? 0;
  const outdoor = option?.odT ?? 0;
  const cpk = option?.cpk ?? 250000;
  const ct = option?.corridor ?? "double";
  const form = option?.form ?? "BAR";
  const padPct = (option?.padUnits ?? 0) / Math.max(1, option?.totalKeys ?? 1);

  const raw = {};

  // 1. Room count
  if (120 <= keys && keys <= 140) raw.room_count = 1.0;
  else if (100 <= keys && keys < 120) raw.room_count = 0.7 + (keys - 100) / 100;
  else if (keys > 140) raw.room_count = Math.max(0.5, 1.0 - (keys - 140) / 100);
  else raw.room_count = Math.max(0.2, keys / 130);

  // 2. GIA efficiency
  if (33 <= gk && gk <= 38) raw.gia_efficiency = 1.0;
  else if (29 <= gk && gk <= 42) raw.gia_efficiency = 0.7;
  else raw.gia_efficiency = Math.max(0.2, 1.0 - Math.abs(gk - 35.5) / 35.5);

  // 3. Sea views (west facade)
  raw.sea_views = Math.min(1.0, wf / 50);

  // 4. Building height
  if (h <= 21) raw.building_height = 1.0;
  else if (h <= 25) raw.building_height = 0.6;
  else raw.building_height = 0.2;

  // 5. Outdoor amenity
  raw.outdoor_amenity = Math.min(1.0, outdoor / 900);

  // 6. Cost per key
  if (cpk <= 230000) raw.cost_per_key = 1.0;
  else if (cpk <= 270000) raw.cost_per_key = 0.75;
  else if (cpk <= 320000) raw.cost_per_key = 0.5;
  else raw.cost_per_key = 0.2;

  // 7. Daylight quality
  if (ct === "single") raw.daylight_quality = 1.0;
  else if (form === "U" || form === "C") raw.daylight_quality = 0.75;
  else if (form === "L") raw.daylight_quality = 0.65;
  else raw.daylight_quality = 0.5;

  // 8. PAD mix
  if (0.18 <= padPct && padPct <= 0.28) raw.pad_mix = 1.0;
  else if (0.12 <= padPct && padPct <= 0.35) raw.pad_mix = 0.7;
  else raw.pad_mix = 0.4;

  // 9. Form simplicity
  raw.form_simplicity = ({ BAR: 1.0, BAR_NS: 1.0, L: 0.75, C: 0.6, U: 0.5 }[form] || 0.5);

  const points = {};
  let total = 0;
  for (const k of Object.keys(DEFAULT_WEIGHTS)) {
    const pts = clamp01(raw[k] ?? 0) * (w[k] ?? 0) * 100;
    points[k] = Math.round(pts * 10) / 10;
    total += pts;
  }

  return {
    total: Math.round(total * 10) / 10,
    ...points,
    _weights: w,
  };
}

export function getDefaultWeights() {
  return { ...DEFAULT_WEIGHTS };
}

