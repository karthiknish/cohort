'use client'

import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'team' | 'client'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth')
      return
    }

    if (user.status !== 'active') {
      return
    }

    if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
      router.push('/dashboard')
    }
  }, [user, loading, router, requiredRole])

  const handleBlockedSignOut = useCallback(async () => {
    try {
      await signOut()
    } finally {
      router.push('/auth')
    }
  }, [signOut, router])

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

  if (user.status !== 'active') {
    const { title, message } = getStatusCopy(user.status)
    return (
      <AccessOverlay
        title={title}
        message={message}
        action={
          <Button type="button" variant="outline" onClick={handleBlockedSignOut}>
            Sign out
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
    client: 0,
    team: 1,
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

function getStatusCopy(status: string): { title: string; message: string } {
  switch (status) {
    case 'pending':
      return {
        title: 'Awaiting approval',
        message: 'Your account request is pending admin approval. We will notify you once access is granted.',
      }
    case 'invited':
      return {
        title: 'Finish your setup',
        message: 'Complete your invitation email to activate your access. Contact your admin if you need a new invite.',
      }
    case 'disabled':
      return {
        title: 'Account disabled',
        message: 'Access to this workspace has been disabled. Reach out to your administrator if you believe this is a mistake.',
      }
    case 'suspended':
      return {
        title: 'Account suspended',
        message: 'Your account has been suspended. Contact your administrator to review the suspension.',
      }
    default:
      return {
        title: 'Account unavailable',
        message: 'We are unable to load your workspace right now. Try signing in again or contact support.',
      }
  }
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
