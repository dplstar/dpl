import { CLIENTS } from '../data/siteData.js'
import './ClientsMarquee.css'

export default function ClientsMarquee() {
  // Logos are duplicated so the CSS marquee animation can loop seamlessly.
  const doubled = [...CLIENTS, ...CLIENTS]

  return (
    <div className="marquee clients-section">
      <div id="clients">
        {doubled.map((client, i) => (
          <div className="client-logo" key={`${client.name}-${i}`}>
            <img src={client.logo} alt={client.name} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}
