import './StatsStrip.css'

const STATS = [
  { n: '5kL', l: 'Min single tank capacity' },
  { n: '5000kL', l: 'Max single tank capacity ' },
  { n: '1000+', l: 'Installations pan-India' },
  { n: '20,000+ kL ', l: 'liquid stored across nation' }
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
