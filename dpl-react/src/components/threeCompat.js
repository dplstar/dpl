import * as THREE from 'three'

/*
 * The Fusion Bond Epoxy and Glass Fused Steel tank models were written for
 * three.js r155+ (automatic sRGB colour management and physical light units).
 * This site runs three r128, so these helpers give the models the same look on
 * r128 and do nothing on newer versions.
 */

export const LEGACY = typeof THREE.SRGBColorSpace === 'undefined'

export function setupRenderer(renderer) {
  if (LEGACY) {
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.physicallyCorrectLights = true
  } else {
    renderer.outputColorSpace = THREE.SRGBColorSpace
  }
}

// mark a colour texture (canvas painting) as sRGB
export function srgbTexture(texture) {
  if (LEGACY) texture.encoding = THREE.sRGBEncoding
  else texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// a colour written as sRGB hex, converted to the linear working space (r152+ does this itself)
export function lin(color) {
  if (LEGACY) color.convertSRGBToLinear()
  return color
}

const converted = new WeakSet()

// convert every material and light colour under `root` once
export function linearize(root) {
  if (!LEGACY) return
  const visit = (o) => {
    if (o.isLight && !converted.has(o)) {
      converted.add(o)
      o.color.convertSRGBToLinear()
      if (o.groundColor) o.groundColor.convertSRGBToLinear()
    }
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    for (const m of mats) {
      if (converted.has(m)) continue
      converted.add(m)
      if (m.color) m.color.convertSRGBToLinear()
      if (m.emissive) m.emissive.convertSRGBToLinear()
    }
  }
  if (root.traverse) root.traverse(visit)
  else visit(root)
}

// pause rendering while the canvas is off screen or on a hidden page
export function watchVisibility(element) {
  const state = { visible: true }
  if (typeof IntersectionObserver === 'undefined') return { state, disconnect() {} }
  const io = new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting })
  io.observe(element)
  return { state, disconnect: () => io.disconnect() }
}
