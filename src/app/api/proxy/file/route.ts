import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { ValidationError, ForbiddenError, ServiceUnavailableError } from '@/lib/api-errors'

const ALLOWED_DOMAINS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'storage.cloud.google.com',
])

function isAllowedHostname(hostname: string): boolean {
  // Only allow exact matches or subdomains of the allowlist.
  // Prevents things like "firebasestorage.googleapis.com.evil.com".
  for (const domain of ALLOWED_DOMAINS) {
    if (hostname === domain) return true
    if (hostname.endsWith(`.${domain}`)) return true
  }
  return false
}

export const GET = createApiHandler({
  auth: 'required',
  querySchema: z.object({
    url: z.string().url('Invalid URL format')
  })
}, async (req, { query }) => {
  const { url: fileUrl } = query

  // Validate URL is from allowed domains
  const parsedUrl = new URL(fileUrl)
  if (!isAllowedHostname(parsedUrl.hostname)) {
    throw new ForbiddenError('URL domain not allowed')
  }

  // Fetch the file from Firebase Storage
  const upstream = await fetch(fileUrl, {
    headers: {
      // Help upstream pick the right representation.
      Accept:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream,*/*',
    },
  })

  if (!upstream.ok) {
    throw new ServiceUnavailableError(`Failed to fetch file: ${upstream.status}`)
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
  const contentLength = upstream.headers.get('content-length')
  const filename = decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'file')

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    // Avoid caching private files in shared caches.
    'Cache-Control': 'private, max-age=3600',
    'Content-Disposition': `inline; filename="${filename}"`,
  }

  if (contentLength) {
    headers['Content-Length'] = contentLength
  }

  return new Response(upstream.body, {
    status: 200,
    headers,
  })
})
