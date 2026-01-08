/**
 * OAuth Provider Connection Helpers
 * 
 * Functions to handle connecting various OAuth providers (Google Ads, Facebook Ads, LinkedIn)
 */

import { auth } from '@/lib/firebase'
import { enqueueSyncJob, persistIntegrationTokens } from '@/lib/firestore/client'
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    linkWithPopup,
    reauthenticateWithPopup,
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth'
import { extractRefreshToken, isFirebaseError } from './utils'
import { getFriendlyAuthErrorMessage } from './error-utils'
import type { AuthUser } from './types'

async function bestEffortInitializeIntegration(options: {
    currentUser: FirebaseUser
    endpoint: string
    clientId?: string | null
}): Promise<void> {
    const { currentUser, endpoint, clientId } = options
    try {
        const jwt = await currentUser.getIdToken().catch(() => null)
        if (!jwt) return

        const params = new URLSearchParams()
        if (clientId) params.set('clientId', clientId)
        const url = params.toString().length > 0 ? `${endpoint}?${params.toString()}` : endpoint

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            const payload = await response.json().catch(() => null)
            console.warn('[OAuth Popup] Integration initialize failed', {
                endpoint,
                status: response.status,
                payload,
            })
        }
    } catch (error) {
        console.warn('[OAuth Popup] Integration initialize error', { endpoint, error })
    }
}

export interface OAuthConnectionOptions {
    currentUser: FirebaseUser
    authUser: AuthUser | null
    clientId?: string | null
}

export interface OAuthSignInResult {
    firebaseUser: FirebaseUser
    displayName: string | null
}

/**
 * Connect Google Ads account via OAuth popup
 */
export async function connectGoogleAdsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser, clientId: integrationClientId } = options
    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/adwords')
    provider.addScope('email')

    provider.setCustomParameters({
        prompt: 'consent',
        access_type: 'offline',
    })

    try {
        const result = await linkWithPopup(currentUser, provider)
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const tokenResponse = (result as {
            _tokenResponse?: {
                oauthAccessToken?: string
                oauthRefreshToken?: string
                refreshToken?: string
                expiresIn?: string | number
                expires_in?: string | number
            }
        })._tokenResponse

        const resolvedAccessToken = credential?.accessToken ?? tokenResponse?.oauthAccessToken ?? null
        const refreshToken = extractRefreshToken(credential, tokenResponse)
        const expiresInSeconds = Number(tokenResponse?.expiresIn ?? tokenResponse?.expires_in ?? 0)
        const accessTokenExpiresAt = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : undefined

        await persistIntegrationTokens({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'google',
            clientId: integrationClientId ?? null,
            accessToken: resolvedAccessToken,
            idToken: credential?.idToken ?? null,
            scopes: ['https://www.googleapis.com/auth/adwords', 'email'],
            refreshToken,
            accessTokenExpiresAt,
        })

        // Best-effort: populate accountId/accountName/loginCustomerId/managerCustomerId immediately.
        // This uses the existing server initialize route (which can access Google Ads developer token).
        await bestEffortInitializeIntegration({
            currentUser,
            endpoint: '/api/integrations/google/initialize',
            clientId: integrationClientId ?? null,
        })

        await enqueueSyncJob({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'google',
            clientId: integrationClientId ?? null,
        })
    } catch (error: unknown) {
        console.error('Google Ads connection error:', error)
        if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
            throw new Error('This Google account is already linked to another user.')
        }
        throw new Error('Failed to connect Google Ads. Please try again.')
    }
}

/**
 * Connect Google Analytics (GA4) account via OAuth popup
 */
