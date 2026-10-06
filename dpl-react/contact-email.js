import nodemailer from 'nodemailer'

export async function sendContactEmail({ name, email, phone, message }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error('Email service is not configured.')
    error.code = 'EMAIL_NOT_CONFIGURED'
    throw error
  }

  const mailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }

  const transporter = nodemailer.createTransport(mailConfig)
  await transporter.verify()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.SMTP_TO || 'info@dplstar.com',
    cc: (process.env.SMTP_CC || 'gcaffe.shashank@gmail.com, gcaffe.abhishek@gmail.com')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
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
  })
}
