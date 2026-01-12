'use client'

import type { ReactNode } from 'react'
import { useMemo, useEffect } from 'react'
import { ConvexProvider, ConvexReactClient, useConvexAuth } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'

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
    return <>{children}</>
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
