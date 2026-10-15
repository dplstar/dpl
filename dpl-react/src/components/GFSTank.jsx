// Model updated by the DPL Star team. Compatibility helpers (threeCompat.js) let it run on the site's three.js r128.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LEGACY, setupRenderer, srgbTexture, lin, linearize, watchVisibility } from "./threeCompat.js";

/**
 * GFSTank — interactive 3D exterior of a DPL Star Glass-Fused-to-Steel
 * (GFS / GLS) bolted tank.
 *
 * Usage:
 *   <div style={{ height: 600 }}>
 *     <GFSTank />                      // biogas digester, double-membrane roof
 *     <GFSTank roof="cone" />          // water/effluent tank, GFS cone roof
 *   </div>
 *
 * Fills its parent, transparent background. Requires: npm i three (r155+).
 *
 * Build: high-gloss vitreous-enamel panels in 1.22 m courses (two-tone
 * option), running-bond lap joints with capped self-locking bolts and
 * sealant beads, galvanized curb angles and wind girder, anchor chairs,
 * and either a double-membrane gas-holder roof (gored PVC with welded seams,
 * clamping ring, blower, pressure-relief valve, yellow gas line) or a bolted
 * GFS cone roof with walkway and hatch. Caged ladder, manway, nozzles,
 * level indicator.
 */

const COURSE_H = 1.22;
const PANEL_W = 2.4;
const PLINTH_H = 0.45;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const deg = (d) => (d * Math.PI) / 180;

export const GFS_COLORS = {
  blue: "#1d4f91",
  green: "#1f5c3f",
  white: "#eceee9",
  gray: "#8a9096",
};

/* ---------------- textures ---------------- */
function seamTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 8;
  const x = c.getContext("2d");
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, 128, 8);
  x.fillStyle = "#d4d6d2";
  x.fillRect(0, 0, 3, 8);
  x.fillRect(125, 0, 3, 8);
  x.fillStyle = "#e6e8e4";
  x.fillRect(3, 0, 3, 8);
  x.fillRect(122, 0, 3, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  srgbTexture(t);
  return t;
}

function gaugeTexture(y0, y1) {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 1024;
  const x = c.getContext("2d");
  x.fillStyle = "#f4f4f0";
  x.fillRect(0, 0, 64, 1024);
  x.fillStyle = "#1b232b";
  const span = y1 - y0;
  for (let m = Math.ceil(y0 * 10) / 10; m <= y1 + 1e-6; m += 0.1) {
    const py = 1024 - ((m - y0) / span) * 1024;
    const major = Math.round(m * 10) % 5 === 0;
    x.fillRect(0, py - 1.5, major ? 34 : 16, 3);
  }
  const t = new THREE.CanvasTexture(c);
  srgbTexture(t);
  return t;
}

function makeEnvironment(renderer) {
  const env = new THREE.Scene();
  const g = new THREE.SphereGeometry(50, 48, 24);
  const p = g.attributes.position, cols = [];
  const top = lin(new THREE.Color(0xc9d9e8)), hor = lin(new THREE.Color(0xf6f5f0)), gnd = lin(new THREE.Color(0x5f5a52));
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 50;
    const c = y > 0 ? hor.clone().lerp(top, Math.pow(y, 0.6)) : hor.clone().lerp(gnd, Math.min(1, -y * 4));
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  env.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
  const box = (x, y, z, w, h, k) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  // crisper softboxes: glass enamel shows clean highlight streaks
  box(30, 20, 24, 26, 7, 4.0);
  box(-34, 10, -14, 8, 24, 2.2);
  box(0, 42, 0, 30, 30, 1.2);
  box(-12, 5, 38, 20, 4, 1.8);
  box(36, 4, -18, 6, 14, 1.5);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.01).texture;
  pm.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

/* ---------------- geometry helpers ---------------- */
function arcPatch(th0, th1, y0, y1, r, segs) {
  const pos = [], idx = [];
  for (let j = 0; j <= 1; j++) {
    const y = j ? y1 : y0;
    for (let i = 0; i <= segs; i++) {
      const t = th0 + ((th1 - th0) * i) / segs;
      pos.push(Math.sin(t) * r, y, Math.cos(t) * r);
    }
  }
  const w = segs + 1;
  for (let i = 0; i < segs; i++) {
    const a = i, b = i + 1, c = i + w, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function mesh(geo, mat, parent, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = recv;
  parent.add(m);
  return m;
}
function cyl(a, b, r, mat, parent, segs = 14) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = mesh(new THREE.CylinderGeometry(r, r, L, segs, 1, false), mat, parent);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  return m;
}
function run(pts, r, mat, parent, segs = 14) {
  for (let i = 0; i < pts.length - 1; i++) cyl(pts[i], pts[i + 1], r, mat, parent, segs);
  for (let i = 1; i < pts.length - 1; i++) {
    const s = mesh(new THREE.SphereGeometry(r, segs, 8), mat, parent);
    s.position.copy(pts[i]);
  }
}
function flange(center, axis, r, t, mat, parent) {
  return cyl(center.clone().addScaledVector(axis, -t / 2), center.clone().addScaledVector(axis, t / 2), r, mat, parent, 24);
}
function tube(pts, r, mat, parent) {
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2);
  return mesh(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 6), r, 6, false), mat, parent);
}
function box(w, h, d, mat, parent, x, y, z) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
  m.position.set(x, y, z);
  return m;
}

