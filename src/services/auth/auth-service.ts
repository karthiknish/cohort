import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth'

import type { AuthUser, SignUpData } from './types'
import { getFriendlyAuthErrorMessage } from './error-utils'
import { isValidRedirectUrl } from '@/lib/utils'

import {
  cacheIdToken,
  fetchAndCacheIdToken,
  TokenCache,
} from './token-management'

import {
  mapFirebaseUser,
  ensureUserBootstrap,
} from './user-bootstrap'

import {
  connectGoogleAdsViaPopup,
  connectFacebookAdsViaPopup,
  connectLinkedInAdsViaPopup,
  signInWithFacebookViaPopup,
  signInWithLinkedInViaPopup,
  signInWithGoogleViaPopup,
} from './oauth-providers'
import { connectGoogleAnalyticsViaPopup } from './oauth-providers'

import {
  sendPasswordResetEmail,
  verifyPasswordResetCode as verifyResetCode,
  confirmPasswordReset as confirmReset,
  updateProfile as updateProfileOp,
  changePassword as changePasswordOp,
  deleteAccount as deleteAccountOp,
  disconnectProvider as disconnectProviderOp,
  validatePasswordStrength,
} from './account-operations'

export class AuthService {
  private static instance: AuthService
  private static readonly TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000
  private static readonly TOKEN_DEFAULT_TTL_MS = 55 * 60 * 1000
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []
  private bootstrapPromises = new Map<string, Promise<void>>()
  private idTokenCache: TokenCache | null = null
  private idTokenRefreshPromise: Promise<string> | null = null
  private refreshTimeout: NodeJS.Timeout | null = null

  private initialAuthResolved = false
  private readonly initialAuthPromise: Promise<void>
  private resolveInitialAuth!: () => void

