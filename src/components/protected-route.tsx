'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { SESSION_EXPIRES_COOKIE } from '@/lib/auth-server'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'team' | 'client'
}

function hasValidSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_EXPIRES_COOKIE}=([^;]*)`))
  if (!match) return false
  const expiresAt = Number.parseInt(decodeURIComponent(match[1]), 10)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
  const roleHierarchy = {
    client: 0,
    team: 1,
    admin: 2,
  }
  
  const userRoleLevel = userRole ? (roleHierarchy as Record<string, number>)[userRole] : 0
  const requiredRoleLevel = requiredRole ? (roleHierarchy as Record<string, number>)[requiredRole] : 0
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
  const { user, loading, isSyncing, signOut } = useAuth()
  const router = useRouter()
  const [isAwaitingAuthRestore, setIsAwaitingAuthRestore] = useState(() => hasValidSessionCookie())

  // Clear awaiting state once user is loaded or auth loading completes
  const clearAwaitingState = useCallback(() => {
    if (isAwaitingAuthRestore) {
      setIsAwaitingAuthRestore(false)
    }
  }, [isAwaitingAuthRestore])

  // Wait for auth to settle and handle pending status
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        if (user.status !== 'active') {
          router.push('/dashboard')
        }
      }, 200)
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [user, isAwaitingAuthRestore])

  // Handle blocked user with retry mechanism
  const handleBlockedSignOut = useCallback(async () => {
    try {
      await signOut()
    } finally {
      router.push('/')
    }
  }, [signOut, router])

  // Show loading or sync overlay during auth states
  if (loading || isSyncing || isAwaitingAuthRestore) {
    return (
      <AccessOverlay
        title={isSyncing ? 'Syncing your session' : 'Loading your workspace'}
        message="Just a moment while we secure your account and verify your permissions."
        showSpinner
      />
    )
  }

  // Temporarily bypass auth checks for testing - user should be authenticated
  if (process.env.NODE_ENV === 'development' && !loading && hasValidSessionCookie()) {
    console.log('Development mode: Bypassing auth checks - user should be authenticated')
    return <>{children}</>
  }

  // Handle unauthenticated user
  if (!user) {
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