/* ---------------- double-membrane gas-holder roof ---------------- */
function buildMembrane(tank, M, Rr, yRim, addCap) {
  const h = 0.62 * Rr;
  const Rs = (Rr * Rr + h * h) / (2 * h);
  const phiMax = Math.asin(Rr / Rs);
  const yC = yRim - Rs * Math.cos(phiMax);
  const gores = Math.max(16, Math.round((2 * Math.PI * Rr) / 1.6));
  const per = 8, aSeg = gores * per, pSeg = 40;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= pSeg; j++) {
    const phi = (phiMax * j) / pSeg;
    for (let i = 0; i <= aSeg; i++) {
      const th = (2 * Math.PI * i) / aSeg;
      const pillow = Math.sin((Math.PI * (i % per)) / per);
      const r = Rs + 0.06 * pillow * Math.sin(phi) * Math.min(1, (phiMax - phi) / 0.12 + 0.15);
      pos.push(r * Math.sin(phi) * Math.sin(th), yC + r * Math.cos(phi), r * Math.sin(phi) * Math.cos(th));
      uv.push((i / aSeg) * gores, j / pSeg);
    }
  }
  const w = aSeg + 1;
  for (let j = 0; j < pSeg; j++)
    for (let i = 0; i < aSeg; i++) {
      const a = j * w + i, b = a + 1, c = a + w, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  mesh(g, M.membrane, tank);

  // crown plate at the apex
  const yTop = yC + Rs;
  const crown = mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.06, 32), M.membraneTrim, tank);
  crown.position.y = yTop + 0.02;

  // clamping ring at the rim
  const segsC = Math.max(96, Math.round((2 * Math.PI * Rr) / 0.08));
  const ring = mesh(new THREE.CylinderGeometry(Rr + 0.05, Rr + 0.05, 0.22, segsC, 1, true), M.galv, tank);
  ring.position.y = yRim + 0.02;
  const lip = mesh(new THREE.RingGeometry(Rr - 0.02, Rr + 0.05, segsC), M.galv, tank);
  lip.rotation.x = -Math.PI / 2;
  lip.position.y = yRim + 0.13;
  const nb = Math.round((2 * Math.PI * Rr) / 0.2);
  for (let i = 0; i < nb; i++) addCap((i / nb) * Math.PI * 2, yRim + 0.02, Rr + 0.05);

  return { yTop };
}

