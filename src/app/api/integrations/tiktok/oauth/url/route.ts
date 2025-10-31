import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { buildTikTokOAuthUrl, createTikTokOAuthState } from '@/services/tiktok-business'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!clientKey || !redirectUri) {
      return NextResponse.json({ error: 'TikTok OAuth is not configured' }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams
    const redirect = searchParams.get('redirect') ?? `${appUrl}/dashboard/ads`

    const state = createTikTokOAuthState({ state: auth.uid, redirect })
    const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(',').map((scope) => scope.trim()).filter(Boolean)
    const url = buildTikTokOAuthUrl({ clientKey, redirectUri, state, scopes })

    return NextResponse.json({ url })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[tiktok.oauth.url] error', error)
    return NextResponse.json({ error: 'Failed to generate TikTok OAuth URL' }, { status: 500 })
  }
}
