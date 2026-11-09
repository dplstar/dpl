export const CAPTCHA_CHALLENGES = [
  { id: 'captcha-1', question: 'What is 7 + 4?', answer: 11 },
  { id: 'captcha-2', question: 'What is 12 - 5?', answer: 7 },
  { id: 'captcha-3', question: 'What is 9 + 6?', answer: 15 },
  { id: 'captcha-4', question: 'What is 18 - 9?', answer: 9 },
  { id: 'captcha-5', question: 'What is 5 + 8?', answer: 13 },
  { id: 'captcha-6', question: 'What is 14 - 6?', answer: 8 }
]

export function getCaptchaChallenge() {
  const randomIndex = Math.floor(Math.random() * CAPTCHA_CHALLENGES.length)
  return CAPTCHA_CHALLENGES[randomIndex]
}

export function validateCaptchaSubmission(answer, challengeId) {
  const challenge = CAPTCHA_CHALLENGES.find((item) => item.id === challengeId)
  if (!challenge) {
    return false
  }

  const parsedAnswer = Number(String(answer).trim())
  return Number.isFinite(parsedAnswer) && parsedAnswer === challenge.answer
}

export async function verifyRecaptchaToken(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  const normalizedToken = String(token || '').trim()

  if (!secretKey || !normalizedToken) {
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: normalizedToken
      }).toString()
    })

    const payload = await response.json()
    const minimumScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0.5')

    return Boolean(payload.success) && Number(payload.score || 0) >= minimumScore
  } catch (error) {
    console.error('Recaptcha verification failed:', error)
    return false
  }
}
