/**
 * Client-side option generator — mirrors backend/engine logic.
 * Used for real-time option generation in the viewer without a server round-trip.
 */
import P from "./colours";
import rules from "../data/rules.json";

const AVG_YT_BAY = 3.37 * 0.6 + 3.37 * 0.18 + 5.055 * 0.12 + 5.055 * 0.1;
const AVG_PAD_BAY = 3.67 * 0.67 + 5.07 * 0.2 + 6.67 * 0.06 + 4.28 * 0.07;
const FORM_MULT = { BAR: 1, BAR_NS: 1, L: 1.08, U: 1.14, C: 1.11 };

function buildWings(form, floorArea, W) {
  let wings = [], wFac = 0, tFac = 0, court = 0, bL = 0, bW = 0;

  if (form === "BAR" || form === "BAR_NS") {
    const L = Math.round(floorArea / W);
    wings = [{ x: 0, y: 0, l: L, w: W, dir: form === "BAR_NS" ? "NS" : "EW" }];
    wFac = form === "BAR_NS" ? L : W;
    tFac = 2 * (L + W);
    bL = form === "BAR_NS" ? W : L;
    bW = form === "BAR_NS" ? L : W;
  } else if (form === "L") {
    const La = Math.round(floorArea * 0.6 / W), Lb = Math.round(floorArea * 0.4 / W);
    wings = [
      { x: 0, y: 0, l: La, w: W, dir: "EW" },
      { x: La - W, y: 0, l: Lb, w: W, dir: "NS" },
    ];
    wFac = W + Lb; tFac = 2 * La + 2 * Lb; bL = La; bW = Lb + W;
  } else if (form === "U") {
    const Lw = Math.round(floorArea / 3 / W), gap = Math.max(8, Lw);
    wings = [
      { x: 0, y: 0, l: Lw, w: W, dir: "EW" },
      { x: 0, y: gap + W, l: Lw, w: W, dir: "EW" },
      { x: Lw - W, y: 0, l: gap + 2 * W, w: W, dir: "NS" },
    ];
    wFac = gap + 2 * W; court = Lw * gap;
    tFac = 4 * Lw + 2 * (gap + 2 * W); bL = Lw; bW = gap + 2 * W;
  } else { // C
    const Lw = Math.round(floorArea / 3 / W), gap = Math.max(8, Lw);
    wings = [
      { x: 0, y: 0, l: Lw, w: W, dir: "EW" },
      { x: 0, y: gap + W, l: Lw, w: W, dir: "EW" },
      { x: 0, y: 0, l: gap + 2 * W, w: W, dir: "NS" },
    ];
    wFac = gap + 2 * W; court = (Lw - W) * gap;
    tFac = 4 * Lw + 2 * (gap + 2 * W); bL = Lw; bW = gap + 2 * W;
  }

  return { wings, wFac, tFac, court, bL, bW };
}

export default function generateOption(params, id) {
  const {
    form = "BAR", floorArea = 770, wingWidth = 14, storeys = 6,
    corridor = "double", ytRooms = 100, padUnits = 30, outdoorPos = "WEST",
  } = params;

  const W = wingWidth;
  const sides = corridor === "double" ? 2 : 1;
  const { wings, wFac, tFac, court, bL, bW } = buildWings(form, floorArea, W);

  // Rooms per floor across all wings
  let usable = 0;
  wings.forEach(w => { usable += Math.max(0, w.l - 6.3); });
  const ytRpf = Math.max(1, Math.floor(usable / AVG_YT_BAY) * sides);
  const padRpf = Math.max(1, Math.floor(usable / AVG_PAD_BAY) * sides);

  const ytFl = Math.min(Math.ceil(ytRooms / ytRpf), storeys - 1);
  const padFl = Math.min(Math.ceil(padUnits / padRpf), storeys - 1 - ytFl);
  const actYt = Math.min(ytRooms, ytFl * ytRpf);
  const actPad = Math.min(padUnits, padFl * padRpf);
  const totalKeys = actYt + actPad;
  const actSt = 1 + ytFl + padFl;

  const fp = floorArea;
  const gia = fp * actSt;
  const gk = totalKeys > 0 ? Math.round(gia / totalKeys * 10) / 10 : 0;
  const ht = Math.round((4.5 + (actSt - 1) * 3.2) * 10) / 10;

  const siteArea = rules?.planning?.site_area_m2 ?? 3599.1;

  // Outdoor
  const odG = ["WEST", "BOTH"].includes(outdoorPos) ? 12 * wFac : 0;
  const odR = ["ROOFTOP", "BOTH"].includes(outdoorPos) ? fp * 0.5 : 0;
  const odT = Math.round(odG + odR + court);

  // Cost
  const fm = FORM_MULT[form] || 1;
  const hard = fp * 2800 * 1.25 * fm + (gia - fp) * 2800 * fm
    + tFac * ht * 650 + actYt * 22000 + actPad * 30000 + totalKeys * 3500;
  const cost = Math.round(hard + 5700000 + hard * 0.145);
  const cpk = totalKeys > 0 ? Math.round(cost / totalKeys) : 0;

  // NIA
  const nia = Math.round(actYt * 16.7 + actPad * 22);

  // Floors
  const floors = [{ level: 0, type: "ground", label: "Ground — FOH+BOH", count: 0 }];
  for (let i = 0; i < ytFl; i++) {
    const n = Math.min(ytRpf, ytRooms - i * ytRpf);
    floors.push({ level: i + 1, type: "yotel", label: `Floor ${i + 1} — YOTEL`, count: n });
  }
  for (let i = 0; i < padFl; i++) {
    const n = Math.min(padRpf, padUnits - i * padRpf);
    floors.push({ level: ytFl + 1 + i, type: "yotelpad", label: `Floor ${ytFl + 1 + i} — PAD`, count: n });
  }

  // Score
  let sc = 0;
  sc += (120 <= totalKeys && totalKeys <= 140 ? 1 : Math.max(0.2, 1 - Math.abs(totalKeys - 130) / 130)) * 18;
  sc += (33 <= gk && gk <= 38 ? 1 : 29 <= gk && gk <= 42 ? 0.7 : 0.3) * 14;
  sc += Math.min(1, wFac / 50) * 14;
  sc += (ht <= 21 ? 1 : ht <= 25 ? 0.6 : 0.2) * 10;
  sc += Math.min(1, odT / 900) * 10;
  sc += (cpk <= 230000 ? 1 : cpk <= 270000 ? 0.75 : 0.5) * 12;
  sc += (corridor === "single" ? 1 : ["U", "C"].includes(form) ? 0.75 : 0.5) * 8;
  const pp = actPad / Math.max(1, totalKeys);
  sc += (0.18 <= pp && pp <= 0.28 ? 1 : 0.6) * 6;
  sc += ({ BAR: 1, BAR_NS: 1, L: 0.75, C: 0.6, U: 0.5 }[form] || 0.5) * 8;

  return {
    id: id || `OPT-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    score: Math.round(sc * 10) / 10,
    form, wings, floors, totalKeys,
    ytRooms: actYt, padUnits: actPad, storeys: actSt,
    gia, gk, ht, fp, nia,
    wFac: Math.round(wFac), tFac: Math.round(tFac),
    cov: Math.round(fp / siteArea * 100),
    far: Math.round(gia / siteArea * 100) / 100,
    odT, court: Math.round(court),
    cost, cpk, corridor, outdoorPos, bL, bW, wingWidth,
  };
}
