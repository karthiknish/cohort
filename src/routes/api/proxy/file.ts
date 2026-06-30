import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { ForbiddenError, ServiceUnavailableError } from '@/lib/api-errors'

const ALLOWED_DOMAINS = new Set([
  'storage.googleapis.com',
  'storage.cloud.google.com',
])

function isAllowedR2PublicHost(hostname: string): boolean {
  return hostname.endsWith('.r2.dev') || hostname.endsWith('.r2.cloudflarestorage.com')
}

function sanitizeFilename(value: string): string {
  const sanitized = value
    .replace(/[\r\n]/g, '')
    .replace(/["\\/;:]/g, '_')
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code > 0x1f && code !== 0x7f
    })
    .join('')
    .trim()
  return sanitized.length > 0 ? sanitized : 'file'
}

function encodeContentDispositionFilename(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function isAllowedHostname(hostname: string): boolean {
  if (isAllowedR2PublicHost(hostname)) return true
  for (const domain of ALLOWED_DOMAINS) {
    if (hostname === domain) return true
    if (hostname.endsWith(`.${domain}`)) return true
  }
  return false
}

const handlers = adaptApiHandler(
  {
    auth: 'required',
    querySchema: z.object({
      url: z.string().url('Invalid URL format'),
    }),
  },
  async (req, { query }) => {
    const { url: fileUrl } = query
    const parsedUrl = new URL(fileUrl)
    if (!isAllowedHostname(parsedUrl.hostname)) {
      throw new ForbiddenError('URL domain not allowed')
    }
    const upstream = await fetch(fileUrl, {
      cache: 'no-store',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream,*/*',
      },
    })
    if (!upstream.ok) {
      throw new ServiceUnavailableError(`Failed to fetch file: ${upstream.status}`)
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const contentLength = upstream.headers.get('content-length')
    const rawFilename = decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'file')
    const filename = sanitizeFilename(rawFilename)
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': `inline; filename="${filename}"; filename*=UTF-8''${encodeContentDispositionFilename(filename)}`,
    }
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    return new Response(upstream.body, { status: 200, headers })
  },
)

export const Route = createFileRoute('/api/proxy/file')({
  server: { handlers },
})
