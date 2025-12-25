'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Users, Briefcase, X, Columns3, List } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

import { CollaborationChannelList } from './channel-list'
import { CollaborationMessagePane } from './message-pane'
import { CollaborationSidebar } from './sidebar'
import { useCollaborationData } from '../hooks'
import { CollaborationSkeleton } from './collaboration-skeleton'
import { isFeatureEnabled } from '@/lib/features'
import type { Channel } from '../types'
import type { ChannelSummary } from '../hooks/types'

import { CheckSquare, FileText } from 'lucide-react'

export function CollaborationDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
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

      <Card className="border-muted/60 bg-background shadow-sm">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Channels</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="flex items-center gap-1 bg-muted/50">
                <MessageSquare className="h-3 w-3" /> {totalChannels} channels
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-muted/50">
                <Users className="h-3 w-3" /> {totalParticipants} teammates
              </Badge>
              {selectedChannel && (
                <Badge variant="outline" className="flex items-center gap-1 bg-primary/5 text-primary border-primary/20">
                  <MessageSquare className="h-3 w-3" /> {channelMessages.length} messages
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  aria-label="List view"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Kanban view"
                  onClick={() => setViewMode('board')}
                >
                  <Columns3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className={viewMode === 'board' ? "p-4" : "flex flex-col p-0 lg:flex-row"}>
          {viewMode === 'board' ? (
            <CollaborationKanban
              channels={filteredChannels}
              channelSummaries={channelSummaries}
              onSelect={(channelId) => {
                selectChannel(channelId)
                setViewMode('list')
              }}
            />
          ) : (
            <>
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
                onSendMessage={(options) => void handleSendMessage(options)}
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
            </>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

type CollaborationKanbanProps = {
  channels: Channel[]
  channelSummaries: Map<string, ChannelSummary>
  onSelect: (channelId: string) => void
}

function CollaborationKanban({ channels, channelSummaries, onSelect }: CollaborationKanbanProps) {
  const grouped = {
    team: [] as typeof channels,
    client: [] as typeof channels,
    project: [] as typeof channels,
  }

  channels.forEach((channel) => {
    grouped[channel.type].push(channel)
  })

  const columnLabel: Record<keyof typeof grouped, string> = {
    team: 'Team',
    client: 'Clients',
    project: 'Projects',
  }

  const formatUpdated = (value: string | null | undefined) => {
    if (!value) return 'No activity'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No activity'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(['team', 'client', 'project'] as const).map((typeKey) => {
          const column = grouped[typeKey]
          return (
            <div key={typeKey} className="flex flex-col gap-3 rounded-md border border-muted/50 bg-muted/10 p-3">
              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>{columnLabel[typeKey]}</span>
                <Badge variant="outline" className="bg-background text-xs">{column.length}</Badge>
              </div>
              {column.length === 0 ? (
                <div className="rounded-md border border-dashed border-muted/50 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                  No channels in this lane
                </div>
              ) : (
                <div className="space-y-3">
                  {column.map((channel) => {
                    const summary = channelSummaries.get(channel.id)
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => onSelect(channel.id)}
                        className="w-full rounded-md border border-muted/40 bg-background p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            {channel.type === 'team' && <Users className="h-4 w-4 text-muted-foreground" />}
                            {channel.type === 'client' && <Briefcase className="h-4 w-4 text-muted-foreground" />}
                            {channel.type === 'project' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                            <span className="truncate" title={channel.name}>{channel.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{channel.teamMembers.length} people</Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {summary?.lastMessage || 'No messages yet'}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatUpdated(summary?.lastTimestamp)}</span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {summary?.lastMessage ? 'Active' : 'Idle'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
