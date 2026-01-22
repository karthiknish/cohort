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

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isSyncing } = useAuth()

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const [previewEnabled, setPreviewEnabled] = useState(() => isPreviewModeEnabled())
  const selectionBeforePreviewRef = useRef<string | null>(null)
  const lastWorkspaceIdRef = useRef<string | null>(null)

  // Use utility to get workspaceId - handles empty string and fallback to user.id
  const workspaceId = getWorkspaceId(user)

  // Don't query until auth is fully loaded and synced
  const canQuery = !authLoading && !isSyncing && !!workspaceId

  // Admin users can see all clients across workspaces
  const isAdmin = user?.role === 'admin'

  const convexClients = useQuery(
    clientsApi.list,
    previewEnabled || !canQuery
      ? 'skip'
      : {
        workspaceId,
        limit: 100,
        includeAllWorkspaces: isAdmin,
      }
  )

  const convexCreateClient = useMutation(clientsApi.create)
  const convexSoftDeleteClient = useMutation(clientsApi.softDelete)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || window.location.search.includes('debug=true')) {
      console.log('[ClientProvider] State Update:', {
        authLoading,
        isSyncing,
        workspaceId,
        canQuery,
        hasConvexResult: convexClients !== undefined,
        convexResultLength: Array.isArray(convexClients) ? convexClients.length : (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray((convexClients as any).items)) ? (convexClients as any).items.length : 'N/A',
        rawConvexResult: convexClients
      })
    }
  }, [authLoading, isSyncing, workspaceId, canQuery, convexClients])

  const storageKey = useMemo(() => {
    return workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED
  }, [workspaceId])

  useEffect(() => {
    if (previewEnabled) {
      return
    }

    if (!workspaceId) {
      if (selectedClientId !== null) {
        setSelectedClientId(null)
      }
      lastWorkspaceIdRef.current = null
      return
    }

    if (lastWorkspaceIdRef.current && lastWorkspaceIdRef.current !== workspaceId) {
      if (selectedClientId !== null) {
        setSelectedClientId(null)
      }
    }
    lastWorkspaceIdRef.current = workspaceId

    if (typeof window === 'undefined') {
      return
    }

    if (selectedClientId) {
      return
    }

    try {
      const storedSelected = window.localStorage.getItem(storageKey)
      if (storedSelected && storedSelected !== selectedClientId) {
        setSelectedClientId(storedSelected)
      }
    } catch (storageError) {
      console.warn('[ClientProvider] failed to hydrate stored client selection', storageError)
    }
  }, [previewEnabled, selectedClientId, storageKey, workspaceId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncPreview = () => {
      setPreviewEnabled(isPreviewModeEnabled())
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === PREVIEW_MODE_STORAGE_KEY) {
        syncPreview()
      }
    }

    const onPreviewEvent = () => {
      syncPreview()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener)
    syncPreview()

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!previewEnabled) {
      return
    }

    // Entering preview mode: snapshot selection.
    if (selectionBeforePreviewRef.current === null) {
      selectionBeforePreviewRef.current = selectedClientId
    }

    const previewClients = getPreviewClients()
    const previewSelection = previewClients[0]?.id ?? null
    if (previewSelection !== selectedClientId) {
      setSelectedClientId(previewSelection)
    }
    setError(null)
    setLoading(false)
  }, [previewEnabled, selectedClientId])

  const clientsResolved = previewEnabled || (canQuery && convexClients !== undefined)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // In preview mode, don't persist selection (avoid overwriting the real workspace selection).
    if (previewEnabled) {
      return
    }

    if (!workspaceId) {
      return
    }

    if (!selectedClientId) {
      if (clientsResolved) {
        window.localStorage.removeItem(storageKey)
      }
      return
    }

    try {
      window.localStorage.setItem(storageKey, selectedClientId)
    } catch (storageError) {
      console.warn('[ClientProvider] failed to persist client selection', storageError)
    }
  }, [clientsResolved, previewEnabled, selectedClientId, storageKey, workspaceId])

  const fetchClients = useCallback(async (): Promise<ClientRecord[]> => {
    if (previewEnabled) {
      return getPreviewClients()
    }

    if (!workspaceId) {
      return []
    }

    if (convexClients === undefined) {
      return []
    }

    const rows = Array.isArray(convexClients) ? convexClients : (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray((convexClients as any).items)) ? (convexClients as any).items : []
    const list: ClientRecord[] = rows.map((row: any) => ({
      id: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
      billingEmail: row.billingEmail ?? null,
      stripeCustomerId: row.stripeCustomerId ?? null,
      lastInvoiceStatus: row.lastInvoiceStatus ?? null,
      lastInvoiceAmount: row.lastInvoiceAmount ?? null,
      lastInvoiceCurrency: row.lastInvoiceCurrency ?? null,
      lastInvoiceIssuedAt: row.lastInvoiceIssuedAtMs ? new Date(row.lastInvoiceIssuedAtMs).toISOString() : null,
      lastInvoiceNumber: row.lastInvoiceNumber ?? null,
      lastInvoiceUrl: row.lastInvoiceUrl ?? null,
      lastInvoicePaidAt: row.lastInvoicePaidAtMs ? new Date(row.lastInvoicePaidAtMs).toISOString() : null,
      createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
    }))

    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [previewEnabled, workspaceId, convexClients])

  useEffect(() => {
    if (previewEnabled) {
      setSelectedClientId((current) => current ?? getPreviewClients()[0]?.id ?? null)
      setError(null)
      setLoading(false)
      return
    }

    if (authLoading || isSyncing) {
      return
    }

    if (!workspaceId) {
      setSelectedClientId(null)
      setError(null)
      setLoading(false)
      return
    }

    if (convexClients === undefined) {
      setLoading(true)
      return
    }

    setLoading(false)

    const rows = Array.isArray(convexClients)
      ? convexClients
      : convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray((convexClients as any).items)
        ? (convexClients as any).items
        : []

    if (rows.length === 0) {
      setError('No clients found for this workspace')
      return
    }

    setError(null)
  }, [authLoading, isSyncing, previewEnabled, workspaceId, convexClients, retryKey])

  useEffect(() => {
    if (previewEnabled) {
      return
    }

    // Leaving preview mode: restore prior selection if possible and refresh from API.
    if (selectionBeforePreviewRef.current !== null) {
      const previousSelection = selectionBeforePreviewRef.current
      selectionBeforePreviewRef.current = null
      setSelectedClientId(previousSelection)
    }

    if (!authLoading && !isSyncing && user?.id) {
      void fetchClients()
    }
  }, [previewEnabled, authLoading, isSyncing, user?.id, fetchClients])

  const resolvedClients = useMemo<ClientRecord[]>(() => {
    if (previewEnabled) {
      return getPreviewClients()
    }

    if (!workspaceId || convexClients === undefined) {
      return []
    }

    const rows = Array.isArray(convexClients) ? convexClients : (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray((convexClients as any).items)) ? (convexClients as any).items : []
    const list: ClientRecord[] = rows.map((row: any) => ({
      id: row.legacyId,
      name: row.name,
      accountManager: row.accountManager,
      teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
      billingEmail: row.billingEmail ?? null,
      stripeCustomerId: row.stripeCustomerId ?? null,
      lastInvoiceStatus: row.lastInvoiceStatus ?? null,
      lastInvoiceAmount: row.lastInvoiceAmount ?? null,
      lastInvoiceCurrency: row.lastInvoiceCurrency ?? null,
      lastInvoiceIssuedAt: row.lastInvoiceIssuedAtMs ? new Date(row.lastInvoiceIssuedAtMs).toISOString() : null,
      lastInvoiceNumber: row.lastInvoiceNumber ?? null,
      lastInvoiceUrl: row.lastInvoiceUrl ?? null,
      lastInvoicePaidAt: row.lastInvoicePaidAtMs ? new Date(row.lastInvoicePaidAtMs).toISOString() : null,
      createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
    }))

    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [previewEnabled, workspaceId, convexClients])

  useEffect(() => {
    if (resolvedClients.length === 0) {
      if (clientsResolved && selectedClientId !== null) {
        setSelectedClientId(null)
      }
      return
    }

    if (selectedClientId && resolvedClients.some((client) => client.id === selectedClientId)) {
      return
    }

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
    const nextId = stored && resolvedClients.some((client) => client.id === stored)
      ? stored
      : resolvedClients[0]?.id ?? null

    if (nextId !== selectedClientId) {
      setSelectedClientId(nextId)
    }
  }, [clientsResolved, resolvedClients, selectedClientId, storageKey])

  const refreshClients = useCallback(async () => {
    return await fetchClients()
  }, [fetchClients])

  const retryClients = useCallback(() => {
    setError(null)
    setRetryKey((current) => current + 1)
  }, [])

  const selectClient = useCallback((clientId: string | null) => {
    if (!clientId) {
      setSelectedClientId(null)
      return
    }

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
      billingEmail: null,
      createdBy: user?.id ?? null,
    })

    const created: ClientRecord = {
      id: res.legacyId,
      name,
      accountManager,
      teamMembers,
      billingEmail: null,
      stripeCustomerId: null,
      lastInvoiceStatus: null,
      lastInvoiceAmount: null,
      lastInvoiceCurrency: null,
      lastInvoiceIssuedAt: null,
      lastInvoiceNumber: null,
      lastInvoiceUrl: null,
      lastInvoicePaidAt: null,
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

    await convexSoftDeleteClient({
      workspaceId,
      legacyId: clientId,
      deletedAtMs: Date.now(),
    })

    setSelectedClientId((current) => (current === clientId ? null : current))
  }, [workspaceId, convexSoftDeleteClient])

  const selectedClient = useMemo(() => {
    if (!selectedClientId) {
      return null
    }
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
