import { PRODS } from '../data/siteData.js'
import { useNavigation } from '../NavigationContext.jsx'
import './ProductCard.css'
import './SignatureProducts.css'

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
)

const PRODUCT_PAGE_MAP = {
  za: 'zincalume',
  gi: 'gi',
  fbe: 'fusion-bond',
  gfs: 'glass-fused'
}

export default function SignatureProducts({ homeImages = null }) {
  const { goTo } = useNavigation()

  return (
    <section className="signature-products">
      <div className="sec-headd">
        <div>
          <div className="sec-tag">Storage systems</div>
          <h2 className="foure">Four constructions, one design team</h2>
        </div>
        <p className="sec-note">Material and coating decide what the tank can hold and for how long — pick by the
          liquid, not the price tag.</p>
      </div>

      <div className="signature-container">
        {PRODS.map((p) => {
          const src = homeImages?.[p.id] || p.img

          return (
            <div className="product-card" key={p.id}>
              <div className="prod-card">
                <h3>{p.name}</h3>
                <p className="prod-tl">{p.tl}</p>
                <div className="prod-specs">
                  <div>
                    <div className="spec-l">Capacity range</div>
                    <div className="spec-v">{p.cap}</div>
                  </div>
                  <div>
                    <div className="spec-l">Standard</div>
                    <div className="spec-v">{p.std}</div>
                  </div>
                </div>
                <a href="#" className="prod-link" onClick={(e) => { e.preventDefault(); goTo(PRODUCT_PAGE_MAP[p.id] || 'products') }}>
                  Explore spec <ArrowIcon />
                </a>
              </div>

              <div className={`product-image${homeImages ? ' product-image--home-updated' : ''}`}>
                <img src={src} alt={p.imgAlt} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
