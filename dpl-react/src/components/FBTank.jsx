import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const UP = new THREE.Vector3(0, 1, 0)

function cylinderBetween(start, end, radius, material, parent, segments = 12) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const object = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material)
  object.position.copy(start).addScaledVector(direction, 0.5)
  object.quaternion.setFromUnitVectors(UP, direction.normalize())
  parent.add(object)
  return object
}

function addDome(parent, radius, baseY, material, frameMaterial) {
  const dome = new THREE.Group()
  const height = radius * 0.34
  dome.position.y = baseY
  parent.add(dome)

  const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), material)
  domeMesh.scale.y = height / radius
  domeMesh.position.y = 0
  dome.add(domeMesh)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 64), frameMaterial)
  ring.rotation.x = Math.PI / 2
  dome.add(ring)

  const apex = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.28, 20), frameMaterial)
  apex.position.y = height + 0.12
  dome.add(apex)

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2
    cylinderBetween(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.sin(angle) * radius, height * 0.92, Math.cos(angle) * radius),
      0.018,
      frameMaterial,
      dome,
      6
    )
  }
  return height
}

function addLadder(parent, radius, height, material) {
  const ladder = new THREE.Group()
  ladder.rotation.y = Math.PI / 7
  parent.add(ladder)
  const z = radius + 0.24
  for (const x of [-0.2, 0.2]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.025, height + 0.7, 0.04), material)
    rail.position.set(x, (height + 0.7) / 2, z)
    ladder.add(rail)
  }
  for (let y = 0.25; y < height + 0.55; y += 0.3) {
    cylinderBetween(new THREE.Vector3(-0.2, y, z), new THREE.Vector3(0.2, y, z), 0.014, material, ladder, 8)
  }
}

export default function FBTank({ diameter = 12, courses = 5, color = '#23457a', autoRotate = true, interactive = true, className, style }) {
  const hostRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' })
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 300)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI * 0.495
    controls.minPolarAngle = Math.PI * 0.08

    scene.add(new THREE.HemisphereLight(0xeef3f8, 0x3d4148, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 3.5)
    sun.position.set(18, 30, 14)
    sun.castShadow = true
    scene.add(sun)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.ShadowMaterial({ opacity: 0.2 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.45
    ground.receiveShadow = true
    scene.add(ground)

    const shellMaterial = new THREE.MeshPhysicalMaterial({ color, roughness: 0.78, metalness: 0.05, clearcoat: 0.35, side: THREE.DoubleSide })
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xb9bec2, metalness: 0.85, roughness: 0.35 })
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x30363d, metalness: 0.5, roughness: 0.55 })
    const redMaterial = new THREE.MeshStandardMaterial({ color: 0xb8322a, metalness: 0.2, roughness: 0.5 })
    const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0xb7b1a7, roughness: 0.95 })

    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const build = () => {
      const tank = new THREE.Group()
      const radius = diameter / 2
      const height = Math.max(1, Math.min(8, Math.round(courses))) * 1.22
      const segments = Math.max(48, Math.round(Math.PI * diameter / 0.12))
      const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments, 1, true), shellMaterial)
      body.position.y = height / 2
      body.castShadow = true
      tank.add(body)

      for (let index = 1; index < Math.round(courses); index += 1) {
        const seam = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.012, 0.012, 6, segments), frameMaterial)
        seam.rotation.x = Math.PI / 2
        seam.position.y = index * 1.22
        tank.add(seam)
      }

      const base = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.6, radius + 0.65, 0.45, 96), concreteMaterial)
      base.position.y = -0.225
      base.receiveShadow = true
      tank.add(base)
      const domeHeight = addDome(tank, radius + 0.04, height, frameMaterial, frameMaterial)
      addLadder(tank, radius, height, frameMaterial)

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16), darkMaterial)
      nozzle.rotation.x = Math.PI / 2
      nozzle.position.set(radius + 0.2, 0.45, 0)
      tank.add(nozzle)
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.014, 8, 24), redMaterial)
      wheel.position.set(radius + 0.43, 0.45, 0)
      wheel.rotation.y = Math.PI / 2
      tank.add(wheel)
      return { tank, top: height + domeHeight }
    }

    const resizeAndFrame = () => {
      const built = build()
      scene.add(built.tank)
      const target = new THREE.Vector3(0, built.top * 0.45, 0)
      const distance = Math.max(diameter, built.top * 1.6) * 1.9 + 4
      controls.target.copy(target)
      camera.position.copy(target).add(new THREE.Vector3(0.66, 0.3, 0.69).normalize().multiplyScalar(distance))
      controls.minDistance = distance * 0.3
      controls.maxDistance = distance * 2.2
      controls.update()
      return built.tank
    }
    const tank = resizeAndFrame()
    stateRef.current = { renderer, controls, tank, materials: [shellMaterial, frameMaterial, darkMaterial, redMaterial, concreteMaterial], ground, observer }
    renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera) })

    return () => {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      controls.dispose()
      tank.traverse((object) => object.geometry?.dispose())
      stateRef.current.materials.forEach((material) => material.dispose())
      ground.geometry.dispose()
      ground.material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      stateRef.current = null
    }
  }, [color, courses, diameter])

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