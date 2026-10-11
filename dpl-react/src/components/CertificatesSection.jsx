import { useCallback, useEffect, useRef, useState } from 'react'
import { CERTIFICATES } from '../data/certificates.js'
import './CertificatesSection.css'

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" aria-hidden="true">
    <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
  </svg>
)

function CertificateViewer({ cert, onClose }) {
  const ref = useRef(null)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return undefined
    if (cert && !dialog.open) {
      setZoomed(false)
      dialog.showModal()
      document.documentElement.classList.add('cert-lock')
    }
    const handleClose = () => {
      document.documentElement.classList.remove('cert-lock')
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [cert, onClose])

  return (
    <dialog
      ref={ref}
      className="cert-viewer"
      aria-label={cert ? cert.title : 'Certificate'}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}
    >
      {cert && (
        <>
          <div className="cert-viewer__bar">
            <span className="cert-viewer__title">{cert.title}</span>
            <div className="cert-viewer__tools">
              <a className="cert-viewer__btn" href={cert.pdf} download>
                <DownloadIcon /><span>PDF</span>
              </a>
              <button type="button" className="cert-viewer__btn" onClick={() => ref.current?.close()} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className={`cert-viewer__body${zoomed ? ' is-zoomed' : ''}`}>
            <img
              onClick={() => setZoomed((z) => !z)}
              title={zoomed ? 'Click to fit to screen' : 'Click to enlarge'}
              src={cert.image}
              alt={`${cert.title} issued to DPL Global Private Limited`}
              style={{ aspectRatio: `${cert.width} / ${cert.height}` }}
            />
          </div>
        </>
      )}
    </dialog>
  )
}

export default function CertificatesSection({
  tag = 'Certificates',
  heading = 'Certificates & registrations',
  note = 'Documents issued to DPL Global Private Limited. Open any certificate to see it in full or download the original.',
  items = CERTIFICATES
}) {
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  if (!items.length) return null

  return (
    <section className="sec certs" aria-labelledby="certs-title">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-tag">{tag}</div>
            <h2 id="certs-title">{heading}</h2>
          </div>
          {note && <p className="sec-note">{note}</p>}
        </div>

        <div className="certs__grid">
          {items.map((cert) => (
            <article className="cert" key={cert.id}>
              <button
                type="button"
                className="cert__thumb"
                onClick={() => setOpen(cert)}
                aria-label={`View ${cert.title} full size`}
              >
                <img
                  src={cert.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: `${cert.width} / ${cert.height}` }}
                />
                <span className="cert__zoom" aria-hidden="true"><ExpandIcon /></span>
              </button>

              <div className="cert__body">
                <div className="cert__issuer">{cert.issuer}</div>
                <h3>{cert.title}</h3>
                {cert.summary && <p className="cert__summary">{cert.summary}</p>}

                {cert.details?.length > 0 && (
                  <dl className="cert__details">
                    {cert.details.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="cert__actions">
                  <button type="button" className="btn btn-dark" onClick={() => setOpen(cert)}>
                    View certificate
                  </button>
                  <a className="cert__pdf" href={cert.pdf} download>
                    <DownloadIcon /> Download PDF{cert.pdfSize ? <span> {cert.pdfSize}</span> : null}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <CertificateViewer cert={open} onClose={close} />
    </section>
  )
}
