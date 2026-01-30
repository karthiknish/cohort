'use client'

import { Suspense, type ReactNode } from 'react'

import { AuthProvider } from '@/contexts/auth-context'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { MotionProvider } from '@/components/providers/motion-provider'
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { QueryProvider } from '@/components/providers/query-provider'

interface AppProvidersProps {
  children: ReactNode
  initialToken?: string | null
}

export function AppProviders({ children, initialToken }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ConvexClientProvider initialToken={initialToken}>
        <QueryProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <PostHogProvider>
                <MotionProvider>{children}</MotionProvider>
              </PostHogProvider>
            </AnalyticsProvider>
          </Suspense>
        </QueryProvider>
      </ConvexClientProvider>
    </AuthProvider>
  )
}
