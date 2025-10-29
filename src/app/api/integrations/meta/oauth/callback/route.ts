import { NextRequest, NextResponse } from 'next/server'

import { completeMetaOAuthFlow, validateMetaOAuthState } from '@/services/meta-business'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
    }

    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    if (!redirectUri) {
      return NextResponse.json({ error: 'Meta OAuth not configured' }, { status: 500 })
    }

    const context = validateMetaOAuthState(state ?? '')

    if (!context.state) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    await completeMetaOAuthFlow({ code, userId: context.state, redirectUri })

    const redirectTarget = context.redirect ?? '/dashboard'
    const response = NextResponse.redirect(redirectTarget)
    response.cookies.set('meta_oauth_success', '1', { path: '/', maxAge: 60 })
    return response
  } catch (error: unknown) {
    console.error('[meta.oauth.callback] error', error)
    return NextResponse.json({ error: 'Meta OAuth callback failed' }, { status: 500 })
  }
}
