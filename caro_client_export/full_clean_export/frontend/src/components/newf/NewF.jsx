import { useEffect, useRef, useState } from "react";
import Viewer3D from "../Viewer3D";
import P from "../../utils/colours";
import { registerNewFormaElements } from "./NewFormaElements";

function ToolBtn({ action, label, icon, active, onClick, shortcut }) {
  return (
    <div style={{ position: "relative" }}>
      <newforma-toolbar-button
        action={action}
        label={label}
        icon={icon}
        active={active ? "" : null}
        onClick={() => onClick(action)}
        title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "calc(100% + 6px)",
          background: "rgba(32,32,32,.95)",
          color: "#fff",
          borderRadius: 6,
          padding: "4px 6px",
          font: "500 10px/1 Inter, system-ui, sans-serif",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity .12s ease",
          whiteSpace: "nowrap",
        }}
        className="nf-tooltip"
      >
        {label}
        {shortcut ? ` · ${shortcut}` : ""}
      </div>
    </div>
  );
}

export default function NewFormaStage({
  selected,
  viewKey,
  setViewKey,
  visualStyle,
  setVisualStyle,
  basemap,
  setBasemap,
  outdoorPos,
  setOutdoorPos,
}) {
  const [resetCount, setResetCount] = useState(0);
  const [leftTool, setLeftTool] = useState("select");
  const [activeContextTab, setActiveContextTab] = useState("contextual-data");
  const [layersSidebarOpen, setLayersSidebarOpen] = useState(true);
  const [layerFilter, setLayerFilter] = useState("");
  const [basemapOpen, setBasemapOpen] = useState(false);
  const [toolbarMoreOpen, setToolbarMoreOpen] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState("Design");
  const [contextGroupsOpen, setContextGroupsOpen] = useState({
    site: true,
    environment: true,
    regulation: false,
  });
  const rootRef = useRef(null);
  const [layers, setLayers] = useState({
    terrain: true,
    roads: false,
    vegetation: false,
    siteBoundary: false,
    offset: false,
    context: false,
    hotel: true,
    outdoor: true,
  });

  useEffect(() => {
    registerNewFormaElements();
  }, []);

  useEffect(() => {
    const closeFloating = (ev) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(ev.target)) {
        setToolbarMoreOpen(false);
        setBasemapOpen(false);
      }
    };
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setToolbarMoreOpen(false);
        setBasemapOpen(false);
      }
      if (ev.key.toLowerCase() === "r") handleTopAction("reset");
      if (ev.key.toLowerCase() === "m") setBasemapOpen((s) => !s);
      if (ev.key.toLowerCase() === "l") setLayersSidebarOpen((s) => !s);
    };
    window.addEventListener("mousedown", closeFloating);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", closeFloating);
      window.removeEventListener("keydown", onKey);
    };
  });

  const handleTopAction = (action) => {
    if (action.startsWith("view:")) setViewKey(action.replace("view:", ""));
    if (action.startsWith("style:")) setVisualStyle(action.replace("style:", ""));
    if (action.startsWith("outdoor:")) setOutdoorPos(action.replace("outdoor:", ""));
    if (action === "reset") {
      setViewKey("{3D}");
      setResetCount((c) => c + 1);
    }
  };

  return (
    <div ref={rootRef} style={{ flex: 1, minHeight: 0, borderRadius: 4, overflow: "hidden", position: "relative" }}>
      <style>
        {`
          .nf-tooltip{display:none}
          div:hover > .nf-tooltip{display:block;opacity:1}
          .nf-menu-item:hover{background:rgba(122,69,235,.08)}
          .nf-collapse:hover{background:rgba(122,69,235,.08)}
          .nf-layer-row:hover{background:rgba(122,69,235,.07)}
          .nf-icon-btn:hover{background:rgba(122,69,235,.09)}
        `}
      </style>
      {/* NewForma-like top navbar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          background: "rgba(255,255,255,.96)",
          borderBottom: "1px solid rgba(60,60,60,.12)",
          zIndex: 48,
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            title="Back"
            style={{
              border: "none",
              background: "transparent",
              width: 28,
              height: 28,
              borderRadius: 6,
              color: "#4A4A4A",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ←
          </button>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: "#7A45EB" }} />
          <div style={{ font: "700 12px/1 Inter, system-ui, sans-serif", color: "#2E2E2E" }}>Barbados Masterplan</div>
          <div
            style={{
              height: 18,
              width: 1,
              background: "rgba(60,60,60,.16)",
              margin: "0 2px 0 4px",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {["Design", "Explore", "Analyze"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTopTab(tab)}
                style={{
                  border: "none",
                  background: activeTopTab === tab ? "rgba(122,69,235,.13)" : "transparent",
                  color: activeTopTab === tab ? "#5E35B1" : "#5A5A5A",
                  borderRadius: 6,
                  height: 26,
                  padding: "0 10px",
                  font: "600 11px/1 Inter, system-ui, sans-serif",
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={{
              border: "1px solid rgba(60,60,60,.15)",
              background: "#fff",
              borderRadius: 6,
              height: 28,
              padding: "0 10px",
              font: "600 11px/1 Inter, system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            Share
          </button>
          <button
            type="button"
            title="Notifications"
            style={{
              border: "1px solid rgba(60,60,60,.14)",
              background: "#fff",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              color: "#5D5D5D",
            }}
          >
            ⌁
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 2 }}>
            {["A", "C"].map((initial, i) => (
              <div
                key={initial}
                title={`Member ${initial}`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: i === 0 ? "#6A90E8" : "#5FB299",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "700 10px/1 Inter, system-ui, sans-serif",
                }}
              >
                {initial}
              </div>
            ))}
          </div>
          <button
            type="button"
            style={{
              border: "none",
              background: "#7A45EB",
              color: "#fff",
              borderRadius: 6,
              height: 28,
              padding: "0 11px",
              font: "600 11px/1 Inter, system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            Publish
          </button>
        </div>
      </div>

      <Viewer3D
        option={selected}
        viewKey={viewKey}
        key={`newforma-view-${resetCount}`}
        layers={layers}
        visualStyle={visualStyle}
        basemap={basemap}
      />

      {/* Viewer chrome overlays (closer to design-mode viewport shell) */}
      <div
        style={{
          position: "absolute",
          left: 10,
          right: layersSidebarOpen ? 278 : 10,
          top: 56,
          bottom: 10,
          border: "1px solid rgba(255,255,255,.45)",
          borderRadius: 8,
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: layersSidebarOpen ? 292 : 16,
          bottom: 16,
          zIndex: 46,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid rgba(60,60,60,.2)",
            background: "rgba(255,255,255,.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "700 11px/1 Inter, system-ui, sans-serif",
            color: "#444",
          }}
          title="North"
        >
          N
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "1px solid rgba(60,60,60,.2)",
            background: "rgba(255,255,255,.92)",
            display: "grid",
            placeItems: "center",
            font: "700 12px/1 Inter, system-ui, sans-serif",
            color: "#444",
          }}
          title="Toggle 2D/3D"
        >
          3D
        </div>
        <div
          style={{
            background: "rgba(255,255,255,.92)",
            border: "1px solid rgba(60,60,60,.14)",
            borderRadius: 7,
            padding: "5px 8px",
            font: "600 10px/1 Inter, system-ui, sans-serif",
            color: "#4C4C4C",
          }}
          title="Viewport info"
        >
          3D View · 1:500
        </div>
      </div>

      {/* Top-center floating toolbar */}
      <div style={{ position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)", zIndex: 44 }}>
        <div style={{ position: "relative" }}>
          <newforma-toolbar direction="horizontal">
            <ToolBtn action="view:{3D}" label="3D" active={viewKey === "{3D}"} onClick={handleTopAction} />
            <ToolBtn action="view:West" label="W" shortcut="1" active={viewKey === "West"} onClick={handleTopAction} />
            <ToolBtn action="view:South" label="S" shortcut="2" active={viewKey === "South"} onClick={handleTopAction} />
            <ToolBtn action="view:Site Plan" label="Plan" shortcut="P" active={viewKey === "Site Plan"} onClick={handleTopAction} />
            <span style={{ width: 1, height: 18, background: "rgba(60,60,60,.14)", margin: "0 2px" }} />
            <ToolBtn action="style:Realistic" label="Real" shortcut="Q" active={visualStyle === "Realistic"} onClick={handleTopAction} />
            <ToolBtn action="style:Wireframe" label="Wire" shortcut="E" active={visualStyle === "Wireframe"} onClick={handleTopAction} />
            <span style={{ width: 1, height: 18, background: "rgba(60,60,60,.14)", margin: "0 2px" }} />
            <ToolBtn action="outdoor:WEST" label="Beach" active={outdoorPos === "WEST"} onClick={handleTopAction} />
            <ToolBtn action="outdoor:BOTH" label="Both" active={outdoorPos === "BOTH"} onClick={handleTopAction} />
            <ToolBtn action="reset" label="Reset" icon="↺" shortcut="R" onClick={handleTopAction} />
            <button
              type="button"
              onClick={() => setToolbarMoreOpen((s) => !s)}
              style={{
                border: "1px solid rgba(60,60,60,.14)",
                background: "#fff",
                borderRadius: 6,
                height: 28,
                padding: "0 8px",
                font: "600 11px/1 Inter, system-ui, sans-serif",
                cursor: "pointer",
                color: "#4D4D4D",
              }}
            >
              More ▾
            </button>
          </newforma-toolbar>

          {toolbarMoreOpen && (
            <div
              style={{
                position: "absolute",
                top: 38,
                right: 0,
                width: 172,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid rgba(60,60,60,.12)",
                boxShadow: "0 8px 20px rgba(0,0,0,.16)",
                padding: "6px 0",
                zIndex: 49,
              }}
            >
              {[
                ["view:East", "View East"],
                ["view:North", "View North"],
                ["style:Shaded", "Style Shaded"],
                ["style:Consistent", "Style Consistent"],
                ["outdoor:ROOFTOP", "Outdoor Roof"],
              ].map(([action, label]) => (
                <div
                  key={action}
                  className="nf-menu-item"
                  onClick={() => {
                    handleTopAction(action);
                    setToolbarMoreOpen(false);
                  }}
                  style={{
                    padding: "6px 12px",
                    font: "500 11px/1.2 Inter, system-ui, sans-serif",
                    color: "#3D3D3D",
                    cursor: "pointer",
                  }}
                  title={label}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left contextual tab rail */}
      <div style={{ position: "absolute", top: 110, left: 12, zIndex: 46, display: "flex", gap: 8 }}>
        <div
          style={{
            width: 36,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 8px 20px rgba(0,0,0,.16)",
            border: "1px solid rgba(60,60,60,.12)",
            padding: "6px 0",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
          }}
        >
          {[
            ["contextual-data", "◎", "Contextual data"],
            ["analysis", "◫", "Analysis"],
            ["scenarios", "◩", "Scenarios"],
          ].map(([id, icon, title]) => (
            <button
              key={id}
              type="button"
              title={title}
              onClick={() => setActiveContextTab((prev) => (prev === id ? "" : id))}
              style={{
                all: "unset",
                width: 26,
                height: 26,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                font: "600 12px/1 Inter, system-ui, sans-serif",
                color: activeContextTab === id ? "#5E35B1" : "#5D5D5D",
                background: activeContextTab === id ? "rgba(122,69,235,.14)" : "transparent",
              }}
            >
              {icon}
            </button>
          ))}
        </div>

        {activeContextTab && (
          <div
            style={{
              width: 248,
              maxHeight: 360,
              overflow: "auto",
              background: "#fff",
              borderRadius: 10,
              border: "1px solid rgba(60,60,60,.12)",
              boxShadow: "0 8px 20px rgba(0,0,0,.16)",
              padding: 10,
            }}
          >
            <div style={{ font: "700 12px/1.2 Inter, system-ui, sans-serif", color: "#2E2E2E", marginBottom: 8 }}>
              {activeContextTab === "contextual-data"
                ? "Contextual Data"
                : activeContextTab === "analysis"
                ? "Analysis"
                : "Scenarios"}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {(activeContextTab === "contextual-data"
                ? [
                    ["site", "Site Layers", ["Nearby Buildings", "Roads", "Vegetation"]],
                    ["environment", "Environment", ["Sunlight", "Wind", "Noise"]],
                    ["regulation", "Regulation", ["Height Cap", "Setback", "Coverage"]],
                  ]
                : activeContextTab === "analysis"
                ? [
                    ["site", "Metrics", ["GFA", "Coverage", "Height"]],
                    ["environment", "Quality", ["Outdoor Area", "Access", "Views"]],
                    ["regulation", "Cost", ["Cost/Key", "CAPEX", "Efficiency"]],
                  ]
                : [
                    ["site", "Scenario Set", ["Base", "Option A", "Option B", "Option C"]],
                    ["environment", "Comparison", ["Views", "Cost", "Yield"]],
                  ]
              ).map(([groupKey, groupTitle, items]) => (
                <div key={groupKey} style={{ border: "1px solid rgba(60,60,60,.1)", borderRadius: 8 }}>
                  <button
                    type="button"
                    className="nf-collapse"
                    onClick={() =>
                      setContextGroupsOpen((old) => ({ ...old, [groupKey]: !old[groupKey] }))
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      font: "600 11px/1 Inter, system-ui, sans-serif",
                      cursor: "pointer",
                      color: "#3C3C3C",
                    }}
                  >
                    <span>{groupTitle}</span>
                    <span style={{ fontSize: 10 }}>{contextGroupsOpen[groupKey] ? "▾" : "▸"}</span>
                  </button>
                  {contextGroupsOpen[groupKey] && (
                    <div style={{ padding: "2px 8px 8px 8px", display: "grid", gap: 5 }}>
                      {items.map((item) => (
                        <label
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            font: "500 11px/1.1 Inter, system-ui, sans-serif",
                            color: "#3B3B3B",
                            padding: "2px 0",
                          }}
                        >
                          <input type="checkbox" defaultChecked={item === "Base"} style={{ accentColor: "#7A45EB" }} />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Left floating vertical tool rail */}
      <div style={{ position: "absolute", top: 110, left: activeContextTab ? 316 : 60, zIndex: 40 }}>
        <newforma-toolbar direction="vertical">
          {[
            ["select", "↖", "Select"],
            ["move", "✥", "Move"],
            ["rotate", "⟳", "Rotate"],
            ["measure", "⌖", "Measure"],
          ].map(([k, icon, label]) => (
            <newforma-toolbar-button
              key={k}
              label={label}
              icon={icon}
              active={leftTool === k ? "" : null}
              onClick={() => setLeftTool(k)}
              title={label}
            />
          ))}
        </newforma-toolbar>
      </div>

      {/* Right floating menus */}
      <div style={{ position: "absolute", top: 110, right: 12, zIndex: 45, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setBasemapOpen((s) => !s)}
          style={{
            height: 28,
            borderRadius: 6,
            border: "1px solid rgba(60,60,60,.14)",
            background: "#fff",
            padding: "0 10px",
            font: "500 11px/1 Inter, system-ui, sans-serif",
            cursor: "pointer",
          }}
        >
          Basemap ▾
        </button>

        <button
          type="button"
          onClick={() => setLayersSidebarOpen((s) => !s)}
          style={{
            height: 28,
            borderRadius: 6,
            border: "1px solid rgba(60,60,60,.14)",
            background: "#fff",
            padding: "0 10px",
            font: "500 11px/1 Inter, system-ui, sans-serif",
            cursor: "pointer",
          }}
        >
          Layers {layersSidebarOpen ? "▸" : "◂"}
        </button>
      </div>

      {basemapOpen && (
        <div
          style={{
            position: "absolute",
            top: 144,
            right: 104,
            width: 164,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 8px 20px rgba(0,0,0,.16)",
            border: "1px solid rgba(60,60,60,.12)",
            zIndex: 45,
            padding: "6px 0",
          }}
        >
          {[
            ["satellite", "Satellite"],
            ["street", "Street"],
            ["topo", "Topo"],
            ["none", "None"],
          ].map(([k, l]) => (
            <div
              key={k}
              className="nf-menu-item"
              onClick={() => {
                setBasemap(k);
                setBasemapOpen(false);
              }}
              style={{
                padding: "6px 12px",
                font: "500 11px/1.2 Inter, system-ui, sans-serif",
                background: basemap === k ? "rgba(122,69,235,.12)" : "transparent",
                cursor: "pointer",
              }}
              title={l}
            >
              {l}
            </div>
          ))}
        </div>
      )}

      {layersSidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 12,
            bottom: 12,
            width: 260,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 20px rgba(0,0,0,.16)",
            border: "1px solid rgba(60,60,60,.12)",
            zIndex: 45,
            padding: "10px 0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "0 12px 10px 12px", borderBottom: "1px solid rgba(60,60,60,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ font: "700 12px/1.2 Inter, system-ui, sans-serif", color: "#2F2F2F" }}>
                Layers
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  className="nf-icon-btn"
                  title="Collapse all"
                  style={{
                    border: "none",
                    background: "transparent",
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  －
                </button>
                <button
                  type="button"
                  className="nf-icon-btn"
                  title="Close layers panel"
                  onClick={() => setLayersSidebarOpen(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                className="nf-icon-btn"
                title="All visible"
                style={{
                  border: "1px solid rgba(60,60,60,.14)",
                  background: "#fff",
                  height: 24,
                  borderRadius: 6,
                  padding: "0 8px",
                  cursor: "pointer",
                  font: "600 10px/1 Inter, system-ui, sans-serif",
                  color: "#505050",
                }}
              >
                All
              </button>
              <button
                type="button"
                className="nf-icon-btn"
                title="Hide all"
                style={{
                  border: "1px solid rgba(60,60,60,.14)",
                  background: "#fff",
                  height: 24,
                  borderRadius: 6,
                  padding: "0 8px",
                  cursor: "pointer",
                  font: "600 10px/1 Inter, system-ui, sans-serif",
                  color: "#505050",
                }}
              >
                None
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 12px 8px 12px", borderBottom: "1px solid rgba(60,60,60,.06)" }}>
            <div style={{ font: "700 10px/1.2 Inter, system-ui, sans-serif", color: "#7A7A7A", marginBottom: 5 }}>
              Filter
            </div>
            <input
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              placeholder="Search layers..."
              style={{
                width: "100%",
                height: 30,
                borderRadius: 6,
                border: "1px solid rgba(60,60,60,.16)",
                padding: "0 8px",
                font: "500 11px/1 Inter, system-ui, sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
            {[
              ["Site", [
                ["terrain", "Terrain", "#B0B8A4"],
                ["roads", "Roads", "#BBBEC4"],
                ["vegetation", "Vegetation", "#3A6830"],
                ["siteBoundary", "Site limits", "#CC3333"],
                ["offset", "Buildable zone", "#2266BB"],
              ]],
              ["Model", [
                ["hotel", "Hotel massing", P.hotel],
                ["outdoor", "Outdoor amenity", P.outdoor],
              ]],
              ["Context", [
                ["context", "Surrounding buildings", "#9CA4AE"],
              ]],
            ].map(([group, items]) => {
              const filtered = items.filter(([, label]) =>
                label.toLowerCase().includes(layerFilter.toLowerCase())
              );
              if (!filtered.length) return null;
              return (
                <div key={group} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      padding: "4px 12px 6px 12px",
                      font: "700 10px/1.2 Inter, system-ui, sans-serif",
                      color: "#6A6A6A",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    {group}
                  </div>
                  {filtered.map(([k, label, color]) => (
                    <label
                      key={k}
                      className="nf-layer-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 12px",
                        font: "500 11px/1 Inter, system-ui, sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!layers[k]}
                        onChange={() => setLayers((old) => ({ ...old, [k]: !old[k] }))}
                        style={{ accentColor: "#7A45EB" }}
                      />
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
                      <span style={{ flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 10, color: "#8A8A8A" }}>•</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

