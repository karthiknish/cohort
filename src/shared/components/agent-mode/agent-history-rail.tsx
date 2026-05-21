'use client'

import { useMemo } from 'react'
import {
  AlertCircle,
  Archive,
  Copy,
  Download,
  Link2,
  Loader2,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  SquarePen,
  X,
} from 'lucide-react'

import { groupAgentHistory } from '@/lib/agent-history'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { AgentConversationSummary } from '@/shared/hooks/use-agent-mode'
import { cn } from '@/lib/utils'

import { AgentConversationItem } from './agent-conversation-item'

type AgentHistoryRailProps = {
  showHistory?: boolean
  history: AgentConversationSummary[]
  isHistoryLoading: boolean
  historyError: string | null
  historyHasMore: boolean
  historySearch: string
  onHistorySearchChange: (value: string) => void
  showArchivedHistory: boolean
  onShowArchivedHistoryChange: (value: boolean) => void
  conversationId: string | null
  messagesCount: number
  isConversationLoading: boolean
  loadingConversationId: string | null
  editingConversationId: string | null
  editingTitle: string
  setEditingTitle: (value: string) => void
  onSelectConversation: (conversationId: string) => void
  onUpdateConversationTitle: (conversationId: string, title: string) => void
  onDeleteConversation: (conversationId: string) => void
  onStartNewChat: () => void
  onClose: () => void
  onStartEditing: (conversationId: string, title: string) => void
  onStopEditing: () => void
  onRetryHistory: () => void
  onLoadMoreHistory: () => void
  onPinConversation: (conversationId: string, pinned: boolean) => void
  onArchiveConversation: (conversationId: string, archived: boolean) => void
  onDuplicateConversation?: (conversationId: string) => void
  onExportConversation?: (conversationId: string) => void
  onShareConversation?: (conversationId: string) => void
  layout?: 'rail' | 'sheet'
}

export function AgentHistoryRail({
  history,
  isHistoryLoading,
  historyError,
  historyHasMore,
  historySearch,
  onHistorySearchChange,
  showArchivedHistory,
  onShowArchivedHistoryChange,
  conversationId,
  messagesCount,
  isConversationLoading,
  loadingConversationId,
  editingConversationId,
  editingTitle,
  setEditingTitle,
  onSelectConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  onStartNewChat,
  onClose,
  onStartEditing,
  onStopEditing,
  onRetryHistory,
  onLoadMoreHistory,
  onPinConversation,
  onArchiveConversation,
  onDuplicateConversation,
  onExportConversation,
  onShareConversation,
  layout = 'rail',
}: AgentHistoryRailProps) {
  const grouped = useMemo(
    () => groupAgentHistory(history, { includeArchived: showArchivedHistory }),
    [history, showArchivedHistory],
  )

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col border-border bg-background',
        layout === 'rail' ? 'w-[min(300px,38vw)] shrink-0 border-r' : 'w-full border-b',
      )}
      aria-label="Chat history"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <p className="text-sm font-semibold">Chat history</p>
        <div className="flex items-center gap-1">
          {conversationId || messagesCount > 0 ? (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onStartNewChat}>
              <SquarePen className="h-3.5 w-3.5" />
              New
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close history">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-b px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={historySearch}
            onChange={(event) => onHistorySearchChange(event.target.value)}
            placeholder="Search chats and messages…"
            className="h-9 pl-8"
            aria-label="Search chat history and messages"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Matches chat titles, previews, and message text.</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={showArchivedHistory ? 'secondary' : 'outline'}
            className="h-8 gap-1.5"
            onClick={() => onShowArchivedHistoryChange(!showArchivedHistory)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {historyError ? (
          <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Could not load chats</p>
                <p className="mt-1 text-xs text-muted-foreground">{historyError}</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 gap-2"
              onClick={onRetryHistory}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : isHistoryLoading && history.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chats…
          </div>
        ) : grouped.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {historySearch.trim() ? 'No chats match your search.' : 'No previous chats yet.'}
          </p>
        ) : (
          <div className="space-y-4 p-2 pb-4">
            {grouped.map((section) => (
              <div key={section.group}>
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.conversations.map((conversation) => (
                    <div key={conversation.id} className="group relative">
                      <AgentConversationItem
                        conversation={conversation}
                        conversationId={conversationId}
                        isConversationLoading={isConversationLoading}
                        loadingConversationId={loadingConversationId}
                        editingConversationId={editingConversationId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        onSelectConversation={onSelectConversation}
                        onUpdateConversationTitle={onUpdateConversationTitle}
                        onDeleteConversation={onDeleteConversation}
                        onStartEditing={onStartEditing}
                        onStopEditing={onStopEditing}
                      />
                      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex group-focus-within:flex">
                        {onDuplicateConversation ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Duplicate chat"
                            onClick={(event) => {
                              event.stopPropagation()
                              onDuplicateConversation(conversation.id)
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        {onExportConversation ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Export chat"
                            onClick={(event) => {
                              event.stopPropagation()
                              onExportConversation(conversation.id)
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        {onShareConversation ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Share chat"
                            onClick={(event) => {
                              event.stopPropagation()
                              onShareConversation(conversation.id)
                            }}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={conversation.pinnedAt ? 'Unpin chat' : 'Pin chat'}
                          onClick={(event) => {
                            event.stopPropagation()
                            onPinConversation(conversation.id, !conversation.pinnedAt)
                          }}
                        >
                          {conversation.pinnedAt ? (
                            <PinOff className="h-3.5 w-3.5" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7"
                          aria-label={conversation.archivedAt ? 'Restore chat' : 'Archive chat'}
                          onClick={(event) => {
                            event.stopPropagation()
                            onArchiveConversation(conversation.id, !conversation.archivedAt)
                          }}
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {historyHasMore ? (
              <div className="px-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isHistoryLoading}
                  onClick={onLoadMoreHistory}
                >
                  {isHistoryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
