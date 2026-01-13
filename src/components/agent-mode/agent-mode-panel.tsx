'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Mic, MicOff, Send, X, Sparkles, Loader2, History, Pencil, Trash2, Check, RefreshCw, Clock, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useMentionData } from '@/hooks/use-mention-data'
import { MentionDropdown, formatMention, type MentionItem } from './mention-dropdown'
import { VoiceWaveform } from './voice-waveform'
import { AgentMessageCard } from './agent-message-card'
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
  'Go to Analytics',
  'Show my Tasks',
  'Check Finance',
  'Open Proposals',
  'View Ads Hub',
  'Team Chat',
]

// Skeleton component for loading states
function HistorySkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
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
    <motion.div
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
    </motion.div>
  )
}

// Rate limit banner
function RateLimitBanner({ countdown, onDismiss }: { countdown: number; onDismiss?: () => void }) {
  return (
    <motion.div
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
    </motion.div>
  )
}

export function AgentModePanel({
  isOpen,
  onClose,
  messages,
  isProcessing,
  onSendMessage,
  conversationId,
  history,
  isHistoryLoading,
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
  const { clients, projects, teams, users, isLoading: mentionsLoading } = useMentionData()

  const { 
    isSupported, 
    isListening, 
    toggleListening, 
    transcript, 
    error: voiceError,
    timeRemaining,
    clearError: clearVoiceError,
  } = useVoiceInput({
    onResult: (text) => {
      if (text.trim()) {
        onSendMessage(text)
        setInputValue('')
      }
    },
  })

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

  // Update input with voice transcript in real-time
  useEffect(() => {
    if (transcript && isListening) {
      setInputValue(transcript)
    }
  }, [transcript, isListening])

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
      const newValue = beforeMention + formatMention(item) + ' ' + afterMention
      setInputValue(newValue)
    }

    setShowMentions(false)
    inputRef.current?.focus()
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

  const showEmptyState = messages.length === 0

  const toggleHistory = () => setShowHistory((prev) => !prev)

  // Check if input is disabled (rate limited or processing)
  const isInputDisabled = isProcessing || (typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
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
                {isHistoryLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
                                onClick={() => {
                                  onSelectConversation(c.id)
                                  setShowHistory(false)
                                }}
                                className="w-full min-w-0 text-left"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate font-medium">{c.title || 'Chat'}</span>
                                  {c.lastMessageAt && (
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
                    Type a command or type @ to pick a client, user, project, or team.
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
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? 'Listening... say something!' : 'Type your request…'}
                      className={cn(
                        'flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm',
                        isListening && 'placeholder:text-primary placeholder:font-medium'
                      )}
                      disabled={isInputDisabled}
                    />

                    {isSupported && (
                      <Button
                        variant={isListening ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={toggleListening}
                        className={cn(
                          'h-10 w-10 shrink-0 rounded-full transition-all',
                          isListening && 'animate-pulse ring-2 ring-destructive/50'
                        )}
                        disabled={isInputDisabled}
                        title={isListening ? `Stop listening (${timeRemaining}s)` : 'Start voice input'}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}

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

                  {!isSupported && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Voice input works best in Chrome.
                    </p>
                  )}

                  {voiceError && (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-xs text-destructive flex-1">{voiceError}</p>
                      <Button variant="ghost" size="sm" onClick={clearVoiceError} className="h-6 px-2 text-xs">
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {/* Voice Waveform - shows when listening */}
                  {isListening && (
                    <div className="mt-3">
                      <VoiceWaveform isActive={isListening} />
                      {timeRemaining !== null && (
                        <p className="mt-1 text-center text-xs text-muted-foreground">
                          {timeRemaining}s remaining
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
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
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <AgentMessageCard key={msg.id} message={msg} />
                  ))}

                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
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

              {/* Voice error */}
              {voiceError && (
                <div className="border-t bg-destructive/10 px-4 py-2.5 flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive flex-1">{voiceError}</p>
                  <Button variant="ghost" size="sm" onClick={clearVoiceError} className="h-6 px-2 text-xs">
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Voice Waveform - shows when listening */}
              {isListening && (
                <div className="flex flex-col items-center py-3 border-t bg-muted/10">
                  <VoiceWaveform isActive={isListening} />
                  {timeRemaining !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {timeRemaining}s remaining
                    </p>
                  )}
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

                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening... say something!' : 'Type @ to mention • Where would you like to go?'}
                  className={cn(
                    'flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm',
                    isListening && 'placeholder:text-primary placeholder:font-medium'
                  )}
                  disabled={isInputDisabled}
                />

                {isSupported && (
                  <Button
                    variant={isListening ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={toggleListening}
                    className={cn(
                      'h-10 w-10 shrink-0 rounded-full transition-all',
                      isListening && 'animate-pulse ring-2 ring-destructive/50'
                    )}
                    disabled={isInputDisabled}
                    title={isListening ? `Stop listening (${timeRemaining}s)` : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}

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
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
