/* ═══════════════════ 3D STORY ═══════════════════
   Scroll-driven exploded-view tank on the home page hero. Only index.html
   loads this (and the three.js CDN script before it). */

(function () {
  const stage = document.getElementById("story");
  const wrap = document.getElementById("gl");

  if (!stage || !wrap || typeof THREE === "undefined") {
    return;
  }

  /* ─── helpers ─── */
  const cl = (v) => Math.max(0, Math.min(1, v));
  const sm = (t) => t * t * (3 - 2 * t);
  const rp = (p, a, b) => sm(cl((p - a) / (b - a)));

  /* ─── env map ─── */
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (i === 2) {
      g.fillStyle = "#f2f4f6";
      g.fillRect(0, 0, 128, 128);
    } else if (i === 3) {
      g.fillStyle = "#0b0e11";
      g.fillRect(0, 0, 128, 128);
    } else {
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, "#e6eaed");
      gr.addColorStop(0.42, "#5d666e");
      gr.addColorStop(0.5, "#d7dde2");
      gr.addColorStop(0.58, "#2e363e");
      gr.addColorStop(1, "#0b0e11");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      if (i === 0) {
        g.fillStyle = "rgba(232,163,61,0.55)";
        g.fillRect(0, 60, 128, 6);
      }
    }
    faces.push(c);
  }

  const env = new THREE.CubeTexture(faces);
  env.encoding = THREE.sRGBEncoding;
  env.needsUpdate = true;

  /* ─── renderer ─── */
  let W = wrap.clientWidth || window.innerWidth;
  let H = wrap.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  ren.setSize(W, H);
  ren.outputEncoding = THREE.sRGBEncoding;
  ren.toneMapping = THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure = 1.05;
  wrap.appendChild(ren.domElement);

  /* ─── lights ─── */
  scene.add(new THREE.HemisphereLight(0xe9eef2, 0x12161b, 0.55));
  const kl = new THREE.DirectionalLight(0xffffff, 1.1);
  kl.position.set(5, 7, 4);
  scene.add(kl);
  const fl = new THREE.DirectionalLight(0x9fb4c9, 0.45);
  fl.position.set(-6, 2, -3);
  scene.add(fl);
  const rl = new THREE.DirectionalLight(0xe8a33d, 0.7);
  rl.position.set(-3, -1, -5);
  scene.add(rl);

  /* ─── materials ─── */
  const E = { envMap: env };
  const mZ = new THREE.MeshStandardMaterial({ color: 0xcfd6db, metalness: 0.92, roughness: 0.3, envMapIntensity: 1.15, ...E });
  const mR = new THREE.MeshStandardMaterial({ color: 0xb4bcc2, metalness: 0.85, roughness: 0.38, envMapIntensity: 1, ...E });
  const mD = new THREE.MeshStandardMaterial({ color: 0x3a424a, metalness: 0.7, roughness: 0.45, envMapIntensity: 0.6, ...E });
  const mB = new THREE.MeshStandardMaterial({ color: 0x8e979e, metalness: 0.95, roughness: 0.25, envMapIntensity: 1.2, ...E });
  const mN = new THREE.MeshStandardMaterial({
    color: 0x5a636b, metalness: 0.8, roughness: 0.35, envMapIntensity: 0.9, ...E,
    emissive: 0xe8a33d, emissiveIntensity: 0
  });

  /* ─── corrugate helper ─── */
  function corr(geo, n, d) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const w = Math.sin(a * n) * d;
      pos.setX(i, x + Math.cos(a) * w);
      pos.setZ(i, z + Math.sin(a) * w);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /* ─── tank geometry ─── */
  const tank = new THREE.Group();
  scene.add(tank);

  const R = 1.15;
  const WH = 2.4;
  const RH = 0.55;
  const tiers = 3;
  const ppt = 8;
  const tH = WH / tiers;
  const gT = 0.035;
  const gY = 0.03;

  const bG = new THREE.SphereGeometry(0.022, 8, 8);
  const panels = [];

  for (let t = 0; t < tiers; t++) {
    for (let s = 0; s < ppt; s++) {
      const tL = (Math.PI * 2) / ppt;
      const tS = s * tL;

      const geo = corr(
        new THREE.CylinderGeometry(R, R, tH - gY, 28, 1, true, tS + gT / 2, tL - gT),
        42,
        0.045
      );

      const mesh = new THREE.Mesh(geo, mZ);
      const g = new THREE.Group();
      g.add(mesh);

      /* bolts */
      const sT = tS + gT / 2 + 0.04;
      for (let k = 0; k < 4; k++) {
        const b = new THREE.Mesh(bG, mB);
        const y = -tH / 2 + 0.12 + k * ((tH - 0.24) / 3);
        b.position.set(Math.sin(sT) * (R + 0.03), y, Math.cos(sT) * (R + 0.03));
        g.add(b);
      }

      for (let k = 0; k < 3; k++) {
        const th = tS + gT / 2 + 0.12 + k * ((tL - gT - 0.24) / 2);
        const b = new THREE.Mesh(bG, mB);
        b.position.set(Math.sin(th) * (R + 0.03), -tH / 2 + 0.06, Math.cos(th) * (R + 0.03));
        g.add(b);
      }

      const bY = -WH / 2 + tH * (t + 0.5);
      g.position.y = bY;

      const mid = tS + tL / 2;
      g.userData = {
        bY,
        dir: new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid)),
        tier: t
      };

      tank.add(g);
      panels.push(g);
    }
  }

  /* ─── roof ─── */
  const roof = new THREE.Group();
  roof.add(new THREE.Mesh(new THREE.ConeGeometry(R * 1.06, RH, 64), mR));

  const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.13, 24), mD);
  mh.position.set(0.32, 0.2, 0.1);
  roof.add(mh);

  const rBY = WH / 2 + RH / 2 - 0.02;
  roof.position.y = rBY;
  tank.add(roof);

  /* ─── base band ─── */
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.12, 64), mD);
  const bBY = -WH / 2 + 0.06;
  band.position.y = bBY;
  tank.add(band);

  /* ─── nozzle ─── */
  const nzG = new THREE.Group();
  const nz = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 20), mN);
  nz.rotation.z = Math.PI / 2;
  nz.position.x = 0.18;
  nzG.add(nz);

  const fg = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.024, 12, 24), mN);
  fg.rotation.y = Math.PI / 2;
  fg.position.x = 0.36;
  nzG.add(fg);

  for (let k = 0; k < 6; k++) {
    const b = new THREE.Mesh(bG, mB);
    const a = (k / 6) * Math.PI * 2;
    b.position.set(0.37, Math.cos(a) * 0.11, Math.sin(a) * 0.11);
    nzG.add(b);
  }

  const nzB = new THREE.Vector3(R * 1.02, -WH / 2 + 0.34, 0.3);
  nzG.position.copy(nzB);
  tank.add(nzG);

  /* ─── ladder ─── */
  const ldr = new THREE.Group();
  const lG = new THREE.BoxGeometry(0.03, WH * 0.88, 0.03);
  const lL = new THREE.Mesh(lG, mD);
  lL.position.set(-0.14, 0, R * 1.03);
  const lR = lL.clone();
  lR.position.x = 0.14;
  ldr.add(lL, lR);

  for (let i = 0; i < 8; i++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.03), mD);
    rung.position.set(0, -WH * 0.38 + i * ((WH * 0.78) / 7), R * 1.03);
    ldr.add(rung);
  }
  tank.add(ldr);

  /* ─── shadow ─── */
  const shC = document.createElement("canvas");
  shC.width = shC.height = 256;
  const shG = shC.getContext("2d");
  const shGr = shG.createRadialGradient(128, 128, 10, 128, 128, 128);
  shGr.addColorStop(0, "rgba(0,0,0,.75)");
  shGr.addColorStop(0.55, "rgba(0,0,0,.25)");
  shGr.addColorStop(1, "rgba(0,0,0,0)");
  shG.fillStyle = shGr;
  shG.fillRect(0, 0, 256, 256);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shC), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -WH / 2 - 0.12;
  scene.add(shadow);

  tank.position.y = -0.1;

  /* ─── camera keyframes ─── */
  const KF = [
    { p: 0, pos: [0, 1.1, 8.6], lk: [0, 0.1, 0] },
    { p: 0.14, pos: [0, 1, 7.8], lk: [0, 0.1, 0] },
    { p: 0.28, pos: [2.9, 0.5, 4], lk: [0.7, 0.1, 0] },
    { p: 0.46, pos: [0, 2, 9.6], lk: [0, 0.3, 0] },
    { p: 0.62, pos: [-1.6, 1.4, 8.4], lk: [0, 0.3, 0] },
    { p: 0.74, pos: [3.2, -0.5, 3.4], lk: [1.1, -1.05, 0.3] },
    { p: 0.9, pos: [0, 1, 7.6], lk: [0, 0.1, 0] },
    { p: 1, pos: [0, 0.9, 7.2], lk: [0, 0.1, 0] }
  ];

  const tP = new THREE.Vector3();
  const tLk = new THREE.Vector3();
  const a3 = new THREE.Vector3();
  const b3 = new THREE.Vector3();

  function sCam(p) {
    let i = 0;
    while (i < KF.length - 2 && p > KF[i + 1].p) i++;
    const A = KF[i];
    const B = KF[i + 1];
    const t = sm(cl((p - A.p) / (B.p - A.p)));

    tP.copy(a3.fromArray(A.pos)).lerp(b3.fromArray(B.pos), t);
    tLk.copy(a3.fromArray(A.lk)).lerp(b3.fromArray(B.lk), t);

    const asp = W / H;
    const sc = asp < 0.8 ? 1.45 : asp < 1.1 ? 1.2 : 1;
    tP.sub(tLk).multiplyScalar(sc).add(tLk);
  }

  /* ─── pose ─── */
  const expl = (p) => rp(p, 0.34, 0.5) * (1 - rp(p, 0.64, 0.82));
  const glow = (p) => rp(p, 0.66, 0.74) * (1 - rp(p, 0.8, 0.88));

  function pose(p, idle) {
    const e = expl(p);

    tank.rotation.y = 0.55 + p * Math.PI * 2.15 + idle;

    panels.forEach((g) => {
      const { bY, dir, tier } = g.userData;
      g.position.x = dir.x * 0.62 * e;
      g.position.z = dir.z * 0.62 * e;
      g.position.y = bY + (tier - 1) * 0.42 * e;
    });

    roof.position.y = rBY + 1.35 * e;
    band.position.y = bBY - 0.38 * e;
    nzG.position.x = nzB.x + 0.62 * e;
    ldr.position.z = 0.62 * e;
    mN.emissiveIntensity = 0.65 * glow(p);

    sCam(p);
    cam.position.copy(tP);
    cam.lookAt(tLk);
  }

  /* ─── captions ─── */
  const caps = Array.from(stage.querySelectorAll(".cap")).map((el) => ({
    el,
    inner: el.querySelector(".cap-in") || el,
    s: +el.dataset.s,
    e: +el.dataset.e
  }));

  const dots = Array.from(stage.querySelectorAll(".dot-nav i"));

  function capO(p, s, e) {
    const f = 0.045;
    if (p < s || p > e) return 0;
    if (p < s + f) return sm((p - s) / f);
    if (p > e - f) return sm((e - p) / f);
    return 1;
  }

  function applyCaps(p) {
    caps.forEach((c) => {
      const o = capO(p, c.s, c.e);
      c.el.style.opacity = o.toFixed(3);
      c.el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      c.inner.style.transform = "translateY(" + ((1 - o) * 18).toFixed(1) + "px)";
    });

    dots.forEach((d, i) => {
      const c = caps[i];
      d.classList.toggle("on", c ? p >= c.s - 0.01 : false);
    });
  }

  /* ─── scroll loop ─── */
  let target = 0;
  let current = 0;
  let idle = 0;

  function readS() {
    const r = stage.getBoundingClientRect();
    const t = stage.offsetHeight - window.innerHeight;
    target = t > 0 ? cl(-r.top / t) : 0;
  }

  window.addEventListener("scroll", readS, { passive: true });
  readS();

  function vis() {
    if (stage.offsetParent === null) return false;
    const r = stage.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!vis()) return;

    readS();
    current += (target - current) * 0.085;
    idle += 0.0016 * (1 - rp(current, 0, 0.08));

    pose(current, idle);
    applyCaps(current);
    ren.render(scene, cam);
  }

  pose(0, 0);
  applyCaps(0);
  ren.render(scene, cam);
  frame();

  new ResizeObserver(() => {
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    if (!W || !H) return;
    ren.setSize(W, H);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
  }).observe(wrap);
})();
