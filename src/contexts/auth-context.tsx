'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser, SignUpData, authService } from '@/services/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
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

  const applyUser = useCallback(async (authUser: AuthUser | null) => {
    setUser(authUser)
    await syncSessionCookies(authUser)
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
      await applyUser(null)
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
      await applyUser(null)
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

let lastSyncToken: string | null = null
let syncInProgress: Promise<boolean> | null = null

async function syncSessionCookies(authUser: AuthUser | null) {
  if (typeof window === 'undefined') {
    return true
  }

  // If we're offline, don't even try to sync, it will just fail and log errors
  if (!navigator.onLine) {
    return false
  }

  // If a sync is already in progress, wait for it
  if (syncInProgress) {
    return syncInProgress
  }

  syncInProgress = (async () => {
    try {
      if (!authUser) {
        const response = await fetch('/api/auth/session', { method: 'DELETE' })
        lastSyncToken = null
        return response.ok
      }

      const token = await authService.getIdToken()
      
      // Avoid redundant syncs if the token hasn't changed
      if (token === lastSyncToken) {
        return true
      }

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          role: authUser.role,
          status: authUser.status,
        }),
      })

      if (!response.ok) {
        // Only log if it's not a rate limit or other expected error
        if (response.status !== 429) {
          console.error('Failed to sync session cookies. Status:', response.status)
        }
        return false
      }

      lastSyncToken = token
      return true
    } catch (error) {
      // Handle network errors gracefully
      const isNetworkError = 
        (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('network'))) ||
        (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'auth/network-request-failed')

      if (isNetworkError) {
        // Silently fail for network errors, as they are expected when offline/flaky
        // They will be retried on the next auth state change or token refresh
        return false
      }

      console.error('Failed to sync auth cookies', error)
      return false
    } finally {
      syncInProgress = null
    }
  })()

  return syncInProgress
}
