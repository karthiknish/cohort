import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

import { authComponent, createAuth } from './auth'
import { adSyncNotification, externalWebhook, stripeWebhook } from './httpActions'
import { run as adSyncWorker } from './adSyncWorker'

const http = httpRouter()

// Allowed origins for CORS (add your production URL when deploying)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.SITE_URL,
].filter(Boolean) as string[]

function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))
    ? origin
    : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, better-auth-cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

// Handle CORS preflight for all /api/auth/* routes
http.route({
  path: '/api/auth/get-session',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    const origin = request.headers.get('origin')
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
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
      headers: getCorsHeaders(origin),
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

http.route({ path: '/webhooks/stripe', method: 'POST', handler: stripeWebhook })
http.route({ path: '/webhooks/ads-sync', method: 'POST', handler: adSyncNotification })
http.route({ path: '/webhooks/external', method: 'POST', handler: externalWebhook })
http.route({ path: '/cron/ad-sync-worker', method: 'POST', handler: adSyncWorker })

export default http
