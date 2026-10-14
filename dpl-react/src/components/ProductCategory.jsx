import { useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import './ProductCategory.css'

function ItemCard({ item, codeName }) {
  const { goTo } = useNavigation()
  const [failed, setFailed] = useState(false)

  return (
    <article className="pcat__card">
      <div className="pcat__img">
        {failed ? (
          <span className="pcat__img-fallback" aria-hidden="true">{item.name}</span>
        ) : (
          <img src={item.img} alt={item.name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
        )}
      </div>
      <div className="pcat__body">
        <h3 className={codeName ? 'pcat__code' : undefined}>{item.name}</h3>
        <p>{item.desc}</p>
        {item.link && (
          <button className="btn btn-g pcat__explore" onClick={() => goTo(...item.link)}>Explore</button>
        )}
      </div>
    </article>
  )
}

export default function ProductCategory({ category }) {
  const { goTo } = useNavigation()
  const { id, tone, tag, title, intro, items, cta, codeNames } = category
  const dark = tone === 'dark'

  return (
    <section
      id={id}
      className={`sec pcat${dark ? ' sec-d pcat--dark' : ' pcat--light'}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">{tag}</div>
            <h2 id={`${id}-title`}>{title}</h2>
          </div>
          <p className="sec-note">{intro}</p>
        </div>

        <div className="pcat__grid">
          {items.map((item) => (
            <ItemCard key={item.name} item={item} codeName={codeNames} />
          ))}
        </div>

        {cta && (
          <div className="pcat__cta">
            <div>
              <h3>{cta.title}</h3>
              <p>{cta.body}</p>
            </div>
            <div className="pcat__cta-actions">
              <button className="btn btn-p" onClick={() => goTo('catalogue')}>{cta.primary}</button>
              <button className={`btn ${dark ? 'btn-g' : 'btn-dark'}`} onClick={() => goTo('contact')}>
                {cta.secondary}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
