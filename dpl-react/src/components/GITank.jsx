// Model updated by the DPL Star team. Compatibility helpers (threeCompat.js) let it run on the site's three.js r128.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupRenderer, srgbTexture, lin, linearize, watchVisibility } from "./threeCompat.js";

/**
 * GITank — interactive 3D exterior of a DPL Star hot-dip galvanized (GI)
 * bolted-panel water tank.
 *
 * Usage:
 *   <div style={{ height: 600 }}>
 *     <GITank />
 *   </div>
 *
 * Fills its parent, transparent background. Requires: npm i three (r155+).
 *
 * Build: flat curved HDG panels in 1.22 m courses (max 8 courses = 9.76 m),
 * running-bond seams with lap joints, dense bolt rows, mastic sealant beads,
 * top/base curb angles, wind girder, bolted radial-panel cone roof,
 * side shell manway with davit, caged ladder, roof walkway + hatch, nozzles.
 */

const COURSE_H = 1.22; // panel height, metres
const PANEL_W = 2.75; // nominal panel arc width, metres
const PLINTH_H = 0.45;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const deg = (d) => (d * Math.PI) / 180;

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- textures ---------------- */
// Large, geometric hot-dip galvanizing spangle
function spangleTexture(renderer, base, contrast, seed) {
  const rand = rng(seed);
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  x.fillStyle = base;
  x.fillRect(0, 0, s, s);
  for (let i = 0; i < 340; i++) {
    const cx = rand() * s, cy = rand() * s;
    const r = 16 + rand() * 46, n = 6 + ((rand() * 5) | 0);
    const dl = (rand() - 0.5) * contrast;
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 0.5;
      const rr = r * (0.6 + rand() * 0.45);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    const dendrites = [];
    const nd = 3 + ((rand() * 4) | 0);
    for (let k = 0; k < nd; k++) {
      const a = rand() * Math.PI * 2;
      dendrites.push([Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8]);
    }
    const v = dl > 0 ? 255 : 0;
    for (const dx of [-s, 0, s])
      for (const dy of [-s, 0, s]) {
        if (cx + dx < -80 || cx + dx > s + 80 || cy + dy < -80 || cy + dy > s + 80) continue;
        x.fillStyle = `rgba(${v},${v},${v},${Math.abs(dl) / 255})`;
        x.beginPath();
        pts.forEach((p, k) => {
          const px = cx + p[0] + dx, py = cy + p[1] + dy;
          k ? x.lineTo(px, py) : x.moveTo(px, py);
        });
        x.closePath();
        x.fill();
        x.strokeStyle = `rgba(${255 - v},${255 - v},${255 - v},0.07)`;
        x.lineWidth = 1.2;
        for (const d of dendrites) {
          x.beginPath();
          x.moveTo(cx + dx, cy + dy);
          x.lineTo(cx + dx + d[0], cy + dy + d[1]);
          x.stroke();
        }
      }
  }
  const d = x.getImageData(0, 0, s, s);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (rand() - 0.5) * 10;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  x.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  srgbTexture(t);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
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
  const top = lin(new THREE.Color(0xd4e0ea)), hor = lin(new THREE.Color(0xf6f5f0)), gnd = lin(new THREE.Color(0x5f5a52));
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
  box(30, 22, 24, 22, 10, 3.2);
  box(-34, 12, -14, 12, 22, 1.7);
  box(0, 42, 0, 34, 34, 1.1);
  box(-10, 6, 38, 18, 6, 1.4);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.02).texture;
  pm.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

/* ---------------- geometry helpers ---------------- */
function arcPatch(th0, th1, y0, y1, r, segs, uvOff = [0, 0]) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= 1; j++) {
    const y = j ? y1 : y0;
    for (let i = 0; i <= segs; i++) {
      const t = th0 + ((th1 - th0) * i) / segs;
      pos.push(Math.sin(t) * r, y, Math.cos(t) * r);
      uv.push((t * r) / 1.3 + uvOff[0], y / 1.3 + uvOff[1]);
    }
  }
  const w = segs + 1;
  for (let i = 0; i < segs; i++) {
    const a = i, b = i + 1, c = i + w, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
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
function tube(pts, r, mat, parent, closed = false) {
  const curve = new THREE.CatmullRomCurve3(pts, closed, "catmullrom", 0.2);
  return mesh(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 6), r, 6, closed), mat, parent);
}
function box(w, h, d, mat, parent, x, y, z) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
  m.position.set(x, y, z);
  return m;
}

