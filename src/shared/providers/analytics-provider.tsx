'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { logPageView, setAnalyticsUserId } from '@/lib/analytics'
import { useAuth } from '@/shared/contexts/auth-context'
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'

const PAGE_VIEW_DEBOUNCE_MS = 300

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useUrlSearchParams()
  const { user } = useAuth()
  const serializedSearch = searchParams?.toString() ?? ''

  useEffect(() => {
    let isMounted = true
    const nextUserId = user?.id ?? null

    void (async () => {
      if (!isMounted) return
      await setAnalyticsUserId(nextUserId)
    })()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!pathname) return

    const timeout = setTimeout(() => {
      const fullPath = serializedSearch.length > 0 ? `${pathname}?${serializedSearch}` : pathname
      void logPageView(fullPath)
    }, PAGE_VIEW_DEBOUNCE_MS)

    return () => {
      clearTimeout(timeout)
    }
  }, [pathname, serializedSearch])

  return <>{children}</>
}
