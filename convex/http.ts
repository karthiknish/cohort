import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

import { authComponent, createAuth } from './betterAuth/auth'
import { adSyncNotification, externalWebhook } from './httpActions'
import { run as adSyncWorker } from './adSyncWorker'

const http = httpRouter()

const LOCAL_DEV_AUTH_ORIGIN = 'http://localhost:3000'

function isLocalDevUrl(value: string | undefined | null): value is string {
  return typeof value === 'string' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)
}

function shouldForceLocalhostAuthOrigin(): boolean {
  return [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].some(isLocalDevUrl)
}

// Allowed origins for CORS (add your production URL when deploying)
const ALLOWED_ORIGINS = shouldForceLocalhostAuthOrigin()
  ? [LOCAL_DEV_AUTH_ORIGIN]
  : [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
      process.env.NEXT_PUBLIC_CONVEX_HTTP_URL,
      process.env.SITE_URL,
    ].filter(Boolean) as string[]

function getCorsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))
    ? origin
    : ALLOWED_ORIGINS[0]!

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

http.route({ path: '/webhooks/ads-sync', method: 'POST', handler: adSyncNotification })
http.route({ path: '/webhooks/external', method: 'POST', handler: externalWebhook })
http.route({ path: '/cron/ad-sync-worker', method: 'POST', handler: adSyncWorker })

export default http
