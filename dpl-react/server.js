import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'

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

  const mailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  }

  const toAddress = process.env.SMTP_TO || 'info@dplstar.com'
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost'
  const ccAddresses = (process.env.SMTP_CC || 'gcaffe.shashank@gmail.com, gcaffe.abhishek@gmail.com')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const mailPayload = {
    from: fromAddress,
    to: toAddress,
    cc: ccAddresses,
    replyTo: email,
    subject: `New enquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      '',
      'Project details:',
      message
    ].join('\n')
  }

  if (!mailConfig.auth) {
    return res.status(503).json({
      success: false,
      message: 'Email service is not configured. Set SMTP_USER and SMTP_PASS in the local .env file.'
    })
  }

  try {
    const transporter = nodemailer.createTransport(mailConfig)
    await transporter.verify()
    await transporter.sendMail(mailPayload)

    return res.json({
      success: true,
      message: 'Your enquiry has been sent successfully.'
    })
  } catch (error) {
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
