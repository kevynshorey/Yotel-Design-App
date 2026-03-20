import P from "../utils/colours";

const CRITERIA = [
  { key: "room_count", label: "Room count", w: .18 },
  { key: "gia_efficiency", label: "GIA efficiency", w: .14 },
  { key: "sea_views", label: "Sea views", w: .14 },
  { key: "cost_per_key", label: "Cost / key", w: .12 },
  { key: "building_height", label: "Height", w: .10 },
  { key: "outdoor_amenity", label: "Outdoor amenity", w: .10 },
  { key: "daylight_quality", label: "Daylight", w: .08 },
  { key: "form_simplicity", label: "Form simplicity", w: .08 },
  { key: "pad_mix", label: "PAD mix", w: .06 },
];

function scorePoints(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object") {
    if (typeof value.weighted === "number" && Number.isFinite(value.weighted)) return value.weighted * 100;
    if (typeof value.raw === "number" && Number.isFinite(value.raw)) return value.raw * 100;
  }
  return 0;
}

function scoreTotal(score) {
  if (typeof score === "number" && Number.isFinite(score)) return score;
  if (score && typeof score === "object") {
    if (typeof score.total === "number" && Number.isFinite(score.total)) return score.total;
    return CRITERIA.reduce((acc, c) => acc + scorePoints(score[c.key]), 0);
  }
  return 0;
}

function WeightRow({ label, valuePct, disabled, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, alignItems: "center", marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: "normal 400 10px/14px 'Inter',sans-serif", color: P.sub, width: 104 }}>{label}</span>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={valuePct}
          disabled={disabled}
          onChange={(e) => onChange?.(Number(e.target.value))}
          style={{ flex: 1, accentColor: P.purple, height: 3 }}
        />
      </div>
      <input
        type="number"
        min={0}
        max={40}
        step={1}
        value={valuePct}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{
          height: 26,
          padding: "0 8px",
          borderRadius: 6,
          border: `1px solid ${P.borderL}`,
          outline: "none",
          font: "normal 600 11px/14px 'Inter',sans-serif",
          color: P.text,
        }}
      />
    </div>
  );
}

function rebalance(weights, changedKey, nextVal) {
  const keys = CRITERIA.map(c => c.key);
  const next = { ...weights, [changedKey]: nextVal };
  const total = keys.reduce((acc, k) => acc + (next[k] || 0), 0);
  if (total <= 0) return next;
  // Keep the changed key fixed, scale others so total becomes 100
  const fixed = next[changedKey] || 0;
  const remaining = Math.max(0, 100 - fixed);
  const otherKeys = keys.filter(k => k !== changedKey);
  const otherSum = otherKeys.reduce((acc, k) => acc + (next[k] || 0), 0) || 1;
  otherKeys.forEach(k => {
    next[k] = Math.round(((next[k] || 0) / otherSum) * remaining);
  });
  // final small correction to hit 100 exactly
  const final = keys.reduce((acc, k) => acc + (next[k] || 0), 0);
  const drift = 100 - final;
  if (drift !== 0) {
    const k = otherKeys[0] || changedKey;
    next[k] = Math.max(0, (next[k] || 0) + drift);
  }
  return next;
}

