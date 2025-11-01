import { useCallback, useEffect, useMemo, useState } from 'react'

export type SchedulerEvent = {
  id: string
  createdAt: string | null
  source: string
  operation: string | null
  processedJobs: number
  successfulJobs: number
  failedJobs: number
  hadQueuedJobs: boolean
  inspectedQueuedJobs: number | null
  durationMs: number | null
  severity: string
  errors: string[]
  notes: string | null
  failureThreshold: number | null
  providerFailureThresholds: Array<{
    providerId: string
    failedJobs: number
    threshold: number | null
  }>
}

type FetchState = 'idle' | 'loading' | 'refreshing' | 'error'

export function useSchedulerEvents() {
  const [events, setEvents] = useState<SchedulerEvent[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isEndReached, setIsEndReached] = useState(false)
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ severity?: string; source?: string }>({})

  const buildQuery = useCallback(
    (nextCursor?: string | null) => {
      const params = new URLSearchParams()
      if (nextCursor) {
        params.set('cursor', nextCursor)
      }
      if (filters.severity) {
        params.set('severity', filters.severity)
      }
      if (filters.source) {
        params.set('source', filters.source)
      }
      params.set('limit', '25')
      return `/api/admin/scheduler/events?${params.toString()}`
    },
    [filters]
  )

  const fetchEvents = useCallback(
    async (append = false) => {
      if (fetchState === 'loading' || fetchState === 'refreshing') {
        return
      }

      setFetchState(append ? 'refreshing' : 'loading')
      setErrorMessage(null)

      try {
        const response = await fetch(buildQuery(append ? cursor : null), {
          cache: 'no-store',
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          const message = typeof payload.error === 'string' ? payload.error : 'Failed to load scheduler events'
          throw new Error(message)
        }

        const payload = (await response.json()) as { events: SchedulerEvent[]; nextCursor: string | null }

        setEvents((prev) => (append ? [...prev, ...payload.events] : payload.events))
        setCursor(payload.nextCursor)
        setIsEndReached(!payload.nextCursor)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load scheduler events'
        setErrorMessage(message)
        setEvents((prev) => (append ? prev : []))
      } finally {
        setFetchState('idle')
      }
    },
    [buildQuery, cursor, fetchState]
  )

  useEffect(() => {
    void fetchEvents(false)
  }, [fetchEvents, filters])

  const hasEvents = events.length > 0
  const isLoading = fetchState === 'loading'
  const isRefreshing = fetchState === 'refreshing'

  const uniqueSeverities = useMemo(() => {
    const set = new Set<string>()
    events.forEach((event) => {
      if (event.severity) {
        set.add(event.severity)
      }
    })
    return Array.from(set)
  }, [events])

  const uniqueSources = useMemo(() => {
    const set = new Set<string>()
    events.forEach((event) => {
      if (event.source) {
        set.add(event.source)
      }
    })
    return Array.from(set)
  }, [events])

  const updateFilters = useCallback((next: { severity?: string; source?: string }) => {
    setFilters(next)
    setCursor(null)
    setIsEndReached(false)
  }, [])

  return {
    events,
    hasEvents,
    isLoading,
    isRefreshing,
    isEndReached,
    errorMessage,
    fetchMore: () => fetchEvents(true),
    refresh: () => fetchEvents(false),
    cursor,
    filters,
    updateFilters,
    uniqueSeverities,
    uniqueSources,
  }
}

export type SchedulerEventsState = ReturnType<typeof useSchedulerEvents>
