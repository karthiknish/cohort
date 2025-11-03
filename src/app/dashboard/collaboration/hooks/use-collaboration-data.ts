'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Timestamp,
  deleteField,
  doc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientTeamMember } from '@/types/clients'
import type {
  CollaborationAttachment,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'
import type { ProjectRecord } from '@/types/projects'
import { db, storage } from '@/lib/firebase'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'

import {
  aggregateTeamMembers,
  collectSharedFiles,
  formatRelativeTime,
  formatTimestamp,
  getInitials,
  normalizeTeamMembers,
} from '../utils'
import type { Channel } from '../types'
import { extractMentionsFromContent } from '../utils/mentions'

export type ChannelSummary = {
  lastMessage: string
  lastTimestamp: string | null
}

export type PendingAttachment = {
  id: string
  file: File
  name: string
  sizeLabel: string
  mimeType: string
}

const MAX_ATTACHMENTS = 5
const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024
const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'txt',
  'zip',
  'md',
]
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/zip',
])

const TYPING_TIMEOUT_MS = 8_000
const TYPING_UPDATE_INTERVAL_MS = 2_500
const THREAD_PAGE_SIZE = 50

export function useCollaborationData() {
  const { user, getIdToken } = useAuth()
  const { clients, selectedClient, loading: clientsLoading } = useClientContext()
  const { toast } = useToast()

  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

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
      projectId: null,
      teamMembers: aggregatedTeamMembers,
    }

    const clientChannels = clients.map<Channel>((client) => ({
      id: `client-${client.id}`,
      name: client.name,
      type: 'client',
      clientId: client.id,
      projectId: null,
      teamMembers: normalizeTeamMembers(client.teamMembers),
    }))

    const projectChannels = projects.map<Channel>((project) => {
      const relatedClient = clients.find((client) => client.id === project.clientId)
      return {
        id: `project-${project.id}`,
        name: project.name,
        type: 'project',
        clientId: project.clientId,
        projectId: project.id,
        teamMembers: relatedClient ? normalizeTeamMembers(relatedClient.teamMembers) : aggregatedTeamMembers,
      }
    })

    return [teamChannel, ...clientChannels, ...projectChannels]
  }, [aggregatedTeamMembers, clients, projects])

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CollaborationMessage[]>>({})
  const [nextCursorByChannel, setNextCursorByChannel] = useState<Record<string, string | null>>({})
  const [messageUpdatingId, setMessageUpdatingId] = useState<string | null>(null)
  const [messageDeletingId, setMessageDeletingId] = useState<string | null>(null)
  const [loadingMoreChannelId, setLoadingMoreChannelId] = useState<string | null>(null)
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInputState] = useState('')
  const [senderSelection, setSenderSelection] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [typingParticipants, setTypingParticipants] = useState<{ name: string; role?: string | null }[]>([])
  const [reactionUpdatingByMessage, setReactionUpdatingByMessage] = useState<Record<string, string | null>>({})
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [threadMessagesByRootId, setThreadMessagesByRootId] = useState<Record<string, CollaborationMessage[]>>({})
  const [threadNextCursorByRootId, setThreadNextCursorByRootId] = useState<Record<string, string | null>>({})
  const [threadLoadingByRootId, setThreadLoadingByRootId] = useState<Record<string, boolean>>({})
  const [threadErrorsByRootId, setThreadErrorsByRootId] = useState<Record<string, string | null>>({})

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const pendingSessionPromiseRef = useRef<Promise<string> | null>(null)
  const channelUnsubscribeRef = useRef<(() => void) | null>(null)
  const composerFocusedRef = useRef(false)
  const isTypingRef = useRef(false)
  const lastTypingUpdateRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  const normalizedMessageSearch = messageSearchQuery.trim().toLowerCase()
  const visibleMessages = useMemo(() => {
    if (!normalizedMessageSearch) {
      return channelMessages
    }

    return channelMessages.filter((message) => {
      const haystacks: string[] = []
      if (message.content) {
        haystacks.push(message.content)
      }
      if (message.senderName) {
        haystacks.push(message.senderName)
      }
      if (message.senderRole) {
        haystacks.push(message.senderRole)
      }
      if (Array.isArray(message.attachments)) {
        haystacks.push(...message.attachments.map((attachment) => attachment.name))
      }
      if (Array.isArray(message.mentions)) {
        haystacks.push(...message.mentions.map((mention) => mention.name))
      }
      return haystacks.some((value) => value.toLowerCase().includes(normalizedMessageSearch))
    })
  }, [channelMessages, normalizedMessageSearch])
  const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false
  const loadingMore = selectedChannel ? loadingMoreChannelId === selectedChannel.id : false
  const canLoadMore = selectedChannel ? Boolean(nextCursorByChannel[selectedChannel.id]) : false
  const isBootstrapping = (clientsLoading || projectsLoading) && channels.length === 0

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

  const resolveSenderDetails = useCallback(() => {
    const resolvedName = senderSelection.trim() || fallbackDisplayName
    const participant = channelParticipants.find((member) => member.name === resolvedName)
    return {
      senderName: resolvedName,
      senderRole: participant?.role ?? null,
    }
  }, [channelParticipants, fallbackDisplayName, senderSelection])

  const sharedFiles = useMemo(() => {
    const attachmentGroups = channelMessages
      .filter((message) => !message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0)
      .map((message) => message.attachments ?? [])
    return collectSharedFiles(attachmentGroups)
  }, [channelMessages])

  const totalChannels = channels.length
  const totalParticipants = aggregatedTeamMembers.length

  const sendTypingUpdate = useCallback(
    async (isTyping: boolean) => {
      if (!user?.id || !selectedChannel) {
        return
      }

      const { senderName, senderRole } = resolveSenderDetails()
      if (!senderName) {
        return
      }

      const typingDocRef = doc(db, 'users', user.id, 'collaborationTyping', selectedChannel.id)
      const now = Date.now()

      try {
        if (isTyping) {
          const payload = {
            channelType: selectedChannel.type,
            clientId: selectedChannel.clientId ?? null,
            projectId: selectedChannel.projectId ?? null,
            typers: {
              [user.id]: {
                name: senderName,
                role: senderRole,
                updatedAt: Timestamp.fromMillis(now),
                expiresAt: Timestamp.fromMillis(now + TYPING_TIMEOUT_MS),
              },
            },
          }
          await setDoc(typingDocRef, payload, { merge: true })
        } else {
          await setDoc(
            typingDocRef,
            {
              typers: {
                [user.id]: deleteField(),
              },
            },
            { merge: true }
          )
        }
      } catch (error) {
        console.warn('[collaboration] failed to update typing status', error)
      }
    },
    [resolveSenderDetails, selectedChannel, user?.id]
  )

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    if (!isTypingRef.current) {
      return
    }

    isTypingRef.current = false
    lastTypingUpdateRef.current = 0
    void sendTypingUpdate(false)
  }, [sendTypingUpdate])

  const notifyTyping = useCallback(() => {
    if (!composerFocusedRef.current || !selectedChannel) {
      return
    }

    const now = Date.now()
    if (!isTypingRef.current || now - lastTypingUpdateRef.current > TYPING_UPDATE_INTERVAL_MS) {
      isTypingRef.current = true
      lastTypingUpdateRef.current = now
      void sendTypingUpdate(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      lastTypingUpdateRef.current = 0
      void sendTypingUpdate(false)
    }, TYPING_TIMEOUT_MS)
  }, [selectedChannel, sendTypingUpdate])

  const handleComposerFocus = useCallback(() => {
    composerFocusedRef.current = true
  }, [])

  const handleComposerBlur = useCallback(() => {
    composerFocusedRef.current = false
    stopTyping()
  }, [stopTyping])

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

  const fetchProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([])
      return
    }

    setProjectsLoading(true)

    try {
      const token = await ensureSessionToken()
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to load projects')
      }

      const payload = (await response.json()) as { projects?: ProjectRecord[] }
      const projectList = Array.isArray(payload.projects) ? payload.projects : []
      setProjects(projectList)
    } catch (error) {
      console.error('[collaboration] Failed to load projects', error)
      setProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }, [ensureSessionToken, user?.id])

  useEffect(() => {
    if (!user?.id) {
      setProjects([])
      setProjectsLoading(false)
      return
    }

    void fetchProjects()
  }, [fetchProjects, user?.id])

  const mutateChannelMessages = useCallback(
    (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => {
      setMessagesByChannel((prev) => {
        const existing = prev[channelId]
        if (!existing) {
          return prev
        }
        const updated = updater(existing)
        if (updated === existing) {
          return prev
        }
        return {
          ...prev,
          [channelId]: updated,
        }
      })
    },
    []
  )

  const fetchThreadReplies = useCallback(
    async (
      threadRootId: string,
      options: { cursor?: string | null; replace?: boolean } = {}
    ): Promise<void> => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      const cursor = options.cursor ?? null
      const shouldReplace = options.replace ?? !cursor

      setThreadErrorsByRootId((prev) => ({
        ...prev,
        [trimmedId]: null,
      }))
      setThreadLoadingByRootId((prev) => ({
        ...prev,
        [trimmedId]: true,
      }))

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams()
        params.set('threadRootId', trimmedId)
        params.set('pageSize', THREAD_PAGE_SIZE.toString())
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: CollaborationMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load thread replies'
          throw new Error(message)
        }

        const replies = Array.isArray(payload.messages) ? payload.messages : []
        const normalizedReplies = replies.map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

        setThreadMessagesByRootId((prev) => {
          const existing = prev[trimmedId] ?? []

          if (shouldReplace) {
            const sameLength = existing.length === normalizedReplies.length
            const sameOrder = sameLength
              ? existing.every((message, index) => message.id === normalizedReplies[index]?.id)
              : false

            if (sameOrder) {
              return prev
            }

            return {
              ...prev,
              [trimmedId]: normalizedReplies,
            }
          }

          if (normalizedReplies.length === 0) {
            return prev
          }

          const existingIds = new Set(existing.map((message) => message.id))
          const merged = normalizedReplies.filter((message) => !existingIds.has(message.id))
          if (merged.length === 0) {
            return prev
          }

          return {
            ...prev,
            [trimmedId]: [...existing, ...merged],
          }
        })

        setThreadNextCursorByRootId((prev) => {
          const nextCursor = payload.nextCursor ?? null
          if (prev[trimmedId] === nextCursor) {
            return prev
          }
          return {
            ...prev,
            [trimmedId]: nextCursor,
          }
        })

        setThreadErrorsByRootId((prev) => {
          if (prev[trimmedId] === null) {
            return prev
          }
          return {
            ...prev,
            [trimmedId]: null,
          }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load thread replies'
        setThreadErrorsByRootId((prev) => ({
          ...prev,
          [trimmedId]: message,
        }))
        toast({ title: 'Thread error', description: message, variant: 'destructive' })
      } finally {
        setThreadLoadingByRootId((prev) => ({
          ...prev,
          [trimmedId]: false,
        }))
      }
    },
    [ensureSessionToken, toast]
  )

  const loadThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      await fetchThreadReplies(trimmedId, { cursor: null, replace: true })
    },
    [fetchThreadReplies]
  )

  const loadMoreThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      const cursor = threadNextCursorByRootId[trimmedId]
      if (!cursor) {
        return
      }

      await fetchThreadReplies(trimmedId, { cursor, replace: false })
    },
    [fetchThreadReplies, threadNextCursorByRootId]
  )

  const clearThreadReplies = useCallback((threadRootId?: string) => {
    if (!threadRootId) {
      setThreadMessagesByRootId({})
      setThreadNextCursorByRootId({})
      setThreadLoadingByRootId({})
      setThreadErrorsByRootId({})
      return
    }

    const trimmedId = threadRootId.trim()
    if (!trimmedId) {
      return
    }

    setThreadMessagesByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadNextCursorByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadLoadingByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadErrorsByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })
  }, [])

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
        if (channel.type === 'project' && channel.projectId) {
          params.set('projectId', channel.projectId)
        }
        params.set('pageSize', '100')

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

        const payload = (await response.json()) as { messages?: CollaborationMessage[]; nextCursor?: string | null }
        const list = Array.isArray(payload.messages) ? payload.messages.slice().reverse() : []
        const normalized = list.map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

        setMessagesByChannel((prev) => ({
          ...prev,
          [channel.id]: normalized,
        }))
        setNextCursorByChannel((prev) => ({
          ...prev,
          [channel.id]: payload.nextCursor ?? null,
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

  useEffect(() => {
    channelUnsubscribeRef.current?.()
    channelUnsubscribeRef.current = null

    if (!selectedChannel || !user?.id) {
      return
    }

    const channelId = selectedChannel.id
    setLoadingChannelId(channelId)
    setMessagesError(null)

    const baseCollection = collection(db, 'users', user.id, 'collaborationMessages')
    const constraints: QueryConstraint[] = [where('channelType', '==', selectedChannel.type)]

    if (selectedChannel.type === 'client') {
      if (!selectedChannel.clientId) {
        setMessagesError('Client channel is missing an identifier')
        setLoadingChannelId((current) => (current === channelId ? null : current))
        return
      }
      constraints.push(where('clientId', '==', selectedChannel.clientId))
    }

    if (selectedChannel.type === 'project') {
      if (!selectedChannel.projectId) {
        setMessagesError('Project channel is missing an identifier')
        setLoadingChannelId((current) => (current === channelId ? null : current))
        return
      }
      constraints.push(where('projectId', '==', selectedChannel.projectId))
    }

    constraints.push(orderBy('createdAt', 'asc'), limit(200))
    const channelQuery = query(baseCollection, ...constraints)

    const unsubscribe = onSnapshot(
      channelQuery,
      (snapshot) => {
        const next = snapshot.docs.map((doc) => mapRealtimeMessage(doc))
        setMessagesByChannel((prev) => ({
          ...prev,
          [channelId]: next,
        }))
        setNextCursorByChannel((prev) => ({
          ...prev,
          [channelId]: prev[channelId] ?? null,
        }))
        setLoadingChannelId((current) => (current === channelId ? null : current))
        setMessagesError(null)
      },
      (error) => {
        console.error('[collaboration] realtime subscription error', error)
        const message = error instanceof Error ? error.message : 'Unable to subscribe to messages'
        setMessagesError(message)
        setLoadingChannelId((current) => (current === channelId ? null : current))
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
        void fetchMessages(selectedChannel)
      }
    )

    channelUnsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      if (channelUnsubscribeRef.current === unsubscribe) {
        channelUnsubscribeRef.current = null
      }
    }
  }, [fetchMessages, selectedChannel, toast, user?.id])

  useEffect(() => {
    composerFocusedRef.current = false
    stopTyping()
  }, [selectedChannel?.id, stopTyping])

  useEffect(() => {
    setReactionUpdatingByMessage({})
    setMessageSearchQuery('')
  }, [selectedChannel?.id])

  useEffect(() => {
    return () => {
      stopTyping()
    }
  }, [stopTyping])

  useEffect(() => {
    if (!user?.id || !selectedChannel) {
      setTypingParticipants([])
      return
    }

    const typingDocRef = doc(db, 'users', user.id, 'collaborationTyping', selectedChannel.id)

    const unsubscribe = onSnapshot(
      typingDocRef,
      (snapshot) => {
        const data = snapshot.data() as { typers?: Record<string, unknown> } | undefined
        const entries = data && typeof data.typers === 'object' && data.typers !== null ? data.typers : undefined

        if (!entries) {
          setTypingParticipants([])
          return
        }

        const now = Date.now()
        const list: { name: string; role?: string | null }[] = []

        Object.entries(entries).forEach(([actorId, rawEntry]) => {
          if (!rawEntry || typeof rawEntry !== 'object' || actorId === user.id) {
            return
          }

          const entry = rawEntry as Record<string, unknown>
          const name = typeof entry.name === 'string' ? entry.name : null
          if (!name || name.trim().length === 0) {
            return
          }

          const expires = entry.expiresAt
          let expiresAtMs: number | null = null

          if (expires instanceof Timestamp) {
            expiresAtMs = expires.toMillis()
          } else if (
            typeof expires === 'object' &&
            expires !== null &&
            typeof (expires as { toMillis?: () => number }).toMillis === 'function'
          ) {
            expiresAtMs = (expires as { toMillis: () => number }).toMillis()
          } else if (typeof expires === 'number') {
            expiresAtMs = expires
          }

          if (expiresAtMs && expiresAtMs < now) {
            return
          }

          const role = typeof entry.role === 'string' ? entry.role : null
          list.push({ name, role })
        })

        setTypingParticipants(list)
      },
      (error) => {
        console.warn('[collaboration] typing subscription error', error)
        setTypingParticipants([])
      }
    )

    return () => {
      unsubscribe()
    }
  }, [selectedChannel, user?.id])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }, [])

  const validateAttachment = useCallback((file: File): string | null => {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      return `File size exceeds ${formatFileSize(MAX_ATTACHMENT_SIZE)} limit`
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
      const extension = file.name.toLowerCase().split('.').pop()
      if (!extension || !ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
        return 'File type not supported. Use PNG, JPG, PDF, DOC, PPT, XLS, TXT, CSV, ZIP, or MD files.'
      }
    }

    return null
  }, [formatFileSize])

  const handleAddAttachments = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newAttachments: PendingAttachment[] = []
    const errors: string[] = []

    if (pendingAttachments.length + fileArray.length > MAX_ATTACHMENTS) {
      errors.push(`Maximum ${MAX_ATTACHMENTS} attachments allowed per message`)
    } else {
      fileArray.forEach((file) => {
        const error = validateAttachment(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          newAttachments.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            sizeLabel: formatFileSize(file.size),
            mimeType: file.type,
          })
        }
      })
    }

    if (errors.length > 0) {
      toast({
        title: 'File upload errors',
        description: errors.join('. '),
        variant: 'destructive',
      })
    }

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments])
    }
  }, [formatFileSize, pendingAttachments.length, toast, validateAttachment])

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  const uploadAttachments = useCallback(async (attachments: PendingAttachment[]): Promise<CollaborationAttachment[]> => {
    if (!user?.id || attachments.length === 0) {
      return []
    }

    const uploadPromises = attachments.map(async (attachment) => {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${attachment.file.name}`
      const storagePath = `users/${user.id}/collaboration/${fileName}`
      const fileRef = ref(storage, storagePath)

      await uploadBytes(fileRef, attachment.file, {
        contentType: attachment.mimeType,
      })

      const downloadUrl = await getDownloadURL(fileRef)

      return {
        name: attachment.name,
        url: downloadUrl,
        type: attachment.mimeType,
        size: attachment.sizeLabel,
      }
    })

    return Promise.all(uploadPromises)
  }, [user?.id])

  const handleSendMessage = useCallback(async () => {
    if (!selectedChannel) return
    const content = messageInput.trim()
    if (!content && pendingAttachments.length === 0) return

    const { senderName, senderRole } = resolveSenderDetails()
    if (!senderName) {
      toast({
        title: 'Select a teammate',
        description: 'Choose who is speaking before sending a message.',
        variant: 'destructive',
      })
      return
    }

    const mentionMatches = extractMentionsFromContent(content)
    const mentionMetadata = mentionMatches.map((mention) => {
      const participant = channelParticipants.find(
        (member) => member.name.toLowerCase() === mention.name.toLowerCase()
      )
      return {
        slug: mention.slug,
        name: participant?.name ?? mention.name,
        role: participant?.role ?? null,
      }
    })

    try {
      setSending(true)
      setUploading(pendingAttachments.length > 0)

      let attachments: CollaborationAttachment[] = []
      if (pendingAttachments.length > 0) {
        attachments = await uploadAttachments(pendingAttachments)
      }

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
          projectId: selectedChannel.type === 'project' ? selectedChannel.projectId : undefined,
          senderName,
          senderRole,
          content: content || '',
          attachments: attachments.length > 0 ? attachments : undefined,
          format: 'markdown',
          mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
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
        format: created.format ?? 'markdown',
        mentions: created.mentions ?? mentionMetadata,
        reactions: created.reactions ?? [],
      }

      setMessagesByChannel((prev) => {
        const previous = prev[selectedChannel.id] ?? []
        return {
          ...prev,
          [selectedChannel.id]: [...previous, messageRecord],
        }
      })
      setMessageInputState('')
      setPendingAttachments([])
      stopTyping()

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message'
      toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
    } finally {
      setSending(false)
      setUploading(false)
    }
  }, [channelParticipants, ensureSessionToken, messageInput, pendingAttachments, resolveSenderDetails, selectedChannel, stopTyping, toast, uploadAttachments])

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

  const handleEditMessage = useCallback(
    async (channelId: string, messageId: string, nextContent: string) => {
      const trimmedContent = nextContent.trim()
      if (!trimmedContent) {
        toast({ title: 'Message required', description: 'Enter a message before saving.', variant: 'destructive' })
        return
      }

      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try editing again.', variant: 'destructive' })
        return
      }

      setMessageUpdatingId(messageId)

      try {
        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata = mentionMatches.map((mention) => {
          const participant = channelParticipants.find(
            (member) => member.name.toLowerCase() === mention.name.toLowerCase()
          )
          return {
            slug: mention.slug,
            name: participant?.name ?? mention.name,
            role: participant?.role ?? null,
          }
        })

        const token = await ensureSessionToken()
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: trimmedContent,
            format: 'markdown',
            mentions: mentionMetadata.length > 0 ? mentionMetadata : [],
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to update message'
          throw new Error(message)
        }

        const updatedMessage = payload.message

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            ...updatedMessage,
            mentions: updatedMessage.mentions ?? mentionMetadata,
            format: updatedMessage.format ?? 'markdown',
          }
          return next
        })

        toast({ title: 'Message updated', description: 'Your edit is live for the team.' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setMessageUpdatingId((current) => (current === messageId ? null : current))
      }
    },
    [channelParticipants, channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const handleDeleteMessage = useCallback(
    async (channelId: string, messageId: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try deleting again.', variant: 'destructive' })
        return
      }

      setMessageDeletingId(messageId)

      try {
        const token = await ensureSessionToken()
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to delete message'
          throw new Error(message)
        }

        const deletedMessage = payload.message

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            ...deletedMessage,
            attachments: [],
          }
          return next
        })

        toast({ title: 'Message removed', description: 'The message is no longer visible to teammates.' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setMessageDeletingId((current) => (current === messageId ? null : current))
      }
    },
    [channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const handleToggleReaction = useCallback(
    async (channelId: string, messageId: string, emoji: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try reacting again.', variant: 'destructive' })
        return
      }

      if (!COLLABORATION_REACTION_SET.has(emoji)) {
        toast({ title: 'Reaction unavailable', description: 'That emoji is not supported for reactions.', variant: 'destructive' })
        return
      }

      setReactionUpdatingByMessage((prev) => ({
        ...prev,
        [messageId]: emoji,
      }))

      try {
        const token = await ensureSessionToken()
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { reactions?: CollaborationReaction[]; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to update reaction'
          throw new Error(message)
        }

        const reactions = Array.isArray(payload.reactions) ? payload.reactions : []

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            reactions,
          }
          return next
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update reaction'
        toast({ title: 'Reaction failed', description: message, variant: 'destructive' })
      } finally {
        setReactionUpdatingByMessage((prev) => {
          const next = { ...prev }
          if (next[messageId] === emoji) {
            delete next[messageId]
          }
          return next
        })
      }
    },
    [channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const hasMessageContent = messageInput.trim().length > 0
  const hasAttachmentsSelected = pendingAttachments.length > 0
  const isSendDisabled = sending || uploading || !selectedChannel || (!hasMessageContent && !hasAttachmentsSelected)

  const handleLoadMore = useCallback(
    async (channelId: string) => {
      const cursor = nextCursorByChannel[channelId]
      if (!cursor) {
        return
      }

      const channel = channels.find((entry) => entry.id === channelId)
      if (!channel) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try again.', variant: 'destructive' })
        return
      }

      setLoadingMoreChannelId(channelId)

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams()
        params.set('channelType', channel.type)
        if (channel.type === 'client' && channel.clientId) {
          params.set('clientId', channel.clientId)
        }
        if (channel.type === 'project' && channel.projectId) {
          params.set('projectId', channel.projectId)
        }
        params.set('pageSize', '100')
        params.set('cursor', cursor)

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: CollaborationMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load more messages'
          throw new Error(message)
        }

        const additional = Array.isArray(payload.messages) ? payload.messages.slice().reverse() : []
        const normalizedAdditional = additional.map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

        if (normalizedAdditional.length > 0) {
          mutateChannelMessages(channelId, (messages) => [...normalizedAdditional, ...messages])
        }

        setNextCursorByChannel((prev) => ({
          ...prev,
          [channelId]: payload.nextCursor ?? null,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load more messages'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setLoadingMoreChannelId((current) => (current === channelId ? null : current))
      }
    },
    [channels, ensureSessionToken, mutateChannelMessages, nextCursorByChannel, toast]
  )

  const setMessageInput = useCallback(
    (value: string) => {
      setMessageInputState(value)
      if (!composerFocusedRef.current) {
        return
      }

      const trimmed = value.trim()
      if (trimmed.length > 0) {
        notifyTyping()
      } else {
        stopTyping()
      }
    },
    [notifyTyping, stopTyping]
  )

  return {
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    channelSummaries,
    selectedChannel,
    selectChannel: setSelectedChannelId,
    channelMessages,
    visibleMessages,
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
    messageSearchQuery,
    setMessageSearchQuery,
    pendingAttachments,
    handleAddAttachments,
    handleRemoveAttachment,
    uploading,
    typingParticipants,
    handleComposerFocus,
    handleComposerBlur,
    handleSendMessage,
    sending,
    isSendDisabled,
    messagesEndRef,
    handleEditMessage,
    handleDeleteMessage,
    handleToggleReaction,
    messageUpdatingId,
    messageDeletingId,
    handleLoadMore,
    canLoadMore,
    loadingMore,
    currentUserId: user?.id ?? null,
    currentUserRole: user?.role ?? null,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    reactionPendingByMessage: reactionUpdatingByMessage,
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

function mapRealtimeMessage(doc: QueryDocumentSnapshot<DocumentData>): CollaborationMessage {
  const data = doc.data()
  const channelType = parseChannelType(data?.channelType)

  const attachments = Array.isArray(data?.attachments)
    ? data.attachments
        .map((entry: unknown) => sanitizeAttachment(entry))
        .filter((entry): entry is CollaborationAttachment => Boolean(entry))
    : undefined

  const mentions = Array.isArray(data?.mentions)
    ? data.mentions
        .map((entry: unknown) => sanitizeMention(entry))
        .filter((entry): entry is CollaborationMention => Boolean(entry))
    : undefined

  const reactions = Array.isArray(data?.reactions)
    ? data.reactions
        .map((entry: unknown) => sanitizeReaction(entry))
        .filter((entry): entry is CollaborationReaction => Boolean(entry))
    : []

  const deletedAt = convertToIso(data?.deletedAt)
  const deletedBy = typeof data?.deletedBy === 'string' ? data.deletedBy : null
  const isDeleted = Boolean(deletedAt) || data?.deleted === true
  const updatedAt = convertToIso(data?.updatedAt)
  const createdAt = convertToIso(data?.createdAt)
  const content = typeof data?.content === 'string' ? data.content : ''
  const resolvedContent = isDeleted ? '' : content
  const parentMessageId = typeof data?.parentMessageId === 'string' ? data.parentMessageId : null
  const threadRootId = typeof data?.threadRootId === 'string' ? data.threadRootId : null
  const threadReplyCountRaw = typeof data?.threadReplyCount === 'number' ? data.threadReplyCount : null
  const threadReplyCount = threadReplyCountRaw !== null ? Math.max(0, Math.trunc(threadReplyCountRaw)) : undefined
  const threadLastReplyAt = convertToIso(data?.threadLastReplyAt)

  return {
    id: doc.id,
    channelType,
    clientId: typeof data?.clientId === 'string' ? data.clientId : null,
    projectId: typeof data?.projectId === 'string' ? data.projectId : null,
    content: resolvedContent,
    senderId: typeof data?.senderId === 'string' ? data.senderId : null,
    senderName:
      typeof data?.senderName === 'string' && data.senderName.trim().length > 0 ? data.senderName : 'Teammate',
    senderRole: typeof data?.senderRole === 'string' ? data.senderRole : null,
    createdAt,
    updatedAt,
    isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
    deletedAt,
    deletedBy,
    isDeleted,
    attachments,
    format: parseMessageFormat(data?.format),
    mentions,
    reactions,
    parentMessageId,
    threadRootId,
    threadReplyCount,
    threadLastReplyAt,
  }
}

function sanitizeAttachment(input: unknown): CollaborationAttachment | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const name = typeof data.name === 'string' ? data.name : null
  const url = typeof data.url === 'string' ? data.url : null

  if (!name || !url) {
    return null
  }

  return {
    name,
    url,
    type: typeof data.type === 'string' ? data.type : null,
    size: typeof data.size === 'string' ? data.size : null,
  }
}

function sanitizeMention(input: unknown): CollaborationMention | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const slug = typeof data.slug === 'string' ? data.slug.trim() : null
  const name = typeof data.name === 'string' ? data.name.trim() : null

  if (!slug || !name) {
    return null
  }

  return {
    slug,
    name,
    role: typeof data.role === 'string' ? data.role : null,
  }
}

function sanitizeReaction(input: unknown): CollaborationReaction | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const emoji = typeof data.emoji === 'string' ? data.emoji : null

  if (!emoji || !COLLABORATION_REACTION_SET.has(emoji)) {
    return null
  }

  const userIdsRaw = Array.isArray(data.userIds) ? data.userIds : []
  const validUserIds = Array.from(
    new Set(
      userIdsRaw.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    )
  )

  const countFromUsers = validUserIds.length
  const count = typeof data.count === 'number' && Number.isFinite(data.count) ? Math.max(0, Math.round(data.count)) : countFromUsers

  if (countFromUsers === 0 && count <= 0) {
    return null
  }

  return {
    emoji,
    count: countFromUsers > 0 ? countFromUsers : count,
    userIds: validUserIds,
  }
}

function convertToIso(value: unknown): string | null {
  if (!value && value !== 0) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }

  return null
}

function parseChannelType(value: unknown): Channel['type'] {
  if (value === 'client' || value === 'team' || value === 'project') {
    return value
  }
  return 'team'
}

function parseMessageFormat(value: unknown): CollaborationMessageFormat {
  if (value === 'markdown' || value === 'plaintext') {
    return value
  }
  return 'markdown'
}
