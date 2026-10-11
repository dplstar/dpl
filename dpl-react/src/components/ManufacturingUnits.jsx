import { MANUFACTURING_UNITS } from '../data/manufacturingUnits.js'
import './ManufacturingUnits.css'

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
)

// Cards for all four units. `compact` is the slim list used on the Contact page.
export default function ManufacturingUnits({ compact = false }) {
  if (compact) {
    return (
      <ul className="mfg-list">
        {MANUFACTURING_UNITS.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong>
            <span>{u.address.join(', ')}</span>
            {u.map && (
              <a href={u.map} target="_blank" rel="noopener noreferrer">Open in Maps <ExternalIcon /></a>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mfg-grid">
      {MANUFACTURING_UNITS.map((u, i) => (
        <article className="mfg-card" key={u.id}>
          <div className="mfg-card__top">
            <span className="mfg-card__n">{String(i + 1).padStart(2, '0')}</span>
            <span className="mfg-card__tag">{u.tag}</span>
          </div>
          <h3>{u.name}</h3>
          <address>
            {u.address.map((line) => <span key={line}>{line}</span>)}
          </address>
          <p>{u.note}</p>
          {u.map && (
            <a className="mfg-card__map" href={u.map} target="_blank" rel="noopener noreferrer">
              Open in Maps <ExternalIcon />
            </a>
          )}
        </article>
      ))}
    </div>
  )
}
