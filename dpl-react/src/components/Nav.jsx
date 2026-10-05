import { useEffect, useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import './Nav.css'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' }
]

const ArrowIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

const BurgerIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
)

export default function Nav() {
  const { page, goTo } = useNavigation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tanksOpen, setTanksOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 24)
    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  function handleGo(id) {
    setMobileOpen(false)
    setTanksOpen(false)
    goTo(id)
  }

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="shell nav-row">
        <a href="#" onClick={(e) => { e.preventDefault(); handleGo('home') }}>
          <img
            src={scrolled ? '/img/DPL%20Star%20Private%20Limited.png' : '/img/DPL-Star-Logo.png'}
            className="nav-logo"
            width="100px"
            height="50px"
            alt="DPL Star"
          />
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href="#"
              className={`nav-a${page === l.id ? ' on' : ''}`}
              onClick={(e) => { e.preventDefault(); handleGo(l.id) }}
            >
              {l.label}
            </a>
          ))}
          <div className="nav-dropdown">
            <button
              className={`nav-a nav-dropdown__toggle${['zincalume', 'gi', 'fusion-bond', 'glass-fused'].includes(page) ? ' on' : ''}`}
              aria-expanded={tanksOpen}
              aria-controls="storage-tanks-menu"
              onClick={() => setTanksOpen((open) => !open)}
            >
              Storage Tanks <span aria-hidden="true">⌄</span>
            </button>
            {tanksOpen && (
              <div className="nav-dropdown__menu" id="storage-tanks-menu">
                <button onClick={() => handleGo('zincalume')}>Zincalume Tanks</button>
                <button onClick={() => handleGo('gi')}>GI Tanks</button>
                <button onClick={() => handleGo('fusion-bond')}>Fusion Bond Epoxy Tanks</button>
                <button onClick={() => handleGo('glass-fused')}>Glass Fused Steel Tanks</button>
              </div>
            )}
          </div>
          <a
            href="#"
            className={`nav-a${page === 'products' ? ' on' : ''}`}
            onClick={(e) => { e.preventDefault(); handleGo('products') }}
          >
            Products
          </a>
          <button className="btn btn-p nav-cta" onClick={() => handleGo('contact')}>
            Get a quote <ArrowIcon />
          </button>
        </div>
        <button className="nav-burger" id="burger" aria-label="Menu" onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>
      <div id="mob-nav" className={mobileOpen ? 'open' : ''}>
        <a href="#" onClick={(e) => { e.preventDefault(); handleGo('home') }}>Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleGo('about') }}>About</a>
        <div className="mob-tanks">
          <button onClick={() => setTanksOpen((open) => !open)} aria-expanded={tanksOpen}>Storage Tanks <span aria-hidden="true">⌄</span></button>
          {tanksOpen && <div className="mob-tanks__menu">
            <button onClick={() => handleGo('zincalume')}>Zincalume Tanks</button>
            <button onClick={() => handleGo('gi')}>GI Tanks</button>
            <button onClick={() => handleGo('fusion-bond')}>Fusion Bond Epoxy Tanks</button>
            <button onClick={() => handleGo('glass-fused')}>Glass Fused Steel Tanks</button>
          </div>}
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); handleGo('products') }}>Products</a>
        <button onClick={() => handleGo('contact')}>Get a quote</button>
      </div>
    </nav>
  )
}
