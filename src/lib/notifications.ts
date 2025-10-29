interface ContactPayload {
  name: string
  email: string
  company: string | null
  message: string
}

const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL
const SLACK_WEBHOOK_URL = process.env.CONTACT_SLACK_WEBHOOK_URL

export async function notifyContactEmail(payload: ContactPayload) {
  if (!EMAIL_WEBHOOK_URL) {
    console.info('[notifications] email webhook not configured, skipping')
    return
  }

  try {
    await fetch(EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact.created', payload }),
    })
  } catch (error) {
    console.error('[notifications] email webhook failed', error)
  }
}

export async function notifyContactSlack(payload: ContactPayload) {
  if (!SLACK_WEBHOOK_URL) {
    console.info('[notifications] slack webhook not configured, skipping')
    return
  }

  const text = `:wave: *New contact message*\n*Name:* ${payload.name}\n*Email:* ${payload.email}\n*Company:* ${payload.company ?? '—'}\n*Message:* ${payload.message}`

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    console.error('[notifications] slack webhook failed', error)
  }
}
