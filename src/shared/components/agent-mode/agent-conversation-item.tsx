'use client'

import { useCallback, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Check, Loader2, Pencil, Trash2 } from 'lucide-react'

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
import { Input } from '@/shared/ui/input'
import type { AgentConversationSummary } from '@/shared/hooks/use-agent-mode'
import { cn } from '@/lib/utils'

function stopPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
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
}: {
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
}) {
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

  return (
    <div
      className={cn(
        'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
        'hover:bg-muted/70',
        conversation.id === conversationId &&
          'border-l-2 border-primary bg-primary/[0.06] pl-[calc(0.75rem-2px)] shadow-sm',
        conversation.id !== conversationId && 'border-l-2 border-transparent',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editingConversationId === conversation.id ? (
            <Input
              value={editingTitle}
              onChange={handleChangeTitle}
              onKeyDown={handleKeyDown}
              className="h-8"
              placeholder="Chat title"
            />
          ) : (
            <button
              type="button"
              onClick={handleSelect}
              className="w-full min-w-0 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
              disabled={isConversationLoading}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{conversation.title || 'Chat'}</span>
                {isConversationLoading && conversation.id === loadingConversationId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : conversation.lastMessageAt ? (
                  <span className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(conversation.lastMessageAt).toLocaleString()}
                  </span>
                ) : null}
              </div>
              {conversation.previewSnippet ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{conversation.previewSnippet}</p>
              ) : null}
            </button>
          )}

          {typeof conversation.messageCount === 'number' ? (
            <div className="mt-0.5 text-xs text-muted-foreground">{conversation.messageCount} messages</div>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {editingConversationId === conversation.id ? (
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
      </div>

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
