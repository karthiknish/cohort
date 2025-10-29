'use client'

import type { ReactNode } from 'react'

import { AuthProvider } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
    </AuthProvider>
  )
}