export default function ScoringPanel({ option, scoring }) {
  if (!option) return null;
  const s = option.score || {};
  const total = scoreTotal(s);
  const presets = scoring?.presets || [];
  const activePresetId = scoring?.activePresetId || "default";
  const activePreset = scoring?.activePreset || presets.find(p => p.id === activePresetId);
  const locked = !!activePreset?.locked && !scoring?.ownerMode;

  const weightsPct = (() => {
    const w = (scoring?.activeWeights || {}). _weights ? scoring.activeWeights._weights : (scoring?.activeWeights || {});
    // tolerate either raw weights or normalized weights
    const out = {};
    CRITERIA.forEach(c => { out[c.key] = Math.round(((w[c.key] || c.w) * 100)); });
    return out;
  })();

  return (
    <div style={{
      background: "#fff", borderRadius: 4, padding: "12px 16px",
      border: `1px solid ${P.borderL}`,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10,
      }}>
        <span style={{ font: "normal 700 12px/16px 'Inter',sans-serif", color: P.text }}>Score breakdown</span>
        <span style={{ font: "normal 700 14px/20px 'Inter',sans-serif", color: P.purple }}>{total.toFixed(1)}</span>
      </div>

      {scoring && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={activePresetId}
              onChange={(e) => scoring.setActiveScoringPreset?.(e.target.value)}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${P.borderL}`,
                background: "#fff",
                font: "normal 600 11px/14px 'Inter',sans-serif",
                color: P.text,
                outline: "none",
                padding: "0 8px",
              }}
            >
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.locked ? " (locked)" : ""}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                const code = window.prompt("Owner override code:");
                if (code && code.trim() === "owner-override-2026") scoring.setOwnerOverride?.(true);
              }}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 6,
                border: `1px solid ${P.borderL}`,
                background: "#fff",
                cursor: "pointer",
                font: "normal 700 11px/14px 'Inter',sans-serif",
                color: scoring.ownerMode ? P.success : P.sub,
                whiteSpace: "nowrap",
              }}
              title="Enable owner mode to override locked presets"
            >
              {scoring.ownerMode ? "Owner" : "Owner…"}
            </button>
          </div>

          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${P.border}` }}>
            <div style={{ font: "normal 700 11px/14px 'Inter',sans-serif", color: P.text }}>Weights</div>
            {CRITERIA.map(c => (
              <WeightRow
                key={c.key}
                label={c.label}
                valuePct={weightsPct[c.key] ?? Math.round(c.w * 100)}
                disabled={locked}
                onChange={(nextPct) => {
                  const next = rebalance(weightsPct, c.key, nextPct);
                  const nextWeights = {};
                  Object.keys(next).forEach(k => { nextWeights[k] = (next[k] || 0) / 100; });
                  scoring.updateActiveWeights?.(nextWeights);
                }}
              />
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt("Preset name:");
                  if (!name) return;
                  const nextWeights = {};
                  Object.keys(weightsPct).forEach(k => { nextWeights[k] = (weightsPct[k] || 0) / 100; });
                  scoring.savePreset?.(name, nextWeights);
                }}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 6,
                  border: "none",
                  background: P.purple,
                  color: "#fff",
                  cursor: "pointer",
                  font: "normal 700 11px/14px 'Inter',sans-serif",
                }}
              >
                Save as preset
              </button>

              {!activePreset?.locked && (
                <button
                  type="button"
                  onClick={() => scoring.deletePreset?.(activePresetId)}
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: `1px solid rgba(184,53,106,.35)`,
                    background: "rgba(184,53,106,.08)",
                    color: P.danger,
                    cursor: "pointer",
                    font: "normal 700 11px/14px 'Inter',sans-serif",
                  }}
                >
                  Delete
                </button>
              )}
            </div>

            {locked && (
              <div style={{ marginTop: 6, font: "normal 400 10px/14px 'Inter',sans-serif", color: P.sub }}>
                Locked preset. Only owner mode can override defaults.
              </div>
            )}
          </div>
        </div>
      )}

      {CRITERIA.map(c => {
        const v = scorePoints(s[c.key]);
        const pct = Math.min(100, (v / (c.w * 100)) * 100);
        return (
          <div key={c.key} style={{ marginBottom: 5 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              font: "normal 400 10px/14px 'Inter',sans-serif", color: P.sub, marginBottom: 2,
            }}>
              <span>{c.label} <span style={{ color: P.dim }}>({(c.w * 100).toFixed(0)}%)</span></span>
              <span style={{ fontWeight: 600, color: P.text }}>{v.toFixed(1)}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: P.surface }}>
              <div style={{
                height: 4, borderRadius: 2, width: `${pct}%`,
                background: pct > 80 ? P.success : pct > 50 ? P.purple : P.warning,
                transition: "width .3s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
