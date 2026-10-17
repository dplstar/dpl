import './AboutStats.css'

const STATS = [
  { n: '18+', l: 'Years' },
  { n: '4', l: 'Units' },
  { n: '300+', l: 'Workforce' },
  { n: '500+', l: 'Clients' }
]

export default function AboutStats() {
  return (
    <div className="about-stats">
      {STATS.map((s) => (
        <div className="about-stat" key={s.l}>
          <div className="stat-n">{s.n}</div>
          <div className="stat-l">{s.l}</div>
        </div>
      ))}
    </div>
  )
}
