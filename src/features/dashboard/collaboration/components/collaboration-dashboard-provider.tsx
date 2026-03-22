'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { usePathname, useRouter } from 'next/navigation'

import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'
import { collaborationChannelsApi, usersApi } from '@/lib/convex-api'

import { useCollaborationData } from '../hooks'
import { type DirectConversation, useDirectMessages } from '../hooks/use-direct-messages'

type WorkspaceMember = {
  id: string
  name: string
  email?: string
  role?: string
}

type CollaborationDashboardContextValue = {
  collab: ReturnType<typeof useCollaborationData>
  dm: ReturnType<typeof useDirectMessages>
  currentUserId: string | null
  currentUserRole: string | null
  isAdmin: boolean
  isManageMembersDialogOpen: boolean
  isNewDMDialogOpen: boolean
  requestedMessageId: string | null
  requestedProjectId: string | null
  requestedProjectName: string | null
  requestedThreadId: string | null
  selectedCustomChannel: ReturnType<typeof useCollaborationData>['selectedChannel']
  workspaceId: string | null
  workspaceMembers: WorkspaceMember[]
  clearMessageFocus: () => void
  clearProjectFilter: () => void
  handleCreateChannel: (channel: {
    name: string
    description?: string
    visibility: 'public' | 'private'
    memberIds: string[]
  }) => Promise<void>
  handleDeleteChannel: () => Promise<void>
  handleSaveChannelMembers: (payload: {
    memberIds: string[]
    visibility: 'public' | 'private'
  }) => Promise<void>
  handleOpenChannelMessage: (messageId: string) => void
  handleSelectChannel: (channelId: string | null) => void
  handleSelectDM: (conversation: DirectConversation | null) => void
  handleStartNewDM: (targetUser: { id: string; name: string; role?: string | null }) => Promise<void>
  openManageMembersDialog: () => void
  openNewDMDialog: () => void
  setIsManageMembersDialogOpen: (open: boolean) => void
  setIsNewDMDialogOpen: (open: boolean) => void
}

const CollaborationDashboardContext = createContext<CollaborationDashboardContextValue | null>(null)

