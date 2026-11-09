import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { sendContactEmail } from './contact-email.js'
import { sendPartnerEmail } from './channel-partner-email.js'
import { validateCaptchaSubmission, verifyRecaptchaToken } from './captcha.js'
dotenv.config({
  path: ['.env.local', ...(existsSync('.env') ? ['.env'] : [])]
})

const app = express()
const PORT = process.env.PORT || 3001
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Contact API is running' })
})

app.post('/api/contact', async (req, res) => {
  const {
    name,
    email,
    phone,
    message,
    captcha,
    captchaId,
    recaptchaToken
  } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and message are required.'
    })
  }

  const hasRecaptchaSecret = Boolean(process.env.RECAPTCHA_SECRET_KEY)
  const isCaptchaValid = hasRecaptchaSecret
    ? await verifyRecaptchaToken(recaptchaToken)
    : validateCaptchaSubmission(captcha, captchaId)

  if (!isCaptchaValid) {
    return res.status(400).json({
      success: false,
      message: hasRecaptchaSecret
        ? 'Captcha verification failed. Please try again.'
        : 'Captcha verification failed. Please answer the security question correctly.'
    })
  }

  try {
    await sendContactEmail({ name, email, phone, message })

    return res.json({
      success: true,
      message: 'Your enquiry has been sent successfully.'
    })
  } catch (error) {
    if (error.code === 'EMAIL_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured. Set SMTP_USER and SMTP_PASS in the local .env file.'
      })
    }

    console.error('Email sending failed:', error)
    return res.status(500).json({
      success: false,
      message: 'Unable to send the message right now. Please email info@dplstar.com directly.'
    })
  }
})


app.post('/api/channel-partner', async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    location,
    registering,
    source,
    message,
    captcha,
    captchaId,
    recaptchaToken
  } = req.body || {}

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and phone are required.'
    })
  }

  const hasRecaptchaSecret = Boolean(process.env.RECAPTCHA_SECRET_KEY)
  const isCaptchaValid = hasRecaptchaSecret
    ? await verifyRecaptchaToken(recaptchaToken)
    : validateCaptchaSubmission(captcha, captchaId)

  if (!isCaptchaValid) {
    return res.status(400).json({
      success: false,
      message: hasRecaptchaSecret
        ? 'Captcha verification failed. Please try again.'
        : 'Captcha verification failed. Please answer the security question correctly.'
    })
  }

  try {
    const result = await sendPartnerEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      company,
      location,
      registering,
      source,
      message
    })

    return res.json({
      success: true,
      confirmationSent: result.confirmationSent,
      message: 'Channel partner enquiry submitted successfully.'
    })
  } catch (error) {
    console.error('Channel partner email failed:', error)

    return res.status(
      error.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 500
    ).json({
      success: false,
      message: 'Unable to submit your enquiry. Please try again.'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Contact API running on http://localhost:${PORT}`)
})
