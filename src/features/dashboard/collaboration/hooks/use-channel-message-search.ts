'use client'

import type { ConvexReactClient } from 'convex/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import type { CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import { filterChannelMessagesForSearch, parseChannelMessageSearchQuery } from './channel-message-search'
import { mapCollaborationMessageRow } from './message-mappers'
import type { MessagesByChannelState } from './types'

type UseChannelMessageSearchOptions = {
  convex: ConvexReactClient
  workspaceId: string | null
  selectedChannel: Channel | null
  channelMessages: CollaborationMessage[]
  messagesByChannel: MessagesByChannelState
  messageSearchQuery: string
  isPreviewMode: boolean
}

export function useChannelMessageSearch({
  convex,
  workspaceId,
  selectedChannel,
  channelMessages,
  messagesByChannel,
  messageSearchQuery,
  isPreviewMode,
}: UseChannelMessageSearchOptions) {
  const [search, setSearch] = useState({
    results: [] as CollaborationMessage[],
    highlights: [] as string[],
    searching: false,
    error: null as string | null,
  })
  const { results: searchResults, highlights: searchHighlights, searching: searchingMessages, error: searchError } = search
  const [searchRetryNonce, setSearchRetryNonce] = useState(0)

  const retrySearch = useCallback(() => {
    setSearchRetryNonce((n) => n + 1)
  }, [])

  const normalizedMessageSearch = messageSearchQuery.trim()
  const parsedSearch = useMemo(
    () => parseChannelMessageSearchQuery(normalizedMessageSearch),
    [normalizedMessageSearch],
  )

  const resolvedSyncSearch = useMemo(() => {
    if (!selectedChannel || !normalizedMessageSearch) {
      return { results: [] as CollaborationMessage[], highlights: [] as string[], searching: false, error: null as string | null }
    }

    if (isPreviewMode) {
      return {
        results: filterChannelMessagesForSearch(
          messagesByChannel[selectedChannel.id] ?? [],
          parsedSearch,
        ),
        highlights: parsedSearch.highlights,
        searching: false,
        error: null,
      }
    }

    return null
  }, [isPreviewMode, messagesByChannel, normalizedMessageSearch, parsedSearch, selectedChannel])

  useEffect(() => {
    if (resolvedSyncSearch === null) return
    setSearch(resolvedSyncSearch)
  }, [resolvedSyncSearch])

  const fetchChannelMessageSearch = useCallback(
    async (isCancelled: () => boolean) => {
      if (!selectedChannel || !normalizedMessageSearch) return

      const startMs = parsedSearch.start ? Date.parse(parsedSearch.start) : NaN
      const endMs = parsedSearch.end ? Date.parse(parsedSearch.end) : NaN

      setSearch((prev) => ({ ...prev, searching: true, error: null }))

      if (isCancelled()) return

      try {
        const payload = await convex.query(collaborationApi.searchChannel, {
          workspaceId: String(workspaceId),
          channelId: selectedChannel.isCustom ? selectedChannel.id : null,
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          q: parsedSearch.q || null,
          sender: parsedSearch.sender ?? null,
          attachment: parsedSearch.attachment ?? null,
          mention: parsedSearch.mention ?? null,
          startMs: Number.isFinite(startMs) ? startMs : null,
          endMs: Number.isFinite(endMs) ? endMs : null,
          limit: 200,
        })

        if (isCancelled()) return

        const resolvedPayload = (payload ?? {}) as { rows?: unknown[]; highlights?: unknown[] }
        const rows = Array.isArray(resolvedPayload.rows) ? resolvedPayload.rows : []
        const highlights = Array.isArray(resolvedPayload.highlights)
          ? resolvedPayload.highlights.filter((entry): entry is string => typeof entry === 'string')
          : parsedSearch.highlights

        const mapped = rows
          .flatMap((row) => {
            const message = mapCollaborationMessageRow(row, { fallbackChannelType: selectedChannel.type })
            return message ? [message] : []
          })
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

        setSearch({
          results: mapped,
          highlights,
          searching: false,
          error: null,
        })
      } catch (error: unknown) {
        if (isCancelled()) return
        logError(error, 'useCollaborationData:searchChannel')
        setSearch({
          results: [],
          highlights: parsedSearch.highlights,
          searching: false,
          error: asErrorMessage(error),
        })
      }
    },
    [convex, normalizedMessageSearch, parsedSearch, selectedChannel, workspaceId],
  )

  useEffect(() => {
    if (resolvedSyncSearch !== null) return

    let cancelled = false
    void fetchChannelMessageSearch(() => cancelled)

    return () => {
      cancelled = true
    }
  }, [fetchChannelMessageSearch, resolvedSyncSearch, searchRetryNonce])

  const visibleMessages = useMemo(() => {
    if (normalizedMessageSearch) {
      if (searchResults.length > 0) return searchResults
      if (searchingMessages) return searchResults
      if (searchError) return []
      return searchResults
    }

    return channelMessages
  }, [channelMessages, normalizedMessageSearch, searchError, searchResults, searchingMessages])

  return {
    normalizedMessageSearch,
    visibleMessages,
    searchingMessages,
    searchHighlights,
    searchError,
    retrySearch,
  }
}