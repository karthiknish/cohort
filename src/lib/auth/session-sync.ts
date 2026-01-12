/**
 * Session Sync Manager
 * 
 * Manages synchronization of Better Auth state with server-side session cookies.
 * For cross-domain setups (Vercel + Convex), the session is stored in localStorage
 * on the client, so we need to fetch the Convex token and pass it to our API route.
 */

import type { AuthUser } from '@/services/auth'
import { authClient } from '@/lib/auth-client'

const USE_BETTER_AUTH = true

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

/**
 * Fetch the Convex token from the Better Auth server.
 * In cross-domain setups, this uses the session stored in localStorage.
 */
async function fetchConvexToken(): Promise<string | null> {
    try {
        // Use the authClient to fetch the token - it will include the cross-domain session
        const result = await authClient.$fetch<{ token?: string }>('/api/auth/convex/token', {
            method: 'GET',
        })
        return result?.data?.token ?? null
    } catch (error) {
        console.error('[SessionSyncManager] Failed to fetch Convex token:', error)
        return null
    }
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

        // If a server session already exists and is still fresh, avoid re-syncing on reload.
        // This prevents an auth-session POST on every hard refresh.
        //
        // Important: we also need to ensure the server role cookie matches the client role.
        // Otherwise we can get stuck showing a stale role (e.g. `client`) forever.
        const existingSessionExpiresAt = getSessionExpiresAt()
        const hasFreshServerSession =
            authUser &&
            typeof existingSessionExpiresAt === 'number' &&
            Date.now() < existingSessionExpiresAt - SESSION_SYNC_BUFFER_MS

        const cookieRole = getCookieValue('cohorts_role')
        const cookieStatus = getCookieValue('cohorts_status')
        
        // If cookies are missing entirely, we MUST sync regardless of session freshness
        const cookiesMissing = !cookieRole || !cookieStatus
        const cookieRoleMismatch = Boolean(authUser && cookieRole && cookieRole !== authUser.role)
        const cookieStatusMismatch = Boolean(authUser && cookieStatus && cookieStatus !== authUser.status)

        // Skip sync if we have fresh session AND cookies exist AND no mismatch
        if (hasFreshServerSession && !cookiesMissing && !cookieRoleMismatch && !cookieStatusMismatch && retryCount === 0) {
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

        // Dedup: skip if token matches and cookies exist
        const storedToken = getStoredSyncToken()
        if (token === storedToken && retryCount === 0 && !cookiesMissing) {
            return true
        }

        const performSync = async (): Promise<boolean> => {
            try {
                const csrfToken = getCsrfToken()

                if (!token) {
                    return this.handleDeleteSession(csrfToken)
                }

                return this.handleCreateSession(token, authUser, csrfToken, retryCount, cookiesMissing)
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
        if (USE_BETTER_AUTH) return 'better-auth'
        return null
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
        retryCount: number,
        cookiesMissing: boolean = false
    ): Promise<boolean> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (csrfToken) {
            headers['x-csrf-token'] = csrfToken
        }

        // For cross-domain Better Auth, fetch the Convex token from the client
        // and pass it to the server since cookies aren't shared across domains
        let convexToken: string | null = null
        if (USE_BETTER_AUTH) {
            convexToken = await fetchConvexToken()
            if (!convexToken) {
                console.warn('[SessionSyncManager] Could not fetch Convex token, session sync may fail')
            }
        }

        const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers,
            body: JSON.stringify({ convexToken }),
            cache: 'no-store',
            credentials: 'same-origin',
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

        // Bootstrap creates/updates user in Convex if needed.
        // Only call if cookies were missing (new user or first sync).
        if (cookiesMissing) {
            try {
                const bootstrapHeaders: HeadersInit = { 'Content-Type': 'application/json' }
                if (csrfToken) {
                    bootstrapHeaders['x-csrf-token'] = csrfToken
                }
                
                const bootstrapRes = await fetch('/api/auth/bootstrap', {
                    method: 'POST',
                    headers: bootstrapHeaders,
                    body: JSON.stringify({}),
                    cache: 'no-store',
                    credentials: 'same-origin',
                })

                // Bootstrap failure is non-fatal - user can still use the app
            } catch {
                // Silently ignore bootstrap failures
            }
        }

        setStoredSyncToken(USE_BETTER_AUTH ? 'better-auth' : token)
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
