import { isChannelEnabled, normalizePreferences, type StoredNotificationPreferences } from '@/lib/notifications/preferences';
/** Whether collaboration email copy should be sent for stored prefs (V2: pauseAll, quiet hours). */
export function shouldSendCollaborationEmailCopy(rawPrefs: StoredNotificationPreferences, options?: {
    now?: Date;
}): boolean {
    return isChannelEnabled(normalizePreferences(rawPrefs), 'collaboration', 'email', options);
}
