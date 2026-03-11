'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ClientTeamMember } from '@/types/clients'

import { CollaborationDashboardProvider, useCollaborationDashboardContext } from './collaboration-dashboard-provider'
import { UnifiedInbox } from './unified-inbox'
import { NewDMDialog } from './new-dm-dialog'
import { CollaborationSkeleton } from './collaboration-skeleton'
import { isFeatureEnabled } from '@/lib/features'

import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'
import { CreateChannelDialog } from './create-channel-dialog'
import { ChannelMembersDialog } from './channel-members-dialog'

export function CollaborationDashboard() {
  return (
    <CollaborationDashboardProvider>
      <CollaborationDashboardContent />
    </CollaborationDashboardProvider>
  )
}

function CollaborationDashboardContent() {
  const { collab } = useCollaborationDashboardContext()

  if (collab.isBootstrapping) {
    return <CollaborationSkeleton />
  }

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <CollaborationHeaderSection />
      <CollaborationProjectBanner />
      <CollaborationInboxSection />
      <ChannelMembersDialogSection />
    </div>
  )
}

function CollaborationHeaderSection() {
  const { currentUserId, handleCreateChannel, isAdmin, workspaceId, workspaceMembers } =
    useCollaborationDashboardContext()

  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div>
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.collaboration?.title ?? 'Team Collaboration'}</h1>
        <p className={DASHBOARD_THEME.layout.subtitle}>
          {PAGE_TITLES.collaboration?.description ?? 'Coordinate with teammates and clients in dedicated workspaces.'}
        </p>
      </div>
      {isAdmin ? (
        <div className="flex items-center gap-3">
          <CreateChannelDialog
            workspaceId={workspaceId}
            userId={currentUserId}
            teamMembers={workspaceMembers}
            onCreate={handleCreateChannel}
          />
        </div>
      ) : null}
    </div>
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
          className="h-6 w-6 hover:text-foreground"
          onClick={clearProjectFilter}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function CollaborationInboxSection() {
  const {
    collab,
    currentUserId,
    dm,
    handleSelectChannel,
    handleSelectDM,
    isAdmin,
    openManageMembersDialog,
    openNewDMDialog,
    requestedMessageId,
    requestedThreadId,
    selectedCustomChannel,
    workspaceId,
    currentUserRole,
    handleOpenChannelMessage,
    workspaceMembers,
    isNewDMDialogOpen,
    setIsNewDMDialogOpen,
    handleStartNewDM,
  } = useCollaborationDashboardContext()

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

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardContent className="flex flex-col p-0 lg:flex-row">
        <UnifiedInbox
          currentUserId={currentUserId}
          sidebar={{
            channels: collab.channels,
            channelSummaries: collab.channelSummaries,
            channelUnreadCounts: collab.channelUnreadCounts,
            dmConversations: dm.conversations,
            selectedChannel: collab.selectedChannel,
            selectedDM: dm.selectedConversation,
            onSelectChannel: handleSelectChannel,
            onSelectDM: handleSelectDM,
            onNewDM: openNewDMDialog,
            isLoadingChannels: collab.isBootstrapping,
            isLoadingDMs: dm.isLoadingConversations,
          }}
          channelPane={{
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
            workspaceId,
            onPinnedMessageClick: handleOpenChannelMessage,
            deepLinkMessageId: requestedMessageId,
            deepLinkThreadId: requestedThreadId,
          }}
          directMessagePane={{
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
          }}
          manageChannel={{
            canManageSelectedChannel: Boolean(isAdmin && selectedCustomChannel),
            onManageSelectedChannel: isAdmin && selectedCustomChannel ? openManageMembersDialog : undefined,
          }}
        />

        <NewDMDialog
          open={isNewDMDialogOpen}
          onOpenChange={setIsNewDMDialogOpen}
          onUserSelect={handleStartNewDM}
          workspaceId={workspaceId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
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
