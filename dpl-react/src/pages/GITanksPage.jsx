import { useNavigation } from '../NavigationContext.jsx'
import GITank from '../components/GITank.jsx'
import './ZincalumePage.css'

const BENEFITS = [
  ['Cost-Effective', 'Economical solution for water storage without compromising on quality or durability.'],
  ['Fast Installation', 'Modular design allows for quick assembly and installation, saving time and labor costs.'],
  ['Versatile Applications', 'Suitable for both rural and industrial projects with varying capacity requirements.'],
  ['Superior Protection', 'Hot-dip galvanized coating provides long-lasting protection against rust and corrosion.'],
  ['Low Maintenance', 'Requires minimal upkeep and maintenance throughout its lifecycle.'],
  ['Easy Transport', 'Modular panels are easy to transport and assemble on-site.'],
]

const APPLICATIONS = [
  'General Water Storage',
  'Raw Water Reserves',
  'Fire Protection Systems',
  'Agricultural Irrigation',
  'Construction Site Supply',
  'Industrial Process Water',
  'Commercial Facilities',
  'Residential Complexes',
]

const SPECIFICATIONS = [
  ['Capacity range', '10 - 2,000 KL'],
  ['Diameter range', '2 - 30 m'],
  ['Maximum height', 'Up to 9.76 m'],
  ['Panel thickness', '1.2 - 3.0 mm'],
  ['Zinc coating grade', 'Z275 / Z350'],
  ['Material', 'Hot-dip galvanized steel'],
]

export default function GITanksPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="gi">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks / Color Coded</div>
            <h1>Color Coded Tank</h1>
            <p>Hot-dip galvanized tanks offer proven performance for general water storage applications. The metallurgically bonded zinc coating provides excellent corrosion protection at an economical cost.</p>
            <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D Color Coded Tank model">
            <GITank diameter={10} courses={6} />
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The material</div>
          <h2>Color Coded Tank by DPL Star</h2>
          <p>Hot-dip galvanized tanks offer proven performance for general water storage applications. The metallurgically bonded zinc coating provides excellent corrosion protection at an economical cost.</p>
        </div>
      </section>

      <section className="sec sec-d za-benefits">
        <div className="shell">
          <div className="sec-tag">Benefits</div>
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
            <div className="sec-tag">Applications</div>
            <h2>Diverse Applications</h2>
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

      <section className="sec za-standards">
        <div className="shell">
          <div className="sec-tag">Coating</div>
          <h2>Hot-dip galvanized coating for superior corrosion resistance</h2>
          <p className="sec-note">Zinc coating grade options are available to match the project environment and service life requirement.</p>
          <div className="za-standard-grid">
            <article>
              <h3>Z275</h3>
              <p>Suitable for standard water storage conditions with reliable corrosion protection.</p>
            </article>
            <article>
              <h3>Z350</h3>
              <p>Higher zinc mass for more demanding environments and extended service life.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
