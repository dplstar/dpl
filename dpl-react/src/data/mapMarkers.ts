// lat/lng -> SVG coordinates in the INDIA_VIEWBOX (1000 x 1133.3) space.
// Mercator, fitted by least squares to the real lat/lng extents of the state
// shapes in indiaStates.ts (Gujarat to Arunachal, J&K to Kerala); every
// checked edge lands within ~2 units. If pins look off, refit these four.
const SX = 34.15, BX = -2325.4     // x = SX * lng + BX
const SY = 1956.12, BY = 1364.43   // y = BY - SY * mercator(lat)

export function project(lat: number, lng: number): [number, number] {
  const m = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
  return [SX * lng + BX, BY - SY * m]
}

export interface MapMarker {
  name: string
  lat: number
  lng: number
  outside?: boolean
}