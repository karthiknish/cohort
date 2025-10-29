'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  TrendingUp,
  FileText,
  Users,
  CreditCard,
  CheckSquare,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { chatbotService, ChatbotResponse } from '@/services/chatbot'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'suggestion'
}

interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  action: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your Cohorts AI assistant. I can help you with analytics, client management, task tracking, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: TrendingUp,
      action: 'show me my analytics dashboard',
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      action: 'what are my upcoming tasks',
    },
    {
      id: 'clients',
      label: 'Client Insights',
      icon: Users,
      action: 'show me client performance summary',
    },
    {
      id: 'proposals',
      label: 'Create Proposal',
      icon: FileText,
      action: 'help me create a new proposal',
    },
    {
      id: 'finance',
      label: 'Financial Overview',
      icon: CreditCard,
      action: "what's my current financial status",
    }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateBotResponse = async (userMessage: string): Promise<ChatbotResponse> => {
    try {
      const response = await chatbotService.generateResponse(userMessage)
      return response
    } catch (error) {
      console.error('Chatbot error:', error)
      return {
        message: 'Sorry, I encountered an error. Please try again or contact support.',
        suggestions: ['Try asking again', 'Contact support', 'View help docs']
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    setTimeout(async () => {
      try {
        const botResponse = await generateBotResponse(inputMessage)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse.message,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])

        if (botResponse.suggestions && botResponse.suggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: `💡 **Suggestions:**\n${botResponse.suggestions?.map(s => `• ${s}`).join('\n')}`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'suggestion'
            }
            setMessages(prev => [...prev, suggestionMessage])
          }, 500)
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again or contact support.',
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
    setTimeout(() => sendMessage(), 100)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 group"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            1
          </span>
          <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with AI
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="overflow-hidden border-border shadow-xl">
        <CardHeader className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base">Cohorts AI Assistant</CardTitle>
                <CardDescription className="text-xs text-primary-foreground/70">
                  Always here to help
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="bg-muted/40 p-0">
              <ScrollArea className="h-96 p-4">
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
                        className={`max-w-xs rounded-xl px-4 py-2 text-sm shadow-sm ${
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

            <CardContent className="space-y-3 border-t bg-background p-4">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Badge
                    key={action.id}
                    variant="secondary"
                    className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-background p-4">
              <div className="flex w-full items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                />
                <Button onClick={sendMessage} size="icon" disabled={!inputMessage.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
