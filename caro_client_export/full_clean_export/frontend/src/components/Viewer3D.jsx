import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import P from "../utils/colours";
import VIEWS from "../utils/cameraPresets";
import { fetchAllContext, FALLBACK_BUILDINGS, FALLBACK_ROADS, FALLBACK_TREES, SITE_LAT, SITE_LON } from "../utils/mapData";
import { SITE_BOUNDARY, OFFSET_BOUNDARY, BUILDING_PLACEMENT } from "../utils/siteBoundaries";

const context_BG = 0xE8EAED;
const STY = {
  Realistic:  { op: .58, eg: .12, wr: false, fl: false },
  Shaded:     { op: .72, eg: .16, wr: false, fl: true },
  Wireframe:  { op: 0,   eg: .48, wr: true,  fl: false },
  Consistent: { op: .86, eg: .20, wr: false, fl: true },
};
const HUE = { ground: 0x7A9A70, yotel: 0x2E8A76, yotelpad: 0xB8456A, ctx: 0x9CA4AE, out: 0x4E8E3E, pool: 0x3688A8 };

function mkMat(c, vs, op) {
  const S = STY[vs] || STY.Realistic;
  if (S.wr) return new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: .35 });
  return new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: op ?? S.op, roughness: S.fl ? .88 : .38, flatShading: S.fl, side: THREE.DoubleSide });
}
function boxE(p, geo, m, pos, vs) {
  const S = STY[vs] || STY.Realistic;
  const mesh = new THREE.Mesh(geo, m); mesh.position.copy(pos); mesh.castShadow = true; mesh.receiveShadow = true; p.add(mesh);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x1A1A22, transparent: true, opacity: S.eg }));
  e.position.copy(pos); p.add(e);
  return mesh;
}

/* ── Correct tile math ── */
function getTileInfo(lat, lon, zoom) {
  const n = Math.pow(2, zoom);
  const tileX = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  const fracX = (lon + 180) / 360 * n - tileX;
  const fracY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - tileY;
  const tileM = 40075016.686 * Math.cos(latRad) / n; // tile size in metres
  return { tileX, tileY, fracX, fracY, tileM };
}

const TILE_FN = {
  satellite: (z, y, x) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  street: (z, y, x) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  topo: (z, y, x) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
};

function loadTiles(scene, bm, zoom = 17) {
  if (bm === "none" || !TILE_FN[bm]) return;
  const fn = TILE_FN[bm];
  const { tileX, tileY, fracX, fracY, tileM } = getTileInfo(SITE_LAT, SITE_LON, zoom);
  const loader = new THREE.TextureLoader(); loader.crossOrigin = "anonymous";
  // Origin (0,0) is at (fracX, fracY) within centre tile
  // fracX = fraction from WEST edge, fracY = fraction from NORTH edge
  // Tile centre x = (0.5 - fracX) * tileM (east of origin)
  // With rotation.x = +PI/2: image-top(north)→+Z, image-left(west)→-X ✓
  // But +PI/2 makes plane face down, so use DoubleSide material
  // Tile centre z: origin is fracY from north edge = (1-fracY) from south edge
  //   north edge at z = +fracY * tileM
  //   south edge at z = -(1-fracY) * tileM  
  //   centre at z = (fracY - 0.5) * tileM
  const cx = (0.5 - fracX) * tileM;
  const cz = (fracY - 0.5) * tileM;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const url = fn(zoom, tileY + dy, tileX + dx);
      const px = cx + dx * tileM;
      const pz = cz - dy * tileM;  // dy+1=south in grid=negative z in scene
      loader.load(url, tex => {
        tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(tileM, tileM),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );
        mesh.rotation.x = Math.PI / 2;  // +PI/2: image-top(north)→scene+Z(north) ✓
        mesh.position.set(px, -0.01, pz);
        mesh.receiveShadow = true;
        scene.add(mesh);
      }, undefined, () => {});
    }
  }
}

