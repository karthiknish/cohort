// Notification health check functions

import { adminDb } from '@/lib/firebase-admin'

import {
  EMAIL_WEBHOOK_URL,
  SLACK_WEBHOOK_URL,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
} from './config'
import type { NotificationHealthStatus } from './types'

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

  // Check Firestore connectivity
  try {
    await adminDb.collection('_health_check').doc('notifications').get()
    status.firestore.healthy = true
  } catch (error) {
    status.firestore.error = (error as Error)?.message ?? 'Connection failed'
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
