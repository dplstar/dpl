// lat/lng -> SVG coordinates in the INDIA_VIEWBOX (1000 x 1133.3) space.
// Mercator, calibrated against Delhi, Chandigarh, Puducherry and Goa.
// If pins look slightly off, tweak these four constants.
const SX = 33.332, BX = -2262.69   // x = SX * lng + BX
const SY = 2036.81, BY = 1406.51   // y = BY - SY * mercator(lat)

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