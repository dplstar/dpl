import { PIPES, FITS } from '../data/siteData.js'
import './PipeTable.css'

export default function PipeTable() {
  return (
    <section className="sec sec-d">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">Pipes</div>
            <h2>Complete piping and fitting solutions</h2>
          </div>
        </div>
        <table className="ptable">
          <thead>
            <tr>
              <th>Standard</th>
              <th>Application</th>
            </tr>
          </thead>
          <tbody>
            {PIPES.map((r) => (
              <tr key={r.code}>
                <td>{r.code}</td>
                <td>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fit-tags">
          {FITS.map((f) => (
            <span className="fit-tag" key={f}>{f}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
