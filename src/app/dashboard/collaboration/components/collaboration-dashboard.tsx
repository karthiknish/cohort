'use client'

import { useEffect } from 'react'
import { MessageSquare, Users } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { CollaborationChannelList } from './channel-list'
import { CollaborationMessagePane } from './message-pane'
import { CollaborationSidebar } from './sidebar'
import { useCollaborationData } from '../hooks/use-collaboration-data'
import { CollaborationSkeleton } from './collaboration-skeleton'

export function CollaborationDashboard() {
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

  useEffect(() => {
    clearThreadReplies()
  }, [clearThreadReplies, selectedChannel?.id])

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

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <CollaborationSidebar
            channel={selectedChannel}
            channelParticipants={channelParticipants}
            sharedFiles={sharedFiles}
          />
        </CardContent>
      </Card>
    </div>
  )
}
