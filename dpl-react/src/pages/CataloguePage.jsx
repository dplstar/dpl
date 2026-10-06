import { useEffect, useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import CatalogueFlipbook from '../components/CatalogueFlipbook.jsx'
import { CATALOGUES } from '../data/catalogues.js'
import './CataloguePage.css'

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

export default function CataloguePage({ active }) {
  const { goTo } = useNavigation()
  const [catalogueId, setCatalogueId] = useState(CATALOGUES[0].id)
  const catalogue = CATALOGUES.find((c) => c.id === catalogueId) || CATALOGUES[0]

  // Build the flipbook the first time the page is opened, then keep it alive
  // so returning to the page doesn't reload every image.
  const [opened, setOpened] = useState(active)
  useEffect(() => {
    if (active) setOpened(true)
  }, [active])

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="catalogue">
      <section className="cat">
        <div className="shell">
          <header className="cat__head">
            <div>
              <div className="sec-tag">Resources / Catalogue</div>
              <h1>{catalogue.title} catalogue</h1>
              <p>{catalogue.summary} {catalogue.pages.length} pages.</p>
            </div>
            <div className="cat__actions">
              <a className="btn btn-p" href={catalogue.pdf} download>
                <DownloadIcon /> Download PDF <span className="cat__size">{catalogue.pdfSize}</span>
              </a>
              <button className="btn btn-g" onClick={() => goTo('contact')}>Request a quote</button>
            </div>
          </header>

          {CATALOGUES.length > 1 && (
            <div className="cat__tabs" role="tablist" aria-label="Catalogues">
              {CATALOGUES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={c.id === catalogue.id}
                  className={c.id === catalogue.id ? 'on' : ''}
                  onClick={() => setCatalogueId(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {opened && <CatalogueFlipbook key={catalogue.id} catalogue={catalogue} active={active} />}
        </div>
      </section>
    </div>
  )
}
