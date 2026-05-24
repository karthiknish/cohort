#!/usr/bin/env node
/**
 * Ensures config/ci.env only contains obvious CI placeholders (not real secrets).
 * Run in CI after copying to .env.local.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CI_ENV_PATH = resolve(process.cwd(), 'config/ci.env')
const SECRET_KEYS = [
  'BETTER_AUTH_SECRET',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'GEMINI_API_KEY',
  'GAMMA_API_KEY',
  'META_APP_SECRET',
  'GOOGLE_ADS_CLIENT_SECRET',
  'TIKTOK_CLIENT_SECRET',
  'INTEGRATIONS_CRON_SECRET',
  'METRIC_SECRET',
  'WHATSAPP_BUSINESS_ACCESS_TOKEN',
]

const PLACEHOLDER_PREFIX = 'ci-'
const PLACEHOLDER_URL_HOSTS = [
  'localhost',
  'example.com',
  'ci.example.com',
  'ci-convex.convex.cloud',
  'ci-convex.convex.site',
]

function isPlaceholderValue(key, value) {
  if (!value || value.trim() === '') return false
  if (SECRET_KEYS.includes(key)) {
    return value.startsWith(PLACEHOLDER_PREFIX)
  }
  if (key.endsWith('_URL') || key.endsWith('_URI')) {
    try {
      const host = new URL(value).hostname
      return PLACEHOLDER_URL_HOSTS.some((h) => host === h || host.endsWith('.example.com'))
    } catch {
      return false
    }
  }
  return true
}

const raw = readFileSync(CI_ENV_PATH, 'utf8')
const violations = []

for (const line of raw.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const value = trimmed.slice(eq + 1).trim()
  if (!isPlaceholderValue(key, value)) {
    violations.push(`${key}=${value.slice(0, 24)}…`)
  }
}

if (violations.length > 0) {
  console.error('[verify-ci-env] config/ci.env must use ci-* placeholders for secrets and example URLs for webhooks:')
  for (const v of violations) console.error(`  - ${v}`)
  process.exit(1)
}

console.log('[verify-ci-env] OK — config/ci.env uses CI placeholders only')
