'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AuthUser, SignUpData, authService } from '@/services/auth'

// Error types for better error handling
export type AuthErrorCode = 
  | 'BOOTSTRAP_FAILED'
  | 'SESSION_SYNC_FAILED'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: Record<string, unknown>
  retryable: boolean
}

function createAuthError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, unknown>,
  retryable = false
): AuthError {
  return { code, message, details, retryable }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true
  if (error instanceof Error && error.name === 'AbortError') return true
  if (error instanceof Error && error.message.toLowerCase().includes('network')) return true
  return false
}

// Helper to sync session cookies (sets cohorts_role, cohorts_status, etc.)
// This must be called after authentication to populate middleware-visible cookies.
async function syncSessionCookies(retries = 2): Promise<{ success: boolean; error?: AuthError }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (process.env.NODE_ENV !== 'production') {
        console.log('[AuthContext] Session sync response:', response.status)
      }

      if (response.ok) {
        return { success: true }
      }

      // Handle specific error codes
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: createAuthError('UNAUTHORIZED', 'Session expired or invalid', { status: response.status }, true),
        }
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        if (attempt < retries) {
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * (attempt + 1)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        return {
          success: false,
          error: createAuthError('RATE_LIMITED', 'Too many requests', { retryAfter }, true),
        }
      }

      if (response.status >= 500) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
        return {
          success: false,
          error: createAuthError('SERVER_ERROR', 'Server error during session sync', { status: response.status }, true),
        }
      }

      return {
        success: false,
        error: createAuthError('SESSION_SYNC_FAILED', `Session sync failed with status ${response.status}`, { status: response.status }),
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Session sync error:', error)
      }

      if (isNetworkError(error)) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
        return {
          success: false,
          error: createAuthError('NETWORK_ERROR', 'Network error during session sync', undefined, true),
        }
      }

      return {
        success: false,
        error: createAuthError('UNKNOWN', error instanceof Error ? error.message : 'Unknown error during session sync'),
      }
    }
  }

  return {
    success: false,
    error: createAuthError('SESSION_SYNC_FAILED', 'Session sync failed after retries', undefined, true),
  }
}

// Helper to call bootstrap API (ensures user exists in Convex users table)
// Returns the user data from bootstrap if successful
interface BootstrapResult {
  success: boolean
  data?: { role?: string; status?: string; agencyId?: string }
  error?: AuthError
}

