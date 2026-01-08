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
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth'
import { extractRefreshToken, isFirebaseError } from './utils'
import { getFriendlyAuthErrorMessage } from './error-utils'
import type { AuthUser } from './types'

export interface OAuthConnectionOptions {
    currentUser: FirebaseUser
    authUser: AuthUser | null
}

export interface OAuthSignInResult {
    firebaseUser: FirebaseUser
    displayName: string | null
}

/**
 * Connect Google Ads account via OAuth popup
 */
export async function connectGoogleAdsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser } = options
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
            accessToken: resolvedAccessToken,
            idToken: credential?.idToken ?? null,
            scopes: ['https://www.googleapis.com/auth/adwords', 'email'],
            refreshToken,
            accessTokenExpiresAt,
        })
        await enqueueSyncJob({ workspaceId: authUser?.agencyId ?? currentUser.uid, providerId: 'google' })
    } catch (error: unknown) {
        console.error('Google Ads connection error:', error)
        if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
            throw new Error('This Google account is already linked to another user.')
        }
        throw new Error('Failed to connect Google Ads. Please try again.')
    }
}

/**
 * Connect Facebook Ads account via OAuth popup
 */
export async function connectFacebookAdsViaPopup(options: OAuthConnectionOptions): Promise<void> {
    const { currentUser, authUser } = options
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
            accessToken: resolvedAccessToken,
            scopes: ['ads_management', 'ads_read', 'business_management'],
            accessTokenExpiresAt,
        })

        await enqueueSyncJob({ workspaceId: authUser?.agencyId ?? currentUser.uid, providerId: 'facebook' })
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
    const { currentUser, authUser } = options
    const provider = new OAuthProvider('linkedin.com')
    provider.addScope('r_ads')
    provider.addScope('rw_ads')

    try {
        const result = await linkWithPopup(currentUser, provider)
        const credential = OAuthProvider.credentialFromResult(result)

        await persistIntegrationTokens({
            workspaceId: authUser?.agencyId ?? currentUser.uid,
            providerId: 'linkedin',
            accessToken: credential?.accessToken ?? null,
            idToken: credential?.idToken ?? null,
            scopes: ['r_ads', 'rw_ads'],
        })
        await enqueueSyncJob({ workspaceId: authUser?.agencyId ?? currentUser.uid, providerId: 'linkedin' })
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
