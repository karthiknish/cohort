import { logError } from '@/lib/convex-errors'

export function readSessionTokenCookie(): string | null {
    if (typeof document === 'undefined') {
        return null
    }

    const match = document.cookie
        .split(';')
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith('cohorts_token='))

    if (!match) {
        return null
    }

    const value = match.split('=')[1]
    if (!value) {
        return null
    }

    try {
        const decoded = decodeURIComponent(value)
        return decoded.length > 0 ? decoded : null
    } catch (error) {
        logError(error, 'session-utils:readSessionTokenCookie')
        return null
    }
}
