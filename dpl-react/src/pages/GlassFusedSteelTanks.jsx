import { useNavigation } from '../NavigationContext.jsx'
import GFSTank from '../components/GFSTank.jsx'
import './ZincalumePage.css'

const BENEFITS = [
  ['Impermeable barrier', 'Complete protection against leaks and corrosion.'],
  ['30+ years coating life', 'Exceptional durability for long-term investment.'],
  ['High-temperature resistant', 'Withstands extreme thermal conditions.'],
  ['Easy installation & maintenance', 'Modular design for quick assembly.'],
  ['Smooth interior prevents bacterial growth', 'Hygienic surface ideal for sensitive applications.'],
  ['Non-reactive & non-corrosive surface', 'Resists chemical and environmental degradation.'],
]

const APPLICATIONS = [
  'Potable water',
  'Bio-digesters',
  'Food & beverage',
  'Industrial chemicals',
  'Agricultural storage',
  'Wastewater treatment',
]

const SPECIFICATIONS = [
  ['Coating', 'Glass Fused at 850°C'],
  ['Coating Hardness', '6 Mohs (Comparable to quartz)'],
  ['Life Expectancy', '30+ years (with proper maintenance)'],
  ['Panel Thickness', '3–12 mm (customizable based on requirements)'],
  ['Fusion Temperature', '820°C - 930°C'],
  ['Chemical Resistance', 'pH 1-14 (excellent acid and alkali resistance)'],
  ['Color Options', 'Blue, Green, White, Gray (standard options)'],
  ['Joint Sealant', 'Food-grade silicone or epoxy systems'],
  ['Certifications', 'ISO 9001, NSF/ANSI 61, AWWA D103, EN 1090'],
]

export default function GlassFusedSteelTanksPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="glass-fused">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks / Glass Fused</div>
            <h1>Glass Fused Steel Tanks</h1>
            <p>Glass-Fused-to-Steel technology combines the strength of steel with the corrosion resistance of glass through a high-temperature fusion process (820°C-930°C). This creates an inorganic, inert glaze layer that provides decades of maintenance-free service.</p>
            <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D Glass Fused Steel storage tank">
            {active && <GFSTank diameter={12} courses={6} roof="membrane" color="#1f5c3f" />}
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The technology</div>
          <h2>Glass Fused Steel Tanks by DPL Star</h2>
          <p>Glass-Fused-to-Steel technology combines the strength of steel with the corrosion resistance of glass through a high-temperature fusion process (820°C-930°C). This creates an inorganic, inert glaze layer that provides decades of maintenance-free service.</p>
        </div>
      </section>

      <section className="sec sec-d za-benefits">
        <div className="shell">
          <div className="sec-tag">Features</div>
          <h2>Features</h2>
          <div className="za-benefit-grids">
            {BENEFITS.map(([title, description], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell za-details">
          <div>
            <div className="sec-tag">Applications</div>
            <h2>Applications</h2>
            <ul className="za-config-list">
              {APPLICATIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <dl className="za-spec-list">
            {SPECIFICATIONS.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </section>
    </div>
  )
}
