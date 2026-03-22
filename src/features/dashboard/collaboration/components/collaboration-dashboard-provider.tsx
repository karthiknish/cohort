'use client'

import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { collaborationChannelsApi, usersApi } from '@/lib/convex-api'

import { useCollaborationData } from '../hooks'
import { type DirectConversation, useDirectMessages } from '../hooks/use-direct-messages'
import {
  useCollaborationDashboardActions,
  useCollaborationDashboardDialogs,
  useCollaborationDashboardUrlState,
} from './collaboration-dashboard-provider-internals'

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
  const dialogs = useCollaborationDashboardDialogs()

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
  const collabSelectedChannelId = collab.selectedChannel?.id ?? null
  const selectCollabChannel = collab.selectChannel
  const selectedCustomChannel = collab.selectedChannel?.isCustom ? collab.selectedChannel : null
  const workspaceMembers = useMemo(
    () =>
      (workspaceMembersResult ?? [])
        .filter((member): member is { id: string; name: string; email?: string; role?: string } =>
          typeof member?.id === 'string' && typeof member?.name === 'string',
        )
        .map((member) => ({
          id: member.id,
          name: member.name,
          email: typeof member.email === 'string' ? member.email : undefined,
          role: typeof member.role === 'string' ? member.role : undefined,
        })),
    [workspaceMembersResult],
  )

  const urlState = useCollaborationDashboardUrlState({
    channels: collab.channels,
    selectedChannelId: collabSelectedChannelId,
    selectChannel: selectCollabChannel,
  })

  useEffect(() => {
    if (selectedChannelId === null) {
      clearThreadReplies()
      return
    }

    clearThreadReplies()
  }, [clearThreadReplies, selectedChannelId])

  const actions = useCollaborationDashboardActions({
    clearMessageFocus: urlState.clearMessageFocus,
    closeManageMembersDialog: () => dialogs.setIsManageMembersDialogOpen(false),
    closeNewDMDialog: () => dialogs.setIsNewDMDialogOpen(false),
    createChannel,
    removeChannel,
    selectedChannel: collab.selectedChannel,
    selectedConversation: dm.selectedConversation,
    selectedCustomChannel,
    selectChannel: selectCollabChannel,
    selectConversation: dm.selectConversation,
    startNewDM: dm.startNewDM,
    toast,
    updateChannelMembers,
    workspaceId,
  })

  const value = useMemo<CollaborationDashboardContextValue>(
    () => ({
      collab,
      dm,
      currentUserId,
      currentUserRole,
      isAdmin,
      isManageMembersDialogOpen: dialogs.isManageMembersDialogOpen,
      isNewDMDialogOpen: dialogs.isNewDMDialogOpen,
      requestedMessageId: urlState.requestedMessageId,
      requestedProjectId: urlState.requestedProjectId,
      requestedProjectName: urlState.requestedProjectName,
      requestedThreadId: urlState.requestedThreadId,
      selectedCustomChannel,
      workspaceId,
      workspaceMembers,
      clearMessageFocus: urlState.clearMessageFocus,
      clearProjectFilter: urlState.clearProjectFilter,
      handleCreateChannel: actions.handleCreateChannel,
      handleDeleteChannel: actions.handleDeleteChannel,
      handleOpenChannelMessage: urlState.handleOpenChannelMessage,
      handleSaveChannelMembers: actions.handleSaveChannelMembers,
      handleSelectChannel: actions.handleSelectChannel,
      handleSelectDM: actions.handleSelectDM,
      handleStartNewDM: actions.handleStartNewDM,
      openManageMembersDialog: dialogs.openManageMembersDialog,
      openNewDMDialog: dialogs.openNewDMDialog,
      setIsManageMembersDialogOpen: dialogs.setIsManageMembersDialogOpen,
      setIsNewDMDialogOpen: dialogs.setIsNewDMDialogOpen,
    }),
    [
      actions.handleCreateChannel,
      actions.handleDeleteChannel,
      actions.handleSaveChannelMembers,
      actions.handleSelectChannel,
      actions.handleSelectDM,
      actions.handleStartNewDM,
      collab,
      currentUserId,
      currentUserRole,
      dialogs.isManageMembersDialogOpen,
      dialogs.isNewDMDialogOpen,
      dialogs.openManageMembersDialog,
      dialogs.openNewDMDialog,
      dialogs.setIsManageMembersDialogOpen,
      dialogs.setIsNewDMDialogOpen,
      dm,
      isAdmin,
      selectedCustomChannel,
      urlState.clearMessageFocus,
      urlState.clearProjectFilter,
      urlState.handleOpenChannelMessage,
      urlState.requestedMessageId,
      urlState.requestedProjectId,
      urlState.requestedProjectName,
      urlState.requestedThreadId,
      workspaceId,
      workspaceMembers,
    ],
  )

  return (
    <CollaborationDashboardContext.Provider value={value}>
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