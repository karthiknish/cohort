'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Users, Briefcase, X, Columns3, List } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  }, [selectedChannel?.id])

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
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(['team', 'client', 'project'] as const).map((typeKey) => {
          const column = grouped[typeKey]
          return (
            <div key={typeKey} className="group flex flex-col gap-4 rounded-2xl border bg-muted/5 transition-colors hover:bg-muted/10">
              <div className="flex items-center justify-between px-4 py-4 border-b border-muted/20">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: typeKey === 'team' ? '#6366f1' : typeKey === 'client' ? '#10b981' : '#f59e0b' }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                    {columnLabel[typeKey]}
                  </span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-muted/40 group-hover:bg-muted/60 transition-colors">
                  {column.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-4 p-4">
                {column.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-muted/30 bg-background/40 p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground/60 italic">No channels here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {column.map((channel) => {
                      const summary = channelSummaries.get(channel.id)
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => onSelect(channel.id)}
                          className="w-full flex flex-col rounded-xl border border-muted/40 bg-background p-4 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                {channel.type === 'team' && <Users className="h-4 w-4" />}
                                {channel.type === 'client' && <Briefcase className="h-4 w-4" />}
                                {channel.type === 'project' && <MessageSquare className="h-4 w-4" />}
                              </div>
                              <span className="text-sm font-bold text-foreground truncate" title={channel.name}>
                                {channel.name}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-muted/60">
                              {channel.teamMembers.length}
                            </Badge>
                          </div>

                          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed h-8">
                            {summary?.lastMessage || 'No messages yet'}
                          </p>

                          <div className="mt-3 flex items-center justify-between pt-3 border-t border-muted/10">
                            <span className="text-[10px] font-medium text-muted-foreground/60">
                              {formatUpdated(summary?.lastTimestamp)}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80">
                              <div className={cn("h-1.5 w-1.5 rounded-full", summary?.lastMessage ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
                              {summary?.lastMessage ? 'ACTIVE' : 'IDLE'}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
