'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

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
    if (typeof window === 'undefined') {
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
    if (!user?.id) {
      setClients([])
      setSelectedClientId(null)
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load clients'
        throw new Error(message)
      }

      const payload = (await response.json()) as { clients?: ClientRecord[] }
      const list = Array.isArray(payload.clients) ? payload.clients : []
      const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
      setClients(sorted)
      return sorted
    } catch (fetchError: unknown) {
      const message = parseError(fetchError, 'Unable to load clients')
      setError(message)
      setClients([])
      return []
    } finally {
      setLoading(false)
    }
  }, [getIdToken, user?.id])

  useEffect(() => {
    if (authLoading) {
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
  }, [authLoading, user?.id, fetchClients])

  useEffect(() => {
    if (clients.length === 0) {
      if (selectedClientId !== null) {
        setSelectedClientId(null)
      }
      return
    }

    setSelectedClientId((current) => {
      if (current && clients.some((client) => client.id === current)) {
        return current
      }

      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_SELECTED) : null
      if (stored && clients.some((client) => client.id === stored)) {
        return stored
      }

      return clients[0]?.id ?? null
    })
  }, [clients, selectedClientId])

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

    const token = await getIdToken()
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, accountManager, teamMembers }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message = typeof payload?.error === 'string' ? payload.error : 'Unable to create client'
      throw new Error(message)
    }

    const payload = (await response.json()) as { client: ClientRecord }
    const created = payload.client

    setClients((prev) => {
      const next = [...prev, created]
      return next.sort((a, b) => a.name.localeCompare(b.name))
    })
    setSelectedClientId(created.id)

    return created
  }, [getIdToken, user?.id])

  const removeClient = useCallback(async (clientId: string) => {
    if (!user?.id) {
      throw new Error('You must be signed in to remove a client')
    }

    const token = await getIdToken()
    const response = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message = typeof payload?.error === 'string' ? payload.error : 'Unable to remove client'
      throw new Error(message)
    }

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
  }, [getIdToken, user?.id])

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
