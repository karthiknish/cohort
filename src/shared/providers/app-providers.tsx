'use client'

import { Suspense, type ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'

import { AuthProvider } from '@/shared/contexts/auth-context'
import { AnalyticsProvider } from '@/shared/providers/analytics-provider'
import { PostHogProvider } from '@/shared/providers/posthog-provider'
import { ConvexClientProvider } from '@/shared/providers/convex-provider'
import { QueryProvider } from '@/shared/providers/query-provider'
import { Toaster } from '@/shared/ui/toaster'
import { Toaster as SonnerToaster } from '@/shared/ui/sonner'

interface AppProvidersProps {
  children: ReactNode
  initialToken?: string | null
}

export function AppProviders({ children, initialToken }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConvexClientProvider initialToken={initialToken}>
        <AuthProvider>
          <QueryProvider>
            <Suspense fallback={null}>
              <AnalyticsProvider>
                <PostHogProvider>
                  {children}
                  <Toaster />
                  <SonnerToaster />
                </PostHogProvider>
              </AnalyticsProvider>
            </Suspense>
          </QueryProvider>
        </AuthProvider>
      </ConvexClientProvider>
    </ThemeProvider>
  )
}