export async function connectGoogleAnalyticsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser, clientId: integrationClientId } = options
    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/analytics.readonly')
    provider.addScope('email')

    provider.setCustomParameters({
        prompt: 'consent',
        access_type: 'offline',
    })

    try {
        const result = await linkWithPopup(currentUser, provider)
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const tokenResponse = (result as {
            _tokenResponse?: {
                oauthAccessToken?: string
                oauthRefreshToken?: string
                refreshToken?: string
                expiresIn?: string | number
                expires_in?: string | number
            }
        })._tokenResponse

        const resolvedAccessToken = credential?.accessToken ?? tokenResponse?.oauthAccessToken ?? null
        const refreshToken = extractRefreshToken(credential, tokenResponse)
        const expiresInSeconds = Number(tokenResponse?.expiresIn ?? tokenResponse?.expires_in ?? 0)
        const accessTokenExpiresAt = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : undefined

        await persistIntegrationTokens({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'google-analytics',
            clientId: integrationClientId ?? null,
            accessToken: resolvedAccessToken,
            idToken: credential?.idToken ?? null,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly', 'email'],
            refreshToken,
            accessTokenExpiresAt,
        })
    } catch (error: unknown) {
        // If the user already signed in with Google, the provider may already be linked.
        // In that case, reauthenticate to obtain a fresh OAuth credential + access token.
        if (isFirebaseError(error) && error.code === 'auth/provider-already-linked') {
            try {
                const result = await reauthenticateWithPopup(currentUser, provider)
                const credential = GoogleAuthProvider.credentialFromResult(result)
                const tokenResponse = (result as {
                    _tokenResponse?: {
                        oauthAccessToken?: string
                        oauthRefreshToken?: string
                        refreshToken?: string
                        expiresIn?: string | number
                        expires_in?: string | number
                    }
                })._tokenResponse

                const resolvedAccessToken = credential?.accessToken ?? tokenResponse?.oauthAccessToken ?? null
                const refreshToken = extractRefreshToken(credential, tokenResponse)
                const expiresInSeconds = Number(tokenResponse?.expiresIn ?? tokenResponse?.expires_in ?? 0)
                const accessTokenExpiresAt = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
                    ? new Date(Date.now() + expiresInSeconds * 1000)
                    : undefined

                await persistIntegrationTokens({
                    workspaceId: authUser?.agencyId ?? currentUser.uid,
                    providerId: 'google-analytics',
                    clientId: integrationClientId ?? null,
                    accessToken: resolvedAccessToken,
                    idToken: credential?.idToken ?? null,
                    scopes: ['https://www.googleapis.com/auth/analytics.readonly', 'email'],
                    refreshToken,
                    accessTokenExpiresAt,
                })
                return
            } catch (reauthError: unknown) {
                console.error('Google Analytics reauth error:', reauthError)
                throw new Error('Failed to connect Google Analytics. Please try again.')
            }
        }

        console.error('Google Analytics connection error:', error)
        if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
            throw new Error('This Google account is already linked to another user.')
        }
        throw new Error('Failed to connect Google Analytics. Please try again.')
    }
}

/**
 * Connect Facebook Ads account via OAuth popup
 */
export async function connectFacebookAdsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser, clientId: integrationClientId } = options
    const provider = new FacebookAuthProvider()
    provider.addScope('ads_management')
    provider.addScope('ads_read')
    provider.addScope('business_management')
    provider.setCustomParameters({ display: 'popup', auth_type: 'rerequest' })

    try {
        const result = await linkWithPopup(currentUser, provider)
        const credential = FacebookAuthProvider.credentialFromResult(result)

        const tokenResponse = (result as {
            _tokenResponse?: {
                oauthAccessToken?: string
                expiresIn?: string | number
                expires_in?: string | number
            }
        })._tokenResponse
        const resolvedAccessToken = credential?.accessToken ?? tokenResponse?.oauthAccessToken ?? null
        const expiresInSeconds = Number(tokenResponse?.expiresIn ?? tokenResponse?.expires_in ?? 0)
        const accessTokenExpiresAt = Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : undefined

        await persistIntegrationTokens({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'facebook',
            clientId: integrationClientId ?? null,
            accessToken: resolvedAccessToken,
            scopes: ['ads_management', 'ads_read', 'business_management'],
            accessTokenExpiresAt,
        })

        // Best-effort: populate accountId/accountName immediately.
        await bestEffortInitializeIntegration({
            currentUser,
            endpoint: '/api/integrations/meta/initialize',
            clientId: integrationClientId ?? null,
        })

        await enqueueSyncJob({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'facebook',
            clientId: integrationClientId ?? null,
        })
    } catch (error: unknown) {
        console.error('Facebook Ads connection error:', error)
        if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
            throw new Error('This Facebook account is already linked to another user.')
        }
        throw new Error('Failed to connect Facebook Ads. Please try again.')
    }
}

