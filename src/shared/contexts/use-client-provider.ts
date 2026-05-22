'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useSyncExternalStore } from 'react'
import { useQuery, useMutation } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { clientsApi } from '@/lib/convex-api'
import { isNotFoundAppError } from '@/lib/convex-errors'
import { getPreviewClients, isPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY } from '@/lib/preview-data'
import { getWorkspaceId } from '@/lib/utils'

import {
  STORAGE_KEY_SELECTED,
  clientProviderReducer,
  createInitialClientProviderState,
  extractRows,
  mapClients,
  resolveSelectedClientId,
  type ClientContextValue,
} from './client-context-types'

export function useClientProvider(): ClientContextValue {
  const { user, loading: authLoading, isSyncing, authPhase } = useAuth()

  const [{ selectedClientId, loading, error }, dispatch] = useReducer(
    clientProviderReducer,
    undefined,
    createInitialClientProviderState,
  )
  const hasInitializedRef = useRef(false)
  const previewEnabled = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => undefined
      }

      const handlePreviewChange = () => {
        onStoreChange()
      }

      window.addEventListener('storage', handlePreviewChange)
      window.addEventListener(PREVIEW_MODE_EVENT, handlePreviewChange)
      return () => {
        window.removeEventListener('storage', handlePreviewChange)
        window.removeEventListener(PREVIEW_MODE_EVENT, handlePreviewChange)
      }
    },
    () => isPreviewModeEnabled(),
    () => false,
  )
  const selectionBeforePreviewRef = useRef<string | null>(null)
  const previousPreviewEnabledRef = useRef(previewEnabled)

  const workspaceId = getWorkspaceId(user)
  const canQuery = authPhase === 'ready_active' && !authLoading && !isSyncing && !!workspaceId
  const isAdmin = user?.role === 'admin'
  const shouldSkipClients = previewEnabled || !canQuery || !user?.agencyId

  const convexClientsArgs = useMemo(() => (shouldSkipClients
      ? 'skip'
      : {
        workspaceId,
        limit: 100,
        includeAllWorkspaces: isAdmin,
      }), [shouldSkipClients, workspaceId, isAdmin])

  const convexClients = useQuery(clientsApi.list, convexClientsArgs)
  const convexCreateClient = useMutation(clientsApi.create)
  const convexSoftDeleteClient = useMutation(clientsApi.softDelete)

  const storageKey = workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED
  const selectedClientIdRef = useRef(selectedClientId)

  useEffect(() => {
    selectedClientIdRef.current = selectedClientId
  }, [selectedClientId])

  if (previousPreviewEnabledRef.current !== previewEnabled) {
    previousPreviewEnabledRef.current = previewEnabled

    if (previewEnabled) {
      selectionBeforePreviewRef.current = selectedClientIdRef.current
      const previewClients = getPreviewClients()
      dispatch({
        type: 'syncState',
        selectedClientId: previewClients[0]?.id ?? null,
        loading: false,
        error: null,
      })
    } else if (selectionBeforePreviewRef.current !== null) {
      dispatch({ type: 'setSelectedClientId', selectedClientId: selectionBeforePreviewRef.current })
      selectionBeforePreviewRef.current = null
    }
  }

  const applyClientSelectionSync = useCallback(() => {
    if (previewEnabled) {
      dispatch({
        type: 'syncState',
        selectedClientId: selectedClientIdRef.current,
        loading: false,
        error: null,
      })
      return
    }

    if (authLoading || isSyncing) {
      return
    }

    if (!workspaceId) {
      dispatch({
        type: 'syncState',
        selectedClientId: null,
        loading: false,
        error: null,
      })
      return
    }

    if (convexClients === undefined) {
      dispatch({
        type: 'syncState',
        selectedClientId: selectedClientIdRef.current,
        loading: true,
        error: null,
      })
      return
    }

    const rows = extractRows(convexClients)

    if (rows.length === 0) {
      dispatch({
        type: 'syncState',
        selectedClientId: null,
        loading: false,
        error: 'No clients found for this workspace',
      })
      return
    }

    const clients = mapClients(rows)
    const currentSelection = selectedClientIdRef.current
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
    const targetId = resolveSelectedClientId(clients, currentSelection, stored)

    hasInitializedRef.current = true

    dispatch({
      type: 'syncState',
      selectedClientId: targetId,
      loading: false,
      error: null,
    })
  }, [previewEnabled, authLoading, isSyncing, workspaceId, convexClients, storageKey])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      applyClientSelectionSync()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [applyClientSelectionSync])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (previewEnabled) return
    if (!workspaceId) return

    if (selectedClientId) {
      try {
        window.localStorage.setItem(storageKey, selectedClientId)
      } catch (e) {
        console.warn('[ClientProvider] failed to persist client selection', e)
      }
    } else if (hasInitializedRef.current) {
      window.localStorage.removeItem(storageKey)
    }
  }, [previewEnabled, selectedClientId, storageKey, workspaceId])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) return

    console.log('[ClientProvider] State:', {
      authLoading,
      isSyncing,
      workspaceId,
      canQuery,
      hasConvexResult: convexClients !== undefined,
    })
  }, [authLoading, isSyncing, workspaceId, canQuery, convexClients])

  const resolvedClients = useMemo<ClientRecord[]>(() => {
    if (previewEnabled) {
      return getPreviewClients()
    }

    if (!workspaceId || convexClients === undefined) {
      return []
    }

    return mapClients(extractRows(convexClients))
  }, [previewEnabled, workspaceId, convexClients])

  const clientsRef = useRef(resolvedClients)

  useEffect(() => {
    clientsRef.current = resolvedClients
  }, [resolvedClients])

  const refreshClients = useCallback(async () => {
    return clientsRef.current
  }, [])

  const retryClients = useCallback(() => {
    dispatch({ type: 'setError', error: null })
    requestAnimationFrame(() => {
      applyClientSelectionSync()
    })
  }, [applyClientSelectionSync])

  const selectClient = useCallback((clientId: string | null) => {
    dispatch({ type: 'setSelectedClientId', selectedClientId: clientId })
  }, [])

  const createClient = useCallback(async (
    input: { name: string; accountManager: string; teamMembers: ClientTeamMember[] }
  ): Promise<ClientRecord> => {
    if (!workspaceId) {
      throw new Error('Workspace is required to create a client')
    }

    const name = input.name.trim()
    const accountManager = input.accountManager.trim()
    if (!name || !accountManager) {
      throw new Error('Client name and account manager are required')
    }

    const teamMembers = input.teamMembers.flatMap((member) => {
      const normalized = {
        name: member.name.trim(),
        role: typeof member.role === 'string' ? member.role.trim() : '',
      }
      return normalized.name.length > 0 ? [normalized] : []
    })

    if (!teamMembers.some((member) => member.name.toLowerCase() === accountManager.toLowerCase())) {
      teamMembers.unshift({ name: accountManager, role: 'Account Manager' })
    }

    const res = await convexCreateClient({
      workspaceId,
      name,
      accountManager,
      teamMembers,
      createdBy: user?.id ?? null,
    })

    const created: ClientRecord = {
      id: res.legacyId,
      workspaceId,
      name,
      accountManager,
      teamMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch({ type: 'setSelectedClientId', selectedClientId: created.id })
    return created
  }, [workspaceId, convexCreateClient, user?.id])

  const removeClient = useCallback(async (clientId: string) => {
    if (!workspaceId) {
      throw new Error('Workspace is required to remove a client')
    }

    const targetClient = clientsRef.current.find((client) => client.id === clientId)
    const targetWorkspaceId = targetClient?.workspaceId ?? workspaceId
    const remainingClients = clientsRef.current.filter((client) => client.id !== clientId)
    const fallbackClientId = resolveSelectedClientId(remainingClients, selectedClientIdRef.current, null)

    try {
      await convexSoftDeleteClient({
        workspaceId: targetWorkspaceId,
        legacyId: clientId,
        deletedAtMs: Date.now(),
      })
    } catch (error) {
      if (!isNotFoundAppError(error)) {
        throw error
      }
    }

    dispatch({
      type: 'setSelectedClientId',
      selectedClientId: selectedClientIdRef.current === clientId ? fallbackClientId : selectedClientIdRef.current,
    })
  }, [workspaceId, convexSoftDeleteClient])

  useEffect(() => {
    if (previewEnabled || loading) return
    if (!selectedClientId) return
    if (resolvedClients.some((client) => client.id === selectedClientId)) return

    const fallbackClientId = resolveSelectedClientId(resolvedClients, null, null)
    dispatch({ type: 'setSelectedClientId', selectedClientId: fallbackClientId })
  }, [loading, previewEnabled, resolvedClients, selectedClientId])

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null
    return resolvedClients.find((client) => client.id === selectedClientId) ?? null
  }, [resolvedClients, selectedClientId])

  return useMemo<ClientContextValue>(() => ({
    workspaceId,
    clients: resolvedClients,
    selectedClientId,
    selectedClient,
    loading,
    error,
    refreshClients,
    retryClients,
    selectClient,
    createClient,
    removeClient,
  }), [workspaceId, resolvedClients, selectedClientId, selectedClient, loading, error, refreshClients, retryClients, selectClient, createClient, removeClient])
}
