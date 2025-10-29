import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { createMetaOAuthState } from '@/services/meta-business'
import { buildMetaBusinessLoginUrl } from '@/services/facebook-oauth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const appId = process.env.META_APP_ID
    const businessConfigId = process.env.META_BUSINESS_CONFIG_ID
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!appId || !businessConfigId || !redirectUri) {
      return NextResponse.json({ error: 'Meta business login is not configured' }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams
    const redirect = searchParams.get('redirect') ?? `${appUrl}/dashboard`

    const statePayload = createMetaOAuthState({ state: auth.uid, redirect })
    const loginUrl = buildMetaBusinessLoginUrl({
      businessConfigId,
      appId,
      redirectUri,
      state: statePayload,
    })

    return NextResponse.json({ url: loginUrl })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[meta.oauth.url] error', error)
    return NextResponse.json({ error: 'Failed to generate Meta login URL' }, { status: 500 })
  }
}
