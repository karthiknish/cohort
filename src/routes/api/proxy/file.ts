import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { ForbiddenError, ServiceUnavailableError } from '@/lib/api-errors'
import { logError, logWarning, asErrorMessage } from '@/lib/convex-errors'

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

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 300

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        cache: 'no-store',
        redirect: 'follow',
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream,*/*',
        },
      })
      if (resp.ok) return resp
      // Log non-ok responses for debugging
      logWarning(`[proxy/file] Upstream returned ${resp.status} (attempt ${attempt + 1}/${retries + 1}) for ${url.substring(0, 120)}...`)
      // Retry on 5xx (transient server errors)
      if (resp.status >= 500 && attempt < retries) {
        lastError = new Error(`Upstream returned ${resp.status}`)
        // Consume the body to avoid leaking the stream
        await resp.text().catch(() => {})
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
        continue
      }
      return resp
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(asErrorMessage(err))
      logWarning(`[proxy/file] Fetch error (attempt ${attempt + 1}/${retries + 1}): ${lastError.message}`)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
        continue
      }
    }
  }
  throw lastError ?? new Error('Fetch failed after retries')
}

const handlers = adaptApiHandler(
  {
    auth: 'required',
    querySchema: z.object({
      url: z.string().url('Invalid URL format'),
      filename: z.string().optional(),
      download: z.string().optional(),
    }),
  },
  async (req, { query }) => {
    const { url: fileUrl, filename: overrideFilename, download: downloadParam } = query
    const parsedUrl = new URL(fileUrl)
    if (!isAllowedHostname(parsedUrl.hostname)) {
      throw new ForbiddenError('URL domain not allowed')
    }
    let upstream: Response
    try {
      upstream = await fetchWithRetry(fileUrl)
    } catch (err) {
      const msg = asErrorMessage(err)
      logError(err, '[proxy/file] All retries exhausted')
      throw new ServiceUnavailableError('File storage is temporarily unavailable. Please try again.')
    }
    if (!upstream.ok) {
      if (upstream.status === 403) {
        // Signed URL has expired — the client needs to request a fresh URL
        throw new ServiceUnavailableError('FILE_URL_EXPIRED')
      }
      throw new ServiceUnavailableError(`Failed to fetch file: ${upstream.status}`)
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const rawFilename = overrideFilename || decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'file')
    const filename = sanitizeFilename(rawFilename)
    // Use attachment disposition when download param is present or filename is overridden,
    // so the browser saves the file with the correct extension instead of ignoring
    // the download attribute on cross-origin URLs.
    const disposition = downloadParam !== undefined || overrideFilename ? 'attachment' : 'inline'
    // Read the full body as arrayBuffer — streaming (upstream.body) can fail
    // in some server environments (Nitro/Vinxi) due to web stream compatibility
    const bodyBuffer = await upstream.arrayBuffer()
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeContentDispositionFilename(filename)}`,
      'Content-Length': String(bodyBuffer.byteLength),
    }
    return new Response(bodyBuffer, { status: 200, headers })
  },
)

export const Route = createFileRoute('/api/proxy/file')({
  server: { handlers },
})
