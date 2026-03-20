import P from "../utils/colours";

const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1e3).toFixed(0)}k`;

function totalScore(score) {
  if (typeof score === "number" && Number.isFinite(score)) return score;
  if (score && typeof score === "object") {
    if (typeof score.total === "number" && Number.isFinite(score.total)) return score.total;
    const fromWeighted = Object.values(score)
      .map(v => (v && typeof v === "object" && typeof v.weighted === "number" ? v.weighted * 100 : null))
      .filter(v => v !== null);
    if (fromWeighted.length) return fromWeighted.reduce((a, b) => a + b, 0);
  }
  return 0;
}

export default function OptionCard({ option: o, selected, onSelect }) {
  if (!o) return null;
  const s = o.score || {};
  const sTotal = totalScore(s);
  const hv = o.hardValidation || {};
  const hasHardViolations = (hv.hardViolations?.length || 0) > 0;
  const hardWarningsCount = hv.hardWarnings?.length || 0;
  const isCommitted = !!o.committed;
  const forced = !!o.commitForced;
  return (
    <div onClick={onSelect} style={{
      padding: "10px 12px", marginBottom: 6, borderRadius: 4, cursor: "pointer",
      background: "#fff",
      border: hasHardViolations
        ? `2px solid ${P.danger || "#B8456A"}`
        : selected ? `2px solid ${P.purple}` : `1px solid ${P.borderL}`,
      transition: "all .15s ease",
    }}>
      {/* Header — thumbnail placeholder + title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Set badge — context style */}
          <span style={{
            font: "normal 700 10px/14px 'Inter',sans-serif",
            padding: "2px 6px", borderRadius: 2,
            background: P.purpleFaint, color: P.purple,
            border: `1px solid ${P.purple30}`,
          }}>Set {o.designSet || "A"}</span>
          <span style={{ font: "normal 700 12px/16px 'Inter',sans-serif", color: P.text }}>{o.form}</span>
          {isCommitted && (
            <span style={{
              font: "normal 700 10px/14px 'Inter',sans-serif",
              padding: "2px 6px",
              borderRadius: 999,
              background: forced ? "rgba(244,162,97,.18)" : "rgba(62,154,92,.16)",
              border: forced ? "1px solid rgba(244,162,97,.35)" : "1px solid rgba(62,154,92,.35)",
              color: forced ? P.warning : (P.success || "#3E9A5C"),
            }} title={forced ? "Committed (non-compliant)" : "Committed"}>
              {forced ? "Committed*" : "Committed"}
            </span>
          )}
        </div>
        <span style={{
          font: "normal 700 12px/16px 'Inter',sans-serif",
          color: sTotal >= 90 ? P.success : P.purple,
        }}>{sTotal.toFixed(1)}</span>
      </div>

      {hasHardViolations && (
        <div style={{ marginTop: 2, color: P.danger, font: "normal 600 11px/14px 'Inter',sans-serif" }}>
          Hard constraint violated ({hv.hardViolations.length})
        </div>
      )}
      {!hasHardViolations && hardWarningsCount > 0 && (
        <div style={{ marginTop: 2, color: P.warning, font: "normal 600 11px/14px 'Inter',sans-serif" }}>
          Warnings ({hardWarningsCount})
        </div>
      )}

      {/* Metrics grid — context Archistar style: 2-col, label: value */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
        {[
          ["Rooms", o.totalKeys],
          ["GFA", `${o.gia?.toLocaleString()}m²`],
          ["Storeys", o.storeys],
          ["Cost/Key", fmt(o.costPerKey || 0)],
          ["Open Space", o.outdoorArea ? `${o.outdoorArea}m²` : "–"],
          ["Site Coverage", o.footprint ? `${((o.footprint / 3599.1) * 100).toFixed(0)}%` : "–"],
        ].map(([label, value]) => (
          <div key={label} style={{ font: "normal 400 11px/14px 'Inter',sans-serif" }}>
            <span style={{ color: P.sub }}>{label}: </span>
            <span style={{ fontWeight: 600, color: P.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Selected indicator — context "Design selected for proposal" */}
      {selected && (
        <div style={{
          marginTop: 8, font: "normal 500 11px/14px 'Inter',sans-serif",
          color: P.purple, textAlign: "center",
        }}>Design selected for proposal</div>
      )}
    </div>
  );
}
