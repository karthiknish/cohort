'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
} from 'lucide-react'

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
import { ChatConversationTurn, ChatbotGenerateRequest, ChatbotResponse } from '@/types/chatbot'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'suggestion'
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your Cohorts AI assistant. Ask me anything about your analytics, tasks, or clients.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        content: message.text
      }))
  }, [])

  const sendMessage = useCallback(async (overrideMessage?: string) => {
    const messageText = (overrideMessage ?? inputMessage).trim()
    if (!messageText) return

    const userMessage: Message = {
      id: generateMessageId(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    const conversationHistory = conversationFromMessages([...messages, userMessage]).slice(-8)

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    setErrorMessage(null)

    try {
      const botResponse = await requestChatbotResponse({
        message: messageText,
        conversation: conversationHistory,
      })

      await new Promise((resolve) => setTimeout(resolve, 350))

      const botMessage: Message = {
        id: generateMessageId(),
        text: botResponse.message,
        sender: 'bot',
        timestamp: new Date()
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
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, fallbackMessage])
      setErrorMessage('We had trouble contacting the AI. Try sending your question again soon.')
    } finally {
      setIsTyping(false)
    }
  }, [conversationFromMessages, generateMessageId, inputMessage, messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
        <div className="group relative flex items-center justify-end">
          <Button
            size="icon"
            className="relative h-12 w-12 rounded-full shadow-lg transition-transform hover:translate-y-[-2px] sm:h-14 sm:w-14"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
              1
            </span>
            <span className="sr-only">Open chatbot</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(100vw-1.5rem,22rem)] sm:bottom-6 sm:right-6">
      <Card className="overflow-hidden border-border shadow-2xl">
        <CardHeader className="bg-primary p-4 text-primary-foreground">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-primary-foreground">
                Cohorts AI Assistant
              </CardTitle>
              <p className="text-xs text-primary-foreground/75">
                Ask a question to get started
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="bg-muted/40 p-0">
          <ScrollArea className="h-[360px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="rounded-xl border bg-background px-4 py-2">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 border-t bg-background p-4">
          {errorMessage && (
            <p className="text-xs text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="flex w-full gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendMessage()
                }
              }}
              placeholder="Type a message..."
              disabled={isTyping}
            />
            <Button
              onClick={() => void sendMessage()}
              size="icon"
              disabled={!inputMessage.trim() || isTyping}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
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
    const message = (errorPayload as { error?: string } | null)?.error ?? 'Failed to reach Cohorts AI assistant.'
    throw new Error(message)
  }

  const data = (await response.json()) as ChatbotResponse
  return data
}
