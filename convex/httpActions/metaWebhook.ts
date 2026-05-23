import { httpAction } from '../_generated/server'
import { internal } from '../_generated/api'
import { assertMetaWebhookSignature, assertMetaWebhookVerifyToken } from '../lib/metaWebhookAuth'

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain' },
  })
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

type MetaWebhookChange = {
  field: string | null
  value: unknown
  verb: string | null
}

type MetaWebhookEntry = {
  id: string | null
  time: number | null
  changes: MetaWebhookChange[]
}

function normalizeEntries(payload: Record<string, unknown>): MetaWebhookEntry[] {
  const rawEntries = Array.isArray(payload.entry) ? payload.entry : []
  return rawEntries.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const record = entry as Record<string, unknown>
    const changes = Array.isArray(record.changes) ? record.changes : []
    return [
      {
        id: typeof record.id === 'string' ? record.id : null,
        time: typeof record.time === 'number' ? record.time : null,
        changes: changes.flatMap((change) => {
          if (!change || typeof change !== 'object') return []
          const changeRecord = change as Record<string, unknown>
          return [
            {
              field: typeof changeRecord.field === 'string' ? changeRecord.field : null,
              value: changeRecord.value ?? null,
              verb: typeof changeRecord.verb === 'string' ? changeRecord.verb : null,
            },
          ]
        }),
      },
    ]
  })
}

export const metaWebhook = httpAction(async (ctx, request) => {
  if (request.method === 'GET') {
    const url = new URL(request.url)
    const mode = url.searchParams.get('hub.mode')
    const verifyToken = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode !== 'subscribe' || !challenge) {
      return jsonResponse({ error: 'Invalid subscription request' }, 400)
    }

    try {
      assertMetaWebhookVerifyToken(verifyToken)
    } catch {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    return textResponse(challenge)
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const rawBody = await request.text()

  try {
    await assertMetaWebhookSignature(rawBody, request.headers.get('X-Hub-Signature-256'))
  } catch {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch (error) {
    console.error('[httpActions:metaWebhook] Invalid JSON payload', error)
    return jsonResponse({ error: 'Invalid JSON payload' }, 400)
  }

  const entries = normalizeEntries(payload)

  try {
    const result = await ctx.runMutation(internal.metaWebhookEvents.ingestMetaWebhookPayload, {
      entries,
      rawPayload: payload,
    })
    return jsonResponse({ received: true, inserted: result.inserted })
  } catch (error) {
    console.error('[httpActions:metaWebhook] Failed to persist webhook payload', error)
    return jsonResponse({ received: true, inserted: 0 }, 202)
  }
})
