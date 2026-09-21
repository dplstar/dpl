import IndiaMap from './IndiaMap.tsx'
import './FactoryLocation.css'

const FACTORY_ADDRESS = 'A-58, Sikandrabad, Uttar Pradesh 203205'

export default function FactoryLocation() {
  return (
    <section className="factory-location" aria-labelledby="factory-location-title">
      <div className="shell factory-location__layout">
        <div className="factory-location__content">
          <div className="sec-tag">Our factory</div>
          <h2 id="factory-location-title">Made in Sikandrabad, Uttar Pradesh.</h2>
          <p>DPL Star's manufacturing facility is located in Sikandrabad, serving projects across India.</p>
          <address>{FACTORY_ADDRESS}</address>
        </div>
        <div className="factory-location__map">
          <IndiaMap
            selected="UP"
            emptyColor="#d9d5c9"
            ariaLabel="Map of India showing DPL Star's factory in Uttar Pradesh"
            tooltip={(state) => state.id === 'UP' ? <><strong>DPL Star Factory</strong><span className="india-map__tooltip-meta">Sikandrabad, Uttar Pradesh</span></> : <><strong>{state.name}</strong><span className="india-map__tooltip-meta">{state.type}</span></>}
          />
          <span className="factory-location__pin" aria-hidden="true">DPL Star Factory</span>
        </div>
      </div>
    </section>
  )
}