/* ---------------- tank builder ---------------- */
function buildTank(M, diameter, courses) {
  const tank = new THREE.Group();
  const rand = rng(7);
  const D = diameter, R = D / 2, H = courses * COURSE_H;
  const panelMat = () => {
    const v = rand();
    return v < 0.42 ? M.panels[0] : v < 0.7 ? M.panels[1] : v < 0.9 ? M.panels[2] : M.panels[3];
  };

  // bolts (instanced)
  const boltMats = [];
  const dmy = new THREE.Object3D();
  const tmp = new THREE.Vector3();
  const addBoltN = (p, n) => {
    dmy.position.copy(p);
    dmy.lookAt(tmp.copy(p).add(n));
    dmy.updateMatrix();
    boltMats.push(dmy.matrix.clone());
  };
  const addBolt = (t, y, r) => addBoltN(V(Math.sin(t) * r, y, Math.cos(t) * r), V(Math.sin(t), 0, Math.cos(t)));

  /* ---- shell: flat curved panels, running bond, lap joints ---- */
  const n = Math.max(6, Math.round((2 * Math.PI * R) / PANEL_W));
  const dT = (2 * Math.PI) / n;
  const LAP = 0.075, lapA = LAP / R;
  const HLAP = 0.075;
  const RV = R + 0.004, RH = R + 0.008; // vertical lap / horizontal lap radii
  const segsPanel = Math.max(10, Math.ceil((dT * R) / 0.12));
  const beads = [];

  for (let k = 0; k < courses; k++) {
    const y0 = k * COURSE_H, y1 = y0 + COURSE_H;
    const off = ((k % 2) * dT) / 2;
    for (let p = 0; p < n; p++) {
      const t0 = off + p * dT, t1 = t0 + dT;
      const mat = panelMat();
      const uvOff = [rand() * 10, rand() * 10];
      mesh(arcPatch(t0, t1, y0, y1, R, segsPanel, uvOff), mat, tank);
      // vertical lap: this panel's edge laps over the next one
      mesh(arcPatch(t1, t1 + lapA, y0, y1, RV, 2, uvOff), mat, tank, false, true);
      beads.push({ kind: "v", t: t1 + lapA, y0, y1: k < courses - 1 ? y1 : y1 });
      const vy1 = k < courses - 1 ? y1 - HLAP - 0.02 : y1 - 0.1;
      const vy0 = y0 + (k === 0 ? 0.12 : 0.04);
      const cnt = Math.max(2, Math.round((vy1 - vy0) / 0.075));
      for (let b = 0; b <= cnt; b++) {
        const y = vy0 + ((vy1 - vy0) * b) / cnt;
        addBolt(t1 + lapA * 0.28, y, RV + 0.007);
        addBolt(t1 + lapA * 0.72, y, RV + 0.007);
      }
      // horizontal lap: upper panel's bottom edge laps over the course below
      if (k > 0) {
        mesh(arcPatch(t0, t1 + lapA, y0 - HLAP, y0, RH, segsPanel, uvOff), mat, tank, false, true);
        const cntH = Math.round(((t1 - t0) * R) / 0.075);
        for (let b = 0; b < cntH; b++) {
          const t = t0 + ((b + 0.5) / cntH) * (t1 - t0);
          addBolt(t, y0 - HLAP * 0.3, RH + 0.007);
          addBolt(t + 0.5 * ((t1 - t0) / cntH), y0 - HLAP * 0.72, RH + 0.007);
        }
      }
    }
  }
  // mastic sealant beads along visible lap edges
  for (const b of beads) {
    const p0 = V(Math.sin(b.t) * (RV - 0.001), b.y0, Math.cos(b.t) * (RV - 0.001));
    const p1 = V(Math.sin(b.t) * (RV - 0.001), b.y1, Math.cos(b.t) * (RV - 0.001));
    cyl(p0, p1, 0.004, M.mastic, tank, 4).castShadow = false;
  }
  const segsC = Math.max(96, Math.round((2 * Math.PI * R) / 0.07));
  for (let k = 1; k < courses; k++) {
    const ring = mesh(new THREE.TorusGeometry(RH - 0.002, 0.004, 4, segsC), M.mastic, tank, false, false);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = k * COURSE_H - HLAP;
  }

  /* ---- top & base curb angles ---- */
  const rc = RH + 0.006;
  const curb = mesh(new THREE.CylinderGeometry(rc, rc, 0.08, segsC, 1, true), M.trim, tank);
  curb.position.y = H - 0.04;
  const curbF = mesh(new THREE.RingGeometry(R - 0.03, rc + 0.075, segsC), M.trim, tank);
  curbF.rotation.x = -Math.PI / 2;
  curbF.position.y = H + 0.001;
  const base = mesh(new THREE.CylinderGeometry(rc, rc, 0.09, segsC, 1, true), M.trim, tank);
  base.position.y = 0.045;
  const baseF = mesh(new THREE.RingGeometry(rc, rc + 0.1, segsC), M.trim, tank);
  baseF.rotation.x = -Math.PI / 2;
  baseF.position.y = 0.003;
  {
    const nb = Math.round((2 * Math.PI * R) / 0.15);
    for (let i = 0; i < nb; i++) {
      const t = (i / nb) * Math.PI * 2;
      addBolt(t, H - 0.04, rc + 0.007);
      addBolt(t, 0.045, rc + 0.007);
    }
    // anchor chairs on the base angle
    const na = Math.max(8, Math.round((2 * Math.PI * R) / 1.6));
    for (let i = 0; i < na; i++) {
      const t = (i / na) * Math.PI * 2 + 0.07;
      const g = new THREE.Group();
      g.rotation.y = t;
      tank.add(g);
      box(0.1, 0.16, 0.012, M.trim, g, 0, 0.08, rc + 0.05);
      box(0.012, 0.16, 0.1, M.trim, g, -0.05, 0.08, rc + 0.05);
      box(0.012, 0.16, 0.1, M.trim, g, 0.05, 0.08, rc + 0.05);
      const nut = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), M.bolt, g);
      nut.position.set(0, 0.17, rc + 0.06);
    }
  }

  /* ---- wind girder (intermediate stiffener) ---- */
  if (courses >= 4) {
    const yg = (courses - 2) * COURSE_H + COURSE_H * 0.5;
    const wf = mesh(new THREE.RingGeometry(RH, RH + 0.12, segsC), M.trim, tank);
    wf.rotation.x = -Math.PI / 2;
    wf.position.y = yg;
    const lip = mesh(new THREE.CylinderGeometry(RH + 0.12, RH + 0.12, 0.07, segsC, 1, true), M.trim, tank);
    lip.position.y = yg - 0.035;
    const leg = mesh(new THREE.CylinderGeometry(RH + 0.004, RH + 0.004, 0.08, segsC, 1, true), M.trim, tank);
    leg.position.y = yg + 0.04;
    const ng = Math.round((2 * Math.PI * R) / 1.4);
    for (let i = 0; i < ng; i++) {
      const t = (i / ng) * Math.PI * 2;
      const g = new THREE.Group();
      g.rotation.y = t;
      tank.add(g);
      const gus = mesh(new THREE.BoxGeometry(0.01, 0.1, 0.11), M.trim, g);
      gus.position.set(0, yg - 0.05, RH + 0.06);
    }
    const nb = Math.round((2 * Math.PI * R) / 0.3);
    for (let i = 0; i < nb; i++) addBolt((i / nb) * Math.PI * 2, yg + 0.045, RH + 0.011);
  }

  /* ---- plinth ---- */
  const pl = mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.62, PLINTH_H, 128), M.concrete, tank);
  pl.position.y = -PLINTH_H / 2;

  /* ---- bolted radial-panel cone roof ---- */
  const Re = R + 0.12, slope = deg(15), tanS = Math.tan(slope);
  const yBase = H + 0.04, rMin = 0.55, seamH = 0.014;
  const roofY = (r) => yBase + (Re - r) * tanS;
  const nRoof = Math.max(12, Math.round((2 * Math.PI * Re) / 2.2));
  {
    const aSegs = Math.max(8, Math.ceil(((2 * Math.PI) / nRoof) * Re / 0.15));
    for (let p = 0; p < nRoof; p++) {
      const t0 = (p / nRoof) * Math.PI * 2, t1 = ((p + 1) / nRoof) * Math.PI * 2;
      const pos = [], uv = [], idx = [];
      const uo = [rand() * 10, rand() * 10];
      for (let j = 0; j <= 1; j++) {
        const r = j ? rMin : Re;
        for (let i = 0; i <= aSegs; i++) {
          const t = t0 + ((t1 - t0) * i) / aSegs;
          pos.push(Math.sin(t) * r, roofY(r), Math.cos(t) * r);
          uv.push((Math.sin(t) * r) / 1.3 + uo[0], (Math.cos(t) * r) / 1.3 + uo[1]);
        }
      }
      const w = aSegs + 1;
      for (let i = 0; i < aSegs; i++) {
        const a = i, b = i + 1, c = i + w, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      mesh(g, panelMat(), tank);

      // raised bolted seam along the panel edge
      const len = (Re - rMin) / Math.cos(slope), mid = (Re + rMin) / 2;
      const sg = new THREE.Group();
      sg.rotation.order = "YXZ";
      sg.rotation.y = t0;
      sg.rotation.x = slope;
      sg.position.set(Math.sin(t0) * mid, roofY(mid) + seamH / 2, Math.cos(t0) * mid);
      tank.add(sg);
      mesh(new THREE.BoxGeometry(0.07, seamH, len), M.trim, sg);
      const nrm = V(Math.sin(t0) * Math.sin(slope), Math.cos(slope), Math.cos(t0) * Math.sin(slope));
      for (let r = Re - 0.08; r > rMin + 0.08; r -= 0.13) {
        const p = V(Math.sin(t0) * r, roofY(r) + seamH + 0.004, Math.cos(t0) * r);
        addBoltN(p, nrm);
      }
    }
    // eave edge
    const fascia = mesh(new THREE.CylinderGeometry(Re + 0.004, Re + 0.004, 0.09, segsC, 1, true), M.trim, tank);
    fascia.position.y = yBase - 0.035;
    // crown plate + vent
    const yTop = roofY(rMin);
    const crown = mesh(new THREE.CylinderGeometry(rMin + 0.08, rMin + 0.1, 0.05, 48), M.trim, tank);
    crown.position.y = yTop + 0.02;
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      addBoltN(V(Math.sin(t) * (rMin + 0.02), yTop + 0.05, Math.cos(t) * (rMin + 0.02)), V(0, 1, 0));
    }
    const neck = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.36, 32), M.panels[0], tank);
    neck.position.y = yTop + 0.22;
    const screen = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 32, 1, true), M.dark, tank);
    screen.position.y = yTop + 0.42;
    const cap = mesh(new THREE.SphereGeometry(0.4, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.trim, tank);
    cap.scale.y = 0.4;
    cap.position.y = yTop + 0.46;
  }

  const radial = (th) => {
    const g = new THREE.Group();
    g.rotation.y = th;
    tank.add(g);
    return g;
  };

  /* ---- caged ladder, roof walkway, hatch, handrails ---- */
  {
    const L = radial(deg(24));
    const zr = R + 0.32, top = H + 1.05, xs = 0.23;
    for (const sx of [-1, 1]) box(0.014, top, 0.065, M.galv, L, sx * xs, top / 2, zr);
    for (let y = 0.3; y < top - 0.05; y += 0.3) cyl(V(-xs, y, zr), V(xs, y, zr), 0.013, M.galv, L, 8);
    for (let yb = 0.8; yb < H; yb += 1.5)
      for (const sx of [-1, 1]) box(0.03, 0.045, zr - R, M.galv, L, sx * xs, yb, R + (zr - R) / 2);

    const c = zr + 0.3, cr = 0.4, yCage0 = 2.2;
    const hoopYs = [];
    for (let y = yCage0; y <= H + 0.95; y += 0.7) hoopYs.push(y);
    if (hoopYs[hoopYs.length - 1] < H + 0.8) hoopYs.push(H + 0.95);
    for (const y of hoopYs) {
      const pts = [V(-xs, y, zr)];
      for (let a = 200; a >= -20; a -= 10) pts.push(V(cr * Math.cos(deg(a)), y, c + cr * Math.sin(deg(a))));
      pts.push(V(xs, y, zr));
      tube(pts, 0.012, M.galv, L);
    }
    const yc1 = hoopYs[hoopYs.length - 1];
    for (const a of [165, 125, 90, 55, 15])
      cyl(V(cr * Math.cos(deg(a)), yCage0, c + cr * Math.sin(deg(a))), V(cr * Math.cos(deg(a)), yc1, c + cr * Math.sin(deg(a))), 0.01, M.galv, L, 6);

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
    box(0.7, 0.12, 0.7, M.trim, hatch, 0, 0.06, 0);
    box(0.78, 0.03, 0.78, M.panels[1], hatch, 0, 0.135, 0);
    box(0.18, 0.02, 0.025, M.dark, hatch, 0, 0.16, 0.3);

    const zA = R - 0.05, zB = R - 1.25, hx = 0.45;
    for (const sx of [-1, 1]) {
      for (const z of [zA, zB]) cyl(V(sx * hx, roofY(z), z), V(sx * hx, roofY(z) + 1.0, z), 0.018, M.galv, L, 10);
      run([V(sx * xs, top, zr), V(sx * hx, roofY(zA) + 1.0, zA), V(sx * hx, roofY(zB) + 1.0, zB)], 0.018, M.galv, L, 10);
      cyl(V(sx * hx, roofY(zA) + 0.5, zA), V(sx * hx, roofY(zB) + 0.5, zB), 0.015, M.galv, L, 8);
    }
  }

  /* ---- side shell manway with davit arm (bottom course) ---- */
  {
    const G = radial(deg(-14));
    const yc = 0.62, rCov = 0.33;
    const zF = R + 0.01;
    flange(V(0, yc, zF + 0.015), V(0, 0, 1), rCov + 0.08, 0.03, M.trim, G);
    flange(V(0, yc, zF + 0.045), V(0, 0, 1), rCov + 0.03, 0.03, M.panels[2], G);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const b = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 6), M.bolt, G);
      b.rotation.x = Math.PI / 2;
      b.position.set(Math.cos(a) * (rCov + 0.045), yc + Math.sin(a) * (rCov + 0.045), zF + 0.068);
    }
    for (const sx of [-1, 1])
      tube([V(sx * 0.12, yc - 0.1, zF + 0.06), V(sx * 0.12, yc - 0.1, zF + 0.12), V(sx * 0.12, yc + 0.1, zF + 0.12), V(sx * 0.12, yc + 0.1, zF + 0.06)], 0.01, M.galv, G);
    // davit
    const dx = rCov + 0.22;
    cyl(V(dx, 0.05, R + 0.12), V(dx, yc + 0.62, R + 0.12), 0.03, M.galv, G, 12);
    for (const yb of [0.25, yc + 0.45]) box(0.05, 0.05, 0.12, M.galv, G, dx, yb, R + 0.06);
    run([V(dx, yc + 0.62, R + 0.12), V(dx, yc + 0.62, R + 0.2), V(0.04, yc + 0.62, R + 0.2)], 0.022, M.galv, G, 10);
    cyl(V(0.04, yc + 0.62, R + 0.2), V(0.04, yc + 0.4, R + 0.2), 0.008, M.dark, G, 6);
  }

  /* ---- outlet with gate valve ---- */
  {
    const G = radial(deg(72));
    const y = 0.35, r = 0.08;
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.16, 0.03, M.trim, G);
    run([V(0, y, R - 0.02), V(0, y, R + 0.34)], r, M.galv, G);
    const zv = R + 0.46;
    flange(V(0, y, zv - 0.12), V(0, 0, 1), 0.15, 0.025, M.dark, G);
    flange(V(0, y, zv + 0.12), V(0, 0, 1), 0.15, 0.025, M.dark, G);
    cyl(V(0, y, zv - 0.12), V(0, y, zv + 0.12), 0.105, M.dark, G, 20);
    cyl(V(0, y, zv), V(0, y + 0.3, zv), 0.03, M.dark, G, 10);
    const wheel = mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 28), M.red, G);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0, y + 0.31, zv);
    cyl(V(-0.12, y + 0.31, zv), V(0.12, y + 0.31, zv), 0.008, M.red, G, 6);
    cyl(V(0, y + 0.31, zv - 0.12), V(0, y + 0.31, zv + 0.12), 0.008, M.red, G, 6);
    run([V(0, y, zv + 0.12), V(0, y, R + 1.05), V(0, -PLINTH_H - 0.05, R + 1.05)], r, M.galv, G);
  }

  /* ---- inlet riser over the roof edge ---- */
  {
    const G = radial(deg(150));
    const r = 0.07, zo = R + 0.34, zg = R + 0.85;
    run(
      [V(0, -PLINTH_H - 0.05, zg), V(0, 0.35, zg), V(0, 0.6, zo), V(0, H + 0.42, zo), V(0, H + 0.42, R - 0.35), V(0, roofY(R - 0.35) + 0.02, R - 0.35)],
      r, M.galv, G
    );
    flange(V(0, roofY(R - 0.35) + 0.03, R - 0.35), V(0, 1, 0), 0.14, 0.03, M.galv, G);
    for (let yc = 1.2; yc < H; yc += 1.4) box(0.05, 0.05, zo - R, M.galv, G, 0, yc, R + (zo - R) / 2);
    const yv = 1.35;
    flange(V(0, yv - 0.1, zo), V(0, 1, 0), 0.13, 0.022, M.dark, G);
    flange(V(0, yv + 0.1, zo), V(0, 1, 0), 0.13, 0.022, M.dark, G);
    cyl(V(0, yv - 0.1, zo), V(0, yv + 0.1, zo), 0.095, M.dark, G, 18);
    cyl(V(0, yv, zo), V(0, yv, zo + 0.28), 0.028, M.dark, G, 10);
    const wheel = mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 28), M.red, G);
    wheel.position.set(0, yv, zo + 0.29);
  }

  /* ---- overflow down-pipe ---- */
  {
    const G = radial(deg(-48));
    const r = 0.06, y = H - 0.25, zo = R + 0.38;
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.13, 0.025, M.trim, G);
    run([V(0, y, R - 0.02), V(0, y, zo), V(0, 0.28, zo), V(0, 0.1, R + 0.52)], r, M.galv, G);
    for (let yc = 0.9; yc < y - 0.3; yc += 1.3) box(0.045, 0.045, zo - R, M.galv, G, 0, yc, R + (zo - R) / 2);
  }

  /* ---- float-type level indicator ---- */
  {
    const G = radial(deg(-72));
    const y0 = 0.3, y1 = H - 0.3, zb = R + 0.2;
    const mat = new THREE.MeshStandardMaterial({ map: gaugeTexture(y0, y1), metalness: 0.1, roughness: 0.55 });
    mat.userData.own = true;
    const board = mesh(new THREE.PlaneGeometry(0.12, y1 - y0), mat, G, false, true);
    board.position.set(0, (y0 + y1) / 2, zb + 0.012);
    box(0.14, y1 - y0 + 0.04, 0.02, M.galv, G, 0, (y0 + y1) / 2, zb);
    for (let yb = y0 + 0.1; yb < y1; yb += 1.8) box(0.04, 0.03, zb - R, M.galv, G, 0, yb, R + (zb - R) / 2);
    const yp = y0 + (y1 - y0) * 0.72;
    const ptr = mesh(new THREE.ConeGeometry(0.04, 0.09, 3), M.red, G);
    ptr.rotation.z = Math.PI / 2;
    ptr.position.set(0.1, yp, zb + 0.03);
    box(0.02, 0.05, 0.03, M.red, G, 0.14, yp, zb + 0.03);
    box(0.16, 0.14, 0.14, M.galv, G, 0.14, H + 0.12, R + 0.14);
    cyl(V(0.155, yp + 0.03, zb + 0.03), V(0.155, H + 0.05, zb + 0.03), 0.003, M.dark, G, 4);
  }

  /* ---- scour / drain ---- */
  {
    const G = radial(deg(205));
    run([V(0, 0.18, R - 0.02), V(0, 0.18, R + 0.28)], 0.055, M.galv, G);
    flange(V(0, 0.18, R + 0.02), V(0, 0, 1), 0.11, 0.022, M.trim, G);
    flange(V(0, 0.18, R + 0.29), V(0, 0, 1), 0.11, 0.025, M.dark, G);
  }

  // instanced bolts
  const bg = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 6);
  bg.rotateX(Math.PI / 2);
  const bolts = new THREE.InstancedMesh(bg, M.bolt, boltMats.length);
  boltMats.forEach((m, i) => bolts.setMatrixAt(i, m));
  tank.add(bolts);

  return { tank, D, H };
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
export default function GITank({
  diameter = 10, // metres (DPL range 2–30)
  courses = 6, // panel courses, 1.22 m each (max 8 = 9.76 m)
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
    scene.add(new THREE.HemisphereLight(0xeef3f8, 0x575148, 0.4 * Math.PI));
    const sun = new THREE.DirectionalLight(0xfff3e2, 2.3 * Math.PI);
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

    // four panel finishes: HDG panels never come out of the kettle identical
    const tex = [
      spangleTexture(renderer, "#b9bec2", 70, 11),
      spangleTexture(renderer, "#a9afb3", 60, 23),
      spangleTexture(renderer, "#c6cacc", 55, 37),
      spangleTexture(renderer, "#9da2a5", 40, 51),
    ];
    const M = {
      panels: [
        new THREE.MeshStandardMaterial({ map: tex[0], metalness: 0.72, roughness: 0.42, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ map: tex[1], metalness: 0.68, roughness: 0.47, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ map: tex[2], metalness: 0.76, roughness: 0.37, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ map: tex[3], metalness: 0.55, roughness: 0.58, side: THREE.DoubleSide }),
      ],
      trim: new THREE.MeshStandardMaterial({ color: 0xaab0b5, map: tex[1], metalness: 0.75, roughness: 0.4, side: THREE.DoubleSide }),
      bolt: new THREE.MeshStandardMaterial({ color: 0x8b9197, metalness: 0.85, roughness: 0.45 }),
      galv: new THREE.MeshStandardMaterial({ color: 0x9ba2a9, metalness: 0.75, roughness: 0.48 }),
      mastic: new THREE.MeshStandardMaterial({ color: 0x2b2d2f, metalness: 0, roughness: 0.8 }),
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
      M.panels.forEach((m) => m.dispose());
      Object.entries(M).forEach(([k, m]) => k !== "panels" && m.dispose());
      tex.forEach((t) => t.dispose());
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
    const { tank, D, H } = buildTank(c.M, diameter, nCourses);
    linearize(tank);
    c.scene.add(tank);
    c.tank = tank;

    const target = V(0, H * 0.46, 0);
    const dist = Math.max(D, H * 1.6) * 1.95 + 4;
    const dir = c.framed
      ? c.camera.position.clone().sub(c.controls.target).normalize()
      : V(0.66, 0.3, 0.69).normalize();
    c.controls.target.copy(target);
    c.camera.position.copy(target).addScaledVector(dir, dist);
    c.controls.minDistance = dist * 0.3;
    c.controls.maxDistance = dist * 2.2;
    c.framed = true;

    const s = Math.max(D, H) * 0.95 + 4;
    Object.assign(c.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 120 });
    c.sun.shadow.camera.updateProjectionMatrix();
    c.controls.update();
  }, [diameter, courses]);

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
