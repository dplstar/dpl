// Model updated by the DPL Star team. Compatibility helpers (threeCompat.js) let it run on the site's three.js r128.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LEGACY, setupRenderer, srgbTexture, lin, linearize, watchVisibility } from "./threeCompat.js";

/**
 * FBTank — interactive 3D exterior of a DPL Star Fusion Bond Epoxy (FBE)
 * bolted steel tank with an aluminium geodesic dome roof.
 *
 * Usage:
 *   <div style={{ height: 600 }}>
 *     <FBTank />
 *   </div>
 *
 * Fills its parent, transparent background. Requires: npm i three (r155+).
 *
 * Build: factory-coated epoxy panels in 1.22 m courses, running-bond lap
 * joints with encapsulated (capped) bolt heads and sealant beads,
 * colour-matched curb angles and wind girder, triangulated aluminium
 * geodesic dome with hubs, struts, rim flashing, apex vent and access hatch,
 * caged ladder with top landing, side manway, nozzles, level indicator.
 */

const COURSE_H = 1.22;
const PANEL_W = 2.75;
const PLINTH_H = 0.45;
const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const deg = (d) => (d * Math.PI) / 180;

/* ---------------- textures ---------------- */
function orangePeel(renderer) {
  // subtle roughness variation that reads as a powder-coated epoxy finish
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  x.fillStyle = "rgb(100,100,100)";
  x.fillRect(0, 0, s, s);
  for (let i = 0; i < 2600; i++) {
    const px = Math.random() * s, py = Math.random() * s, r = 1 + Math.random() * 3.5;
    const v = 100 + (Math.random() - 0.5) * 34;
    x.fillStyle = `rgba(${v},${v},${v},0.5)`;
    for (const dx of [-s, 0, s])
      for (const dy of [-s, 0, s]) {
        x.beginPath();
        x.arc(px + dx, py + dy, r, 0, Math.PI * 2);
        x.fill();
      }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function brushedAlu(renderer) {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  x.fillStyle = "#d3d7da";
  x.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * s, v = 205 + (Math.random() - 0.5) * 30;
    x.strokeStyle = `rgba(${v | 0},${(v + 3) | 0},${(v + 5) | 0},0.35)`;
    x.lineWidth = 0.5 + Math.random();
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(s, y + (Math.random() - 0.5) * 2);
    x.stroke();
  }
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
function arcPatch(th0, th1, y0, y1, r, segs) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= 1; j++) {
    const y = j ? y1 : y0;
    for (let i = 0; i <= segs; i++) {
      const t = th0 + ((th1 - th0) * i) / segs;
      pos.push(Math.sin(t) * r, y, Math.cos(t) * r);
      uv.push((t * r) / 0.8, y / 0.8);
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
function tube(pts, r, mat, parent) {
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2);
  return mesh(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 6), r, 6, false), mat, parent);
}
function box(w, h, d, mat, parent, x, y, z) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
  m.position.set(x, y, z);
  return m;
}

