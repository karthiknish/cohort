import type { AuthRole, AuthStatus, AuthUser, SignUpData } from './types'
import { authClient } from '@/lib/auth-client'
import { isValidRedirectUrl } from '@/lib/utils'
import {
  UnauthorizedError,
  ValidationError,
  BadRequestError,
  ServiceUnavailableError,
  InvalidCredentialsError,
  InvalidEmailError,
  WeakPasswordError,
  EmailAlreadyExistsError,
  AccountDisabledError,
  AccountSuspendedError,
  AccountPendingError,
  SessionExpiredError,
  NetworkError,
  NetworkTimeoutError,
  RateLimitError,
} from '@/lib/api-errors'
import { parseAuthError, isNetworkError, isRetryableError } from './error-utils'

function normalizeRole(value: unknown): AuthRole {
  return value === 'admin' || value === 'team' || value === 'client' ? value : 'client'
}

function normalizeStatus(value: unknown): AuthStatus {
  return value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended'
    ? value
    : 'active'
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []

  private initialAuthResolved = false
  private readonly initialAuthPromise: Promise<void>
  private resolveInitialAuth!: () => void

  private constructor() {
    this.initialAuthPromise = new Promise((resolve) => {
      this.resolveInitialAuth = resolve
    })

    if (typeof window !== 'undefined') {
      // Get initial session from Better Auth (single call)
      this.initSession()
    } else {
      this.initialAuthResolved = true
      this.resolveInitialAuth()
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async initSession() {
    try {
      const sessionResult = await authClient.getSession().catch(() => null)
      const session =
        sessionResult && typeof sessionResult === 'object' && 'data' in sessionResult
          ? (sessionResult as any).data
          : null

      const nextUser = session?.user
        ? this.mapBetterAuthUser(session.user)
        : null
      
      this.currentUser = nextUser
      this.notifyListeners(nextUser)
    } finally {
      if (!this.initialAuthResolved) {
        this.initialAuthResolved = true
        this.resolveInitialAuth()
      }
    }
  }

  mapBetterAuthUser(user: Record<string, unknown>): AuthUser {
    const id = typeof user.id === 'string' ? user.id : ''
    const email = typeof user.email === 'string' ? user.email : ''
    const name = typeof user.name === 'string' ? user.name : email

    return {
      id,
      email,
      name,
      phoneNumber: null,
      photoURL: typeof user.image === 'string' ? user.image : null,
      role: normalizeRole((user as { role?: unknown }).role),
      status: normalizeStatus((user as { status?: unknown }).status),
      agencyId: typeof (user as { agencyId?: unknown }).agencyId === 'string' ? String((user as { agencyId?: unknown }).agencyId) : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }


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

  async waitForInitialAuth(): Promise<void> {
    await this.initialAuthPromise
  }

  private notifyListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach((listener) => listener(user))
  }

  private validateEmail(email: string): void {
    if (!email || !email.trim()) {
      throw new InvalidEmailError('Email is required')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new InvalidEmailError('Please enter a valid email address')
    }
  }

  private validatePassword(password: string, isSignUp = false): void {
    if (!password) {
      throw new InvalidCredentialsError('Password is required')
    }
    if (isSignUp && password.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters')
    }
  }

  private checkUserStatus(user: AuthUser): void {
    if (user.status === 'disabled') {
      throw new AccountDisabledError()
    }
    if (user.status === 'suspended') {
      throw new AccountSuspendedError()
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    this.validateEmail(email)
    this.validatePassword(password)

    try {
      const result = await authClient.signIn.email({ email: email.trim(), password })
      const data = result && typeof result === 'object' && 'data' in result ? (result as any).data : null
      const errorInResult = result && typeof result === 'object' && 'error' in result ? (result as any).error : null

      if (errorInResult) {
        throw parseAuthError(errorInResult)
      }

      if (!data?.user) {
        throw new InvalidCredentialsError()
      }

      const user = this.mapBetterAuthUser(data.user as unknown as Record<string, unknown>)
      this.checkUserStatus(user)
      return user
    } catch (error: unknown) {
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof InvalidEmailError ||
        error instanceof AccountDisabledError ||
        error instanceof AccountSuspendedError ||
        error instanceof AccountPendingError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError ||
        error instanceof NetworkTimeoutError ||
        error instanceof SessionExpiredError
      ) {
        throw error
      }

      if (isNetworkError(error)) {
        throw new NetworkError()
      }

      throw parseAuthError(error)
    }
  }

  async signUp(signUpData: SignUpData): Promise<AuthUser> {
    this.validateEmail(signUpData.email)
    this.validatePassword(signUpData.password, true)

    try {
      const result = await authClient.signUp.email({
        email: signUpData.email.trim(),
        password: signUpData.password,
        name: signUpData.displayName ?? signUpData.email,
      })

      const payload = result && typeof result === 'object' && 'data' in result ? (result as any).data : null
      const errorInResult = result && typeof result === 'object' && 'error' in result ? (result as any).error : null

      if (errorInResult) {
        throw parseAuthError(errorInResult)
      }

      if (!payload?.user) {
        throw new BadRequestError('Sign-up failed. Please try again.')
      }

      return this.mapBetterAuthUser(payload.user as unknown as Record<string, unknown>)
    } catch (error: unknown) {
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof InvalidEmailError ||
        error instanceof WeakPasswordError ||
        error instanceof EmailAlreadyExistsError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError ||
        error instanceof NetworkTimeoutError ||
        error instanceof BadRequestError
      ) {
        throw error
      }

      if (isNetworkError(error)) {
        throw new NetworkError()
      }

      throw parseAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      await authClient.signOut()
      this.currentUser = null
      this.notifyListeners(null)
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        throw new NetworkError('Failed to sign out. Please check your connection.')
      }
      throw new ServiceUnavailableError('Failed to sign out. Please try again.')
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    // If Better Auth is configured with Google OAuth, this triggers the flow.
    // Depending on your Better Auth setup, you may want to use redirect-based auth.
    throw new ServiceUnavailableError('Google sign-in not configured in Better Auth')
  }

  async connectGoogleAdsAccount(): Promise<void> {
    throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup')
  }

  async connectGoogleAnalyticsAccount(): Promise<void> {
    throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup')
  }

  async connectFacebookAdsAccount(): Promise<void> {
    throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup')
  }

  async connectLinkedInAdsAccount(): Promise<void> {
    throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup')
  }

  async startMetaOauth(redirect?: string, clientId?: string | null): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new ValidationError('Invalid redirect URL')
    }

    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    const search = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(`/api/integrations/meta/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    })

    const payload = (await response.json().catch(() => ({}))) as unknown

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start Meta OAuth'
        throw new BadRequestError(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new ServiceUnavailableError('Meta OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start Meta OAuth'
      throw new BadRequestError(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new ServiceUnavailableError('Meta OAuth did not return a URL')
  }

  async startTikTokOauth(redirect?: string, clientId?: string | null): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new ValidationError('Invalid redirect URL')
    }

    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    const search = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(`/api/integrations/tiktok/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    })

    const payload = (await response.json().catch(() => ({}))) as unknown

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start TikTok OAuth'
        throw new BadRequestError(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new ServiceUnavailableError('TikTok OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start TikTok OAuth'
      throw new BadRequestError(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new ServiceUnavailableError('TikTok OAuth did not return a URL')
  }

  async resetPassword(): Promise<void> {
    throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
  }

  async verifyPasswordResetCode(): Promise<string> {
    throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
  }

  async confirmPasswordReset(): Promise<void> {
    throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) throw new UnauthorizedError('No authenticated user')
    return {
      ...this.currentUser,
      ...data,
      updatedAt: new Date().toISOString(),
    }
  }

  async changePassword(): Promise<void> {
    throw new ServiceUnavailableError('Password change must be implemented with Better Auth')
  }

  async deleteAccount(): Promise<void> {
    throw new ServiceUnavailableError('Account deletion must be implemented with Better Auth')
  }

  async disconnectProvider(): Promise<void> {
    throw new ServiceUnavailableError('Provider disconnect must be implemented with Better Auth')
  }
}

export const authService = AuthService.getInstance()
