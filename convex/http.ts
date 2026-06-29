import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

import { authComponent, buildTrustedOrigins, createAuth, getAuthHealthSnapshot } from './betterAuth/auth'
import { corsHeadersForOrigin } from './betterAuth/origins'
import { adSyncNotification, externalWebhook } from './httpActions'
import { metaWebhook } from './httpActions/metaWebhook'
import { run as adSyncWorker } from './adSyncWorker'

const http = httpRouter()

// Allowed origins for CORS — keep in sync with betterAuth/origins.ts
const ALLOWED_ORIGINS = buildTrustedOrigins()

// Wrap createAuth to log 401s with the exact sub-path and cookie presence.
// This is the primary diagnostic for auth polling loops: it tells us whether
// the session cookie reached Convex and which endpoint rejected it.
const createAuthWithLogging = (ctx: Parameters<typeof createAuth>[0]) => {
  const auth = createAuth(ctx)
  const originalHandler = auth.handler.bind(auth) as (req: Request) => Promise<Response>
  auth.handler = async (request: Request) => {
    const response = await originalHandler(request)
    if (response.status === 401) {
      const url = new URL(request.url)
      const authPath = url.pathname.replace(/^\/api\/auth/, '')
      const cookieHeader = request.headers.get('cookie') ?? ''
      const hasCookie = Boolean(cookieHeader)
      // Better Auth default cookie prefix is "better-auth" — session cookie is
      // "better-auth.session_token" and JWT cookie is "convex_jwt".
      const hasSessionCookie = cookieHeader.includes('better-auth.session_token')
      const hasJwtCookie = cookieHeader.includes('convex_jwt')
      console.warn('[convex-auth] 401', {
        path: authPath,
        method: request.method,
        hasCookie,
        hasSessionCookie,
        hasJwtCookie,
        forwardedHost: request.headers.get('x-forwarded-host'),
      })
    }
    return response
  }
  return auth
}

http.route({
  path: '/api/auth/ok',
  method: 'GET',
  handler: httpAction(async (_, request) => {
    const origin = request.headers.get('origin')
    return new Response(JSON.stringify(getAuthHealthSnapshot()), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeadersForOrigin(origin),
      },
    })
  }),
})

// Handle CORS preflight for all /api/auth/* routes
http.route({
  path: '/api/auth/get-session',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    const origin = request.headers.get('origin')
    return new Response(null, {
      status: 204,
      headers: corsHeadersForOrigin(origin),
    })
  }),
})

http.route({
  path: '/api/auth/convex/token',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    const origin = request.headers.get('origin')
    return new Response(null, {
      status: 204,
      headers: corsHeadersForOrigin(origin),
    })
  }),
})

// Register Better Auth routes with CORS wrapper
authComponent.registerRoutes(http, createAuthWithLogging as typeof createAuth, {
  cors: {
    allowedOrigins: ALLOWED_ORIGINS,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'better-auth-cookie'],
  },
})

http.route({ path: '/webhooks/ads-sync', method: 'POST', handler: adSyncNotification })
http.route({ path: '/webhooks/external', method: 'POST', handler: externalWebhook })
http.route({ path: '/webhooks/meta', method: 'GET', handler: metaWebhook })
http.route({ path: '/webhooks/meta', method: 'POST', handler: metaWebhook })
http.route({ path: '/cron/ad-sync-worker', method: 'POST', handler: adSyncWorker })

export default http
