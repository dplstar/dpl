import { useEffect, useState } from 'react'
import { getCaptchaChallenge, validateCaptchaSubmission } from '../../captcha.js'
import './ContactForm.css'

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3-script'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaChallenge, setCaptchaChallenge] = useState(() => getCaptchaChallenge())
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const recaptchaSiteKey = (() => {
    const configuredKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
    if (configuredKey) {
      return configuredKey
    }

    if (typeof window !== 'undefined') {
      return window.DPL_RECAPTCHA_SITE_KEY || ''
    }

    return ''
  })()
  const recaptchaEnabled = Boolean(recaptchaSiteKey && recaptchaReady && typeof window !== 'undefined' && window.grecaptcha)

  useEffect(() => {
    if (!recaptchaSiteKey || typeof document === 'undefined') {
      return
    }

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID)
    if (existingScript) {
      if (window.grecaptcha) {
        setRecaptchaReady(true)
      }
      return
    }

    const script = document.createElement('script')
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
    script.async = true
    script.defer = true
    script.onload = () => setRecaptchaReady(true)
    document.body.appendChild(script)
  }, [recaptchaSiteKey])

  function refreshCaptcha() {
    setCaptchaChallenge(getCaptchaChallenge())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const captchaValue = (formData.get('captcha') || '').toString().trim()

    if (!recaptchaEnabled && !validateCaptchaSubmission(captchaValue, captchaChallenge.id)) {
      setError('Captcha verification failed. Please answer the security question correctly.')
      setCaptchaChallenge(getCaptchaChallenge())
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      message: (formData.get('message') || '').toString().trim()
    }

    if (recaptchaEnabled) {
      try {
        const token = await new Promise((resolve, reject) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(recaptchaSiteKey, { action: 'contact' })
              .then(resolve)
              .catch(reject)
          })
        })
        payload.recaptchaToken = token
      } catch (captchaError) {
        setError('Captcha verification failed. Please try again.')
        setIsSubmitting(false)
        return
      }
    } else {
      payload.captcha = captchaValue
      payload.captchaId = captchaChallenge.id
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
      setCaptchaChallenge(getCaptchaChallenge())
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startNewEnquiry() {
    setSubmitted(false)
    setError('')
    setCaptchaChallenge(getCaptchaChallenge())
  }

  if (submitted) {
    return (
      <div id="ct-ok" className="ct-success" role="status">
        <div className="ct-success-icon" aria-hidden="true">
          ✓
        </div>

        <h3>Thank You for Your Enquiry!</h3>

        <p>
          We have received your message successfully. Our team will review
          your enquiry and get back to you soon.
        </p>

        <button
          className="btn btn-p"
          type="button"
          onClick={startNewEnquiry}
        >
          Start a New Enquiry
        </button>
      </div>
    )
  }

  return (
    <form id="ct-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          placeholder="Your full name"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          placeholder="you@company.com"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-phone">Phone</label>
        <input
          id="contact-phone"
          type="tel"
          name="phone"
          placeholder="+91"
        />
      </div>

      <div className="field">
        <label htmlFor="contact-message">
          What are you storing, and how much?
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          required
          placeholder="e.g. 1,00,000 L raw water for a municipal project in Bihar"
        />
      </div>

      {!recaptchaEnabled && (
        <div className="field captcha-field">
          <label htmlFor="contact-captcha">Security check</label>
          <div className="captcha-box">
            <span className="captcha-question">{captchaChallenge.question}</span>
            <button
              type="button"
              className="captcha-refresh"
              onClick={refreshCaptcha}
              aria-label="Refresh security question"
            >
              ↻
            </button>
          </div>
          <input
            id="contact-captcha"
            type="number"
            name="captcha"
            required
            inputMode="numeric"
            min="0"
            placeholder="Enter the answer"
          />
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: '#d32f2f', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <p className="form-email-note">
        Or email us directly at{' '}
        <a href="mailto:info@dplstar.com">info@dplstar.com</a>
      </p>

      <button className="btn btn-p" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Submit enquiry'}
      </button>
    </form>
  )
}






// import { useState } from 'react'
// import './ContactForm.css'

// export default function ContactForm() {
//   const [submitted, setSubmitted] = useState(false)
//   const [error, setError] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setError('')
//     setIsSubmitting(true)

//     const form = e.currentTarget
//     const formData = new FormData(form)
//     const payload = {
//       name: (formData.get('name') || '').toString().trim(),
//       email: (formData.get('email') || '').toString().trim(),
//       phone: (formData.get('phone') || '').toString().trim(),
//       message: (formData.get('message') || '').toString().trim()
//     }

//     try {
//       const response = await fetch('/api/contact', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       })

//       const responseText = await response.text()
//       let data

//       try {
//         data = JSON.parse(responseText)
//       } catch {
//         throw new Error(
//           `Contact service returned an unexpected response (HTTP ${response.status}). Please try again or email info@dplstar.com.`
//         )
//       }

//       if (!response.ok || !data.success) {
//         throw new Error(data.message || 'Unable to send enquiry.')
//       }

//       form.reset()
//       setSubmitted(true)
//     } catch (submitError) {
//       setError(submitError.message || 'Something went wrong. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (submitted) {
//     return (
//       <div id="ct-ok" style={{ display: 'block' }}>
//         <h3 style={{ marginBottom: '10px' }}>Message received.</h3>
//         <p style={{ color: 'var(--muted-light)' }}>Thank you. Your enquiry has been submitted successfully.</p>
//       </div>
//     )
//   }

//   return (
//     <form id="ct-form" onSubmit={handleSubmit}>
//       <div className="field">
//         <label>Name</label>
//         <input type="text" name="name" required placeholder="Your full name" />
//       </div>
//       <div className="field">
//         <label>Email</label>
//         <input type="email" name="email" required placeholder="you@company.com" />
//       </div>
//       <div className="field">
//         <label>Phone</label>
//         <input type="tel" name="phone" placeholder="+91" />
//       </div>
//       <div className="field">
//         <label>What are you storing, and how much?</label>
//         <textarea name="message" rows="5" required placeholder="e.g. 1,00,000 L raw water for a municipal project in Bihar"></textarea>
//       </div>
//       {error && (
//         <p style={{ color: '#d32f2f', marginBottom: '12px' }}>{error}</p>
//       )}
//       <p className="form-email-note">Or email us directly at <a href="mailto:info@dplstar.com">info@dplstar.com</a></p>
//       <button className="btn btn-p" type="submit" disabled={isSubmitting}>
//         {isSubmitting ? 'Sending...' : 'Submit enquiry'}
//       </button>
//     </form>
//   )
// }
