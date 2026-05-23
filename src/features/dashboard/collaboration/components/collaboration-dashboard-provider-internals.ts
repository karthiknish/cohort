'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'

import { asErrorMessage, logError } from '@/lib/convex-errors'
import type { DirectConversation } from '../hooks/use-direct-messages'

type CollaborationChannelLike = {
  id: string
  type: string
  name: string
  clientId?: string | null
  projectId?: string | null
}

type SelectedCustomChannelLike = {
  id: string
  name: string
} | null

type StartNewDMTarget = {
  id: string
  name: string
  role?: string | null
}

type DashboardToast = (options: {
  title: string
  description: string
  variant?: 'destructive'
}) => void

type UseCollaborationDashboardUrlStateOptions = {
  channels: CollaborationChannelLike[]
  dmConversations: DirectConversation[]
  selectedChannelId: string | null
  selectedConversationLegacyId: string | null
  isChannelsReady: boolean
  isDmReady: boolean
  selectChannel: (channelId: string | null) => void
  selectConversation: (conversation: DirectConversation | null) => void
}

export function useCollaborationDashboardDialogs() {
  const [isNewDMDialogOpen, setIsNewDMDialogOpen] = useState(false)
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false)

  const openManageMembersDialog = useCallback(() => {
    setIsManageMembersDialogOpen(true)
  }, [])

  const openNewDMDialog = useCallback(() => {
    setIsNewDMDialogOpen(true)
  }, [])

  return {
    isManageMembersDialogOpen,
    isNewDMDialogOpen,
    openManageMembersDialog,
    openNewDMDialog,
    setIsManageMembersDialogOpen,
    setIsNewDMDialogOpen,
  }
}

function clearChannelUrlParams(params: URLSearchParams) {
  params.delete('projectId')
  params.delete('projectName')
  params.delete('channelId')
  params.delete('channelType')
  params.delete('clientId')
}

function clearDmUrlParams(params: URLSearchParams) {
  params.delete('conversationId')
}

