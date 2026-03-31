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
import { composeAbortSignal, isTimeoutError } from '@/lib/retry-utils'
import { ResponseBodyParseError, parseJsonBody } from '@/lib/response-json'
import { parseAuthError, isNetworkError } from './error-utils'

const OAUTH_START_TIMEOUT_MS = 15_000

function normalizeRole(value: unknown): AuthRole {
  return value === 'admin' || value === 'team' || value === 'client' ? value : 'client'
}

function normalizeStatus(value: unknown): AuthStatus {
  return value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended'
    ? value
    : 'pending'
}

function createOauthStartError(response: Response, message: string) {
  if (response.status === 401) {
    return new SessionExpiredError(message)
  }

  if (response.status >= 500 || response.ok) {
    return new ServiceUnavailableError(message)
  }

  return new BadRequestError(message)
}

async function parseOauthStartPayload(response: Response, context: string, message: string): Promise<unknown> {
  try {
    const payload = await parseJsonBody<unknown>(response, { context })
    if (payload === null) {
      throw new ResponseBodyParseError(context, 'empty')
    }
    return payload
  } catch (error) {
    if (error instanceof ResponseBodyParseError) {
      throw createOauthStartError(response, message)
    }

    throw error
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const { signal, cleanup } = composeAbortSignal({
    signal: init.signal ?? undefined,
    timeoutMs: OAUTH_START_TIMEOUT_MS,
    timeoutMessage: 'The authentication service took too long to respond.',
  })

  try {
    return await fetch(input, {
      ...init,
      signal,
    })
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new NetworkTimeoutError('The authentication service took too long to respond. Please try again.')
    }

    if (isNetworkError(error)) {
      throw new NetworkError('Unable to reach the authentication service. Please check your connection and try again.')
    }

    throw error
  } finally {
    cleanup()
  }
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []

  private initialAuthResolved = false
  private readonly initialAuthPromise: Promise<void>
  private resolveInitialAuth!: () => void

  private extractSessionPayload(result: unknown): { user?: Record<string, unknown> | null } | null {
    if (!result || typeof result !== 'object' || !('data' in result)) {
      return null
    }

    const data = (result as { data?: unknown }).data
    if (!data || typeof data !== 'object') {
      return null
    }

    return data as { user?: Record<string, unknown> | null }
  }

  private setResolvedUser(user: AuthUser | null): void {
    this.currentUser = user
    this.notifyListeners(user)
  }

  private async resolveSessionUser(options?: { disableCookieCache?: boolean }): Promise<AuthUser | null> {
    const sessionResult = await authClient.getSession({
      query: options?.disableCookieCache ? { disableCookieCache: true } : undefined,
    }).catch((err) => {
      console.error('[AuthService] getSession error:', err)
      return null
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AuthService] getSession result:', {
        hasResult: Boolean(sessionResult),
        hasData: Boolean(sessionResult && typeof sessionResult === 'object' && 'data' in sessionResult),
        disableCookieCache: Boolean(options?.disableCookieCache),
        result: sessionResult,
      })
    }

    const session = this.extractSessionPayload(sessionResult)

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AuthService] Parsed session:', {
        hasSession: Boolean(session),
        hasUser: Boolean(session?.user),
        userEmail: session?.user?.email,
        disableCookieCache: Boolean(options?.disableCookieCache),
      })
    }

    return session?.user
      ? this.mapBetterAuthUser(session.user)
      : null
  }

  private async ensureFreshSession(): Promise<AuthUser> {
    const freshUser = await this.resolveSessionUser({ disableCookieCache: true })

    if (!freshUser) {
      this.setResolvedUser(null)
      throw new SessionExpiredError('Your session has expired. Please sign in again.')
    }

    this.setResolvedUser(freshUser)
    return freshUser
  }

  private readCsrfCookie(): string | null {
    if (typeof document === 'undefined') {
      return null
    }

    const csrfCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cohorts_csrf='))

    if (!csrfCookie) {
      return null
    }

    const [, value = ''] = csrfCookie.split('=', 2)
    const csrfToken = decodeURIComponent(value)
    return csrfToken.length > 0 ? csrfToken : null
  }

  private async resolveCsrfToken(): Promise<string | null> {
    const existingToken = this.readCsrfCookie()
    if (existingToken) {
      return existingToken
    }

    try {
      const response = await fetchWithTimeout('/api/auth/session', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const payload = await parseJsonBody<{ csrfToken?: unknown }>(response, {
        context: 'AuthService resolveCsrfToken',
      })
      return typeof payload?.csrfToken === 'string' && payload.csrfToken.length > 0
        ? payload.csrfToken
        : this.readCsrfCookie()
    } catch (error) {
      console.warn('[AuthService] Failed to refresh CSRF token:', error)
      return null
    }
  }

  private async fetchGoogleWorkspaceOauthUrl(search: string): Promise<Response> {
    return await fetchWithTimeout(`/api/integrations/google-workspace/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
  }

  private async fetchGoogleOauthUrl(search: string): Promise<Response> {
    return await fetchWithTimeout(`/api/integrations/google/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
  }

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
      const nextUser = await this.resolveSessionUser({ disableCookieCache: true })
      this.setResolvedUser(nextUser)
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
    this.authStateListeners.forEach((listener) => {
      listener(user)
    })
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
    if (user.status === 'pending' || user.status === 'invited') {
      throw new AccountPendingError('Your account is awaiting admin approval.')
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    this.validateEmail(email)
    this.validatePassword(password)

    try {
      const result = await authClient.signIn.email({ email: email.trim(), password })
      const data = result && typeof result === 'object' && 'data' in result
        ? ((result as { data?: { user?: Record<string, unknown> | null } | null }).data ?? null)
        : null
      const errorInResult = result && typeof result === 'object' && 'error' in result
        ? ((result as { error?: unknown }).error ?? null)
        : null

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

      const payload = result && typeof result === 'object' && 'data' in result
        ? ((result as { data?: { user?: Record<string, unknown> | null } | null }).data ?? null)
        : null
      const errorInResult = result && typeof result === 'object' && 'error' in result
        ? ((result as { error?: unknown }).error ?? null)
        : null

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
      // First, clear custom session cookies via API
      await this.clearSessionCookies()
      
      // Then sign out from Better Auth
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

  private async clearSessionCookies(): Promise<void> {
    try {
      const csrfToken = await this.resolveCsrfToken()

      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken ?? '',
        },
        credentials: 'include',
      })

      if (!response.ok && response.status !== 401) {
        // Log but don't throw - we still want to try better-auth signOut
        console.warn('[AuthService] Session cookie clear failed:', response.status)
      }
    } catch (error) {
      // Log but don't throw - we still want to try better-auth signOut
      console.warn('[AuthService] Failed to clear session cookies:', error)
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

  async startGoogleOauth(redirect?: string, clientId?: string | null): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new ValidationError('Invalid redirect URL')
    }

    await this.ensureFreshSession()

    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    const search = params.toString() ? `?${params.toString()}` : ''

    let response = await this.fetchGoogleOauthUrl(search)

    if (response.status === 401) {
      await this.ensureFreshSession().catch(() => null)
      response = await this.fetchGoogleOauthUrl(search)
    }

    const payload = await parseOauthStartPayload(response, 'Google OAuth start', 'Failed to start Google OAuth')

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start Google OAuth'
        if (response.status === 401) {
          throw new SessionExpiredError(message)
        }
        throw new BadRequestError(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new ServiceUnavailableError('Google OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start Google OAuth'
      if (response.status === 401) {
        throw new SessionExpiredError(message)
      }
      throw new BadRequestError(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new ServiceUnavailableError('Google OAuth did not return a URL')
  }

  async startGoogleWorkspaceOauth(redirect?: string): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new ValidationError('Invalid redirect URL')
    }

    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    const search = params.toString() ? `?${params.toString()}` : ''

    await this.ensureFreshSession()

    let response = await this.fetchGoogleWorkspaceOauthUrl(search)

    if (response.status === 401) {
      await this.ensureFreshSession().catch(() => null)
      response = await this.fetchGoogleWorkspaceOauthUrl(search)
    }

    const payload = await parseOauthStartPayload(response, 'Google Workspace OAuth start', 'Failed to start Google Workspace OAuth')

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start Google Workspace OAuth'
        if (response.status === 401) {
          throw new SessionExpiredError(message)
        }
        throw new BadRequestError(message)
      }

      const data = record.data as { url?: unknown } | undefined
      if (typeof data?.url === 'string' && data.url.length > 0) {
        return { url: data.url }
      }

      throw new ServiceUnavailableError('Google Workspace OAuth did not return a URL')
    }

    if (!response.ok) {
      const record = payload as { error?: unknown }
      const message = typeof record?.error === 'string' ? record.error : 'Failed to start Google Workspace OAuth'
      if (response.status === 401) {
        throw new SessionExpiredError(message)
      }
      throw new BadRequestError(message)
    }

    const legacy = payload as { url?: unknown }
    if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url }
    throw new ServiceUnavailableError('Google Workspace OAuth did not return a URL')
  }

  async startMetaOauth(
    redirect?: string,
    clientId?: string | null,
    surface?: 'facebook' | 'instagram',
    entryPoint?: 'socials' | 'ads',
  ): Promise<{ url: string }> {
    if (redirect && !isValidRedirectUrl(redirect)) {
      throw new ValidationError('Invalid redirect URL')
    }

    await this.ensureFreshSession()

    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (clientId) params.set('clientId', clientId)
    if (surface) params.set('surface', surface)
    if (entryPoint) params.set('entryPoint', entryPoint)
    const search = params.toString() ? `?${params.toString()}` : ''

    const fetchMetaOauthUrl = async () => await fetchWithTimeout(`/api/integrations/meta/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    let response = await fetchMetaOauthUrl()

    if (response.status === 401) {
      await this.ensureFreshSession().catch(() => null)
      response = await fetchMetaOauthUrl()
    }

    const payload = await parseOauthStartPayload(response, 'Meta OAuth start', 'Failed to start Meta OAuth')

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const record = payload as { success: boolean; data?: unknown; error?: unknown }
      if (!record.success) {
        const message = typeof record.error === 'string' ? record.error : 'Failed to start Meta OAuth'
        if (response.status === 401) {
          throw new SessionExpiredError(message)
        }
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
      if (response.status === 401) {
        throw new SessionExpiredError(message)
      }
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

    const response = await fetchWithTimeout(`/api/integrations/tiktok/oauth/url${search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    })

    const payload = await parseOauthStartPayload(response, 'TikTok OAuth start', 'Failed to start TikTok OAuth')

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
