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
  CheckSquare
} from 'lucide-react'
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
  color: string
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
      color: 'bg-blue-500'
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      action: 'what are my upcoming tasks',
      color: 'bg-green-500'
    },
    {
      id: 'clients',
      label: 'Client Insights',
      icon: Users,
      action: 'show me client performance summary',
      color: 'bg-purple-500'
    },
    {
      id: 'proposals',
      label: 'Create Proposal',
      icon: FileText,
      action: 'help me create a new proposal',
      color: 'bg-yellow-500'
    },
    {
      id: 'finance',
      label: 'Financial Overview',
      icon: CreditCard,
      action: 'what\'s my current financial status',
      color: 'bg-red-500'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Cohorts AI Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-96 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="bg-indigo-600 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.action)}
                    className={`${action.color} text-white px-3 py-1 rounded-full text-xs font-medium hover:opacity-90 transition-opacity flex items-center space-x-1`}
                  >
                    <action.icon className="h-3 w-3" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
