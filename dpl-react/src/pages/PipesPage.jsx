import { Fragment, useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { PIPES_RANGE } from '../data/pipes.js'
import './ZincalumePage.css'
import './ProductsPage.css'
import './PipesPage.css'
import PipesRange from '../components/PipesRange.jsx'
// Product photo with a graceful fallback if the file is missing
function PipeImage({ pipe }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="pipe-img-fallback" aria-hidden="true">{pipe.code}</span>
  return <img src={pipe.img} alt={`${pipe.code} ${pipe.title.toLowerCase()} by DPL Star`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
}

// End-on view of a strapped pipe bundle (hexagonal pack of 19 tubes)
function PipeBundle() {
  const r = 34
  const pitch = r * 2 + 4
  const rows = [3, 4, 5, 4, 3]
  const tubes = []
  rows.forEach((count, row) => {
    const y = (row - 2) * pitch * 0.866
    for (let i = 0; i < count; i++) {
      tubes.push({ x: (i - (count - 1) / 2) * pitch, y })
    }
  })

  return (
    <svg className="pipes-hero__bundle" viewBox="-230 -210 460 420" role="img" aria-label="End view of a bundle of steel pipes">
      <defs>
        <linearGradient id="pipe-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset=".45" stopColor="#b9c1c9" />
          <stop offset="1" stopColor="#6f7a86" />
        </linearGradient>
        <radialGradient id="pipe-bore" cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#1a2230" />
          <stop offset="1" stopColor="#06080c" />
        </radialGradient>
        <linearGradient id="pipe-lip" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,.55)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* steel strap around the bundle */}
      <polygon
        className="pipes-hero__strap"
        points={[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (Math.PI / 3) * k
          const R = pitch * 2 + r + 10
          return `${(R * Math.cos(a)).toFixed(1)},${(R * Math.sin(a)).toFixed(1)}`
        }).join(' ')}
      />

      {tubes.map((t, i) => (
        <g key={i} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`}>
          <circle r={r} fill="url(#pipe-wall)" />
          <circle r={r - 7} fill="url(#pipe-bore)" />
          <circle r={r - 7} fill="none" stroke="url(#pipe-lip)" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}

export default function PipesPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="pipes">
      <section className="za-hero">
        <div className="shell za-hero__grid">
          <div>
            <div className="sec-tag">Pipes & tubes</div>
            <h1>Steel Pipes</h1>
            <p>ERW pipes, hollow sections, well casing pipes and tubular poles, made to Indian Standards in our Sikandrabad manufacturing units.</p>
            <div className="za-composition">
              {PIPES_RANGE.map((p, i) => (
                <Fragment key={p.id}>{i > 0 && <span aria-hidden="true">/</span>}{p.code}</Fragment>
              ))}
            </div>
            <div className="za-hero__actions">
              <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote</button>
              <button className="btn btn-g" onClick={() => goTo('pipes', 'pipes-range')}>See the range</button>
            </div>
          </div>
          <div className="pipes-hero__art">
            <PipeBundle />
          </div>
        </div>
      </section>

      {/* <section className="products-showcase pipes-index" id="pipes-range">
        <div className="shell">
          <div className="products-showcase__heading">
            <div className="sec-tag">Product range</div>
            <h2 className="pipes-range__title">Our Pipes</h2>
            <p>Pipes for water, gas and structural applications.</p>
          </div>

          <div className="products-showcase__grid">
            {PIPES_RANGE.map((pipe) => (
              <article className="products-showcase__card" key={pipe.id}>
                <div className="products-showcase__image pipe-img"><PipeImage pipe={pipe} /></div>
                <div className="products-showcase__card-body">
                  <div>
                    <h3 className="pipes-range__code">{pipe.code}</h3>
                    <p className="pipes-range__use">{pipe.title}</p>
                  </div>
                  <button className="btn btn-dark" onClick={() => goTo('pipes', pipe.id)}>Explore</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section> */}
  <PipesRange/>
      <section className="sec sec-d pipes-detail" aria-label="Pipe specifications">
        <div className="shell">
          <div className="sec-head">
            <div>
              <div className="sec-tag">Specifications</div>
              <h2>Standards and applications</h2>
            </div>
            <p className="sec-note">Sizes, classes and finishes are confirmed per order. Tell us the application and we'll recommend the right pipe.</p>
          </div>

          {PIPES_RANGE.map((pipe, i) => (
            <article className={`pipe-row${i % 2 ? ' pipe-row--flip' : ''}`} id={pipe.id} key={pipe.id}>
              <div className="pipe-row__img pipe-img"><PipeImage pipe={pipe} /></div>
              <div className="pipe-row__body">
                <div className="pipe-row__code">{pipe.code}</div>
                <h3>{pipe.title}</h3>
                <p className="pipe-row__standard">{pipe.standard}</p>
                <p className="pipe-row__summary">{pipe.summary}</p>

                <div className="pipe-row__label">Typical uses</div>
                <ul className="pipe-row__uses">
                  {pipe.uses.map((u) => <li key={u}>{u}</li>)}
                </ul>

                <dl className="pipe-row__specs">
                  {pipe.specs.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>

                <button className="btn btn-p" onClick={() => goTo('contact')}>Request a quote for {pipe.code}</button>
              </div>
            </article>
          ))}

          <div className="pipes-fittings">
            <p><strong>Need fittings as well?</strong> Tube well and pump fittings are on the Products page.</p>
            <button className="btn btn-g" onClick={() => goTo('products', 'tube-well-fittings')}>View fittings</button>
          </div>
        </div>
      </section>

      <CtaBand heading="Need a size or class you don't see here?" buttonLabel="Talk to our team" target="contact" />
    </div>
  )
}
