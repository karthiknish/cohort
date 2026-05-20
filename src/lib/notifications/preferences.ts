import type { WorkspaceNotificationKind } from '@/types/notifications'

export const NOTIFICATION_CATEGORIES = [
  'tasks',
  'collaboration',
  'ads',
  'digest',
  'projects',
  'meetings',
] as const

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

export type NotificationChannel = 'inApp' | 'email'

export type ChannelPrefs = {
  inApp: boolean
  email: boolean
}

export type QuietHoursPrefs = {
  enabled: boolean
  start: string
  end: string
}

export type NotificationPreferencesV2 = {
  version: 2
  pauseAll: boolean
  quietHours: QuietHoursPrefs
  categories: Record<NotificationCategory, ChannelPrefs>
}

/** Legacy flat email prefs (pre-v2). */
export type LegacyNotificationPreferences = {
  emailAdAlerts?: boolean
  emailPerformanceDigest?: boolean
  emailTaskActivity?: boolean
  emailCollaboration?: boolean
}

export type StoredNotificationPreferences =
  | NotificationPreferencesV2
  | LegacyNotificationPreferences
  | null
  | undefined

const DEFAULT_CHANNEL_PREFS: ChannelPrefs = { inApp: true, email: true }

export const DEFAULT_QUIET_HOURS: QuietHoursPrefs = {
  enabled: false,
  start: '22:00',
  end: '08:00',
}

export function createDefaultCategories(
  overrides?: Partial<Record<NotificationCategory, Partial<ChannelPrefs>>>,
): Record<NotificationCategory, ChannelPrefs> {
  const base: Record<NotificationCategory, ChannelPrefs> = {
    tasks: { ...DEFAULT_CHANNEL_PREFS },
    collaboration: { inApp: true, email: false },
    ads: { ...DEFAULT_CHANNEL_PREFS },
    digest: { ...DEFAULT_CHANNEL_PREFS },
    projects: { ...DEFAULT_CHANNEL_PREFS },
    meetings: { ...DEFAULT_CHANNEL_PREFS },
  }

  if (!overrides) return base

  for (const category of NOTIFICATION_CATEGORIES) {
    const patch = overrides[category]
    if (patch) {
      base[category] = { ...base[category], ...patch }
    }
  }

  return base
}

export const DEFAULT_NOTIFICATION_PREFERENCES_V2: NotificationPreferencesV2 = {
  version: 2,
  pauseAll: false,
  quietHours: DEFAULT_QUIET_HOURS,
  categories: createDefaultCategories(),
}

export function isNotificationPreferencesV2(
  prefs: StoredNotificationPreferences,
): prefs is NotificationPreferencesV2 {
  return (
    prefs !== null &&
    prefs !== undefined &&
    typeof prefs === 'object' &&
    'version' in prefs &&
    (prefs as NotificationPreferencesV2).version === 2
  )
}

export function migrateLegacyPreferences(
  legacy: LegacyNotificationPreferences | null | undefined,
): NotificationPreferencesV2 {
  return {
    version: 2,
    pauseAll: false,
    quietHours: { ...DEFAULT_QUIET_HOURS },
    categories: createDefaultCategories({
      tasks: { email: legacy?.emailTaskActivity !== false },
      collaboration: { email: legacy?.emailCollaboration === true },
      ads: { email: legacy?.emailAdAlerts !== false },
      digest: { email: legacy?.emailPerformanceDigest !== false },
      projects: { inApp: true, email: true },
      meetings: { inApp: true, email: true },
    }),
  }
}

export function normalizePreferences(
  prefs: StoredNotificationPreferences,
): NotificationPreferencesV2 {
  if (isNotificationPreferencesV2(prefs)) {
    return {
      version: 2,
      pauseAll: prefs.pauseAll ?? false,
      quietHours: {
        enabled: prefs.quietHours?.enabled ?? false,
        start: prefs.quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
        end: prefs.quietHours?.end ?? DEFAULT_QUIET_HOURS.end,
      },
      categories: mergeCategories(prefs.categories),
    }
  }

  return migrateLegacyPreferences(prefs as LegacyNotificationPreferences)
}

function mergeCategories(
  input: Partial<Record<NotificationCategory, Partial<ChannelPrefs>>> | undefined,
): Record<NotificationCategory, ChannelPrefs> {
  const defaults = createDefaultCategories()
  if (!input) return defaults

  const merged = { ...defaults }
  for (const category of NOTIFICATION_CATEGORIES) {
    const patch = input[category]
    if (patch) {
      merged[category] = {
        inApp: patch.inApp ?? defaults[category].inApp,
        email: patch.email ?? defaults[category].email,
      }
    }
  }
  return merged
}

