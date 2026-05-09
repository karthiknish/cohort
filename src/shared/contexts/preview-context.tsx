'use client'

import { createContext, use, useEffect, useState, useCallback, useMemo, type PropsWithChildren } from 'react'

import {
  isPreviewModeEnabled,
  isScreenRecordingModeEnabled,
  setPreviewModeEnabled,
  PREVIEW_MODE_EVENT,
  PREVIEW_MODE_STORAGE_KEY,
} from '@/lib/preview-data'

interface PreviewContextValue {
  isPreviewMode: boolean
  togglePreviewMode: () => void
  setPreviewMode: (enabled: boolean) => void
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined)
const DEFAULT_PREVIEW_CONTEXT: PreviewContextValue = {
  isPreviewMode: false,
  togglePreviewMode: () => {},
  setPreviewMode: () => {},
}

export function PreviewProvider({ children }: PropsWithChildren) {
  const [storedPreviewMode, setStoredPreviewMode] = useState(() => isPreviewModeEnabled())
  const isPreviewModeForced = isScreenRecordingModeEnabled()
  const isPreviewMode = isPreviewModeForced || storedPreviewMode

  useEffect(() => {
    const syncFromStorage = () => {
      setStoredPreviewMode(isPreviewModeEnabled())
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
    if (isPreviewModeForced) return

    setStoredPreviewMode(enabled)
    setPreviewModeEnabled(enabled)
  }, [isPreviewModeForced])

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
  const context = use(PreviewContext)
  if (context === undefined) {
    return DEFAULT_PREVIEW_CONTEXT
  }
  return context
}
