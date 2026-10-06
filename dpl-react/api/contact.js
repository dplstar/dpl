import { sendContactEmail } from '../contact-email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    })
  }

  const { name, email, phone, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and message are required.'
    })
  }

  try {
    await sendContactEmail({ name, email, phone, message })
    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been sent successfully.'
    })
  } catch (error) {
    if (error.code === 'EMAIL_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured. Set the SMTP environment variables in Vercel.'
      })
    }

    console.error('Email sending failed:', error)
    return res.status(500).json({
      success: false,
      message: 'Unable to send the message right now. Please email info@dplstar.com directly.'
    })
  }
}
