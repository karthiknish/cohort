import { auth, db } from '@/lib/firebase'
import { enqueueSyncJob, persistIntegrationTokens } from '@/lib/firestore-integrations'
import { doc, getDoc } from 'firebase/firestore'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  updateProfile as updateFirebaseProfile,
  linkWithPopup,
  User as FirebaseUser,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
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
import { isValidRedirectUrl } from '@/lib/utils'
import { toISO } from '@/lib/dates'

export class AuthService {
  private static instance: AuthService
  private static readonly TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000
  private static readonly TOKEN_DEFAULT_TTL_MS = 55 * 60 * 1000
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []
  private bootstrapPromises = new Map<string, Promise<void>>()
  private idTokenCache: { token: string; expiresAt: number } | null = null
  private idTokenRefreshPromise: Promise<string> | null = null
  private refreshTimeout: NodeJS.Timeout | null = null

  private constructor() {
    onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      this.clearIdTokenCache()
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout)
        this.refreshTimeout = null
      }

      if (firebaseUser) {
        try {
          await this.ensureUserBootstrap(firebaseUser, firebaseUser.displayName)
          const authUser = await this.mapFirebaseUser(firebaseUser)
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
    })
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
          (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'auth/network-request-failed')

        if (!isNetworkError) {
          console.error('Background token refresh failed:', error)
        }
        
        // Retry in 1 minute regardless of error type
        this.refreshTimeout = setTimeout(() => this.scheduleTokenRefresh(firebaseUser), 60000)
      }
    }, delay)
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
    const [role, status, agencyId] = await Promise.all([
      this.resolveUserRole(firebaseUser),
      this.resolveUserStatus(firebaseUser),
      this.resolveUserAgency(firebaseUser),
    ])

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      phoneNumber: firebaseUser.phoneNumber ?? null,
      photoURL: firebaseUser.photoURL ?? null,
      role,
      status,
      agencyId,
      createdAt: firebaseUser.metadata.creationTime
        ? (toISO(firebaseUser.metadata.creationTime) || toISO())
        : toISO(),
      updatedAt: toISO(),
      notificationPreferences: {
        whatsapp: {
          tasks: false,
          collaboration: false,
        },
      },
    }
  }

  private async resolveUserAgency(firebaseUser: FirebaseUser): Promise<string> {
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      const claimAgency = tokenResult?.claims?.agencyId
      if (typeof claimAgency === 'string' && claimAgency.trim().length > 0) {
        return claimAgency.trim()
      }
    } catch (error) {
      console.warn('Failed to resolve agencyId from token claims', error)
    }

    if (typeof window !== 'undefined') {
      const cachedAgency = window.localStorage.getItem(`cohorts_agency_${firebaseUser.uid}`)
      if (cachedAgency) return cachedAgency
    }

    // Fallback to user document in Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        if (typeof data.agencyId === 'string' && data.agencyId.trim().length > 0) {
          const agencyId = data.agencyId.trim()
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(`cohorts_agency_${firebaseUser.uid}`, agencyId)
          }
          return agencyId
        }
      }
    } catch (error) {
      console.warn('Failed to resolve agencyId from Firestore', error)
    }

    return firebaseUser.uid
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

  private async fetchAndCacheIdToken(
    firebaseUser: FirebaseUser,
    forceRefresh: boolean,
    attempt = 0
  ): Promise<string> {
    try {
      const result = await firebaseUser.getIdTokenResult(forceRefresh)
      if (!result?.token) {
        throw new Error('Failed to resolve authentication token')
      }

      if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
        this.cacheIdToken(result.token, result.expirationTime)
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
        return this.fetchAndCacheIdToken(firebaseUser, forceRefresh, attempt + 1)
      }

      throw error
    }
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

    const lockKey = `cohorts_bootstrap_lock_${uid}`
    const bootstrappedKey = `cohorts_bootstrapped_${uid}`

    const promise = (async () => {
      const lastBootstrap = localStorage.getItem(bootstrappedKey)
      if (lastBootstrap && Date.now() - parseInt(lastBootstrap, 10) < 3600000) {
        return
      }

      type BootstrapLock = { ownerId: string; expiresAt: number }
      const LOCK_TTL_MS = 60_000
      const MAX_WAIT_MS = 15_000
      const HEARTBEAT_MS = 10_000

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      const ownerId = (() => {
        try {
          const key = 'cohorts_bootstrap_owner'
          const existing = sessionStorage.getItem(key)
          if (existing) return existing
          const next = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
          sessionStorage.setItem(key, next)
          return next
        } catch {
          return Math.random().toString(36).slice(2)
        }
      })()

      const readLock = (): BootstrapLock | null => {
        try {
          const raw = localStorage.getItem(lockKey)
          if (!raw) return null
          const parsed = JSON.parse(raw) as Partial<BootstrapLock> | null
          if (!parsed || typeof parsed.ownerId !== 'string' || typeof parsed.expiresAt !== 'number') {
            return null
          }
          return { ownerId: parsed.ownerId, expiresAt: parsed.expiresAt }
        } catch {
          return null
        }
      }

      const writeLock = (lock: BootstrapLock) => {
        localStorage.setItem(lockKey, JSON.stringify(lock))
      }

      const clearLockIfOwned = () => {
        try {
          const lock = readLock()
          if (lock?.ownerId === ownerId) {
            localStorage.removeItem(lockKey)
          }
        } catch {
          // ignore
        }
      }

      const waitForLockChange = async (timeoutMs: number) => {
        if (typeof window === 'undefined') {
          await sleep(timeoutMs)
          return
        }

        await new Promise<void>((resolve) => {
          let settled = false
          const onStorage = (event: StorageEvent) => {
            if (event.key !== lockKey) return
            if (settled) return
            settled = true
            window.removeEventListener('storage', onStorage)
            resolve()
          }

          window.addEventListener('storage', onStorage)
          setTimeout(() => {
            if (settled) return
            settled = true
            window.removeEventListener('storage', onStorage)
            resolve()
          }, timeoutMs)
        })
      }

      // Acquire a cross-tab lock to avoid multiple bootstraps racing.
      // If another tab is already bootstrapping, prefer waiting briefly and then skipping.
      const startWait = Date.now()
      while (true) {
        const now = Date.now()
        const lock = readLock()
        if (!lock || lock.expiresAt <= now || lock.ownerId === ownerId) {
          writeLock({ ownerId, expiresAt: now + LOCK_TTL_MS })
          break
        }

        if (now - startWait > MAX_WAIT_MS) {
          // Another tab likely completed bootstrap; avoid starting a parallel one.
          return
        }

        // Wait for either the lock to change (storage event) or a small timeout.
        await waitForLockChange(1000)
      }

      const heartbeat = setInterval(() => {
        try {
          const lock = readLock()
          if (lock?.ownerId === ownerId) {
            writeLock({ ownerId, expiresAt: Date.now() + LOCK_TTL_MS })
          }
        } catch {
          // ignore
        }
      }, HEARTBEAT_MS)

      try {
        const idToken = await this.fetchAndCacheIdToken(firebaseUser, false)
        const payloadName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined

        const response = await fetch('/api/auth/bootstrap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payloadName ? { name: payloadName } : {}),
        })

        let payload: { error?: string; claimsUpdated?: boolean; agencyId?: string } | null = null
        try {
          payload = (await response.json()) as { error?: string; claimsUpdated?: boolean; agencyId?: string } | null
        } catch {
          payload = null
        }

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to synchronise your account profile'
          throw new Error(message)
        }

        if (payload.agencyId) {
          localStorage.setItem(`cohorts_agency_${uid}`, payload.agencyId)
        }

        localStorage.setItem(bootstrappedKey, Date.now().toString())

        if (payload.claimsUpdated) {
          await this.fetchAndCacheIdToken(firebaseUser, true)
        }
      } finally {
        clearInterval(heartbeat)
        clearLockIfOwned()
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
        workspaceId: this.currentUser?.agencyId ?? currentUser.uid,
        providerId: 'google',
        accessToken: resolvedAccessToken,
        idToken: credential?.idToken ?? null,
        scopes: ['https://www.googleapis.com/auth/adwords', 'email'],
        refreshToken,
        accessTokenExpiresAt,
      })
      await enqueueSyncJob({ workspaceId: this.currentUser?.agencyId ?? currentUser.uid, providerId: 'google' })
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
        workspaceId: this.currentUser?.agencyId ?? currentUser.uid,
        providerId: 'facebook',
        accessToken: resolvedAccessToken,
        scopes: ['ads_management', 'ads_read', 'business_management'],
        accessTokenExpiresAt,
      })

      await enqueueSyncJob({ workspaceId: this.currentUser?.agencyId ?? currentUser.uid, providerId: 'facebook' })
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
        workspaceId: this.currentUser?.agencyId ?? currentUser.uid,
        providerId: 'linkedin',
        accessToken: credential?.accessToken ?? null,
        idToken: credential?.idToken ?? null,
        scopes: ['r_ads', 'rw_ads'],
      })
      await enqueueSyncJob({ workspaceId: this.currentUser?.agencyId ?? currentUser.uid, providerId: 'linkedin' })
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
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('No authenticated user')
    }

    const now = Date.now()
    const buffer = AuthService.TOKEN_EXPIRATION_BUFFER_MS

    // 1. Return cached token if valid and not forcing refresh
    if (!forceRefresh && this.idTokenCache && this.idTokenCache.expiresAt - buffer > now) {
      return this.idTokenCache.token
    }

    // 2. Return existing refresh promise if one is in flight
    if (this.idTokenRefreshPromise) {
      return this.idTokenRefreshPromise
    }

    // 3. Start a new refresh
    const shouldForceRefresh =
      forceRefresh ||
      !this.idTokenCache ||
      this.idTokenCache.expiresAt - buffer <= now

    this.idTokenRefreshPromise = (async () => {
      try {
        return await this.fetchAndCacheIdToken(currentUser, shouldForceRefresh)
      } catch (error) {
        this.clearIdTokenCache()
        throw error
      } finally {
        this.idTokenRefreshPromise = null
      }
    })()

    return this.idTokenRefreshPromise
  }

  async startMetaOauth(redirect?: string): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new Error('Invalid redirect URL')
    }
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

  async startTikTokOauth(redirect?: string): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new Error('Invalid redirect URL')
    }
    const idToken = await this.getIdToken()
    const search = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    const response = await fetch(`/api/integrations/tiktok/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      const message = typeof payload?.error === 'string' ? payload.error : 'Failed to start TikTok OAuth'
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
      this.validatePasswordStrength(data.password)
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      if (data.displayName && userCredential.user) {
        try {
          await updateFirebaseProfile(userCredential.user, { displayName: data.displayName })
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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const actionCodeSettings = { 
        url: `${appUrl}/auth/reset`,
        handleCodeInApp: true
      }

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
    const currentUser = this.currentUser
    if (!currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('No authenticated user')
      }

      const profileUpdates: { displayName?: string | null; photoURL?: string | null } = {}
      let resolvedName: string | undefined
      if (typeof data.name === 'string') {
        resolvedName = data.name.trim()
        if (resolvedName.length > 0 && resolvedName !== firebaseUser.displayName) {
          profileUpdates.displayName = resolvedName
        }
      }

      const hasPhotoUpdate = Object.prototype.hasOwnProperty.call(data, 'photoURL')
      if (hasPhotoUpdate) {
        profileUpdates.photoURL = data.photoURL ?? null
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateFirebaseProfile(firebaseUser, profileUpdates)
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        ...data,
        name: typeof resolvedName === 'string' && resolvedName.length > 0 ? resolvedName : currentUser.name,
        photoURL: hasPhotoUpdate ? data.photoURL ?? null : currentUser.photoURL,
        updatedAt: toISO(),
      }

      this.currentUser = updatedUser
      this.notifyListeners(updatedUser)
      return updatedUser
    } catch (error: unknown) {
      console.error('Profile update error:', error)
      throw new Error('Failed to update profile')
    }
  }

  async reauthenticate(password: string): Promise<void> {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error('No authenticated user')
    }

    const credential = EmailAuthProvider.credential(user.email, password)
    try {
      await reauthenticateWithCredential(user, credential)
    } catch (error: unknown) {
      console.error('Re-authentication error:', error)
      if (isFirebaseError(error) && error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password')
      }
      throw new Error('Failed to re-authenticate')
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required')
    }

    this.validatePasswordStrength(newPassword)

    try {
      await this.reauthenticate(currentPassword)
      const user = auth.currentUser
      if (!user) throw new Error('No authenticated user')
      await updatePassword(user, newPassword)
      console.log('Password changed successfully')
    } catch (error: unknown) {
      console.error('Password change error:', error)
      if (error instanceof Error) throw error
      throw new Error('Failed to change password')
    }
  }

  async deleteAccount(password?: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No authenticated user')

      if (password) {
        await this.reauthenticate(password)
      }

      const token = await this.getIdToken(true)
      const response = await fetch('/api/auth/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        const message = payload?.error ?? 'Failed to delete account'
        throw new Error(message)
      }

      await deleteUser(user)
      this.clearIdTokenCache()
      this.currentUser = null
      this.notifyListeners(null)
    } catch (error: unknown) {
      console.error('Account deletion error:', error)
      if (isFirebaseError(error) && error.code === 'auth/requires-recent-login') {
        throw new Error('This operation requires recent authentication. Please provide your password.')
      }
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw new Error('Failed to delete account')
    }
  }

  async disconnectProvider(providerId: string): Promise<void> {
    const token = await this.getIdToken()
    const response = await fetch('/api/integrations/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      const message = typeof payload?.error === 'string' ? payload.error : 'Failed to disconnect provider'
      throw new Error(message)
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character')
    }
  }
}

export const authService = AuthService.getInstance()
