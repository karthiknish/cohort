export const PREVIEW_MODE_STORAGE_KEY = 'cohorts.previewMode'
export const PREVIEW_MODE_EVENT = 'cohorts:previewModeChanged'
export const PREVIEW_MODE_QUERY_PARAM = 'preview'
export const PREVIEW_ROUTE_REQUEST_HEADER = 'x-cohorts-preview-route'

type SearchParamsLike = {
    get(name: string): string | null
}

const PREVIEW_ROUTE_PATTERNS = [
    /^\/dashboard\/proposals\/[^/]+\/deck$/,
    /^\/dashboard\/ads\/campaigns\/[^/]+\/[^/]+$/,
    /^\/dashboard\/ads\/campaigns\/[^/]+\/[^/]+\/creative\/[^/]+$/,
]

function isEnabledPreviewValue(value: string | null): boolean {
    if (!value) return false
    return value === '1' || value.toLowerCase() === 'true'
}

export function isPreviewModeQueryEnabled(searchParams: SearchParamsLike): boolean {
    return isEnabledPreviewValue(searchParams.get(PREVIEW_MODE_QUERY_PARAM))
}

export function isPublicPreviewPath(pathname: string): boolean {
    return PREVIEW_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
}

export function isPreviewRouteRequest(pathname: string, searchParams: SearchParamsLike): boolean {
    return isPublicPreviewPath(pathname) && isPreviewModeQueryEnabled(searchParams)
}

export function withPreviewModeSearchParam(href: string): string {
    const [hrefWithoutHash, hashFragment] = href.split('#', 2)
    const url = new URL(hrefWithoutHash ?? href, 'https://preview.local')

    url.searchParams.set(PREVIEW_MODE_QUERY_PARAM, '1')

    return `${url.pathname}${url.search}${hashFragment ? `#${hashFragment}` : ''}`
}

export function withPreviewModeSearchParamIfEnabled(href: string, enabled: boolean): string {
    return enabled ? withPreviewModeSearchParam(href) : href
}

export function isPreviewModeEnabled(): boolean {
    if (typeof window === 'undefined') return false
    try {
        if (isPreviewModeQueryEnabled(new URLSearchParams(window.location.search))) {
            return true
        }
    } catch {
        // ignore
    }

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
