import { useNavigation } from '../NavigationContext.jsx'
import FBTank from '../components/FBTank.jsx'
import './ZincalumePage.css'

const BENEFITS = [
  ['High Chemical Resistance', 'Superior protection against corrosive substances, acids, and alkalis, ensuring long-term tank integrity.'],
  ['Suitable for Aggressive Liquids', 'Designed to safely contain and store highly reactive and corrosive industrial liquids.'],
  ['Long-Lasting Coating Adhesion', 'Exceptional bond strength prevents peeling, blistering, or delamination even under extreme conditions.'],
  ['Factory-Controlled Application', 'Electrostatic application in controlled environments ensures consistent, high-quality coating.'],
  ['Thermal & Abrasion Resistance', 'Withstands high temperatures and physical wear, extending service life in harsh environments.'],
  ['Premium Quality Assurance', 'Rigorous testing and quality control measures ensure compliance with international standards.'],
]

const APPLICATIONS = [
  'Effluent Storage',
  'Chemical Plants',
  'Mining & Metallurgy',
  'Petrochemical Storage',
  'Pharmaceutical Processing',
  'Industrial Water Treatment',
  'Wastewater Treatment Plants',
  'Laboratory & Research Facilities',
]

const SPECIFICATIONS = [
  ['Coating Type', 'FBE Dual Layer (Epoxy Primer + Topcoat)'],
  ['Coating Thickness', '300–500 microns (12–20 mils)'],
  ['Panel Thickness', 'Up to 5 mm (customizable based on requirements)'],
  ['Primary Usage', 'ETP, STP, chemical storage, aggressive liquid containment'],
  ['Temperature Resistance', 'Up to 120°C (248°F) continuous service'],
  ['pH Resistance Range', '1–14 (full acidic to alkaline spectrum)'],
  ['Adhesion Strength', '3,500 psi (ASTM D4541)'],
  ['Impact Resistance', ' 160 cm·kg (ASTM G14)'],
  ['Abrasion Resistance', ' 100 mg loss (CS-17 wheel, 1000 cycles)'],
  ['Certifications', 'ISO 9001, ISO 14001, AWWA, NSF/ANSI 61 compliant'],
]

export default function FusionBondEpoxyTanksPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="fusion-bond">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks / Fusion Bond</div>
            <h1>Fusion Bond Epoxy Tanks</h1>
            <p>Fusion Bond Epoxy tanks utilize electrostatically applied proprietary epoxy coating in environmentally controlled factory conditions. This premium coating provides exceptional chemical resistance and durability for demanding industrial applications.</p>
            <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D Fusion Bond Epoxy storage tank">
            <FBTank diameter={12} courses={5} color="#23457a" />
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The coating</div>
          <h2>Fusion Bond Tanks by DPL Star</h2>
          <p>Fusion Bond Epoxy tanks utilize electrostatically applied proprietary epoxy coating in environmentally controlled factory conditions. This premium coating provides exceptional chemical resistance and durability for demanding industrial applications.</p>
        </div>
      </section>

      <section className="sec sec-d za-benefits">
        <div className="shell">
          <div className="sec-tag">Features</div>
          <h2>Premium Features</h2>
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
            <div className="sec-tag">Coating application</div>
            <h2>Advanced Coating Application</h2>
            <p className="sec-note">The FBE coating is applied electrostatically in environmentally controlled factory conditions, ensuring optimal adhesion and consistency. This proprietary process creates a uniform, pinhole-free barrier that provides exceptional protection against chemical attack and environmental degradation.</p>
          </div>
          <dl className="za-spec-list">
            {SPECIFICATIONS.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="sec za-standards">
        <div className="shell">
          <div className="sec-tag">Applications</div>
          <h2>Applications</h2>
          <div className="za-standard-grid">
            {APPLICATIONS.map((item) => (
              <article key={item}>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
