#!/usr/bin/env node
/**
 * Configures CORS on the cohort R2 bucket for browser PUT uploads and GET downloads.
 *
 * Required env:
 * - CLOUDFLARE_API_TOKEN (or CF_API_TOKEN) — R2-capable API token
 * - R2_BUCKET (default: cohort)
 *
 * Optional:
 * - CLOUDFLARE_ACCOUNT_ID (default: parsed from R2_ENDPOINT or 22a71324...)
 * - R2_CORS_ORIGINS — comma-separated origins (defaults include localhost + prod app URL)
 */

const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  process.env.R2_ACCOUNT_ID ||
  '22a71324a2f74f52ed2169281602fd15'
const bucket = process.env.R2_BUCKET || 'cohort'
const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN

const defaultOrigins = [
  'http://localhost:3000',
  'https://cohort-omega-five.vercel.app',
  'https://grand-sparrow-698.convex.site',
  'https://deafening-impala-890.convex.site',
]

const origins = (process.env.R2_CORS_ORIGINS || defaultOrigins.join(','))
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN (R2-capable Cloudflare API token).')
  process.exit(1)
}

const body = {
  rules: [
    {
      allowed: {
        origins,
        methods: ['GET', 'PUT', 'HEAD'],
        headers: ['Content-Type'],
      },
      exposeHeaders: ['ETag'],
      maxAgeSeconds: 3600,
    },
  ],
}

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/cors`,
  {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  },
)

const json = await response.json()
if (!response.ok || !json.success) {
  console.error('Failed to configure R2 CORS:', JSON.stringify(json, null, 2))
  process.exit(1)
}

console.log(`R2 CORS updated for bucket "${bucket}" with origins:`)
for (const origin of origins) {
  console.log(`  - ${origin}`)
}
