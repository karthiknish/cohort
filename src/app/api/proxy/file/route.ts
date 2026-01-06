import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest } from '@/lib/server-auth'

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

export async function GET(request: NextRequest) {
  try {
    // Get the file URL from query params
    const fileUrl = request.nextUrl.searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    // Validate URL is from allowed domains
    const parsedUrl = new URL(fileUrl)
    if (!isAllowedHostname(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'URL domain not allowed' }, { status: 400 })
    }

    // Enforce authentication using the app's standard auth mechanisms.
    // Supports:
    // - Authorization: Bearer <idToken>
    // - cohorts_token session cookie
    await authenticateRequest(request)

    // Fetch the file from Firebase Storage
    const upstream = await fetch(fileUrl, {
      headers: {
        // Help upstream pick the right representation.
        Accept:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream,*/*',
      },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${upstream.status}` },
        { status: upstream.status },
      )
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

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('File proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy file' },
      { status: 500 }
    )
  }
}
