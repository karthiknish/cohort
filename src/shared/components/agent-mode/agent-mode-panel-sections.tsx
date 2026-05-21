'use client'

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  AlertCircle,
  ArrowDown,
  Check,
  Clock,
  FileText,
  History,
  Loader2,
  Maximize2,
  PanelRight,
  PictureInPicture2,
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
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/shared/ui/sheet'
import { layoutLabel, panelUsesModalFocusTrap, type AgentPanelLayout } from '@/lib/agent-panel-layout'
import { VoiceInputButton } from '@/shared/ui/voice-input'
import type {
  AgentExecutionStep,
  AgentMessage,
  AgentPendingConfirmation,
  ConnectionStatus,
} from '@/shared/hooks/use-agent-mode'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import type { AgentAttachmentContext } from '@/lib/agent-attachments'
import type { AgentError } from '@/lib/agent-errors'
import { ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'
import { cn } from '@/lib/utils'

import { AgentHistoryRail } from './agent-history-rail'
import { AgentMessageCard } from './agent-message-card'
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
import { AttachmentKindIcon, getAttachmentKind } from '@/shared/ui/chat-media-gallery'
import { MentionDropdown, type MentionDropdownHandle, type MentionItem } from './mention-dropdown'
import { AgentMentionPills, splitAgentTextWithMentions } from './mention-highlights'
import type { AgentSuggestion } from '@/lib/agent-context'

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
const AGENT_TYPING_ICON = <Sparkles className="h-4 w-4 text-primary" aria-hidden />

const AGENT_PANEL_SURFACE =
  'relative bg-background before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:from-primary/[0.04] before:to-transparent'

const AGENT_MESSAGE_THREAD =
  'relative min-h-full bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_0)] [background-size:20px_20px]'

function stopPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

function startOfLocalDay(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

function formatMessageDayLabel(date: Date): string {
  const now = new Date()
  const todayStart = startOfLocalDay(now)
  const messageStart = startOfLocalDay(date)
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

  if (messageStart === todayStart) return 'Today'
  if (messageStart === yesterdayStart) return 'Yesterday'
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function messageDayKey(timestamp: Date): string {
  return String(startOfLocalDay(timestamp))
}

function AgentMessageDayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-border/60" />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

function AttachmentStatusBadge({ attachment }: { attachment: AgentAttachmentContext }) {
  if (attachment.extractionStatus === 'extracting') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Reading
      </span>
    )
  }

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

  const kind = getAttachmentKind({
    name: attachment.name,
    url: '#',
    type: attachment.mimeType,
  })

  return (
    <div key={attachment.id} className="rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/10">
            <AttachmentKindIcon kind={kind} className="h-4 w-4" />
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

export function AgentMessageAttachmentChips({
  attachments,
}: {
  attachments: AgentAttachmentContext[]
}) {
  if (attachments.length === 0) return null

  return (
    <ul className="mt-2.5 space-y-2" aria-label="Attached files">
      {attachments.map((attachment) => {
        const kind = getAttachmentKind({
          name: attachment.name,
          url: '#',
          type: attachment.mimeType,
        })

        return (
          <li
            key={attachment.id}
            className="flex items-start gap-2.5 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 text-left text-xs"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
              <AttachmentKindIcon kind={kind} className="h-4 w-4 opacity-90" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="truncate font-semibold">{attachment.name}</span>
                <AttachmentStatusBadge attachment={attachment} />
                <span className="text-[10px] opacity-75">{attachment.sizeLabel}</span>
              </span>
              {attachment.excerpt ? (
                <span className="mt-1 line-clamp-3 text-[11px] leading-relaxed opacity-85">
                  {attachment.excerpt}
                </span>
              ) : null}
            </span>
          </li>
        )
      })}
    </ul>
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
          <span>Reconnecting…</span>
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
        <span>Too many requests. Please wait <strong>{countdown}s</strong>…</span>
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
  maxLength,
  mentionListboxId,
  showMentions,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  inputRef: RefObject<HTMLTextAreaElement | null>
  placeholder: string
  disabled: boolean
  mentionLabels: string[]
  maxLength: number
  mentionListboxId?: string
  showMentions?: boolean
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

  const remaining = maxLength - value.length

  return (
    <div className="min-w-0 flex-1">
      <Textarea
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
        spellCheck
        autoGrow
        maxLength={maxLength}
        rows={1}
        role="combobox"
        aria-label="Agent message"
        aria-expanded={showMentions ?? false}
        aria-controls={showMentions && mentionListboxId ? mentionListboxId : undefined}
        aria-autocomplete="list"
      />

      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <p className="text-[10px] text-muted-foreground">
          <kbd className="rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]">Enter</kbd> send ·{' '}
          <kbd className="rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]">⇧ Enter</kbd> line
        </p>
        <span
          className={cn(
            'text-[10px] tabular-nums',
            remaining < 80 ? 'font-medium text-warning' : 'text-muted-foreground',
          )}
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </span>
      </div>

      {activeMentions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activeMentions.map((mention) => (
            <Badge key={mention} variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              @{mention}
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
  inputRef: RefObject<HTMLTextAreaElement | null>
  mentionLabels: string[]
  maxMessageLength: number
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
  onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onOpenFilePicker: () => void
  onCloseMentions: () => void
  onSelectMention: (item: MentionItem) => void
  onVoiceTranscript: (text: string) => void
  onVoiceInterim: (text: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  onSubmit: () => void
  quickSuggestions?: AgentSuggestion[]
  onSuggestionClick?: (suggestion: AgentSuggestion) => void
  mentionListboxId?: string
  mentionDropdownRef?: RefObject<MentionDropdownHandle | null>
}

const EMPTY_QUICK_SUGGESTIONS: AgentSuggestion[] = []

function SuggestionButton({
  suggestion,
  disabled,
  onSuggestionClick,
}: {
  suggestion: AgentSuggestion
  disabled: boolean
  onSuggestionClick: (suggestion: AgentSuggestion) => void
}) {
  const handleClick = useCallback(() => {
    onSuggestionClick(suggestion)
  }, [onSuggestionClick, suggestion])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="group rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-left text-xs font-medium shadow-sm transition-all hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      title={suggestion.prompt}
    >
      <span className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-primary/70 transition-colors group-hover:text-primary" aria-hidden />
        {suggestion.label}
      </span>
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
  maxMessageLength,
  mentionListboxId = 'agent-mention-listbox',
  mentionDropdownRef,
}: AgentComposerSectionProps) {
  const isCentered = layout === 'centered'

  return (
    <div
      className={cn(
        isCentered ? 'p-1' : 'relative border-t border-border/50 bg-muted/20 p-3',
        !isCentered &&
          'pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]',
      )}
    >
      <AttachmentList attachments={pendingAttachments} onRemoveAttachment={onRemoveAttachment} />

      <div className={cn('relative', isCentered && 'mx-auto max-w-xl')}>
        <MentionDropdown
          ref={mentionDropdownRef}
          listboxId={mentionListboxId}
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

        <div
          className={cn(
            'rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-shadow',
            'focus-within:border-primary/30 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/15',
            disabled && 'opacity-60',
          )}
        >
          <AgentComposerInput
            inputRef={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder={
              isCentered
                ? 'Create projects, run analytics, send messages, or navigate…'
                : 'Ask about tasks, projects, analytics, ads, or meetings…'
            }
            disabled={disabled}
            mentionLabels={mentionLabels}
            maxLength={maxMessageLength}
            mentionListboxId={mentionListboxId}
            showMentions={showMentions}
          />

          <div className="mt-2 flex items-center justify-end gap-1.5">
            <VoiceInputButton
              variant="standalone"
              showWaveform={false}
              onTranscript={onVoiceTranscript}
              onInterimTranscript={onVoiceInterim}
              disabled={disabled}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenFilePicker}
              disabled={disabled}
              className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Attach context files"
              title="Attach context files (⌘⇧U)"
            >
              {isExtractingAttachments ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              onClick={onSubmit}
              disabled={!inputValue.trim() || disabled}
              className="h-9 w-9 shrink-0 rounded-full bg-primary shadow-sm hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send message"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isCentered && quickSuggestions.length > 0 && onSuggestionClick ? (
        <div className="mx-auto mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
          {quickSuggestions.map((suggestion) => (
            <SuggestionButton
              key={suggestion.id}
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
  activeConversationTitle,
  messagesCount,
  showHistory,
  panelLayout,
  onClose,
  onStartNewChat,
  onToggleHistory,
  onSetPanelLayout,
}: {
  connectionStatus: ConnectionStatus
  conversationId: string | null
  activeConversationTitle?: string | null
  messagesCount: number
  showHistory: boolean
  panelLayout?: AgentPanelLayout
  onClose: () => void
  onStartNewChat: () => void
  onToggleHistory: () => void
  onSetPanelLayout?: (layout: AgentPanelLayout) => void
}) {
  const LayoutIcon =
    panelLayout === 'fullscreen' ? Maximize2 : panelLayout === 'compact' ? PictureInPicture2 : PanelRight

  const handlePanelLayoutChange = useCallback(
    (value: string) => {
      if (value === 'compact' || value === 'docked' || value === 'fullscreen') {
        onSetPanelLayout?.(value)
      }
    },
    [onSetPanelLayout],
  )

  return (
    <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-background to-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <span id="agent-mode-dialog-title" className="block text-sm font-semibold tracking-tight">
            Agent Mode
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {activeConversationTitle?.trim()
              ? activeConversationTitle
              : conversationId
                ? 'Active conversation'
                : 'Workspace assistant'}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {conversationId || messagesCount > 0 ? (
          <Button variant="outline" size="sm" onClick={onStartNewChat} className="h-8 gap-1.5 rounded-full px-3 text-xs">
            <SquarePen className="h-3.5 w-3.5" />
            New
          </Button>
        ) : null}

        <AnimatePresence>
          {connectionStatus !== 'connected' ? <ConnectionIndicator status={connectionStatus} /> : null}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleHistory}
          className={cn('h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring', showHistory && 'bg-muted')}
          aria-label="Toggle chat history"
          title="Chat history (⌘⇧H)"
        >
          <History className="h-4 w-4" />
        </Button>

        {onSetPanelLayout && panelLayout ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Panel layout: ${layoutLabel(panelLayout)}`}
                title={`Layout: ${layoutLabel(panelLayout)}`}
              >
                <LayoutIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuRadioGroup value={panelLayout} onValueChange={handlePanelLayoutChange}>
                <DropdownMenuRadioItem value="compact">Compact floating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="docked">Docked (keep dashboard visible)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fullscreen">Full screen</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close Agent Mode">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { AgentConversationItem, ConversationItem } from './agent-conversation-item'
export { AgentHistoryRail } from './agent-history-rail'

export function AgentEmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6',
        AGENT_PANEL_SURFACE,
      )}
    >
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg" aria-hidden />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/25">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden />
            </div>
          </div>
          <p className="text-xl font-semibold tracking-tight">What can I help with?</p>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Ask in plain language, attach files for context, or type{' '}
            <kbd className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]">@</kbd> to
            mention clients, projects, or teammates.
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}

function stepStatusIcon(status: AgentExecutionStep['status']) {
  if (status === 'completed') return <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
  if (status === 'failed') return <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden />
  if (status === 'active') return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
}

export function AgentExecutionTimeline({
  steps = [],
  label,
}: {
  steps?: AgentExecutionStep[]
  label: string
}) {
  if (steps.length === 0) {
    return <ChatTypingIndicator label={label} variant="bubble" icon={AGENT_TYPING_ICON} />
  }

  return (
    <div className="flex gap-3" role="status" aria-live="polite" aria-atomic="true">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border/60 bg-card/90 px-3 py-3 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <ol className="mt-2 space-y-2">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 shrink-0">{stepStatusIcon(step.status)}</span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'font-medium',
                    step.status === 'failed' && 'text-destructive',
                    step.status === 'active' && 'text-foreground',
                    step.status === 'completed' && 'text-foreground',
                    step.status === 'pending' && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.detail ? <span className="mt-0.5 block text-muted-foreground">{step.detail}</span> : null}
              </span>
            </li>
          ))}
        </ol>
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
  onRetryUserMessage,
  onConfirmPending,
  onUndoAction,
  processingSteps,
  processingLabel,
  scrollAreaRef,
  onMessagesScroll,
  showJumpToLatest,
  onJumpToLatest,
}: {
  isConversationLoading: boolean
  isProcessing: boolean
  mentionLabels: string[]
  messages: AgentMessage[]
  onRetryLastUserTurn?: () => void
  onRetryUserMessage?: (clientId: string, content: string) => void
  onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void
  onUndoAction?: (
    messageId: string,
    undoHint: NonNullable<AgentMessage['metadata']>['undoHint'],
  ) => void
  processingSteps: AgentExecutionStep[]
  processingLabel: string
  scrollAreaRef: RefObject<HTMLDivElement | null>
  onMessagesScroll: () => void
  showJumpToLatest: boolean
  onJumpToLatest: () => void
}) {
  return (
    <div className={cn('relative flex-1 min-h-0', AGENT_PANEL_SURFACE)}>
      <div
        className={cn('h-full overflow-y-auto px-4 py-5', AGENT_MESSAGE_THREAD)}
        ref={scrollAreaRef}
        onScroll={onMessagesScroll}
        onWheel={stopPropagation}
      >
        {isConversationLoading ? (
          <div className="flex h-full min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading conversation…</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4 pb-2">
            {messages.map((message, index) => {
              const timestamp =
                message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
              const dayKey = Number.isNaN(timestamp.getTime()) ? null : messageDayKey(timestamp)
              const previousMessage = index > 0 ? messages[index - 1] : null
              const previousTimestamp = previousMessage
                ? previousMessage.timestamp instanceof Date
                  ? previousMessage.timestamp
                  : new Date(previousMessage.timestamp)
                : null
              const previousDayKey =
                previousTimestamp && !Number.isNaN(previousTimestamp.getTime())
                  ? messageDayKey(previousTimestamp)
                  : null
              const showDayDivider = dayKey !== null && dayKey !== previousDayKey

              return (
                <Fragment key={message.clientId}>
                  {showDayDivider ? (
                    <AgentMessageDayDivider label={formatMessageDayLabel(timestamp)} />
                  ) : null}
                  <AgentMessageCard
                    message={message}
                    mentionLabels={mentionLabels}
                    isProcessing={isProcessing}
                    onRetryLastUserTurn={onRetryLastUserTurn}
                    onRetryUserMessage={onRetryUserMessage}
                    onConfirmPending={onConfirmPending}
                    onUndoAction={onUndoAction}
                  />
                </Fragment>
              )
            })}

            {isProcessing ? (
              <m.div initial={MOTION_FADE_IN} animate={MOTION_FADE_IN_VISIBLE} className="flex justify-start pt-1">
                <AgentExecutionTimeline steps={processingSteps} label={processingLabel} />
              </m.div>
            ) : null}
          </div>
        )}
      </div>

      {showJumpToLatest ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto h-8 gap-1.5 rounded-full border border-border/60 bg-background/95 px-4 shadow-lg backdrop-blur-sm"
            onClick={onJumpToLatest}
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
            Latest messages
          </Button>
        </div>
      ) : null}
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
      className="flex items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/[0.07] px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-sm text-destructive">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-medium">Message failed to send</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-8 gap-1.5 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10"
        aria-label="Retry sending failed message"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  )
}

export function AgentModePanelShell({
  isOpen,
  onOpenChange,
  panelLayout = 'docked',
  attachmentAccept,
  children,
  contextBanner,
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
  composerInputRef,
  onRequestClose,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRequestClose?: () => void
  panelLayout?: AgentPanelLayout
  attachmentAccept: string
  children: ReactNode
  contextBanner?: ReactNode
  fileInputRef: RefObject<HTMLInputElement | null>
  headerProps: ComponentProps<typeof AgentModeHeader>
  historyPanelProps: ComponentProps<typeof AgentHistoryRail>
  agentError?: AgentError | null
  lastFailedMessage?: string | null
  onClearError?: () => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void
  rateLimitCountdown?: number | null
  composerInputRef?: RefObject<HTMLTextAreaElement | null>
}) {
  const isFullscreen = panelLayout === 'fullscreen'
  const isCompact = panelLayout === 'compact'
  const isDocked = panelLayout === 'docked'
  const usesModal = panelUsesModalFocusTrap(panelLayout)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onRequestClose?.()
        return
      }
      onOpenChange(true)
    },
    [onOpenChange, onRequestClose],
  )

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      event.preventDefault()
      composerInputRef?.current?.focus()
    },
    [composerInputRef],
  )

  const handleInteractOutside = useCallback(
    (event: Event) => {
      if (!usesModal) {
        event.preventDefault()
      }
    },
    [usesModal],
  )

  const shellBody = (
    <>
        <input
          ref={fileInputRef}
          type="file"
          accept={attachmentAccept}
          multiple
          className="hidden"
          onChange={onFileSelection}
        />

        <AgentModeHeader {...headerProps} panelLayout={panelLayout} />
        {contextBanner}

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

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {historyPanelProps.showHistory ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px] md:hidden"
              aria-label="Close chat history"
              onClick={historyPanelProps.onClose}
            />
            <AgentHistoryRail
              {...historyPanelProps}
              layout="rail"
              className="max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[10001] max-md:border-r max-md:shadow-2xl"
            />
          </>
        ) : null}
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col transition-[opacity,filter]',
            historyPanelProps.showHistory && 'max-md:pointer-events-none max-md:opacity-40 max-md:blur-[1px]',
          )}
        >
          {children}
        </div>
      </div>
    </>
  )

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={usesModal}>
      <SheetContent
        side="right"
        showOverlay={usesModal}
        overlayClassName={cn(
          usesModal && 'bg-black/50',
          isDocked && 'bg-black/15 pointer-events-none',
          isCompact && 'bg-transparent pointer-events-none',
        )}
        aria-labelledby="agent-mode-dialog-title"
        className={cn(
          'z-[9999] flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden',
          isFullscreen &&
            'inset-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none border-0 sm:max-w-none',
          isDocked &&
            'inset-y-0 right-0 left-auto h-full w-[min(480px,42vw)] max-w-[520px] border-l border-border/60 shadow-2xl max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none',
          isCompact &&
            'inset-auto bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] top-auto left-auto h-[min(560px,calc(100dvh-5rem-env(safe-area-inset-bottom)))] w-[min(400px,calc(100vw-2rem))] max-w-[400px] rounded-2xl border border-border/60 shadow-2xl ring-1 ring-black/5 max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:ring-0',
        )}
        onOpenAutoFocus={handleOpenAutoFocus}
        onInteractOutside={handleInteractOutside}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onWheel={stopPropagation}
        onTouchMove={stopPropagation}
        onScroll={stopPropagation}
      >
        {shellBody}
      </SheetContent>
    </Sheet>
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
  onRetryUserMessage,
  onConfirmPending,
  onUndoAction,
  processingSteps,
  processingLabel,
  scrollAreaRef,
  onMessagesScroll,
  showJumpToLatest,
  onJumpToLatest,
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
  onRetryUserMessage?: (clientId: string, content: string) => void
  onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void
  onUndoAction?: (
    messageId: string,
    undoHint: NonNullable<AgentMessage['metadata']>['undoHint'],
  ) => void
  processingSteps: AgentExecutionStep[]
  processingLabel: string
  scrollAreaRef: RefObject<HTMLDivElement | null>
  onMessagesScroll: () => void
  showJumpToLatest: boolean
  onJumpToLatest: () => void
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
        onRetryUserMessage={onRetryUserMessage}
        onConfirmPending={onConfirmPending}
        onUndoAction={onUndoAction}
        processingSteps={processingSteps}
        processingLabel={processingLabel}
        scrollAreaRef={scrollAreaRef}
        onMessagesScroll={onMessagesScroll}
        showJumpToLatest={showJumpToLatest}
        onJumpToLatest={onJumpToLatest}
      />

      {!isProcessing ? <FailedMessageBanner lastFailedMessage={lastFailedMessage} onRetry={onRetry} /> : null}

      <AgentComposerSection {...dockComposerProps} />
    </>
  )
}
