'use client'

import { LoaderCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'

import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'

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
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedStatus = searchParams.get('status') ?? ''

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Intentional client-side redirect: auth state only available in browser
      router.replace('/auth')
      return
    }

    if (user.status === 'active') {
      // Intentional client-side redirect: auth state only available in browser
      router.replace('/dashboard')
    }
  }, [loading, router, user])

  const statusCopy = useMemo(() => {
    return getStatusCopy(user?.status ?? requestedStatus)
  }, [requestedStatus, user?.status])

  const handleRefreshStatus = useCallback(() => {
    router.refresh()
  }, [router])

  const handleSignOut = useCallback(() => {
    void signOut().finally(() => {
      router.replace('/auth')
    })
  }, [router, signOut])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Checking your account status…</span>
        </div>
      </div>
    )
  }

  return (
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
  )
}
