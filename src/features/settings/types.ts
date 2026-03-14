export interface NotificationPreferencesResponse {
    emailAdAlerts: boolean
    emailPerformanceDigest: boolean
    emailTaskActivity: boolean
    emailCollaboration: boolean
    phoneNumber: string | null
}
