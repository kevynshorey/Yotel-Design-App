import { useState } from "react";
import OptionCard from "./components/OptionCard";
import MetricsPanel from "./components/MetricsPanel";
import ScoringPanel from "./components/ScoringPanel";
import RevenuePanel from "./components/RevenuePanel";
import CommitDialog from "./components/CommitDialog";
import NewFormaStage from "./components/newforma/NewFormaStage";
import useOptions from "./hooks/useOptions";
import P from "./utils/colours";

export default function App() {
  const { options, sorted, selected, selectedIdx, setSelectedIdx, addOption, saveOptionAnyway, commitOption, scoring, sortBy, setSortBy } = useOptions();
  const [viewKey, setViewKey] = useState("{3D}");
  const [resetCount, setResetCount] = useState(0);
  const [designSet, setDesignSet] = useState("A");
  const [visualStyle, setVisualStyle] = useState("Realistic");
  const [basemap, setBasemap] = useState("satellite");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [commitOpen, setCommitOpen] = useState(false);
  const [params, setParams] = useState({ form: "C", floorArea: 770, wingWidth: 14, storeys: 6, corridor: "double", ytRooms: 100, padUnits: 30, outdoorPos: "WEST" });

  if (!selected) return null;
  const toggleView = v => { setViewKey(v); setResetCount(c => c + 1); };
  const sel = { padding: "4px 8px", borderRadius: 4, fontSize: 11, border: "1px solid rgba(60,60,60,.25)", color: "#3C3C3C", background: "#fff", outline: "none", cursor: "pointer", height: 28 };

  /* Collapse tab — always visible along the edge, works as both fold/unfold */
  const CollapseTab = ({ side, open, toggle }) => (
    <div onClick={toggle} style={{
      position: "absolute", top: 0, bottom: 0,
      [side === "left" ? "right" : "left"]: 0,
      width: 20, display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: 30, userSelect: "none",
    }}>
      <div style={{
        width: 20, height: 48, borderRadius: side === "left" ? "0 4px 4px 0" : "4px 0 0 4px",
        background: "#535353", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, boxShadow: "0 2px 6px rgba(0,0,0,.15)", writingMode: "vertical-lr",
      }}>
        {side === "left" ? (open ? "◂" : "▸") : (open ? "▸" : "◂")}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter','Artifakt Element',system-ui,sans-serif", background: "#F0F1F3", height: "100vh", display: "flex", overflow: "hidden" }}>

      {/* ═══ LEFT PANEL ═══ */}
      <div style={{ width: leftOpen ? 316 : 20, flexShrink: 0, position: "relative", transition: "width .25s ease" }}>
        {leftOpen && (
          <div style={{ width: 296, height: "calc(100vh - 32px)", margin: "16px 0 16px 16px", background: "#fff", borderRadius: 4, boxShadow: P.shadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid rgba(60,60,60,.1)", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#3C3C3C" }}>Generator Results</span>
              <span style={{ fontSize: 11, color: "#808080" }}>v1.0</span>
            </div>
            {/* Controls */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(60,60,60,.1)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#808080", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Type</div>
                  <select value={params.form} onChange={e => setParams(p => ({ ...p, form: e.target.value }))} style={{ ...sel, width: "100%" }}>
                    {["BAR", "BAR_NS", "L", "U", "C"].map(f => <option key={f} value={f}>{f === "BAR_NS" ? "BAR ↕" : f}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#808080", marginBottom: 3, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Set</div>
                  <select value={designSet} onChange={e => setDesignSet(e.target.value)} style={{ ...sel, width: "100%" }}>
                    {["A", "B", "C"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {[{ k: "ytRooms", l: "YOTEL", min: 60, max: 150, step: 5 }, { k: "padUnits", l: "PAD", min: 15, max: 50, step: 5 }, { k: "storeys", l: "Storeys", min: 4, max: 9, step: 1 }, { k: "floorArea", l: "Area m²", min: 500, max: 1100, step: 50 }].map(({ k, l, min, max, step }) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, height: 30 }}>
                  <span style={{ fontSize: 10, color: "#808080", width: 48, flexShrink: 0 }}>{l}</span>
                  <input type="range" min={min} max={max} step={step} value={params[k]} onChange={e => setParams(p => ({ ...p, [k]: +e.target.value }))} style={{ flex: 1, accentColor: P.purple, height: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#3C3C3C", width: 32, textAlign: "right" }}>{params[k]}</span>
                </div>
              ))}
              <button onClick={() => addOption(params, designSet)} style={{ marginTop: 8, width: "100%", height: 34, borderRadius: 4, border: "none", background: P.purple, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Generate New Designs</button>
            </div>
            {/* Sort */}
            <div style={{ display: "flex", gap: 4, padding: "6px 16px", borderBottom: "1px solid rgba(60,60,60,.1)", flexShrink: 0 }}>
              {[["score", "Score"], ["keys", "Keys"], ["cost", "$/Key"]].map(([k, l]) => (
                <button key={k} onClick={() => setSortBy(k)} style={{ padding: "3px 8px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, background: sortBy === k ? P.purple : "transparent", color: sortBy === k ? "#fff" : "#808080" }}>{l}</button>
              ))}
            </div>
            {/* Options */}
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px" }}>
              {sorted.map((o, i) => <OptionCard key={i} option={o} selected={options.indexOf(o) === selectedIdx} onSelect={() => setSelectedIdx(options.indexOf(o))} />)}
            </div>
          </div>
        )}
        <CollapseTab side="left" open={leftOpen} toggle={() => setLeftOpen(!leftOpen)} />
      </div>

      {/* ═══ CENTER ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, padding: "16px 8px" }}>
        <NewFormaStage
          selected={selected}
          viewKey={viewKey}
          setViewKey={toggleView}
          visualStyle={visualStyle}
          setVisualStyle={setVisualStyle}
          basemap={basemap}
          setBasemap={setBasemap}
          outdoorPos={params.outdoorPos}
          setOutdoorPos={(v) => setParams((p) => ({ ...p, outdoorPos: v }))}
        />

        {/* Bottom toggle — always visible */}
        <div onClick={() => setBottomOpen(!bottomOpen)} style={{
          height: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 11, fontWeight: 500, color: "#808080", userSelect: "none",
          background: bottomOpen ? "transparent" : "#fff", borderRadius: bottomOpen ? 0 : "0 0 4px 4px",
          boxShadow: bottomOpen ? "none" : P.shadow, marginTop: bottomOpen ? 0 : -2,
        }}>
          {bottomOpen ? "▾ Hide analysis" : "▴ Scoring & Revenue"}
        </div>
        {bottomOpen && (
          <div style={{ background: "#fff", borderRadius: 4, boxShadow: P.shadow, flexShrink: 0, marginTop: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 10 }}>
              <ScoringPanel option={selected} scoring={scoring} />
              <RevenuePanel option={selected} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div style={{ width: rightOpen ? 276 : 20, flexShrink: 0, position: "relative", transition: "width .25s ease" }}>
        {rightOpen && (
          <div style={{ width: 256, height: "calc(100vh - 32px)", margin: "16px 16px 16px 0", background: "#fff", borderRadius: 4, boxShadow: P.shadow, overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "10px 12px", borderBottom: `1px solid ${P.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setCommitOpen(true)}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: P.purple,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  title="Commit selected option to project"
                >
                  Commit option
                </button>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <MetricsPanel option={selected} />
              </div>
            </div>
          </div>
        )}
        <CollapseTab side="right" open={rightOpen} toggle={() => setRightOpen(!rightOpen)} />
      </div>

      <CommitDialog
        open={commitOpen}
        option={selected}
        onCancel={() => setCommitOpen(false)}
        onConfirmCommit={() => {
          commitOption(selectedIdx, { force: false });
          setCommitOpen(false);
        }}
        onSaveAnyway={() => {
          saveOptionAnyway(selectedIdx);
          commitOption(selectedIdx, { force: true });
          setCommitOpen(false);
        }}
      />
    </div>
  );
}
