'use client'

import { useConvexAuth } from 'convex/react'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'
import { SESSION_EXPIRES_COOKIE } from '@/lib/auth-server'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'team' | 'client'
}

function hasValidSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_EXPIRES_COOKIE}=([^;]*)`))
  if (!match) return false
  const encodedValue = match[1]
  if (!encodedValue) return false
  const expiresAt = Number.parseInt(decodeURIComponent(encodedValue), 10)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
  const roleHierarchy: Record<string, number> = {
    client: 0,
    team: 1,
    admin: 2,
  }

  const userRoleLevel = userRole ? roleHierarchy[userRole] ?? 0 : 0
  const requiredRoleLevel = requiredRole ? roleHierarchy[requiredRole] ?? 0 : 0
  return userRoleLevel >= requiredRoleLevel
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
        message: 'Access to this workspace has been disabled. Contact your administrator.',
      }
    case 'suspended':
      return {
        title: 'Account suspended',
        message: 'Your account has been suspended. Contact your administrator.',
      }
    default:
      return {
        title: 'Account unavailable',
        message: 'We are unable to load your workspace right now. Try signing in again or contact support.',
      }
  }
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
            <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const router = useRouter()
  const [isAwaitingAuthRestore, setIsAwaitingAuthRestore] = useState(() => hasValidSessionCookie())

  // Clear awaiting state once auth loading completes or session cookie is gone.
  useEffect(() => {
    if (!isAwaitingAuthRestore) return

    const shouldClear = !loading || !hasValidSessionCookie()
    if (!shouldClear) return

    const frameId = requestAnimationFrame(() => {
      setIsAwaitingAuthRestore(false)
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isAwaitingAuthRestore, loading])

  // Handle blocked user with retry mechanism
  const handleBlockedSignOut = useCallback(() => {
    void signOut()
      .finally(() => {
        router.push('/')
      })
  }, [signOut, router])

  if (loading || convexAuthLoading || isAwaitingAuthRestore) {
    return (
      <AccessOverlay
        title="Loading your workspace"
        message="Just a moment while we secure your account and verify your permissions."
        showSpinner
      />
    )
  }

  // Handle unauthenticated user
  if (!user || !isAuthenticated) {
    return (
      <AccessOverlay
        title="Sign in required"
        message="You need to sign in to access this area of the application."
        action={
          <Button asChild>
            <Link href="/">Go to sign in</Link>
          </Button>
        }
      />
    )
  }

  // Handle non-active user status
  if (user.status !== 'active') {
    const { title, message } = getStatusCopy(user.status || '')
    return (
      <AccessOverlay
        title={title}
        message={message}
        action={
          <Button variant="outline" onClick={handleBlockedSignOut}>
            Sign out and try again
          </Button>
        }
      />
    )
  }

  // Handle insufficient permissions
  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return (
      <AccessOverlay
        title="Insufficient permissions"
        message="You do not have the required role to access this area."
        action={
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
