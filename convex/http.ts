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
authComponent.registerRoutes(http, createAuth, {
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
