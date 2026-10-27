
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

  // const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const from = {
  name: 'DPL Star',
  address: process.env.SMTP_USER
}

  // 1. Send the enquiry notification to your team
  await transporter.sendMail({
    from,
    to: process.env.SMTP_TO || 'info@dplstar.com',
    cc: (process.env.SMTP_CC || 'aakash@dplstar.com, gcaffe.abhishek@gmail.com')
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

  // 2. Send a confirmation email to the customer
  try {
    await transporter.sendMail({
      from,
      to: email,
      replyTo: process.env.SMTP_TO || 'info@dplstar.com',
      subject: 'Thank you for contacting DPL Star',
      text: `Dear ${name},

Thank you for contacting DPL Star.

We have received your enquiry successfully. Our team will review your requirements and get back to you as soon as possible.

Here is a summary of your submission:

Name: ${name}
Phone: ${phone || 'Not provided'}
Project details:
${message}

If you have any additional information to share, please reply to this email.

Best regards,
DPL Star Team
info@dplstar.com
https://dplstar.com`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.7; border: 1px solid #e5e7eb;">
          <div style="background: #12365a; padding: 25px 30px; color: #ffffff;">
            <h2 style="margin: 0;">DPL Star</h2>
            <p style="margin: 6px 0 0;">Thank you for contacting us</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #12365a; margin-top: 0;">
              Hello ${escapeHtml(name)},
            </h2>

            <p>
              Thank you for reaching out to DPL Star. We have successfully
              received your enquiry.
            </p>

            <p>
              Our team will review your requirements and get back to you
              as soon as possible.
            </p>

            <div style="background: #f5f7fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #12365a;">Your enquiry summary</h3>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
              <p style="margin-bottom: 0;"><strong>Project details:</strong><br />
                ${escapeHtml(message).replace(/\r?\n/g, '<br />')}
              </p>
            </div>

            <p>
              If you have any additional information to share, simply reply
              to this email.
            </p>

            <p style="margin-top: 30px;">
              Best regards,<br />
              <strong>DPL Star Team</strong><br />
              <a href="mailto:info@dplstar.com" style="color: #12365a;">
                info@dplstar.com
              </a>
            </p>
          </div>

          <div style="background: #f5f7fa; padding: 15px 30px; font-size: 12px; color: #666;">
            This is an automatic confirmation that your enquiry was received.
          </div>
        </div>
      `
    })
  } catch (error) {
    
    console.error('Customer confirmation email failed:', error)
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}












// import nodemailer from 'nodemailer'

// export async function sendContactEmail({ name, email, phone, message }) {
//   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     const error = new Error('Email service is not configured.')
//     error.code = 'EMAIL_NOT_CONFIGURED'
//     throw error
//   }

//   const mailConfig = {
//     host: process.env.SMTP_HOST || 'smtp.gmail.com',
//     port: Number(process.env.SMTP_PORT || 465),
//     secure: String(process.env.SMTP_SECURE || 'false') === 'true',
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS
//     }
//   }

//   const transporter = nodemailer.createTransport(mailConfig)
//   await transporter.verify()
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM || process.env.SMTP_USER,
//     to: process.env.SMTP_TO || 'info@dplstar.com',
//     cc: (process.env.SMTP_CC || 'gcaffe.shashank@gmail.com, gcaffe.abhishek@gmail.com')
//       .split(',')
//       .map((item) => item.trim())
//       .filter(Boolean),
//     replyTo: email,
//     subject: `New enquiry from ${name}`,
//     text: [
//       `Name: ${name}`,
//       `Email: ${email}`,
//       `Phone: ${phone || 'N/A'}`,
//       '',
//       'Project details:',
//       message
//     ].join('\n')
//   })
// }








