import './AboutStats.css'

const STATS = [
  { n: '17+', l: 'Years incorporated' },
  { n: '4', l: 'Tank systems manufactured' },
  { n: '28', l: 'States & UTs served' },
  { n: '20+', l: 'Marquee clients on record' }
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
