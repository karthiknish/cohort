export interface ChatbotAction {
  label: string
  url: string
}

export interface ChatbotResponse {
  message: string
  suggestions?: string[]
  actions?: ChatbotAction[]
}

export interface ChatConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatbotGenerateRequest {
  message: string
  conversation?: ChatConversationTurn[]
  context?: Record<string, unknown>
}
