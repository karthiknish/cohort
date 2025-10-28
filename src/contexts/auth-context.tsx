'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, authService } from '@/services/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (data: { email: string; password: string; name: string; agencyName: string }) => Promise<AuthUser>
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

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signIn(email, password)
      setUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: {
    email: string
    password: string
    name: string
    agencyName: string
  }): Promise<AuthUser> => {
    setLoading(true)
    try {
      const authUser = await authService.signUp(data)
      setUser(authUser)
      return authUser
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    return await authService.resetPassword(email)
  }

  const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const authUser = await authService.updateProfile(data)
    setUser(authUser)
    return authUser
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    return await authService.changePassword(currentPassword, newPassword)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
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
