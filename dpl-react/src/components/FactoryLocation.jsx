import IndiaMap from './IndiaMap.tsx'
import ManufacturingUnits from './ManufacturingUnits.jsx'
import { MANUFACTURING_UNITS } from '../data/manufacturingUnits.js'
import './FactoryLocation.css'

export default function FactoryLocation() {
  const count = MANUFACTURING_UNITS.length

  return (
    <section className="factory-location" aria-labelledby="factory-location-title">
      <div className="shell">
        <div className="factory-location__layout">
          <div className="factory-location__content">
            <div className="sec-tag">Our factories</div>
            <h2 id="factory-location-title">Made in Sikandrabad, Uttar Pradesh.</h2>
            <p>DPL Star is part of the Dadu Group. Our tanks, pipes and fittings come from {count} manufacturing units in the Sikandrabad Industrial Area, serving projects across India.</p>
          </div>
          <div className="factory-location__map">
            <IndiaMap
              selected="UP"
              emptyColor="#d9d5c9"
              ariaLabel={`Map of India showing the group's ${count} manufacturing units in Sikandrabad, Uttar Pradesh`}
              tooltip={(state) => state.id === 'UP' ? <><strong>{count} manufacturing units</strong><span className="india-map__tooltip-meta">Sikandrabad, Uttar Pradesh</span></> : <><strong>{state.name}</strong><span className="india-map__tooltip-meta">{state.type}</span></>}
            />
            <span className="factory-location__pin" aria-hidden="true">{count} manufacturing units</span>
          </div>
        </div>

        <ManufacturingUnits />
      </div>
    </section>
  )
}
