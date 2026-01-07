'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Mic, MicOff, Send, X, Sparkles, Loader2, Volume2, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useMentionData } from '@/hooks/use-mention-data'
import { MentionDropdown, formatMention, type MentionItem } from './mention-dropdown'
import type { AgentMessage } from '@/hooks/use-agent-mode'

interface AgentModePanelProps {
  isOpen: boolean
  onClose: () => void
  messages: AgentMessage[]
  isProcessing: boolean
  onSendMessage: (text: string) => void
  onClear: () => void
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
}: AgentModePanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Agent Mode</span>
              <Badge variant="secondary" className="text-[10px]">
                AI
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-3 px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: [8, 20, 8],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Listening... Speak now
                  </span>
                  <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <ScrollArea className="h-[280px] p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-base font-medium">
                  Hey! Where would you like to go?
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[280px]">
                  Type a command or tap the mic to speak. Try &quot;check my campaigns&quot; or &quot;show invoices&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick suggestions */}
          {messages.length === 0 && (
            <div className="border-t px-4 py-3">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98] text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice error or browser support warning */}
          {voiceError && (
            <div className="border-t bg-destructive/10 px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{voiceError}</p>
            </div>
          )}

          {!isSupported && messages.length === 0 && (
            <div className="border-t bg-amber-500/10 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">Voice input works best in Chrome</p>
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
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
