'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Users, Briefcase, X } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

import { CollaborationChannelList } from './channel-list'
import { CollaborationMessagePane } from './message-pane'
import { CollaborationSidebar } from './sidebar'
import { useCollaborationData } from '../hooks/use-collaboration-data'
import { CollaborationSkeleton } from './collaboration-skeleton'
import { isFeatureEnabled } from '@/lib/features'

export function CollaborationDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const {
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    selectedChannel,
    selectChannel,
    channelSummaries,
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
    currentUserId,
    currentUserRole,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    reactionPendingByMessage,
  } = useCollaborationData()

  const requestedProjectId = searchParams.get('projectId')
  const requestedProjectName = searchParams.get('projectName')
  const projectParamHandledRef = useRef<string | null>(null)

  useEffect(() => {
    clearThreadReplies()
  }, [clearThreadReplies, selectedChannel?.id])

  useEffect(() => {
    if (!requestedProjectId) {
      projectParamHandledRef.current = null
      return
    }

    const alreadyApplied = projectParamHandledRef.current === requestedProjectId
    if (alreadyApplied && selectedChannel?.projectId === requestedProjectId) {
      return
    }

    const normalizedName = requestedProjectName?.toLowerCase() ?? null
    const targetChannel =
      channels.find((channel) => channel.type === 'project' && channel.projectId === requestedProjectId) ??
      (normalizedName
        ? channels.find(
            (channel) => channel.type === 'project' && channel.name.toLowerCase() === normalizedName
          )
        : undefined)

    if (targetChannel && targetChannel.id !== selectedChannel?.id) {
      selectChannel(targetChannel.id)
      projectParamHandledRef.current = requestedProjectId
    }
  }, [channels, requestedProjectId, requestedProjectName, selectChannel, selectedChannel?.id, selectedChannel?.projectId])

  const clearProjectFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  if (isBootstrapping) {
    return <CollaborationSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate with teammates and clients in dedicated workspaces tied to each account.
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
              <span className="sr-only">Clear project filter</span>
            </Button>
          </div>
        </div>
      )}

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> {totalChannels} channels
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {totalParticipants} teammates
            </Badge>
            {selectedChannel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> {channelMessages.length} messages in current thread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <CollaborationChannelList
            channels={channels}
            filteredChannels={filteredChannels}
            selectedChannel={selectedChannel}
            onSelectChannel={selectChannel}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            channelSummaries={channelSummaries}
          />

          <CollaborationMessagePane
            channel={selectedChannel}
            channelMessages={channelMessages}
            visibleMessages={visibleMessages}
            channelParticipants={channelParticipants}
            messagesError={messagesError}
            isLoading={isCurrentChannelLoading}
            onLoadMore={selectedChannel ? () => { void handleLoadMore(selectedChannel.id) } : undefined}
            canLoadMore={canLoadMore}
            loadingMore={loadingMore}
            senderSelection={senderSelection}
            onSenderSelectionChange={setSenderSelection}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            messageSearchQuery={messageSearchQuery}
            onMessageSearchChange={setMessageSearchQuery}
            onSendMessage={() => void handleSendMessage()}
            sending={sending}
            isSendDisabled={isSendDisabled}
            pendingAttachments={pendingAttachments}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
            uploading={uploading}
            typingParticipants={typingParticipants}
            onComposerFocus={handleComposerFocus}
            onComposerBlur={handleComposerBlur}
            onEditMessage={(messageId, nextContent) => {
              if (!selectedChannel) return
              void handleEditMessage(selectedChannel.id, messageId, nextContent)
            }}
            onDeleteMessage={(messageId) => {
              if (!selectedChannel) return
              void handleDeleteMessage(selectedChannel.id, messageId)
            }}
            onToggleReaction={(messageId, emoji) => {
              if (!selectedChannel) return
              void handleToggleReaction(selectedChannel.id, messageId, emoji)
            }}
            messageUpdatingId={messageUpdatingId}
            messageDeletingId={messageDeletingId}
            messagesEndRef={messagesEndRef}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            threadMessagesByRootId={threadMessagesByRootId}
            threadNextCursorByRootId={threadNextCursorByRootId}
            threadLoadingByRootId={threadLoadingByRootId}
            threadErrorsByRootId={threadErrorsByRootId}
            onLoadThreadReplies={(threadRootId) => {
              void loadThreadReplies(threadRootId)
            }}
            onLoadMoreThreadReplies={(threadRootId) => {
              void loadMoreThreadReplies(threadRootId)
            }}
            onClearThreadReplies={clearThreadReplies}
            reactionPendingByMessage={reactionPendingByMessage}
          />

          {selectedChannel && (
            <>
              <Separator orientation="vertical" className="hidden h-[640px] lg:block" />
              <CollaborationSidebar
                channel={selectedChannel}
                channelParticipants={channelParticipants}
                sharedFiles={sharedFiles}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
