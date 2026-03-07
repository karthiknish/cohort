'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

import { UnifiedInbox } from './unified-inbox'
import { NewDMDialog } from './new-dm-dialog'
import { useCollaborationData } from '../hooks'
import { useDirectMessages } from '../hooks/use-direct-messages'
import { CollaborationSkeleton } from './collaboration-skeleton'
import { isFeatureEnabled } from '@/lib/features'
import { collaborationChannelsApi, usersApi } from '@/lib/convex-api'

import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'
import { useAuth } from '@/contexts/auth-context'
import { CreateChannelDialog } from './create-channel-dialog'
import { ChannelMembersDialog } from './channel-members-dialog'

export function CollaborationDashboard() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
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

  const allUsersResult = useQuery(
    usersApi.listAllUsers,
    isAdmin ? { limit: 500 } : 'skip',
  ) as Array<{ id?: string; name?: string; email?: string; role?: string }> | undefined

  const workspaceMembersResult = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId && !isAdmin
      ? {
          workspaceId,
          limit: 200,
        }
      : 'skip',
  ) as Array<{ id?: string; name?: string; email?: string; role?: string }> | undefined

  const availableUsersResult = isAdmin ? allUsersResult : workspaceMembersResult

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
  const workspaceMembers = (availableUsersResult ?? [])
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
    const params = new URLSearchParams(searchParams.toString())
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const handleStartNewDM = useCallback(async (targetUser: { id: string; name: string; role?: string | null }) => {
    await dm.startNewDM(targetUser)
    setIsNewDMDialogOpen(false)
  }, [dm])

  const handleSelectDM = useCallback((conversation: import('../hooks/use-direct-messages').DirectConversation | null) => {
    dm.selectConversation(conversation)
    if (conversation && collab.selectedChannel) {
      collab.selectChannel(null)
    }
  }, [dm, collab])

  const handleSelectChannel = useCallback((channelId: string | null) => {
    collab.selectChannel(channelId)
    if (channelId && dm.selectedConversation) {
      dm.selectConversation(null)
    }
  }, [collab, dm])

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

  if (collab.isBootstrapping) {
    return <CollaborationSkeleton />
  }

  return (
    <div className={DASHBOARD_THEME.layout.container}>
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

      {isFeatureEnabled('BIDIRECTIONAL_NAV') && (requestedProjectId || requestedProjectName) && (
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
      )}

      <Card className={DASHBOARD_THEME.cards.base}>
        <CardContent className="flex flex-col p-0 lg:flex-row">
          <UnifiedInbox
            workspaceId={workspaceId}
            currentUserId={currentUserId}
            channels={collab.channels}
            channelSummaries={collab.channelSummaries}
            channelUnreadCounts={collab.channelUnreadCounts}
            dmConversations={dm.conversations}
            selectedChannel={collab.selectedChannel}
            selectedDM={dm.selectedConversation}
            onSelectChannel={handleSelectChannel}
            onSelectDM={handleSelectDM}
            onNewDM={() => setIsNewDMDialogOpen(true)}
            isLoadingChannels={collab.isBootstrapping}
            isLoadingDMs={dm.isLoadingConversations}
            channelMessages={collab.channelMessages}
            visibleMessages={collab.visibleMessages}
            messageSearchQuery={collab.messageSearchQuery}
            onMessageSearchChange={collab.setMessageSearchQuery}
            searchHighlights={collab.searchHighlights}
            searchingMessages={collab.searchingMessages}
            channelParticipants={collab.channelParticipants}
            messagesError={collab.messagesError}
            isCurrentChannelLoading={collab.isCurrentChannelLoading}
            onLoadMore={collab.handleLoadMore}
            canLoadMore={collab.canLoadMore}
            loadingMore={collab.loadingMore}
            messageInput={collab.messageInput}
            onMessageInputChange={collab.setMessageInput}
            onSendMessage={collab.handleSendMessage}
            sending={collab.sending}
            isSendDisabled={collab.isSendDisabled}
            pendingAttachments={collab.pendingAttachments}
            onAddAttachments={collab.handleAddAttachments}
            onRemoveAttachment={collab.handleRemoveAttachment}
            clearPendingAttachments={collab.clearPendingAttachments}
            uploadPendingAttachments={collab.uploadPendingAttachments}
            uploading={collab.uploading}
            typingParticipants={collab.typingParticipants}
            onComposerFocus={collab.handleComposerFocus}
            onComposerBlur={collab.handleComposerBlur}
            onEditMessage={collab.handleEditMessage}
            onDeleteMessage={collab.handleDeleteMessage}
            onToggleReaction={collab.handleToggleReaction}
            messageUpdatingId={collab.messageUpdatingId}
            messageDeletingId={collab.messageDeletingId}
            messagesEndRef={collab.messagesEndRef}
            currentUserRole={collab.currentUserRole}
            threadMessagesByRootId={collab.threadMessagesByRootId}
            threadNextCursorByRootId={collab.threadNextCursorByRootId}
            threadLoadingByRootId={collab.threadLoadingByRootId}
            threadErrorsByRootId={collab.threadErrorsByRootId}
            threadUnreadCountsByRootId={collab.threadUnreadCountsByRootId}
            onLoadThreadReplies={collab.loadThreadReplies}
            onLoadMoreThreadReplies={collab.loadMoreThreadReplies}
            onMarkThreadAsRead={collab.markThreadAsRead}
            onClearThreadReplies={collab.clearThreadReplies}
            reactionPendingByMessage={collab.reactionPendingByMessage}
            sharedFiles={collab.sharedFiles}
            deepLinkMessageId={requestedMessageId}
            deepLinkThreadId={requestedThreadId}
            dmMessages={dm.messages}
            dmVisibleMessages={dm.visibleMessages}
            dmIsLoadingMessages={dm.isLoadingMessages}
            dmIsLoadingMore={dm.isLoadingMore}
            dmHasMoreMessages={dm.hasMoreMessages}
            dmLoadMoreMessages={dm.loadMoreMessages}
            dmMessageSearchQuery={dm.messageSearchQuery}
            onDmMessageSearchChange={dm.setMessageSearchQuery}
            dmSearchHighlights={dm.searchHighlights}
            dmSearchingMessages={dm.searchingMessages}
            dmSendMessage={dm.sendMessage}
            dmIsSending={dm.isSending}
            dmToggleReaction={dm.toggleReaction}
            dmDeleteMessage={dm.deleteMessage}
            dmEditMessage={dm.editMessage}
            dmArchiveConversation={dm.archiveConversation}
            dmMuteConversation={dm.muteConversation}
            canManageSelectedChannel={Boolean(isAdmin && selectedCustomChannel)}
            onManageSelectedChannel={
              isAdmin && selectedCustomChannel ? () => setIsManageMembersDialogOpen(true) : undefined
            }
          />

          <NewDMDialog
            open={isNewDMDialogOpen}
            onOpenChange={setIsNewDMDialogOpen}
            onUserSelect={handleStartNewDM}
            workspaceId={workspaceId}
            currentUserId={currentUserId}
            currentUserRole={user?.role}
          />
        </CardContent>
      </Card>

      <ChannelMembersDialog
        open={isManageMembersDialogOpen}
        onOpenChange={setIsManageMembersDialogOpen}
        channel={selectedCustomChannel}
        teamMembers={workspaceMembers}
        onSave={handleSaveChannelMembers}
        onDelete={handleDeleteChannel}
      />
    </div>
  )
}
