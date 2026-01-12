'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AuthUser, SignUpData, authService } from '@/services/auth'

// Helper to call bootstrap API (ensures user exists in Convex users table)
// Returns the user data from bootstrap if successful
async function callBootstrap(retries = 3): Promise<{ role?: string; status?: string; agencyId?: string } | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      })

      if (response.ok) {
        const json = await response.json()
        if (process.env.NODE_ENV !== 'production') {
          console.log('[AuthContext] Bootstrap response', json)
        }
        
        // Handle both old format (data.role) and new format (data.data.role)
        const data = json.data?.data ?? json.data ?? json
        
        if (data?.ok === true) {
          return {
            role: data.role,
            status: data.status,
            agencyId: data.agencyId,
          }
        }
        
        // Bootstrap returned ok: false - log the error
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AuthContext] Bootstrap returned ok: false', data?.error, data?.debug)
        }
        return null
      }

      // If we get a 401/403, the session might not be ready yet - wait and retry
      if (response.status === 401 || response.status === 403) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
          continue
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Bootstrap call failed:', response.status)
      }
      return null
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AuthContext] Bootstrap call error:', error)
      }
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
  }
  return null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isSyncing: boolean
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

  const lastAppliedUserKeyRef = useRef<string | null>(null)

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

    setUser(authUser)

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
        if (bootstrapResult) {
          setUser((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              role: (bootstrapResult.role as AuthUser['role']) || prev.role,
              status: (bootstrapResult.status as AuthUser['status']) || prev.status,
              agencyId: bootstrapResult.agencyId || prev.agencyId || prev.id,
            }
          })
        } else {
          // Fallback: ensure agencyId is set to user id if not available
          setUser((prev) => {
            if (!prev) return prev
            if (prev.agencyId && prev.agencyId.length > 0) return prev
            return { ...prev, agencyId: prev.id }
          })
        }
      }

      // SessionSyncManager is no longer needed as we've unified the auth flow
      // await sessionSyncManager.sync(authUser, isIntentionalSignOut)
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
      await applyUser(null, true)
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
    const authUser = await authService.updateProfile(data)
    await applyUser(authUser)
    return authUser
  }, [applyUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    void currentPassword
    void newPassword
    await authService.changePassword()
  }, [])

  const deleteAccount = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.deleteAccount()
      await applyUser(null, true)
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