export function useCollaborationDashboardUrlState({
  channels,
  dmConversations,
  selectedChannelId,
  selectedConversationLegacyId,
  isChannelsReady,
  isDmReady,
  selectChannel,
  selectConversation,
}: UseCollaborationDashboardUrlStateOptions) {
  const searchParams = useUrlSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const projectParamHandledRef = useRef<string | null>(null)
  const channelParamHandledRef = useRef<string | null>(null)
  const dmParamHandledRef = useRef<string | null>(null)

  const requestedProjectId = searchParams.get('projectId')
  const requestedProjectName = searchParams.get('projectName')
  const requestedChannelId = searchParams.get('channelId')
  const requestedChannelType = searchParams.get('channelType')
  const requestedClientId = searchParams.get('clientId')
  const requestedConversationId = searchParams.get('conversationId')
  const requestedMessageId = searchParams.get('messageId')
  const requestedThreadId = searchParams.get('threadId')

  const replaceSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const hasUrlChannelParams =
    Boolean(requestedProjectId || requestedChannelId || requestedChannelType || requestedClientId)

  const hasUrlDmParam = Boolean(requestedConversationId)

  const targetConversation = useMemo(() => {
    if (!requestedConversationId) {
      return null
    }

    return dmConversations.find((conversation) => conversation.legacyId === requestedConversationId) ?? null
  }, [dmConversations, requestedConversationId])

  const paramSignature = useMemo(
    () =>
      [
        requestedProjectId ?? '',
        requestedProjectName ?? '',
        requestedChannelId ?? '',
        requestedChannelType ?? '',
        requestedClientId ?? '',
      ].join('|'),
    [
      requestedChannelId,
      requestedChannelType,
      requestedClientId,
      requestedProjectId,
      requestedProjectName,
    ],
  )

  const targetChannel = useMemo(() => {
    if (!hasUrlChannelParams) {
      return null
    }

    const normalizedName = requestedProjectName?.toLowerCase() ?? null
    return (
      (requestedChannelId
        ? channels.find((channel) => channel.id === requestedChannelId)
        : undefined) ??
      (requestedChannelType === 'team'
        ? channels.find((channel) => channel.type === 'team')
        : undefined) ??
      (requestedChannelType === 'client' && requestedClientId
        ? channels.find(
            (channel) => channel.type === 'client' && channel.clientId === requestedClientId,
          )
        : undefined) ??
      (requestedClientId
        ? channels.find(
            (channel) => channel.type === 'client' && channel.clientId === requestedClientId,
          )
        : undefined) ??
      (requestedChannelType === 'project' && requestedProjectId
        ? channels.find(
            (channel) => channel.type === 'project' && channel.projectId === requestedProjectId,
          )
        : undefined) ??
      (requestedProjectId
        ? channels.find(
            (channel) => channel.type === 'project' && channel.projectId === requestedProjectId,
          )
        : undefined) ??
      (normalizedName
        ? channels.find(
            (channel) =>
              channel.type === 'project' && channel.name.toLowerCase() === normalizedName,
          )
        : undefined) ??
      null
    )
  }, [
    channels,
    hasUrlChannelParams,
    requestedChannelId,
    requestedChannelType,
    requestedClientId,
    requestedProjectId,
    requestedProjectName,
  ])

  const unresolvedChannelUrl =
    isChannelsReady && hasUrlChannelParams && targetChannel === null && !hasUrlDmParam

  const unresolvedConversationUrl = isDmReady && hasUrlDmParam && targetConversation === null

  const clearProjectFilter = useCallback(() => {
    replaceSearchParams((params) => {
      params.delete('projectId')
      params.delete('projectName')
    })
  }, [replaceSearchParams])

  const clearMessageFocus = useCallback(() => {
    if (!requestedMessageId && !requestedThreadId) return

    replaceSearchParams((params) => {
      params.delete('messageId')
      params.delete('threadId')
    })
  }, [replaceSearchParams, requestedMessageId, requestedThreadId])

  useEffect(() => {
    if (!hasUrlChannelParams) {
      projectParamHandledRef.current = null
      channelParamHandledRef.current = null
      return
    }

    if (!isChannelsReady || !targetChannel) {
      return
    }

    const alreadyApplied =
      projectParamHandledRef.current === paramSignature ||
      channelParamHandledRef.current === paramSignature

    if (alreadyApplied) {
      return
    }

    if (targetChannel.id !== selectedChannelId || selectedConversationLegacyId) {
      clearMessageFocus()
      selectConversation(null)
      selectChannel(targetChannel.id)
      replaceSearchParams((params) => {
        clearDmUrlParams(params)
      })
    }

    projectParamHandledRef.current = paramSignature
    channelParamHandledRef.current = paramSignature
  }, [
    clearMessageFocus,
    hasUrlChannelParams,
    isChannelsReady,
    paramSignature,
    replaceSearchParams,
    selectChannel,
    selectConversation,
    selectedChannelId,
    selectedConversationLegacyId,
    targetChannel,
  ])

  useEffect(() => {
    if (!hasUrlDmParam || !requestedConversationId) {
      dmParamHandledRef.current = null
      return
    }

    if (!isDmReady || !targetConversation) {
      return
    }

    if (dmParamHandledRef.current === requestedConversationId) {
      return
    }

    if (selectedConversationLegacyId !== targetConversation.legacyId || selectedChannelId) {
      if (!requestedMessageId) {
        clearMessageFocus()
      }
      selectChannel(null)
      selectConversation(targetConversation)
      replaceSearchParams((params) => {
        clearChannelUrlParams(params)
      })
    }

    dmParamHandledRef.current = requestedConversationId
  }, [
    clearMessageFocus,
    hasUrlDmParam,
    requestedMessageId,
    isDmReady,
    replaceSearchParams,
    requestedConversationId,
    selectChannel,
    selectConversation,
    selectedChannelId,
    selectedConversationLegacyId,
    targetConversation,
  ])

  const dismissUnresolvedChannelUrl = useCallback(() => {
    replaceSearchParams((params) => {
      clearChannelUrlParams(params)
    })
  }, [replaceSearchParams])

  const dismissUnresolvedConversationUrl = useCallback(() => {
    replaceSearchParams((params) => {
      clearDmUrlParams(params)
    })
  }, [replaceSearchParams])

  const handleOpenChannelMessage = useCallback(
    (messageId: string, options?: { threadId?: string | null }) => {
      const normalizedMessageId = typeof messageId === 'string' ? messageId.trim() : ''
      if (!normalizedMessageId) return

      const normalizedThreadId =
        typeof options?.threadId === 'string' && options.threadId.trim().length > 0
          ? options.threadId.trim()
          : null

      replaceSearchParams((params) => {
        params.set('messageId', normalizedMessageId)
        if (normalizedThreadId) {
          params.set('threadId', normalizedThreadId)
        } else {
          params.delete('threadId')
        }
        clearDmUrlParams(params)
      })
    },
    [replaceSearchParams],
  )

  const handleOpenDmMessage = useCallback(
    (messageId: string) => {
      const normalizedMessageId = typeof messageId === 'string' ? messageId.trim() : ''
      if (!normalizedMessageId) return

      replaceSearchParams((params) => {
        params.set('messageId', normalizedMessageId)
        params.delete('threadId')
        clearChannelUrlParams(params)
      })
    },
    [replaceSearchParams],
  )

  const syncChannelToUrl = useCallback(
    (channelId: string) => {
      replaceSearchParams((params) => {
        params.set('channelId', channelId)
        clearDmUrlParams(params)
        params.delete('messageId')
        params.delete('threadId')
      })
    },
    [replaceSearchParams],
  )

  const syncDmToUrl = useCallback(
    (conversationLegacyId: string) => {
      replaceSearchParams((params) => {
        params.set('conversationId', conversationLegacyId)
        clearChannelUrlParams(params)
        params.delete('messageId')
        params.delete('threadId')
      })
    },
    [replaceSearchParams],
  )

  const clearCollaborationSelectionFromUrl = useCallback(() => {
    replaceSearchParams((params) => {
      clearChannelUrlParams(params)
      clearDmUrlParams(params)
      params.delete('messageId')
      params.delete('threadId')
    })
  }, [replaceSearchParams])

  return {
    clearCollaborationSelectionFromUrl,
    clearMessageFocus,
    clearProjectFilter,
    dismissUnresolvedChannelUrl,
    dismissUnresolvedConversationUrl,
    handleOpenChannelMessage,
    handleOpenDmMessage,
    syncChannelToUrl,
    syncDmToUrl,
    requestedConversationId,
    requestedMessageId,
    requestedProjectId,
    requestedProjectName,
    requestedThreadId,
    unresolvedChannelUrl,
    unresolvedConversationUrl,
  }
}

