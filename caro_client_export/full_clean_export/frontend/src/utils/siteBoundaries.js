// Canonical site + offset boundary used by the viewer and validators.
// Coordinates are in metres from Revit project base point (Dynamo export).

export const SITE_BOUNDARY = [
  [1.009, -0.301],
  [-10.767, 26.325],
  [9.35, 34.945],
  [41.455, 54.551],
  [70.225, 57.869],
  [99.271, 64.064],
  [116.286, 65.293],
  [120.661, 7.772],
  [71.756, 5.659],
  [23.308, 3.414],
  [1.009, -0.301],
];

export const OFFSET_BOUNDARY = [
  [66.161, 8.403],
  [35.597, 8.403],
  [35.597, 46.533],
  [42.789, 50.678],
  [70.873, 53.917],
  [85.741, 57.088],
  [113.901, 57.088],
  [115.434, 36.933],
  [115.434, 10.549],
  [71.622, 8.656],
  [66.161, 8.403],
];

// Building placement used in Viewer3D.
// If this changes, keep validators consistent.
export const BUILDING_PLACEMENT = {
  x: 65,
  z: 9,
  rotDeg: 8,
};

