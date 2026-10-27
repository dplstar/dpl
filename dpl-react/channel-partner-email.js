
import nodemailer from 'nodemailer'

export async function sendPartnerEmail({
  name,
  email,
  phone,
  company,
  location,
  registering,
  source,
  message
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error('Email service is not configured.')
    error.code = 'EMAIL_NOT_CONFIGURED'
    throw error
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const teamEmail = process.env.SMTP_PARTNER_TO || 'info@dplstar.com'

  await transporter.verify()

  
  await transporter.sendMail({
    from,
    to: teamEmail,
    cc: (process.env.SMTP_CC || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    replyTo: email,
    subject: `Channel Partner Enquiry from ${name}`,
    text: `
Name: ${name}
Phone: ${phone}
Email: ${email}
Organisation: ${company || 'N/A'}
Location: ${location || 'N/A'}
Registering for: ${registering || 'N/A'}
Heard about us via: ${source || 'N/A'}

Message:
${message || 'N/A'}
`
  })

  // Send confirmation to the user
  let confirmationSent = false

  try {
    await transporter.sendMail({
      from,
      to: email,
      replyTo: teamEmail,
      subject: 'Thank You for Your Channel Partner Enquiry - DPL Star',
      text: `Dear ${name},

Thank you for your interest in becoming a DPL Star channel partner.

We have received your enquiry successfully. Our team will review your details and contact you regarding the next steps.

Best regards,
DPL Star Team
${teamEmail}
https://dplstar.com`
    })

    confirmationSent = true
  } catch (error) {
    console.error('Partner confirmation email failed:', error)
  }

  return { confirmationSent }
}
