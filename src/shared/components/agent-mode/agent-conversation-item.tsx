'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  Archive,
  Check,
  Copy,
  Download,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import type { AgentConversationSummary } from '@/shared/hooks/use-agent-mode'
import { cn, formatRelativeTime } from '@/lib/utils'

function stopPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

export type AgentConversationItemProps = {
  conversation: AgentConversationSummary
  conversationId: string | null
  isConversationLoading: boolean
  loadingConversationId: string | null
  editingConversationId: string | null
  editingTitle: string
  setEditingTitle: (value: string) => void
  onSelectConversation: (conversationId: string) => void
  onUpdateConversationTitle: (conversationId: string, title: string) => void
  onDeleteConversation: (conversationId: string) => void
  onClose?: () => void
  onStartEditing: (conversationId: string, title: string) => void
  onStopEditing: () => void
  variant?: 'default' | 'rail'
  onPinConversation?: (conversationId: string, pinned: boolean) => void
  onArchiveConversation?: (conversationId: string, archived: boolean) => void
  onDuplicateConversation?: (conversationId: string) => void
  onExportConversation?: (conversationId: string) => void
  onShareConversation?: (conversationId: string) => void
}

export function AgentConversationItem({
  conversation,
  conversationId,
  isConversationLoading,
  loadingConversationId,
  editingConversationId,
  editingTitle,
  setEditingTitle,
  onSelectConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  onClose,
  onStartEditing,
  onStopEditing,
  variant = 'default',
  onPinConversation,
  onArchiveConversation,
  onDuplicateConversation,
  onExportConversation,
  onShareConversation,
}: AgentConversationItemProps) {
  const isRail = variant === 'rail'
  const isActive = conversation.id === conversationId
  const isLoadingThis =
    isConversationLoading && conversation.id === loadingConversationId
  const isEditing = editingConversationId === conversation.id

  const handleChangeTitle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEditingTitle(event.target.value),
    [setEditingTitle],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        onUpdateConversationTitle(conversation.id, editingTitle)
        onStopEditing()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onStopEditing()
      }
    },
    [conversation.id, editingTitle, onUpdateConversationTitle, onStopEditing],
  )

  const handleSelect = useCallback(() => {
    if (isConversationLoading) return
    onSelectConversation(conversation.id)
    onClose?.()
  }, [isConversationLoading, onSelectConversation, conversation.id, onClose])

  const handleSaveTitle = useCallback(() => {
    onUpdateConversationTitle(conversation.id, editingTitle)
    onStopEditing()
  }, [onUpdateConversationTitle, conversation.id, editingTitle, onStopEditing])

  const handleStartEditing = useCallback(() => {
    onStartEditing(conversation.id, conversation.title || '')
  }, [onStartEditing, conversation.id, conversation.title])

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleDelete = useCallback(() => {
    setConfirmDeleteOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    onDeleteConversation(conversation.id)
    setConfirmDeleteOpen(false)
  }, [onDeleteConversation, conversation.id])

  const handlePinConversation = useCallback(() => {
    onPinConversation?.(conversation.id, !conversation.pinnedAt)
  }, [conversation.id, conversation.pinnedAt, onPinConversation])

  const handleDuplicateConversation = useCallback(() => {
    onDuplicateConversation?.(conversation.id)
  }, [conversation.id, onDuplicateConversation])

  const handleExportConversation = useCallback(() => {
    onExportConversation?.(conversation.id)
  }, [conversation.id, onExportConversation])

  const handleShareConversation = useCallback(() => {
    onShareConversation?.(conversation.id)
  }, [conversation.id, onShareConversation])

  const handleArchiveConversation = useCallback(() => {
    onArchiveConversation?.(conversation.id, !conversation.archivedAt)
  }, [conversation.archivedAt, conversation.id, onArchiveConversation])

  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) return
    titleInputRef.current?.focus()
  }, [isEditing])

  const relativeTime =
    conversation.lastMessageAt && !Number.isNaN(new Date(conversation.lastMessageAt).getTime())
      ? formatRelativeTime(new Date(conversation.lastMessageAt))
      : null

  const title = conversation.title?.trim() || 'Untitled chat'

  const menu = isRail ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 shrink-0 rounded-full text-muted-foreground',
            'opacity-100 focus-visible:opacity-100',
            'md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
            isActive && 'md:opacity-100',
          )}
          aria-label={`Actions for ${title}`}
          onClick={stopPropagation}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={stopPropagation}>
        <DropdownMenuItem onClick={handleStartEditing}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        {onPinConversation ? (
          <DropdownMenuItem onClick={handlePinConversation}>
            {conversation.pinnedAt ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Pin
              </>
            )}
          </DropdownMenuItem>
        ) : null}
        {onDuplicateConversation ? (
          <DropdownMenuItem onClick={handleDuplicateConversation}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
        ) : null}
        {onExportConversation ? (
          <DropdownMenuItem onClick={handleExportConversation}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </DropdownMenuItem>
        ) : null}
        {onShareConversation ? (
          <DropdownMenuItem onClick={handleShareConversation}>
            <Link2 className="mr-2 h-4 w-4" />
            Share link
          </DropdownMenuItem>
        ) : null}
        {onArchiveConversation ? (
          <DropdownMenuItem onClick={handleArchiveConversation}>
            <Archive className="mr-2 h-4 w-4" />
            {conversation.archivedAt ? 'Restore' : 'Archive'}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex shrink-0 items-center gap-0.5">
      {isEditing ? (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveTitle} aria-label="Save title">
          <Check className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStartEditing} aria-label="Edit title">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete} aria-label="Delete chat">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div
      className={cn(
        'group relative w-full rounded-xl text-sm transition-colors',
        isRail ? 'px-1.5 py-0.5' : 'px-3 py-2.5',
        !isEditing && !isActive && 'hover:bg-muted/60',
        isActive &&
          'bg-primary/[0.07] ring-1 ring-primary/20',
        conversation.archivedAt && 'opacity-80',
      )}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 px-2 py-2">
          <Input
            ref={titleInputRef}
            value={editingTitle}
            onChange={handleChangeTitle}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1"
            placeholder="Chat title"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleSaveTitle} aria-label="Save title">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-stretch gap-1 px-1.5 py-2">
          <button
            type="button"
            onClick={handleSelect}
            disabled={isConversationLoading}
            className={cn(
              'min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isConversationLoading && 'cursor-wait opacity-70',
            )}
            aria-current={isActive ? 'true' : undefined}
          >
            <div className="flex items-start gap-2">
              {conversation.pinnedAt ? (
                <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn('truncate font-medium leading-snug', isActive && 'text-foreground')}>
                    {title}
                  </span>
                  {isLoadingThis ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                  ) : relativeTime ? (
                    <span
                      className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {relativeTime}
                    </span>
                  ) : null}
                </div>
                {conversation.previewSnippet ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {conversation.previewSnippet}
                  </p>
                ) : typeof conversation.messageCount === 'number' && conversation.messageCount > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {conversation.messageCount} message{conversation.messageCount === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
          {menu}
        </div>
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent onClick={stopPropagation}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the conversation and its messages from your history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** @deprecated Use AgentConversationItem */
export const ConversationItem = AgentConversationItem
