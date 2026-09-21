import { useState } from 'react'
import './ContactForm.css'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = (formData.get('name') || '').toString().trim() || 'N/A'
    const email = (formData.get('email') || '').toString().trim() || 'N/A'
    const phone = (formData.get('phone') || '').toString().trim() || 'N/A'
    const message = (formData.get('message') || '').toString().trim() || 'N/A'

    const subject = encodeURIComponent(`New enquiry from ${name}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nProject details:\n${message}`
    )

    window.location.href = `mailto:info@dplstar.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div id="ct-ok" style={{ display: 'block' }}>
        <h3 style={{ marginBottom: '10px' }}>Message received.</h3>
        <p style={{ color: 'var(--muted-light)' }}>Your email client opened to send the enquiry to info@dplstar.com.</p>
      </div>
    )
  }

  return (
    <form id="ct-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Name</label>
        <input type="text" name="name" required placeholder="Your full name" />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" name="email" required placeholder="you@company.com" />
      </div>
      <div className="field">
        <label>Phone</label>
        <input type="tel" name="phone" placeholder="+91" />
      </div>
      <div className="field">
        <label>What are you storing, and how much?</label>
        <textarea name="message" rows="5" placeholder="e.g. 1,00,000 L raw water for a municipal project in Bihar"></textarea>
      </div>
      <p className="form-email-note">Or email us directly at <a href="mailto:info@dplstar.com">info@dplstar.com</a>.</p>
      <button className="btn btn-p" type="submit">Submit enquiry</button>
    </form>
  )
}
