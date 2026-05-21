'use client'

import { createContext, use, useCallback, useMemo, type ReactNode } from 'react'

import type { AuthPhase } from '@/lib/auth-phase'
import { authService } from '@/services/auth'
import type { AuthUser, SignUpData } from '@/services/auth'
import {
  useAuthSync,
  type AuthError,
  type AuthErrorCode,
} from '@/shared/hooks/use-auth-sync'
import { authClient } from '@/lib/auth-client'

export type { AuthError, AuthErrorCode }

interface AuthContextType {
  user: AuthUser | null
  authPhase: AuthPhase
  loading: boolean
  isSyncing: boolean
  authError: AuthError | null
  clearAuthError: () => void
  retrySync: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthUser>
  signInWithGoogle: (callbackURL?: string) => Promise<void>
  connectGoogleAdsAccount: () => Promise<void>
  connectGoogleAnalyticsAccount: () => Promise<void>
  connectFacebookAdsAccount: () => Promise<void>
  connectLinkedInAdsAccount: () => Promise<void>
  startGoogleOauth: (redirect?: string, clientId?: string | null) => Promise<{ url: string }>
  startGoogleWorkspaceOauth: (redirect?: string) => Promise<{ url: string }>
  startMetaOauth: (redirect?: string, clientId?: string | null, surface?: 'facebook' | 'instagram', entryPoint?: 'socials' | 'ads') => Promise<{ url: string }>
  startTikTokOauth: (redirect?: string, clientId?: string | null) => Promise<{ url: string }>
  startLinkedInOauth: (redirect?: string, clientId?: string | null) => Promise<{ url: string }>
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
  const context = use(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    phase: authPhase,
    user,
    authError,
    clearAuthError,
    retrySync,
    resetSession,
    applySessionUser,
    loading,
    isSyncing,
  } = useAuthSync()

  const signIn = useCallback((email: string, password: string): Promise<AuthUser> => {
    return authService
      .signIn(email, password)
      .then((authUser) => {
        applySessionUser(authUser)
        return authUser
      })
  }, [applySessionUser])

  const signUp = useCallback((data: SignUpData): Promise<AuthUser> => {
    return authService
      .signUp(data)
      .then((authUser) => {
        applySessionUser(authUser)
        return authUser
      })
  }, [applySessionUser])

  const signInWithGoogle = useCallback((callbackURL?: string): Promise<void> => {
    return authService.signInWithGoogle(callbackURL)
  }, [])

  const signOut = useCallback((): Promise<void> => {
    return authService
      .signOut()
      .then(() => {
        resetSession()
      })
      .catch((error) => {
        resetSession()
        throw error
      })
  }, [resetSession])

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
    applySessionUser(authUser)
    return authUser
  }, [applySessionUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    void currentPassword
    void newPassword
    await authService.changePassword()
  }, [])

  const deleteAccount = useCallback((): Promise<void> => {
    return authService
      .deleteAccount()
      .then(() => {
        resetSession()
      })
  }, [resetSession])

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

  const startGoogleOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
    return await authService.startGoogleOauth(redirect, clientId)
  }, [])

  const startGoogleWorkspaceOauth = useCallback(async (redirect?: string) => {
    return await authService.startGoogleWorkspaceOauth(redirect)
  }, [])

  const startMetaOauth = useCallback(async (redirect?: string, clientId?: string | null, surface?: 'facebook' | 'instagram', entryPoint?: 'socials' | 'ads') => {
    return await authService.startMetaOauth(redirect, clientId, surface, entryPoint)
  }, [])

  const startTikTokOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
    return await authService.startTikTokOauth(redirect, clientId)
  }, [])

  const startLinkedInOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
    return await authService.startLinkedInOauth(redirect, clientId)
  }, [])

  const disconnectProvider = useCallback(async (providerId: string, clientId?: string | null) => {
    void providerId
    void clientId
    await authService.disconnectProvider()
  }, [])

  const getIdToken = useCallback(async () => {
    if (typeof window === 'undefined') return null

    const result = await authClient.convex.token().catch(() => null)
    if (!result) return null

    let payload: unknown = result
    if (typeof result === 'object' && result !== null && 'data' in result) {
      payload = (result as { data?: unknown }).data
    }

    if (typeof payload !== 'object' || payload === null || !('token' in payload)) {
      return null
    }

    const token = (payload as { token?: unknown }).token
    return typeof token === 'string' && token.trim().length > 0 ? token.trim() : null
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      authPhase,
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
      startGoogleOauth,
      startGoogleWorkspaceOauth,
      startMetaOauth,
      startTikTokOauth,
      startLinkedInOauth,
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
      authPhase,
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
      startGoogleOauth,
      startGoogleWorkspaceOauth,
      startMetaOauth,
      startTikTokOauth,
      startLinkedInOauth,
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
