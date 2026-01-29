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
 * Fixed base date for SSR to ensure consistent dates across server and client.
 * Using a fixed date (2024-01-15) prevents hydration mismatches.
 */
const SSR_BASE_DATE = new Date('2024-01-15T12:00:00.000Z')

/**
 * Helper to generate ISO date strings for days in the past.
 * Uses a fixed base date during SSR to prevent hydration mismatches.
 */
export function isoDaysAgo(daysAgo: number): string {
    // During SSR, use a fixed date to ensure server/client match
    if (typeof window === 'undefined') {
        const d = new Date(SSR_BASE_DATE)
        d.setDate(d.getDate() - daysAgo)
        return d.toISOString()
    }

    // On client, use current time for accurate preview data
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
}