async function callBootstrap(retries = 3): Promise<BootstrapResult> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        let json: unknown
        try {
          json = await response.json()
        } catch (parseError) {
          console.error('[AuthContext] Failed to parse bootstrap response:', parseError)
          return {
            success: false,
            error: createAuthError('BOOTSTRAP_FAILED', 'Invalid response from bootstrap'),
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('[AuthContext] Bootstrap response', json)
        }

        // Handle both old format (data.role) and new format (data.data.role)
        const data = (json as any)?.data?.data ?? (json as any)?.data ?? json

        if (data?.ok === true) {
          // After bootstrap succeeds, sync session cookies so middleware can read role
          const sessionResult = await syncSessionCookies()
          if (!sessionResult.success && process.env.NODE_ENV !== 'production') {
            console.warn('[AuthContext] Session sync failed after bootstrap:', sessionResult.error)
          }

          return {
            success: true,
            data: {
              role: data.role,
              status: data.status,
              agencyId: data.agencyId,
            },
          }
        }

        // Bootstrap returned ok: false - log the error
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AuthContext] Bootstrap returned ok: false', data?.error, data?.debug)
        }

        return {
          success: false,
          error: createAuthError(
            'BOOTSTRAP_FAILED',
            data?.error || 'Bootstrap returned failure',
            { debug: data?.debug },
            true
          ),
        }
      }

      // If we get a 401/403, the session might not be ready yet - wait and retry
      if (response.status === 401 || response.status === 403) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
          continue
        }
        return {
          success: false,
          error: createAuthError('UNAUTHORIZED', 'Not authorized to bootstrap', { status: response.status }, true),
        }
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        if (attempt < retries - 1) {
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * (attempt + 1)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        return {
          success: false,
          error: createAuthError('RATE_LIMITED', 'Too many bootstrap requests', { retryAfter }, true),
        }
      }

      if (response.status >= 500) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
        return {
          success: false,
          error: createAuthError('SERVER_ERROR', 'Server error during bootstrap', { status: response.status }, true),
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Bootstrap call failed:', response.status)
      }

      return {
        success: false,
        error: createAuthError('BOOTSTRAP_FAILED', `Bootstrap failed with status ${response.status}`, { status: response.status }),
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Bootstrap call error:', error)
      }

      if (isNetworkError(error)) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
        return {
          success: false,
          error: createAuthError('NETWORK_ERROR', 'Network error during bootstrap', undefined, true),
        }
      }

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
        continue
      }

      return {
        success: false,
        error: createAuthError('UNKNOWN', error instanceof Error ? error.message : 'Unknown bootstrap error'),
      }
    }
  }

  return {
    success: false,
    error: createAuthError('BOOTSTRAP_FAILED', 'Bootstrap failed after all retries', undefined, true),
  }
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isSyncing: boolean
  authError: AuthError | null
  clearAuthError: () => void
  retrySync: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthUser>
  signInWithGoogle: () => Promise<AuthUser>
  connectGoogleAdsAccount: () => Promise<void>
  connectGoogleAnalyticsAccount: () => Promise<void>
  connectFacebookAdsAccount: () => Promise<void>
  connectLinkedInAdsAccount: () => Promise<void>
  startMetaOauth: (redirect?: string, clientId?: string | null) => Promise<{ url: string }>
  startTikTokOauth: (redirect?: string, clientId?: string | null) => Promise<{ url: string }>
  disconnectProvider: (providerId: string, clientId?: string | null) => Promise<void>
  getIdToken: () => Promise<string | null>
  signUp: (data: SignUpData) => Promise<AuthUser>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyPasswordResetCode: (oobCode: string) => Promise<string>
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)

  const lastAppliedUserKeyRef = useRef<string | null>(null)
  const currentUserRef = useRef<AuthUser | null>(null)

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const applyUser = useCallback(async (authUser: AuthUser | null, isIntentionalSignOut = false) => {
    const userKey = authUser
      ? `${authUser.id}|${authUser.email}|${authUser.role}|${authUser.status}|${authUser.agencyId}`
      : 'anonymous'

    // Deduplicate: Better Auth + StrictMode can invoke state changes multiple times.
    // Skip if we've already applied this exact user snapshot.
    if (lastAppliedUserKeyRef.current === userKey && !isIntentionalSignOut) {
      return
    }
    lastAppliedUserKeyRef.current = userKey
    currentUserRef.current = authUser

    setUser(authUser)
    setAuthError(null) // Clear any previous errors on new auth state

    // Skip sync for passive null states (handled internally by SessionSyncManager)
    if (!authUser && !isIntentionalSignOut) {
      return
    }

    setIsSyncing(true)
    try {
      // Call bootstrap to ensure user exists in Convex users table.
      // This returns the user's role, status, and agencyId from Convex.
      if (authUser) {
        const bootstrapResult = await callBootstrap()

        // Update user with data from Convex (role, status, agencyId)
        if (bootstrapResult.success && bootstrapResult.data) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[AuthContext] Applying bootstrap result:', bootstrapResult.data)
          }
          setUser((prev) => {
            if (!prev) return prev
            // Always use user.id as fallback for agencyId if bootstrap doesn't provide one
            const resolvedAgencyId = bootstrapResult.data!.agencyId || prev.agencyId || prev.id
            if (process.env.NODE_ENV !== 'production') {
              console.log('[AuthContext] Setting agencyId:', resolvedAgencyId)
            }
            const updated = {
              ...prev,
              role: (bootstrapResult.data!.role as AuthUser['role']) || prev.role,
              status: (bootstrapResult.data!.status as AuthUser['status']) || prev.status,
              agencyId: resolvedAgencyId,
            }
            currentUserRef.current = updated
            return updated
          })
        } else {
          // Bootstrap failed - set error but still ensure agencyId fallback
          if (bootstrapResult.error) {
            console.error('[AuthContext] Bootstrap failed:', bootstrapResult.error)
            setAuthError(bootstrapResult.error)
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log('[AuthContext] Bootstrap failed, using fallback agencyId')
          }
          setUser((prev) => {
            if (!prev) return prev
            // Always ensure agencyId is set - use user.id as fallback
            const resolvedAgencyId = prev.agencyId && prev.agencyId.length > 0 ? prev.agencyId : prev.id
            const updated = { ...prev, agencyId: resolvedAgencyId }
            currentUserRef.current = updated
            return updated
          })
        }
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error in applyUser:', error)
      setAuthError(createAuthError('UNKNOWN', error instanceof Error ? error.message : 'Unexpected error'))
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Retry sync manually (for error recovery UI)
  const retrySync = useCallback(async () => {
    const currentUser = currentUserRef.current
    if (!currentUser) return

    setAuthError(null)
    lastAppliedUserKeyRef.current = null // Force re-sync
    await applyUser(currentUser)
  }, [applyUser])

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      try {
        await applyUser(authUser)
      } catch (error) {
        console.error('[AuthContext] Error in onAuthStateChanged:', error)
        setAuthError(createAuthError('UNKNOWN', error instanceof Error ? error.message : 'Auth state change failed'))
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [applyUser])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)
    try {
      const authUser = await authService.signIn(email, password)
      await applyUser(authUser)
      return authUser
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error)
      throw error // Let the caller handle auth-specific errors
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signUp = useCallback(async (data: SignUpData): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)
    try {
      const authUser = await authService.signUp(data)
      await applyUser(authUser)
      return authUser
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)
    try {
      const authUser = await authService.signInWithGoogle()
      await applyUser(authUser)
      return authUser
    } catch (error) {
      console.error('[AuthContext] Google sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true)
    setAuthError(null)
    try {
      await authService.signOut()
      await applyUser(null, true)
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error)
      // Still clear local state even if server sign out fails
      setUser(null)
      currentUserRef.current = null
      lastAppliedUserKeyRef.current = null
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    void email
    await authService.resetPassword()
  }, [])

  const verifyPasswordResetCode = useCallback(async (oobCode: string): Promise<string> => {
    void oobCode
    return await authService.verifyPasswordResetCode()
  }, [])

  const confirmPasswordReset = useCallback(async (oobCode: string, newPassword: string): Promise<void> => {
    void oobCode
    void newPassword
    await authService.confirmPasswordReset()
  }, [])

  const updateProfile = useCallback(async (data: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      const authUser = await authService.updateProfile(data)
      await applyUser(authUser)
      return authUser
    } catch (error) {
      console.error('[AuthContext] Update profile error:', error)
      throw error
    }
  }, [applyUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    void currentPassword
    void newPassword
    await authService.changePassword()
  }, [])

  const deleteAccount = useCallback(async (): Promise<void> => {
    setLoading(true)
    setAuthError(null)
    try {
      await authService.deleteAccount()
      await applyUser(null, true)
    } catch (error) {
      console.error('[AuthContext] Delete account error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const connectGoogleAdsAccount = useCallback(async () => {
    await authService.connectGoogleAdsAccount()
  }, [])

  const connectGoogleAnalyticsAccount = useCallback(async () => {
    await authService.connectGoogleAnalyticsAccount()
  }, [])

  const connectFacebookAdsAccount = useCallback(async () => {
    await authService.connectFacebookAdsAccount()
  }, [])

  const connectLinkedInAdsAccount = useCallback(async () => {
    await authService.connectLinkedInAdsAccount()
  }, [])

  const startMetaOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
    return await authService.startMetaOauth(redirect, clientId)
  }, [])

  const startTikTokOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
    return await authService.startTikTokOauth(redirect, clientId)
  }, [])

  const disconnectProvider = useCallback(async (providerId: string, clientId?: string | null) => {
    void providerId
    void clientId
    await authService.disconnectProvider()
  }, [])

  const getIdToken = useCallback(async () => {
    return null
  }, [])

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isSyncing,
      authError,
      clearAuthError,
      retrySync,
      signIn,
      signInWithGoogle,
      connectGoogleAdsAccount,
      connectGoogleAnalyticsAccount,
      connectFacebookAdsAccount,
      connectLinkedInAdsAccount,
      startMetaOauth,
      startTikTokOauth,
      disconnectProvider,
      getIdToken,
      signUp,
      signOut,
      resetPassword,
      verifyPasswordResetCode,
      confirmPasswordReset,
      updateProfile,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      loading,
      isSyncing,
      authError,
      clearAuthError,
      retrySync,
      signIn,
      signInWithGoogle,
      connectGoogleAdsAccount,
      connectGoogleAnalyticsAccount,
      connectFacebookAdsAccount,
      connectLinkedInAdsAccount,
      startMetaOauth,
      startTikTokOauth,
      disconnectProvider,
      getIdToken,
      signUp,
      signOut,
      resetPassword,
      verifyPasswordResetCode,
      confirmPasswordReset,
      updateProfile,
      changePassword,
      deleteAccount,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
