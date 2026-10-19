import './StatsStrip.css'

const STATS = [
  { n: '5kL', l: 'Min Single Tank Capacity' },
  { n: '5000kL', l: 'Max Single Tank Capacity' },
  { n: '1000+', l: 'Installations Pan-India' },
  { n: '20,000+ kL ', l: 'Liquid Stored Across Nation' }
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
