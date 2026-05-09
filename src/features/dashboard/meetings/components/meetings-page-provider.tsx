'use client'

import { createContext, use, type ReactNode } from 'react'

import { useMeetingsPageController } from '../hooks/use-meetings-page-controller'

type MeetingsPageContextValue = ReturnType<typeof useMeetingsPageController>

const MeetingsPageContext = createContext<MeetingsPageContextValue | null>(null)

export function MeetingsPageProvider({ children }: { children: ReactNode }) {
  const controller = useMeetingsPageController()

  return (
    <MeetingsPageContext.Provider value={controller}>
      {children}
    </MeetingsPageContext.Provider>
  )
}

export function useMeetingsPageContext(): MeetingsPageContextValue {
  const context = use(MeetingsPageContext)

  if (!context) {
    throw new Error('useMeetingsPageContext must be used within a MeetingsPageProvider')
  }

  return context
}