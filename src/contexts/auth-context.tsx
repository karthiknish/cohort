'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser, SignUpData, authService } from '@/services/auth'
import { sessionSyncManager } from '@/lib/auth'

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
    setUser(authUser)

    // Skip sync for passive null states (handled internally by SessionSyncManager)
    if (!authUser && !isIntentionalSignOut) {
      return
    }

    setIsSyncing(true)
    try {
      await sessionSyncManager.sync(authUser, isIntentionalSignOut)
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
      await applyUser(null, true)
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
