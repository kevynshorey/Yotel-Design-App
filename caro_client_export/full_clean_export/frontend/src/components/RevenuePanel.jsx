import P from "../utils/colours";

const fmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}k` : `$${n?.toFixed(0) || 0}`;

function Row({ label, value, bold, accent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", padding: "2px 0",
      font: "normal 400 11px/14px 'Inter',sans-serif",
    }}>
      <span style={{ color: bold ? P.text : P.sub, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: accent ? P.purple : P.text }}>{value}</span>
    </div>
  );
}

export default function RevenuePanel({ option: o }) {
  if (!o) return null;
  const r = o.revenue || {};
  return (
    <div style={{
      background: "#fff", borderRadius: 4, padding: "12px 16px",
      border: `1px solid ${P.borderL}`,
    }}>
      <div style={{ font: "normal 700 12px/16px 'Inter',sans-serif", color: P.text, marginBottom: 10 }}>
        Revenue (Y3 stabilised)
      </div>

      <Row label="RevPAR" value={`$${r.revpar?.toFixed(0) || 164}`} bold />
      <Row label="Occupancy" value={`${r.occupancy || 72}%`} />
      <Row label="ADR" value={`$${r.adr?.toFixed(0) || 228}`} />

      <div style={{ height: 1, background: P.border, margin: "6px 0" }} />

      <Row label="Total revenue" value={fmt(r.totalRevenue || 9900000)} bold />
      <Row label="GOP" value={`${r.gopMargin || 44}%`} />
      <Row label="NOI" value={fmt(r.noi || 2800000)} bold accent />
      <Row label="NOI / key" value={fmt(r.noiPerKey || 21900)} />

      <div style={{ height: 1, background: P.border, margin: "6px 0" }} />

      <Row label="Total cost" value={fmt(o.totalCost || 0)} />
      <Row label="Yield on cost" value={`${r.noi && o.totalCost ? ((r.noi / o.totalCost) * 100).toFixed(1) : "8.5"}%`} bold accent />
      <Row label="Cap rate (6.5%)" value={fmt(r.noi ? r.noi / .065 : 43000000)} />
    </div>
  );
}
