import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import './CatalogueFlipbook.css'

/* ── icons ── */
const Icon = ({ children, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
)
const PrevIcon = () => <Icon><polyline points="15 18 9 12 15 6" /></Icon>
const NextIcon = () => <Icon><polyline points="9 18 15 12 9 6" /></Icon>
const ZoomIcon = () => <Icon><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></Icon>
const ZoomOutIcon = () => <Icon><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></Icon>
const ExpandIcon = () => <Icon><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></Icon>
const CollapseIcon = () => <Icon><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></Icon>
const DownloadIcon = () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon>
const CloseIcon = () => <Icon><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></Icon>

const ZOOM_STEPS = [1, 1.5, 2]

/* ── helpers ── */

// Pages visible right now. In landscape the first and last pages sit alone
// (front and back cover); everything in between is shown as a spread.
function visibleRange(index, total, orientation) {
  if (orientation !== 'landscape' || index === 0 || index >= total - 1) return [index, index]
  return [index, index + 1]
}

function rangeLabel([first, last]) {
  return first === last ? `Page ${first + 1}` : `Pages ${first + 1}–${last + 1}`
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

function canFullscreen() {
  if (typeof document === 'undefined') return false
  return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled)
}

function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || el.isContentEditable
}

/* ── zoom reader ── */
function Reader({ open, onClose, pages, range, total }) {
  const dialogRef = useRef(null)
  const [zoomStep, setZoomStep] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setZoomStep(0)
      dialog.showModal()
      document.documentElement.classList.add('flipbook-lock')
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      document.documentElement.classList.remove('flipbook-lock')
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const [first, last] = range
  const shown = pages.slice(first, last + 1)
  const zoom = ZOOM_STEPS[zoomStep]

  return (
    <dialog ref={dialogRef} className="flipbook-reader" aria-label="Page reader">
      <div className="flipbook-reader__bar">
        <span className="flipbook-reader__label">
          {rangeLabel(range)} <span>of {total}</span>
        </span>
        <div className="flipbook-reader__tools">
          <button type="button" className="fb-icon-btn" onClick={() => setZoomStep((s) => Math.max(0, s - 1))}
            disabled={zoomStep === 0} aria-label="Zoom out">
            <ZoomOutIcon />
          </button>
          <span className="flipbook-reader__zoom" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" className="fb-icon-btn" onClick={() => setZoomStep((s) => Math.min(ZOOM_STEPS.length - 1, s + 1))}
            disabled={zoomStep === ZOOM_STEPS.length - 1} aria-label="Zoom in">
            <ZoomIcon />
          </button>
          <button type="button" className="fb-icon-btn" onClick={() => dialogRef.current?.close()} aria-label="Close reader">
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="flipbook-reader__body" style={{ '--zoom': zoom }}>
        {open && shown.map((p) => (
          <img key={p.large} src={p.large} alt={p.alt} decoding="async" />
        ))}
      </div>
    </dialog>
  )
}

