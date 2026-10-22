import { useState } from 'react'
import './LeadershipSection.css'
import maniramPortrait from '/img/Maniram Ji.webp'
import rajeshPortrait from '/img/Rajesh Agarwal, Managing Director, DPL Star.webp'
import satishPortrait from '/img/Satish Agarwal, Chief Executive Officer, DPL Star.webp'

const LEADERS = [
  {
    name: 'Shri Ram Avatar Agarwal',
    role: 'Chairman, DPL Star',
    image: maniramPortrait,
    description: "Ram Avatar Agarwal is a leader guided by integrity, discipline, and quiet determination. A man of few words and firm principles, he believes in valuing time, relationships, and purposeful work. Under his seasoned guidance, DPL Star has evolved into a trusted and respected name in the steel manufacturing sector. In 2006, drawing upon more than four decades of hands-on industry experience, he laid the foundation of DPL Star. His strategic foresight, practical wisdom, and unwavering commitment to quality have been instrumental in steering the company toward sustained growth and industry recognition. Hailing from humble beginnings in a small village in Haryana, his journey reflects resilience and perseverance. The early years demanded relentless effort and sacrifice, but through dedication, discipline, and an unshakeable will, he built a legacy grounded in hard work and credibility. Today, he is regarded as one of the accomplished industrialists who have shaped the sector through vision and values. Beyond his entrepreneurial achievements, Mr. Agarwal remains deeply committed to social responsibility. He serves as a trustee of Varanasi’s historic S. L. Marwari Hindu Hospital (established in 1932) and is actively associated with Shri Kashi Jivdaya Vistarini Goshala Avam Pashushala, reflecting his enduring dedication to community welfare and service."
  },
  {
    name: 'Dr. Rajesh Agarwal',
    role: 'MD, DPL Star',
    image: rajeshPortrait,
    description: "At the helm of DPL Star’s dynamic growth story stands Rajesh Agarwal, a leader who blends tradition with transformation. A B.Com. (Hons.) graduate from Banaras Hindu University, he represents the new-generation industrialist: grounded in values, yet driven by ambition and innovation. As Managing Director, he leads a vast team of skilled professionals with clarity and conviction. However, titles do not define his leadership involvement does. Deeply engaged in production strategy, operational excellence, and expansion planning, he believes that true leadership lies in staying connected to the core of the business. His presence on the shop floor is not symbolic it is habitual. A day away from the factory feels incomplete to him. By personally reviewing processes and interacting with teams daily, he ensures that DPL Star’s standards of quality, efficiency, and growth remain uncompromised. With more than 30 years of industry experience, he upholds a simple yet powerful philosophy: work is worship. For him, DPL Star is not merely an enterprise, it is a commitment to excellence, a platform for progress, and a legacy in the making."
  },
  {
    name: 'Satish Agarwal',
    role: 'CEO, DPL Star',
    image: satishPortrait,
    description: "Satish Agarwal, with a natural inclination toward business from an early age, brings both passion and purpose to his role. His professional journey is deeply influenced by his values, with thoughts of Saint Dadu Dayal and the growth of DPL Star guiding his daily ethos. Armed with a degree in Business Management from Banaras Hindu University, he focuses on delivering high-quality products and fostering a positive, supportive work environment for every team member. His leadership blends strategic acumen with genuine care for people, creating a culture where growth and well-being go hand in hand. Behind the accomplished CEO lies a humble family man, thoughtful, values-driven, and grounded in sincerity. A leader of both vision and compassion, Satish Agarwal balances ambition with kindness, strength with humility, and purpose with empathy. In his own words, “I am who my father has shaped me to be,” a testament to his respect for legacy and his commitment to carrying it forward with integrity."
  }
]

export default function LeadershipSection() {
  const [expandedLeaders, setExpandedLeaders] = useState([])

  const toggleDescription = (name) => {
    setExpandedLeaders((expanded) => (
      expanded.includes(name)
        ? expanded.filter((leaderName) => leaderName !== name)
        : [...expanded, name]
    ))
  }

  return (
    <section className="sec leadership" aria-labelledby="leadership-title">
      <div className="shell">
        <div className="sec-head leadership__head">
          <div>
            <div className="sec-tag">Leadership</div>
            <h2 id="leadership-title">Leadership</h2>
            <p className="leadership__intro">
              Rooted in tradition, guided by long-term thinking and an unwavering focus on quality.
            </p>
          </div>
        </div>

        <div className="leadership__grid">
          {LEADERS.map((leader) => {
            const isExpanded = expandedLeaders.includes(leader.name)
            const descriptionId = `leader-description-${leader.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

            return (
              <article className="leader-card" key={leader.name}>
                {leader.image ? (
                  <img
                    className="leader-card__portrait"
                    src={leader.image}
                    alt={leader.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="leader-card__portrait leader-card__portrait--placeholder"
                    role="img"
                    aria-label={`Portrait of ${leader.name} coming soon`}
                  >
                    <span aria-hidden="true">{leader.initials}</span>
                  </div>
                )}
                <div className="leader-card__body">
                  <p className="leader-card__role">{leader.role}</p>
                  <h3>{leader.name}</h3>
                  <p
                    id={descriptionId}
                    className={`leader-card__description${isExpanded ? ' is-expanded' : ''}`}
                  >
                    {leader.description}
                  </p>
                  <button
                    type="button"
                    className="leader-card__toggle"
                    aria-expanded={isExpanded}
                    aria-controls={descriptionId}
                    onClick={() => toggleDescription(leader.name)}
                  >
                    Read {isExpanded ? 'less' : 'more'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
