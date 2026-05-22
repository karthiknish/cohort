import { internal } from '/_generated/api'

import { shouldSendCollaborationEmailCopy } from '@/features/dashboard/collaboration/hooks/collaboration-email-notify'
import { getSystemConvexClient } from '@/lib/convex-system-client'
import type { StoredNotificationPreferences } from '@/lib/notifications/preferences'

type QueryReference = Parameters<NonNullable<ReturnType<typeof getSystemConvexClient>>['query']>[0]

/** Server-side V2 gate for collaboration email copy (pauseAll, quiet hours, category email). */
export async function isCollaborationEmailEnabledForRecipient(email: string): Promise<boolean> {
  const convex = getSystemConvexClient()
  if (!convex) {
    return false
  }

  const result = (await convex.query(
    internal.users.getNotificationPreferencesByEmail as unknown as QueryReference,
    { email },
  )) as { notificationPreferences?: StoredNotificationPreferences } | null

  const prefs = result?.notificationPreferences
  if (!prefs) {
    return true
  }

  return shouldSendCollaborationEmailCopy(prefs)
}
