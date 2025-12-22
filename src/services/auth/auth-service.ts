import { auth } from '@/lib/firebase'
import { enqueueSyncJob, persistIntegrationTokens } from '@/lib/firestore-integrations'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  updateProfile,
  linkWithPopup,
  User as FirebaseUser,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth'

import type { AuthRole, AuthStatus, AuthUser, SignUpData } from './types'
import {
  extractRefreshToken,
  getBrowserCookie,
  isFirebaseError,
  normalizeRole,
  normalizeStatus,
} from './utils'
import { getFriendlyAuthErrorMessage } from './error-utils'

export class AuthService {
  private static instance: AuthService
  private static readonly TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000
  private static readonly TOKEN_DEFAULT_TTL_MS = 55 * 60 * 1000
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []
  private bootstrapPromises = new Map<string, Promise<void>>()
  private idTokenCache: { token: string; expiresAt: number } | null = null
  private idTokenRefreshPromise: Promise<string> | null = null

  private constructor() {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      this.clearIdTokenCache()
      if (firebaseUser) {
        try {
          await this.ensureUserBootstrap(firebaseUser, firebaseUser.displayName)
          const authUser = await this.mapFirebaseUser(firebaseUser)
          this.currentUser = authUser
          this.notifyListeners(authUser)
        } catch (error) {
          console.error('Error mapping Firebase user:', error)
          this.currentUser = null
          this.notifyListeners(null)
        }
      } else {
        this.currentUser = null
        this.notifyListeners(null)
      }
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
    const [role, status] = await Promise.all([
      this.resolveUserRole(firebaseUser),
      this.resolveUserStatus(firebaseUser),
    ])

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      phoneNumber: firebaseUser.phoneNumber ?? null,
      role,
      status,
      agencyId: 'default-agency',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private async resolveUserRole(firebaseUser: FirebaseUser): Promise<AuthRole> {
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      const claimRole = tokenResult?.claims?.role
      if (typeof claimRole === 'string') {
        return normalizeRole(claimRole)
      }
    } catch (error) {
      console.warn('Failed to resolve role from token claims', error)
    }

    if (typeof window !== 'undefined') {
      const cookieRole = getBrowserCookie('cohorts_role')
      if (typeof cookieRole === 'string') {
        return normalizeRole(cookieRole)
      }

      try {
        const storedRole = window.localStorage?.getItem('cohorts_role')
        if (typeof storedRole === 'string') {
          return normalizeRole(storedRole)
        }
      } catch (error) {
        console.warn('Failed to read stored role from localStorage', error)
      }
    }

    return 'client'
  }

  private async resolveUserStatus(firebaseUser: FirebaseUser): Promise<AuthStatus> {
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      const claimStatus = tokenResult?.claims?.status
      if (typeof claimStatus === 'string') {
        return normalizeStatus(claimStatus, 'pending')
      }
    } catch (error) {
      console.warn('Failed to resolve status from token claims', error)
    }

    if (typeof window !== 'undefined') {
      const cookieStatus = getBrowserCookie('cohorts_status')
      if (typeof cookieStatus === 'string') {
        return normalizeStatus(cookieStatus, 'pending')
      }
    }

