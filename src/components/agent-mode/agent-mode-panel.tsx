'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react'
import { Send, X, Sparkles, Loader2, History, Pencil, Trash2, Check, RefreshCw, Clock, WifiOff, SquarePen } from 'lucide-react'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { useMentionData } from '@/hooks/use-mention-data'
import { VoiceInputButton } from '@/components/ui/voice-input'
import { MentionDropdown, formatMention, type MentionItem } from './mention-dropdown'
import { AgentMessageCard } from './agent-message-card'
import { splitAgentTextWithMentions } from './mention-highlights'
import type { AgentConversationSummary, AgentMessage, ConnectionStatus } from '@/hooks/use-agent-mode'
import type { AgentError } from '@/lib/agent-errors'

interface AgentModePanelProps {
  isOpen: boolean
  onClose: () => void
  messages: AgentMessage[]
  isProcessing: boolean
  onSendMessage: (text: string) => void
  onClear: () => void
  conversationId: string | null
  history: AgentConversationSummary[]
  isHistoryLoading: boolean
  isConversationLoading?: boolean
  loadingConversationId?: string | null
  onOpenHistory: () => void
  onSelectConversation: (conversationId: string) => void
  onUpdateConversationTitle: (conversationId: string, title: string) => void
  onDeleteConversation: (conversationId: string) => void
  // Error handling props
  error?: AgentError | null
  onClearError?: () => void
  lastFailedMessage?: string | null
  onRetry?: () => void
  connectionStatus?: ConnectionStatus
  rateLimitCountdown?: number | null
}

const QUICK_SUGGESTIONS = [
  'Schedule a meeting',
  'Start a quick meet',
  'Open Ads Hub',
  'Sync ad campaigns',
  'Generate weekly report',
  'Show my Tasks',
]

// Skeleton component for loading states
function HistorySkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`history-skeleton-${i}`} className="animate-pulse">
          <div className="h-12 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

// Connection status indicator
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') return null
  
  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full',
        status === 'retrying' && 'bg-amber-100 text-amber-700',
        status === 'disconnected' && 'bg-red-100 text-red-700'
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

// Rate limit banner
function RateLimitBanner({ countdown, onDismiss }: { countdown: number; onDismiss?: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm"
    >
      <div className="flex items-center gap-2 text-amber-700">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Too many requests. Please wait <strong>{countdown}s</strong>...</span>
      </div>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-amber-700 hover:text-amber-800">
          Dismiss
        </Button>
      )}
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

