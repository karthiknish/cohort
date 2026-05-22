'use client'

import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'

import { isLoadingPhase } from '@/lib/auth-phase'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'

function getStatusCopy(status: string): { title: string; message: string } {
  switch (status) {
    case 'pending':
      return {
        title: 'Awaiting approval',
        message: 'Your account request is pending review. Check back here after your workspace admin approves access.',
      }
    case 'invited':
      return {
        title: 'Finish your setup',
        message: 'Your invitation is not fully activated yet. Complete the invite flow from your email or ask your admin to resend it.',
      }
    case 'disabled':
      return {
        title: 'Account disabled',
        message: 'This workspace account has been disabled. Contact your workspace administrator if you believe this is a mistake.',
      }
    case 'suspended':
      return {
        title: 'Account suspended',
        message: 'Your access is currently suspended. Contact your workspace administrator for details about reactivation.',
      }
    default:
      return {
        title: 'Account unavailable',
        message: 'We could not verify your account access right now. Refresh your status or sign in again.',
      }
  }
}

export function PendingApprovalContent() {
  const { user, authPhase, authError, retrySync, signOut } = useAuth()
  const { replace } = useRouter()
  const { get } = useUrlSearchParams()
  const requestedStatus = get('status') ?? ''

  useEffect(() => {
    if (isLoadingPhase(authPhase)) {
      return
    }

    if (authPhase === 'unauthenticated') {
      window.location.href = '/auth'
      return
    }

    if (authPhase === 'ready_active') {
      window.location.href = '/for-you'
    }
  }, [authPhase])

  const statusCopy = useMemo(() => {
    return getStatusCopy(user?.status ?? requestedStatus)
  }, [requestedStatus, user?.status])

  const handleRefreshStatus = useCallback(() => {
    void retrySync()
  }, [retrySync])

  const handleSignOut = useCallback(() => {
    void signOut().finally(() => {
      replace('/auth')
    })
  }, [replace, signOut])

  if (isLoadingPhase(authPhase)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Checking your account status…</span>
        </div>
      </div>
    )
  }

  if (authPhase === 'sync_failed') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-foreground">Could not verify your account</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {authError?.message ?? 'We could not finish loading your workspace profile. Try again or sign in once more.'}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleRefreshStatus}>Retry</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </div>
    )
  }

  if (authPhase === 'unauthenticated') {
    return null
  }

  return (
    <PageMotionShell reveal={false}>
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-sm">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Account status</p>
            <h1 className="text-2xl font-semibold text-foreground">{statusCopy.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{statusCopy.message}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleRefreshStatus}>Check status</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </div>
    </PageMotionShell>
  )
}
