import { useEffect } from 'react'
import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Builds and animates the exploded-view Zincalume tank tied to scroll position
// inside `stageRef`, rendering into `wrapRef`.
//
// The model follows how DPL Star Zincalume tanks are actually built:
// horizontally corrugated AZ150 panels with real sheet thickness, staggered
// course to course like brickwork, bolted along every vertical and horizontal
// seam; a ribbed conical roof with vent and access hatch; curb angles top and
// bottom; a caged access ladder; a flanged outlet with a gate valve; all on a
// concrete plinth. Scroll pulls it apart into those parts.
//
// Scale: 1 unit ≈ 1.45 m, so a course (0.8 units) is one 1.15 m panel high.

/* ─── shape constants ─── */
const R = 1.15          // shell radius
const WH = 2.4          // wall height
const RH = 0.5          // roof rise
const TIERS = 3         // panel courses
const PPT = 5           // panels per course: each sheet ~1.8x wider than tall, laid landscape like the real 2.5 m x 1.15 m sheets
const TH = WH / TIERS   // course height
const WAVES = 15        // corrugations per course
const AMP = 0.0055      // corrugation half-depth
const SHEET = 0.012     // sheet thickness (exaggerated a little so it reads when exploded)
const GAP_A = 0.0016    // angular seam gap (rad) — a hairline, never a see-through slot
const GAP_Y = 0.0025    // gap between courses

const shellR = (y) => R + AMP * Math.sin(((y + TH / 2) / TH) * WAVES * Math.PI * 2)

// Indexed grid surface: p(u, v) with u, v in [0, 1]. `flip` reverses winding.
function grid(p, nu, nv, flip = false) {
  const pos = []
  const uv = []
  const idx = []
  const v3 = new THREE.Vector3()
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      p(i / nu, j / nv, v3)
      pos.push(v3.x, v3.y, v3.z)
      uv.push(i / nu, j / nv)
    }
  }
  const w = nu + 1
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = j * w + i, b = a + 1, c = a + w, d = c + 1
      if (flip) idx.push(a, c, b, b, c, d)
      else idx.push(a, b, c, b, d, c)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// One curved, corrugated panel with real thickness, centred on y = 0.
function panelGeometry(a0, a1) {
  const nu = Math.max(16, Math.round(((a1 - a0) * R) / 0.035))
  const nv = WAVES * 6
  const h = TH - GAP_Y
  const at = (a, y, r, v) => v.set(Math.sin(a) * r, y, Math.cos(a) * r)
  const Y = (v) => -h / 2 + v * h
  const A = (u) => a0 + (a1 - a0) * u

  const outer = grid((u, v, o) => at(A(u), Y(v), shellR(Y(v)), o), nu, nv)
  const inner = grid((u, v, o) => at(A(u), Y(v), shellR(Y(v)) - SHEET, o), nu, nv, true)
  // the four cut edges
  const e1 = grid((u, v, o) => at(a0, Y(v), shellR(Y(v)) - SHEET * u, o), 1, nv)
  const e2 = grid((u, v, o) => at(a1, Y(v), shellR(Y(v)) - SHEET * u, o), 1, nv, true)
  const e3 = grid((u, v, o) => at(A(u), -h / 2, shellR(-h / 2) - SHEET * v, o), nu, 1)
  const e4 = grid((u, v, o) => at(A(u), h / 2, shellR(h / 2) - SHEET * v, o), nu, 1, true)
  return { face: outer, back: inner, edges: BufferGeometryUtils.mergeBufferGeometries([e1, e2, e3, e4]) }
}

// Fine Zincalume spangle: small, low-contrast crystals on a satin base.
function spangleTexture(renderer) {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')
  x.fillStyle = '#c9cfd4'
  x.fillRect(0, 0, s, s)
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 1400; i++) {
    const cx = rnd() * s, cy = rnd() * s, r = 3 + rnd() * 9
    const n = 5 + ((rnd() * 4) | 0)
    const l = (rnd() - 0.5) * 34
    const v = l > 0 ? 255 : 0
    x.fillStyle = `rgba(${v},${v},${v},${Math.abs(l) / 255})`
    for (const dx of [-s, 0, s]) for (const dy of [-s, 0, s]) {
      if (cx + dx < -20 || cx + dx > s + 20 || cy + dy < -20 || cy + dy > s + 20) continue
      x.beginPath()
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rnd() * 0.6, rr = r * (0.6 + rnd() * 0.4)
        const px = cx + dx + Math.cos(a) * rr, py = cy + dy + Math.sin(a) * rr
        k ? x.lineTo(px, py) : x.moveTo(px, py)
      }
      x.closePath()
      x.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1.4, 1.4)
  t.encoding = THREE.sRGBEncoding
  t.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return t
}

