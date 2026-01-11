'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'

import { authClient } from '@/lib/auth-client'

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
        {children}
      </ConvexBetterAuthProvider>
    )
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
