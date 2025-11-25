import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { gammaService } from '@/services/gamma'

/**
 * GET /api/gamma/folders
 * List available Gamma folders
 * Query params: query (search), limit, after (pagination cursor)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const after = searchParams.get('after') || undefined

    const result = await gammaService.listFolders({ query, limit, after })

    return NextResponse.json(result)
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[GammaFolders] GET failed', error)

    if (error instanceof Error && error.message.includes('GAMMA_API_KEY')) {
      return NextResponse.json({ error: 'Gamma API not configured' }, { status: 503 })
    }

    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}