/* ── Orbit controls ── */
function mkCtrl(cam, tgt, el, isO) {
  let dr=0,pa=0,px=0,py=0,td=0;
  const sp=new THREE.Spherical(),of=new THREE.Vector3(),t=new THREE.Vector3(...tgt),pn=new THREE.Vector3();
  of.copy(cam.position).sub(t);sp.setFromVector3(of);
  function ap(){sp.radius=Math.max(15,Math.min(500,sp.radius));if(!isO)sp.phi=Math.max(.05,Math.min(Math.PI*.48,sp.phi));of.setFromSpherical(sp);cam.position.copy(t).add(pn).add(of);cam.lookAt(t.x+pn.x,t.y+pn.y,t.z+pn.z);if(isO&&cam.isOrthographicCamera){const z=sp.radius/3;cam.left=-z*cam.aspect;cam.right=z*cam.aspect;cam.top=z;cam.bottom=-z;cam.updateProjectionMatrix();}}
  const md=e=>{if(e.button===0){dr=1;pa=0;}if(e.button===2){pa=1;dr=0;}px=e.clientX;py=e.clientY;e.preventDefault();};
  const mm=e=>{if(!dr&&!pa)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;if(dr&&!isO){sp.theta-=dx*.005;sp.phi-=dy*.005;}if(pa||(dr&&isO)){const r=new THREE.Vector3();r.crossVectors(cam.getWorldDirection(new THREE.Vector3()),new THREE.Vector3(0,1,0)).normalize();const s=isO?.3:.15;pn.addScaledVector(r,-dx*s);pn.y+=dy*s;}ap();};
  const mu=()=>{dr=0;pa=0;};const wh=e=>{sp.radius*=e.deltaY>0?1.08:.92;ap();e.preventDefault();};
  const dc=()=>{pn.set(0,0,0);const d=VIEWS["{3D}"];t.set(...d.target);of.set(d.pos[0]-d.target[0],d.pos[1]-d.target[1],d.pos[2]-d.target[2]);sp.setFromVector3(of);ap();};
  const cx=e=>e.preventDefault();
  const ts=e=>{if(e.touches.length===1){dr=1;px=e.touches[0].clientX;py=e.touches[0].clientY;}else if(e.touches.length===2){dr=0;td=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}};
  const tm=e=>{if(e.touches.length===1&&dr){const dx=e.touches[0].clientX-px,dy=e.touches[0].clientY-py;px=e.touches[0].clientX;py=e.touches[0].clientY;if(!isO){sp.theta-=dx*.005;sp.phi-=dy*.005;}else{const r=new THREE.Vector3();r.crossVectors(cam.getWorldDirection(new THREE.Vector3()),new THREE.Vector3(0,1,0)).normalize();pn.addScaledVector(r,-dx*.3);pn.y+=dy*.3;}ap();}else if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);sp.radius*=td/d;td=d;ap();}e.preventDefault();};
  const te=()=>{dr=0;};
  el.addEventListener("mousedown",md);el.addEventListener("mousemove",mm);el.addEventListener("mouseup",mu);el.addEventListener("mouseleave",mu);
  el.addEventListener("wheel",wh,{passive:false});el.addEventListener("dblclick",dc);el.addEventListener("contextmenu",cx);
  el.addEventListener("touchstart",ts,{passive:false});el.addEventListener("touchmove",tm,{passive:false});el.addEventListener("touchend",te);
  ap();
  return{setView(p,tg){pn.set(0,0,0);t.set(...tg);of.set(p[0]-tg[0],p[1]-tg[1],p[2]-tg[2]);sp.setFromVector3(of);ap();},dispose(){el.removeEventListener("mousedown",md);el.removeEventListener("mousemove",mm);el.removeEventListener("mouseup",mu);el.removeEventListener("mouseleave",mu);el.removeEventListener("wheel",wh);el.removeEventListener("dblclick",dc);el.removeEventListener("contextmenu",cx);el.removeEventListener("touchstart",ts);el.removeEventListener("touchmove",tm);el.removeEventListener("touchend",te);}};
}

const FB = { buildings: FALLBACK_BUILDINGS, roads: FALLBACK_ROADS, trees: FALLBACK_TREES, coastline: [], fetched: false };

const BLDG_X = BUILDING_PLACEMENT.x;
const BLDG_Z = BUILDING_PLACEMENT.z;
const BLDG_ROT = BUILDING_PLACEMENT.rotDeg;

const SITE = SITE_BOUNDARY;
const OFFSET = OFFSET_BOUNDARY;

