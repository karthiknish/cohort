import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, ServiceUnavailableError } from '@/lib/api-errors'

export const dynamic = 'force-dynamic'

/**
 * Proxy endpoint for serving PPTX files to the in-app deck viewer.
 * This makes authenticated Firebase Storage / Gamma URLs accessible via same-origin
 * so the client can fetch (and occasionally HEAD) the file without CORS issues.
 */

const ALLOWED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'public-api.gamma.app',
  'gamma.app',
]

function validateProxiedHost(hostname: string): boolean {
  return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

const querySchema = z.object({
  url: z.string().url('Invalid URL format')
})

export const HEAD = createApiHandler({
  auth: 'none',
  querySchema
}, async (req, { query }) => {
  const { url } = query

  const parsedUrl = new URL(url)
  if (!validateProxiedHost(parsedUrl.hostname)) {
    throw new ForbiddenError('URL domain not allowed')
  }

  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      Accept: 'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
    },
  })

  if (!response.ok) {
    throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`)
  }

  const contentType =
    response.headers.get('content-type') ||
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  const contentLength = response.headers.get('content-length')

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  }

  if (contentLength) {
    headers['Content-Length'] = contentLength
  }

  return new Response(null, { status: 200, headers })
})

export const GET = createApiHandler({
  auth: 'none',
  querySchema
}, async (req, { query }) => {
  const { url } = query

  const parsedUrl = new URL(url)
  if (!validateProxiedHost(parsedUrl.hostname)) {
    throw new ForbiddenError('URL domain not allowed')
  }

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
    },
  })

  if (!response.ok) {
    throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ||
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'

  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'inline; filename="presentation.pptx"',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
