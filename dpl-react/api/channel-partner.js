
import { validateCaptchaSubmission, verifyRecaptchaToken } from '../captcha.js'
import {sendPartnerEmail} from '../channel-partner-email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      message: 'Use POST to submit a channel partner enquiry.'
    })
  }

  try {
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

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof phone !== 'string' || !phone.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone are required.'
      })
    }

    const hasRecaptchaSecret = Boolean(process.env.RECAPTCHA_SECRET_KEY)
    const isCaptchaValid = hasRecaptchaSecret
      ? await verifyRecaptchaToken(recaptchaToken, 'channel_partner')
      : validateCaptchaSubmission(captcha, captchaId)

    if (!isCaptchaValid) {
      return res.status(400).json({
        success: false,
        message: hasRecaptchaSecret
          ? 'Captcha verification failed. Please try again.'
          : 'Captcha verification failed. Please answer the security question correctly.'
      })
    }

    const result = await sendPartnerEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company,
      location,
      registering,
      source,
      message
    })

    return res.status(200).json({
      success: true,
      confirmationSent: result.confirmationSent,
      message: 'Channel partner enquiry submitted successfully.'
    })
  } catch (error) {
    console.error('Channel partner API error:', error)

    return res.status(
      error.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 500
    ).json({
      success: false,
      message: error.code === 'EMAIL_NOT_CONFIGURED'
        ? 'Email service is not configured.'
        : 'Unable to submit your enquiry. Please try again.'
    })
  }
}
