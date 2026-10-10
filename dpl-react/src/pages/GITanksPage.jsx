import { useNavigation } from '../NavigationContext.jsx'
import GITank from '../components/GITank.jsx'
import './ColorCoatedTanks.css'

const BENEFITS = [
  ['Enhanced Facility Aesthetics', 'Brighten up manufacturing plants, commercial sites, and institutional grounds with sleek, modern color options.'],
  ['Factory-Bonded Durability', 'High-grade, UV-resistant coatings protect against fading, chipping, chalking, and severe weather exposure.'],
  ['Instant Functional Identification', 'Color-coded water storage helps facility managers and safety personnel distinguish liquid types quickly on-site.'],
  ['Thermal & Environmental Efficiency', 'Color finishes support solar reflectivity and thermal insulation without compromising performance.'],
]
const COLOR_RANGE = [
  ['Classic Original Silver', 'Natural high-reflectivity Zincalume alloy finish for standard industrial and outdoor utility storage.'],
  ['Fire Protection Red', 'High-visibility safety standard designed for emergency water reserves and sprinkler feed systems.'],
  ['Ocean Blue', 'Clean, hygienic finish for potable water storage and municipal or residential water supply applications.'],
  ['Eco Green', 'Blend with nature for rainwater harvesting, ETP/STP storage, and agricultural irrigation systems.'],
]
const INDUSTRY_APPLICATIONS = [
  ['Manufacturing & Industrial Plants', 'Custom corporate or functional colors that streamline water utility management and enhance plant aesthetics.'],
  ['Commercial Buildings & Malls', 'Architectural green, blue, or custom shades that integrate seamlessly into utility yards or roofscapes.'],
  ['Firefighting & Safety Infrastructure', 'Fire red finish for rapid identification during safety audits and emergency response.'],
  ['Municipal & JJM Water Supply', 'Blue or silver finishes for clean, weather-resistant, long-life potable storage.'],
]
const SPECIFICATIONS = [
  ['Capacity range', '5 KL to 5,000 KL'],
  ['Diameter range', 'Up to 25 m'],
  ['Maximum height', 'Up to 10 m'],
  ['Material', '55% Aluminium-Zinc alloy steel'],
  ['Coating', 'Factory-bonded color-coated finish'],
  ['Service life', 'Up to 4x longer than conventional galvanized steel'],
]

export default function GITanksPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="gi">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks / Color Coated</div>
            <h1>Color-Coated Tanks</h1>
            <p><strong>Engineered for Strength. Styled for Your Infrastructure.</strong></p>
            <p>Transform industrial water storage into an aesthetic &amp; functional asset.</p>
            <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D Color-Coated Tank model">
            <GITank diameter={10} courses={6} />
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The solution</div>
          <h2>Transform Industrial Water Storage into an Aesthetic &amp; Functional Asset</h2>
          <p>At <strong>DPL Star</strong>, we combine heavy-duty industrial engineering with customizable visual appeal. Our <strong>Color-Coated Zincalume Storage Tanks</strong> deliver the legendary durability of 55% Aluminium-Zinc alloy steel, enhanced with vibrant factory-bonded exterior finishes.</p>
          <p>Whether you need to match your corporate brand identity, integrate seamlessly into an architectural layout, or functional color-code your plant’s water lines, DPL Star provides tailored storage solutions that elevate the visual standard of your facility.</p>
        </div>
      </section>

      <section className="sec sec-d za-benefits">
        <div className="shell">
          <div className="sec-tag">Benefits</div>
          <h2>Why Choose Color-Coded Zincalume Tanks?</h2>
          <div className="za-benefit-gridss">
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

      <section className="sec za-standards">
        <div className="shell">
          <div className="sec-tag">Color range</div>
          <h2>Explore Our Core Color Range</h2>
          <p className="sec-note">Choose from our signature high-durability palette, or request a completely custom shade tailored to your project specs.</p>
          <div className="za-standard-grid">
            {COLOR_RANGE.map(([title, description]) => (
              <article key={title}>
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
            <div className="sec-tag">Custom finish</div>
            <h2>Need a Custom Color? Choose Any RAL Shade!</h2>
            <p className="sec-note">Your infrastructure, your color choice. Don’t see your color? DPL Star can manufacture tanks in virtually any custom color. Whether matching corporate branding guidelines, industrial coding rules, or modern architectural concepts, tell us your RAL/Pantone color code, and we will build it.</p>
          </div>
          <dl className="za-spec-list">
            {SPECIFICATIONS.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="sec za-standards">
        <div className="shell">
          <div className="sec-tag">Applications</div>
          <h2>Key Applications Across Industries</h2>
          <div className="za-standard-grid">
            {INDUSTRY_APPLICATIONS.map(([title, description]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell za-copy">
          <div className="sec-tag">Technology</div>
          <h2>Built on Uncompromising Zincalume Technology</h2>
          <ul className="za-config-list">
            <li><strong>4x Longer Service Life:</strong> 55% Al-Zn coating outlasts traditional galvanized steel (GI) tanks.</li>
            <li><strong>Modular Bolted Construction:</strong> Quick installation with minimal on-site downtime.</li>
            <li><strong>Zero-Leak Liner System:</strong> Food-grade internal liners tailored to the stored liquid.</li>
            <li><strong>Wide Capacity Range:</strong> Engineered setups from 5 KL up to 5,000 KL.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