/* ---------------- geodesic dome ---------------- */
function buildDome(tank, M, Rr, yRim, ladderAngle) {
  const h = 0.34 * Rr; // rise ≈ 17% of diameter
  const Rs = (Rr * Rr + h * h) / (2 * h);
  const phiMax = Math.asin(Rr / Rs);
  const yC = yRim - Rs * Math.cos(phiMax);
  const C = V(0, yC, 0);
  const N = Math.max(3, Math.round((Rs * phiMax) / 1.55));

  // vertices: concentric rings with 6k nodes (triangulated disk on a sphere)
  const verts = [];
  const start = [];
  for (let k = 0; k <= N; k++) {
    start.push(verts.length);
    if (k === 0) { verts.push(V(0, yC + Rs, 0)); continue; }
    const phi = (phiMax * k) / N;
    for (let j = 0; j < 6 * k; j++) {
      const th = (2 * Math.PI * j) / (6 * k);
      verts.push(V(Rs * Math.sin(phi) * Math.sin(th), yC + Rs * Math.cos(phi), Rs * Math.sin(phi) * Math.cos(th)));
    }
  }
  const idx = (k, j) => (k === 0 ? 0 : start[k] + (((j % (6 * k)) + 6 * k) % (6 * k)));
  const tris = [];
  for (let k = 1; k <= N; k++)
    for (let s = 0; s < 6; s++) {
      const o = (i) => idx(k, s * k + i);
      const inn = (i) => idx(k - 1, s * (k - 1) + i);
      for (let i = 0; i < k; i++) tris.push([o(i), o(i + 1), inn(i)]);
      for (let i = 0; i < k - 1; i++) tris.push([inn(i), o(i + 1), inn(i + 1)]);
    }

  // flat aluminium triangle panels
  const pos = [], uv = [];
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), n = new THREE.Vector3(), cen = new THREE.Vector3();
  for (const t of tris) {
    let [a, b, c] = t.map((i) => verts[i]);
    ab.subVectors(b, a); ac.subVectors(c, a); n.crossVectors(ab, ac);
    cen.copy(a).add(b).add(c).multiplyScalar(1 / 3).sub(C);
    if (n.dot(cen) < 0) [b, c] = [c, b];
    for (const p of [a, b, c]) { pos.push(p.x, p.y, p.z); uv.push(p.x / 1.2, p.z / 1.2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  mesh(g, M.alu, tank);

  // struts (instanced boxes) along every unique edge
  const edges = new Map();
  for (const t of tris)
    for (let e = 0; e < 3; e++) {
      const a = t[e], b = t[(e + 1) % 3];
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (!edges.has(key)) edges.set(key, [a, b]);
    }
  const strutGeo = new THREE.BoxGeometry(1, 1, 1);
  const struts = new THREE.InstancedMesh(strutGeo, M.aluFrame, edges.size);
  const m4 = new THREE.Matrix4();
  const xA = new THREE.Vector3(), yA = new THREE.Vector3(), zA = new THREE.Vector3(), mid = new THREE.Vector3();
  let si = 0;
  for (const [a, b] of edges.values()) {
    const A = verts[a], B = verts[b];
    mid.addVectors(A, B).multiplyScalar(0.5);
    const nrm = mid.clone().sub(C).normalize();
    xA.subVectors(B, A);
    const L = xA.length();
    xA.divideScalar(L);
    yA.copy(nrm).addScaledVector(xA, -nrm.dot(xA)).normalize();
    zA.crossVectors(xA, yA);
    m4.makeBasis(xA.clone().multiplyScalar(L), yA.clone().multiplyScalar(0.06), zA.clone().multiplyScalar(0.05));
    m4.setPosition(mid.clone().addScaledVector(nrm, 0.03));
    struts.setMatrixAt(si++, m4);
  }
  struts.castShadow = true;
  tank.add(struts);

  // hubs at every node
  const hubGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12);
  hubGeo.rotateX(Math.PI / 2);
  const hubs = new THREE.InstancedMesh(hubGeo, M.aluFrame, verts.length);
  const dmy = new THREE.Object3D();
  verts.forEach((p, i) => {
    const nrm = p.clone().sub(C).normalize();
    dmy.position.copy(p).addScaledVector(nrm, 0.065);
    dmy.lookAt(p.clone().addScaledVector(nrm, 2));
    dmy.updateMatrix();
    hubs.setMatrixAt(i, dmy.matrix);
  });
  tank.add(hubs);

  // rim tension ring + flashing skirt
  const segsC = Math.max(96, Math.round((2 * Math.PI * Rr) / 0.08));
  const ring = mesh(new THREE.CylinderGeometry(Rr + 0.01, Rr + 0.01, 0.2, segsC, 1, true), M.aluFrame, tank);
  ring.position.y = yRim - 0.04;
  const skirt = mesh(new THREE.CylinderGeometry(Rr + 0.045, Rr + 0.045, 0.1, segsC, 1, true), M.alu, tank);
  skirt.position.y = yRim - 0.1;

  // apex ventilator
  const yTop = yC + Rs;
  const vb = mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.12, 32), M.aluFrame, tank);
  vb.position.y = yTop + 0.06;
  const vs = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 32, 1, true), M.dark, tank);
  vs.position.y = yTop + 0.22;
  const vc = mesh(new THREE.SphereGeometry(0.46, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.alu, tank);
  vc.scale.y = 0.36;
  vc.position.y = yTop + 0.31;

  // access hatch near the rim, on the ladder side
  const phiH = phiMax - 0.95 / Rs;
  const hp = V(Rs * Math.sin(phiH) * Math.sin(ladderAngle), yC + Rs * Math.cos(phiH), Rs * Math.sin(phiH) * Math.cos(ladderAngle));
  const hn = hp.clone().sub(C).normalize();
  const hatch = new THREE.Group();
  hatch.position.copy(hp);
  hatch.lookAt(hp.clone().add(hn));
  tank.add(hatch);
  box(0.8, 0.8, 0.14, M.aluFrame, hatch, 0, 0, 0.1);
  box(0.86, 0.86, 0.03, M.alu, hatch, 0, 0, 0.18);
  box(0.2, 0.03, 0.03, M.dark, hatch, 0, -0.33, 0.21);

  return { yTop, h };
}

