/**
 * Session Sync Manager
 * 
 * Manages synchronization of Firebase auth state with server-side session cookies.
 * Handles rate limiting, conflicts, retries, and network errors gracefully.
 */

import type { AuthUser } from '@/services/auth'
import { authService } from '@/services/auth'

const LAST_SYNC_TOKEN_KEY = 'cohorts.auth.lastSyncToken'
const SESSION_EXPIRES_COOKIE = 'cohorts_session_expires'
// Refresh the server session cookie when it is close to expiring.
// This avoids re-posting the session cookie on every reload while still keeping the session alive.
const SESSION_SYNC_BUFFER_MS = 15 * 60 * 1000 // 15 minutes

// Cookie/storage utilities
function getStoredSyncToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem(LAST_SYNC_TOKEN_KEY)
}

function setStoredSyncToken(token: string | null) {
    if (typeof window === 'undefined') return
    if (token) {
        window.sessionStorage.setItem(LAST_SYNC_TOKEN_KEY, token)
    } else {
        window.sessionStorage.removeItem(LAST_SYNC_TOKEN_KEY)
    }
}

function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/(?:^|; )cohorts_csrf=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
}

function getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

function getSessionExpiresAt(): number | null {
    const raw = getCookieValue(SESSION_EXPIRES_COOKIE)
    if (!raw) return null
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return parsed
}

export class SessionSyncManager {
    private syncInProgress: Promise<boolean> | null = null

    /**
     * Sync the auth state with server-side session cookies.
     * @param authUser The current auth user, or null for sign-out
     * @param isIntentionalSignOut Whether this is an intentional sign-out (vs passive null state)
     * @returns Whether the sync was successful
     */
    async sync(authUser: AuthUser | null, isIntentionalSignOut = false): Promise<boolean> {
        // Don't sync null unless it's an intentional sign-out.
        // This prevents races where onAuthStateChanged fires with null during initialization
        // or token refresh, which would incorrectly delete the session cookie.
        if (!authUser && !isIntentionalSignOut) {
            return true
        }

        return this.syncSessionCookies(authUser, 0)
    }

    private async syncSessionCookies(authUser: AuthUser | null, retryCount: number): Promise<boolean> {
        if (typeof window === 'undefined') {
            return true
        }

        // If we're offline, don't even try to sync
        if (!navigator.onLine) {
            return false
        }

        // If a server session already exists and is still fresh, avoid re-syncing on reload.
        // This prevents an auth-session POST on every hard refresh.
        const existingSessionExpiresAt = getSessionExpiresAt()
        const hasFreshServerSession =
            authUser &&
            typeof existingSessionExpiresAt === 'number' &&
            Date.now() < existingSessionExpiresAt - SESSION_SYNC_BUFFER_MS

        if (hasFreshServerSession && retryCount === 0) {
            return true
        }

        const token = await this.getTargetToken(authUser)

        // If a sync is already in progress, wait for it
        if (this.syncInProgress && retryCount === 0) {
            await this.syncInProgress
            const currentToken = await this.getTargetToken(authUser)
            if (currentToken === getStoredSyncToken()) {
                return true
            }
        }

        // Dedup (when we actually intend to sync)
        if (token === getStoredSyncToken() && retryCount === 0) {
            return true
        }

        const performSync = async (): Promise<boolean> => {
            try {
                const csrfToken = getCsrfToken()

                if (!token) {
                    return this.handleDeleteSession(csrfToken)
                }

                return this.handleCreateSession(token, authUser, csrfToken, retryCount)
            } catch (error) {
                return this.handleSyncError(error, authUser, retryCount)
            }
        }

        if (retryCount === 0) {
            this.syncInProgress = performSync()
            const result = await this.syncInProgress
            this.syncInProgress = null
            return result
        }

        return performSync()
    }

    private async getTargetToken(authUser: AuthUser | null): Promise<string | null> {
        if (!authUser) return null
        try {
            return await authService.getIdToken()
        } catch {
            return null
        }
    }

    private async handleDeleteSession(csrfToken: string | null): Promise<boolean> {
        const response = await fetch('/api/auth/session', {
            method: 'DELETE',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
        })
        if (response.ok) {
            setStoredSyncToken(null)
        }
        return response.ok
    }

    private async handleCreateSession(
        token: string,
        authUser: AuthUser | null,
        csrfToken: string | null,
        retryCount: number
    ): Promise<boolean> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (csrfToken) {
            headers['x-csrf-token'] = csrfToken
        }

        const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                token,
                role: authUser?.role,
                status: authUser?.status,
            }),
        })

        if (!response.ok) {
            const status = response.status

            // Handle rate limiting (429) or idempotency conflicts (409)
            if ((status === 429 || status === 409) && retryCount < 3) {
                return this.handleRateLimitOrConflict(status, response, authUser, retryCount)
            }

            // If we still get a 409 after all retries, it's likely fine (another request won)
            if (status === 409) {
                return this.handleConflict(token)
            }

            // For 429s that exhausted retries, just warn and fail
            if (status === 429) {
                console.warn('[SessionSyncManager] Rate limit persisted, giving up.')
                return false
            }

            console.error('[SessionSyncManager] Failed to sync session cookies. Status:', status)
            return false
        }

        setStoredSyncToken(token)
        return true
    }

    private async handleRateLimitOrConflict(
        status: number,
        response: Response,
        authUser: AuthUser | null,
        retryCount: number
    ): Promise<boolean> {
        const isConflict = status === 409
        const retryAfter = Number(response.headers.get('Retry-After') || 1)
        // Longer delay for conflicts to allow the other request to finish
        const delay = isConflict ? 1000 * (retryCount + 1) : Math.min(retryAfter * 1000, 3000)

        console.warn(
            `[SessionSyncManager] Session sync ${isConflict ? 'conflict' : 'rate limit'} (attempt ${retryCount + 1}), retrying in ${delay}ms...`
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.syncSessionCookies(authUser, retryCount + 1)
    }

    private async handleConflict(token: string): Promise<boolean> {
        // Don't assume success: wait until the server observes the session cookie.
        console.warn('[SessionSyncManager] Session sync conflict persisted, waiting for session cookie...')
        const ok = await this.waitForServerSessionPresence(true, 5)
        if (ok) {
            setStoredSyncToken(token)
        }
        return ok
    }

    private async handleSyncError(
        error: unknown,
        authUser: AuthUser | null,
        retryCount: number
    ): Promise<boolean> {
        const isNetworkError =
            (error instanceof TypeError &&
                (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
            (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as { code: string }).code === 'auth/network-request-failed')

        if (isNetworkError && retryCount < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return this.syncSessionCookies(authUser, retryCount + 1)
        }

        console.error('[SessionSyncManager] Failed to sync auth cookies', error)
        return false
    }

    private async waitForServerSessionPresence(expected: boolean, maxAttempts = 5): Promise<boolean> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' })
                const data = (await res.json()) as { hasSession?: boolean }
                const hasSession = Boolean(data?.hasSession)
                if (hasSession === expected) {
                    return true
                }
            } catch {
                // ignore and retry
            }

            await new Promise((resolve) => setTimeout(resolve, 200 + attempt * 200))
        }

        return false
    }
}

// Singleton instance for use across the app
export const sessionSyncManager = new SessionSyncManager()
