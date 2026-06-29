import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { ForbiddenError, ServiceUnavailableError } from '@/lib/api-errors'
import { fetchWithTimeout, isTimeoutError } from '@/lib/retry-utils'

const ALLOWED_DOMAINS = [
  'storage.googleapis.com',
  'public-api.gamma.app',
  'gamma.app',
]

function validateProxiedHost(hostname: string): boolean {
  if (hostname.endsWith('.r2.dev') || hostname.endsWith('.r2.cloudflarestorage.com')) {
    return true
  }
  return ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )
}

const querySchema = z.object({
  url: z.string().url('Invalid URL format'),
})

const FILE_PROXY_TIMEOUT_MS = 20000

const HEAD = adaptApiHandler(
  { auth: 'required', querySchema },
  async (req, { query }) => {
    const { url } = query
    const parsedUrl = new URL(url)
    if (!validateProxiedHost(parsedUrl.hostname)) {
      throw new ForbiddenError('URL domain not allowed')
    }
    let response: Response
    try {
      response = await fetchWithTimeout(url, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          Accept:
            'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
        },
        timeoutMs: FILE_PROXY_TIMEOUT_MS,
        timeoutMessage: 'Timed out while fetching remote file metadata.',
      })
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new ServiceUnavailableError('Timed out while fetching file metadata')
      }
      throw error
    }
    if (!response.ok) {
      throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`)
    }
    const contentType =
      response.headers.get('content-type') ||
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    const contentLength = response.headers.get('content-length')
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
    }
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    return new Response(null, { status: 200, headers })
  },
)

const GET = adaptApiHandler(
  { auth: 'required', querySchema },
  async (req, { query }) => {
    const { url } = query
    const parsedUrl = new URL(url)
    if (!validateProxiedHost(parsedUrl.hostname)) {
      throw new ForbiddenError('URL domain not allowed')
    }
    let response: Response
    try {
      response = await fetchWithTimeout(url, {
        cache: 'no-store',
        headers: {
          Accept:
            'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
        },
        timeoutMs: FILE_PROXY_TIMEOUT_MS,
        timeoutMessage: 'Timed out while fetching the remote file.',
      })
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new ServiceUnavailableError('Timed out while fetching file')
      }
      throw error
    }
    if (!response.ok) {
      throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`)
    }
    const contentType =
      response.headers.get('content-type') ||
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="presentation.pptx"',
        'Cache-Control': 'private, no-store',
      },
    })
  },
)

export const Route = createFileRoute('/api/files/proxy')({
  server: {
    handlers: {
      GET: GET.GET,
      HEAD: HEAD.HEAD,
    },
  },
})
