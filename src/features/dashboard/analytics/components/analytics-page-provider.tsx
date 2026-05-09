'use client'

import { createContext, use, type ReactNode } from 'react'

import { useAnalyticsPageController } from '../hooks/use-analytics-page-controller'

type AnalyticsPageContextValue = ReturnType<typeof useAnalyticsPageController>

const AnalyticsPageContext = createContext<AnalyticsPageContextValue | null>(null)

export function AnalyticsPageProvider({ children }: { children: ReactNode }) {
  const controller = useAnalyticsPageController()

  return (
    <AnalyticsPageContext.Provider value={controller}>
      {children}
    </AnalyticsPageContext.Provider>
  )
}

export function useAnalyticsPageContext(): AnalyticsPageContextValue {
  const context = use(AnalyticsPageContext)

  if (!context) {
    throw new Error('useAnalyticsPageContext must be used within an AnalyticsPageProvider')
  }

  return context
}