export default function Viewer3D({ option, viewKey = "{3D}", layers = {}, visualStyle = "Realistic", basemap = "satellite" }) {
  const ref = useRef(null), ctrlRef = useRef(null), frameRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const L = { terrain: true, roads: true, vegetation: true, siteBoundary: true, offset: true, context: true, hotel: true, outdoor: true, ...layers };
  const VS = visualStyle || "Realistic";

  useEffect(() => { let dead = false; fetchAllContext().then(d => { if (!dead) setCtx(d); }).catch(() => { if (!dead) setCtx(FB); }); return () => { dead = true; }; }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current, W = el.clientWidth || 800, H = el.clientHeight || 600;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(context_BG);
    const view = VIEWS[viewKey] || VIEWS["{3D}"]; const isO = view.ortho;
    let cam;
    if (isO) { const z = (view.zoom || 1) * 60; cam = new THREE.OrthographicCamera(-z * (W / H), z * (W / H), z, -z, .1, 2000); }
    else cam = new THREE.PerspectiveCamera(35, W / H, .1, 2000);
    cam.position.set(...view.pos); cam.lookAt(...view.target);
    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(W, H); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.shadowMap.enabled = !isO; ren.shadowMap.type = THREE.PCFSoftShadowMap;
    ren.toneMapping = THREE.ACESFilmicToneMapping; ren.toneMappingExposure = 1.1;
    el.innerHTML = ""; el.appendChild(ren.domElement);
    const ctrl = mkCtrl(cam, view.target, ren.domElement, isO); ctrlRef.current = ctrl;
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth, nh = el.clientHeight; if (nw < 10 || nh < 10) return;
      if (cam.isPerspectiveCamera) { cam.aspect = nw / nh; cam.updateProjectionMatrix(); }
      if (cam.isOrthographicCamera) { const z = cam.top; cam.left = -z * (nw / nh); cam.right = z * (nw / nh); cam.updateProjectionMatrix(); }
      ren.setSize(nw, nh);
    });
    ro.observe(el);
    const loop = () => { frameRef.current = requestAnimationFrame(loop); ren.render(scene, cam); }; loop();

    // Lighting
    scene.add(new THREE.AmbientLight(0xD0D6E0, .60));
    const sun = new THREE.DirectionalLight(0xFFF6E8, 1.05);
    sun.position.set(-50, 100, 60); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -300; sun.shadow.camera.right = 300; sun.shadow.camera.top = 300; sun.shadow.camera.bottom = -300;
    scene.add(sun); scene.add(new THREE.HemisphereLight(0xBCC8D8, 0x8E9880, .28));

    // BASEMAP TILES — correctly positioned
    if (L.terrain) loadTiles(scene, basemap);

    const data = ctx || FB;

    // ROADS
    if (L.roads) {
      const rm = mkMat(0xBBBEC4, VS, .80);
      data.roads.forEach(rd => { for (let i = 0; i < rd.pts.length - 1; i++) { const p1 = rd.pts[i], p2 = rd.pts[i + 1], dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.sqrt(dx * dx + dy * dy); if (len < .5) continue; const m = new THREE.Mesh(new THREE.BoxGeometry(rd.width, .04, len), rm); m.position.set((p1.x + p2.x) / 2, .02, (p1.y + p2.y) / 2); m.rotation.y = Math.atan2(dx, dy); scene.add(m); } });
    }

    // TREES
    if (L.vegetation) {
      const cr = new THREE.MeshStandardMaterial({ color: 0x3A6830, flatShading: true }), tk = new THREE.MeshStandardMaterial({ color: 0x6A5838 });
      data.trees.forEach(t => { const c = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), cr); c.position.set(t.x, 4.5, t.y); c.scale.set(1, .65, 1); scene.add(c); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.15, .25, 3, 5), tk); tr.position.set(t.x, 1.5, t.y); scene.add(tr); });
    }

    // CONTEXT BUILDINGS
    if (L.context) {
      data.buildings.forEach(b => {
        if (b.w < 1 || b.d < 1 || b.h < 1) return;
        const bx = b.cx ?? b.x ?? 0, bz = b.cy ?? b.y ?? 0;
        boxE(scene, new THREE.BoxGeometry(b.w, b.h, b.d), mkMat(HUE.ctx, VS), new THREE.Vector3(bx, b.h / 2, bz), VS);
      });
    }

    // COASTLINE
    if (data.coastline?.length) { data.coastline.forEach(seg => { if (seg.pts.length < 2) return; scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(seg.pts.map(p => new THREE.Vector3(p.x, .08, p.y))), new THREE.LineBasicMaterial({ color: seg.type === "beach" ? 0xC4B590 : 0x4A8ECC }))); }); }

    // SITE BOUNDARY
    if (L.siteBoundary) {
      const lm = new THREE.LineDashedMaterial({ color: 0xCC3333, dashSize: 2, gapSize: 1.5, linewidth: 1 });
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(SITE.map(([x, y]) => new THREE.Vector3(x, .3, y))), lm);
      ln.computeLineDistances(); scene.add(ln);
    }

    // OFFSET BOUNDARY + fill
    if (L.offset) {
      const pts3 = OFFSET.map(([x, y]) => new THREE.Vector3(x, .35, y));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts3), new THREE.LineBasicMaterial({ color: 0x2266BB })));
      const sh = new THREE.Shape(); sh.moveTo(OFFSET[0][0], OFFSET[0][1]);
      for (let i = 1; i < OFFSET.length; i++) sh.lineTo(OFFSET[i][0], OFFSET[i][1]);
      sh.closePath();
      const fl = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0x2266BB, transparent: true, opacity: .05 }));
      fl.rotation.x = -Math.PI / 2; fl.position.y = .25; scene.add(fl);
    }

    // HOTEL — positioned at offset centroid
    if (L.hotel) {
      const o = option, rotR = BLDG_ROT * Math.PI / 180;
      const grp = new THREE.Group(); grp.position.set(BLDG_X, 0, BLDG_Z); grp.rotation.y = rotR; scene.add(grp);
      let zP = 0;
      o.floors.forEach((fl, fi) => {
        const h = fi === 0 ? 4.5 : 3.2;
        const hue = fl.type === "ground" ? HUE.ground : fl.type === "yotel" ? HUE.yotel : HUE.yotelpad;
        const fmat = mkMat(hue, VS); const eOp = (STY[VS] || STY.Realistic).eg;
        o.wings.forEach(wing => {
          let wx, wz, wl, ww;
          if (wing.dir === "NS") { wx = wing.x; wz = wing.y; wl = wing.w; ww = wing.l; } else { wx = wing.x; wz = wing.y; wl = wing.l; ww = wing.w; }
          boxE(grp, new THREE.BoxGeometry(wl, h - .04, ww), fmat, new THREE.Vector3(wx + wl / 2, zP + h / 2, wz + ww / 2), VS);
          if (fi > 0) {
            const bw = fl.type === "yotelpad" ? 3.67 : 3.37;
            for (let bx = bw; bx < wl - 1; bx += bw) {
              [wz, wz + ww].forEach(fz => { grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(wx + bx, zP + .1, fz), new THREE.Vector3(wx + bx, zP + h - .1, fz)]), new THREE.LineBasicMaterial({ color: 0x222228, transparent: true, opacity: eOp * .8 }))); });
            }
          }
        });
        zP += h;
      });
    }

    // OUTDOOR + POOL — context style with curved pool shape
    if (L.outdoor && ["WEST", "BOTH"].includes(option.outdoorPos)) {
      const g2 = new THREE.Group(); g2.position.set(BLDG_X, 0, BLDG_Z); g2.rotation.y = BLDG_ROT * Math.PI / 180; scene.add(g2);
      const odW = 14, odD = Math.min(option.bW || 14, 50);
      // Deck
      boxE(g2, new THREE.BoxGeometry(odW, .10, odD), mkMat(HUE.out, VS, .35), new THREE.Vector3(-odW / 2, .05, odD / 2), VS);
      // Pool — curved shape using a Shape with arcs
      const ps = new THREE.Shape();
      ps.moveTo(-2, -4); ps.lineTo(4, -4); ps.quadraticCurveTo(6, -4, 6, -2);
      ps.lineTo(6, 4); ps.quadraticCurveTo(6, 6, 4, 6);
      ps.lineTo(-2, 6); ps.quadraticCurveTo(-4, 6, -4, 4);
      ps.lineTo(-4, 0); ps.quadraticCurveTo(-4, -2, -3, -3);
      ps.lineTo(-2, -4);
      const poolGeo = new THREE.ExtrudeGeometry(ps, { depth: .15, bevelEnabled: false });
      const poolMat = new THREE.MeshStandardMaterial({ color: 0x3688A8, transparent: true, opacity: .55, roughness: .1 });
      const poolMesh = new THREE.Mesh(poolGeo, poolMat);
      poolMesh.rotation.x = -Math.PI / 2; poolMesh.position.set(-7, .12, odD / 2 + 1);
      g2.add(poolMesh);
      // Pool water surface shimmer
      const waterGeo = new THREE.ShapeGeometry(ps);
      const waterMat = new THREE.MeshStandardMaterial({ color: 0x5AC8E8, transparent: true, opacity: .4, roughness: .05, metalness: .1 });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2; water.position.set(-7, .28, odD / 2 + 1);
      g2.add(water);
    }

    return () => { cancelAnimationFrame(frameRef.current); ctrl.dispose(); ro.disconnect(); ren.dispose(); };
  }, [option, viewKey, VS, basemap, ctx, L.terrain, L.roads, L.vegetation, L.siteBoundary, L.offset, L.context, L.hotel, L.outdoor]);

  useEffect(() => { if (ctrlRef.current && VIEWS[viewKey]) { const v = VIEWS[viewKey]; ctrlRef.current.setView(v.pos, v.target); } }, [viewKey]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={ref} style={{ width: "100%", height: "100%", overflow: "hidden", cursor: "grab" }} />
      <div style={{ position: "absolute", bottom: 4, right: 4, fontSize: 9, color: "rgba(0,0,0,.4)", background: "rgba(255,255,255,.7)", padding: "1px 6px", borderRadius: 2, pointerEvents: "none" }}>
        © Esri, Vantor, Earthstar Geographics · OSM
      </div>
    </div>
  );
}
