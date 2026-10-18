import { LBR_GROUP } from '../data/siteData.js'
import './ProcessSection.css'

export default function LBRGroup() {
  return (
    <section className="sec">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">OUR GROUP</div>
            <h2>{
          <>
            LBR Group - Strength Unified<sup className="trademark">TM</sup>
          </>
        }
      </h2>
      <p className="leadership__intro">
        DPL Star is part of LBR Group, a diversified group of businesses rooted in a legacy of industrial manufacturing dating back to 1967. With expertise spanning steel and tubular products, storage systems, and emerging business verticals, the Group brings together generations of experience, engineering capabilities, and a shared commitment to quality and progress.
      </p>
          </div>
        </div>
        <div className="proc-row">
          {LBR_GROUP.map((s, i) => (
            <div className="proc-item" key={s.n}>
              <div className="proc-n">{String(i + 1).padStart(2, '0')}</div>
              <h4>{s.n}</h4>
              <p>{s.c}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