export function kindToCategory(kind: WorkspaceNotificationKind | string): NotificationCategory {
  if (kind.startsWith('task.')) return 'tasks'
  if (kind.startsWith('collaboration.')) return 'collaboration'
  if (kind === 'project.created' || kind === 'proposal.deck.ready') return 'projects'
  if (kind === 'report.generated') return 'ads'
  return 'tasks'
}

/** Brevo / server email pref keys mapped to categories. */
export const EMAIL_PREF_KEY_TO_CATEGORY: Record<string, NotificationCategory> = {
  adAlerts: 'ads',
  performanceDigest: 'digest',
  taskActivity: 'tasks',
  collaboration: 'collaboration',
  meetings: 'meetings',
}

export function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hoursPart = match[1]
  const minutesPart = match[2]
  if (hoursPart === undefined || minutesPart === undefined) return null
  const hours = Number.parseInt(hoursPart, 10)
  const minutes = Number.parseInt(minutesPart, 10)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

export function isWithinQuietHours(
  quietHours: QuietHoursPrefs,
  now: Date = new Date(),
): boolean {
  if (!quietHours.enabled) return false

  const start = parseTimeToMinutes(quietHours.start)
  const end = parseTimeToMinutes(quietHours.end)
  if (start === null || end === null) return false

  const current = now.getHours() * 60 + now.getMinutes()

  if (start === end) return true
  if (start < end) {
    return current >= start && current < end
  }
  // Overnight window (e.g. 22:00 – 08:00)
  return current >= start || current < end
}

export function isChannelEnabled(
  prefs: NotificationPreferencesV2,
  category: NotificationCategory,
  channel: NotificationChannel,
  options?: { now?: Date },
): boolean {
  if (prefs.pauseAll) return false

  const categoryPrefs = prefs.categories[category] ?? DEFAULT_CHANNEL_PREFS
  const channelEnabled = channel === 'inApp' ? categoryPrefs.inApp : categoryPrefs.email

  if (!channelEnabled) return false

  if (channel === 'email' && isWithinQuietHours(prefs.quietHours, options?.now)) {
    return false
  }

  return true
}

export function isEmailPrefEnabled(
  prefs: StoredNotificationPreferences,
  prefKey: keyof typeof EMAIL_PREF_KEY_TO_CATEGORY,
  options?: { now?: Date },
): boolean {
  const normalized = normalizePreferences(prefs)
  const category = EMAIL_PREF_KEY_TO_CATEGORY[prefKey]
  if (!category) return true
  return isChannelEnabled(normalized, category, 'email', options)
}

export type NotificationPreferencesPatch = {
  pauseAll?: boolean
  quietHours?: Partial<QuietHoursPrefs>
  categories?: Partial<Record<NotificationCategory, Partial<ChannelPrefs>>>
}

export function applyPreferencesPatch(
  current: StoredNotificationPreferences,
  patch: NotificationPreferencesPatch,
): NotificationPreferencesV2 {
  const base = normalizePreferences(current)

  return {
    version: 2,
    pauseAll: patch.pauseAll ?? base.pauseAll,
    quietHours: {
      enabled: patch.quietHours?.enabled ?? base.quietHours.enabled,
      start: patch.quietHours?.start ?? base.quietHours.start,
      end: patch.quietHours?.end ?? base.quietHours.end,
    },
    categories: mergeCategories({
      ...base.categories,
      ...patch.categories,
    }),
  }
}

export const CATEGORY_LABELS: Record<
  NotificationCategory,
  { title: string; description: string }
> = {
  tasks: {
    title: 'Tasks & activity',
    description: 'Assignments, updates, comments, and mentions on tasks.',
  },
  collaboration: {
    title: 'Collaboration',
    description: 'Channel messages, threads, and @mentions.',
  },
  ads: {
    title: 'Ads & alerts',
    description: 'ROAS drops, spend spikes, and automated ad performance alerts.',
  },
  digest: {
    title: 'Weekly digest',
    description: 'Summary of workspace performance across platforms.',
  },
  projects: {
    title: 'Projects',
    description: 'New projects and proposal deck readiness.',
  },
  meetings: {
    title: 'Meetings',
    description: 'Scheduled, rescheduled, and cancelled meeting updates.',
  },
}
