import { DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies'

export type PreviewSettingsProfile = {
    id: string
    legacyId: string
    name: string
    email: string
    phoneNumber: string | null
    photoUrl: string | null
}

export type PreviewSettingsNotificationPreferences = {
    emailAdAlerts: boolean
    emailPerformanceDigest: boolean
    emailTaskActivity: boolean
    emailCollaboration: boolean
    phoneNumber: string | null
}

export type PreviewSettingsRegionalPreferences = {
    currency: CurrencyCode
    timezone: string | null
    locale: string | null
}

const PREVIEW_SETTINGS_PROFILE: PreviewSettingsProfile = {
    id: 'preview-user-settings',
    legacyId: 'preview-user-settings',
    name: 'Avery Stone',
    email: 'avery@cohorts.app',
    phoneNumber: '+1 415 555 0183',
    photoUrl: null,
}

const PREVIEW_NOTIFICATION_PREFERENCES: PreviewSettingsNotificationPreferences = {
    emailAdAlerts: true,
    emailPerformanceDigest: true,
    emailTaskActivity: true,
    emailCollaboration: false,
    phoneNumber: PREVIEW_SETTINGS_PROFILE.phoneNumber,
}

const PREVIEW_REGIONAL_PREFERENCES: PreviewSettingsRegionalPreferences = {
    currency: DEFAULT_CURRENCY,
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
}

export function getPreviewSettingsProfile(): PreviewSettingsProfile {
    return { ...PREVIEW_SETTINGS_PROFILE }
}

export function getPreviewSettingsNotificationPreferences(): PreviewSettingsNotificationPreferences {
    return { ...PREVIEW_NOTIFICATION_PREFERENCES }
}

export function getPreviewSettingsRegionalPreferences(): PreviewSettingsRegionalPreferences {
    return { ...PREVIEW_REGIONAL_PREFERENCES }
}

export function getPreviewSettingsExportData() {
    const exportedAt = typeof window === 'undefined'
        ? '2024-01-15T12:00:00.000Z'
        : new Date().toISOString()

    return {
        exportedAt,
        profile: getPreviewSettingsProfile(),
        notificationPreferences: getPreviewSettingsNotificationPreferences(),
        regionalPreferences: getPreviewSettingsRegionalPreferences(),
        summary: {
            clients: 3,
            activeProjects: 4,
            openTasks: 15,
            pendingProposals: 3,
            collaborationThreads: 8,
        },
        note: 'Preview mode export generated from sample workspace data.',
    }
}