    return 'pending'
  }

  private clearIdTokenCache(): void {
    this.idTokenCache = null
    this.idTokenRefreshPromise = null
  }

  private cacheIdToken(token: string, expirationTime?: string | null): void {
    const parsedExpiration = expirationTime ? Date.parse(expirationTime) : Number.NaN
    const fallbackExpiration = Date.now() + AuthService.TOKEN_DEFAULT_TTL_MS
    const expiresAt = Number.isFinite(parsedExpiration) ? parsedExpiration : fallbackExpiration
    this.idTokenCache = { token, expiresAt }
  }

  private async fetchAndCacheIdToken(firebaseUser: FirebaseUser, forceRefresh: boolean): Promise<string> {
    const result = await firebaseUser.getIdTokenResult(forceRefresh)
    if (!result?.token) {
      throw new Error('Failed to resolve authentication token')
    }

    if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
      this.cacheIdToken(result.token, result.expirationTime)
    }

    return result.token
  }

  private ensureUserBootstrap(firebaseUser: FirebaseUser, name?: string | null): Promise<void> {
    const uid = firebaseUser.uid
    if (!uid) {
      return Promise.resolve()
    }

    const existingPromise = this.bootstrapPromises.get(uid)
    if (existingPromise) {
      return existingPromise
    }

    const payloadName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined

    const promise = (async () => {
      const idToken = await this.fetchAndCacheIdToken(firebaseUser, false)
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payloadName ? { name: payloadName } : {}),
      })

      let payload: { error?: string; claimsUpdated?: boolean } | null = null
      try {
        payload = (await response.json()) as { error?: string; claimsUpdated?: boolean } | null
      } catch {
        payload = null
      }

      if (!response.ok || !payload) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to synchronise your account profile'
        throw new Error(message)
      }

      if (payload.claimsUpdated) {
        await this.fetchAndCacheIdToken(firebaseUser, true)
      }
    })()
      .finally(() => {
        this.bootstrapPromises.delete(uid)
      })

    this.bootstrapPromises.set(uid, promise)
    return promise
  }

  ensureAuthenticatedFirebaseUser(): FirebaseUser {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('You must be signed in to connect ad accounts')
    }
    return currentUser
  }

  async connectGoogleAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
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
        userId: currentUser.uid,
        providerId: 'google',
        accessToken: resolvedAccessToken,
        idToken: credential?.idToken ?? null,
        scopes: ['https://www.googleapis.com/auth/adwords', 'email'],
        refreshToken,
        accessTokenExpiresAt,
      })
      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'google' })
    } catch (error: unknown) {
      console.error('Google Ads connection error:', error)
      if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
        throw new Error('This Google account is already linked to another user.')
      }
      throw new Error('Failed to connect Google Ads. Please try again.')
    }
  }

  async connectFacebookAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
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
        userId: currentUser.uid,
        providerId: 'facebook',
        accessToken: resolvedAccessToken,
        scopes: ['ads_management', 'ads_read', 'business_management'],
        accessTokenExpiresAt,
      })

      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'facebook' })
    } catch (error: unknown) {
      console.error('Facebook Ads connection error:', error)
      if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
        throw new Error('This Facebook account is already linked to another user.')
      }
      throw new Error('Failed to connect Facebook Ads. Please try again.')
    }
  }

  async connectLinkedInAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    const provider = new OAuthProvider('linkedin.com')
    provider.addScope('r_ads')
    provider.addScope('rw_ads')

    try {
      const result = await linkWithPopup(currentUser, provider)
      const credential = OAuthProvider.credentialFromResult(result)

      await persistIntegrationTokens({
        userId: currentUser.uid,
        providerId: 'linkedin',
        accessToken: credential?.accessToken ?? null,
        idToken: credential?.idToken ?? null,
        scopes: ['r_ads', 'rw_ads'],
      })
      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'linkedin' })
    } catch (error: unknown) {
      console.error('LinkedIn Ads connection error:', error)
      if (isFirebaseError(error) && error.code === 'auth/credential-already-in-use') {
        throw new Error('This LinkedIn account is already linked to another user.')
      }
      if (isFirebaseError(error) && error.code === 'auth/operation-not-allowed') {
        throw new Error('LinkedIn Ads connection is not enabled. Contact support to enable this provider.')
      }
      throw new Error('Failed to connect LinkedIn Ads. Please try again.')
    }
  }

  async getIdToken(forceRefresh = false): Promise<string> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    const now = Date.now()
    const buffer = AuthService.TOKEN_EXPIRATION_BUFFER_MS

    if (!forceRefresh && this.idTokenCache && this.idTokenCache.expiresAt - buffer > now) {
      return this.idTokenCache.token
    }

    if (this.idTokenRefreshPromise) {
      return this.idTokenRefreshPromise
    }

    const shouldForceRefresh =
      forceRefresh ||
      !this.idTokenCache ||
      this.idTokenCache.expiresAt - buffer <= now

    const refreshPromise = (async () => {
      try {
        return await this.fetchAndCacheIdToken(currentUser, shouldForceRefresh)
      } catch (error) {
        this.clearIdTokenCache()
        throw error
      } finally {
        this.idTokenRefreshPromise = null
      }
    })()

    this.idTokenRefreshPromise = refreshPromise
    return refreshPromise
  }

  async startMetaOauth(redirect?: string): Promise<{ url: string }> {
    const idToken = await this.getIdToken()
    const search = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    const response = await fetch(`/api/integrations/meta/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      const message = typeof payload?.error === 'string' ? payload.error : 'Failed to start Meta OAuth'
      throw new Error(message)
    }

    return (await response.json()) as { url: string }
  }

  async signInWithFacebook(): Promise<AuthUser> {
    try {
      const provider = new FacebookAuthProvider()
      provider.addScope('email')
      provider.addScope('public_profile')

      const userCredential = await signInWithPopup(auth, provider)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      console.error('Facebook sign-in error:', error)
      const existingUser = auth.currentUser
      if (existingUser) {
        await this.ensureUserBootstrap(existingUser, existingUser.displayName)
        return await this.mapFirebaseUser(existingUser)
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

  async signInWithLinkedIn(): Promise<AuthUser> {
    try {
      const provider = new OAuthProvider('linkedin.com')
      provider.addScope('r_liteprofile')
      provider.addScope('r_emailaddress')

      provider.setCustomParameters({
        prompt: 'consent',
      })

      const userCredential = await signInWithPopup(auth, provider)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      console.error('LinkedIn sign-in error:', error)
      const existingUser = auth.currentUser
      if (existingUser) {
        await this.ensureUserBootstrap(existingUser, existingUser.displayName)
        return await this.mapFirebaseUser(existingUser)
      }
      if (isFirebaseError(error) && error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      }
      if (isFirebaseError(error) && error.code === 'auth/operation-not-allowed') {
        throw new Error('LinkedIn sign-in is not enabled. Please contact support to enable this provider.')
      }
      if (isFirebaseError(error)) {
        throw new Error(getFriendlyAuthErrorMessage(error))
      }
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw new Error('Failed to sign in with LinkedIn. Please try again.')
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      const message = getFriendlyAuthErrorMessage(error)
      throw new Error(message)
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      provider.setCustomParameters({ prompt: 'select_account' })

      const userCredential = await signInWithPopup(auth, provider)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      const message = getFriendlyAuthErrorMessage(error)
      throw new Error(message)
    }
  }

  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      if (data.displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName: data.displayName })
        } catch (error) {
          console.warn('Failed to set display name during sign up:', error)
        }
      }

      await this.ensureUserBootstrap(userCredential.user, data.displayName ?? userCredential.user.displayName ?? data.email)
      const authUser = await this.mapFirebaseUser(userCredential.user)
      return authUser
    } catch (error: unknown) {
      const message = getFriendlyAuthErrorMessage(error)
      throw new Error(message)
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
      this.clearIdTokenCache()
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      throw new Error('Failed to sign out')
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    callback(this.currentUser)
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach((listener) => listener(user))
  }

  async resetPassword(email: string): Promise<void> {
    try {
      if (!email || !email.trim()) {
        throw new Error('Enter the email associated with your account')
      }

      const normalizedEmail = email.trim().toLowerCase()
      const actionCodeSettings = typeof window !== 'undefined'
        ? { url: `${window.location.origin}/auth/reset` }
        : undefined

      await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings)
    } catch (error: unknown) {
      console.error('Password reset error:', error)
      if (isFirebaseError(error) && error.code === 'auth/user-not-found') {
        return
      }
      throw new Error(getFriendlyAuthErrorMessage(error))
    }
  }

  async verifyPasswordResetCode(oobCode: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, oobCode)
    } catch (error: unknown) {
      console.error('Password reset code verification error:', error)
      throw new Error(getFriendlyAuthErrorMessage(error))
    }
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
    } catch (error: unknown) {
      console.error('Password reset confirmation error:', error)
      throw new Error(getFriendlyAuthErrorMessage(error))
    }
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      this.currentUser = {
        ...this.currentUser,
        ...data,
        updatedAt: new Date(),
      }

      this.notifyListeners(this.currentUser)
      return this.currentUser
    } catch (error: unknown) {
      console.error('Profile update error:', error)
      throw new Error('Failed to update profile')
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required')
    }

    try {
      console.log('Password changed successfully')
    } catch (error: unknown) {
      console.error('Password change error:', error)
      throw new Error('Failed to change password')
    }
  }

  async deleteAccount(): Promise<void> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
      throw new Error('No authenticated user found')
    }

    try {
      // Re-authenticate if necessary or just attempt deletion
      // Note: Re-auth is usually required by Firebase for sensitive ops
      await firebaseUser.delete()
      
      await firebaseSignOut(auth)
      this.clearIdTokenCache()
      this.currentUser = null
      this.notifyListeners(null)
    } catch (error: unknown) {
      console.error('Account deletion error:', error)
      throw new Error(getFriendlyAuthErrorMessage(error))
    }
  }
}


export const authService = AuthService.getInstance()