  private constructor() {
    this.initialAuthPromise = new Promise((resolve) => {
      this.resolveInitialAuth = resolve
    })

    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn('[AuthService] Failed to set auth persistence:', error)
      })
    }

    onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      this.clearIdTokenCache()
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout)
        this.refreshTimeout = null
      }

      if (firebaseUser) {
        try {
          await this.ensureUserBootstrap(firebaseUser, firebaseUser.displayName)
          const authUser = await mapFirebaseUser(firebaseUser)
          this.currentUser = authUser
          this.notifyListeners(authUser)
          this.scheduleTokenRefresh(firebaseUser)
        } catch (error) {
          console.error('Error mapping Firebase user:', error)
          this.currentUser = null
          this.notifyListeners(null)
        }
      } else {
        this.currentUser = null
        this.notifyListeners(null)
      }

      if (!this.initialAuthResolved) {
        this.initialAuthResolved = true
        this.resolveInitialAuth()
      }
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private scheduleTokenRefresh(firebaseUser: FirebaseUser): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout)

    const buffer = 5 * 60 * 1000
    const now = Date.now()
    const expiresAt = this.idTokenCache?.expiresAt ?? (now + AuthService.TOKEN_DEFAULT_TTL_MS)
    const delay = Math.max(0, expiresAt - now - buffer)

    this.refreshTimeout = setTimeout(async () => {
      try {
        await this.getIdToken(true)
      } catch (error) {
        const isNetworkError =
          (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
          (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'auth/network-request-failed')

        if (!isNetworkError) {
          console.error('Background token refresh failed:', error)
        }

        // Retry in 1 minute regardless of error type
        this.refreshTimeout = setTimeout(() => this.scheduleTokenRefresh(firebaseUser), 60000)
      }
    }, delay)
  }

  private clearIdTokenCache(): void {
    this.idTokenCache = null
    this.idTokenRefreshPromise = null
  }

  async getIdToken(forceRefresh = false): Promise<string> {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('No authenticated user')
    }

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

    this.idTokenRefreshPromise = (async () => {
      try {
        return await fetchAndCacheIdToken(
          currentUser,
          shouldForceRefresh,
          (token, expiresAt) => {
            this.idTokenCache = cacheIdToken(token, expiresAt)
          }
        )
      } catch (error) {
        this.clearIdTokenCache()
        throw error
      } finally {
        this.idTokenRefreshPromise = null
      }
    })()

    return this.idTokenRefreshPromise
  }

  private ensureUserBootstrap(firebaseUser: FirebaseUser, name?: string | null): Promise<void> {
    const uid = firebaseUser.uid
    if (!uid) return Promise.resolve()

    const existingPromise = this.bootstrapPromises.get(uid)
    if (existingPromise) return existingPromise

    const promise = (async () => {
      const result = await ensureUserBootstrap(
        firebaseUser,
        (force) => this.getIdToken(force),
        name
      )

      if (result.claimsUpdated) {
        await this.getIdToken(true)
      }
    })().finally(() => {
      this.bootstrapPromises.delete(uid)
    })

    this.bootstrapPromises.set(uid, promise)
    return promise
  }

  /**
   * AD ACCOUNT CONNECTIONS
   */

  async connectGoogleAdsAccount(clientId?: string | null): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    await connectGoogleAdsViaPopup({ currentUser, authUser: this.currentUser, clientId })
  }

    async connectGoogleAnalyticsAccount(clientId?: string | null): Promise<void> {
      const currentUser = this.ensureAuthenticatedFirebaseUser()
      await connectGoogleAnalyticsViaPopup({ currentUser, authUser: this.currentUser, clientId })
    }

  async connectFacebookAdsAccount(clientId?: string | null): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    await connectFacebookAdsViaPopup({ currentUser, authUser: this.currentUser, clientId })
  }

  async connectLinkedInAdsAccount(clientId?: string | null): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    await connectLinkedInAdsViaPopup({ currentUser, authUser: this.currentUser, clientId })
  }

  async startMetaOauth(redirect?: string, clientId?: string | null): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new Error('Invalid redirect URL')
    }
    const idToken = await this.getIdToken()
    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    const search = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`/api/integrations/meta/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    const payload = (await response.json().catch(() => ({}))) as unknown

    // Most endpoints in this codebase use createApiHandler which wraps responses
    // in { success, data, error }. Support both wrapped and legacy shapes.
    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start Meta OAuth'
        throw new Error(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new Error('Meta OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start Meta OAuth'
      throw new Error(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new Error('Meta OAuth did not return a URL')
  }

  async startTikTokOauth(redirect?: string, clientId?: string | null): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new Error('Invalid redirect URL')
    }
    const idToken = await this.getIdToken()
    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    const search = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`/api/integrations/tiktok/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    const payload = (await response.json().catch(() => ({}))) as unknown

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start TikTok OAuth'
        throw new Error(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new Error('TikTok OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start TikTok OAuth'
      throw new Error(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new Error('TikTok OAuth did not return a URL')
  }

  /**
   * AUTHENTICATION METHODS
   */

  async signInWithFacebook(): Promise<AuthUser> {
    const { firebaseUser, displayName } = await signInWithFacebookViaPopup()
    await this.ensureUserBootstrap(firebaseUser, displayName)
    return await mapFirebaseUser(firebaseUser)
  }

  async signInWithLinkedIn(): Promise<AuthUser> {
    const { firebaseUser, displayName } = await signInWithLinkedInViaPopup()
    await this.ensureUserBootstrap(firebaseUser, displayName)
    return await mapFirebaseUser(firebaseUser)
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const { firebaseUser, displayName } = await signInWithGoogleViaPopup()
    await this.ensureUserBootstrap(firebaseUser, displayName)
    return await mapFirebaseUser(firebaseUser)
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      const message = getFriendlyAuthErrorMessage(error)
      throw new Error(message)
    }
  }

  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      validatePasswordStrength(data.password)
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      if (data.displayName && userCredential.user) {
        try {
          await updateFirebaseProfile(userCredential.user, { displayName: data.displayName })
        } catch (error) {
          console.warn('Failed to set display name during sign up:', error)
        }
      }

      await this.ensureUserBootstrap(userCredential.user, data.displayName ?? userCredential.user.displayName ?? data.email)
      return await mapFirebaseUser(userCredential.user)
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

  /**
   * ACCOUNT MANAGEMENT
   */

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(email)
  }

  async verifyPasswordResetCode(oobCode: string): Promise<string> {
    return await verifyResetCode(oobCode)
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    await confirmReset(oobCode, newPassword)
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) throw new Error('No authenticated user')
    return await updateProfileOp(
      this.currentUser,
      data,
      (updatedUser) => {
        this.currentUser = updatedUser
        this.notifyListeners(updatedUser)
      }
    )
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) throw new Error('No authenticated user')
    await changePasswordOp(currentPassword, newPassword)
  }

  async deleteAccount(password?: string): Promise<void> {
    if (!this.currentUser) throw new Error('No authenticated user')
    await deleteAccountOp(
      (force) => this.getIdToken(force),
      () => {
        this.clearIdTokenCache()
        this.currentUser = null
        this.notifyListeners(null)
      },
      password
    )
  }

  async disconnectProvider(providerId: string, clientId?: string | null): Promise<void> {
    await disconnectProviderOp(() => this.getIdToken(), providerId, clientId)
  }

  /**
   * HELPERS
   */

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    if (this.initialAuthResolved) {
      callback(this.currentUser)
    }
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * Resolves once Firebase has finished restoring the initial auth state.
   * Useful to avoid treating the pre-restore null user as a sign-out.
   */
  async waitForInitialAuth(): Promise<void> {
    await this.initialAuthPromise
  }

  private notifyListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach((listener) => listener(user))
  }

  private ensureAuthenticatedFirebaseUser(): FirebaseUser {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('You must be signed in to connect ad accounts')
    }
    return currentUser
  }
}

export const authService = AuthService.getInstance()
