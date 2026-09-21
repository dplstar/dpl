import { useNavigation } from '../NavigationContext.jsx'
import './CtaBand.css'

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function CtaBand({ heading, buttonLabel, target = 'contact' }) {
  const { goTo } = useNavigation()

  return (
    <section className="cta-band">
      <div className="shell">
        <h2>{heading}</h2>
        <button className="btn btn-dark" onClick={() => goTo(target)}>
          {buttonLabel} <ArrowIcon />
        </button>
      </div>
    </section>
  )
}
