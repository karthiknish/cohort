'use client'

import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react'

interface PreviewContextValue {
  isPreviewMode: boolean
  togglePreviewMode: () => void
  setPreviewMode: (enabled: boolean) => void
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined)

export function PreviewProvider({ children }: PropsWithChildren) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
  }, [])

  const setPreviewMode = useCallback((enabled: boolean) => {
    setIsPreviewMode(enabled)
  }, [])

  return (
    <PreviewContext.Provider value={{ isPreviewMode, togglePreviewMode, setPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  const context = useContext(PreviewContext)
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider')
  }
  return context
}
