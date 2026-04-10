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
  const [searchResults, setSearchResults] = useState<CollaborationMessage[]>([])
  const [searchHighlights, setSearchHighlights] = useState<string[]>([])
  const [searchingMessages, setSearchingMessages] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchRetryNonce, setSearchRetryNonce] = useState(0)

  const retrySearch = useCallback(() => {
    setSearchRetryNonce((n) => n + 1)
  }, [])

  const normalizedMessageSearch = messageSearchQuery.trim()
  const parsedSearch = useMemo(
    () => parseChannelMessageSearchQuery(normalizedMessageSearch),
    [normalizedMessageSearch],
  )

  useEffect(() => {
    if (!selectedChannel || !normalizedMessageSearch) {
      setSearchResults([])
      setSearchHighlights([])
      setSearchError(null)
      setSearchingMessages(false)
      return
    }

    setSearchingMessages(true)
    setSearchError(null)

    if (isPreviewMode) {
      const results = filterChannelMessagesForSearch(
        messagesByChannel[selectedChannel.id] ?? [],
        parsedSearch,
      )

      setSearchResults(results)
      setSearchHighlights(parsedSearch.highlights)
      setSearchError(null)
      setSearchingMessages(false)
      return
    }

    const startMs = parsedSearch.start ? Date.parse(parsedSearch.start) : NaN
    const endMs = parsedSearch.end ? Date.parse(parsedSearch.end) : NaN

    void convex
      .query(collaborationApi.searchChannel, {
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
      .then((payload) => {
        const resolvedPayload = (payload ?? {}) as { rows?: unknown[]; highlights?: unknown[] }
        const rows = Array.isArray(resolvedPayload.rows) ? resolvedPayload.rows : []
        const highlights = Array.isArray(resolvedPayload.highlights)
          ? resolvedPayload.highlights.filter((entry): entry is string => typeof entry === 'string')
          : parsedSearch.highlights

        const mapped = rows
          .map((row) => mapCollaborationMessageRow(row, { fallbackChannelType: selectedChannel.type }))
          .filter((message): message is CollaborationMessage => Boolean(message))
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

        setSearchResults(mapped)
        setSearchHighlights(highlights)
        setSearchError(null)
      })
      .catch((error: unknown) => {
        logError(error, 'useCollaborationData:searchChannel')
        setSearchError(asErrorMessage(error))
        setSearchResults([])
      })
      .finally(() => {
        setSearchingMessages(false)
      })
  }, [convex, isPreviewMode, messagesByChannel, normalizedMessageSearch, parsedSearch, searchRetryNonce, selectedChannel, workspaceId])

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