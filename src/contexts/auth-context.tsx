'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser, SignUpData, authService } from '@/services/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isSyncing: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signInWithGoogle: () => Promise<AuthUser>
  connectGoogleAdsAccount: () => Promise<void>
  connectFacebookAdsAccount: () => Promise<void>
  connectLinkedInAdsAccount: () => Promise<void>
  startMetaOauth: (redirect?: string) => Promise<{ url: string }>
  startTikTokOauth: (redirect?: string) => Promise<{ url: string }>
  disconnectProvider: (providerId: string) => Promise<void>
  getIdToken: () => Promise<string>
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

  const applyUser = useCallback(async (authUser: AuthUser | null, isIntentionalSignOut = false) => {
    // Don't sync null unless it's an intentional sign-out.
    // This prevents races where onAuthStateChanged fires with null during initialization
    // or token refresh, which would incorrectly delete the session cookie.
    if (!authUser && !isIntentionalSignOut) {
      setUser(null)
      return
    }

    setUser(authUser)
    setIsSyncing(true)
    try {
      await syncSessionCookies(authUser)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      await applyUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [applyUser])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signIn(email, password)
      await applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signUp = useCallback(async (data: SignUpData): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signUp(data)
      await applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signInWithGoogle()
      await applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      await applyUser(null, true) // Intentional sign-out - sync the null state
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    await authService.resetPassword(email)
  }, [])

  const verifyPasswordResetCode = useCallback(async (oobCode: string): Promise<string> => {
    return await authService.verifyPasswordResetCode(oobCode)
  }, [])

  const confirmPasswordReset = useCallback(async (oobCode: string, newPassword: string): Promise<void> => {
    await authService.confirmPasswordReset(oobCode, newPassword)
  }, [])

  const updateProfile = useCallback(async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const authUser = await authService.updateProfile(data)
    await applyUser(authUser)
    return authUser
  }, [applyUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    await authService.changePassword(currentPassword, newPassword)
  }, [])

  const deleteAccount = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.deleteAccount()
      await applyUser(null, true) // Intentional sign-out - sync the null state
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  const connectGoogleAdsAccount = useCallback(async () => {
    await authService.connectGoogleAdsAccount()
  }, [])

  const connectFacebookAdsAccount = useCallback(async () => {
    await authService.connectFacebookAdsAccount()
  }, [])

  const connectLinkedInAdsAccount = useCallback(async () => {
    await authService.connectLinkedInAdsAccount()
  }, [])

  const startMetaOauth = useCallback(async (redirect?: string) => {
    return await authService.startMetaOauth(redirect)
  }, [])

  const startTikTokOauth = useCallback(async (redirect?: string) => {
    return await authService.startTikTokOauth(redirect)
  }, [])

  const disconnectProvider = useCallback(async (providerId: string) => {
    await authService.disconnectProvider(providerId)
  }, [])

  const getIdToken = useCallback(async () => {
    return await authService.getIdToken()
  }, [])

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isSyncing,
      signIn,
      signInWithGoogle,
      connectGoogleAdsAccount,
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
      signIn,
      signInWithGoogle,
      connectGoogleAdsAccount,
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

let syncInProgress: Promise<boolean> | null = null
const LAST_SYNC_TOKEN_KEY = 'cohorts.auth.lastSyncToken'

async function waitForServerSessionPresence(expected: boolean, maxAttempts = 5): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' })
      const data = (await res.json()) as any
      const hasSession = Boolean(data?.hasSession)
      if (hasSession === expected) {
        return true
      }
    } catch {
      // ignore and retry
    }

    await new Promise((resolve) => setTimeout(resolve, 200 + attempt * 200))
  }

  return false
}

function getStoredSyncToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(LAST_SYNC_TOKEN_KEY)
}

function setStoredSyncToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    window.sessionStorage.setItem(LAST_SYNC_TOKEN_KEY, token)
  } else {
    window.sessionStorage.removeItem(LAST_SYNC_TOKEN_KEY)
  }
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )cohorts_csrf=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function syncSessionCookies(authUser: AuthUser | null, retryCount = 0): Promise<boolean> {
  if (typeof window === 'undefined') {
    return true
  }

  // If we're offline, don't even try to sync
  if (!navigator.onLine) {
    return false
  }

  const getTargetToken = async () => {
    if (!authUser) return null
    try {
      return await authService.getIdToken()
    } catch {
      return null
    }
  }

  // If a sync is already in progress, wait for it
  if (syncInProgress && retryCount === 0) {
    await syncInProgress
    const currentToken = await getTargetToken()
    if (currentToken === getStoredSyncToken()) {
      return true
    }
  }

  const token = await getTargetToken()
  
  // Dedup
  if (token === getStoredSyncToken() && retryCount === 0) {
    return true
  }

  const performSync = async (): Promise<boolean> => {
    try {
      // Get CSRF token from cookie for double-submit pattern
      const csrfToken = getCsrfToken()

      if (!token) {
        const response = await fetch('/api/auth/session', {
          method: 'DELETE',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
        })
        if (response.ok) {
          setStoredSyncToken(null)
        }
        return response.ok
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token,
          role: authUser?.role,
          status: authUser?.status,
        }),
      })

      if (!response.ok) {
        const status = response.status
        
        // Handle rate limiting (429) or idempotency conflicts (409)
        if ((status === 429 || status === 409) && retryCount < 3) {
          const isConflict = status === 409
          const retryAfter = Number(response.headers.get('Retry-After') || 1)
          // Longer delay for conflicts to allow the other request to finish
          const delay = isConflict ? 1000 * (retryCount + 1) : Math.min(retryAfter * 1000, 3000)
          
          console.warn(`[AuthProvider] Session sync ${isConflict ? 'conflict' : 'rate limit'} (attempt ${retryCount + 1}), retrying in ${delay}ms...`)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return syncSessionCookies(authUser, retryCount + 1)
        }

        // If we still get a 409 after all retries, it's likely fine (another request won)
        if (status === 409) {
          // Don't assume success: wait until the server observes the session cookie.
          console.warn('[AuthProvider] Session sync conflict persisted, waiting for session cookie...')
          const ok = await waitForServerSessionPresence(true, 5)
          if (ok) {
            setStoredSyncToken(token)
          }
          return ok
        }

        // For 429s that exhausted retries, just warn and fail
        if (status === 429) {
          console.warn('[AuthProvider] Session sync rate limit persisted, giving up.')
          return false
        }

        console.error('[AuthProvider] Failed to sync session cookies. Status:', status)
        return false
      }

      setStoredSyncToken(token)
      return true
    } catch (error) {
      const isNetworkError = 
        (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
        (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'auth/network-request-failed')

      if (isNetworkError && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return syncSessionCookies(authUser, retryCount + 1)
      }

      console.error('Failed to sync auth cookies', error)
      return false
    }
  }

  if (retryCount === 0) {
    syncInProgress = performSync()
    const result = await syncInProgress
    syncInProgress = null
    return result
  }

  return performSync()
}
