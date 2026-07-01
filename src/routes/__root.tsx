/// <reference types="vite/client" />
import { type ReactNode } from 'react'
// Sentry init must run before any client-side code to capture pre-hydration errors
import '@/instrument.client'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { Agentation } from 'agentation'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource-variable/anybody'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import '@/shared/ui/livekit-styles'
import { authClient } from '@/lib/auth-client'
import { getToken } from '@/lib/auth-server'
import { SiteHeader } from '@/shared/layout/site/site-header'
import { SiteFooter } from '@/shared/layout/site/site-footer'
import { MarketingThemeScope } from '@/shared/layout/marketing-theme-scope'
import { AppProviders } from '@/shared/providers/app-providers'
import { MotionProvider } from '@/shared/providers/motion-provider'
import { RootNotFound } from '@/shared/ui/route-boundaries/root-not-found'
import { RootAppError } from '@/shared/ui/route-boundaries/root-error'
import { NeutralPendingSkeleton } from '@/shared/ui/neutral-pending-skeleton'
import { NavigationProgress } from '@/shared/ui/navigation-progress'

const fontVariables: Record<string, string> = {
  '--font-geist-sans': "'Geist Variable', sans-serif",
  '--font-geist-mono': "'Geist Mono Variable', monospace",
  '--font-anybody': "'Anybody Variable', sans-serif",
}

const getAuth = createServerFn({ method: 'GET' }).handler(async () => {
  return await getToken()
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: 'var(--color-primary, #2563eb)' },
      { title: 'Cohorts - Marketing Agency Dashboard' },
      {
        name: 'description',
        content:
          'Unified client management & analytics dashboard for marketing agencies',
      },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  beforeLoad: async (ctx) => {
    const token = await getAuth()

    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      isAuthenticated: !!token,
      token,
    }
  },
  component: RootComponent,
  notFoundComponent: RootNotFound,
  errorComponent: RootAppError,
  pendingComponent: () => <NeutralPendingSkeleton />,
})

const showAgentation =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true'

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <RootDocument>
        <NavigationProgress />
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md"
          >
            Skip to main content
          </a>
          <MarketingThemeScope>
            <SiteHeader />
            <main id="main-content" className="flex-1">
              <MotionProvider>
                <Outlet />
                {showAgentation ? <Agentation /> : null}
              </MotionProvider>
            </main>
            <SiteFooter />
          </MarketingThemeScope>
        </AppProviders>
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning style={fontVariables as React.CSSProperties}>
      <head>
        <HeadContent />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased text-foreground',
        )}
      >
        {children}
        <Scripts />
      </body>
    </html>
  )
}
