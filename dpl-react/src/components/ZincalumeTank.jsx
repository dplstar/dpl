import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const RING_HEIGHT = 1.15
const CORRUGATIONS = 15
const PLINTH_HEIGHT = 0.45
const UP = new THREE.Vector3(0, 1, 0)
const vector = (x, y, z) => new THREE.Vector3(x, y, z)

function createMetalTexture(renderer) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')
  context.fillStyle = '#c3c8cd'
  context.fillRect(0, 0, 256, 256)
  for (let index = 0; index < 420; index += 1) {
    context.fillStyle = 'rgba(250,250,250,0.2)'
    context.beginPath()
    context.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 8, 0, Math.PI * 2)
    context.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.encoding = THREE.sRGBEncoding
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

function surface(radius, bottom, top, segments) {
  const positions = []
  const uvs = []
  const indices = []
  const rows = CORRUGATIONS * 5
  const wallRadius = (y) => radius + 0.0085 * Math.sin((((y % RING_HEIGHT) + RING_HEIGHT) / RING_HEIGHT) * CORRUGATIONS * Math.PI * 2)
  for (let row = 0; row <= rows; row += 1) {
    const y = bottom + ((top - bottom) * row) / rows
    const rowRadius = wallRadius(y)
    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2
      positions.push(Math.sin(angle) * rowRadius, y, Math.cos(angle) * rowRadius)
      uvs.push(segment / segments, row / rows)
    }
  }
  const width = segments + 1
  for (let row = 0; row < rows; row += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const point = row * width + segment
      const nextRow = point + width
      indices.push(point, point + 1, nextRow, point + 1, nextRow + 1, nextRow)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function addMesh(geometry, material, parent, castShadow = true) {
  const object = new THREE.Mesh(geometry, material)
  object.castShadow = castShadow
  object.receiveShadow = true
  parent.add(object)
  return object
}

function addCylinder(start, end, radius, material, parent, segments = 12) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const object = addMesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material, parent)
  object.position.copy(start).addScaledVector(direction, 0.5)
  object.quaternion.setFromUnitVectors(UP, direction.normalize())
  return object
}

function addPipe(points, radius, material, parent) {
  for (let index = 0; index < points.length - 1; index += 1) {
    addCylinder(points[index], points[index + 1], radius, material, parent)
  }
}

function addBox(width, height, depth, material, parent, x, y, z) {
  const object = addMesh(new THREE.BoxGeometry(width, height, depth), material, parent)
  object.position.set(x, y, z)
  return object
}

function buildTank(materials, diameter, rings) {
  const tank = new THREE.Group()
  const radius = diameter / 2
  const height = rings * RING_HEIGHT
  const segments = Math.max(64, Math.round((Math.PI * diameter) / 0.12))
  const boltMatrices = []
  const helper = new THREE.Object3D()
  const radiusAt = (y) => radius + 0.0085 * Math.sin((((y % RING_HEIGHT) + RING_HEIGHT) / RING_HEIGHT) * CORRUGATIONS * Math.PI * 2)

  for (let ring = 0; ring < rings; ring += 1) {
    const bottom = ring * RING_HEIGHT
    const top = bottom + RING_HEIGHT
    addMesh(surface(radius, bottom, top, segments), materials.zinc, tank)
    const panels = Math.max(8, Math.round((Math.PI * diameter) / 2.5))
    for (let panel = 0; panel < panels; panel += 1) {
      const angle = (panel * Math.PI * 2) / panels + (ring % 2 ? Math.PI / panels : 0)
      for (let wave = 0; wave < CORRUGATIONS; wave += 1) {
        const y = bottom + ((wave + 0.4) / CORRUGATIONS) * RING_HEIGHT
        helper.position.set(Math.sin(angle) * (radiusAt(y) + 0.014), y, Math.cos(angle) * (radiusAt(y) + 0.014))
        helper.rotation.y = angle
        helper.updateMatrix()
        boltMatrices.push(helper.matrix.clone())
      }
    }
  }

  const trimRadius = radius + 0.013
  const topTrim = addMesh(new THREE.CylinderGeometry(trimRadius, trimRadius, 0.08, segments, 1, true), materials.trim, tank)
  topTrim.position.y = height - 0.04
  const bottomTrim = addMesh(new THREE.CylinderGeometry(trimRadius, trimRadius, 0.08, segments, 1, true), materials.trim, tank)
  bottomTrim.position.y = 0.04
  const plinth = addMesh(new THREE.CylinderGeometry(radius + 0.62, radius + 0.66, PLINTH_HEIGHT, 96), materials.concrete, tank)
  plinth.position.y = -PLINTH_HEIGHT / 2

  const roofHeight = Math.max(0.8, radius * 0.25)
  const roof = addMesh(new THREE.ConeGeometry(radius + 0.18, roofHeight, segments), materials.roof, tank)
  roof.position.y = height + roofHeight / 2
  const vent = addMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 24), materials.dark, tank)
  vent.position.y = height + roofHeight + 0.14
  const cap = addMesh(new THREE.SphereGeometry(0.32, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), materials.trim, tank)
  cap.scale.y = 0.42
  cap.position.y = height + roofHeight + 0.32

  const ladder = new THREE.Group()
  ladder.rotation.y = Math.PI / 7.5
  tank.add(ladder)
  const ladderZ = radius + 0.28
  for (const side of [-1, 1]) addBox(0.018, height + 0.8, 0.07, materials.galv, ladder, side * 0.23, (height + 0.8) / 2, ladderZ)
  for (let y = 0.3; y < height + 0.75; y += 0.3) addCylinder(vector(-0.23, y, ladderZ), vector(0.23, y, ladderZ), 0.014, materials.galv, ladder, 8)

  const outlet = new THREE.Group()
  outlet.rotation.y = Math.PI * 0.4
  tank.add(outlet)
  addPipe([vector(0, 0.35, radius), vector(0, 0.35, radius + 0.78), vector(0, -0.04, radius + 0.78)], 0.07, materials.galv, outlet)
  addCylinder(vector(0, 0.35, radius + 0.5), vector(0, 0.35, radius + 0.72), 0.11, materials.dark, outlet, 20)
  const wheel = addMesh(new THREE.TorusGeometry(0.13, 0.014, 8, 24), materials.red, outlet)
  wheel.rotation.x = Math.PI / 2
  wheel.position.set(0, 0.67, radius + 0.6)

  const boltGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 6)
  boltGeometry.rotateX(Math.PI / 2)
  const bolts = new THREE.InstancedMesh(boltGeometry, materials.bolt, boltMatrices.length)
  boltMatrices.forEach((matrix, index) => bolts.setMatrixAt(index, matrix))
  tank.add(bolts)
  return { tank, height }
}