type UseCollaborationDashboardActionsOptions = {
  clearCollaborationSelectionFromUrl?: () => void
  clearMessageFocus: () => void
  clearPendingAttachments?: () => void
  syncChannelToUrl?: (channelId: string) => void
  syncDmToUrl?: (conversationLegacyId: string) => void
  closeManageMembersDialog: () => void
  closeNewDMDialog: () => void
  createChannel: (args: {
    workspaceId: string
    name: string
    description: string | null
    visibility: 'public' | 'private'
    memberIds: string[]
  }) => Promise<{ legacyId?: string } | unknown>
  removeChannel: (args: { workspaceId: string; legacyId: string }) => Promise<unknown>
  selectedChannel: { id: string } | null
  selectedConversation: DirectConversation | null
  selectedCustomChannel: SelectedCustomChannelLike
  selectChannel: (channelId: string | null) => void
  selectConversation: (conversation: DirectConversation | null) => void
  startNewDM: (targetUser: StartNewDMTarget) => Promise<void>
  toast: DashboardToast
  updateChannelMembers: (args: {
    workspaceId: string
    legacyId: string
    memberIds: string[]
    visibility: 'public' | 'private'
  }) => Promise<unknown>
  workspaceId: string | null
}

export function useCollaborationDashboardActions({
  clearCollaborationSelectionFromUrl,
  clearMessageFocus,
  clearPendingAttachments,
  syncChannelToUrl,
  syncDmToUrl,
  closeManageMembersDialog,
  closeNewDMDialog,
  createChannel,
  removeChannel,
  selectedChannel,
  selectedConversation,
  selectedCustomChannel,
  selectChannel,
  selectConversation,
  startNewDM,
  toast,
  updateChannelMembers,
  workspaceId,
}: UseCollaborationDashboardActionsOptions) {
  const handleStartNewDM = useCallback(
    async (targetUser: StartNewDMTarget) => {
      await startNewDM(targetUser)
      closeNewDMDialog()
    },
    [closeNewDMDialog, startNewDM],
  )

  const handleSelectDM = useCallback(
    (conversation: DirectConversation | null) => {
      clearMessageFocus()
      clearPendingAttachments?.()
      if (conversation) {
        selectChannel(null)
        syncDmToUrl?.(conversation.legacyId)
      } else {
        clearCollaborationSelectionFromUrl?.()
      }
      selectConversation(conversation)
    },
    [
      clearCollaborationSelectionFromUrl,
      clearMessageFocus,
      clearPendingAttachments,
      selectChannel,
      selectConversation,
      syncDmToUrl,
    ],
  )

  const handleSelectChannel = useCallback(
    (channelId: string | null) => {
      clearMessageFocus()
      clearPendingAttachments?.()
      if (channelId) {
        syncChannelToUrl?.(channelId)
        if (selectedConversation) {
          selectConversation(null)
        }
      } else {
        clearCollaborationSelectionFromUrl?.()
      }
      selectChannel(channelId)
    },
    [
      clearCollaborationSelectionFromUrl,
      clearMessageFocus,
      clearPendingAttachments,
      selectChannel,
      selectConversation,
      selectedConversation,
      syncChannelToUrl,
    ],
  )

  const handleCreateChannel = useCallback(
    async (channel: {
      name: string
      description?: string
      visibility: 'public' | 'private'
      memberIds: string[]
    }) => {
      if (!workspaceId) {
        throw new Error('Workspace unavailable')
      }

      const created = (await createChannel({
        workspaceId,
        name: channel.name,
        description: channel.description ?? null,
        visibility: channel.visibility,
        memberIds: channel.memberIds,
      })) as { legacyId?: string }

      if (typeof created?.legacyId === 'string') {
        selectChannel(created.legacyId)
      }
    },
    [createChannel, selectChannel, workspaceId],
  )

  const handleSaveChannelMembers = useCallback(
    async (payload: { memberIds: string[]; visibility: 'public' | 'private' }) => {
      if (!workspaceId || !selectedCustomChannel) {
        return
      }

      try {
        await updateChannelMembers({
          workspaceId,
          legacyId: selectedCustomChannel.id,
          memberIds: payload.memberIds,
          visibility: payload.visibility,
        })

        toast({
          title: 'Channel updated',
          description: `Access for #${selectedCustomChannel.name} has been updated.`,
        })
      } catch (error) {
        reportConvexFailure({
        error: error,
        context: 'useCollaborationDashboardActions:handleSaveChannelMembers',
        title: 'Update failed',
        fallbackMessage: 'Update failed',
        })
        throw error
      }
    },
    [selectedCustomChannel, toast, updateChannelMembers, workspaceId],
  )

  const handleDeleteChannel = useCallback(async () => {
    if (!workspaceId || !selectedCustomChannel) {
      return
    }

    try {
      await removeChannel({
        workspaceId,
        legacyId: selectedCustomChannel.id,
      })

      closeManageMembersDialog()
      selectChannel('team-agency')
      toast({
        title: 'Channel deleted',
        description: `#${selectedCustomChannel.name} has been removed from collaboration.`,
      })
    } catch (error) {
      reportConvexFailure({
        error: error,
        context: 'useCollaborationDashboardActions:handleDeleteChannel',
        title: 'Delete failed',
        fallbackMessage: 'Delete failed',
        })
      throw error
    }
  }, [closeManageMembersDialog, removeChannel, selectChannel, selectedCustomChannel, toast, workspaceId])

  return {
    handleCreateChannel,
    handleDeleteChannel,
    handleSaveChannelMembers,
    handleSelectChannel,
    handleSelectDM,
    handleStartNewDM,
  }
}