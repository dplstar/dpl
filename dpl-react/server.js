import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { sendContactEmail } from './contact-email.js'

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
  const { name, email, phone, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and message are required.'
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

app.listen(PORT, () => {
  console.log(`Contact API running on http://localhost:${PORT}`)
})
