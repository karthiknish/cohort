import { z } from 'zod'
import { NextResponse } from 'next/server'

import { completeTikTokOAuthFlow, validateTikTokOAuthState } from '@/services/tiktok-business'
import { createApiHandler } from '@/lib/api-handler'

const querySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
})

export const GET = createApiHandler(
  {
    auth: 'none',
    querySchema,
  },
  async (req, { query }) => {
    const { code, state } = query

  if (!code) {
    return { error: 'Missing authorization code', status: 400 }
  }

  const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI
  if (!redirectUri) {
    return { error: 'TikTok OAuth not configured', status: 500 }
  }

  const context = validateTikTokOAuthState(state ?? '')

  if (!context.state) {
    return { error: 'Invalid OAuth state', status: 400 }
  }

  await completeTikTokOAuthFlow({ code, userId: context.state, redirectUri })

  const redirectTarget = context.redirect ?? '/dashboard'
  const response = NextResponse.redirect(redirectTarget)
  response.cookies.set('tiktok_oauth_success', '1', { path: '/', maxAge: 60 })
  return response
})