/* ── flipbook ── */
export default function CatalogueFlipbook({ catalogue, active = true }) {
  const { pages, sections = [], pdf, pdfSize, title, pageWidth, pageHeight } = catalogue
  const total = pages.length

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const flipRef = useRef(null)

  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const [orientation, setOrientation] = useState('landscape')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [readerOpen, setReaderOpen] = useState(false)
  const [fullscreenSupported] = useState(canFullscreen)

  const range = visibleRange(index, total, orientation)
  const atStart = range[0] <= 0
  const atEnd = range[1] >= total - 1

  /* Build the book. page-flip owns (and on destroy removes) its root element,
     so it is created here rather than rendered by React. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const bookEl = document.createElement('div')
    bookEl.className = 'flipbook__book'
    stage.appendChild(bookEl)

    const items = pages.map((p, i) => {
      const pageEl = document.createElement('div')
      pageEl.className = 'flipbook__page'
      const img = document.createElement('img')
      img.src = p.src
      img.alt = p.alt
      img.draggable = false
      img.decoding = 'async'
      // First spread loads first; the rest follow so flips never land on a blank page.
      img.setAttribute('fetchpriority', i < 3 ? 'high' : 'low')
      pageEl.appendChild(img)
      return pageEl
    })

    const pf = new PageFlip(bookEl, {
      width: pageWidth,
      height: pageHeight,
      size: 'stretch',
      minWidth: 260, // below 2 × 260px the book switches to single pages
      maxWidth: 1000,
      minHeight: 100,
      maxHeight: 2000,
      autoSize: false, // height comes from CSS so the book always fits the viewport
      showCover: true,
      usePortrait: true,
      drawShadow: true,
      maxShadowOpacity: 0.45,
      flippingTime: prefersReducedMotion() ? 300 : 800,
      mobileScrollSupport: true,
      showPageCorners: true,
      swipeDistance: 30
    })

    const syncOrientation = (value) => {
      stage.dataset.orientation = value
      setOrientation(value)
    }

    pf.on('flip', (e) => setIndex(Number(e.data)))
    pf.on('changeOrientation', (e) => {
      syncOrientation(e.data)
      setIndex(pf.getCurrentPageIndex())
    })
    pf.on('init', (e) => {
      syncOrientation(e.data.mode)
      setIndex(e.data.page)
      setReady(true)
    })

    pf.loadFromHTML(items)
    flipRef.current = pf

    // page-flip only listens to window resize; also react to the container changing size.
    let frame = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => flipRef.current?.update())
    })
    ro.observe(stage)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
      const render = pf.getRender()
      pf.destroy()
      // page-flip keeps its animation loop running after destroy; make it a no-op.
      if (render) render.render = () => {}
      flipRef.current = null
      setReady(false)
    }
  }, [pages, pageWidth, pageHeight])

  // Re-measure when the page becomes visible again (it is display:none while hidden).
  useEffect(() => {
    if (!active) return undefined
    const id = requestAnimationFrame(() => flipRef.current?.update())
    return () => cancelAnimationFrame(id)
  }, [active])

  const goNext = useCallback(() => {
    const pf = flipRef.current
    if (!pf || atEnd) return
    if (prefersReducedMotion()) pf.turnToPage(range[1] + 1)
    else pf.flipNext()
  }, [atEnd, range])

  const goPrev = useCallback(() => {
    const pf = flipRef.current
    if (!pf || atStart) return
    if (prefersReducedMotion()) pf.turnToPage(range[0] - 1)
    else pf.flipPrev()
  }, [atStart, range])

  const goTo = useCallback((page) => {
    const pf = flipRef.current
    if (!pf) return
    if (prefersReducedMotion()) pf.turnToPage(page)
    else pf.flip(page)
  }, [])

  // Arrow keys while the catalogue is on screen
  useEffect(() => {
    if (!active || readerOpen) return undefined
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, readerOpen, goNext, goPrev])

  // Full screen
  useEffect(() => {
    const onChange = () => setIsFullscreen(getFullscreenElement() === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggleFullscreen = () => {
    const el = rootRef.current
    if (!el) return
    if (getFullscreenElement()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document)
    } else {
      const request = el.requestFullscreen || el.webkitRequestFullscreen
      request?.call(el)
    }
  }

  const currentSection = useMemo(() => {
    let match = sections[0]
    for (const s of sections) if (s.page <= range[0]) match = s
    return match
  }, [sections, range])

  const closeReader = useCallback(() => setReaderOpen(false), [])

  return (
    <div
      ref={rootRef}
      className="flipbook"
      data-fullscreen={isFullscreen ? 'true' : undefined}
      style={{ '--fb-page-ratio': `${pageWidth} / ${pageHeight}`, '--fb-spread-ratio': `${pageWidth * 2} / ${pageHeight}` }}
    >
      <div className="flipbook__viewport">
        <div
          ref={stageRef}
          className="flipbook__stage"
          role="region"
          aria-label={`${title} catalogue, ${total} pages`}
        />
        {!ready && <div className="flipbook__loading" aria-hidden="true">Opening catalogue…</div>}
      </div>

      <div className="flipbook__bar" role="toolbar" aria-label="Catalogue controls">
        <div className="flipbook__nav">
          <button type="button" className="fb-icon-btn" onClick={goPrev} disabled={!ready || atStart} aria-label="Previous page">
            <PrevIcon />
          </button>
          <span className="flipbook__count" aria-live="polite">
            {rangeLabel(range)} <span>of {total}</span>
          </span>
          <button type="button" className="fb-icon-btn" onClick={goNext} disabled={!ready || atEnd} aria-label="Next page">
            <NextIcon />
          </button>
        </div>

        {sections.length > 0 && (
          <label className="flipbook__jump">
            <span className="fb-vh">Jump to section</span>
            <select
              value={currentSection?.page ?? 0}
              onChange={(e) => goTo(Number(e.target.value))}
              disabled={!ready}
            >
              {sections.map((s) => <option key={s.page} value={s.page}>{s.label}</option>)}
            </select>
          </label>
        )}

        <div className="flipbook__tools">
          <button type="button" className="fb-tool" onClick={() => setReaderOpen(true)} disabled={!ready} title="Zoom">
            <ZoomIcon /><span>Zoom</span>
          </button>
          {fullscreenSupported && (
            <button type="button" className="fb-tool" onClick={toggleFullscreen} aria-pressed={isFullscreen}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
              <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
            </button>
          )}
          <a className="fb-tool" href={pdf} download aria-label={`Download PDF, ${pdfSize}`} title={`Download PDF (${pdfSize})`}>
            <DownloadIcon /><span>PDF</span>
          </a>
        </div>
      </div>

      <p className="flipbook__hint">
        <span className="flipbook__hint--pointer">Drag a corner or click a page to turn it. Arrow keys work too.</span>
        <span className="flipbook__hint--touch">Swipe or tap a page to turn it. Use Zoom to read the small print.</span>
      </p>

      <Reader open={readerOpen} onClose={closeReader} pages={pages} range={range} total={total} />
    </div>
  )
}
