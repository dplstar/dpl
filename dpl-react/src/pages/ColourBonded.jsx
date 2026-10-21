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
  'Manufacturing & Industrial Plants',
  'Commercial Buildings & Malls',
  'Firefighting & Safety Infrastructure',
  'Municipal & JJM Water Supply',
]

const SPECIFICATIONS = [
  ['Capacity range', '5 kL - 5,000 kL'],
  ['Zero-Leak ', 'Food-grade internal liners '],
  ['Quick installation', 'Modular bolted construction'],
  ['Material', '55% Aluminum-Zinc alloy steel'],
]

// export default function GITanksPage({ active }) {
export default function ColourBondedPage({ active }) {
  const { goTo } = useNavigation()

  return (
    // <div className={`page${active ? ' active' : ''}`} data-page="gi">
    <div className={`page${active ? ' active' : ''}`} data-page="colour-bonded">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Storage tanks /  Colour-Bonded</div>
            <h1>Colour Bonded Tanks</h1>
            <p>Whether you need to match your corporate brand identity, integrate seamlessly into an architectural layout, or functional color-code your plant’s water lines, DPL Star provides tailored storage solutions that elevate the visual standard of your facility.</p>
            <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
          </div>
          <div className="za-hero__tank" aria-label="Interactive 3D GI storage tank">
            <GITank diameter={10} courses={6} color="#a01d18" />
          </div>
        </div>
      </section>

      <section className="sec za-intro">
        <div className="shell za-copy">
          <div className="sec-tag">The material</div>
          <h2>Colour Bonded Tanks by DPL Star</h2>
          <p>At DPL Star, we combine heavy-duty industrial engineering with customizable visual appeal. Our Colour-Bonded Zincalume Storage Tanks deliver the legendary durability of 55% Aluminum-Zinc alloy steel, enhanced with vibrant, factory-bonded exterior finishes.
Whether you need to match your corporate brand identity, integrate seamlessly into an architectural layout, or functional Colour-code your plant’s water lines, DPL Star provides tailored storage solutions that elevate the visual standard of your facility.
</p>
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
          {/* <div className="sec-tag">Our Core Color Range</div> */}
          <h2>Explore Our Core Color Range</h2>
          <p className="sec-note">Choose from our signature high-durability palette, or request a completely custom shade tailored to your exact project specs.</p>
          <div className="za-standard-grid">
            <article>
              <h3>Classic Original Silver</h3>
              <p><b>The Metallic Benchmark:</b> Natural, high-reflectivity Zincalume alloy finish.</p>
              <p><b>Best For:</b> Standard industrial water storage, raw material processing, and outdoor utilities where a timeless industrial steel appearance is preferred.</p>
            </article>
            <article>
              <h3>Fire Protection Red</h3>
              <p><b>High Visibility Safety Standard:</b> Instantly recognized and compliant with emergency protocols.</p>
              <p><b>Best For:</b> Dedicated firewater reservoirs, sprinkler feed systems, and commercial safety compliance setups.</p>
            </article>
            <article>
              <h3>Ocean Blue</h3>
              <p><b>Clean & Hygienic Identity:</b> Represents purity and clarity.</p>
              <p><b>Best For:</b> Potable water storage, drinking water supply systems (JJM-compliant applications), and residential or municipal storage.</p>
            </article>
            <article>
              <h3>Eco Green</h3>
              <p><b>Blend with Nature:</b> Designed to integrate naturally into eco-parks, agricultural fields, and landscaped commercial facilities.</p>
              <p><b>Best For:</b> Rainwater harvesting tanks, effluent treatment plant (ETP/STP) water storage, and agricultural irrigation.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
