/**
 * Proxy endpoint for serving PPTX files to viewers
 * This makes authenticated Firebase Storage URLs accessible to external viewers
 * like Microsoft Office Online or Google Docs Viewer
 */

import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Validate URL is from expected domains (Firebase Storage or Gamma)
  const allowedDomains = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'public-api.gamma.app',
    'gamma.app',
  ]
  
  try {
    const parsedUrl = new URL(url)
    const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'URL domain not allowed' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    // Fetch the file
    const response = await fetch(url, {
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
