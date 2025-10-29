'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'member'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth')
      return
    }

    if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
      router.push('/dashboard')
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <AccessOverlay
        title="Loading your workspace"
        message="Just a moment while we check your account permissions."
        showSpinner
      />
    )
  }

  if (!user) {
    return (
      <AccessOverlay
        title="Sign in required"
        message="You need to sign in to access this area."
        action={
          <Button asChild>
            <Link href="/auth">Go to sign in</Link>
          </Button>
        }
      />
    )
  }

  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return (
      <AccessOverlay
        title="Insufficient permissions"
        message="You do not have access to this section."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    member: 0,
    manager: 1,
    admin: 2,
  }

  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0

  return userRoleLevel >= requiredRoleLevel
}

interface AccessOverlayProps {
  title: string
  message: string
  action?: React.ReactNode
  showSpinner?: boolean
}

function AccessOverlay({ title, message, action, showSpinner }: AccessOverlayProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        {showSpinner && (
          <div className="mb-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  )
}
