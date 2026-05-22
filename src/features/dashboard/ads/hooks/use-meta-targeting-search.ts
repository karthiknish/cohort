'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAction } from 'convex/react'

import { adsMetaToolsApi } from '@/lib/convex-api'

export type MetaTargetingSearchResult = {
  id: string
  name: string
  type: string
  audienceSize?: number
  path?: string[]
}

type UseMetaTargetingSearchOptions = {
  workspaceId: string | null
  clientId?: string | null
  mode: 'interests' | 'geolocations'
  enabled?: boolean
  debounceMs?: number
}

export function useMetaTargetingSearch({
  workspaceId,
  clientId,
  mode,
  enabled = true,
  debounceMs = 300,
}: UseMetaTargetingSearchOptions) {
  const searchInterests = useAction(adsMetaToolsApi.searchTargetingInterests)
  const searchGeolocations = useAction(adsMetaToolsApi.searchTargetingGeolocations)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MetaTargetingSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim()
      if (!enabled || !workspaceId || trimmed.length < 2) {
        setResults([])
        setError(null)
        setLoading(false)
        return
      }

      const requestId = ++requestIdRef.current
      setLoading(true)
      setError(null)

      try {
        const rows =
          mode === 'interests'
            ? await searchInterests({
                workspaceId,
                clientId: clientId ?? null,
                query: trimmed,
                limit: 20,
              })
            : await searchGeolocations({
                workspaceId,
                clientId: clientId ?? null,
                query: trimmed,
                limit: 20,
              })

        if (requestId !== requestIdRef.current) return
        setResults(Array.isArray(rows) ? rows : [])
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setResults([])
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [clientId, enabled, mode, searchGeolocations, searchInterests, workspaceId],
  )

  useEffect(() => {
    if (!enabled || !workspaceId) {
      setResults([])
      return
    }

    const handle = window.setTimeout(() => {
      void runSearch(query)
    }, debounceMs)

    return () => window.clearTimeout(handle)
  }, [debounceMs, enabled, query, runSearch, workspaceId])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clear: useCallback(() => {
      setQuery('')
      setResults([])
      setError(null)
    }, []),
  }
}
