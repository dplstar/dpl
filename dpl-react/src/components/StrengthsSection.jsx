import './StrengthsSection.css'

export default function StrengthsSection({ tag, heading, note, items }) {
  return (
    <section className="sec sec-d">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">{tag}</div>
            <h2>{heading}</h2>
          </div>
          {note && <p className="sec-note">{note}</p>}
        </div>
        <div className="str-grid">
          {items.map((s, i) => (
            <div className="str-item" key={s.n}>
              <div className="str-idx mono">{String(i + 1).padStart(2, '0')}</div>
              <h4>{s.n}</h4>
              <p>{s.c}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
