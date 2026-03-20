import P from "../utils/colours";
import VIEWS from "../utils/cameraPresets";

const GROUPS = {
  "3D": ["{3D}", "SE Iso", "NW Iso"],
  "Elevations": ["West", "East", "South", "North"],
  "Plans": ["Site Plan", "Floor Plan"],
};

/* context toolbar button: border-radius 4px, padding 5px 12px, 11px font */
function TBtn({ children, active, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      padding: "4px 8px", borderRadius: 4, cursor: "pointer",
      border: active ? `1.5px solid ${P.purple}` : "1px solid transparent",
      background: active ? P.purpleFaint : "transparent",
      color: active ? P.purple : P.sub,
      font: `normal ${active ? 600 : 400} 11px/14px 'Inter',sans-serif`,
      transition: "all .12s ease",
    }}>{children}</button>
  );
}

export default function ControlBar({ viewKey, setViewKey, outdoorPos, setOutdoorPos, visualStyle, setVisualStyle, basemap, setBasemap }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      padding: "0 8px", height: 36,
      background: "#fff", borderRadius: 4, boxShadow: P.shadow,
      marginBottom: 8, flexWrap: "wrap",
    }}>
      {Object.entries(GROUPS).map(([group, keys]) => (
        <div key={group} style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px", borderRight: `1px solid ${P.border}` }}>
          <span style={{ font: "normal 700 9px/14px 'Inter',sans-serif", color: P.dim, marginRight: 4, textTransform: "uppercase", letterSpacing: .6 }}>{group}</span>
          {keys.map(k => <TBtn key={k} active={viewKey === k} onClick={() => setViewKey(k)} title={VIEWS[k]?.label}>{k}</TBtn>)}
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px", borderRight: `1px solid ${P.border}` }}>
        <span style={{ font: "normal 700 9px/14px 'Inter',sans-serif", color: P.dim, marginRight: 4, textTransform: "uppercase", letterSpacing: .6 }}>Style</span>
        {["Realistic", "Shaded", "Wireframe", "Consistent"].map(s => (
          <TBtn key={s} active={visualStyle === s} onClick={() => setVisualStyle(s)}>{s}</TBtn>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px", borderRight: `1px solid ${P.border}` }}>
        <span style={{ font: "normal 700 9px/14px 'Inter',sans-serif", color: P.dim, marginRight: 4, textTransform: "uppercase", letterSpacing: .6 }}>Map</span>
        {[["satellite", "Satellite"], ["street", "Street"], ["topo", "Topo"], ["none", "None"]].map(([k, l]) => (
          <TBtn key={k} active={basemap === k} onClick={() => setBasemap(k)}>{l}</TBtn>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px" }}>
        <span style={{ font: "normal 700 9px/14px 'Inter',sans-serif", color: P.dim, marginRight: 4, textTransform: "uppercase", letterSpacing: .6 }}>Outdoor</span>
        {[["WEST", "Beach"], ["ROOFTOP", "Roof"], ["BOTH", "Both"]].map(([k, l]) => (
          <TBtn key={k} active={outdoorPos === k} onClick={() => setOutdoorPos(k)}>{l}</TBtn>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => setViewKey("{3D}")} style={{
          padding: "4px 10px", borderRadius: 4,
          border: `1px solid ${P.border}`, background: "transparent",
          color: P.sub, font: "normal 500 10px/14px 'Inter',sans-serif", cursor: "pointer",
        }}>↺ Reset</button>
        <span style={{ font: "normal 400 9px/14px 'Inter',sans-serif", color: P.dim }}>drag · right-drag · scroll</span>
      </div>
    </div>
  );
}
