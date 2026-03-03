'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useQuery } from 'convex/react'

import { AuthUser, SignUpData, authService } from '@/services/auth'
import { authClient } from '@/lib/auth-client'
import { api } from '../../convex/_generated/api'

export type AuthErrorCode =
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
  const [betterAuthUserId, setBetterAuthUserId] = useState<string | null>(null)

  // Query Convex for additional user data when we have a Better Auth user
  const convexUser = useQuery(
    api.users.getByLegacyIdSafe,
    betterAuthUserId ? { legacyId: betterAuthUserId } : 'skip'
  )

  const lastAppliedUserKeyRef = useRef<string | null>(null)
  const currentUserRef = useRef<AuthUser | null>(null)

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  // Apply user from Better Auth session
  const applyUser = useCallback(async (authUser: AuthUser | null, isIntentionalSignOut = false) => {
    const userKey = authUser
      ? `${authUser.id}|${authUser.email}|${authUser.role}|${authUser.status}|${authUser.agencyId}`
      : 'anonymous'

    if (lastAppliedUserKeyRef.current === userKey && !isIntentionalSignOut) {
      return
    }
    lastAppliedUserKeyRef.current = userKey
    currentUserRef.current = authUser

    setUser(authUser)
    setAuthError(null)
    setIsSyncing(false)

    // Set the Better Auth user ID for Convex query
    if (authUser) {
      setBetterAuthUserId(authUser.id)
    } else {
      setBetterAuthUserId(null)
    }
  }, [])

  // Update user when Convex data changes
  useEffect(() => {
    if (!convexUser || !user) return

    // Merge Convex user data (role, status, agencyId) with Better Auth user
    setUser((prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        role: (convexUser.role as AuthUser['role']) || prev.role || 'client',
        status: (convexUser.status as AuthUser['status']) || prev.status || 'active',
        agencyId: convexUser.agencyId || prev.agencyId || prev.id,
      }
      currentUserRef.current = updated
      return updated
    })
  }, [convexUser, user?.id])

  // Listen to Better Auth session changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      await applyUser(authUser)
        .catch((error) => {
          console.error('[AuthContext] Error in onAuthStateChanged:', error)
          setAuthError(createAuthError('UNKNOWN', error instanceof Error ? error.message : 'Auth state change failed'))
        })
        .finally(() => {
          setLoading(false)
        })
    })

    return unsubscribe
  }, [applyUser])

  // Timeout safeguard: Force loading to false after 10 seconds
  useEffect(() => {
    if (!loading) return

    const timeoutId = setTimeout(() => {
      console.warn('[AuthContext] Loading timeout reached - forcing loading to false')
      setLoading(false)
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [loading])

  const retrySync = useCallback(async () => {
    const currentUser = currentUserRef.current
    if (!currentUser) return

    setAuthError(null)
    setIsSyncing(true)
    lastAppliedUserKeyRef.current = null
    await applyUser(currentUser).finally(() => {
      setIsSyncing(false)
    })
  }, [applyUser])

  const signIn = useCallback((email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)

    return authService
      .signIn(email, password)
      .then(async (authUser) => {
        await applyUser(authUser)
        return authUser
      })
      .catch((error) => {
        console.error('[AuthContext] Sign in error:', error)
        throw error
      })
      .finally(() => {
        setLoading(false)
      })
  }, [applyUser])

  const signUp = useCallback((data: SignUpData): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)

    return authService
      .signUp(data)
      .then(async (authUser) => {
        await applyUser(authUser)
        return authUser
      })
      .catch((error) => {
        console.error('[AuthContext] Sign up error:', error)
        throw error
      })
      .finally(() => {
        setLoading(false)
      })
  }, [applyUser])

  const signInWithGoogle = useCallback((): Promise<AuthUser> => {
    setLoading(true)
    setAuthError(null)

    return authService
      .signInWithGoogle()
      .then(async (authUser) => {
        await applyUser(authUser)
        return authUser
      })
      .catch((error) => {
        console.error('[AuthContext] Google sign in error:', error)
        throw error
      })
      .finally(() => {
        setLoading(false)
      })
  }, [applyUser])

  const signOut = useCallback((): Promise<void> => {
    setLoading(true)
    setAuthError(null)

    return authService
      .signOut()
      .then(async () => {
        await applyUser(null, true)
        setBetterAuthUserId(null)
      })
      .catch((error) => {
        console.error('[AuthContext] Sign out error:', error)
        setUser(null)
        currentUserRef.current = null
        lastAppliedUserKeyRef.current = null
        setBetterAuthUserId(null)
      })
      .finally(() => {
        setLoading(false)
      })
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

  const deleteAccount = useCallback((): Promise<void> => {
    setLoading(true)
    setAuthError(null)

    return authService
      .deleteAccount()
      .then(async () => {
        await applyUser(null, true)
        setBetterAuthUserId(null)
      })
      .catch((error) => {
        console.error('[AuthContext] Delete account error:', error)
        throw error
      })
      .finally(() => {
        setLoading(false)
      })
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
    if (typeof window === 'undefined') return null
    try {
      const result = await authClient.$fetch('/convex/token')
      const payload =
        result && typeof result === 'object' && 'data' in result ? (result as any).data : result
      const token = payload && typeof payload === 'object' && 'token' in payload ? (payload as any).token : null
      return typeof token === 'string' && token.trim().length > 0 ? token : null
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Failed to fetch Convex token', error)
      }
      return null
    }
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
