'use client'

import { useCallback, useMemo, type ChangeEvent } from 'react'
import {
  AlertCircle,
  Archive,
  Loader2,
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

export type AgentHistoryRailProps = {
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
  className?: string
}

function HistorySkeleton() {
  return (
    <div className="space-y-2 p-3">
      {['history-skeleton-1', 'history-skeleton-2', 'history-skeleton-3', 'history-skeleton-4'].map((key) => (
        <div key={key} className="animate-pulse rounded-xl bg-muted/70 px-3 py-3">
          <div className="mb-2 h-3 w-2/3 rounded bg-muted-foreground/20" />
          <div className="h-2.5 w-full rounded bg-muted-foreground/15" />
        </div>
      ))}
    </div>
  )
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
  className,
}: AgentHistoryRailProps) {
  const grouped = useMemo(
    () => groupAgentHistory(history, { includeArchived: showArchivedHistory }),
    [history, showArchivedHistory],
  )

  const totalVisible = useMemo(
    () => grouped.reduce((sum, section) => sum + section.conversations.length, 0),
    [grouped],
  )

  const handleHistorySearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onHistorySearchChange(event.target.value)
    },
    [onHistorySearchChange],
  )

  const handleToggleArchivedHistory = useCallback(() => {
    onShowArchivedHistoryChange(!showArchivedHistory)
  }, [onShowArchivedHistoryChange, showArchivedHistory])

  const handleSelectConversation = useCallback(
    (id: string) => {
      onSelectConversation(id)
      onClose()
    },
    [onClose, onSelectConversation],
  )

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col border-border bg-muted/20',
        layout === 'rail'
          ? 'w-[min(280px,36vw)] shrink-0 border-r max-md:shadow-xl'
          : 'w-full border-b',
        className,
      )}
      aria-label="Chat history"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/90 px-3 py-2.5 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">Chats</p>
          {totalVisible > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              {totalVisible} conversation{totalVisible === 1 ? '' : 's'}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isHistoryLoading && history.length > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Refreshing chats" />
          ) : null}
          {conversationId || messagesCount > 0 ? (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full px-2.5 text-xs" onClick={onStartNewChat}>
              <SquarePen className="h-3.5 w-3.5" />
              New
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose} aria-label="Close history">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-b border-border/50 px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            value={historySearch}
            onChange={handleHistorySearchChange}
            placeholder="Search chats…"
            className="h-9 rounded-full border-border/70 bg-background pl-8 text-sm"
            aria-label="Search chat history"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant={showArchivedHistory ? 'secondary' : 'outline'}
          className="h-7 gap-1.5 rounded-full px-3 text-xs"
          onClick={handleToggleArchivedHistory}
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchivedHistory ? 'Showing archived' : 'Archived'}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {historyError ? (
          <div className="m-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Could not load chats</p>
                <p className="mt-1 text-xs text-muted-foreground">{historyError}</p>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" className="mt-3 gap-2 rounded-full" onClick={onRetryHistory}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : isHistoryLoading && history.length === 0 ? (
          <HistorySkeleton />
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              {historySearch.trim() ? 'No matches' : 'No chats yet'}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {historySearch.trim()
                ? 'Try a different title or snippet from a past message.'
                : 'Start a new conversation — your history will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-2 pb-4">
            {grouped.map((section) => (
              <div key={section.group}>
                <p className="sticky top-0 z-[1] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90 backdrop-blur-sm">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.conversations.map((conversation) => (
                    <AgentConversationItem
                      key={conversation.id}
                      variant="rail"
                      conversation={conversation}
                      conversationId={conversationId}
                      isConversationLoading={isConversationLoading}
                      loadingConversationId={loadingConversationId}
                      editingConversationId={editingConversationId}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelectConversation={handleSelectConversation}
                      onUpdateConversationTitle={onUpdateConversationTitle}
                      onDeleteConversation={onDeleteConversation}
                      onStartEditing={onStartEditing}
                      onStopEditing={onStopEditing}
                      onPinConversation={onPinConversation}
                      onArchiveConversation={onArchiveConversation}
                      onDuplicateConversation={onDuplicateConversation}
                      onExportConversation={onExportConversation}
                      onShareConversation={onShareConversation}
                    />
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
                  className="w-full rounded-full"
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
