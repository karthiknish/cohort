'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent } from '@/shared/ui/card'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Button } from '@/shared/ui/button'
import type { ClientTeamMember } from '@/types/clients'

import { CollaborationDashboardProvider, useCollaborationDashboardContext } from './collaboration-dashboard-provider'
import { UnifiedInbox } from './unified-inbox'
import { NewDMDialog } from './new-dm-dialog'
import { isFeatureEnabled } from '@/lib/features'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero'
import { CreateChannelDialog } from './create-channel-dialog'
import { ChannelMembersDialog } from './channel-members-dialog'
import { CrossChannelSearch } from './cross-channel-search'
import type { UnifiedMessage } from './message-list-types'
import { useCollaborationExternalNotify } from '../hooks/use-collaboration-external-notify'
import { useCrossChannelCollaborationSearch } from '../hooks/use-cross-channel-collaboration-search'
import { useCollaborationChannelExtras } from './collaboration-channel-extras'

type CollaborationDashboardContext = ReturnType<typeof useCollaborationDashboardContext>

function createUnifiedInboxSidebarProps(context: CollaborationDashboardContext) {
  const { collab, dm, handleSelectChannel, handleSelectDM, openNewDMDialog } = context

  return {
    channels: collab.channels,
    channelSummaries: collab.channelSummaries,
    channelUnreadCounts: collab.channelUnreadCounts,
    dmConversations: dm.conversations,
    selectedChannel: collab.selectedChannel,
    selectedDM: dm.selectedConversation,
    onSelectChannel: handleSelectChannel,
    onSelectDM: handleSelectDM,
    onNewDM: openNewDMDialog,
    onBackToInbox: () => {
      handleSelectChannel(null)
      handleSelectDM(null)
    },
    isLoadingChannels: collab.isBootstrapping,
    isLoadingDMs: dm.isLoadingConversations,
  }
}

function createUnifiedInboxChannelPaneProps(
  context: CollaborationDashboardContext,
  mentionParticipants: ClientTeamMember[],
  channelExtras: ReturnType<typeof useCollaborationChannelExtras>,
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>,
) {
  const {
    collab,
    clearMessageFocus,
    currentUserId,
    handleOpenChannelMessage,
    requestedMessageId,
    requestedThreadId,
    workspaceId,
  } = context

  return {
    selectedChannel: collab.selectedChannel,
    channelMessages: collab.channelMessages,
    visibleMessages: collab.visibleMessages,
    channelParticipants: collab.channelParticipants,
    mentionParticipants,
    messageSearchQuery: collab.messageSearchQuery,
    onMessageSearchChange: collab.setMessageSearchQuery,
    searchHighlights: collab.searchHighlights,
    searchingMessages: collab.searchingMessages,
    isCurrentChannelLoading: collab.isCurrentChannelLoading,
    onLoadMore: collab.handleLoadMore,
    canLoadMore: collab.canLoadMore,
    loadingMore: collab.loadingMore,
    messageInput: collab.messageInput,
    onMessageInputChange: collab.setMessageInput,
    onSendMessage: collab.handleSendMessage,
    onShareToPlatform,
    onCreateTask: channelExtras.handleCreateTask,
    onForwardMessage: channelExtras.handleForwardMessage,
    onCreatePoll: channelExtras.handleCreatePoll,
    onExportChannel: channelExtras.handleExportChannel,
    onOpenChannelMessage: handleOpenChannelMessage,
    sending: collab.sending,
    pendingAttachments: collab.pendingAttachments,
    onAddAttachments: collab.handleAddAttachments,
    onRemoveAttachment: collab.handleRemoveAttachment,
    uploading: collab.uploading,
    typingParticipants: collab.typingParticipants,
    onComposerFocus: collab.handleComposerFocus,
    onComposerBlur: collab.handleComposerBlur,
    onEditMessage: collab.handleEditMessage,
    onDeleteMessage: collab.handleDeleteMessage,
    onToggleReaction: collab.handleToggleReaction,
    messageUpdatingId: collab.messageUpdatingId,
    messageDeletingId: collab.messageDeletingId,
    currentUserRole: collab.currentUserRole,
    threadMessagesByRootId: collab.threadMessagesByRootId,
    threadNextCursorByRootId: collab.threadNextCursorByRootId,
    threadLoadingByRootId: collab.threadLoadingByRootId,
    threadErrorsByRootId: collab.threadErrorsByRootId,
    threadUnreadCountsByRootId: collab.threadUnreadCountsByRootId,
    onLoadThreadReplies: collab.loadThreadReplies,
    onLoadMoreThreadReplies: collab.loadMoreThreadReplies,
    onMarkThreadAsRead: collab.markThreadAsRead,
    reactionPendingByMessage: collab.reactionPendingByMessage,
    sharedFiles: collab.sharedFiles,
    onClearDeepLink: clearMessageFocus,
    deepLinkMessageId: requestedMessageId,
    deepLinkThreadId: requestedThreadId,
    messagesError: collab.messagesError,
    onRetryMessages: collab.retryMessagesError,
    channelUnreadCount:
      collab.selectedChannel != null ? (collab.channelUnreadCounts[collab.selectedChannel.id] ?? 0) : 0,
    onMarkChannelRead: collab.markChannelRead,
    markChannelReadPending: collab.markChannelReadPending,
    workspaceId: context.workspaceId,
    isAdmin: context.isAdmin,
  }
}

