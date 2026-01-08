export const PREVIEW_MODE_STORAGE_KEY = 'cohorts.previewMode'
export const PREVIEW_MODE_EVENT = 'cohorts:previewModeChanged'

export function isPreviewModeEnabled(): boolean {
    if (typeof window === 'undefined') return false
    try {
        return window.localStorage.getItem(PREVIEW_MODE_STORAGE_KEY) === '1'
    } catch {
        return false
    }
}

export function setPreviewModeEnabled(enabled: boolean) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, enabled ? '1' : '0')
    } catch {
        // ignore
    }

    try {
        window.dispatchEvent(new CustomEvent(PREVIEW_MODE_EVENT, { detail: { enabled } }))
    } catch {
        // ignore
    }
}

/**
 * Helper to generate ISO date strings for days in the past
 */
export function isoDaysAgo(daysAgo: number): string {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
}
