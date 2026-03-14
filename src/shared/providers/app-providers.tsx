'use client'

import { Suspense, type ReactNode } from 'react'

import { AuthProvider } from '@/shared/contexts/auth-context'
import { AnalyticsProvider } from '@/shared/providers/analytics-provider'
import { PostHogProvider } from '@/shared/providers/posthog-provider'
import { ConvexClientProvider } from '@/shared/providers/convex-provider'
import { QueryProvider } from '@/shared/providers/query-provider'

interface AppProvidersProps {
  children: ReactNode
  initialToken?: string | null
}

export function AppProviders({ children, initialToken }: AppProvidersProps) {
  return (
    <ConvexClientProvider initialToken={initialToken}>
      <AuthProvider>
        <QueryProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <PostHogProvider>
                {children}
              </PostHogProvider>
            </AnalyticsProvider>
          </Suspense>
        </QueryProvider>
      </AuthProvider>
    </ConvexClientProvider>
  )
}