/* ---------------- tank builder ---------------- */
function buildTank(M, opts) {
  const { diameter, courses, roof, accentCourses } = opts;
  const tank = new THREE.Group();
  const D = diameter, R = D / 2, H = courses * COURSE_H;
  const LADDER = deg(24);

  const capMats = [];
  const dmy = new THREE.Object3D();
  const addCapN = (p, n) => {
    dmy.position.copy(p);
    dmy.lookAt(p.clone().add(n));
    dmy.updateMatrix();
    capMats.push(dmy.matrix.clone());
  };
  const addCap = (t, y, r) => addCapN(V(Math.sin(t) * r, y, Math.cos(t) * r), V(Math.sin(t), 0, Math.cos(t)));

  /* ---- glossy enamel shell ---- */
  const n = Math.max(6, Math.round((2 * Math.PI * R) / PANEL_W));
  const dT = (2 * Math.PI) / n;
  const LAP = 0.07, lapA = LAP / R, HLAP = 0.07;
  const RV = R + 0.005, RH = R + 0.01;
  const segsPanel = Math.max(10, Math.ceil((dT * R) / 0.1));
  const segsC = Math.max(96, Math.round((2 * Math.PI * R) / 0.07));
  const matFor = (k) => (k >= courses - accentCourses ? M.accent : M.body);

  for (let k = 0; k < courses; k++) {
    const y0 = k * COURSE_H, y1 = y0 + COURSE_H;
    const off = ((k % 2) * dT) / 2;
    const mat = matFor(k);
    for (let p = 0; p < n; p++) {
      const t0 = off + p * dT, t1 = t0 + dT;
      mesh(arcPatch(t0, t1, y0, y1, R, segsPanel), mat, tank);
      mesh(arcPatch(t1, t1 + lapA, y0, y1, RV, 2), mat, tank, false, true);
      const tb = t1 + lapA;
      cyl(V(Math.sin(tb) * RV, y0, Math.cos(tb) * RV), V(Math.sin(tb) * RV, y1, Math.cos(tb) * RV), 0.004, M.sealant, tank, 4).castShadow = false;

      const vy1 = k < courses - 1 ? y1 - HLAP - 0.02 : y1 - 0.1;
      const vy0 = y0 + (k === 0 ? 0.12 : 0.04);
      const cnt = Math.max(2, Math.round((vy1 - vy0) / 0.085));
      for (let b = 0; b <= cnt; b++) {
        const y = vy0 + ((vy1 - vy0) * b) / cnt;
        addCap(t1 + lapA * 0.3, y, RV);
        addCap(t1 + lapA * 0.7, y, RV);
      }
      if (k > 0) {
        mesh(arcPatch(t0, t1 + lapA, y0 - HLAP, y0, RH, segsPanel), mat, tank, false, true);
        const cntH = Math.round(((t1 - t0) * R) / 0.085);
        for (let b = 0; b < cntH; b++) {
          const t = t0 + ((b + 0.5) / cntH) * (t1 - t0);
          addCap(t, y0 - HLAP * 0.3, RH);
          addCap(t + 0.5 * ((t1 - t0) / cntH), y0 - HLAP * 0.72, RH);
        }
      }
    }
  }
  for (let k = 1; k < courses; k++) {
    const ring = mesh(new THREE.TorusGeometry(RH - 0.002, 0.004, 4, segsC), M.sealant, tank, false, false);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = k * COURSE_H - HLAP;
  }

  /* ---- galvanized curb angles + anchor chairs ---- */
  const rc = RH + 0.006;
  const curb = mesh(new THREE.CylinderGeometry(rc, rc, 0.08, segsC, 1, true), M.galv, tank);
  curb.position.y = H - 0.04;
  const curbF = mesh(new THREE.RingGeometry(R - 0.03, rc + 0.075, segsC), M.galv, tank);
  curbF.rotation.x = -Math.PI / 2;
  curbF.position.y = H + 0.001;
  const base = mesh(new THREE.CylinderGeometry(rc, rc, 0.09, segsC, 1, true), M.galv, tank);
  base.position.y = 0.045;
  const baseF = mesh(new THREE.RingGeometry(rc, rc + 0.1, segsC), M.galv, tank);
  baseF.rotation.x = -Math.PI / 2;
  baseF.position.y = 0.003;
  {
    const nb = Math.round((2 * Math.PI * R) / 0.16);
    for (let i = 0; i < nb; i++) {
      const t = (i / nb) * Math.PI * 2;
      addCap(t, H - 0.04, rc);
      addCap(t, 0.045, rc);
    }
    const na = Math.max(8, Math.round((2 * Math.PI * R) / 1.6));
    for (let i = 0; i < na; i++) {
      const g = new THREE.Group();
      g.rotation.y = (i / na) * Math.PI * 2 + 0.07;
      tank.add(g);
      box(0.1, 0.16, 0.012, M.galv, g, 0, 0.08, rc + 0.05);
      box(0.012, 0.16, 0.1, M.galv, g, -0.05, 0.08, rc + 0.05);
      box(0.012, 0.16, 0.1, M.galv, g, 0.05, 0.08, rc + 0.05);
      const nut = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), M.galv, g);
      nut.position.set(0, 0.17, rc + 0.06);
    }
  }

  /* ---- wind girder ---- */
  if (courses >= 4) {
    const yg = (courses - 2) * COURSE_H + COURSE_H * 0.5;
    const wf = mesh(new THREE.RingGeometry(RH, RH + 0.12, segsC), M.galv, tank);
    wf.rotation.x = -Math.PI / 2;
    wf.position.y = yg;
    const lip = mesh(new THREE.CylinderGeometry(RH + 0.12, RH + 0.12, 0.07, segsC, 1, true), M.galv, tank);
    lip.position.y = yg - 0.035;
    const leg = mesh(new THREE.CylinderGeometry(RH + 0.004, RH + 0.004, 0.08, segsC, 1, true), M.galv, tank);
    leg.position.y = yg + 0.04;
    const ng = Math.round((2 * Math.PI * R) / 1.4);
    for (let i = 0; i < ng; i++) {
      const g = new THREE.Group();
      g.rotation.y = (i / ng) * Math.PI * 2;
      tank.add(g);
      const gus = mesh(new THREE.BoxGeometry(0.01, 0.1, 0.11), M.galv, g);
      gus.position.set(0, yg - 0.05, RH + 0.06);
    }
  }

  /* ---- plinth ---- */
  const pl = mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.62, PLINTH_H, 128), M.concrete, tank);
  pl.position.y = -PLINTH_H / 2;

  const radial = (th) => {
    const g = new THREE.Group();
    g.rotation.y = th;
    tank.add(g);
    return g;
  };

  /* ---- roof ---- */
  let topY;
  const Re = R + 0.12, slope = deg(15), tanS = Math.tan(slope), yBase = H + 0.04, rMin = 0.55, seamH = 0.014;
  const roofY = (r) => yBase + (Re - r) * tanS;

  if (roof === "membrane") {
    topY = buildMembrane(tank, M, R + 0.02, H + 0.02, addCap).yTop;
  } else {
    const nRoof = Math.max(12, Math.round((2 * Math.PI * Re) / 2.2));
    const aSegs = Math.max(8, Math.ceil((((2 * Math.PI) / nRoof) * Re) / 0.15));
    for (let p = 0; p < nRoof; p++) {
      const t0 = (p / nRoof) * Math.PI * 2, t1 = ((p + 1) / nRoof) * Math.PI * 2;
      const pos = [], idx = [];
      for (let j = 0; j <= 1; j++) {
        const r = j ? rMin : Re;
        for (let i = 0; i <= aSegs; i++) {
          const t = t0 + ((t1 - t0) * i) / aSegs;
          pos.push(Math.sin(t) * r, roofY(r), Math.cos(t) * r);
        }
      }
      const w = aSegs + 1;
      for (let i = 0; i < aSegs; i++) {
        const a = i, b = i + 1, c = i + w, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      mesh(g, M.accent, tank);

      const len = (Re - rMin) / Math.cos(slope), mid = (Re + rMin) / 2;
      const sg = new THREE.Group();
      sg.rotation.order = "YXZ";
      sg.rotation.y = t0;
      sg.rotation.x = slope;
      sg.position.set(Math.sin(t0) * mid, roofY(mid) + seamH / 2, Math.cos(t0) * mid);
      tank.add(sg);
      mesh(new THREE.BoxGeometry(0.07, seamH, len), M.accent, sg);
      const nrm = V(Math.sin(t0) * Math.sin(slope), Math.cos(slope), Math.cos(t0) * Math.sin(slope));
      for (let r = Re - 0.08; r > rMin + 0.08; r -= 0.14)
        addCapN(V(Math.sin(t0) * r, roofY(r) + seamH, Math.cos(t0) * r), nrm);
    }
    const fascia = mesh(new THREE.CylinderGeometry(Re + 0.004, Re + 0.004, 0.09, segsC, 1, true), M.galv, tank);
    fascia.position.y = yBase - 0.035;
    const yT = roofY(rMin);
    const crown = mesh(new THREE.CylinderGeometry(rMin + 0.08, rMin + 0.1, 0.05, 48), M.galv, tank);
    crown.position.y = yT + 0.02;
    const neck = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.36, 32), M.galv, tank);
    neck.position.y = yT + 0.22;
    const screen = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 32, 1, true), M.dark, tank);
    screen.position.y = yT + 0.42;
    const cap = mesh(new THREE.SphereGeometry(0.4, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.galv, tank);
    cap.scale.y = 0.4;
    cap.position.y = yT + 0.46;
    topY = yT + 0.62;
  }

  /* ---- caged ladder ---- */
  {
    const L = radial(LADDER);
    const zr = R + 0.34, xs = 0.23;
    const membrane = roof === "membrane";
    const yLand = H + 0.2;
    const top = membrane ? yLand + 1.05 : H + 1.05;
    for (const sx of [-1, 1]) box(0.014, top, 0.065, M.galv, L, sx * xs, top / 2, zr);
    for (let y = 0.3; y < (membrane ? yLand + 0.05 : top - 0.05); y += 0.3) cyl(V(-xs, y, zr), V(xs, y, zr), 0.013, M.galv, L, 8);
    for (let yb = 0.8; yb < H; yb += 1.5)
      for (const sx of [-1, 1]) box(0.03, 0.045, zr - R, M.galv, L, sx * xs, yb, R + (zr - R) / 2);

    const c = zr + 0.3, cr = 0.4, yCage0 = 2.2;
    const hoopYs = [];
    for (let y = yCage0; y <= top - 0.1; y += 0.7) hoopYs.push(y);
    if (hoopYs[hoopYs.length - 1] < top - 0.25) hoopYs.push(top - 0.1);
    for (const y of hoopYs) {
      const pts = [V(-xs, y, zr)];
      for (let a = 200; a >= -20; a -= 10) pts.push(V(cr * Math.cos(deg(a)), y, c + cr * Math.sin(deg(a))));
      pts.push(V(xs, y, zr));
      tube(pts, 0.012, M.galv, L);
    }
    const yc1 = hoopYs[hoopYs.length - 1];
    for (const a of [165, 125, 90, 55, 15])
      cyl(V(cr * Math.cos(deg(a)), yCage0, c + cr * Math.sin(deg(a))), V(cr * Math.cos(deg(a)), yc1, c + cr * Math.sin(deg(a))), 0.01, M.galv, L, 6);

    if (membrane) {
      // inspection landing at the membrane rim
      const z0 = R + 0.1, z1 = zr - 0.04, hx = 0.55;
      box(hx * 2, 0.03, z1 - z0, M.galv, L, 0, yLand, (z0 + z1) / 2);
      for (let x = -hx + 0.05; x < hx; x += 0.06) box(0.008, 0.03, z1 - z0, M.dark, L, x, yLand + 0.004, (z0 + z1) / 2);
      for (const sx of [-1, 1]) {
        cyl(V(sx * hx, yLand, z0), V(sx * hx, yLand + 1.05, z0), 0.02, M.galv, L, 10);
        cyl(V(sx * hx, yLand, z1), V(sx * hx, yLand + 1.05, z1), 0.02, M.galv, L, 10);
        run([V(sx * hx, yLand + 1.05, z0), V(sx * hx, yLand + 1.05, z1), V(sx * xs, top, zr)], 0.018, M.galv, L, 10);
        cyl(V(sx * hx, yLand + 0.52, z0), V(sx * hx, yLand + 0.52, z1), 0.015, M.galv, L, 8);
      }
      // sight glass on the rim
      const sgp = box(0.18, 0.18, 0.06, M.galv, L, 0, H - 0.25, R + 0.04);
      const glass = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 20), M.glassPort, L);
      glass.rotation.x = Math.PI / 2;
      glass.position.set(0, sgp.position.y, R + 0.08);
    } else {
      const zIn = R - 0.45, zMid = (Re + zIn) / 2, len = (Re - zIn) / Math.cos(slope);
      const walk = new THREE.Group();
      walk.position.set(0, roofY(zMid) + seamH + 0.02, zMid);
      walk.rotation.x = slope;
      L.add(walk);
      box(0.72, 0.025, len, M.galv, walk, 0, 0, 0);
      for (let s = -len / 2 + 0.1; s < len / 2; s += 0.25) box(0.72, 0.012, 0.025, M.galv, walk, 0, 0.018, s);
      const zh = R - 0.85;
      const hatch = new THREE.Group();
      hatch.position.set(0, roofY(zh) + 0.005, zh);
      hatch.rotation.x = slope;
      L.add(hatch);
      box(0.7, 0.12, 0.7, M.galv, hatch, 0, 0.06, 0);
      box(0.78, 0.03, 0.78, M.accent, hatch, 0, 0.135, 0);
      box(0.18, 0.02, 0.025, M.dark, hatch, 0, 0.16, 0.3);
      const zA = R - 0.05, zB = R - 1.25, hx = 0.45;
      for (const sx of [-1, 1]) {
        for (const z of [zA, zB]) cyl(V(sx * hx, roofY(z), z), V(sx * hx, roofY(z) + 1.0, z), 0.018, M.galv, L, 10);
        run([V(sx * xs, top, zr), V(sx * hx, roofY(zA) + 1.0, zA), V(sx * hx, roofY(zB) + 1.0, zB)], 0.018, M.galv, L, 10);
        cyl(V(sx * hx, roofY(zA) + 0.5, zA), V(sx * hx, roofY(zB) + 0.5, zB), 0.015, M.galv, L, 8);
      }
    }
  }

  /* ---- biogas ancillaries (membrane roof only) ---- */
  if (roof === "membrane") {
    // air-support blower on the ground, feeding the membrane interspace
    {
      const G = radial(deg(200));
      const zb = R + 1.15, yb = -PLINTH_H;
      box(0.9, 0.08, 0.7, M.concrete, G, 0, yb + 0.04, zb);
      box(0.55, 0.42, 0.45, M.blower, G, 0, yb + 0.29, zb);
      const fan = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 28), M.blower, G);
      fan.rotation.z = Math.PI / 2;
      fan.position.set(0.34, yb + 0.3, zb);
      const grille = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 28), M.dark, G);
      grille.rotation.z = Math.PI / 2;
      grille.position.set(0.43, yb + 0.3, zb);
      run([V(0, yb + 0.5, zb), V(0, yb + 0.9, zb), V(0, yb + 0.9, R + 0.3), V(0, H + 0.02, R + 0.3), V(0, H + 0.02, R + 0.07)], 0.045, M.galv, G, 12);
      for (let yc = 1.4; yc < H; yc += 1.5) box(0.04, 0.04, 0.3, M.galv, G, 0, yc, R + 0.15);
    }
    // biogas take-off line (yellow) and hydraulic pressure-relief valve
    {
      const G = radial(deg(-112));
      const zg = R + 0.36;
      flange(V(0, H + 0.02, R + 0.07), V(0, 0, 1), 0.12, 0.03, M.galv, G);
      run([V(0, H + 0.02, R + 0.05), V(0, H + 0.02, zg), V(0, 0.9, zg), V(0, 0.9, R + 1.25)], 0.06, M.gas, G, 14);
      for (let yc = 1.3; yc < H; yc += 1.5) box(0.04, 0.04, zg - R, M.galv, G, 0, yc, R + zg / 2 - R / 2);
      const zv = R + 1.25, yb = -PLINTH_H;
      box(0.8, 0.08, 0.8, M.concrete, G, 0, yb + 0.04, zv);
      const body = mesh(new THREE.CylinderGeometry(0.26, 0.26, 1.1, 32), M.galv, G);
      body.position.set(0, yb + 0.63, zv);
      const top = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32), M.galv, G);
      top.position.set(0, yb + 1.2, zv);
      cyl(V(0, yb + 1.22, zv), V(0, yb + 1.55, zv), 0.05, M.galv, G, 12);
      const hood = mesh(new THREE.ConeGeometry(0.14, 0.12, 20), M.galv, G);
      hood.position.set(0, yb + 1.62, zv);
      const gauge = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 20), M.glassPort, G);
      gauge.rotation.x = Math.PI / 2;
      gauge.position.set(0, yb + 0.95, zv + 0.27);
    }
  }

  /* ---- side shell manway with davit ---- */
  {
    const G = radial(deg(-14));
    const yc = 0.62, rCov = 0.33, zF = R + 0.01;
    flange(V(0, yc, zF + 0.015), V(0, 0, 1), rCov + 0.08, 0.03, M.galv, G);
    flange(V(0, yc, zF + 0.045), V(0, 0, 1), rCov + 0.03, 0.03, M.body, G);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const b = mesh(new THREE.SphereGeometry(0.018, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), M.cap, G);
      b.rotation.x = Math.PI / 2;
      b.position.set(Math.cos(a) * (rCov + 0.045), yc + Math.sin(a) * (rCov + 0.045), zF + 0.06);
    }
    for (const sx of [-1, 1])
      tube([V(sx * 0.12, yc - 0.1, zF + 0.06), V(sx * 0.12, yc - 0.1, zF + 0.12), V(sx * 0.12, yc + 0.1, zF + 0.12), V(sx * 0.12, yc + 0.1, zF + 0.06)], 0.01, M.galv, G);
    const dx = rCov + 0.22;
    cyl(V(dx, 0.05, R + 0.12), V(dx, yc + 0.62, R + 0.12), 0.03, M.galv, G, 12);
    for (const yb of [0.25, yc + 0.45]) box(0.05, 0.05, 0.12, M.galv, G, dx, yb, R + 0.06);
    run([V(dx, yc + 0.62, R + 0.12), V(dx, yc + 0.62, R + 0.2), V(0.04, yc + 0.62, R + 0.2)], 0.022, M.galv, G, 10);
    cyl(V(0.04, yc + 0.62, R + 0.2), V(0.04, yc + 0.4, R + 0.2), 0.008, M.dark, G, 6);
  }

  /* ---- outlet with gate valve ---- */
  {
    const G = radial(deg(72));
    const y = 0.35, r = 0.085;
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.17, 0.03, M.galv, G);
    run([V(0, y, R - 0.02), V(0, y, R + 0.34)], r, M.galv, G);
    const zv = R + 0.46;
    flange(V(0, y, zv - 0.12), V(0, 0, 1), 0.155, 0.025, M.dark, G);
    flange(V(0, y, zv + 0.12), V(0, 0, 1), 0.155, 0.025, M.dark, G);
    cyl(V(0, y, zv - 0.12), V(0, y, zv + 0.12), 0.11, M.dark, G, 20);
    cyl(V(0, y, zv), V(0, y + 0.3, zv), 0.03, M.dark, G, 10);
    const wheel = mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 28), M.red, G);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0, y + 0.31, zv);
    cyl(V(-0.12, y + 0.31, zv), V(0.12, y + 0.31, zv), 0.008, M.red, G, 6);
    cyl(V(0, y + 0.31, zv - 0.12), V(0, y + 0.31, zv + 0.12), 0.008, M.red, G, 6);
    run([V(0, y, zv + 0.12), V(0, y, R + 1.05), V(0, -PLINTH_H - 0.05, R + 1.05)], r, M.galv, G);
  }

  /* ---- inlet (upper shell) ---- */
  {
    const G = radial(deg(150));
    const r = 0.075, zo = R + 0.4, zg = R + 0.9, yIn = H - 0.35;
    flange(V(0, yIn, R + 0.02), V(0, 0, 1), 0.16, 0.03, M.galv, G);
    run([V(0, -PLINTH_H - 0.05, zg), V(0, 0.35, zg), V(0, 0.6, zo), V(0, yIn, zo), V(0, yIn, R - 0.02)], r, M.galv, G);
    for (let yc = 1.2; yc < yIn - 0.3; yc += 1.4) box(0.05, 0.05, zo - R, M.galv, G, 0, yc, R + (zo - R) / 2);
    const yv = 1.35;
    flange(V(0, yv - 0.1, zo), V(0, 1, 0), 0.14, 0.022, M.dark, G);
    flange(V(0, yv + 0.1, zo), V(0, 1, 0), 0.14, 0.022, M.dark, G);
    cyl(V(0, yv - 0.1, zo), V(0, yv + 0.1, zo), 0.1, M.dark, G, 18);
    cyl(V(0, yv, zo), V(0, yv, zo + 0.28), 0.028, M.dark, G, 10);
    const wheel = mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 28), M.red, G);
    wheel.position.set(0, yv, zo + 0.29);
  }

  /* ---- overflow ---- */
  {
    const G = radial(deg(-48));
    const r = 0.065, y = H - 0.25, zo = R + 0.38;
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.14, 0.025, M.galv, G);
    run([V(0, y, R - 0.02), V(0, y, zo), V(0, 0.28, zo), V(0, 0.1, R + 0.52)], r, M.galv, G);
    for (let yc = 0.9; yc < y - 0.3; yc += 1.3) box(0.045, 0.045, zo - R, M.galv, G, 0, yc, R + (zo - R) / 2);
  }

  /* ---- level indicator ---- */
  {
    const G = radial(deg(-72));
    const y0 = 0.3, y1 = H - 0.3, zb = R + 0.2;
    const mat = new THREE.MeshStandardMaterial({ map: gaugeTexture(y0, y1), metalness: 0.1, roughness: 0.55 });
    mat.userData.own = true;
    const board = mesh(new THREE.PlaneGeometry(0.12, y1 - y0), mat, G, false, true);
    board.position.set(0, (y0 + y1) / 2, zb + 0.012);
    box(0.14, y1 - y0 + 0.04, 0.02, M.galv, G, 0, (y0 + y1) / 2, zb);
    for (let yb = y0 + 0.1; yb < y1; yb += 1.8) box(0.04, 0.03, zb - R, M.galv, G, 0, yb, R + (zb - R) / 2);
    const yp = y0 + (y1 - y0) * 0.7;
    const ptr = mesh(new THREE.ConeGeometry(0.04, 0.09, 3), M.red, G);
    ptr.rotation.z = Math.PI / 2;
    ptr.position.set(0.1, yp, zb + 0.03);
    box(0.02, 0.05, 0.03, M.red, G, 0.14, yp, zb + 0.03);
    box(0.16, 0.14, 0.14, M.galv, G, 0.14, H - 0.12, R + 0.24);
    cyl(V(0.155, yp + 0.03, zb + 0.03), V(0.155, H - 0.19, zb + 0.03), 0.003, M.dark, G, 4);
  }

  /* ---- drain ---- */
  {
    const G = radial(deg(235));
    run([V(0, 0.18, R - 0.02), V(0, 0.18, R + 0.28)], 0.06, M.galv, G);
    flange(V(0, 0.18, R + 0.02), V(0, 0, 1), 0.12, 0.022, M.galv, G);
    flange(V(0, 0.18, R + 0.29), V(0, 0, 1), 0.12, 0.025, M.dark, G);
  }

  // capped self-locking bolts
  const capGeo = new THREE.SphereGeometry(0.015, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  capGeo.rotateX(Math.PI / 2);
  const caps = new THREE.InstancedMesh(capGeo, M.cap, capMats.length);
  capMats.forEach((m, i) => caps.setMatrixAt(i, m));
  tank.add(caps);

  return { tank, D, H, topY };
}

