import { PRODS } from '../data/siteData.js'
import { useNavigation } from '../NavigationContext.jsx'
import './Footer.css'

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
)

const PRODUCT_PAGE_MAP = {
  za: 'zincalume',
  gi: 'gi',
  fbe: 'fusion-bond',
  gfs: 'glass-fused'
}

export default function Footer() {
  const { goTo } = useNavigation()

  return (
    <footer className="footer">
      <div className="shell">
        <div className="foot-grid">
          <div className="foot-col">
            <a href="/home" onClick={(e) => { e.preventDefault(); goTo('home') }}>
              <img src="/img/DPL-Star-Logo.png" className="colorLogo" width="100px" height="50px" alt="DPL Star" />
            </a>
            <p style={{ maxWidth: '30ch' }}>DPL Global Private Limited — liquid storage tanks, pipes and tube-well
              fittings, manufactured in Sikandrabad, Uttar Pradesh.</p>
          </div>

          <div className="foot-col">
            <h5>Storage Tanks</h5>
            {PRODS.map((p) => (
              <a href="#" key={p.id} onClick={(e) => { e.preventDefault(); goTo(PRODUCT_PAGE_MAP[p.id] || 'products') }}>{p.name}</a>
            ))}
            <a href="/catalogue" onClick={(e) => { e.preventDefault(); goTo('catalogue') }}>Catalogue</a>
          </div>

          <div className="foot-col">
            <h5>Company</h5>
            <a href="/home" onClick={(e) => { e.preventDefault(); goTo('home') }}>Home</a>
            <a href="/about" onClick={(e) => { e.preventDefault(); goTo('about') }}>About</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); goTo('contact') }}>Contact</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); goTo('privacy') }}>Privacy Policy</a>
            <a href="/terms-of-use" onClick={(e) => { e.preventDefault(); goTo('terms-of-use') }}>Terms of Use</a>
          </div>

          <div className="foot-col">
            <h5>Reach us</h5>
            <div className="foot-row"><PinIcon /><span>A-58, Sikandrabad, UP – 203205</span></div>
            <div className="foot-row"><PhoneIcon /><span>+91 92056 00125</span></div>
            <div className="foot-row"><MailIcon /><span>info@dplstar.com</span></div>
          </div>
        </div>

        <div className="foot-bar">
          <span>&copy; 2026 DPL Star. Design concept — specifications shown are indicative.</span>
          <span>Incorporated 2008 · Manufacturing since 2019</span>
        </div>
      </div>
    </footer>
  )
}
