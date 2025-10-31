import { NextRequest, NextResponse } from 'next/server'

import { completeTikTokOAuthFlow, validateTikTokOAuthState } from '@/services/tiktok-business'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
    }

    const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
    if (!redirectUri) {
      return NextResponse.json({ error: 'TikTok OAuth not configured' }, { status: 500 })
    }

    const context = validateTikTokOAuthState(state ?? '')

    if (!context.state) {
      return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 })
    }

    await completeTikTokOAuthFlow({ code, userId: context.state, redirectUri })

    const redirectTarget = context.redirect ?? '/dashboard'
    const response = NextResponse.redirect(redirectTarget)
    response.cookies.set('tiktok_oauth_success', '1', { path: '/', maxAge: 60 })
    return response
  } catch (error: unknown) {
    console.error('[tiktok.oauth.callback] error', error)
    return NextResponse.json({ error: 'TikTok OAuth callback failed' }, { status: 500 })
  }
}
