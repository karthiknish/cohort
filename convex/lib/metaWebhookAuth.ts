import { Errors } from '../errors'

import { isDeployedConvexEnvironment } from './webhookAuth'

export function assertMetaWebhookVerifyToken(provided: string | null | undefined): void {
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN
  if (!expected || expected.length === 0) {
    if (isDeployedConvexEnvironment()) {
      throw Errors.base.internal('META_WEBHOOK_VERIFY_TOKEN is not configured')
    }
    return
  }

  if (!provided || provided !== expected) {
    throw Errors.auth.unauthorized('Invalid Meta webhook verify token')
  }
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function assertMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<void> {
  const secret = process.env.META_APP_SECRET
  if (!secret || secret.length === 0) {
    if (isDeployedConvexEnvironment()) {
      throw Errors.base.internal('META_APP_SECRET is not configured')
    }
    return
  }

  if (!signatureHeader?.startsWith('sha256=')) {
    throw Errors.auth.unauthorized('Missing Meta webhook signature')
  }

  const provided = signatureHeader.slice('sha256='.length)
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = bytesToHex(digest)

  if (provided.length !== expected.length) {
    throw Errors.auth.unauthorized('Invalid Meta webhook signature')
  }

  let mismatch = 0
  for (let index = 0; index < provided.length; index += 1) {
    mismatch |= provided.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  if (mismatch !== 0) {
    throw Errors.auth.unauthorized('Invalid Meta webhook signature')
  }
}