export function CollaborationDashboardProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const searchParams = useUrlSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isNewDMDialogOpen, setIsNewDMDialogOpen] = useState(false)
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false)

  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const currentUserId = user?.id ?? null
  const currentUserName = user?.name?.trim() || user?.email?.trim() || 'You'
  const currentUserRole = user?.role ?? null
  const isAdmin = currentUserRole === 'admin'

  const workspaceMembersResult = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId
      ? {
          workspaceId,
          limit: 500,
        }
      : 'skip',
  ) as Array<{ id?: string; name?: string; email?: string; role?: string }> | undefined

  const createChannel = useMutation(collaborationChannelsApi.create)
  const updateChannelMembers = useMutation(collaborationChannelsApi.updateMembers)
  const removeChannel = useMutation(collaborationChannelsApi.remove)

  const collab = useCollaborationData()
  const dm = useDirectMessages({
    workspaceId,
    currentUserId,
    currentUserName,
    currentUserRole,
  })
  const clearThreadReplies = collab.clearThreadReplies
  const selectedChannelId = collab.selectedChannel?.id ?? null
  const collabChannels = collab.channels
  const collabSelectedChannelId = collab.selectedChannel?.id ?? null
  const selectCollabChannel = collab.selectChannel
  const selectedCustomChannel = collab.selectedChannel?.isCustom ? collab.selectedChannel : null
  const workspaceMembers = (workspaceMembersResult ?? [])
    .filter((member): member is { id: string; name: string; email?: string; role?: string } =>
      typeof member?.id === 'string' && typeof member?.name === 'string',
    )
    .map((member) => ({
      id: member.id,
      name: member.name,
      email: typeof member.email === 'string' ? member.email : undefined,
      role: typeof member.role === 'string' ? member.role : undefined,
    }))

  const requestedProjectId = searchParams.get('projectId')
  const requestedProjectName = searchParams.get('projectName')
  const requestedChannelId = searchParams.get('channelId')
  const requestedChannelType = searchParams.get('channelType')
  const requestedClientId = searchParams.get('clientId')
  const requestedMessageId = searchParams.get('messageId')
  const requestedThreadId = searchParams.get('threadId')
  const projectParamHandledRef = useRef<string | null>(null)
  const channelParamHandledRef = useRef<string | null>(null)

  const replaceSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (selectedChannelId === null) {
      clearThreadReplies()
      return
    }

    clearThreadReplies()
  }, [clearThreadReplies, selectedChannelId])

  useEffect(() => {
    if (!requestedProjectId && !requestedChannelId && !requestedChannelType) {
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
        ? collabChannels.find((channel) => channel.id === requestedChannelId)
        : undefined) ??
      (requestedChannelType === 'team'
        ? collabChannels.find((channel) => channel.type === 'team')
        : undefined) ??
      (requestedChannelType === 'client' && requestedClientId
        ? collabChannels.find(
            (channel) => channel.type === 'client' && channel.clientId === requestedClientId,
          )
        : undefined) ??
      (requestedChannelType === 'project' && requestedProjectId
        ? collabChannels.find(
            (channel) => channel.type === 'project' && channel.projectId === requestedProjectId,
          )
        : undefined) ??
      (requestedProjectId
        ? collabChannels.find((channel) => channel.type === 'project' && channel.projectId === requestedProjectId)
        : undefined) ??
      (normalizedName
        ? collabChannels.find(
            (channel) => channel.type === 'project' && channel.name.toLowerCase() === normalizedName,
          )
        : undefined)

    if (targetChannel && targetChannel.id !== collabSelectedChannelId) {
      selectCollabChannel(targetChannel.id)
    }

    if (targetChannel) {
      projectParamHandledRef.current = paramSignature
      channelParamHandledRef.current = paramSignature
    }
  }, [
    collabChannels,
    collabSelectedChannelId,
    selectCollabChannel,
    requestedProjectId,
    requestedProjectName,
    requestedChannelId,
    requestedChannelType,
    requestedClientId,
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

  const handleStartNewDM = useCallback(
    async (targetUser: { id: string; name: string; role?: string | null }) => {
      await dm.startNewDM(targetUser)
      setIsNewDMDialogOpen(false)
    },
    [dm],
  )

  const handleSelectDM = useCallback(
    (conversation: DirectConversation | null) => {
      clearMessageFocus()
      dm.selectConversation(conversation)
      if (conversation && collab.selectedChannel) {
        collab.selectChannel(null)
      }
    },
    [clearMessageFocus, dm, collab],
  )

  const handleSelectChannel = useCallback(
    (channelId: string | null) => {
      clearMessageFocus()
      collab.selectChannel(channelId)
      if (channelId && dm.selectedConversation) {
        dm.selectConversation(null)
      }
    },
    [clearMessageFocus, collab, dm],
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
        selectCollabChannel(created.legacyId)
      }
    },
    [createChannel, selectCollabChannel, workspaceId],
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
        console.error('Failed to update channel members', error)
        toast({
          title: 'Update failed',
          description: 'Could not update the channel membership.',
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

      setIsManageMembersDialogOpen(false)
      selectCollabChannel('team-agency')
      toast({
        title: 'Channel deleted',
        description: `#${selectedCustomChannel.name} has been removed from collaboration.`,
      })
    } catch (error) {
      console.error('Failed to delete channel', error)
      toast({
        title: 'Delete failed',
        description: 'Could not delete the channel.',
        variant: 'destructive',
      })
      throw error
    }
  }, [removeChannel, selectCollabChannel, selectedCustomChannel, toast, workspaceId])

  return (
    <CollaborationDashboardContext.Provider
      value={{
        collab,
        dm,
        currentUserId,
        currentUserRole,
        isAdmin,
        isManageMembersDialogOpen,
        isNewDMDialogOpen,
        requestedMessageId,
        requestedProjectId,
        requestedProjectName,
        requestedThreadId,
        selectedCustomChannel,
        workspaceId,
        workspaceMembers,
        clearMessageFocus,
        clearProjectFilter,
        handleCreateChannel,
        handleDeleteChannel,
        handleOpenChannelMessage,
        handleSaveChannelMembers,
        handleSelectChannel,
        handleSelectDM,
        handleStartNewDM,
        openManageMembersDialog: () => setIsManageMembersDialogOpen(true),
        openNewDMDialog: () => setIsNewDMDialogOpen(true),
        setIsManageMembersDialogOpen,
        setIsNewDMDialogOpen,
      }}
    >
      {children}
    </CollaborationDashboardContext.Provider>
  )
}

export function useCollaborationDashboardContext(): CollaborationDashboardContextValue {
  const context = useContext(CollaborationDashboardContext)

  if (!context) {
    throw new Error('useCollaborationDashboardContext must be used within a CollaborationDashboardProvider')
  }

  return context
}