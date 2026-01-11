'use client'

import type { ReactNode } from 'react'

import { AuthProvider } from '@/contexts/auth-context'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { MotionProvider } from '@/components/providers/motion-provider'
import { ConvexClientProvider } from '@/components/providers/convex-provider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ConvexClientProvider>

        <AnalyticsProvider>
          <PostHogProvider>
            <MotionProvider>{children}</MotionProvider>
          </PostHogProvider>
        </AnalyticsProvider>
      </ConvexClientProvider>
    </AuthProvider>
  )
}
