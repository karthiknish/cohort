'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'member'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to auth page if not authenticated
        router.push('/auth')
        return
      }

      // Check role requirements if specified
      if (requiredRole) {
        const roleHierarchy = {
          'member': 0,
          'manager': 1,
          'admin': 2
        }

        const userRoleLevel = roleHierarchy[user.role]
        const requiredRoleLevel = roleHierarchy[requiredRole]

        if (userRoleLevel < requiredRoleLevel) {
          // Redirect to dashboard if user doesn't have sufficient permissions
          router.push('/dashboard')
          return
        }
      }
    }
  }, [user, loading, router, requiredRole])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Don't render children if user is not authenticated or doesn't have required role
  if (!user || (requiredRole && !hasRequiredRole(user.role, requiredRole))) {
    return null
  }

  return <>{children}</>
}

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'member': 0,
    'manager': 1,
    'admin': 2
  }

  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0

  return userRoleLevel >= requiredRoleLevel
}
