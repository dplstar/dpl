import { useNavigation } from '../NavigationContext.jsx'
import TankIcon from './TankIcon.jsx'
import './ProductCard.css'

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function ProductCard({ product: p, full = false, ctaLabel = 'Explore spec', goTarget = 'products' }) {
  const { goTo } = useNavigation()

  return (
    <div className="prod-card">
      <TankIcon v={p.v} />
      <h3>{p.name}</h3>
      <p className="prod-tl">{p.tl}</p>

      {full && <p className="prod-body">{p.body}</p>}

      <div className="prod-specs">
        {full && (
          <>
            <div>
              <div className="spec-l">Material</div>
              <div className="spec-v">{p.mat}</div>
            </div>
            <div>
              <div className="spec-l">Coating</div>
              <div className="spec-v">{p.coat}</div>
            </div>
          </>
        )}
        <div>
          <div className="spec-l">Capacity range</div>
          <div className="spec-v">{p.cap}</div>
        </div>
        <div>
          <div className="spec-l">Standard</div>
          <div className="spec-v">{p.std}</div>
        </div>
      </div>

      <a href="#" className="prod-link" onClick={(e) => { e.preventDefault(); goTo(goTarget) }}>
        {ctaLabel} <ArrowIcon />
      </a>
    </div>
  )
}
