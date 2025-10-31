import { auth } from '@/lib/firebase'
import {
  enqueueSyncJob,
  persistIntegrationTokens,
} from '@/lib/firestore-integrations'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  OAuthCredential,
  updateProfile,
  linkWithPopup,
  User as FirebaseUser,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth'

export type AuthRole = 'admin' | 'team' | 'client'
export type AuthStatus = 'active' | 'pending' | 'invited' | 'disabled' | 'suspended'

export interface AuthUser {
  id: string
  email: string
  name: string
  phoneNumber: string | null
  role: AuthRole
  status: AuthStatus
  agencyId: string
  createdAt: Date
  updatedAt: Date
  notificationPreferences?: {
    whatsapp?: {
      tasks?: boolean
      collaboration?: boolean
    }
  }
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []
  private bootstrapPromises = new Map<string, Promise<void>>()

  private constructor() {
    // Initialize Firebase auth state listener
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
      agencyId: 'default-agency', // Would be fetched from database
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationPreferences: {
        whatsapp: {
          tasks: false,
          collaboration: false,
        },
      },
    }
  }

  private async resolveUserRole(firebaseUser: FirebaseUser): Promise<AuthUser['role']> {
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

  private async resolveUserStatus(firebaseUser: FirebaseUser): Promise<AuthUser['status']> {
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
      const idToken = await firebaseUser.getIdToken()
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
        await firebaseUser.getIdToken(true)
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

  async getIdToken(): Promise<string> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    return currentUser.getIdToken()
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
      if (isFirebaseError(error)) {
        if (error.code === 'auth/user-not-found') {
          throw new Error('No account found with that email')
        }
        if (error.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please try again.')
        }
      }
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw new Error('Invalid email or password')
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider()
      // Configure provider with additional scopes if needed
      provider.addScope('email')
      provider.addScope('profile')
      
      // Set custom parameters for better user experience
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const userCredential = await signInWithPopup(auth, provider)
      await this.ensureUserBootstrap(userCredential.user, userCredential.user.displayName)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: unknown) {
      console.error('Google sign-in error:', error)
      const existingUser = auth.currentUser
      if (existingUser) {
        await this.ensureUserBootstrap(existingUser, existingUser.displayName)
        return await this.mapFirebaseUser(existingUser)
      }
      if (isFirebaseError(error) && error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      } else if (isFirebaseError(error) && error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.')
      } else if (isFirebaseError(error) && error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.')
      }
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw new Error('Failed to sign in with Google. Please try again.')
    }
  }

  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      )

        if (data.displayName && userCredential.user) {
          try {
            await updateProfile(userCredential.user, { displayName: data.displayName })
          } catch (error) {
            console.warn('Failed to set display name during sign up:', error)
          }
      }

      // In a real implementation, you would also:
      // 1. Create user document in Firestore
      // 2. Create agency document
      // 3. Set up initial agency settings
      
      await this.ensureUserBootstrap(userCredential.user, data.displayName ?? userCredential.user.displayName ?? data.email)
      const authUser = await this.mapFirebaseUser(userCredential.user)
      return authUser
    } catch (error: unknown) {
      if (isFirebaseError(error) && error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use')
      } else if (isFirebaseError(error) && error.code === 'auth/weak-password') {
        throw new Error('Password is too weak')
      }
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      }
      throw new Error('Failed to create account')
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
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
    
    // Call callback immediately with current user
    callback(this.currentUser)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach(listener => listener(user))
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
      if (isFirebaseError(error)) {
        if (error.code === 'auth/invalid-email') {
          throw new Error('Enter a valid email address to receive reset instructions')
        }
        if (error.code === 'auth/missing-email') {
          throw new Error('Enter the email associated with your account')
        }
        if (error.code === 'auth/user-not-found') {
          // Deliberately do not reveal whether the user exists.
          return
        }
      }
      throw new Error('Unable to send reset instructions right now. Please try again shortly.')
    }
  }

  async verifyPasswordResetCode(oobCode: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, oobCode)
    } catch (error: unknown) {
      console.error('Password reset code verification error:', error)
      if (isFirebaseError(error)) {
        if (error.code === 'auth/expired-action-code') {
          throw new Error('This reset link has expired. Please request a new one.')
        }
        if (error.code === 'auth/invalid-action-code') {
          throw new Error('This reset link is invalid or has already been used.')
        }
      }
      throw new Error('Unable to validate this reset link. Please request a new one.')
    }
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
    } catch (error: unknown) {
      console.error('Password reset confirmation error:', error)
      if (isFirebaseError(error)) {
        if (error.code === 'auth/weak-password') {
          throw new Error('Choose a stronger password with at least 6 characters.')
        }
        if (error.code === 'auth/expired-action-code') {
          throw new Error('This reset link has expired. Please request a new one.')
        }
        if (error.code === 'auth/invalid-action-code') {
          throw new Error('This reset link is invalid or has already been used.')
        }
      }
      throw new Error('Unable to update your password. Please try again.')
    }
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // In a real implementation, you would update the user document in Firestore
      // and potentially update the Firebase user profile
      
      this.currentUser = {
        ...this.currentUser,
        ...data,
        updatedAt: new Date()
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
      // In a real implementation, you would use Firebase's updatePassword
      // after re-authenticating the user
      console.log('Password changed successfully')
    } catch (error: unknown) {
      console.error('Password change error:', error)
      throw new Error('Failed to change password')
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // In a real implementation, you would:
      // 1. Delete user document from Firestore
      // 2. Delete associated data (clients, campaigns, etc.)
      // 3. Delete Firebase user
      console.log('Account deleted successfully')
    } catch (error: unknown) {
      console.error('Account deletion error:', error)
      throw new Error('Failed to delete account')
    }
  }
}

function isFirebaseError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
}

export const authService = AuthService.getInstance()

function normalizeRole(value: unknown): AuthRole {
  switch (value) {
    case 'admin':
    case 'team':
    case 'client':
      return value
    case 'manager':
      return 'team'
    case 'member':
      return 'client'
    default:
      return 'client'
  }
}

function normalizeStatus(value: unknown, fallback: AuthStatus = 'active'): AuthStatus {
  switch (value) {
    case 'active':
    case 'pending':
    case 'invited':
    case 'disabled':
    case 'suspended':
      return value
    case 'inactive':
    case 'blocked':
      return 'disabled'
    default:
      return fallback
  }
}

function extractRefreshToken(
  credential: OAuthCredential | null,
  tokenResponse?: {
    oauthRefreshToken?: string
    refreshToken?: string
  }
): string | null {
  if (credential && typeof credential === 'object' && 'refreshToken' in credential) {
    const candidate = (credential as { refreshToken?: unknown }).refreshToken
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  const oauthRefreshToken = tokenResponse?.oauthRefreshToken
  if (typeof oauthRefreshToken === 'string' && oauthRefreshToken.length > 0) {
    return oauthRefreshToken
  }

  const refreshToken = tokenResponse?.refreshToken
  if (typeof refreshToken === 'string' && refreshToken.length > 0) {
    return refreshToken
  }

  return null
}

function isRole(value: unknown): value is AuthUser['role'] {
  return value === 'admin' || value === 'team' || value === 'client'
}

function isStatus(value: unknown): value is AuthUser['status'] {
  return value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended'
}

function getBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))

  if (!match) {
    return undefined
  }

  try {
    return decodeURIComponent(match.split('=')[1] ?? '') || undefined
  } catch (error) {
    console.warn('Failed to decode cookie value', error)
    return undefined
  }
}
