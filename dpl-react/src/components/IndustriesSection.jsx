import { INDS } from '../data/siteData.js'
import './IndustriesSection.css'

export default function IndustriesSection() {
  return (
    <section className="sec sec-d">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">Where these tanks go</div>
            <h2>Ten sectors, one storage problem</h2>
          </div>
          <p className="sec-note">Every sector stores a different liquid under different rules. The tank changes to
            match — the engineering discipline doesn't.</p>
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
