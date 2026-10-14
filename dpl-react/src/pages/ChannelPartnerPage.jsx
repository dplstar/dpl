import { useState } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import PageHero from '../components/PageHero.jsx'
import { REGISTERING_FOR, HEARD_FROM, PARTNER_EMAIL } from '../data/channelPartner.js'
import '../components/ContactForm.css'
import './ContactPage.css'
import './ChannelPartnerPage.css'

const RANGE = [
  { title: 'Storage tanks', items: 'Zincalume, GI, Fusion Bond Epoxy and Glass Fused Steel', page: 'products' },
  { title: 'Pipes', items: 'IS 1239, IS 4923, IS 4270 and IS 2713', page: 'pipes' },
  { title: 'Fittings', items: 'Tube well and pump fittings', page: ['products', 'tube-well-fittings'] }
]

const PROOF = [
  ['1000+', 'tank installations across India'],
  ['Jal Jeevan Mission', 'tanks supplied for Har Ghar Jal projects'],
  ['4 manufacturing units', 'in Sikandrabad, Uttar Pradesh']
]

function PartnerForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const get = (k) => (data.get(k) || '').toString().trim()
    const name = get('name')

    const subject = encodeURIComponent(`Channel partner enquiry from ${name}`)
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${get('phone')}`,
        `Email: ${get('email')}`,
        `Organisation / company: ${get('company') || 'N/A'}`,
        `Address / location: ${get('location') || 'N/A'}`,
        `Registering for: ${get('registering') || 'N/A'}`,
        `Heard about us via: ${get('source') || 'N/A'}`,
        '',
        'Message:',
        get('message') || 'N/A'
      ].join('\n')
    )

    window.location.href = `mailto:${PARTNER_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  if (sent) {
    return (
      <div className="cp-sent" role="status">
        <h3>Thanks, your enquiry is ready to send.</h3>
        <p>Your email app has opened with the details filled in. Send it and our team will get in touch with you.</p>
        <button className="btn btn-dark" onClick={() => setSent(false)}>Start a new enquiry</button>
      </div>
    )
  }

  return (
    <form className="cp-form" onSubmit={handleSubmit}>
      <h2>Channel partner enquiry</h2>
      <p className="cp-form__intro">Fill in the details below and our team will get in touch with you. Fields marked * are required.</p>

      <div className="field">
        <label htmlFor="cp-name">Name *</label>
        <input id="cp-name" type="text" name="name" required autoComplete="name" placeholder="Your full name" />
      </div>
      <div className="cp-row">
        <div className="field">
          <label htmlFor="cp-phone">Phone *</label>
          <input id="cp-phone" type="tel" name="phone" required autoComplete="tel" placeholder="+91" />
        </div>
        <div className="field">
          <label htmlFor="cp-email">Email *</label>
          <input id="cp-email" type="email" name="email" required autoComplete="email" placeholder="you@company.com" />
        </div>
      </div>
      <div className="cp-row">
        <div className="field">
          <label htmlFor="cp-company">Organisation / company</label>
          <input id="cp-company" type="text" name="company" autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="cp-location">Address / location</label>
          <input id="cp-location" type="text" name="location" placeholder="City, state" />
        </div>
      </div>
      <div className="cp-row">
        <div className="field">
          <label htmlFor="cp-registering">Registering for</label>
          <select id="cp-registering" name="registering" defaultValue="">
            <option value="" disabled>Select an option</option>
            {REGISTERING_FOR.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cp-source">How did you hear about us?</label>
          <select id="cp-source" name="source" defaultValue="">
            <option value="" disabled>Select an option</option>
            {HEARD_FROM.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="cp-message">Message</label>
        <textarea id="cp-message" name="message" rows="5" placeholder="Your region, the products you'd like to sell, your current business"></textarea>
      </div>
      <p className="form-email-note">Or email us directly at <a href={`mailto:${PARTNER_EMAIL}`}>{PARTNER_EMAIL}</a>.</p>
      <button className="btn btn-p" type="submit">Submit enquiry</button>
    </form>
  )
}

export default function ChannelPartnerPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="channel-partner">
      <PageHero
        tag="Channel partners"
        heading="Become our channel partner."
        body="Partner with DPL Star and grow your business with our storage, piping and engineering solutions."
      />

      <section className="sec">
        <div className="shell">
          <div className="ct-grid">
            <div><PartnerForm /></div>

            <aside className="cp-side" aria-label="What you'd represent">
              <div className="cp-side__block">
                <div className="sec-tag">What you'd represent</div>
                <ul className="cp-range">
                  {RANGE.map((r) => (
                    <li key={r.title}>
                      <button onClick={() => (Array.isArray(r.page) ? goTo(...r.page) : goTo(r.page))}>
                        <strong>{r.title}</strong>
                        <span>{r.items}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cp-side__block">
                <div className="sec-tag">Track record</div>
                <dl className="cp-proof">
                  {PROOF.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>

              <div className="cp-side__block">
                <div className="sec-tag">Prefer to talk?</div>
                <p className="cp-direct">
                  Call <a href="tel:+919205600125">+91 92056 00125</a> or email <a href={`mailto:${PARTNER_EMAIL}`}>{PARTNER_EMAIL}</a>.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