function createUnifiedInboxDirectMessagePaneProps(
  context: CollaborationDashboardContext,
  channelExtras: ReturnType<typeof useCollaborationChannelExtras>,
) {
  const {
    clearMessageFocus,
    collab,
    currentUserRole,
    dm,
    openNewDMDialog,
    requestedMessageId,
    workspaceId,
  } = context

  return {
    typingParticipants: dm.typingParticipants,
    notifyDmTyping: dm.notifyDmTyping,
    handleComposerFocus: dm.handleComposerFocus,
    handleComposerBlur: dm.handleComposerBlur,
    selectedDM: dm.selectedConversation,
    messages: dm.messages,
    visibleMessages: dm.visibleMessages,
    isLoadingMessages: dm.isLoadingMessages,
    isLoadingMore: dm.isLoadingMore,
    hasMoreMessages: dm.hasMoreMessages,
    loadMoreMessages: dm.loadMoreMessages,
    messageSearchQuery: dm.messageSearchQuery,
    onMessageSearchChange: dm.setMessageSearchQuery,
    searchHighlights: dm.searchHighlights,
    searchingMessages: dm.searchingMessages,
    sendMessage: dm.sendMessage,
    isSending: dm.isSending,
    toggleReaction: dm.toggleReaction,
    deleteMessage: dm.deleteMessage,
    editMessage: dm.editMessage,
    archiveConversation: dm.archiveConversation,
    muteConversation: dm.muteConversation,
    pendingAttachments: collab.pendingAttachments,
    clearPendingAttachments: collab.clearPendingAttachments,
    uploadPendingAttachments: collab.uploadPendingAttachments,
    uploading: collab.uploading,
    onAddAttachments: collab.handleAddAttachments,
    onRemoveAttachment: collab.handleRemoveAttachment,
    onStartNewDM: openNewDMDialog,
    messagesError: dm.messagesError,
    onRetryMessages: dm.retryMessagesError,
    onCreateTask: channelExtras.handleCreateTask,
    currentUserRole,
    workspaceId,
    deepLinkMessageId: requestedMessageId,
    onClearDeepLink: clearMessageFocus,
  }
}

function createUnifiedInboxManageChannelProps(context: CollaborationDashboardContext) {
  const { isAdmin, selectedCustomChannel, openManageMembersDialog } = context

  if (!isAdmin || !selectedCustomChannel) {
    return undefined
  }

  return {
    canManageSelectedChannel: true,
    onManageSelectedChannel: openManageMembersDialog,
  }
}

export function CollaborationDashboard() {
  return (
    <CollaborationDashboardProvider>
      <CollaborationDashboardContent />
    </CollaborationDashboardProvider>
  )
}