function disposeGroup(group) {
  group.traverse((object) => object.geometry?.dispose())
}

export default function ZincalumeTank({ diameter = 9, rings = 4, autoRotate = true, interactive = true, className, style }) {
  const hostRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI * 0.495
    controls.minPolarAngle = Math.PI * 0.05
    scene.add(new THREE.HemisphereLight(0xeef3f8, 0x575148, 1.25))
    const sun = new THREE.DirectionalLight(0xfff3e2, 7.2)
    sun.position.set(18, 28, 14)
    sun.castShadow = true
    scene.add(sun)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.ShadowMaterial({ opacity: 0.2 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -PLINTH_HEIGHT
    ground.receiveShadow = true
    scene.add(ground)

    const texture = createMetalTexture(renderer)
    const materials = {
      zinc: new THREE.MeshStandardMaterial({ color: 0xffffff, map: texture, metalness: 0.88, roughness: 0.36 }),
      roof: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, map: texture, metalness: 0.85, roughness: 0.42 }),
      trim: new THREE.MeshStandardMaterial({ color: 0xb4bac0, metalness: 0.85, roughness: 0.3 }),
      bolt: new THREE.MeshStandardMaterial({ color: 0x7f868d, metalness: 0.9, roughness: 0.45 }),
      galv: new THREE.MeshStandardMaterial({ color: 0x9ba2a9, metalness: 0.75, roughness: 0.48 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.5, roughness: 0.55 }),
      red: new THREE.MeshStandardMaterial({ color: 0xb8322a, metalness: 0.2, roughness: 0.5 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0xb7b1a7, roughness: 0.95 }),
    }

    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()
    stateRef.current = { renderer, scene, camera, controls, materials, texture, ground, sun, tank: null }
    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      controls.dispose()
      if (stateRef.current?.tank) disposeGroup(stateRef.current.tank)
      Object.values(materials).forEach((material) => material.dispose())
      texture.dispose()
      ground.geometry.dispose()
      ground.material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    if (state.tank) {
      state.scene.remove(state.tank)
      disposeGroup(state.tank)
    }
    const built = buildTank(state.materials, diameter, rings)
    state.scene.add(built.tank)
    state.tank = built.tank
    const target = vector(0, built.height * 0.48, 0)
    const distance = Math.max(diameter, built.height * 1.7) * 1.95 + 4
    state.controls.target.copy(target)
    state.camera.position.copy(target).add(vector(0.66, 0.34, 0.67).normalize().multiplyScalar(distance))
    state.controls.minDistance = distance * 0.35
    state.controls.maxDistance = distance * 2.2
    state.controls.update()
  }, [diameter, rings])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    state.controls.autoRotate = autoRotate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    state.controls.autoRotateSpeed = 0.55
    state.controls.enabled = interactive
    state.renderer.domElement.style.cursor = interactive ? 'grab' : 'default'
    state.renderer.domElement.style.touchAction = interactive ? 'none' : 'auto'
  }, [autoRotate, interactive])

  return <div ref={hostRef} className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }} />
}
