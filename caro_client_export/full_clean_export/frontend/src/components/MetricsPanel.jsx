import P from "../utils/colours";

const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}k` : `$${n}`;

function scorePoints(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object") {
    // Backend score_breakdown shape: { raw, weighted, reason }
    if (typeof value.weighted === "number" && Number.isFinite(value.weighted)) return value.weighted * 100;
    if (typeof value.raw === "number" && Number.isFinite(value.raw)) return value.raw * 100;
  }
  return null;
}

function totalScore(score) {
  if (typeof score === "number" && Number.isFinite(score)) return score;
  if (score && typeof score === "object") {
    if (typeof score.total === "number" && Number.isFinite(score.total)) return score.total;
    const vals = Object.values(score).map(scorePoints).filter(v => v !== null);
    if (vals.length) return vals.reduce((a, b) => a + b, 0);
  }
  return 0;
}

/* context metric row — like context's area metrics: label left, value right, 32px height */
function Row({ label, value, unit, indent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: indent ? "0 0 0 16px" : 0,
      minHeight: 28, font: "normal 400 11px/14px 'Inter',sans-serif",
    }}>
      <span style={{ color: indent ? P.sub : P.text }}>{label}</span>
      <span>
        <span style={{ fontWeight: 600, color: P.text }}>{value}</span>
        {unit && <span style={{ color: P.dim, fontSize: 10, marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
}

/* context collapsible section — 12-bold header with ▸ chevron */
function Section({ title, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen}>
      <summary style={{
        font: "normal 700 12px/16px 'Inter',sans-serif", color: P.text,
        cursor: "pointer", padding: "8px 0",
        borderBottom: `1px solid ${P.border}`,
        listStyle: "none", display: "flex", alignItems: "center", gap: 6,
        userSelect: "none",
      }}>
        <span style={{ fontSize: 9, color: P.sub, transition: "transform .15s" }}>▸</span>
        {title}
      </summary>
      <div style={{ padding: "4px 0" }}>{children}</div>
    </details>
  );
}

export default function MetricsPanel({ option: o }) {
  if (!o) return null;
  const s = o.score || {};
  const sTotal = totalScore(s);
  const hv = o.hardValidation || {};
  const hardViolations = hv.hardViolations || [];
  const hardWarnings = hv.hardWarnings || [];
  const isValid = hv.isValid !== false && hardViolations.length === 0;
  return (
    <div style={{
      height: "100%", overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      {/* context header — "Analyze" */}
      <div style={{
        height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", borderBottom: `1px solid ${P.border}`, flexShrink: 0,
      }}>
        <span style={{ font: "normal 700 14px/20px 'Inter',sans-serif", color: P.text }}>Analyze</span>
      </div>

      {/* Area metrics label */}
      <div style={{ padding: "12px 16px 4px", font: "normal 700 12px/16px 'Inter',sans-serif", color: P.text }}>
        Area metrics
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <Section title="Validation" defaultOpen={false}>
          <Row label="Hard requirements" value={isValid ? "OK" : "Violated"} />
          {hardViolations.slice(0, 8).map((v, i) => (
            <Row key={`v-${i}`} label={`- ${v}`} value="" indent />
          ))}
          {hardWarnings.slice(0, 8).map((w, i) => (
            <Row key={`w-${i}`} label={`- ${w}`} value="" indent />
          ))}
        </Section>

        <Section title="Building">
          <Row label="Form" value={o.form} />
          <Row label="Storeys" value={o.storeys} />
          <Row label="Total keys" value={o.totalKeys} />
          <Row label="YOTEL rooms" value={o.ytRooms} indent />
          <Row label="YOTELPAD units" value={o.padUnits} indent />
        </Section>

        <Section title="Areas">
          <Row label="Site area" value="5,965" unit="m²" />
          <Row label="Buildable" value="3,599" unit="m²" />
          <Row label="GFA" value={o.gia?.toLocaleString()} unit="m²" />
          <Row label="GIA" value={o.gia?.toLocaleString()} unit="m²" indent />
          <Row label="Avg room" value={o.avgRoom?.toFixed(1)} unit="m²" indent />
          <Row label="Footprint" value={o.footprint?.toLocaleString()} unit="m²" />
          <Row label="Outdoor" value={o.outdoorArea?.toLocaleString()} unit="m²" />
          <Row label="BC" value={o.footprint ? `${((o.footprint / 3599.1) * 100).toFixed(0)}` : "–"} unit="%" />
          <Row label="FSR" value={o.gia ? `${(o.gia / 5965).toFixed(2)}` : "–"} unit=":1" />
        </Section>

        <Section title="Cost">
          <Row label="Total cost" value={fmt(o.totalCost || 0)} />
          <Row label="Cost / key" value={fmt(o.costPerKey || 0)} />
          <Row label="Construction" value={fmt(o.constructionCost || 0)} indent />
          <Row label="Land + site" value="$5.7M" indent />
        </Section>

        <Section title="Score" defaultOpen={false}>
          <Row label="Total" value={sTotal.toFixed(1)} unit="/100" />
          {Object.entries(s).filter(([k]) => k !== "total").map(([k, v]) => (
            <Row
              key={k}
              label={k.replace(/_/g, " ")}
              value={(scorePoints(v) ?? "–") !== "–" ? scorePoints(v).toFixed(1) : "–"}
              indent
            />
          ))}
        </Section>

        {/* Efficiency — context style */}
        <div style={{
          marginTop: 8, padding: "8px 0", borderTop: `1px solid ${P.border}`,
          display: "flex", justifyContent: "space-between",
          font: "normal 400 11px/14px 'Inter',sans-serif",
        }}>
          <span style={{ color: P.sub }}>Efficiency factor</span>
          <span style={{ fontWeight: 700, color: P.purple }}>
            {o.gia && o.totalKeys && o.avgRoom ? `${((o.avgRoom * o.totalKeys / o.gia) * 100).toFixed(0)}%` : "–"}
          </span>
        </div>

        <div style={{
          marginTop: 4, display: "flex", justifyContent: "space-between",
          font: "normal 400 11px/14px 'Inter',sans-serif",
        }}>
          <span style={{ color: P.sub }}>Number of living units</span>
          <span style={{ fontWeight: 600, color: P.text }}>{o.totalKeys}</span>
        </div>
      </div>
    </div>
  );
}