export function AgentModePanel({
  isOpen,
  onClose,
  messages,
  isProcessing,
  onSendMessage,
  onClear,
  conversationId,
  history,
  isHistoryLoading,
  isConversationLoading = false,
  loadingConversationId = null,
  onOpenHistory,
  onSelectConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  // Error handling props
  onClearError,
  lastFailedMessage,
  onRetry,
  connectionStatus = 'connected',
  rateLimitCountdown,
}: AgentModePanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch data for mentions
  const { clients, projects, teams, users, allItems, isLoading: mentionsLoading } = useMentionData()
  const mentionLabels = useMemo(() => allItems.map((item) => item.name), [allItems])

  const handleVoiceTranscript = useCallback((text: string) => {
    if (text.trim()) {
      onSendMessage(text)
      setInputValue('')
    }
  }, [onSendMessage])

  const handleVoiceInterim = useCallback((text: string) => {
    setInputValue(text)
  }, [])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Fetch history when the history dropdown opens
  useEffect(() => {
    if (showHistory) {
      onOpenHistory()
    }
  }, [showHistory, onOpenHistory])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])



  const handleSubmit = () => {
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      setShowMentions(false)
    }
  }

  // Detect @ character and extract query
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Check for @ mention trigger
    const cursorPos = e.target.selectionStart ?? value.length
    const textBeforeCursor = value.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      // Check if @ is at start or preceded by space
      const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' '
      if (charBefore === ' ' || atIndex === 0) {
        const query = textBeforeCursor.slice(atIndex + 1)
        // Only show dropdown if query doesn't contain space (still typing mention)
        if (!query.includes(' ')) {
          setMentionQuery(query)
          setShowMentions(true)
          return
        }
      }
    }
    setShowMentions(false)
  }, [])

  // Handle mention selection
  const handleMentionSelect = useCallback((item: MentionItem) => {
    // Find the @ position and replace with formatted mention
    const cursorPos = inputRef.current?.selectionStart ?? inputValue.length
    const textBeforeCursor = inputValue.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const beforeMention = inputValue.slice(0, atIndex)
      const afterMention = inputValue.slice(cursorPos)
      const insertedMention = `${formatMention(item)} `
      const newValue = `${beforeMention}${insertedMention}${afterMention}`
      const nextCursorPos = beforeMention.length + insertedMention.length
      setInputValue(newValue)

      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(nextCursorPos, nextCursorPos)
      })
    }

    setShowMentions(false)
  }, [inputValue])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Don't handle Enter/Escape if mention dropdown is open (it handles them)
    if (showMentions && ['Enter', 'ArrowUp', 'ArrowDown', 'Tab', 'Escape'].includes(e.key)) {
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
  }

  const handleRetry = () => {
    onClearError?.()
    onRetry?.()
  }

  const handleStartNewChat = useCallback(() => {
    onClear()
    setInputValue('')
    setShowMentions(false)
    setMentionQuery('')
    setShowHistory(false)
    setEditingConversationId(null)
    setEditingTitle('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [onClear])

  const showEmptyState = messages.length === 0 && !isConversationLoading

  const toggleHistory = () => setShowHistory((prev) => !prev)

  // Check if input is disabled (rate limited or processing)
  const isInputDisabled = isProcessing || (typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0)

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: motionDurationSeconds.fast, ease: motionEasing.out }}
            className="fixed inset-0 z-[9999] flex flex-col bg-background h-screen"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Agent Mode</span>
            </div>
            <div className="flex items-center gap-2">
              {(conversationId || messages.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartNewChat}
                  className="h-9 gap-2 rounded-full"
                >
                  <SquarePen className="h-4 w-4" />
                  New chat
                </Button>
              )}

              <AnimatePresence>
                {connectionStatus !== 'connected' && (
                  <ConnectionIndicator status={connectionStatus} />
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHistory}
                className={cn('h-9 w-9 rounded-full', showHistory && 'bg-muted')}
                aria-label="Toggle chat history"
              >
                <History className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full"
                aria-label="Close Agent Mode"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rate limit banner */}
          <AnimatePresence>
            {typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0 && (
              <RateLimitBanner countdown={rateLimitCountdown} onDismiss={onClearError} />
            )}
          </AnimatePresence>

          {showHistory && (
            <div className="absolute right-4 top-[60px] z-50 w-[340px] overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-medium">Previous chats</p>
                <div className="flex items-center gap-2">
                  {(conversationId || messages.length > 0) && (
                    <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={handleStartNewChat}>
                      <SquarePen className="h-3.5 w-3.5" />
                      New
                    </Button>
                  )}
                  {isHistoryLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <ScrollArea className="max-h-[320px]">
                {isHistoryLoading ? (
                  <HistorySkeleton />
                ) : history.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground text-center">No previous chats yet.</p>
                ) : (
                  <div className="p-2">
                    {history.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                          c.id === conversationId && 'bg-muted'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {editingConversationId === c.id ? (
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    onUpdateConversationTitle(c.id, editingTitle)
                                    setEditingConversationId(null)
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setEditingConversationId(null)
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
                                  onSelectConversation(c.id)
                                  setShowHistory(false)
                                }}
                                className="w-full min-w-0 text-left disabled:cursor-wait"
                                disabled={isConversationLoading}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate font-medium">{c.title || 'Chat'}</span>
                                  {isConversationLoading && c.id === loadingConversationId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                  ) : c.lastMessageAt && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {new Date(c.lastMessageAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </button>
                            )}

                            {typeof c.messageCount === 'number' && (
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {c.messageCount} messages
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {editingConversationId === c.id ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  onUpdateConversationTitle(c.id, editingTitle)
                                  setEditingConversationId(null)
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
                                onClick={() => {
                                  setEditingConversationId(c.id)
                                  setEditingTitle(c.title || '')
                                }}
                                aria-label="Edit title"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                onDeleteConversation(c.id)
                              }}
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
          )}

          {/* Main content */}
          {showEmptyState ? (
            <div className="flex-1 flex items-center justify-center p-6">
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

                {/* Input (centered) */}
                <div className="relative rounded-2xl border bg-background p-3">
                  {/* Mention Dropdown */}
                  <MentionDropdown
                    isOpen={showMentions}
                    onClose={() => setShowMentions(false)}
                    onSelect={handleMentionSelect}
                    searchQuery={mentionQuery}
                    clients={clients}
                    projects={projects}
                    teams={teams}
                    users={users}
                    isLoading={mentionsLoading}
                  />

                  <div className="flex items-center gap-2">
                    <AgentComposerInput
                      inputRef={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe what you want to do..."
                      disabled={isInputDisabled}
                      mentionLabels={mentionLabels}
                    />

                    <VoiceInputButton
                      variant="standalone"
                      showWaveform={false}
                      onTranscript={handleVoiceTranscript}
                      onInterimTranscript={handleVoiceInterim}
                      disabled={isInputDisabled}
                    />

                    <Button
                      size="icon"
                      onClick={handleSubmit}
                      disabled={!inputValue.trim() || isInputDisabled}
                      className="h-10 w-10 shrink-0 rounded-full"
                      title="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>



                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isInputDisabled}
                        className="rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef} onWheel={(e) => e.stopPropagation()}>
                {isConversationLoading ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading previous chat…</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <AgentMessageCard key={msg.id} message={msg} mentionLabels={mentionLabels} />
                    ))}

                    {isProcessing && (
                      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-foreground">Thinking...</span>
                        </div>
                      </m.div>
                    )}
                  </div>
                )}
              </div>

              {/* Retry banner for failed messages */}
              {lastFailedMessage && !isProcessing && (
                <div className="flex items-center justify-between gap-3 border-t bg-red-50 px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    <span>Message failed to send</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="h-8 gap-2 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}



              {/* Input */}
              <div className="relative flex items-center gap-2 border-t bg-muted/30 p-3">
                {/* Mention Dropdown */}
                <MentionDropdown
                  isOpen={showMentions}
                  onClose={() => setShowMentions(false)}
                  onSelect={handleMentionSelect}
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
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask naturally, or use @ to mention context"
                  disabled={isInputDisabled || isConversationLoading}
                  mentionLabels={mentionLabels}
                />

                <VoiceInputButton
                  variant="standalone"
                  showWaveform={false}
                  onTranscript={handleVoiceTranscript}
                  onInterimTranscript={handleVoiceInterim}
                  disabled={isInputDisabled || isConversationLoading}
                />

                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isInputDisabled || isConversationLoading}
                  className="h-10 w-10 shrink-0 rounded-full"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
