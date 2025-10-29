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
  getIdToken: () => Promise<string>
  signUp: (data: SignUpData) => Promise<AuthUser>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
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

  const applyUser = useCallback((authUser: AuthUser | null) => {
    setUser(authUser)
    void syncSessionCookies(authUser)
  }, [])

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      applyUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [applyUser])

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signIn(email, password)
      applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: SignUpData): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signUp(data)
      applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signInWithGoogle()
      applyUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      applyUser(null)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    return await authService.resetPassword(email)
  }

  const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const authUser = await authService.updateProfile(data)
    applyUser(authUser)
    return authUser
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    return await authService.changePassword(currentPassword, newPassword)
  }

  const connectGoogleAdsAccount = async () => {
    await authService.connectGoogleAdsAccount()
  }

  const connectFacebookAdsAccount = async () => {
    await authService.connectFacebookAdsAccount()
  }

  const connectLinkedInAdsAccount = async () => {
    await authService.connectLinkedInAdsAccount()
  }

  const startMetaOauth = async (redirect?: string) => {
    return await authService.startMetaOauth(redirect)
  }

  const getIdToken = async () => {
    return await authService.getIdToken()
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    connectGoogleAdsAccount,
    connectFacebookAdsAccount,
    connectLinkedInAdsAccount,
    startMetaOauth,
    getIdToken,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

async function syncSessionCookies(authUser: AuthUser | null) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (!authUser) {
      clearCookie('cohorts_token')
      clearCookie('cohorts_role')
      return
    }

    const token = await authService.getIdToken()
    setCookie('cohorts_token', token, 60 * 60)
    setCookie('cohorts_role', authUser.role, 60 * 60)
  } catch (error) {
    console.error('Failed to sync auth cookies', error)
    clearCookie('cohorts_token')
    clearCookie('cohorts_role')
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}