function concreteTexture() {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')
  x.fillStyle = '#b9b3a8'
  x.fillRect(0, 0, s, s)
  const d = x.getImageData(0, 0, s, s)
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n
  }
  x.putImageData(d, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 1)
  t.encoding = THREE.sRGBEncoding
  return t
}

const UP = new THREE.Vector3(0, 1, 0)
function rod(a, b, r, mat, parent, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a)
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat)
  m.position.copy(a).addScaledVector(d, 0.5)
  m.quaternion.setFromUnitVectors(UP, d.normalize())
  parent.add(m)
  return m
}
const V = (x, y, z) => new THREE.Vector3(x, y, z)

export function useTankScene(stageRef, wrapRef) {
  useEffect(() => {
    const stage = stageRef.current
    const wrap = wrapRef.current
    if (!stage || !wrap) return

    let disposed = false

    /* ─── helpers ─── */
    const cl = (v) => Math.max(0, Math.min(1, v))
    const sm = (t) => t * t * (3 - 2 * t)
    const rp = (p, a, b) => sm(cl((p - a) / (b - a)))

    /* ─── env map ─── */
    const faces = []
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')
      if (i === 2) {
        g.fillStyle = '#f2f4f6'
        g.fillRect(0, 0, 128, 128)
      } else if (i === 3) {
        g.fillStyle = '#0b0e11'
        g.fillRect(0, 0, 128, 128)
      } else {
        const gr = g.createLinearGradient(0, 0, 0, 128)
        gr.addColorStop(0, '#e6eaed')
        gr.addColorStop(0.42, '#5d666e')
        gr.addColorStop(0.5, '#d7dde2')
        gr.addColorStop(0.58, '#2e363e')
        gr.addColorStop(1, '#0b0e11')
        g.fillStyle = gr
        g.fillRect(0, 0, 128, 128)
        if (i === 0) {
          g.fillStyle = 'rgba(232,163,61,0.55)'
          g.fillRect(0, 60, 128, 6)
        }
      }
      faces.push(c)
    }

    const env = new THREE.CubeTexture(faces)
    env.encoding = THREE.sRGBEncoding
    env.needsUpdate = true

    /* ─── renderer ─── */
    let W = wrap.clientWidth || window.innerWidth
    let H = wrap.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100)
    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    ren.setSize(W, H)
    ren.outputEncoding = THREE.sRGBEncoding
    ren.toneMapping = THREE.ACESFilmicToneMapping
    ren.toneMappingExposure = 1.05
    ren.shadowMap.enabled = true
    ren.shadowMap.type = THREE.PCFSoftShadowMap
    wrap.appendChild(ren.domElement)

    /* ─── lights ─── */
    scene.add(new THREE.HemisphereLight(0xe9eef2, 0x12161b, 0.5))
    const kl = new THREE.DirectionalLight(0xfff6ea, 1.25)
    kl.position.set(5, 8, 4)
    kl.castShadow = true
    kl.shadow.mapSize.set(2048, 2048)
    Object.assign(kl.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 25 })
    kl.shadow.bias = -0.0005
    kl.shadow.normalBias = 0.02
    scene.add(kl)
    const fl = new THREE.DirectionalLight(0x9fb4c9, 0.45)
    fl.position.set(-6, 2, -3)
    scene.add(fl)
    const rl = new THREE.DirectionalLight(0xe8a33d, 0.7)
    rl.position.set(-3, -1, -5)
    scene.add(rl)

    /* ─── materials ─── */
    const E = { envMap: env }
    const spangle = spangleTexture(ren)
    const concrete = concreteTexture()
    const mZ = new THREE.MeshStandardMaterial({ color: 0xffffff, map: spangle, metalness: 0.9, roughness: 0.32, envMapIntensity: 1.1, ...E })
    const mZEdge = new THREE.MeshStandardMaterial({ color: 0xd9dee2, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.1, side: THREE.DoubleSide, ...E })
    const mIn = new THREE.MeshStandardMaterial({ color: 0x7c858c, map: spangle, metalness: 0.75, roughness: 0.5, envMapIntensity: 0.5, ...E })
    const mR = new THREE.MeshStandardMaterial({ color: 0xeef1f3, map: spangle, metalness: 0.88, roughness: 0.38, envMapIntensity: 1, ...E })
    const mTrim = new THREE.MeshStandardMaterial({ color: 0xb6bec4, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.1, ...E })
    const mG = new THREE.MeshStandardMaterial({ color: 0x9aa2a9, metalness: 0.8, roughness: 0.45, envMapIntensity: 0.9, ...E })
    const mD = new THREE.MeshStandardMaterial({ color: 0x3a424a, metalness: 0.6, roughness: 0.5, envMapIntensity: 0.6, ...E })
    const mB = new THREE.MeshStandardMaterial({ color: 0x8e979e, metalness: 0.95, roughness: 0.3, envMapIntensity: 1.2, ...E })
    const mC = new THREE.MeshStandardMaterial({ color: 0xffffff, map: concrete, metalness: 0, roughness: 0.95 })
    const mRed = new THREE.MeshStandardMaterial({ color: 0xb8322a, metalness: 0.25, roughness: 0.5, ...E })
    // nozzle parts glow amber when the caption about the outlet is on screen
    const mN = new THREE.MeshStandardMaterial({
      color: 0x8e979e, metalness: 0.85, roughness: 0.32, envMapIntensity: 1, ...E,
      emissive: 0xe8a33d, emissiveIntensity: 0
    })

    const shadowy = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } })

    /* ─── tank ─── */
    const tank = new THREE.Group()
    scene.add(tank)

    // hex bolt head, axis along +z so rotation.y = θ points it outward
    const boltGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.009, 6)
    boltGeo.rotateX(Math.PI / 2)
    const helper = new THREE.Object3D()
    const panels = []
    const tL = (Math.PI * 2) / PPT

    for (let t = 0; t < TIERS; t++) {
      // alternate courses are offset half a panel, like brickwork
      const off = t % 2 ? tL / 2 : 0
      for (let s = 0; s < PPT; s++) {
        const a0 = off + s * tL + GAP_A / 2
        const a1 = off + (s + 1) * tL - GAP_A / 2
        const geo = panelGeometry(a0, a1)
        const g = new THREE.Group()
        const face = new THREE.Mesh(geo.face, mZ)
        const back = new THREE.Mesh(geo.back, mIn)
        const edges = new THREE.Mesh(geo.edges, mZEdge)
        g.add(face, back, edges)

        // bolts: one row up the vertical seam at every corrugation crest,
        // one row along the bottom seam
        const mats = []
        const h = TH - GAP_Y
        const aS = a0 + 0.03 / R
        for (let k = 0; k < WAVES; k++) {
          const y = -h / 2 + ((k + 0.25) / WAVES) * h
          helper.position.set(Math.sin(aS) * (shellR(y) + 0.003), y, Math.cos(aS) * (shellR(y) + 0.003))
          helper.rotation.set(0, aS, 0)
          helper.updateMatrix()
          mats.push(helper.matrix.clone())
        }
        const nH = Math.round(((a1 - a0) * R) / 0.07)
        for (let k = 1; k < nH; k++) {
          const a = a0 + ((a1 - a0) * k) / nH
          const y = -h / 2 + 0.028
          helper.position.set(Math.sin(a) * (shellR(y) + 0.003), y, Math.cos(a) * (shellR(y) + 0.003))
          helper.rotation.set(0, a, 0)
          helper.updateMatrix()
          mats.push(helper.matrix.clone())
        }
        const bolts = new THREE.InstancedMesh(boltGeo, mB, mats.length)
        mats.forEach((m, i) => bolts.setMatrixAt(i, m))
        g.add(bolts)

        const bY = -WH / 2 + TH * (t + 0.5)
        g.position.y = bY
        const mid = (a0 + a1) / 2
        g.userData = { bY, dir: new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid)), tier: t }
        shadowy(g)
        // The inside face sits 12 mm behind the outside face of the same sheet,
        // so it always lies in that sheet's own shadow and the corrugation turns
        // it into dark stripes. Only the outside face takes part in shadowing;
        // the inside is already a darker material, which reads correctly.
        back.castShadow = back.receiveShadow = false
        edges.castShadow = edges.receiveShadow = false
        tank.add(g)
        panels.push(g)
      }
    }

    /* ─── roof: ribbed cone, curb angle, vent and hatch ─── */
    const roof = new THREE.Group()
    const RO = R * 1.06 // overhang
    const cone = new THREE.Mesh(new THREE.ConeGeometry(RO, RH, 96, 1, true), mR)
    roof.add(cone)
    const tilt = Math.atan2(RO, RH)
    // standing seams from just below the vent to the eave, sitting on the cone
    const ribTop = 0.1, ribBot = 1
    const coneAt = (f) => V(0, RH / 2 - RH * f, RO * f)
    const lift = V(0, Math.sin(tilt), Math.cos(tilt)).multiplyScalar(0.006)
    for (let i = 0; i < 24; i++) {
      const piv = new THREE.Group()
      piv.rotation.y = (i / 24) * Math.PI * 2
      const a = coneAt(ribTop).add(lift), b = coneAt(ribBot).add(lift)
      const d = new THREE.Vector3().subVectors(b, a)
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.018, d.length(), 0.012), mTrim)
      rib.position.copy(a).addScaledVector(d, 0.5)
      rib.quaternion.setFromUnitVectors(UP, d.clone().normalize())
      piv.add(rib)
      roof.add(piv)
    }
    // fascia band at the eave
    const fascia = new THREE.Mesh(new THREE.CylinderGeometry(RO + 0.004, RO + 0.004, 0.05, 96, 1, true), mTrim)
    fascia.position.y = -RH / 2 - 0.012
    roof.add(fascia)
    // top curb angle (sits on the top course)
    const curbT = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.016, R + 0.016, 0.045, 96, 1, true), mTrim)
    curbT.position.y = -RH / 2 - 0.03
    roof.add(curbT)
    // vent: neck + mushroom cap
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 24), mG)
    neck.position.y = RH / 2 + 0.03
    roof.add(neck)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), mTrim)
    cap.scale.y = 0.45
    cap.position.y = RH / 2 + 0.09
    roof.add(cap)
    // access hatch on the slope, facing the ladder (+z)
    const hatch = new THREE.Group()
    const hr = RO * 0.62
    hatch.position.set(0, RH / 2 - RH * (hr / RO) + 0.02, hr)
    hatch.rotation.x = tilt - Math.PI / 2
    const hb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.3), mTrim)
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.015, 0.33), mG)
    hl.position.y = 0.027
    hatch.add(hb, hl)
    roof.add(hatch)
    // short guard rail by the hatch
    for (const sx of [-0.2, 0.2]) {
      rod(V(sx, RH / 2 - RH * 0.86, RO * 0.86), V(sx, RH / 2 - RH * 0.86 + 0.32, RO * 0.86), 0.009, mG, roof)
    }
    rod(V(-0.2, RH / 2 - RH * 0.86 + 0.32, RO * 0.86), V(0.2, RH / 2 - RH * 0.86 + 0.32, RO * 0.86), 0.009, mG, roof)

    const rBY = WH / 2 + RH / 2 + 0.035
    roof.position.y = rBY
    shadowy(roof)
    tank.add(roof)

    /* ─── base: concrete plinth, floor sheet, bottom curb angle ─── */
    const band = new THREE.Group()
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.2, R * 1.23, 0.14, 96), mC)
    plinth.position.y = -0.07
    band.add(plinth)
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.005, R - 0.005, 0.01, 96), mIn)
    floor.position.y = 0.005
    band.add(floor)
    const curbB = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.016, R + 0.016, 0.05, 96, 1, true), mTrim)
    curbB.position.y = 0.025
    band.add(curbB)
    const bBY = -WH / 2
    band.position.y = bBY
    shadowy(band)
    // the floor plate is inside the tank: shadows there only show up as
    // stray dark blobs once the shell is pulled apart
    floor.receiveShadow = false
    tank.add(band)

    /* ─── outlet: flanged pipe, gate valve, handwheel ─── */
    const nzG = new THREE.Group()
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 24), mN)
    pipe.rotation.z = Math.PI / 2
    pipe.position.x = 0.18
    nzG.add(pipe)
    const flange = (x, r) => {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.028, 32), mN)
      f.rotation.z = Math.PI / 2
      f.position.x = x
      nzG.add(f)
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), mB)
        b.rotation.z = Math.PI / 2
        b.position.set(x, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78)
        nzG.add(b)
      }
    }
    flange(0.0, 0.1)   // wall pad
    flange(0.2, 0.095)
    flange(0.36, 0.095)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.13), mN)
    body.position.x = 0.28
    nzG.add(body)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), mG)
    stem.position.set(0.28, 0.15, 0)
    nzG.add(stem)
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.011, 8, 28), mRed)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(0.28, 0.23, 0)
    nzG.add(wheel)
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.008, 0.008), mRed)
      sp.rotation.y = (k / 3) * Math.PI
      sp.position.set(0.28, 0.23, 0)
      nzG.add(sp)
    }
    const nzB = new THREE.Vector3(R + 0.006, -WH / 2 + 0.34, 0.3)
    nzG.position.copy(nzB)
    shadowy(nzG)
    // the valve would throw a large shadow across the plinth in the close-up
    nzG.traverse((m) => { m.castShadow = false })
    tank.add(nzG)

    /* ─── caged access ladder on the +z face ─── */
    const ldr = new THREE.Group()
    const LZ = R + 0.11
    const LW = 0.13
    const y0 = -WH / 2 + 0.02
    const y1 = WH / 2 + 0.3
    for (const sx of [-LW, LW]) rod(V(sx, y0, LZ), V(sx, y1, LZ), 0.012, mG, ldr, 8)
    for (let y = y0 + 0.14; y < WH / 2 + 0.05; y += 0.14) rod(V(-LW, y, LZ), V(LW, y, LZ), 0.008, mG, ldr, 6)
    // stand-off brackets to the shell
    for (const y of [-WH / 2 + 0.3, 0, WH / 2 - 0.25]) {
      for (const sx of [-LW, LW]) rod(V(sx, y, R + 0.005), V(sx, y, LZ), 0.007, mG, ldr, 6)
    }
    // safety cage from ~1/3 height up
    const cR = 0.2
    const cZ = LZ + 0.06
    const cy0 = -WH / 2 + WH * 0.36
    for (let y = cy0; y <= y1 + 0.001; y += (y1 - cy0) / 6) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(cR, 0.006, 6, 28, Math.PI * 1.25), mG)
      hoop.rotation.x = Math.PI / 2
      hoop.rotation.z = -Math.PI * 0.125
      hoop.position.set(0, y, cZ)
      ldr.add(hoop)
    }
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI * 0.125 + (k / 4) * Math.PI * 1.25
      const x = Math.cos(a) * cR, z = cZ + Math.sin(a) * cR
      rod(V(x, cy0, z), V(x, y1, z), 0.005, mG, ldr, 5)
    }
    shadowy(ldr)
    tank.add(ldr)

    /* ─── ground shadow (soft contact) + cast shadows ─── */
    const shC = document.createElement('canvas')
    shC.width = shC.height = 256
    const shG = shC.getContext('2d')
    const shGr = shG.createRadialGradient(128, 128, 10, 128, 128, 128)
    shGr.addColorStop(0, 'rgba(0,0,0,.75)')
    shGr.addColorStop(0.55, 'rgba(0,0,0,.25)')
    shGr.addColorStop(1, 'rgba(0,0,0,0)')
    shG.fillStyle = shGr
    shG.fillRect(0, 0, 256, 256)

    const shadowTex = new THREE.CanvasTexture(shC)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 4.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -WH / 2 - 0.16
    scene.add(shadow)

    tank.position.y = -0.1

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
    ]

    const tP = new THREE.Vector3()
    const tLk = new THREE.Vector3()
    const a3 = new THREE.Vector3()
    const b3 = new THREE.Vector3()

    function sCam(p) {
      let i = 0
      while (i < KF.length - 2 && p > KF[i + 1].p) i++
      const A = KF[i]
      const B = KF[i + 1]
      const t = sm(cl((p - A.p) / (B.p - A.p)))

      tP.copy(a3.fromArray(A.pos)).lerp(b3.fromArray(B.pos), t)
      tLk.copy(a3.fromArray(A.lk)).lerp(b3.fromArray(B.lk), t)

      const asp = W / H
      const sc = asp < 0.8 ? 1.45 : asp < 1.1 ? 1.2 : 1
      tP.sub(tLk).multiplyScalar(sc).add(tLk)
    }

    /* ─── pose ─── */
    const expl = (p) => rp(p, 0.34, 0.5) * (1 - rp(p, 0.64, 0.82))
    const glow = (p) => rp(p, 0.66, 0.74) * (1 - rp(p, 0.8, 0.88))

    function pose(p, idle) {
      const e = expl(p)

      tank.rotation.y = 0.55 + p * Math.PI * 2.15 + idle

      panels.forEach((g) => {
        const { bY, dir, tier } = g.userData
        g.position.x = dir.x * 0.62 * e
        g.position.z = dir.z * 0.62 * e
        g.position.y = bY + (tier - 1) * 0.42 * e
      })

      roof.position.y = rBY + 1.35 * e
      band.position.y = bBY - 0.38 * e
      nzG.position.x = nzB.x + 0.62 * e
      ldr.position.z = 0.62 * e
      mN.emissiveIntensity = 0.65 * glow(p)

      sCam(p)
      cam.position.copy(tP)
      cam.lookAt(tLk)
    }

    /* ─── captions ─── */
    const caps = Array.from(stage.querySelectorAll('.cap')).map((el) => ({
      el,
      inner: el.querySelector('.cap-in') || el,
      s: +el.dataset.s,
      e: +el.dataset.e
    }))

    const dots = Array.from(stage.querySelectorAll('.dot-nav i'))

    function capO(p, s, e) {
      const f = 0.045
      if (p < s || p > e) return 0
      if (p < s + f) return sm((p - s) / f)
      if (p > e - f) return sm((e - p) / f)
      return 1
    }

    function applyCaps(p) {
      caps.forEach((c) => {
        const o = capO(p, c.s, c.e)
        c.el.style.opacity = o.toFixed(3)
        c.el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        c.inner.style.transform = 'translateY(' + ((1 - o) * 18).toFixed(1) + 'px)'
      })

      dots.forEach((d, i) => {
        const c = caps[i]
        d.classList.toggle('on', c ? p >= c.s - 0.01 : false)
      })
    }

    /* ─── scroll loop ─── */
    let target = 0
    let current = 0
    let idle = 0
    let rafId = 0

    function readS() {
      const r = stage.getBoundingClientRect()
      const t = stage.offsetHeight - window.innerHeight
      target = t > 0 ? cl(-r.top / t) : 0
    }

    window.addEventListener('scroll', readS, { passive: true })
    readS()

    function vis() {
      if (stage.offsetParent === null) return false
      const r = stage.getBoundingClientRect()
      return r.bottom > 0 && r.top < window.innerHeight
    }

    function frame() {
      rafId = requestAnimationFrame(frame)
      if (disposed || !vis()) return

      readS()
      current += (target - current) * 0.085
      idle += 0.0016 * (1 - rp(current, 0, 0.08))

      pose(current, idle)
      applyCaps(current)
      ren.render(scene, cam)
    }

    pose(0, 0)
    applyCaps(0)
    ren.render(scene, cam)
    frame()

    const resizeObserver = new ResizeObserver(() => {
      W = wrap.clientWidth
      H = wrap.clientHeight
      if (!W || !H) return
      ren.setSize(W, H)
      cam.aspect = W / H
      cam.updateProjectionMatrix()
    })
    resizeObserver.observe(wrap)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', readS)
      resizeObserver.disconnect()
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) [].concat(o.material).forEach((m) => m.dispose())
      })
      ;[mZ, mZEdge, mIn, mR, mTrim, mG, mD, mB, mC, mRed, mN].forEach((m) => m.dispose())
      ;[env, spangle, concrete, shadowTex].forEach((t) => t.dispose())
      ren.dispose()
      if (ren.domElement.parentNode === wrap) wrap.removeChild(ren.domElement)
    }
  }, [stageRef, wrapRef])
}
