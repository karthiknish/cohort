'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useQuery, useMutation } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { clientsApi } from '@/lib/convex-api'
import { getPreviewClients, isPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY } from '@/lib/preview-data'
import { getWorkspaceId } from '@/lib/utils'

type ClientContextValue = {
  workspaceId: string | null
  clients: ClientRecord[]
  selectedClientId: string | null
  selectedClient: ClientRecord | null
  loading: boolean
  error: string | null
  refreshClients: () => Promise<ClientRecord[]>
  retryClients: () => void
  selectClient: (clientId: string | null) => void
  createClient: (input: { name: string; accountManager: string; teamMembers: ClientTeamMember[] }) => Promise<ClientRecord>
  removeClient: (clientId: string) => Promise<void>
}

const STORAGE_KEY_SELECTED = 'cohorts.dashboard.selectedClient'

const ClientContext = createContext<ClientContextValue | undefined>(undefined)

type ConvexClientRow = {
  legacyId: string
  workspaceId?: string | null
  name: string
  accountManager?: string | null
  teamMembers?: unknown
  createdAtMs?: number | null
  updatedAtMs?: number | null
}

function isConvexClientRow(value: unknown): value is ConvexClientRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { legacyId?: unknown }).legacyId === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  )
}

// Helper function to map convex rows to ClientRecord
function mapClients(rows: unknown[]): ClientRecord[] {
  const list = rows.filter(isConvexClientRow).map((row) => ({
    id: row.legacyId,
    workspaceId: typeof row.workspaceId === 'string' ? row.workspaceId : null,
    name: row.name,
    accountManager: typeof row.accountManager === 'string' ? row.accountManager : '',
    teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
    createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
    updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
  }))

  list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

// Helper to extract rows from convex result
function extractRows(convexClients: unknown): unknown[] {
  if (Array.isArray(convexClients)) return convexClients
  if (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray(convexClients.items)) {
    return convexClients.items
  }
  return []
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isSyncing } = useAuth()

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const [previewEnabled, setPreviewEnabled] = useState(false)
  const selectionBeforePreviewRef = useRef<string | null>(null)

  // Use utility to get workspaceId - handles empty string and fallback to user.id
  const workspaceId = getWorkspaceId(user)

  // Don't query until auth is fully loaded and synced
  const canQuery = !authLoading && !isSyncing && !!workspaceId

  // Admin users can see all clients across workspaces
  const isAdmin = user?.role === 'admin'

  // Skip client query if user doesn't have agencyId (not synced to Convex yet)
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

  const storageKey = useMemo(() => {
    return workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED
  }, [workspaceId])

  // Ref to track selectedClientId without triggering effect re-runs
  const selectedClientIdRef = useRef(selectedClientId)

  useEffect(() => {
    selectedClientIdRef.current = selectedClientId
  }, [selectedClientId])

  // Single effect for preview mode setup and teardown
  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncPreview = () => {
      const isEnabled = isPreviewModeEnabled()
      setPreviewEnabled(isEnabled)

      if (isEnabled) {
        // Entering preview mode - use ref to get current value without deps
        selectionBeforePreviewRef.current = selectedClientIdRef.current
        const previewClients = getPreviewClients()
        setSelectedClientId(previewClients[0]?.id ?? null)
        setError(null)
        setLoading(false)
      } else if (selectionBeforePreviewRef.current !== null) {
        // Leaving preview mode - restore previous selection
        setSelectedClientId(selectionBeforePreviewRef.current)
        selectionBeforePreviewRef.current = null
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === PREVIEW_MODE_STORAGE_KEY) {
        syncPreview()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(PREVIEW_MODE_EVENT, syncPreview as EventListener)
    syncPreview()

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PREVIEW_MODE_EVENT, syncPreview as EventListener)
    }
  }, []) // Empty deps - uses ref to access selectedClientId

  // Single effect for data loading, error handling, and client selection
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      // Handle preview mode
      if (previewEnabled) {
        setLoading(false)
        setError(null)
        return
      }

      // Wait for auth
      if (authLoading || isSyncing) {
        return
      }

      // No workspace
      if (!workspaceId) {
        setSelectedClientId(null)
        setLoading(false)
        setError(null)
        return
      }

      // Loading state
      if (convexClients === undefined) {
        setLoading(true)
        return
      }

      setLoading(false)

      const rows = extractRows(convexClients)

      if (rows.length === 0) {
        setError('No clients found for this workspace')
        return
      }

      setError(null)

      // Sync selected client - use ref to avoid infinite loop
      const clients = mapClients(rows)
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
      const targetId = stored && clients.some((c) => c.id === stored) ? stored : clients[0]?.id ?? null

      if (targetId !== selectedClientIdRef.current) {
        setSelectedClientId(targetId)
      }
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [previewEnabled, authLoading, isSyncing, workspaceId, convexClients, storageKey, retryKey])

  // Effect for persisting selection to localStorage
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
    } else {
      window.localStorage.removeItem(storageKey)
    }
  }, [previewEnabled, selectedClientId, storageKey, workspaceId])

  // Debug logging in development
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

  // Memoized clients list
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
    setError(null)
    setRetryKey((current) => current + 1)
  }, [])

  const selectClient = useCallback((clientId: string | null) => {
    setSelectedClientId(clientId)
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

    const teamMembers = input.teamMembers
      .map((member) => ({
        name: member.name.trim(),
        role: typeof member.role === 'string' ? member.role.trim() : '',
      }))
      .filter((member) => member.name.length > 0)

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

    setSelectedClientId(created.id)
    return created
  }, [workspaceId, convexCreateClient, user?.id])

  const removeClient = useCallback(async (clientId: string) => {
    if (!workspaceId) {
      throw new Error('Workspace is required to remove a client')
    }

    const targetClient = clientsRef.current.find((client) => client.id === clientId)
    const targetWorkspaceId = targetClient?.workspaceId ?? workspaceId

    await convexSoftDeleteClient({
      workspaceId: targetWorkspaceId,
      legacyId: clientId,
      deletedAtMs: Date.now(),
    })

    setSelectedClientId((current) => (current === clientId ? null : current))
  }, [workspaceId, convexSoftDeleteClient])

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null
    return resolvedClients.find((client) => client.id === selectedClientId) ?? null
  }, [resolvedClients, selectedClientId])

  const value = useMemo<ClientContextValue>(() => ({
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

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}
