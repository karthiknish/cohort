import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'

import { ServiceUnavailableError } from '@/lib/api-errors'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function ensureSecret(stage: string): Buffer {
  const secret = process.env.METRIC_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new ServiceUnavailableError(
      `Missing encryption secret (${stage}). Set METRIC_SECRET (recommended) or JWT_SECRET or NEXTAUTH_SECRET.`
    )
  }
  return createHash('sha256').update(secret).digest()
}

export function encrypt(value: string): string {
  const key = ensureSecret('encrypt')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const key = ensureSecret('decrypt')
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Generates a random code verifier for PKCE.
 * A high-entropy cryptographic random string.
 */
export function generateCodeVerifier(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const bytes = randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i]! % charset.length]!
  }
  return result
}

/**
 * Generates a code challenge from a code verifier using SHA-256.
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
