import IndiaMap, { INDIA_STATES } from './IndiaMap.tsx'
import ManufacturingUnits from './ManufacturingUnits.jsx'
import { MANUFACTURING_UNITS } from '../data/manufacturingUnits.js'
import { INSTALLATION_LOCATIONS, COUNT_BY_STATE } from '../data/installationLocations.ts'
import './FactoryLocation.css'

// All four manufacturing units sit in the Sikandrabad Industrial Area.
const FACTORY = { lat: 28.476, lng: 77.668 }

const stateName = (id) => INDIA_STATES.find((s) => s.id === id)?.name ?? ''
const sites = (n) => `${n} installation site${n === 1 ? '' : 's'}`

export default function FactoryLocation() {
  const count = MANUFACTURING_UNITS.length
  const siteCount = INSTALLATION_LOCATIONS.length

  const markers = [
    ...INSTALLATION_LOCATIONS.map((l) => ({
      id: `site-${l.name}`,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
      meta: l.outside ? 'Outside India' : stateName(l.state),
      label: l.outside ? l.name : undefined,
      variant: 'site',
    })),
    {
      id: 'factory',
      name: `${count} manufacturing units`,
      meta: 'Sikandrabad, Uttar Pradesh',
      ...FACTORY,
      variant: 'factory',
    },
  ]

  const stateTooltip = (state) => {
    const n = COUNT_BY_STATE[state.id]
    const lines = []
    if (n) lines.push(sites(n))
    if (state.id === 'UP') lines.push(`${count} manufacturing units`)
    return (
      <>
        <strong>{state.name}</strong>
        <span className="india-map__tooltip-meta">{lines.length ? lines.join(' · ') : state.type}</span>
      </>
    )
  }

  return (
    <section className="factory-location" aria-labelledby="factory-location-title">
      <div className="shell">
        <div className="factory-location__layout">
          <div className="factory-location__content">
            <div className="sec-tag">Our Presence</div>
            <h2 id="factory-location-title">Made in India. Delivered Pan India.</h2>
            <p>Explore our footprints: Hover over the map to discover locations where DPL Star tanks have been successfully installed across India.</p>
          </div>
          <div className="factory-location__map">
            <IndiaMap
              selected="UP"
              values={COUNT_BY_STATE}
              colorRange={['#cdc7b5', '#b3ab93']}
              emptyColor="#d9d5c9"
              markers={markers}
              ariaLabel={`Map of India showing ${count} manufacturing units in Sikandrabad, Uttar Pradesh, and ${siteCount} installation sites`}
              tooltip={stateTooltip}
            />

            <ul className="factory-location__legend">
              <li><i className="is-factory" />Manufacturing Units</li>
              <li><i className="is-site" />Installation Sites</li>
            </ul>
          </div>
        </div>

        <ManufacturingUnits />
      </div>
    </section>
  )
}
