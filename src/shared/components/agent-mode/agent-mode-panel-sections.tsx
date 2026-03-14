'use client'

import {
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
  Upload,
  WifiOff,
  X,
} from 'lucide-react'
import { AnimatePresence, m } from 'framer-motion'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { VoiceInputButton } from '@/shared/ui/voice-input'
import type { AgentConversationSummary, AgentMessage, ConnectionStatus } from '@/shared/hooks/use-agent-mode'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import type { AgentAttachmentContext } from '@/lib/agent-attachments'
import { cn } from '@/lib/utils'

import { AgentMessageCard } from './agent-message-card'
import { MentionDropdown, type MentionItem } from './mention-dropdown'
import { splitAgentTextWithMentions } from './mention-highlights'

type MentionDropdownProps = ComponentProps<typeof MentionDropdown>

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
    return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Ready</span>
  }

  if (attachment.extractionStatus === 'limited') {
    return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Limited</span>
  }

  return <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">Needs Review</span>
}

function AttachmentDropzone({
  isDraggingFiles,
  isExtractingAttachments,
  onOpenFilePicker,
}: {
  isDraggingFiles: boolean
  isExtractingAttachments: boolean
  onOpenFilePicker: () => void
}) {
  return (
    <div
      className={cn(
        'mb-3 rounded-2xl border border-dashed px-4 py-3 transition-colors',
        isDraggingFiles ? 'border-primary bg-primary/5' : 'border-border/70 bg-background/70',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            {isExtractingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-medium">Drop docs here for context</p>
            <p className="text-xs text-muted-foreground">
              ODF, Office, text, and PDF files can be attached. The assistant uses them to draft tasks and projects, then asks follow-up questions if required details are still unclear.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full" onClick={onOpenFilePicker}>
          <Paperclip className="h-4 w-4" />
          Attach
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
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
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
              onClick={() => onRemoveAttachment(attachment.id)}
              aria-label={`Remove ${attachment.name}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') return null

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        status === 'retrying' && 'bg-amber-100 text-amber-700',
        status === 'disconnected' && 'bg-red-100 text-red-700',
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm"
    >
      <div className="flex items-center gap-2 text-amber-700">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Too many requests. Please wait <strong>{countdown}s</strong>...</span>
      </div>
      {onDismiss ? (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-amber-700 hover:text-amber-800">
          Dismiss
        </Button>
      ) : null}
    </m.div>
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
  isDraggingFiles: boolean
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
  isDraggingFiles,
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
  quickSuggestions = [],
  onSuggestionClick,
}: AgentComposerSectionProps) {
  const isCentered = layout === 'centered'

  return (
    <div className={cn(isCentered ? 'rounded-2xl border bg-background p-3' : 'relative border-t bg-muted/30 p-3')}>
      <AttachmentDropzone
        isDraggingFiles={isDraggingFiles}
        isExtractingAttachments={isExtractingAttachments}
        onOpenFilePicker={onOpenFilePicker}
      />
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
          title="Attach context files"
        >
          {isExtractingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>

        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!inputValue.trim() || disabled}
          className="h-10 w-10 shrink-0 rounded-full"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isCentered && quickSuggestions.length > 0 && onSuggestionClick ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              disabled={disabled}
              className="rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              {suggestion}
            </button>
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
        <span className="text-sm font-semibold">Agent Mode</span>
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
              <div
                key={conversation.id}
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
                        onChange={(event) => setEditingTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            onUpdateConversationTitle(conversation.id, editingTitle)
                            onStopEditing()
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault()
                            onStopEditing()
                          }
                        }}
                        className="h-8"
                        placeholder="Chat title"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isConversationLoading) return
                          onSelectConversation(conversation.id)
                          onClose()
                        }}
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
                        onClick={() => {
                          onUpdateConversationTitle(conversation.id, editingTitle)
                          onStopEditing()
                        }}
                        aria-label="Save title"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onStartEditing(conversation.id, conversation.title || '')}
                        aria-label="Edit title"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDeleteConversation(conversation.id)}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
  scrollAreaRef,
}: {
  isConversationLoading: boolean
  isProcessing: boolean
  mentionLabels: string[]
  messages: AgentMessage[]
  scrollAreaRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef} onWheel={(event) => event.stopPropagation()}>
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
            <AgentMessageCard key={message.id} message={message} mentionLabels={mentionLabels} />
          ))}

          {isProcessing ? (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
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
    <div className="flex items-center justify-between gap-3 border-t bg-red-50 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-red-700">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>Message failed to send</span>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="h-8 gap-2 border-red-200 text-red-700 hover:bg-red-100">
        <RefreshCw className="h-3.5 w-3.5" />
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
  onClearError?: () => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void
  rateLimitCountdown?: number | null
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: motionDurationSeconds.fast, ease: motionEasing.out }}
      className="fixed inset-0 z-[9999] flex h-screen flex-col bg-background"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onScroll={(event) => event.stopPropagation()}
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
        scrollAreaRef={scrollAreaRef}
      />

      {!isProcessing ? <FailedMessageBanner lastFailedMessage={lastFailedMessage} onRetry={onRetry} /> : null}

      <AgentComposerSection {...dockComposerProps} />
    </>
  )
}