import './StatsStrip.css'

const STATS = [
  { n: '500K+ L', l: 'Max single-tank capacity' },
  { n: '28', l: 'States & UTs served' },
  { n: '4', l: 'Tank systems in range' },
  { n: '2008', l: 'Incorporated' }
]

export default function StatsStrip() {
  return (
    <div className="stats">
      <div className="shell stats-row">
        {STATS.map((s) => (
          <div key={s.l}>
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
