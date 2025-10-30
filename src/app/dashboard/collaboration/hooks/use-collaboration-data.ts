'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'

import {
  CHANNEL_TYPE_COLORS,
  aggregateTeamMembers,
  collectSharedFiles,
  formatRelativeTime,
  formatTimestamp,
  getInitials,
  normalizeTeamMembers,
} from '../utils'
import type { Channel } from '../types'

export type ChannelSummary = {
  lastMessage: string
  lastTimestamp: string | null
}

export function useCollaborationData() {
  const { user, getIdToken } = useAuth()
  const { clients, selectedClient, loading: clientsLoading } = useClientContext()
  const { toast } = useToast()

  const fallbackRole = 'Account Owner'
  const fallbackDisplayName = useMemo(() => {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.trim()
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email.trim()
    }
    return 'You'
  }, [user?.email, user?.name])

  const aggregatedTeamMembers = useMemo(
    () => aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole),
    [clients, fallbackDisplayName]
  )

  const channels = useMemo<Channel[]>(() => {
    const teamChannel: Channel = {
      id: 'team-agency',
      name: 'Agency Team',
      type: 'team',
      clientId: null,
      teamMembers: aggregatedTeamMembers,
    }

    const clientChannels = clients.map<Channel>((client) => ({
      id: `client-${client.id}`,
      name: client.name,
      type: 'client',
      clientId: client.id,
      teamMembers: normalizeTeamMembers(client.teamMembers),
    }))

    return [teamChannel, ...clientChannels]
  }, [aggregatedTeamMembers, clients])

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CollaborationMessage[]>>({})
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [senderSelection, setSenderSelection] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const pendingSessionPromiseRef = useRef<Promise<string> | null>(null)

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  )

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) {
      return channels
    }
    const query = searchQuery.toLowerCase().trim()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, searchQuery])

  const channelSummaries = useMemo<Map<string, ChannelSummary>>(() => {
    const result = new Map<string, ChannelSummary>()
    Object.entries(messagesByChannel).forEach(([channelId, list]) => {
      if (list && list.length > 0) {
        const last = list[list.length - 1]
        result.set(channelId, {
          lastMessage: last.content,
          lastTimestamp: last.createdAt,
        })
      }
    })
    return result
  }, [messagesByChannel])

  const channelMessages = selectedChannel ? messagesByChannel[selectedChannel.id] ?? [] : []
  const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false
  const isBootstrapping = clientsLoading && channels.length === 0

  useEffect(() => {
    sessionTokenRef.current = sessionToken
  }, [sessionToken])

  useEffect(() => {
    if (!user) {
      pendingSessionPromiseRef.current = null
      sessionTokenRef.current = null
      setSessionToken(null)
      return
    }

    const cookieToken = readSessionTokenCookie()
    if (cookieToken) {
      sessionTokenRef.current = cookieToken
      setSessionToken(cookieToken)
    } else {
      sessionTokenRef.current = null
      setSessionToken(null)
    }
  }, [user])

  const channelParticipants = useMemo(() => {
    if (!selectedChannel) return []

    const map = new Map<string, ClientTeamMember>()
    selectedChannel.teamMembers.forEach((member) => {
      const name = member.name.trim()
      if (!name) return
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          name,
          role: member.role?.trim() || 'Contributor',
        })
      }
    })

    if (fallbackDisplayName) {
      const key = fallbackDisplayName.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: fallbackDisplayName, role: fallbackRole })
      }
    }

    return Array.from(map.values())
  }, [fallbackDisplayName, fallbackRole, selectedChannel])

  const sharedFiles = useMemo(() => {
    const attachmentGroups = channelMessages
      .filter((message) => Array.isArray(message.attachments) && message.attachments.length > 0)
      .map((message) => message.attachments ?? [])
    return collectSharedFiles(attachmentGroups)
  }, [channelMessages])

  const totalChannels = channels.length
  const totalParticipants = aggregatedTeamMembers.length

  const ensureSessionToken = useCallback(async (): Promise<string> => {
    if (!user) {
      throw new Error('You must be signed in to access collaboration data.')
    }

    if (sessionTokenRef.current) {
      return sessionTokenRef.current
    }

    const cookieToken = readSessionTokenCookie()
    if (cookieToken) {
      sessionTokenRef.current = cookieToken
      setSessionToken(cookieToken)
      return cookieToken
    }

    if (pendingSessionPromiseRef.current) {
      return pendingSessionPromiseRef.current
    }

    const promise = getIdToken()
      .then((token) => {
        sessionTokenRef.current = token
        setSessionToken(token)
        pendingSessionPromiseRef.current = null
        return token
      })
      .catch((error) => {
        pendingSessionPromiseRef.current = null
        throw error
      })

    pendingSessionPromiseRef.current = promise
    return promise
  }, [getIdToken, user])

  const fetchMessages = useCallback(
    async (channel: Channel) => {
      setMessagesError(null)
      setLoadingChannelId(channel.id)

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams()
        params.set('channelType', channel.type)
        if (channel.type === 'client' && channel.clientId) {
          params.set('clientId', channel.clientId)
        }

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load messages'
          throw new Error(message)
        }

        const payload = (await response.json()) as { messages?: CollaborationMessage[] }
        const list = Array.isArray(payload.messages) ? payload.messages : []

        setMessagesByChannel((prev) => ({
          ...prev,
          [channel.id]: list,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load messages'
        setMessagesError(message)
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setLoadingChannelId(null)
      }
    },
    [ensureSessionToken, toast]
  )

  const handleSendMessage = useCallback(async () => {
    if (!selectedChannel) return
    const content = messageInput.trim()
    if (!content) return

    const senderName = senderSelection.trim() || fallbackDisplayName
    if (!senderName) {
      toast({
        title: 'Select a teammate',
        description: 'Choose who is speaking before sending a message.',
        variant: 'destructive',
      })
      return
    }

    const sender = channelParticipants.find((member) => member.name === senderName)
    const senderRole = sender?.role ?? null

    try {
      setSending(true)
      const token = await ensureSessionToken()
      const response = await fetch('/api/collaboration/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? selectedChannel.clientId : undefined,
          senderName,
          senderRole,
          content,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = typeof payload?.error === 'string' ? payload.error : 'Unable to send message'
        throw new Error(message)
      }

      const payload = (await response.json()) as { message?: CollaborationMessage }
      const created = payload.message
      if (!created) {
        throw new Error('Invalid response from server')
      }

      const messageRecord: CollaborationMessage = {
        ...created,
        senderRole: created.senderRole ?? senderRole,
      }

      setMessagesByChannel((prev) => {
        const previous = prev[selectedChannel.id] ?? []
        return {
          ...prev,
          [selectedChannel.id]: [...previous, messageRecord],
        }
      })
      setMessageInput('')

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message'
      toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }, [channelParticipants, ensureSessionToken, fallbackDisplayName, messageInput, selectedChannel, senderSelection, toast])

  useEffect(() => {
    if (channels.length === 0) {
      setSelectedChannelId(null)
      return
    }

    setSelectedChannelId((current) => {
      if (current && channels.some((channel) => channel.id === current)) {
        return current
      }

      if (selectedClient) {
        const clientChannel = channels.find(
          (channel) => channel.type === 'client' && channel.clientId === selectedClient.id,
        )
        if (clientChannel) {
          return clientChannel.id
        }
      }

      return channels[0]?.id ?? null
    })
  }, [channels, selectedClient])

  useEffect(() => {
    if (!selectedChannel) return
    if (messagesByChannel[selectedChannel.id]) return
    void fetchMessages(selectedChannel)
  }, [fetchMessages, messagesByChannel, selectedChannel])

  useEffect(() => {
    if (!selectedChannel) {
      setSenderSelection('')
      return
    }

    if (!senderSelection || !channelParticipants.some((member) => member.name === senderSelection)) {
      const fallback = channelParticipants[0]?.name ?? fallbackDisplayName
      setSenderSelection(fallback)
    }
  }, [channelParticipants, fallbackDisplayName, selectedChannel, senderSelection])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length, selectedChannel?.id])

  const isSendDisabled = sending || !selectedChannel || messageInput.trim().length === 0

  return {
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    channelSummaries,
    selectedChannel,
    selectChannel: setSelectedChannelId,
    channelMessages,
    isCurrentChannelLoading,
    isBootstrapping,
    messagesError,
    totalChannels,
    totalParticipants,
    channelParticipants,
    sharedFiles,
    senderSelection,
    setSenderSelection,
    messageInput,
    setMessageInput,
    handleSendMessage,
    sending,
    isSendDisabled,
    messagesEndRef,
  }
}

function readSessionTokenCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('cohorts_token='))

  if (!match) {
    return null
  }

  const value = match.split('=')[1]
  if (!value) {
    return null
  }

  try {
    const decoded = decodeURIComponent(value)
    return decoded.length > 0 ? decoded : null
  } catch (error) {
    console.warn('Failed to decode session token cookie', error)
    return null
  }
}
