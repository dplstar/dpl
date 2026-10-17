import { INDS } from '../data/siteData.js'
import './IndustriesSection.css'

export default function IndustriesSection() {
  return (
    <section className="sec sec-d">
      <div className="shell">
        <div className="sec-head">
          <div className="sec-div">
            <div className="sec-tag">Serving Diverse Industries</div>
            <h2>Reliable Water Storage Solutions</h2>
          </div>
          <p className="sec-note">Offering durable, corrosion-resistant water storage solutions for diverse industries and applications.</p>
        </div>
        <div className="ind-grid">
          {INDS.map((i) => (
            <div className="ind-row" key={i.n}>
              <div className="ind-name">{i.n}</div>
              <div className="ind-copy">{i.c}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
