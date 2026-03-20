/**
 * Revit-style camera presets.
 * ortho: true = use OrthographicCamera (elevations, plans, sections)
 * Target: centre of buildable zone ≈ (55, 8, 35)
 */
const VIEWS = {
  // 3D views
  "{3D}":         { pos: [-40, 60, 90],  target: [55, 8, 35], ortho: false, label: "Default 3D" },
  "SE Iso":       { pos: [130, 50, 100], target: [55, 8, 35], ortho: false, label: "SE Isometric" },
  "NW Iso":       { pos: [-20, 50, -30], target: [55, 8, 35], ortho: false, label: "NW Isometric" },
  // Elevations (orthographic)
  "West":         { pos: [-80, 12, 35],  target: [55, 12, 35], ortho: true, label: "West Elevation" },
  "East":         { pos: [190, 12, 35],  target: [55, 12, 35], ortho: true, label: "East Elevation" },
  "South":        { pos: [55, 12, -80],  target: [55, 12, 35], ortho: true, label: "South Elevation" },
  "North":        { pos: [55, 12, 150],  target: [55, 12, 35], ortho: true, label: "North Elevation" },
  // Plans
  "Site Plan":    { pos: [55, 200, 35],  target: [55, 0, 35],  ortho: true, label: "Site Plan", zoom: 0.7 },
  "Floor Plan":   { pos: [55, 200, 35],  target: [55, 0, 35],  ortho: true, label: "Floor Plan", zoom: 1.8 },
};

export default VIEWS;
