'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  selectedChannelId: string | null
  selectChannel: (channelId: string | null) => void
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

export function useCollaborationDashboardUrlState({
  channels,
  selectedChannelId,
  selectChannel,
}: UseCollaborationDashboardUrlStateOptions) {
  const searchParams = useUrlSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const projectParamHandledRef = useRef<string | null>(null)
  const channelParamHandledRef = useRef<string | null>(null)

  const requestedProjectId = searchParams.get('projectId')
  const requestedProjectName = searchParams.get('projectName')
  const requestedChannelId = searchParams.get('channelId')
  const requestedChannelType = searchParams.get('channelType')
  const requestedClientId = searchParams.get('clientId')
  const requestedMessageId = searchParams.get('messageId')
  const requestedThreadId = searchParams.get('threadId')

  const replaceSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (!requestedProjectId && !requestedChannelId && !requestedChannelType && !requestedClientId) {
      projectParamHandledRef.current = null
      channelParamHandledRef.current = null
      return
    }

    const paramSignature = [
      requestedProjectId ?? '',
      requestedProjectName ?? '',
      requestedChannelId ?? '',
      requestedChannelType ?? '',
      requestedClientId ?? '',
    ].join('|')

    const alreadyApplied =
      projectParamHandledRef.current === paramSignature ||
      channelParamHandledRef.current === paramSignature

    if (alreadyApplied) {
      return
    }

    const normalizedName = requestedProjectName?.toLowerCase() ?? null
    const targetChannel =
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
        : undefined)

    if (targetChannel && targetChannel.id !== selectedChannelId) {
      selectChannel(targetChannel.id)
    }

    if (targetChannel) {
      projectParamHandledRef.current = paramSignature
      channelParamHandledRef.current = paramSignature
    }
  }, [
    channels,
    requestedChannelId,
    requestedChannelType,
    requestedClientId,
    requestedProjectId,
    requestedProjectName,
    selectChannel,
    selectedChannelId,
  ])

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

  const handleOpenChannelMessage = useCallback((messageId: string) => {
    const normalizedMessageId = typeof messageId === 'string' ? messageId.trim() : ''
    if (!normalizedMessageId) return

    replaceSearchParams((params) => {
      params.set('messageId', normalizedMessageId)
      params.delete('threadId')
    })
  }, [replaceSearchParams])

  return {
    clearMessageFocus,
    clearProjectFilter,
    handleOpenChannelMessage,
    requestedMessageId,
    requestedProjectId,
    requestedProjectName,
    requestedThreadId,
  }
}

type UseCollaborationDashboardActionsOptions = {
  clearMessageFocus: () => void
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
  clearMessageFocus,
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
      selectConversation(conversation)
      if (conversation && selectedChannel) {
        selectChannel(null)
      }
    },
    [clearMessageFocus, selectChannel, selectConversation, selectedChannel],
  )

  const handleSelectChannel = useCallback(
    (channelId: string | null) => {
      clearMessageFocus()
      selectChannel(channelId)
      if (channelId && selectedConversation) {
        selectConversation(null)
      }
    },
    [clearMessageFocus, selectChannel, selectConversation, selectedConversation],
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
        logError(error, 'useCollaborationDashboardActions:handleSaveChannelMembers')
        toast({
          title: 'Update failed',
          description: asErrorMessage(error),
          variant: 'destructive',
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
      logError(error, 'useCollaborationDashboardActions:handleDeleteChannel')
      toast({
        title: 'Delete failed',
        description: asErrorMessage(error),
        variant: 'destructive',
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