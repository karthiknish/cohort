'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
  Trash2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChatConversationTurn, ChatbotGenerateRequest, ChatbotResponse } from '@/types/chatbot'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/hooks/use-keyboard-shortcuts'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'suggestion'
}

const SUGGESTED_PROMPTS = [
  'How are my campaigns performing?',
  'Show me overdue tasks',
  'Summarize recent activity',
  'Draft a proposal for a new client',
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Cohorts AI assistant. Ask me anything about your analytics, tasks, or clients.",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut to open chatbot
  useKeyboardShortcut({
    combo: 'mod+/',
    callback: () => {
      setIsOpen((prev) => !prev)
    },
    description: 'Toggle AI assistant',
  })

  // Escape to close
  useKeyboardShortcut({
    combo: 'escape',
    callback: () => setIsOpen(false),
    enabled: isOpen,
  })

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow animation to start
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, messages])

  const generateMessageId = useCallback(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }, [])

  const conversationFromMessages = useCallback((history: Message[]): ChatConversationTurn[] => {
    return history
      .filter((message) => message.sender === 'user' || message.sender === 'bot')
      .map((message) => ({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text,
      }))
  }, [])

  const sendMessage = useCallback(
    async (overrideMessage?: string) => {
      const messageText = (overrideMessage ?? inputMessage).trim()
      if (!messageText) return

      const userMessage: Message = {
        id: generateMessageId(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
      }

      const conversationHistory = conversationFromMessages([...messages, userMessage]).slice(-8)

      setMessages((prev) => [...prev, userMessage])
      setInputMessage('')
      setIsTyping(true)
      setErrorMessage(null)

      // Scroll to bottom immediately after user sends
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10)

      try {
        const botResponse = await requestChatbotResponse({
          message: messageText,
          conversation: conversationHistory,
        })

        // Artificial delay for better UX if response is too fast
        await new Promise((resolve) => setTimeout(resolve, 500))

        const botMessage: Message = {
          id: generateMessageId(),
          text: botResponse.message,
          sender: 'bot',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
      } catch (error) {
        console.error('Chatbot error:', error)

        const fallbackText =
          error instanceof Error && error.message
            ? error.message
            : 'Sorry, something went wrong reaching our AI assistant. Please try again in a moment.'

        const fallbackMessage: Message = {
          id: generateMessageId(),
          text: fallbackText,
          sender: 'bot',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, fallbackMessage])
        setErrorMessage('We had trouble contacting the AI. Try sending your question again soon.')
      } finally {
        setIsTyping(false)
      }
    },
    [conversationFromMessages, generateMessageId, inputMessage, messages]
  )

  const clearChat = () => {
    setMessages([
      {
        id: generateMessageId(),
        text: "Hi! I'm your Cohorts AI assistant. Ask me anything about your analytics, tasks, or clients.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      },
    ])
    setErrorMessage(null)
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="relative h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl bg-primary text-primary-foreground"
                    onClick={() => setIsOpen(true)}
                  >
                    <MessageCircle className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-background">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <span className="sr-only">Open AI assistant</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="flex items-center gap-2">
                  <span>AI Assistant</span>
                  <KeyboardShortcutBadge combo="mod+/" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isExpanded ? 'min(100vw - 2rem, 800px)' : 'min(100vw - 2rem, 400px)',
              height: isExpanded ? 'min(90vh, 800px)' : 'min(80vh, 600px)',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:bottom-6 sm:right-6',
              // Mobile styles: full screen on very small screens
              'max-sm:inset-0 max-sm:bottom-0 max-sm:right-0 max-sm:h-full max-sm:w-full max-sm:rounded-none'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Cohorts AI</h3>
                  <p className="text-[10px] text-primary-foreground/80 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {isTyping ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
                        onClick={clearChat}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear chat</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-8 w-8 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground sm:flex"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <ChevronDown className="h-5 w-5 sm:hidden" />
                  <X className="hidden h-5 w-5 sm:block" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-muted/30 relative">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-6 pb-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm',
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white text-primary border'
                        )}
                      >
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      <div
                        className={cn(
                          'relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-white border rounded-tl-sm'
                        )}
                      >
                        {message.sender === 'bot' ? (
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:p-2 prose-pre:rounded-md">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        )}
                        <span
                          className={cn(
                            'mt-1 block text-[10px] opacity-70',
                            message.sender === 'user' ? 'text-right' : 'text-left'
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary border shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm border bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background p-4">
              {messages.length === 1 && !isTyping && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="whitespace-nowrap rounded-full border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center justify-between"
                >
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              )}

              <div className="relative flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void sendMessage()
                    }
                  }}
                  placeholder="Ask anything..."
                  disabled={isTyping}
                  className="pr-12 h-11 rounded-full border-muted-foreground/20 bg-muted/30 focus-visible:ring-primary/20 focus-visible:border-primary"
                />
                <Button
                  onClick={() => void sendMessage()}
                  size="icon"
                  disabled={!inputMessage.trim() || isTyping}
                  className={cn(
                    "absolute right-1.5 h-8 w-8 rounded-full transition-all",
                    inputMessage.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex justify-center">
                <p className="text-[10px] text-muted-foreground">
                  AI can make mistakes. Check important info.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

async function requestChatbotResponse(payload: ChatbotGenerateRequest): Promise<ChatbotResponse> {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const message =
      (errorPayload as { error?: string } | null)?.error ?? 'Failed to reach Cohorts AI assistant.'
    throw new Error(message)
  }

  const data = (await response.json()) as ChatbotResponse
  return data
}
