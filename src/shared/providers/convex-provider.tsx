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
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div
          role="alert"
          aria-live="assertive"
          className="w-full max-w-xl rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Convex is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {process.env.NODE_ENV === 'production'
              ? 'Core data, authentication, and real-time features are unavailable because NEXT_PUBLIC_CONVEX_URL is missing from this deployment.'
              : 'Set NEXT_PUBLIC_CONVEX_URL in .env.local to enable Convex before loading the application UI.'}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
            Application unavailable until the data layer is configured
          </p>
        </div>
      </div>
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
