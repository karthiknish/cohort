'use client'

import type { ReactNode } from 'react'

import { AuthProvider } from '@/contexts/auth-context'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { MotionProvider } from '@/components/providers/motion-provider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <PostHogProvider>
          <MotionProvider>{children}</MotionProvider>
        </PostHogProvider>
      </AnalyticsProvider>
    </AuthProvider>
  )
}
