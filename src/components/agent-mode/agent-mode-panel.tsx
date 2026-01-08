'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Mic, MicOff, Send, X, Sparkles, Loader2, AlertCircle, History, Pencil, Trash2, Check } from 'lucide-react'
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
import type { AgentConversationSummary, AgentMessage } from '@/hooks/use-agent-mode'

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
}

const QUICK_SUGGESTIONS = [
  'Go to Analytics',
  'Show my Tasks',
  'Check Finance',
  'Open Proposals',
  'View Ads Hub',
  'Team Chat',
]

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
  onOpenHistory,
  onSelectConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
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

  const { isSupported, isListening, toggleListening, transcript, error: voiceError } = useVoiceInput({
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

  const showEmptyState = messages.length === 0

  const toggleHistory = () => setShowHistory((prev) => !prev)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Header (top-right) */}
          <div className="flex items-center justify-end gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleHistory}
              className="h-9 gap-2 rounded-full"
              aria-expanded={showHistory}
              aria-label="Chat history"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Agent Mode</span>
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

          {showHistory && (
            <div className="absolute right-4 top-[60px] z-50 w-[340px] overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <p className="text-sm font-medium">Previous chats</p>
                {isHistoryLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <ScrollArea className="max-h-[320px]">
                <div className="p-2">
                  {history.length === 0 && !isHistoryLoading ? (
                    <p className="px-2 py-2 text-sm text-muted-foreground">No previous chats yet.</p>
                  ) : (
                    history.map((c) => (
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
                    ))
                  )}
                </div>
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
                      disabled={isProcessing}
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
                        disabled={isProcessing}
                        title={isListening ? 'Stop listening' : 'Start voice input'}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}

                    <Button
                      size="icon"
                      onClick={handleSubmit}
                      disabled={!inputValue.trim() || isProcessing}
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
                    <p className="mt-2 text-xs text-destructive">{voiceError}</p>
                  )}

                  {/* Voice Waveform - shows when listening */}
                  {isListening && (
                    <div className="mt-3">
                      <VoiceWaveform isActive={isListening} />
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
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
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <AgentMessageCard key={msg.id} message={msg} />
                  ))}

                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Voice error */}
              {voiceError && (
                <div className="border-t bg-destructive/10 px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{voiceError}</p>
                </div>
              )}

              {/* Voice Waveform - shows when listening */}
              {isListening && (
                <div className="flex justify-center py-3 border-t bg-muted/10">
                  <VoiceWaveform isActive={isListening} />
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
                  disabled={isProcessing}
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
                    disabled={isProcessing}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}

                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isProcessing}
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
