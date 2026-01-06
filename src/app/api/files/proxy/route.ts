/**
 * Proxy endpoint for serving PPTX files to the in-app deck viewer.
 * This makes authenticated Firebase Storage / Gamma URLs accessible via same-origin
 * so the client can fetch (and occasionally HEAD) the file without CORS issues.
 */

import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function validateProxiedUrl(url: string): { ok: true; parsed: URL } | { ok: false; response: NextResponse } {
  if (!url) {
    return { ok: false, response: NextResponse.json({ error: 'Missing url parameter' }, { status: 400 }) }
  }

  const allowedDomains = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'public-api.gamma.app',
    'gamma.app',
  ]

  try {
    const parsedUrl = new URL(url)
    const isAllowed = allowedDomains.some((domain) => parsedUrl.hostname.endsWith(domain))
    if (!isAllowed) {
      return { ok: false, response: NextResponse.json({ error: 'URL domain not allowed' }, { status: 403 }) }
    }

    return { ok: true, parsed: parsedUrl }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }
  }
}

export async function HEAD(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const validated = validateProxiedUrl(url ?? '')
  if (!validated.ok) return validated.response

  try {
    const response = await fetch(url!, {
      method: 'HEAD',
      headers: {
        Accept: 'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status}` },
        { status: response.status },
      )
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

    return new NextResponse(null, { status: 200, headers })
  } catch (error) {
    console.error('[ProxyFile] Error fetching file headers:', error)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  const validated = validateProxiedUrl(url ?? '')
  if (!validated.ok) return validated.response

  const targetUrl = url as string

  try {
    // Fetch the file
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status}` }, 
        { status: response.status }
      )
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    
    // Stream the response
    const buffer = await response.arrayBuffer()
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="presentation.pptx"',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[ProxyFile] Error fetching file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file' }, 
      { status: 500 }
    )
  }
}
