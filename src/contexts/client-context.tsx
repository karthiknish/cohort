'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { apiFetch } from '@/lib/api-client'
import { getPreviewClients, isPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY } from '@/lib/preview-data'

type ClientContextValue = {
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
  const { user, loading: authLoading, getIdToken } = useAuth()

  const [clients, setClients] = useState<ClientRecord[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(false)
  const [previewEnabled, setPreviewEnabled] = useState(() => isPreviewModeEnabled())
  const selectionBeforePreviewRef = useRef<string | null>(null)

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

    // Entering preview mode: snapshot selection and inject demo clients.
    if (selectionBeforePreviewRef.current === null) {
      selectionBeforePreviewRef.current = selectedClientId
    }

    const previewClients = getPreviewClients()
    setClients(previewClients)
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
  }, [selectedClientId])

  const fetchClients = useCallback(async (): Promise<ClientRecord[]> => {
    if (previewEnabled) {
      const previewClients = getPreviewClients()
      setClients(previewClients)
      setSelectedClientId(previewClients[0]?.id ?? null)
      setError(null)
      setLoading(false)
      return previewClients
    }

    if (!user?.id) {
      setClients([])
      setSelectedClientId(null)
      return []
    }

    setLoading(true)
    setError(null)

    try {
      // For the dashboard, we start with the first page. 
      // We can implement recursive loading or a "load more" if needed later.
      const data = await apiFetch<{ clients: ClientRecord[]; nextCursor: string | null }>('/api/clients', {
        cache: 'no-store',
      })

      const list = Array.isArray(data.clients) ? data.clients : []
      setClients(list)
      return list
    } catch (fetchError: unknown) {
      const message = parseError(fetchError, 'Unable to load clients')
      setError(message)
      setClients([])
      return []
    } finally {
      setLoading(false)
    }
  }, [previewEnabled, user?.id])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (previewEnabled) {
      void fetchClients()
      return
    }

    if (!user?.id) {
      setClients([])
      setSelectedClientId(null)
      setError(null)
      setLoading(false)
      return
    }

    void fetchClients()
  }, [authLoading, user?.id, fetchClients, previewEnabled])

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
  }, [previewEnabled])

  useEffect(() => {
    if (clients.length === 0) {
      if (selectedClientId !== null) {
        setSelectedClientId(null)
      }
      return
    }

    setSelectedClientId((current) => {
      // If we already have a valid selection from the current client list, stick with it
      if (current && clients.some((client) => client.id === current)) {
        return current
      }

      // Try to recover from local storage
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_SELECTED) : null
      if (stored && clients.some((client) => client.id === stored)) {
        // If the stored value matches what we already have (null -> null cases), don't trigger update
        if (stored === current) return current
        return stored
      }

      // Default to the first client
      const firstId = clients[0]?.id ?? null
      if (firstId === current) return current
      return firstId
    })
  }, [clients])

  const refreshClients = useCallback(async () => {
    return await fetchClients()
  }, [fetchClients])

  const selectClient = useCallback((clientId: string | null) => {
    if (!clientId) {
      setSelectedClientId(null)
      return
    }

    setSelectedClientId((current) => {
      if (current === clientId) {
        return current
      }

      const exists = clients.some((client) => client.id === clientId)
      return exists ? clientId : clients[0]?.id ?? null
    })
  }, [clients])

  const createClient = useCallback(async (
    input: { name: string; accountManager: string; teamMembers: ClientTeamMember[] }
  ): Promise<ClientRecord> => {
    if (!user?.id) {
      throw new Error('You must be signed in to create a client')
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

    const created = await apiFetch<ClientRecord>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name, accountManager, teamMembers }),
    })

    if (!created) {
      throw new Error('Failed to create client: no client returned')
    }

    setClients((prev) => {
      const next = [...prev, created]
      return next.sort((a, b) => a.name.localeCompare(b.name))
    })
    setSelectedClientId(created.id)

    return created
  }, [user?.id])

  const removeClient = useCallback(async (clientId: string) => {
    if (!user?.id) {
      throw new Error('You must be signed in to remove a client')
    }

    await apiFetch(`/api/clients/${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
    })

    setClients((prev) => {
      const next = prev.filter((client) => client.id !== clientId)
      setSelectedClientId((current) => {
        if (current !== clientId) {
          return current
        }
        return next[0]?.id ?? null
      })
      return next
    })
  }, [user?.id])

  const selectedClient = useMemo(() => {
    if (!selectedClientId) {
      return null
    }
    return clients.find((client) => client.id === selectedClientId) ?? null
  }, [clients, selectedClientId])

  const value = useMemo<ClientContextValue>(() => ({
    clients,
    selectedClientId,
    selectedClient,
    loading,
    error,
    refreshClients,
    selectClient,
    createClient,
    removeClient,
  }), [clients, selectedClientId, selectedClient, loading, error, refreshClients, selectClient, createClient, removeClient])

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}
