/**
 * Token Management Helpers
 * 
 * Functions for managing ID tokens, caching, and refresh logic
 */

import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export interface TokenCache {
    token: string
    expiresAt: number
}

export const TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000
export const TOKEN_DEFAULT_TTL_MS = 55 * 60 * 1000

/**
 * Create a token cache entry
 */
export function createTokenCacheEntry(token: string, expirationTime?: string | null): TokenCache {
    const parsedExpiration = expirationTime ? Date.parse(expirationTime) : Number.NaN
    const fallbackExpiration = Date.now() + TOKEN_DEFAULT_TTL_MS
    const expiresAt = Number.isFinite(parsedExpiration) ? parsedExpiration : fallbackExpiration
    return { token, expiresAt }
}

/**
 * Check if a cached token is still valid
 */
export function isTokenValid(cache: TokenCache | null, buffer: number = TOKEN_EXPIRATION_BUFFER_MS): boolean {
    if (!cache) return false
    return cache.expiresAt - buffer > Date.now()
}

/**
 * Fetch and return ID token from Firebase User
 */
export async function fetchIdToken(
    firebaseUser: FirebaseUser,
    forceRefresh: boolean,
    attempt = 0
): Promise<{ token: string; expirationTime: string | undefined }> {
    try {
        const result = await firebaseUser.getIdTokenResult(forceRefresh)
        if (!result?.token) {
            throw new Error('Failed to resolve authentication token')
        }
        return {
            token: result.token,
            expirationTime: result.expirationTime,
        }
    } catch (error: unknown) {
        const isNetworkError =
            (error instanceof TypeError &&
                (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
            (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as { code?: string }).code === 'auth/network-request-failed')

        if (isNetworkError && attempt < 2) {
            // Wait 1s then 2s
            await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000))
            return fetchIdToken(firebaseUser, forceRefresh, attempt + 1)
        }

        throw error
    }
}

/**
 * Calculate delay for token refresh scheduling
 */
export function calculateRefreshDelay(
    tokenExpiresAt: number | undefined,
    defaultTtl: number = TOKEN_DEFAULT_TTL_MS,
    buffer: number = 5 * 60 * 1000 // 5 minutes
): number {
    const now = Date.now()
    const expiresAt = tokenExpiresAt ?? (now + defaultTtl)
    return Math.max(0, expiresAt - now - buffer)
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    return (
        (error instanceof TypeError &&
            (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
        (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: string }).code === 'auth/network-request-failed')
    )
}
