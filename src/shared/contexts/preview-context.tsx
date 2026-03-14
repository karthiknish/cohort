'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type PropsWithChildren } from 'react'

import { isPreviewModeEnabled, setPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY } from '@/lib/preview-data'

interface PreviewContextValue {
  isPreviewMode: boolean
  togglePreviewMode: () => void
  setPreviewMode: (enabled: boolean) => void
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined)

export function PreviewProvider({ children }: PropsWithChildren) {
  const [isPreviewMode, setIsPreviewMode] = useState(() => isPreviewModeEnabled())

  useEffect(() => {
    const syncFromStorage = () => {
      setIsPreviewMode(isPreviewModeEnabled())
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === PREVIEW_MODE_STORAGE_KEY) {
        syncFromStorage()
      }
    }

    const onPreviewEvent = () => {
      syncFromStorage()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener)
    }
  }, [])

  const updatePreviewMode = useCallback((enabled: boolean) => {
    setIsPreviewMode(enabled)
    setPreviewModeEnabled(enabled)
  }, [])

  const togglePreviewMode = useCallback(() => {
    const nextValue = !isPreviewMode
    updatePreviewMode(nextValue)
  }, [isPreviewMode, updatePreviewMode])

  const setPreviewMode = useCallback((enabled: boolean) => {
    updatePreviewMode(enabled)
  }, [updatePreviewMode])

  const value = useMemo(() => ({
    isPreviewMode,
    togglePreviewMode,
    setPreviewMode,
  }), [isPreviewMode, togglePreviewMode, setPreviewMode])

  return (
    <PreviewContext.Provider value={value}>
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
