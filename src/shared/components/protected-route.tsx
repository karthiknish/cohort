'use client'

import { useConvexAuth } from 'convex/react'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'
import { toast } from '@/shared/ui/sonner'

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000
const SESSION_WARNING_WINDOW_MS = SESSION_DURATION_MS / 10
const SESSION_WARNING_TOAST_ID = 'session-expiry-warning'
const SESSION_EXPIRED_TOAST_ID = 'session-expired'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'team' | 'client'
  allowPreviewAccess?: boolean
}

type SessionMetadata = {
  hasSession: boolean
  expiresAt: number | null
  csrfToken: string | null
}

async function fetchSessionMetadata(): Promise<SessionMetadata | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-store',
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json() as {
      hasSession?: unknown
      expiresAt?: unknown
      csrfToken?: unknown
    }

    return {
      hasSession: payload.hasSession === true,
      expiresAt: typeof payload.expiresAt === 'number' && Number.isFinite(payload.expiresAt)
        ? payload.expiresAt
        : null,
      csrfToken: typeof payload.csrfToken === 'string' && payload.csrfToken.length > 0
        ? payload.csrfToken
        : null,
    }
  } catch {
    return null
  }
}

async function refreshSession(): Promise<SessionMetadata | null> {
  const metadata = await fetchSessionMetadata()
  if (!metadata?.csrfToken) {
    return null
  }

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': metadata.csrfToken,
    },
    body: '{}',
  })

  if (!response.ok) {
    return null
  }

  return await fetchSessionMetadata()
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
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  actionVariant?: 'default' | 'outline'
  showSpinner?: boolean
}

function AccessOverlay({
  title,
  message,
  actionHref,
  actionLabel,
  actionOnClick,
  actionVariant = 'default',
  showSpinner,
}: AccessOverlayProps) {
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
        {actionLabel ? (
          <div className="mt-4">
            {actionHref ? (
              <Button asChild variant={actionVariant}>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button variant={actionVariant} onClick={actionOnClick}>
                {actionLabel}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ProtectedRoute({ children, requiredRole, allowPreviewAccess = false }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasPreviewAccess = allowPreviewAccess
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSessionTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
  }, [])

  const redirectToAuth = useCallback(() => {
    const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : ''
    router.replace(`/auth${redirectParam}`)
  }, [pathname, router])

  useEffect(() => {
    return () => {
      clearSessionTimers()
      toast.dismiss(SESSION_WARNING_TOAST_ID)
      toast.dismiss(SESSION_EXPIRED_TOAST_ID)
    }
  }, [clearSessionTimers])

  // Handle blocked user with retry mechanism
  const handleBlockedSignOut = useCallback(() => {
    void signOut()
      .finally(() => {
        router.push('/')
      })
  }, [signOut, router])

  const handleSessionExpired = useCallback(() => {
    clearSessionTimers()
    toast.dismiss(SESSION_WARNING_TOAST_ID)
    toast.error('Session expired', {
      id: SESSION_EXPIRED_TOAST_ID,
      description: 'Please sign in again to continue where you left off.',
      duration: 6000,
    })

    void signOut().finally(() => {
      redirectToAuth()
    })
  }, [clearSessionTimers, redirectToAuth, signOut])

  const scheduleSessionPrompts = useCallback((metadata: SessionMetadata | null) => {
    clearSessionTimers()

    if (!metadata?.hasSession || !metadata.expiresAt) {
      return
    }

    const remainingMs = metadata.expiresAt - Date.now()
    if (remainingMs <= 0) {
      handleSessionExpired()
      return
    }

    const showWarning = () => {
      toast.warning('Session ending soon', {
        id: SESSION_WARNING_TOAST_ID,
        description: 'Stay signed in to keep working without interruption.',
        duration: 0,
        action: {
          label: 'Stay signed in',
          onClick: () => {
            void refreshSession()
              .then((nextMetadata) => {
                if (!nextMetadata?.hasSession || !nextMetadata.expiresAt) {
                  throw new Error('Session refresh failed')
                }

                toast.success('Session extended', {
                  id: SESSION_WARNING_TOAST_ID,
                  description: 'Your workspace session is active again.',
                  duration: 4000,
                })
                scheduleSessionPrompts(nextMetadata)
              })
              .catch(() => {
                toast.error('Could not extend session', {
                  id: SESSION_WARNING_TOAST_ID,
                  description: 'Please save your work and sign in again before the session expires.',
                  duration: 6000,
                })
              })
          },
        },
      })
    }

    if (remainingMs <= SESSION_WARNING_WINDOW_MS) {
      showWarning()
    } else {
      warningTimerRef.current = setTimeout(showWarning, remainingMs - SESSION_WARNING_WINDOW_MS)
    }

    expiryTimerRef.current = setTimeout(() => {
      handleSessionExpired()
    }, remainingMs)
  }, [clearSessionTimers, handleSessionExpired])

  useEffect(() => {
    if (hasPreviewAccess || loading || convexAuthLoading || !user || !isAuthenticated || user.status !== 'active') {
      clearSessionTimers()
      toast.dismiss(SESSION_WARNING_TOAST_ID)
      return
    }

    let cancelled = false

    const syncSessionExpiry = async () => {
      const metadata = await fetchSessionMetadata()
      if (cancelled) return
      scheduleSessionPrompts(metadata)
    }

    void syncSessionExpiry()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncSessionExpiry()
      }
    }

    const handleFocus = () => {
      void syncSessionExpiry()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearSessionTimers()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clearSessionTimers, convexAuthLoading, hasPreviewAccess, isAuthenticated, loading, scheduleSessionPrompts, user])

  useEffect(() => {
    if (!hasPreviewAccess && user && user.status !== 'active' && pathname !== '/pending-approval') {
      const nextUrl = `/pending-approval?status=${encodeURIComponent(user.status)}`
      router.replace(nextUrl)
    }
  }, [hasPreviewAccess, pathname, router, user])

  if (hasPreviewAccess) {
    return <>{children}</>
  }

  if (loading || convexAuthLoading) {
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
        actionLabel="Go to sign in"
        actionHref="/auth"
      />
    )
  }

  // Handle non-active user status
  if (user.status !== 'active') {
    return (
      <AccessOverlay
        title="Checking account access"
        message="Taking you to your account status page so you can review the next steps."
        showSpinner
      />
    )
  }

  // Handle insufficient permissions
  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return (
      <AccessOverlay
        title="Insufficient permissions"
        message="You do not have the required role to access this area."
        actionLabel="Back to dashboard"
        actionHref="/dashboard"
      />
    )
  }

  return <>{children}</>
}