/* ---------------- tank builder ---------------- */
function buildTank(M, diameter, courses) {
  const tank = new THREE.Group();
  const D = diameter, R = D / 2, H = courses * COURSE_H;

  // encapsulated bolt heads (instanced)
  const capMats = [];
  const dmy = new THREE.Object3D();
  const addCap = (t, y, r) => {
    const p = V(Math.sin(t) * r, y, Math.cos(t) * r);
    dmy.position.copy(p);
    dmy.lookAt(p.clone().add(V(Math.sin(t), 0, Math.cos(t))));
    dmy.updateMatrix();
    capMats.push(dmy.matrix.clone());
  };

  /* ---- shell ---- */
  const n = Math.max(6, Math.round((2 * Math.PI * R) / PANEL_W));
  const dT = (2 * Math.PI) / n;
  const LAP = 0.075, lapA = LAP / R, HLAP = 0.075;
  const RV = R + 0.005, RH = R + 0.01;
  const segsPanel = Math.max(10, Math.ceil((dT * R) / 0.12));
  const segsC = Math.max(96, Math.round((2 * Math.PI * R) / 0.07));

  for (let k = 0; k < courses; k++) {
    const y0 = k * COURSE_H, y1 = y0 + COURSE_H;
    const off = ((k % 2) * dT) / 2;
    for (let p = 0; p < n; p++) {
      const t0 = off + p * dT, t1 = t0 + dT;
      mesh(arcPatch(t0, t1, y0, y1, R, segsPanel), M.epoxy, tank);
      mesh(arcPatch(t1, t1 + lapA, y0, y1, RV, 2), M.epoxy, tank, false, true);
      // sealant bead on the lap edge
      const tb = t1 + lapA;
      cyl(V(Math.sin(tb) * RV, y0, Math.cos(tb) * RV), V(Math.sin(tb) * RV, y1, Math.cos(tb) * RV), 0.004, M.sealant, tank, 4).castShadow = false;

      const vy1 = k < courses - 1 ? y1 - HLAP - 0.02 : y1 - 0.1;
      const vy0 = y0 + (k === 0 ? 0.12 : 0.04);
      const cnt = Math.max(2, Math.round((vy1 - vy0) / 0.08));
      for (let b = 0; b <= cnt; b++) {
        const y = vy0 + ((vy1 - vy0) * b) / cnt;
        addCap(t1 + lapA * 0.28, y, RV);
        addCap(t1 + lapA * 0.72, y, RV);
      }
      if (k > 0) {
        mesh(arcPatch(t0, t1 + lapA, y0 - HLAP, y0, RH, segsPanel), M.epoxy, tank, false, true);
        const cntH = Math.round(((t1 - t0) * R) / 0.08);
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

  /* ---- colour-matched curb angles ---- */
  const rc = RH + 0.006;
  const curb = mesh(new THREE.CylinderGeometry(rc, rc, 0.08, segsC, 1, true), M.epoxyTrim, tank);
  curb.position.y = H - 0.04;
  const curbF = mesh(new THREE.RingGeometry(R - 0.03, rc + 0.075, segsC), M.epoxyTrim, tank);
  curbF.rotation.x = -Math.PI / 2;
  curbF.position.y = H + 0.001;
  const base = mesh(new THREE.CylinderGeometry(rc, rc, 0.09, segsC, 1, true), M.epoxyTrim, tank);
  base.position.y = 0.045;
  const baseF = mesh(new THREE.RingGeometry(rc, rc + 0.1, segsC), M.epoxyTrim, tank);
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
      const t = (i / na) * Math.PI * 2 + 0.07;
      const g = new THREE.Group();
      g.rotation.y = t;
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
    const wf = mesh(new THREE.RingGeometry(RH, RH + 0.12, segsC), M.epoxyTrim, tank);
    wf.rotation.x = -Math.PI / 2;
    wf.position.y = yg;
    const lip = mesh(new THREE.CylinderGeometry(RH + 0.12, RH + 0.12, 0.07, segsC, 1, true), M.epoxyTrim, tank);
    lip.position.y = yg - 0.035;
    const leg = mesh(new THREE.CylinderGeometry(RH + 0.004, RH + 0.004, 0.08, segsC, 1, true), M.epoxyTrim, tank);
    leg.position.y = yg + 0.04;
    const ng = Math.round((2 * Math.PI * R) / 1.4);
    for (let i = 0; i < ng; i++) {
      const g = new THREE.Group();
      g.rotation.y = (i / ng) * Math.PI * 2;
      tank.add(g);
      const gus = mesh(new THREE.BoxGeometry(0.01, 0.1, 0.11), M.epoxyTrim, g);
      gus.position.set(0, yg - 0.05, RH + 0.06);
    }
  }

  /* ---- plinth ---- */
  const pl = mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.62, PLINTH_H, 128), M.concrete, tank);
  pl.position.y = -PLINTH_H / 2;

  /* ---- aluminium geodesic dome ---- */
  const LADDER = deg(24);
  const yRim = H + 0.06;
  buildDome(tank, M, R + 0.04, yRim, LADDER);

  // capped bolts
  const capGeo = new THREE.SphereGeometry(0.016, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  capGeo.rotateX(Math.PI / 2);
  const caps = new THREE.InstancedMesh(capGeo, M.cap, capMats.length);
  capMats.forEach((m, i) => caps.setMatrixAt(i, m));
  tank.add(caps);

  const radial = (th) => {
    const g = new THREE.Group();
    g.rotation.y = th;
    tank.add(g);
    return g;
  };

  /* ---- caged ladder with top landing ---- */
  {
    const L = radial(LADDER);
    const zr = R + 0.34, xs = 0.23;
    const yLand = H + 0.16, top = yLand + 1.05;
    for (const sx of [-1, 1]) box(0.014, top, 0.065, M.galv, L, sx * xs, top / 2, zr);
    for (let y = 0.3; y < yLand + 0.05; y += 0.3) cyl(V(-xs, y, zr), V(xs, y, zr), 0.013, M.galv, L, 8);
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

    // grating landing between shell and ladder, with guardrails
    const z0 = R + 0.1, z1 = zr - 0.04, hx = 0.5;
    box(hx * 2, 0.03, z1 - z0, M.galv, L, 0, yLand, (z0 + z1) / 2);
    for (let x = -hx + 0.05; x < hx; x += 0.06) box(0.008, 0.03, z1 - z0, M.dark, L, x, yLand + 0.004, (z0 + z1) / 2);
    for (const sx of [-1, 1]) {
      cyl(V(sx * hx, yLand, z0), V(sx * hx, yLand + 1.05, z0), 0.02, M.galv, L, 10);
      cyl(V(sx * hx, yLand, z1), V(sx * hx, yLand + 1.05, z1), 0.02, M.galv, L, 10);
      run([V(sx * hx, yLand + 1.05, z0), V(sx * hx, yLand + 1.05, z1), V(sx * xs, top, zr)], 0.018, M.galv, L, 10);
      cyl(V(sx * hx, yLand + 0.52, z0), V(sx * hx, yLand + 0.52, z1), 0.015, M.galv, L, 8);
      box(0.012, 0.1, z1 - z0, M.galv, L, sx * hx, yLand + 0.065, (z0 + z1) / 2);
    }
  }

  /* ---- side shell manway with davit ---- */
  {
    const G = radial(deg(-14));
    const yc = 0.62, rCov = 0.33, zF = R + 0.01;
    flange(V(0, yc, zF + 0.015), V(0, 0, 1), rCov + 0.08, 0.03, M.epoxyTrim, G);
    flange(V(0, yc, zF + 0.045), V(0, 0, 1), rCov + 0.03, 0.03, M.epoxy, G);
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
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.17, 0.03, M.epoxyTrim, G);
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

  /* ---- inlet: side-shell nozzle near the top (dome stays clean) ---- */
  {
    const G = radial(deg(150));
    const r = 0.075, zo = R + 0.4, zg = R + 0.9, yIn = H - 0.35;
    flange(V(0, yIn, R + 0.02), V(0, 0, 1), 0.16, 0.03, M.epoxyTrim, G);
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
    flange(V(0, y, R + 0.02), V(0, 0, 1), 0.14, 0.025, M.epoxyTrim, G);
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
    const yp = y0 + (y1 - y0) * 0.66;
    const ptr = mesh(new THREE.ConeGeometry(0.04, 0.09, 3), M.red, G);
    ptr.rotation.z = Math.PI / 2;
    ptr.position.set(0.1, yp, zb + 0.03);
    box(0.02, 0.05, 0.03, M.red, G, 0.14, yp, zb + 0.03);
    box(0.16, 0.14, 0.14, M.galv, G, 0.14, H + 0.05, R + 0.24);
    cyl(V(0.155, yp + 0.03, zb + 0.03), V(0.155, H - 0.02, zb + 0.03), 0.003, M.dark, G, 4);
  }

  /* ---- drain ---- */
  {
    const G = radial(deg(205));
    run([V(0, 0.18, R - 0.02), V(0, 0.18, R + 0.28)], 0.06, M.galv, G);
    flange(V(0, 0.18, R + 0.02), V(0, 0, 1), 0.12, 0.022, M.epoxyTrim, G);
    flange(V(0, 0.18, R + 0.29), V(0, 0, 1), 0.12, 0.025, M.dark, G);
  }

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

function applyColor(M, hex) {
  const c = lin(new THREE.Color(hex));
  M.epoxy.color.copy(c);
  M.epoxyTrim.color.copy(c).multiplyScalar(0.92);
  M.cap.color.copy(c).multiplyScalar(0.8);
}

/* ---------------- component ---------------- */
export const FBE_COLORS = {
  blue: "#23457a",
  green: "#2f5e3c",
  grey: "#6f7880",
  tan: "#c7b58e",
};

export default function FBTank({
  diameter = 12, // metres
  courses = 5, // panel courses, 1.22 m each (max 8)
  color = FBE_COLORS.blue, // any hex, or one of FBE_COLORS
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

    const peel = orangePeel(renderer);
    const alu = brushedAlu(renderer);
    const M = {
      epoxy: new THREE.MeshPhysicalMaterial({ roughness: 1, roughnessMap: peel, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35, side: THREE.DoubleSide }),
      epoxyTrim: new THREE.MeshPhysicalMaterial({ roughness: 0.42, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4, side: THREE.DoubleSide }),
      cap: new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0 }),
      sealant: new THREE.MeshStandardMaterial({ color: 0x3b3e41, roughness: 0.8, metalness: 0 }),
      alu: new THREE.MeshStandardMaterial({ map: alu, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide }),
      aluFrame: new THREE.MeshStandardMaterial({ color: 0xb9bec2, metalness: 0.85, roughness: 0.38 }),
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
      peel.dispose();
      alu.dispose();
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

    const topY = H + 0.34 * (D / 2);
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

    const s = Math.max(D, topY) * 0.95 + 4;
    Object.assign(c.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 120 });
    c.sun.shadow.camera.updateProjectionMatrix();
    c.controls.update();
  }, [diameter, courses]);

  useEffect(() => {
    if (ctx.current) applyColor(ctx.current.M, color);
  }, [color]);

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
