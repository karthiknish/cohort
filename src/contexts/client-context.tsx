'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useQuery, useMutation } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { apiFetch } from '@/lib/api-client'
import { clientsApi } from '@/lib/convex-api'
import { getPreviewClients, isPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY } from '@/lib/preview-data'

type ClientContextValue = {
  workspaceId: string | null
  clients: ClientRecord[]
  selectedClientId: string | null
  selectedClient: ClientRecord | null
  loading: boolean
  error: string | null
  refreshClients: () => Promise<ClientRecord[]>
  selectClient: (clientId: string | null) => void
  createClient: (input: { name: string; accountManager: string; teamMembers: ClientTeamMember[] }) => Promise<ClientRecord>
  removeClient: (clientId: string) => Promise<void>
}

const STORAGE_KEY_SELECTED = 'cohorts.dashboard.selectedClient'

const ClientContext = createContext<ClientContextValue | undefined>(undefined)

function parseError(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(false)
  const [previewEnabled, setPreviewEnabled] = useState(() => isPreviewModeEnabled())
  const selectionBeforePreviewRef = useRef<string | null>(null)

  const workspaceId = user?.agencyId ?? null

  const convexClients = useQuery(
    clientsApi.list,
    previewEnabled || !workspaceId
      ? 'skip'
      : {
          workspaceId,
          limit: 100,
        }
  )

  const convexCreateClient = useMutation(clientsApi.create)
  const convexSoftDeleteClient = useMutation(clientsApi.softDelete)

  useEffect(() => {
    if (mountedRef.current) {
      return
    }
    mountedRef.current = true

    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedSelected = window.localStorage.getItem(STORAGE_KEY_SELECTED)
      if (storedSelected) {
        setSelectedClientId(storedSelected)
      }
    } catch (storageError) {
      console.warn('[ClientProvider] failed to hydrate stored client selection', storageError)
    }
  }, [])

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
    setSelectedClientId(previewClients[0]?.id ?? null)
    setError(null)
    setLoading(false)
  }, [previewEnabled, selectedClientId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // In preview mode, don't persist selection (avoid overwriting the real workspace selection).
    if (previewEnabled) {
      return
    }

    if (!selectedClientId) {
      window.localStorage.removeItem(STORAGE_KEY_SELECTED)
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY_SELECTED, selectedClientId)
    } catch (storageError) {
      console.warn('[ClientProvider] failed to persist client selection', storageError)
    }
  }, [selectedClientId, previewEnabled])

  const fetchClients = useCallback(async (): Promise<ClientRecord[]> => {
    if (previewEnabled) {
      return getPreviewClients()
    }

    if (!workspaceId) {
      return []
    }

    const rows = convexClients ?? []
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

    if (authLoading) {
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
    setError(null)
  }, [authLoading, previewEnabled, workspaceId, convexClients])

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

    if (!authLoading && user?.id) {
      void fetchClients()
    }
  }, [previewEnabled, authLoading, user?.id, fetchClients])

  const resolvedClients = useMemo<ClientRecord[]>(() => {
    if (previewEnabled) {
      return getPreviewClients()
    }

    if (!workspaceId) {
      return []
    }

    const rows = convexClients ?? []
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
      if (selectedClientId !== null) {
        setSelectedClientId(null)
      }
      return
    }

    setSelectedClientId((current) => {
      if (current && resolvedClients.some((client) => client.id === current)) {
        return current
      }

      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_SELECTED) : null
      if (stored && resolvedClients.some((client) => client.id === stored)) {
        if (stored === current) return current
        return stored
      }

      return resolvedClients[0]?.id ?? null
    })
  }, [resolvedClients, selectedClientId])

  const refreshClients = useCallback(async () => {
    return await fetchClients()
  }, [fetchClients])

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
    selectClient,
    createClient,
    removeClient,
  }), [workspaceId, resolvedClients, selectedClientId, selectedClient, loading, error, refreshClients, selectClient, createClient, removeClient])

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}