function CollaborationDashboardContent() {
  const { collab } = useCollaborationDashboardContext()
  return (
    <BoneyardSkeletonBoundary
      name="dashboard-collaboration-page"
      loading={collab.isBootstrapping}
    >
      <div className={DASHBOARD_THEME.layout.container}>
        <CollaborationHeaderSection />
        <CollaborationProjectBanner />
        <CollaborationUrlWarnings />
        <CollaborationInboxSection />
        <ChannelMembersDialogSection />
      </div>
    </BoneyardSkeletonBoundary>
  )
}

function CollaborationUrlWarnings() {
  const {
    dismissUnresolvedChannelUrl,
    dismissUnresolvedConversationUrl,
    unresolvedChannelUrl,
    unresolvedConversationUrl,
  } = useCollaborationDashboardContext()

  if (!unresolvedChannelUrl && !unresolvedConversationUrl) {
    return null
  }

  return (
    <div className="mx-4 mb-3 space-y-2">
      {unresolvedChannelUrl ? (
        <Alert variant="destructive">
          <AlertTitle>Channel link unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>We couldn&apos;t open the channel from this link. You may not have access or it no longer exists.</span>
            <Button type="button" variant="outline" size="sm" onClick={dismissUnresolvedChannelUrl}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {unresolvedConversationUrl ? (
        <Alert variant="destructive">
          <AlertTitle>Conversation link unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>We couldn&apos;t open the direct message from this link. It may have been removed or you no longer have access.</span>
            <Button type="button" variant="outline" size="sm" onClick={dismissUnresolvedConversationUrl}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function CollaborationHeaderSection() {
  const {
    collab,
    currentUserId,
    currentUserRole,
    handleCreateChannel,
    handleOpenChannelMessage,
    handleSelectChannel,
    isAdmin,
    workspaceId,
    workspaceMembers,
  } = useCollaborationDashboardContext()
  const searchAcrossChannels = useCrossChannelCollaborationSearch(workspaceId, collab.channels)

  const handleSearchResultClick = useCallback(
    (messageId: string, channelId: string, threadRootId?: string | null) => {
      handleSelectChannel(channelId)
      handleOpenChannelMessage(messageId, { threadId: threadRootId ?? null })
    },
    [handleOpenChannelMessage, handleSelectChannel],
  )

  return (
    <DashboardPageHero innerClassName="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.collaboration?.title ?? 'Team Collaboration'}</h1>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-pretty')}>
          {PAGE_TITLES.collaboration?.description ?? 'Coordinate with teammates and clients in dedicated workspaces.'}
        </p>
      </div>
      {currentUserRole !== 'client' ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <CrossChannelSearch
            onSearch={searchAcrossChannels}
            onResultClick={handleSearchResultClick}
          />
          {isAdmin ? (
            <CreateChannelDialog
              workspaceId={workspaceId}
              userId={currentUserId}
              teamMembers={workspaceMembers}
              onCreate={handleCreateChannel}
            />
          ) : null}
        </div>
      ) : null}
    </DashboardPageHero>
  )
}

function CollaborationProjectBanner() {
  const { clearProjectFilter, requestedProjectId, requestedProjectName } = useCollaborationDashboardContext()

  if (!isFeatureEnabled('BIDIRECTIONAL_NAV') || (!requestedProjectId && !requestedProjectName)) {
    return null
  }

  return (
    <div className="mx-4 mb-3 flex items-center justify-between rounded-md border border-muted/40 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium">
        Viewing collaboration for project: {requestedProjectName || 'Selected Project'}
      </span>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="h-6 text-xs">
          <Link href={`/dashboard/projects?projectId=${requestedProjectId}&projectName=${encodeURIComponent(requestedProjectName || '')}`}>
            View Project
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 hover:text-foreground"
          onClick={clearProjectFilter}
          aria-label="Clear project filter from collaboration"
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

function CollaborationInboxSection() {
  const context = useCollaborationDashboardContext()
  const {
    collab,
    currentUserId,
    currentUserRole,
    handleStartNewDM,
    isNewDMDialogOpen,
    setIsNewDMDialogOpen,
    workspaceId,
    workspaceMembers,
  } = context
  const { sendCollaborationEmailCopy } = useCollaborationExternalNotify()

  const handleShareToPlatform = useCallback(
    async (message: UnifiedMessage, platform: 'email') => {
      if (platform !== 'email' || !workspaceId) {
        return
      }

      const channelMessage = collab.channelMessages.find((entry) => entry.id === message.id)
      if (channelMessage) {
        await sendCollaborationEmailCopy(channelMessage, workspaceId)
        return
      }

      const dmMessage = context.dm.messages.find((entry) => entry.legacyId === message.id)
      if (!dmMessage) {
        return
      }

      await sendCollaborationEmailCopy(
        {
          id: dmMessage.legacyId,
          channelType: 'team',
          clientId: null,
          projectId: null,
          content: dmMessage.content,
          senderId: dmMessage.senderId,
          senderName: dmMessage.senderName,
          senderRole: dmMessage.senderRole ?? null,
          createdAt: new Date(dmMessage.createdAtMs).toISOString(),
          updatedAt: null,
          isEdited: Boolean(dmMessage.edited),
          deletedAt: dmMessage.deletedAtMs ? new Date(dmMessage.deletedAtMs).toISOString() : null,
          deletedBy: dmMessage.deletedBy ?? null,
          isDeleted: Boolean(dmMessage.deleted),
        },
        workspaceId,
      )
    },
    [collab.channelMessages, context.dm.messages, sendCollaborationEmailCopy, workspaceId],
  )

  const mentionParticipants = useMemo<ClientTeamMember[]>(() => {
    const members = new Map<string, ClientTeamMember>()

    collab.channelParticipants.forEach((participant) => {
      const key = participant.name.trim().toLowerCase()
      if (!key || members.has(key)) return
      members.set(key, participant)
    })

    workspaceMembers.forEach((member) => {
      const name = member.name.trim()
      const key = name.toLowerCase()
      if (!key || members.has(key)) return

      members.set(key, {
        id: member.id,
        name,
        role: member.role?.trim() || 'Contributor',
      })
    })

    return Array.from(members.values()).sort((left, right) => left.name.localeCompare(right.name))
  }, [collab.channelParticipants, workspaceMembers])

  const sidebar = useMemo(() => createUnifiedInboxSidebarProps(context), [context])
  const channelExtras = useCollaborationChannelExtras({
    channel: collab.selectedChannel,
    channelMessages: collab.channelMessages,
    channels: collab.channels,
    currentUserId,
    workspaceId,
    onSendPollMessage: collab.selectedChannel
      ? async (content: string) => {
          await collab.handleSendMessage({ content, skipAttachmentUpload: true })
        }
      : undefined,
  })

  const channelPane = useMemo(
    () => createUnifiedInboxChannelPaneProps(context, mentionParticipants, channelExtras, handleShareToPlatform),
    [channelExtras, context, handleShareToPlatform, mentionParticipants],
  )
  const directMessagePane = useMemo(
    () => createUnifiedInboxDirectMessagePaneProps(context, channelExtras),
    [channelExtras, context],
  )
  const manageChannel = useMemo(() => createUnifiedInboxManageChannelProps(context), [context])

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardContent className="flex min-h-0 flex-col overflow-hidden p-0 max-lg:min-h-[min(72dvh,640px)] lg:flex-row">
        <UnifiedInbox
          currentUserId={currentUserId}
          sidebar={sidebar}
          channelPane={channelPane}
          directMessagePane={directMessagePane}
          manageChannel={manageChannel}
        />

        <NewDMDialog
          open={isNewDMDialogOpen}
          onOpenChange={setIsNewDMDialogOpen}
          onUserSelect={handleStartNewDM}
          workspaceId={workspaceId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
        {channelExtras.taskModal}
        {channelExtras.forwardDialog}
      </CardContent>
    </Card>
  )
}

function ChannelMembersDialogSection() {
  const {
    handleDeleteChannel,
    handleSaveChannelMembers,
    isManageMembersDialogOpen,
    selectedCustomChannel,
    setIsManageMembersDialogOpen,
    workspaceMembers,
  } = useCollaborationDashboardContext()

  return (
    <ChannelMembersDialog
      open={isManageMembersDialogOpen}
      onOpenChange={setIsManageMembersDialogOpen}
      channel={selectedCustomChannel}
      teamMembers={workspaceMembers}
      onSave={handleSaveChannelMembers}
      onDelete={handleDeleteChannel}
    />
  )
}
