import { useNavigation } from '../NavigationContext.jsx'
import ZincalumeTank from '../components/ZincalumeTank.jsx'
import './ZincalumePage.css'

const BENEFITS = [
  ['Cost-effective', 'Low maintenance requirements and a long operational life reduce total cost of ownership.'],
  ['Easy Maintainance', 'Smooth surface helps prevent algae growth and biofilm formation, making maintenance simpler.'],
  ['Fast Installation', 'Designed for bolted tank construction, with straightforward assembly and dependable sealing.'],
  ['Easily Expandable', 'The pre-fabricated technology helps to easily expand and move the tanks.'],
  ['Corrosion resistant', 'The Zn-Al-Si alloy coating protects against rust and corrosion for a longer service life.'],
  ['Durable and strong', 'Built to withstand harsh environmental conditions with a claimed life up to four times that of conventional galvanized steel.'],
  ['Lightweight', 'Easier to transport and install than conventional steel tanks, reducing installation time and cost.'],
  ['In-house Designed', 'Design and drawings are in-house and vetting can be done from institutions like IIT and BHU.'],
]

const SPECIFICATIONS = [
  ['Capacity range', '5 KL to 5,000 KL'],
  ['Diameter', '1.0 m to 25 m'],
  ['Height', 'Up to 10 m'],
  ['Material', 'Zincalume AZ150'],
  ['Sheet thickness', '(0.8 to 1.2 mm as per requirement)'],
  ['Bolts', 'HDG (Hot Dipped Galvanized) '],
  ['Liner', 'Food Grade'],
]

const STANDARDS = [
  ['Zincalume sheet standards', 'Australian Standards AS 1397 / ASTM A792M'],
  ['Bolted tank design', 'American Water Works Association (AWWA) D103-09'],
  ['Steel structures', 'Indian Standard IS 15961 - design and construction of steel storage tanks'],
  ['Water retaining structures', 'Indian Standard IS 3370 - code of practice for concrete structures for storage of liquids'],
  ['Wind and seismic design', 'Indian Standard IS 875 - design loads; Indian Standard IS 1893 - earthquake resistant design'],
]

export default function ZincalumePage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="zincalume">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks / Zincalume</div>
            <h1>Zincalume Tanks</h1>
            <p>Alloy-coated storage tanks engineered for corrosion resistance, durability and efficient installation.</p>
            <div className="za-composition">43.5% zinc <span>+</span> 55% aluminium <span>+</span> 1.5% silicon</div>
            <div className="za-hero__actions">
              <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
              <button className="btn btn-g" onClick={() => goTo('catalogue')}>View catalogue</button>
            </div>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D Zincalume storage tank">
            <ZincalumeTank diameter={9} rings={4} />
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The material</div>
          <h2>Zincalume Tanks by DPL Star</h2>
          <p>Zincalume Tanks feature an alloy coating of zinc (43.5%), aluminium (55%) and silicon (1.5%), delivering high corrosion resistance and durability. Their lightweight, relocatable construction suits space-constrained sites and temporary installations.</p>
          <p>The alloy creates a protective barrier that is claimed to be four times more durable than traditional galvanized steel, while its smooth surface supports water quality and easier cleaning.</p>
          <div className="za-alloy" aria-label="Zincalume alloy composition">
            <div><strong>43.5%</strong><span>Zinc</span><p>Sacrificial corrosion protection</p></div>
            <div><strong>55%</strong><span>Aluminium</span><p>Long-term barrier protection</p></div>
            <div><strong>1.5%</strong><span>Silicon</span><p>Improves coating adhesion</p></div>
          </div>
        </div>
      </section>

      <section className="sec sec-d za-benefits">
        <div className="shell">
          <div className="sec-tag">Benefits</div>
          <h2>Why choose Zincalume Tanks</h2>
          <div className="za-benefit-grid">
            {BENEFITS.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell za-details">
          <div>
            <div className="sec-tag">Technical details</div>
            <h2>Configured for the site</h2>
            <ul className="za-config-list">
              <li>Bolted panels with horizontal overlaps</li>
              <li>Algae resistant and leak proof liner</li>
              <li>Dome roof designing</li>
              <li>RCC ring-beam foundation</li>
            </ul>
          </div>
          <dl className="za-spec-list">
            {SPECIFICATIONS.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="sec za-standards">
        <div className="shell">
          <div className="sec-tag">Compliance</div>
          <h2>Design codes and standards</h2>
          <p className="sec-note">Manufactured and tested in compliance with the applicable international and national standards.</p>
          <div className="za-standard-grid">
            {STANDARDS.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>
    </div>
  )
}
