import { PROC } from '../data/siteData.js'
import './ProcessSection.css'

export default function ProcessSection() {
  return (
    <section className="sec">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">How a tank gets built</div>
            <h2>From drawing to commissioned asset</h2>
          </div>
        </div>
        <div className="proc-row">
          {PROC.map((s, i) => (
            <div className="proc-item" key={s.n}>
              <div className="proc-n">{String(i + 1).padStart(2, '0')} /04</div>
              <h4>{s.n}</h4>
              <p>{s.c}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
