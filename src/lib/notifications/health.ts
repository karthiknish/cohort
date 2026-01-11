// Notification health check functions

import { ConvexHttpClient } from 'convex/browser'

import {
  EMAIL_WEBHOOK_URL,
  SLACK_WEBHOOK_URL,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
} from './config'
import type { NotificationHealthStatus } from './types'

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function checkNotificationHealth(): Promise<NotificationHealthStatus> {
  const status: NotificationHealthStatus = {
    email: { configured: !!EMAIL_WEBHOOK_URL, healthy: false },
    slack: { configured: !!SLACK_WEBHOOK_URL, healthy: false },
    whatsapp: {
      configured: !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID),
      healthy: false,
    },
    firestore: { configured: true, healthy: false },
  }

  // Check Convex connectivity (using "firestore" key for backwards compatibility)
  try {
    const convex = getConvexClient()
    if (convex) {
      // Simple connectivity check - just verify the client can connect
      // We use a query that won't find anything, but will verify connectivity
      const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
      const response = await fetch(`${url}/version`, { method: 'GET' })
      status.firestore.healthy = response.ok
    } else {
      status.firestore.healthy = false
      status.firestore.error = 'Convex client not configured'
    }
  } catch (error) {
    status.firestore.error = (error as Error)?.message || 'Connection failed'
  }

  // For webhooks, we can only verify configuration (not actual health without triggering)
  status.email.healthy = status.email.configured
  status.slack.healthy = status.slack.configured

  // For WhatsApp, verify the access token is present (full health check would require API call)
  if (status.whatsapp.configured) {
    status.whatsapp.healthy = true
  }

  return status
}