function disposeGroup(group) {
  group.traverse((o) => {
    o.geometry?.dispose();
    if (o.material?.userData?.own) {
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
}

/* ---------------- component ---------------- */
export default function GFSTank({
  diameter = 12, // metres
  courses = 6, // panel courses, 1.22 m each (max 8)
  roof = "membrane", // "membrane" (biogas double-membrane) | "cone" (GFS cone roof)
  color = GFS_COLORS.green, // shell colour: any hex or GFS_COLORS
  accentColor = GFS_COLORS.white, // top course(s) + cone roof
  accentCourses = 1, // how many top courses use accentColor (0 = single colour)
  autoRotate = true,
  rotateSpeed = 0.55,
  interactive = true,
  className,
  style,
}) {
  const hostRef = useRef(null);
  const ctx = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    setupRenderer(renderer);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minPolarAngle = Math.PI * 0.05;

    scene.environment = makeEnvironment(renderer);
    scene.add(new THREE.HemisphereLight(0xeef3f8, 0x575148, 0.45 * Math.PI));
    const sun = new THREE.DirectionalLight(0xfff3e2, 2.2 * Math.PI);
    sun.position.set(18, 30, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    linearize(scene);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -PLINTH_H;
    ground.receiveShadow = true;
    scene.add(ground);

    const seams = seamTexture();
    // vitreous enamel: hard, glossy, mirror-like clearcoat
    const glass = () => new THREE.MeshPhysicalMaterial({
      roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.25, side: THREE.DoubleSide,
    });
    const M = {
      body: glass(),
      accent: glass(),
      cap: new THREE.MeshStandardMaterial({ color: 0xdadcd8, roughness: 0.4, metalness: 0 }),
      sealant: new THREE.MeshStandardMaterial({ color: 0x9a9d9f, roughness: 0.7, metalness: 0 }),
      membrane: new THREE.MeshPhysicalMaterial({
        color: 0xf1f2ee, map: seams, roughness: 0.55, metalness: 0, side: THREE.DoubleSide,
        // r128 takes sheen as a colour; r155+ as an amount plus sheenColor
        ...(LEGACY ? { sheen: new THREE.Color(0.3, 0.3, 0.3) } : { sheen: 0.3, sheenColor: 0xffffff }),
      }),
      membraneTrim: new THREE.MeshStandardMaterial({ color: 0xd9dbd7, roughness: 0.5, metalness: 0 }),
      glassPort: new THREE.MeshPhysicalMaterial({ color: 0x223040, roughness: 0.05, metalness: 0, clearcoat: 1 }),
      blower: new THREE.MeshStandardMaterial({ color: 0x2e5f9e, roughness: 0.45, metalness: 0.2 }),
      gas: new THREE.MeshStandardMaterial({ color: 0xe0ae1f, roughness: 0.45, metalness: 0.1 }),
      galv: new THREE.MeshStandardMaterial({ color: 0x9ba2a9, metalness: 0.75, roughness: 0.48 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.5, roughness: 0.55 }),
      red: new THREE.MeshStandardMaterial({ color: 0xb8322a, metalness: 0.2, roughness: 0.5 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0xb7b1a7, metalness: 0, roughness: 0.95 }),
    };

    linearize({ material: Object.values(M) });

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const visibility = watchVisibility(host);
    renderer.setAnimationLoop(() => {
      if (!visibility.state.visible) return;
      controls.update();
      renderer.render(scene, camera);
    });

    ctx.current = { renderer, scene, camera, controls, sun, M, tank: null, reduced, framed: false };

    return () => {
      renderer.setAnimationLoop(null);
      visibility.disconnect();
      ro.disconnect();
      controls.dispose();
      if (ctx.current.tank) {
        scene.remove(ctx.current.tank);
        disposeGroup(ctx.current.tank);
      }
      Object.values(M).forEach((m) => m.dispose());
      seams.dispose();
      scene.environment?.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      ctx.current = null;
    };
  }, []);

  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    if (c.tank) {
      c.scene.remove(c.tank);
      disposeGroup(c.tank);
    }
    const nCourses = Math.max(1, Math.min(8, Math.round(courses)));
    const acc = Math.max(0, Math.min(nCourses, Math.round(accentCourses)));
    const { tank, D, topY } = buildTank(c.M, { diameter, courses: nCourses, roof, accentCourses: acc });
    linearize(tank);
    c.scene.add(tank);
    c.tank = tank;

    const target = V(0, topY * 0.45, 0);
    const dist = Math.max(D, topY * 1.6) * 1.9 + 4;
    const dir = c.framed
      ? c.camera.position.clone().sub(c.controls.target).normalize()
      : V(0.66, 0.3, 0.69).normalize();
    c.controls.target.copy(target);
    c.camera.position.copy(target).addScaledVector(dir, dist);
    c.controls.minDistance = dist * 0.3;
    c.controls.maxDistance = dist * 2.2;
    c.framed = true;

    const s = Math.max(D, topY) * 0.95 + 5;
    Object.assign(c.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 120 });
    c.sun.shadow.camera.updateProjectionMatrix();
    c.controls.update();
  }, [diameter, courses, roof, accentCourses]);

  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    lin(c.M.body.color.set(color));
    lin(c.M.accent.color.set(accentColor));
  }, [color, accentColor]);

  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    c.controls.autoRotate = autoRotate && !c.reduced;
    c.controls.autoRotateSpeed = rotateSpeed;
    c.controls.enabled = interactive;
    c.renderer.domElement.style.cursor = interactive ? "grab" : "default";
    c.renderer.domElement.style.touchAction = interactive ? "none" : "auto";
  }, [autoRotate, rotateSpeed, interactive]);

  return <div ref={hostRef} className={className} style={{ position: "relative", width: "100%", height: "100%", ...style }} />;
}
