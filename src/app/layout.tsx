import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Anybody } from 'next/font/google'
import { Agentation } from 'agentation'
export const dynamic = 'force-dynamic'
import './globals.css'
import '@/bones/registry.js'
import { cn } from '@/lib/utils'
import '@/shared/ui/livekit-styles'
import { SiteHeader } from '@/shared/layout/site/site-header'
import { SiteFooter } from '@/shared/layout/site/site-footer'
import { PWAProvider } from '@/shared/providers/pwa-provider'
import { AppProviders } from '@/shared/providers/app-providers'
import { MotionProvider } from '@/shared/providers/motion-provider'
import { GoogleAnalyticsScript } from '@/shared/providers/google-analytics-script'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const anybody = Anybody({
  variable: '--font-anybody',
  subsets: ['latin'],
  display: 'swap',
  weight: 'variable',
})

export const metadata: Metadata = {
  title: 'Cohorts - Marketing Agency Dashboard',
  description: 'Unified client management & analytics dashboard for marketing agencies',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: 'hsl(var(--background))',
}

const showAgentation = process.env.NODE_ENV === 'development'
  && process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          geistSans.variable,
          geistMono.variable,
          anybody.variable,
          'min-h-screen bg-background font-sans antialiased text-foreground'
        )}
      >
        <Suspense fallback={null}>
          <GoogleAnalyticsScript />
        </Suspense>
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md"
          >
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
              <MotionProvider>{children}</MotionProvider>
              {showAgentation ? <Agentation /> : null}
            </main>
            <SiteFooter />
          </div>
          <Suspense fallback={null}>    
            <PWAProvider />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  )
}
