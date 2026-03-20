/**
 * Live data fetching for the 3D viewer.
 * All APIs are free and keyless. Fetches happen at runtime in the browser.
 *
 * Sources:
 *   Basemap:    ESRI World Imagery (satellite tiles)
 *   Buildings:  Overpass API (OSM building footprints + heights)
 *   Roads:      Overpass API (OSM highway network)
 *   Trees:      Overpass API (OSM natural=tree)
 *   Terrain:    Mapbox Terrain-RGB tiles (free tier, no key needed for raster-dem)
 */

const SITE_LAT = 13.090456;
const SITE_LON = -59.608805;
const OVERPASS = "https://overpass-api.de/api/interpreter";

// Convert lat/lon to local metres relative to site centre
function toLocal(lat, lon) {
  const dx = (lon - SITE_LON) * 111320 * Math.cos(SITE_LAT * Math.PI / 180);
  const dy = (lat - SITE_LAT) * 111320;
  return { x: Math.round(dx * 100) / 100, y: Math.round(dy * 100) / 100 };
}

// Tile coordinates for a given zoom level
export function getTileXY(lat, lon, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

// ESRI satellite tile URLs (5x5 grid centred on site)
export function getBasemapTiles(zoom = 17) {
  const centre = getTileXY(SITE_LAT, SITE_LON, zoom);
  const tiles = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      tiles.push({
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${centre.y + dy}/${centre.x + dx}`,
        dx, dy,
      });
    }
  }
  return { tiles, centre, zoom };
}

// Overpass query helper
async function overpassQuery(query) {
  try {
    const resp = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!resp.ok) throw new Error(`Overpass ${resp.status}`);
    const data = await resp.json();
    return data.elements || [];
  } catch (e) {
    console.warn("Overpass query failed:", e.message);
    return [];
  }
}

// Fetch OSM buildings with footprints + heights
export async function fetchBuildings(radius = 500) {
  const dlat = radius / 111320;
  const dlon = radius / (111320 * Math.cos(SITE_LAT * Math.PI / 180));
  const bbox = `${SITE_LAT - dlat},${SITE_LON - dlon},${SITE_LAT + dlat},${SITE_LON + dlon}`;

  const elements = await overpassQuery(
    `[out:json][timeout:25];(way["building"](${bbox}););out body;>;out skel qt;`
  );

  // Build node lookup
  const nodes = {};
  elements.filter(e => e.type === "node").forEach(n => { nodes[n.id] = [n.lat, n.lon]; });

  // Extract buildings
  const buildings = [];
  elements.filter(e => e.type === "way" && e.tags?.building).forEach(w => {
    const pts = (w.nodes || []).map(nid => {
      if (!nodes[nid]) return null;
      return toLocal(nodes[nid][0], nodes[nid][1]);
    }).filter(Boolean);

    if (pts.length < 3) return;

    // Height
    let h = 4; // default
    if (w.tags.height) h = parseFloat(w.tags.height) || 4;
    else if (w.tags["building:levels"]) h = parseFloat(w.tags["building:levels"]) * 3.2;

    // Bounding box for simplified rendering
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    buildings.push({
      id: w.id,
      name: w.tags.name || "",
      type: w.tags.building,
      h,
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      cy: (Math.min(...ys) + Math.max(...ys)) / 2,
      w: Math.max(...xs) - Math.min(...xs),
      d: Math.max(...ys) - Math.min(...ys),
      pts, // full polygon for detailed rendering
    });
  });

  return buildings;
}

// Fetch OSM roads
export async function fetchRoads(radius = 500) {
  const dlat = radius / 111320;
  const dlon = radius / (111320 * Math.cos(SITE_LAT * Math.PI / 180));
  const bbox = `${SITE_LAT - dlat},${SITE_LON - dlon},${SITE_LAT + dlat},${SITE_LON + dlon}`;

  const elements = await overpassQuery(
    `[out:json][timeout:25];(way["highway"](${bbox}););out body;>;out skel qt;`
  );

  const nodes = {};
  elements.filter(e => e.type === "node").forEach(n => { nodes[n.id] = [n.lat, n.lon]; });

  const roads = [];
  elements.filter(e => e.type === "way" && e.tags?.highway).forEach(w => {
    const pts = (w.nodes || []).map(nid => nodes[nid] ? toLocal(nodes[nid][0], nodes[nid][1]) : null).filter(Boolean);
    if (pts.length < 2) return;

    const hw = w.tags.highway;
    let width = 4;
    if (["primary", "secondary", "trunk"].includes(hw)) width = 8;
    else if (["tertiary", "unclassified"].includes(hw)) width = 6;
    else if (["residential", "service"].includes(hw)) width = 4;
    else if (["footway", "path", "cycleway"].includes(hw)) width = 2;

    roads.push({ id: w.id, name: w.tags.name || "", type: hw, width, pts });
  });

  return roads;
}

// Fetch OSM trees
export async function fetchTrees(radius = 400) {
  const dlat = radius / 111320;
  const dlon = radius / (111320 * Math.cos(SITE_LAT * Math.PI / 180));
  const bbox = `${SITE_LAT - dlat},${SITE_LON - dlon},${SITE_LAT + dlat},${SITE_LON + dlon}`;

  const elements = await overpassQuery(
    `[out:json][timeout:15];(node["natural"="tree"](${bbox}););out body;`
  );

  return elements.filter(e => e.type === "node").map(n => toLocal(n.lat, n.lon));
}

// Fetch coastline
export async function fetchCoastline(radius = 800) {
  const dlat = radius / 111320;
  const dlon = radius / (111320 * Math.cos(SITE_LAT * Math.PI / 180));
  const bbox = `${SITE_LAT - dlat},${SITE_LON - dlon},${SITE_LAT + dlat},${SITE_LON + dlon}`;

  const elements = await overpassQuery(
    `[out:json][timeout:15];(way["natural"="coastline"](${bbox});way["natural"="beach"](${bbox}););out body;>;out skel qt;`
  );

  const nodes = {};
  elements.filter(e => e.type === "node").forEach(n => { nodes[n.id] = [n.lat, n.lon]; });

  const lines = [];
  elements.filter(e => e.type === "way").forEach(w => {
    const pts = (w.nodes || []).map(nid => nodes[nid] ? toLocal(nodes[nid][0], nodes[nid][1]) : null).filter(Boolean);
    if (pts.length >= 2) lines.push({ type: w.tags?.natural || "coastline", pts });
  });

  return lines;
}

// Combined fetch — call once, caches in sessionStorage
export async function fetchAllContext() {
  const cached = sessionStorage.getItem("yotel_osm_ctx");
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }

  console.log("[MapData] Fetching OSM context...");
  const [buildings, roads, trees, coastline] = await Promise.all([
    fetchBuildings(500),
    fetchRoads(500),
    fetchTrees(400),
    fetchCoastline(800),
  ]);

  const result = { buildings, roads, trees, coastline, fetched: true };
  console.log(`[MapData] ${buildings.length} buildings, ${roads.length} roads, ${trees.length} trees, ${coastline.length} coastline segments`);

  try { sessionStorage.setItem("yotel_osm_ctx", JSON.stringify(result)); } catch {}
  return result;
}

// Fallback context (from context IFC) if APIs fail
export const FALLBACK_BUILDINGS = [
  {cx:13.5,cy:133.7,w:76.6,d:43.6,h:6.1},{cx:104.3,cy:153.4,w:53.7,d:20.9,h:4.4},
  {cx:124.2,cy:-45.1,w:35.1,d:19.7,h:4.3},{cx:-19.5,cy:-15.6,w:40.9,d:25.4,h:5.5},
  {cx:11.6,cy:103.6,w:25.8,d:28.5,h:4.5},{cx:71.8,cy:60.4,w:36.2,d:17.5,h:3.5},
  {cx:-4.9,cy:142.9,w:27.4,d:23.6,h:5.6},{cx:-23.6,cy:-45.5,w:25.6,d:22.7,h:4.1},
  {cx:131.2,cy:1.1,w:13.7,d:22.1,h:3.4},{cx:39.4,cy:114.4,w:14.8,d:22.0,h:4.3},
  {cx:106.8,cy:86.8,w:23.2,d:16.2,h:3.6},{cx:87.8,cy:117.3,w:13.9,d:18.9,h:3.5},
  {cx:-24.6,cy:95.0,w:22.9,d:21.5,h:4.5},{cx:-30.1,cy:27.2,w:17.8,d:19.0,h:3.8},
  {cx:73.0,cy:-20.3,w:12.2,d:15.8,h:3.9},{cx:-38.9,cy:38.3,w:23.7,d:17.1,h:4.6},
  {cx:58.1,cy:2.2,w:14.6,d:12.8,h:4.8},{cx:65.8,cy:-43.3,w:20.5,d:11.8,h:4.6},
  {cx:52.8,cy:-13.6,w:11.0,d:15.4,h:4.2},{cx:-18.0,cy:83.1,w:18.5,d:16.6,h:3.9},
  {cx:48.2,cy:31.0,w:12.2,d:11.2,h:12.2},{cx:4.7,cy:80.7,w:13.8,d:15.1,h:3.6},
  {cx:-1.0,cy:61.8,w:17.7,d:14.5,h:3.7},{cx:3.8,cy:51.9,w:16.4,d:13.6,h:3.5},
  {cx:-7.5,cy:68.5,w:15.9,d:14.1,h:3.7},{cx:21.0,cy:-8.2,w:13.6,d:7.2,h:3.6},
  {cx:81.5,cy:6.4,w:10.8,d:10.2,h:3.3},{cx:22.0,cy:-21.4,w:10.8,d:9.4,h:3.8},
  {cx:93.1,cy:5.5,w:8.0,d:11.1,h:3.3},{cx:62.3,cy:41.3,w:12.0,d:9.4,h:3.2},
  {cx:-49.0,cy:49.6,w:15.4,d:13.0,h:3.9},{cx:-3.9,cy:-23.4,w:16.4,d:14.6,h:3.9},
  {cx:-14.3,cy:-2.4,w:23.7,d:9.3,h:4.0},{cx:92.1,cy:-79.5,w:15.9,d:16.1,h:4.9},
];

export const FALLBACK_ROADS = [
  {width:8,pts:[{x:-20,y:-60},{x:-18,y:-30},{x:-15,y:0},{x:-12,y:30},{x:-8,y:60},{x:-5,y:90}]},
  {width:6,pts:[{x:-12,y:-20},{x:20,y:-22},{x:50,y:-18},{x:80,y:-15}]},
  {width:5,pts:[{x:60,y:65},{x:62,y:30},{x:60,y:0},{x:58,y:-20}]},
  {width:4,pts:[{x:-10,y:68},{x:30,y:70},{x:70,y:68},{x:110,y:66}]},
  {width:4,pts:[{x:-15,y:-15},{x:15,y:-18},{x:45,y:-16},{x:75,y:-15}]},
];

export const FALLBACK_TREES = [
  {x:-55,y:30},{x:-50,y:25},{x:-45,y:20},{x:-40,y:15},{x:-35,y:10},{x:-30,y:5},
  {x:-25,y:0},{x:-20,y:-5},{x:-60,y:40},{x:-55,y:45},{x:-50,y:50},{x:10,y:66},
  {x:20,y:68},{x:35,y:70},{x:50,y:72},{x:65,y:66},{x:80,y:64},{x:95,y:62},
];

export { SITE_LAT, SITE_LON };
