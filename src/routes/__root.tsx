import { Suspense, type ReactNode } from 'react'
// Sentry init must run before any client-side code to capture pre-hydration errors
import '@/instrument.client'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Agentation } from 'agentation'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource-variable/anybody'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import '@/shared/ui/livekit-styles'
import { SiteHeader } from '@/shared/layout/site/site-header'
import { SiteFooter } from '@/shared/layout/site/site-footer'
import { MarketingThemeScope } from '@/shared/layout/marketing-theme-scope'
import { PWAProvider } from '@/shared/providers/pwa-provider'
import { AppProviders } from '@/shared/providers/app-providers'
import { MotionProvider } from '@/shared/providers/motion-provider'
import { GoogleAnalyticsScript } from '@/shared/providers/google-analytics-script'
import { RootNotFound } from '@/shared/ui/route-boundaries/root-not-found'
import { RootAppError } from '@/shared/ui/route-boundaries/root-error'
import { NeutralPendingSkeleton } from '@/shared/ui/neutral-pending-skeleton'

const fontVariables: Record<string, string> = {
  '--font-geist-sans': "'Geist Variable', sans-serif",
  '--font-geist-mono': "'Geist Mono Variable', monospace",
  '--font-anybody': "'Anybody Variable', sans-serif",
}

const resolveInitialToken = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  const pathname = getRequestHeader('x-pathname') ?? ''
  const needsConvexToken =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/for-you') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings')
  if (!needsConvexToken) return null
  const { getToken } = await import('@/lib/auth-token.server')
  return (await getToken()) ?? null
})

export const Route = createRootRoute({
  loader: () => resolveInitialToken(),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // Reference the design-token primary color so we don't hardcode a hex.
      // The fallback preserves the historical value when CSS hasn't loaded yet
      // (PDF viewers, RSS readers, OS-level theme-color consumers).
      { name: 'theme-color', content: 'var(--color-primary, #2563eb)' },
      { title: 'Cohorts - Marketing Agency Dashboard' },
      {
        name: 'description',
        content: 'Unified client management & analytics dashboard for marketing agencies',
      },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  component: RootComponent,
  notFoundComponent: RootNotFound,
  errorComponent: RootAppError,
  pendingComponent: () => <NeutralPendingSkeleton />,
})

const showAgentation =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true'

function RootComponent() {
  const initialToken = Route.useLoaderData()
  return (
    <RootDocument initialToken={initialToken}>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({
  children,
  initialToken,
}: Readonly<{ children: ReactNode; initialToken: string | null }>) {
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
        <Suspense fallback={null}>
          <GoogleAnalyticsScript />
        </Suspense>
        <AppProviders initialToken={initialToken}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md"
          >
            Skip to main content
          </a>
          <MarketingThemeScope>
            <SiteHeader />
            <main id="main-content" className="flex-1">
              <MotionProvider>{children}</MotionProvider>
              {showAgentation ? <Agentation /> : null}
            </main>
            <SiteFooter />
          </MarketingThemeScope>
          <Suspense fallback={null}>
            <PWAProvider />
          </Suspense>
        </AppProviders>
        <Scripts />
      </body>
    </html>
  )
}
