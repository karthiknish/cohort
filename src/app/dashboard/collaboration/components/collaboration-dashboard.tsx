'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { UnifiedInbox } from './unified-inbox'
import { NewDMDialog } from './new-dm-dialog'
import { useCollaborationData } from '../hooks'
import { useDirectMessages } from '../hooks/use-direct-messages'
import { CollaborationSkeleton } from './collaboration-skeleton'
import { isFeatureEnabled } from '@/lib/features'

import { DASHBOARD_THEME, PAGE_TITLES } from '@/lib/dashboard-theme'
import { useAuth } from '@/contexts/auth-context'

export function CollaborationDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isNewDMDialogOpen, setIsNewDMDialogOpen] = useState(false)
  
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const currentUserId = user?.id ?? null
  
  const collab = useCollaborationData()
  const dm = useDirectMessages({ workspaceId, currentUserId })

  const requestedProjectId = searchParams.get('projectId')
  const requestedProjectName = searchParams.get('projectName')
  const projectParamHandledRef = useRef<string | null>(null)

  useEffect(() => {
    collab.clearThreadReplies()
  }, [collab.selectedChannel?.id])

  useEffect(() => {
    if (!requestedProjectId) {
      projectParamHandledRef.current = null
      return
    }

    const alreadyApplied = projectParamHandledRef.current === requestedProjectId
    if (alreadyApplied && collab.selectedChannel?.projectId === requestedProjectId) {
      return
    }

    const normalizedName = requestedProjectName?.toLowerCase() ?? null
    const targetChannel =
      collab.channels.find((channel) => channel.type === 'project' && channel.projectId === requestedProjectId) ??
      (normalizedName
        ? collab.channels.find(
          (channel) => channel.type === 'project' && channel.name.toLowerCase() === normalizedName
        )
        : undefined)

    if (targetChannel && targetChannel.id !== collab.selectedChannel?.id) {
      collab.selectChannel(targetChannel.id)
      projectParamHandledRef.current = requestedProjectId
    }
  }, [collab.channels, requestedProjectId, requestedProjectName, collab])

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
            onLoadThreadReplies={collab.loadThreadReplies}
            onLoadMoreThreadReplies={collab.loadMoreThreadReplies}
            onClearThreadReplies={collab.clearThreadReplies}
            reactionPendingByMessage={collab.reactionPendingByMessage}
            sharedFiles={collab.sharedFiles}
            dmMessages={dm.messages}
            dmIsLoadingMessages={dm.isLoadingMessages}
            dmIsLoadingMore={dm.isLoadingMore}
            dmHasMoreMessages={dm.hasMoreMessages}
            dmLoadMoreMessages={dm.loadMoreMessages}
            dmSendMessage={dm.sendMessage}
            dmIsSending={dm.isSending}
            dmToggleReaction={dm.toggleReaction}
            dmDeleteMessage={dm.deleteMessage}
            dmEditMessage={dm.editMessage}
            dmArchiveConversation={dm.archiveConversation}
            dmMuteConversation={dm.muteConversation}
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
    </div>
  )
}
