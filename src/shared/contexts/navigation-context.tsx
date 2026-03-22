'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useClientContext } from '@/shared/contexts/client-context'
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'
import { isFeatureEnabled } from '@/lib/features'

type NavigationState = {
  projectId: string | null
  projectName: string | null
  lastViewedTask: string | null
  lastViewedChannel: string | null
}

type NavigationContextValue = {
  navigationState: NavigationState
  setProjectContext: (projectId: string | null, projectName: string | null) => void
  setLastViewedTask: (taskId: string | null) => void
  setLastViewedChannel: (channelId: string | null) => void
  clearNavigationState: () => void
  restoreNavigationState: () => void
}

const STORAGE_PREFIX = 'cohorts.nav'
const STORAGE_KEYS = {
  PROJECT_ID: `${STORAGE_PREFIX}.projectId`,
  PROJECT_NAME: `${STORAGE_PREFIX}.projectName`,
  LAST_VIEWED_TASK: `${STORAGE_PREFIX}.lastViewedTask`,
  LAST_VIEWED_CHANNEL: `${STORAGE_PREFIX}.lastViewedChannel`,
} as const

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

function getClientStorageKey(baseKey: string, clientId: string | null): string {
  return clientId ? `${baseKey}.${clientId}` : baseKey
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { selectedClientId } = useClientContext()
  const searchParams = useUrlSearchParams()
  const mountedRef = useRef(false)

  const [navigationState, setNavigationState] = useState<NavigationState>({
    projectId: null,
    projectName: null,
    lastViewedTask: null,
    lastViewedChannel: null,
  })

  // Cleanup old localStorage data to prevent hitting limits
  const cleanupOldData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      const navKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX))
      
      // Keep only the most recent 10 clients' navigation data
      const clientKeys = new Set<string>()
      navKeys.forEach(key => {
        const parts = key.split('.')
        const clientId = parts[2]
        if (parts.length >= 3 && clientId) {
          clientKeys.add(clientId)
        }
      })

      if (clientKeys.size > 10) {
        const clientArray = Array.from(clientKeys)
        const toRemove = clientArray.slice(0, clientArray.length - 10)
        
        toRemove.forEach(clientId => {
          Object.values(STORAGE_KEYS).forEach(baseKey => {
            const key = getClientStorageKey(baseKey, clientId)
            localStorage.removeItem(key)
          })
        })
      }
    } catch (error) {
      console.warn('[NavigationProvider] Failed to cleanup old data:', error)
    }
  }, [])

  const loadNavigationState = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      cleanupOldData()

      const projectId = localStorage.getItem(
        getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId)
      )
      const projectName = localStorage.getItem(
        getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId)
      )
      const lastViewedTask = localStorage.getItem(
        getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId)
      )
      const lastViewedChannel = localStorage.getItem(
        getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId)
      )

      setNavigationState({
        projectId,
        projectName,
        lastViewedTask,
        lastViewedChannel,
      })
    } catch (error) {
      console.warn('[NavigationProvider] Failed to load navigation state:', error)
    }
  }, [selectedClientId, cleanupOldData])

  const saveNavigationState = useCallback((state: NavigationState) => {
    if (!isFeatureEnabled('NAVIGATION_PERSISTENCE') || typeof window === 'undefined') {
      return
    }

    const projectId = state.projectId ?? ''
    const projectName = state.projectName ?? ''
    const lastViewedTask = state.lastViewedTask ?? ''
    const lastViewedChannel = state.lastViewedChannel ?? ''

    try {
      localStorage.setItem(
        getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId),
        projectId
      )
      localStorage.setItem(
        getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId),
        projectName
      )
      localStorage.setItem(
        getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId),
        lastViewedTask
      )
      localStorage.setItem(
        getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId),
        lastViewedChannel
      )
    } catch (error) {
      console.warn('[NavigationProvider] Failed to save navigation state:', error)
    }
  }, [selectedClientId])

  // Load navigation state from localStorage on mount and client change
  useEffect(() => {
    if (!isFeatureEnabled('NAVIGATION_PERSISTENCE')) {
      return undefined
    }

    if (mountedRef.current && typeof window !== 'undefined') {
      const frameId = window.requestAnimationFrame(() => {
        loadNavigationState()
      })

      return () => {
        window.cancelAnimationFrame(frameId)
      }
    }

    return undefined
  }, [loadNavigationState])

  // Initialize on first mount
  useEffect(() => {
    if (mountedRef.current) {
      return undefined
    }
    mountedRef.current = true

    if (typeof window === 'undefined') {
      return undefined
    }

    if (isFeatureEnabled('NAVIGATION_PERSISTENCE')) {
      const frameId = window.requestAnimationFrame(() => {
        loadNavigationState()
      })

      return () => {
        window.cancelAnimationFrame(frameId)
      }
    }

    return undefined
  }, [loadNavigationState])

  // Sync with URL parameters (URL takes precedence over localStorage)
  useEffect(() => {
    if (!isFeatureEnabled('NAVIGATION_PERSISTENCE')) {
      return undefined
    }

    const urlProjectId = searchParams.get('projectId')
    const urlProjectName = searchParams.get('projectName')

    if (urlProjectId || urlProjectName) {
      const frameId = requestAnimationFrame(() => {
        setNavigationState((prev) => ({
          ...prev,
          projectId: urlProjectId,
          projectName: urlProjectName,
        }))
      })

      return () => {
        cancelAnimationFrame(frameId)
      }
    }

    return undefined
  }, [searchParams])


  const setProjectContext = useCallback((projectId: string | null, projectName: string | null) => {
    const newState = {
      ...navigationState,
      projectId,
      projectName,
    }
    setNavigationState(newState)
    saveNavigationState(newState)
  }, [navigationState, saveNavigationState])

  const setLastViewedTask = useCallback((taskId: string | null) => {
    const newState = {
      ...navigationState,
      lastViewedTask: taskId,
    }
    setNavigationState(newState)
    saveNavigationState(newState)
  }, [navigationState, saveNavigationState])

  const setLastViewedChannel = useCallback((channelId: string | null) => {
    const newState = {
      ...navigationState,
      lastViewedChannel: channelId,
    }
    setNavigationState(newState)
    saveNavigationState(newState)
  }, [navigationState, saveNavigationState])

  const clearNavigationState = useCallback(() => {
    const newState = {
      projectId: null,
      projectName: null,
      lastViewedTask: null,
      lastViewedChannel: null,
    }
    setNavigationState(newState)
    
    if (isFeatureEnabled('NAVIGATION_PERSISTENCE') && typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach(baseKey => {
          const key = getClientStorageKey(baseKey, selectedClientId)
          localStorage.removeItem(key)
        })
      } catch (error) {
        console.warn('[NavigationProvider] Failed to clear navigation state:', error)
      }
    }
  }, [selectedClientId])

  const restoreNavigationState = useCallback(() => {
    loadNavigationState()
  }, [loadNavigationState])

  const value = useMemo<NavigationContextValue>(() => ({
    navigationState,
    setProjectContext,
    setLastViewedTask,
    setLastViewedChannel,
    clearNavigationState,
    restoreNavigationState,
  }), [navigationState, setProjectContext, setLastViewedTask, setLastViewedChannel, clearNavigationState, restoreNavigationState])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider')
  }
  return context
}
