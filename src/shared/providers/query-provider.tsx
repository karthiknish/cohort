'use client'

import { QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

function QueryFetchingIndicator() {
  const n = useIsFetching()
  if (n === 0) return null
  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[200] h-0.5 overflow-hidden bg-accent/15 motion-safe:animate-pulse"
      role="status"
      aria-live="polite"
      aria-label="Refreshing data in the background"
    />
  )
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <QueryFetchingIndicator />
      {children}
    </QueryClientProvider>
  )
}
