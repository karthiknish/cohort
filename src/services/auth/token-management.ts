import { auth } from '@/lib/firebase'
import { User as FirebaseUser } from 'firebase/auth'

export interface TokenCache {
    token: string
    expiresAt: number
}

const TOKEN_DEFAULT_TTL_MS = 55 * 60 * 1000

/**
 * Cache an ID token with its expiration time
 */
export function cacheIdToken(token: string, expirationTime?: string | null): TokenCache {
    const parsedExpiration = expirationTime ? Date.parse(expirationTime) : Number.NaN
    const fallbackExpiration = Date.now() + TOKEN_DEFAULT_TTL_MS
    const expiresAt = Number.isFinite(parsedExpiration) ? parsedExpiration : fallbackExpiration
    return { token, expiresAt }
}

/**
 * Fetch a fresh ID token from Firebase and cache it if it's for the current user
 */
export async function fetchAndCacheIdToken(
    firebaseUser: FirebaseUser,
    forceRefresh: boolean,
    onCache: (token: string, expiresAt: string | null) => void,
    attempt = 0
): Promise<string> {
    try {
        const result = await firebaseUser.getIdTokenResult(forceRefresh)
        if (!result?.token) {
            throw new Error('Failed to resolve authentication token')
        }

        if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
            onCache(result.token, result.expirationTime)
        }

        return result.token
    } catch (error: unknown) {
        const isNetworkError =
            (error instanceof TypeError &&
                (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
            (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as any).code === 'auth/network-request-failed')

        if (isNetworkError && attempt < 2) {
            // Wait 1s then 2s
            await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000))
            return fetchAndCacheIdToken(firebaseUser, forceRefresh, onCache, attempt + 1)
        }

        throw error
    }
}
