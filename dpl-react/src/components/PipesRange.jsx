
import { useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import { PIPES_RANGE } from '../data/pipes.js'


function PipeImage({ pipe }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="pipe-img-fallback" aria-hidden="true">
        {pipe.code}
      </span>
    )
  }

  return (
    <img
      src={pipe.img}
      alt={`${pipe.code} ${pipe.title.toLowerCase()} by DPL Star`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export default function PipesRange() {
  const { goTo } = useNavigation()

  return (
    <section className="products-showcase pipes-index" id="pipes-range">
      <div className="shell">
        <div className="products-showcase__heading">
          <div className="sec-tag">Pipes For Every Type</div>
          <h2 className="pipes-range__title">Piping Solutions</h2>
          <p>Pipes for water, gas and structural applications.</p>
        </div>

        <div className="products-showcase__grid">
          {PIPES_RANGE.map((pipe) => (
            <article className="products-showcase__card" key={pipe.id}>
              <div className="products-showcase__image pipe-img">
                <PipeImage pipe={pipe} />
              </div>

              <div className="products-showcase__card-body">
                <div>
                  <h3 className="pipes-range__code">{pipe.code}</h3>
                  <p className="pipes-range__use">{pipe.title}</p>
                </div>

                <button
                  className="btn btn-dark"
                  onClick={() => goTo('pipes', pipe.id)}
                >
                  Explore
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
