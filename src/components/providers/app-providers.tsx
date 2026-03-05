'use client'

import { Suspense, type ReactNode } from 'react'

import { AuthProvider } from '@/contexts/auth-context'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { QueryProvider } from '@/components/providers/query-provider'

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
