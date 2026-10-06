import { useState } from 'react'
import './ContactForm.css'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      message: (formData.get('message') || '').toString().trim()
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(
          `Contact service returned an unexpected response (HTTP ${response.status}). Please try again or email info@dplstar.com.`
        )
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send enquiry.')
      }

      form.reset()
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div id="ct-ok" style={{ display: 'block' }}>
        <h3 style={{ marginBottom: '10px' }}>Message received.</h3>
        <p style={{ color: 'var(--muted-light)' }}>Thank you. Your enquiry has been submitted successfully.</p>
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
        <textarea name="message" rows="5" required placeholder="e.g. 1,00,000 L raw water for a municipal project in Bihar"></textarea>
      </div>
      {error && (
        <p style={{ color: '#d32f2f', marginBottom: '12px' }}>{error}</p>
      )}
      <p className="form-email-note">Or email us directly at <a href="mailto:info@dplstar.com">info@dplstar.com</a>.</p>
      <button className="btn btn-p" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Submit enquiry'}
      </button>
    </form>
  )
}
