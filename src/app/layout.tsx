import type { Metadata } from 'next'
import { Geist, Geist_Mono, Anybody } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Agentation } from "agentation";
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { PWAProvider } from '@/components/providers/pwa-provider'
import { AppProviders } from '@/components/providers/app-providers'
import { GoogleAnalyticsScript } from '@/components/providers/google-analytics-script'

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
          <AppProviders>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <PWAProvider />
          </AppProviders>
        </Suspense>
        <Toaster />
        <SonnerToaster />
        {process.env.NODE_ENV === "development" && <Agentation key="agentation-tool" />}
      </body>
    </html>
  )
}
