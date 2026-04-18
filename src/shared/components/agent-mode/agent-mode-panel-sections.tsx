'use client'

import {
  useCallback,
  useMemo,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  AlertCircle,
  Check,
  Clock,
  FileText,
  History,
  Loader2,
  Paperclip,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  SquarePen,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react'
import { AnimatePresence, m } from '@/shared/ui/motion'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { VoiceInputButton } from '@/shared/ui/voice-input'
import type { AgentConversationSummary, AgentMessage, ConnectionStatus } from '@/shared/hooks/use-agent-mode'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import type { AgentAttachmentContext } from '@/lib/agent-attachments'
import type { AgentError } from '@/lib/agent-errors'
import { ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'
import { cn } from '@/lib/utils'

import { AgentMessageCard } from './agent-message-card'
import { MentionDropdown, type MentionItem } from './mention-dropdown'
import { splitAgentTextWithMentions } from './mention-highlights'

type MentionDropdownProps = ComponentProps<typeof MentionDropdown>

const MOTION_FADE_SLIDE_UP = { opacity: 0, y: -10 } as const
const MOTION_VISIBLE = { opacity: 1, y: 0 } as const
const MOTION_FADE_SLIDE_UP_EXIT = { opacity: 0, y: -10 } as const
const MOTION_FADE_IN = { opacity: 0 } as const
const MOTION_FADE_IN_VISIBLE = { opacity: 1 } as const
const MOTION_FADE_STILL = { opacity: 0, y: 0 } as const
const MOTION_FADE_STILL_VISIBLE = { opacity: 1, y: 0 } as const
const MOTION_FADE_STILL_EXIT = { opacity: 0, y: 0 } as const
const MOTION_PANEL_TRANSITION = { duration: motionDurationSeconds.fast, ease: motionEasing.out } as const

function stopPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

function HistorySkeleton() {
  return (
    <div className="space-y-2 p-2">
      {['history-skeleton-1', 'history-skeleton-2', 'history-skeleton-3'].map((key) => (
        <div key={key} className="animate-pulse">
          <div className="h-12 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

function AttachmentStatusBadge({ attachment }: { attachment: AgentAttachmentContext }) {
  if (attachment.extractionStatus === 'ready') {
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">Ready</span>
  }

  if (attachment.extractionStatus === 'limited') {
    return <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">Limited</span>
  }

  return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">Needs Review</span>
}

function AttachmentItem({
  attachment,
  onRemoveAttachment,
}: {
  attachment: AgentAttachmentContext
  onRemoveAttachment: (attachmentId: string) => void
}) {
  const handleRemove = useCallback(() => {
    onRemoveAttachment(attachment.id)
  }, [onRemoveAttachment, attachment.id])

  return (
    <div key={attachment.id} className="rounded-2xl border bg-card/70 px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium">{attachment.name}</p>
              <AttachmentStatusBadge attachment={attachment} />
              <span className="text-xs text-muted-foreground">{attachment.sizeLabel}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{attachment.excerpt}</p>
            {attachment.errorMessage ? (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-warning">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{attachment.errorMessage}</span>
              </div>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleRemove}
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AttachmentList({
  attachments,
  onRemoveAttachment,
}: {
  attachments: AgentAttachmentContext[]
  onRemoveAttachment: (attachmentId: string) => void
}) {
  if (attachments.length === 0) return null

  return (
    <div className="mb-3 space-y-2">
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} onRemoveAttachment={onRemoveAttachment} />
      ))}
    </div>
  )
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') return null

  return (
    <m.div
      role="status"
      aria-live="polite"
      initial={MOTION_FADE_SLIDE_UP}
      animate={MOTION_VISIBLE}
      exit={MOTION_FADE_SLIDE_UP_EXIT}
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        status === 'retrying' && 'bg-warning/10 text-warning',
        status === 'disconnected' && 'bg-destructive/10 text-destructive',
      )}
    >
      {status === 'retrying' ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Reconnecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </m.div>
  )
}

export function RateLimitBanner({ countdown, onDismiss }: { countdown: number; onDismiss?: () => void }) {
  return (
    <m.div
      role="status"
      aria-live="assertive"
      initial={MOTION_FADE_SLIDE_UP}
      animate={MOTION_VISIBLE}
      exit={MOTION_FADE_SLIDE_UP_EXIT}
    className="flex items-center justify-between gap-3 border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm"
  >
      <div className="flex items-center gap-2 text-warning">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Too many requests. Please wait <strong>{countdown}s</strong>...</span>
      </div>
      {onDismiss ? (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-warning hover:text-warning/80" aria-label="Dismiss rate limit notice">
          Dismiss
        </Button>
      ) : null}
    </m.div>
  )
}

export function AgentErrorBanner({
  error,
  lastFailedMessage,
  onDismiss,
}: {
  error: AgentError
  lastFailedMessage: string | null
  onDismiss: () => void
}) {
  if (lastFailedMessage) return null

  const text = error.type === 'validation' ? error.message : (ERROR_DISPLAY_MESSAGES[error.type] ?? error.message)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
    >
      <span className="min-w-0 flex-1">{text}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  )
}

function AgentComposerInput({
  value,
  onChange,
  onKeyDown,
  inputRef,
  placeholder,
  disabled,
  mentionLabels,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  placeholder: string
  disabled: boolean
  mentionLabels: string[]
}) {
  const activeMentions = useMemo(() => {
    const seen = new Set<string>()
    return splitAgentTextWithMentions(value, mentionLabels)
      .filter((segment) => segment.isMention)
      .map((segment) => segment.text)
      .filter((mention) => {
        if (seen.has(mention.toLowerCase())) return false
        seen.add(mention.toLowerCase())
        return true
      })
  }, [mentionLabels, value])

  return (
    <div className="flex-1 space-y-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="text-sm"
        disabled={disabled}
        spellCheck={false}
      />

      {activeMentions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeMentions.map((mention) => (
            <Badge key={mention} variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              {mention}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export type AgentComposerSectionProps = {
  layout: 'centered' | 'dock'
  inputValue: string
  inputRef: RefObject<HTMLInputElement | null>
  mentionLabels: string[]
  showMentions: boolean
  mentionQuery: string
  clients: MentionDropdownProps['clients']
  projects: MentionDropdownProps['projects']
  teams: MentionDropdownProps['teams']
  users: MentionDropdownProps['users']
  mentionsLoading: MentionDropdownProps['isLoading']
  pendingAttachments: AgentAttachmentContext[]
  isExtractingAttachments: boolean
  disabled: boolean
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onOpenFilePicker: () => void
  onCloseMentions: () => void
  onSelectMention: (item: MentionItem) => void
  onVoiceTranscript: (text: string) => void
  onVoiceInterim: (text: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  onSubmit: () => void
  quickSuggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
}

const EMPTY_QUICK_SUGGESTIONS: string[] = []

function SuggestionButton({
  suggestion,
  disabled,
  onSuggestionClick,
}: {
  suggestion: string
  disabled: boolean
  onSuggestionClick: (suggestion: string) => void
}) {
  const handleClick = useCallback(() => {
    onSuggestionClick(suggestion)
  }, [onSuggestionClick, suggestion])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
    >
      {suggestion}
    </button>
  )
}

export function AgentComposerSection({
  layout,
  inputValue,
  inputRef,
  mentionLabels,
  showMentions,
  mentionQuery,
  clients,
  projects,
  teams,
  users,
  mentionsLoading,
  pendingAttachments,
  isExtractingAttachments,
  disabled,
  onInputChange,
  onKeyDown,
  onOpenFilePicker,
  onCloseMentions,
  onSelectMention,
  onVoiceTranscript,
  onVoiceInterim,
  onRemoveAttachment,
  onSubmit,
  quickSuggestions = EMPTY_QUICK_SUGGESTIONS,
  onSuggestionClick,
}: AgentComposerSectionProps) {
  const isCentered = layout === 'centered'

  return (
    <div className={cn(isCentered ? 'rounded-2xl border bg-background p-3' : 'relative border-t bg-muted/30 p-3')}>
      <AttachmentList attachments={pendingAttachments} onRemoveAttachment={onRemoveAttachment} />

      <div className={cn('relative flex items-center gap-2', isCentered && 'justify-center')}>
        <MentionDropdown
          isOpen={showMentions}
          onClose={onCloseMentions}
          onSelect={onSelectMention}
          searchQuery={mentionQuery}
          clients={clients}
          projects={projects}
          teams={teams}
          users={users}
          isLoading={mentionsLoading}
        />

        <AgentComposerInput
          inputRef={inputRef}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder={isCentered ? 'Create projects, run analytics, send messages, or navigate...' : 'Ask naturally for project, analytics, ads, task, or meeting actions'}
          disabled={disabled}
          mentionLabels={mentionLabels}
        />

        <VoiceInputButton
          variant="standalone"
          showWaveform={false}
          onTranscript={onVoiceTranscript}
          onInterimTranscript={onVoiceInterim}
          disabled={disabled}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenFilePicker}
          disabled={disabled}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Attach context files"
          title="Attach context files"
        >
          {isExtractingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>

        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!inputValue.trim() || disabled}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Send message"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isCentered && quickSuggestions.length > 0 && onSuggestionClick ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {quickSuggestions.map((suggestion) => (
            <SuggestionButton
              key={suggestion}
              suggestion={suggestion}
              disabled={disabled}
              onSuggestionClick={onSuggestionClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function AgentModeHeader({
  connectionStatus,
  conversationId,
  messagesCount,
  showHistory,
  onClose,
  onStartNewChat,
  onToggleHistory,
}: {
  connectionStatus: ConnectionStatus
  conversationId: string | null
  messagesCount: number
  showHistory: boolean
  onClose: () => void
  onStartNewChat: () => void
  onToggleHistory: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span id="agent-mode-dialog-title" className="text-sm font-semibold">
          Agent Mode
        </span>
      </div>
      <div className="flex items-center gap-2">
        {conversationId || messagesCount > 0 ? (
          <Button variant="outline" size="sm" onClick={onStartNewChat} className="h-9 gap-2 rounded-full">
            <SquarePen className="h-4 w-4" />
            New chat
          </Button>
        ) : null}

        <AnimatePresence>
          {connectionStatus !== 'connected' ? <ConnectionIndicator status={connectionStatus} /> : null}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleHistory}
          className={cn('h-9 w-9 rounded-full', showHistory && 'bg-muted')}
          aria-label="Toggle chat history"
        >
          <History className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full" aria-label="Close Agent Mode">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ConversationItem({
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
  onClose: () => void
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
    onClose()
  }, [isConversationLoading, onSelectConversation, conversation.id, onClose])

  const handleSaveTitle = useCallback(() => {
    onUpdateConversationTitle(conversation.id, editingTitle)
    onStopEditing()
  }, [onUpdateConversationTitle, conversation.id, editingTitle, onStopEditing])

  const handleStartEditing = useCallback(() => {
    onStartEditing(conversation.id, conversation.title || '')
  }, [onStartEditing, conversation.id, conversation.title])

  const handleDelete = useCallback(() => {
    onDeleteConversation(conversation.id)
  }, [onDeleteConversation, conversation.id])

  return (
    <div
      className={cn(
        'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
        conversation.id === conversationId && 'bg-muted',
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
              className="w-full min-w-0 text-left disabled:cursor-wait"
              disabled={isConversationLoading}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{conversation.title || 'Chat'}</span>
                {isConversationLoading && conversation.id === loadingConversationId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : conversation.lastMessageAt ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(conversation.lastMessageAt).toLocaleString()}</span>
                ) : null}
              </div>
            </button>
          )}

          {typeof conversation.messageCount === 'number' ? (
            <div className="mt-0.5 text-xs text-muted-foreground">{conversation.messageCount} messages</div>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {editingConversationId === conversation.id ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSaveTitle}
              aria-label="Save title"
            >
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleStartEditing}
              aria-label="Edit title"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDelete}
            aria-label="Delete chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AgentHistoryPanel({
  showHistory,
  history,
  isHistoryLoading,
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
}: {
  showHistory: boolean
  history: AgentConversationSummary[]
  isHistoryLoading: boolean
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
}) {
  if (!showHistory) return null

  return (
    <div className="absolute right-4 top-[60px] z-50 w-[340px] overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-sm font-medium">Previous chats</p>
        <div className="flex items-center gap-2">
          {conversationId || messagesCount > 0 ? (
            <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={onStartNewChat}>
              <SquarePen className="h-3.5 w-3.5" />
              New
            </Button>
          ) : null}
          {isHistoryLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>
      </div>
      <ScrollArea className="max-h-[320px]">
        {isHistoryLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <p className="px-4 py-4 text-center text-sm text-muted-foreground">No previous chats yet.</p>
        ) : (
          <div className="p-2">
            {history.map((conversation) => (
              <ConversationItem
                key={conversation.id}
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
                onClose={onClose}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export function AgentEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-base font-medium">Where would you like to go?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask in plain language, or type @ to pick a client, user, project, or team.
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}

export function AgentMessagesSection({
  isConversationLoading,
  isProcessing,
  mentionLabels,
  messages,
  onRetryLastUserTurn,
  scrollAreaRef,
}: {
  isConversationLoading: boolean
  isProcessing: boolean
  mentionLabels: string[]
  messages: AgentMessage[]
  onRetryLastUserTurn?: () => void
  scrollAreaRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef} onWheel={stopPropagation}>
      {isConversationLoading ? (
        <div className="flex h-full min-h-[240px] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading previous chat…</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <AgentMessageCard
              key={message.id}
              message={message}
              mentionLabels={mentionLabels}
              onRetryLastUserTurn={onRetryLastUserTurn}
            />
          ))}

          {isProcessing ? (
            <m.div
              initial={MOTION_FADE_IN}
              animate={MOTION_FADE_IN_VISIBLE}
              className="flex justify-start"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="text-foreground">Thinking...</span>
              </div>
            </m.div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function FailedMessageBanner({
  lastFailedMessage,
  onRetry,
}: {
  lastFailedMessage: string | null
  onRetry: () => void
}) {
  if (!lastFailedMessage) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 border-t bg-destructive/10 px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-sm text-destructive">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span>Message failed to send</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-8 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
        aria-label="Retry sending failed message"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  )
}

export function AgentModePanelShell({
  attachmentAccept,
  children,
  fileInputRef,
  headerProps,
  historyPanelProps,
  agentError,
  lastFailedMessage,
  onClearError,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelection,
  rateLimitCountdown,
}: {
  attachmentAccept: string
  children: ReactNode
  fileInputRef: RefObject<HTMLInputElement | null>
  headerProps: ComponentProps<typeof AgentModeHeader>
  historyPanelProps: ComponentProps<typeof AgentHistoryPanel>
  agentError?: AgentError | null
  lastFailedMessage?: string | null
  onClearError?: () => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void
  rateLimitCountdown?: number | null
}) {
  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-mode-dialog-title"
      initial={MOTION_FADE_STILL}
      animate={MOTION_FADE_STILL_VISIBLE}
      exit={MOTION_FADE_STILL_EXIT}
      transition={MOTION_PANEL_TRANSITION}
      className="fixed inset-0 z-[9999] flex h-screen flex-col bg-background"
      onWheel={stopPropagation}
      onTouchMove={stopPropagation}
      onScroll={stopPropagation}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={attachmentAccept}
        multiple
        className="hidden"
        onChange={onFileSelection}
      />

      <AgentModeHeader {...headerProps} />

      {agentError && onClearError ? (
        <AgentErrorBanner
          error={agentError}
          lastFailedMessage={lastFailedMessage ?? null}
          onDismiss={onClearError}
        />
      ) : null}

      <AnimatePresence>
        {typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0 ? (
          <RateLimitBanner countdown={rateLimitCountdown} onDismiss={onClearError} />
        ) : null}
      </AnimatePresence>

      <AgentHistoryPanel {...historyPanelProps} />

      {children}
    </m.div>
  )
}

export function AgentModePanelContent({
  dockComposerProps,
  emptyComposerProps,
  isConversationLoading,
  isProcessing,
  lastFailedMessage,
  mentionLabels,
  messages,
  onRetry,
  onRetryLastUserTurn,
  scrollAreaRef,
  showEmptyState,
}: {
  dockComposerProps: AgentComposerSectionProps
  emptyComposerProps: AgentComposerSectionProps
  isConversationLoading: boolean
  isProcessing: boolean
  lastFailedMessage: string | null
  mentionLabels: string[]
  messages: AgentMessage[]
  onRetry: () => void
  onRetryLastUserTurn?: () => void
  scrollAreaRef: RefObject<HTMLDivElement | null>
  showEmptyState: boolean
}) {
  if (showEmptyState) {
    return (
      <AgentEmptyState>
        <AgentComposerSection {...emptyComposerProps} />
      </AgentEmptyState>
    )
  }

  return (
    <>
      <AgentMessagesSection
        isConversationLoading={isConversationLoading}
        isProcessing={isProcessing}
        mentionLabels={mentionLabels}
        messages={messages}
        onRetryLastUserTurn={onRetryLastUserTurn}
        scrollAreaRef={scrollAreaRef}
      />

      {!isProcessing ? <FailedMessageBanner lastFailedMessage={lastFailedMessage} onRetry={onRetry} /> : null}

      <AgentComposerSection {...dockComposerProps} />
    </>
  )
}