/**
 * Connect LinkedIn Ads account via OAuth popup
 */
export async function connectLinkedInAdsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser, clientId: integrationClientId } = options
    const provider = new OAuthProvider('linkedin.com')
    provider.addScope('r_ads')
    provider.addScope('rw_ads')

    try {
        const result = await linkWithPopup(currentUser, provider)
        const credential = OAuthProvider.credentialFromResult(result)

        await persistIntegrationTokens({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'linkedin',
            clientId: integrationClientId ?? null,
            accessToken: credential?.accessToken ?? null,
            idToken: credential?.idToken ?? null,
            scopes: ['r_ads', 'rw_ads'],
        })

        // Best-effort: populate accountId/accountName immediately.
        await bestEffortInitializeIntegration({
            currentUser,
            endpoint: '/api/integrations/linkedin/initialize',
            clientId: integrationClientId ?? null,
        })

        await enqueueSyncJob({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'linkedin',
            clientId: integrationClientId ?? null,
        })
    } catch (error: unknown) {
        console.error('LinkedIn Ads connection error:', error)
        if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
            throw new Error('This LinkedIn account is already linked to another user.')
        }
        if (isFirebaseError(error) && error.code === 'auth/operation-not-allowed') {
            throw new Error(
              "LinkedIn Ads connection is not enabled in Firebase Authentication. Enable the OAuth/OIDC provider with ID 'linkedin.com' (or contact support)."
            )
        }
        throw new Error('Failed to connect LinkedIn Ads. Please try again.')
    }
}

/**
 * Sign in with Facebook via popup
 */
export async function signInWithFacebookViaPopup(): Promise<OAuthSignInResult> {
    const provider = new FacebookAuthProvider()
    provider.addScope('email')
    provider.addScope('public_profile')

    try {
        const userCredential = await signInWithPopup(auth, provider)
        return {
            firebaseUser: userCredential.user,
            displayName: userCredential.user.displayName,
        }
    } catch (error: unknown) {
        console.error('Facebook sign-in error:', error)
        const existingUser = auth.currentUser
        if (existingUser) {
            return {
                firebaseUser: existingUser,
                displayName: existingUser.displayName,
            }
        }
        if (isFirebaseError(error) && error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in popup was closed before completion')
        }
        if (isFirebaseError(error) && error.code === 'auth/account-exists-with-different-credential') {
            throw new Error('An account already exists with the same email. Please sign in using that provider.')
        }
        if (error instanceof Error && error.message) {
            throw new Error(error.message)
        }
        throw new Error('Failed to sign in with Facebook. Please try again.')
    }
}

/**
 * Sign in with LinkedIn via popup
 */
export async function signInWithLinkedInViaPopup(): Promise<OAuthSignInResult> {
    const provider = new OAuthProvider('linkedin.com')
    provider.addScope('r_liteprofile')
    provider.addScope('r_emailaddress')

    provider.setCustomParameters({
        prompt: 'consent',
    })

    try {
        const userCredential = await signInWithPopup(auth, provider)
        return {
            firebaseUser: userCredential.user,
            displayName: userCredential.user.displayName,
        }
    } catch (error: unknown) {
        console.error('LinkedIn sign-in error:', error)
        const existingUser = auth.currentUser
        if (existingUser) {
            return {
                firebaseUser: existingUser,
                displayName: existingUser.displayName,
            }
        }
        if (isFirebaseError(error) && error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in popup was closed before completion')
        }
        if (isFirebaseError(error) && error.code === 'auth/operation-not-allowed') {
            throw new Error('LinkedIn sign-in is not enabled. Please contact support to enable this provider.')
        }
        if (error instanceof Error && error.message) {
            throw new Error(error.message)
        }
        throw new Error('Failed to sign in with LinkedIn. Please try again.')
    }
}

/**
 * Sign in with Google via popup
 */
export async function signInWithGoogleViaPopup(): Promise<OAuthSignInResult> {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
        const userCredential = await signInWithPopup(auth, provider)
        return {
            firebaseUser: userCredential.user,
            displayName: userCredential.user.displayName,
        }
    } catch (error: unknown) {
        const message = getFriendlyAuthErrorMessage(error)
        throw new Error(message)
    }
}
