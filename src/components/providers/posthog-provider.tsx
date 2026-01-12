'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

declare global {
  // eslint-disable-next-line no-var
  var __cohortsPostHogInitialized: boolean | undefined
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // In dev/StrictMode and with nested providers, this component can mount twice.
    // PostHog logs a warning if init is called more than once.
    if (globalThis.__cohortsPostHogInitialized) return

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) return

    posthog.init(key, {
      api_host: host,
      person_profiles: 'always',
      capture_pageview: false, // handled in AnalyticsProvider
      capture_pageleave: true,
    })

    globalThis.__cohortsPostHogInitialized = true
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
