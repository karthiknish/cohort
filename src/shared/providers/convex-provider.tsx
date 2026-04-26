'use client'

import type { ReactNode } from 'react'
import { useMemo, useEffect } from 'react'
import { ConvexProvider, ConvexReactClient, useConvexAuth } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { AlertTriangle } from 'lucide-react'

import { authClient } from '@/lib/auth-client'

function AuthDebug() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ConvexAuth] State:', { isLoading, isAuthenticated })
    }
  }, [isLoading, isAuthenticated])
  return null
}

interface ConvexClientProviderProps {
  children: ReactNode
  initialToken?: string | null
}

export function ConvexClientProvider({ children, initialToken }: ConvexClientProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  const useBetterAuth = process.env.NEXT_PUBLIC_USE_BETTER_AUTH !== 'false'

  const client = useMemo(() => {
    if (!convexUrl) return null
    return new ConvexReactClient(convexUrl)
  }, [convexUrl])

  if (!client) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[convex] NEXT_PUBLIC_CONVEX_URL is not set; Convex client is disabled.'
      )
    }
    return (
      <>
        <div
          role="alert"
          aria-live="polite"
          className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground"
        >
          <div className="mx-auto flex max-w-5xl items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium">Convex is not configured</p>
              <p className="mt-1 text-muted-foreground">
                {process.env.NODE_ENV === 'production'
                  ? 'Real-time data and server features are unavailable. Set NEXT_PUBLIC_CONVEX_URL in your deployment environment.'
                  : 'Set NEXT_PUBLIC_CONVEX_URL in .env.local to enable Convex (real-time data, mutations, and server features).'}
              </p>
            </div>
          </div>
        </div>
        {children}
      </>
    )
  }

  if (useBetterAuth) {
    return (
      <ConvexBetterAuthProvider client={client} authClient={authClient} initialToken={initialToken ?? undefined}>
        <AuthDebug />
        {children}
      </ConvexBetterAuthProvider>
    )
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
