import { geminiAI } from './gemini'

export interface ChatbotResponse {
  message: string
  suggestions?: string[]
  actions?: Array<{
    label: string
    url: string
  }>
}

class ChatbotService {
  private contextData: any = null

  setContext(data: any) {
    this.contextData = data
  }

  async generateResponse(userMessage: string, userContext?: any): Promise<ChatbotResponse> {
    const lowercaseMessage = userMessage.toLowerCase()
    
    if (lowercaseMessage.includes('show me my analytics') || lowercaseMessage.includes('analytics dashboard')) {
      return {
        message: 'Opening your analytics dashboard... 📊\n\nHere are your key metrics:\n• **Total Revenue**: $276,000 (+35% vs last month)\n• **ROAS**: 4.2x across all platforms\n• **Top Performer**: Google Ads with 5.1x ROAS\n• **Total Spend**: $65,700\n\n[View detailed analytics →](/dashboard/analytics)',
        suggestions: [
          'Show platform breakdown',
          'Compare with last month',
          'Export report'
        ],
        actions: [
          { label: 'Go to Analytics', url: '/dashboard/analytics' }
        ]
      }
    }

    if (lowercaseMessage.includes('upcoming tasks') || lowercaseMessage.includes('my tasks')) {
      return {
        message: 'You have 5 tasks pending: ✅\n\n**High Priority:**\n• Q4 Campaign Review - Due Today\n• Client Proposal for Tech Corp - Due Tomorrow\n\n**Medium Priority:**\n• Budget optimization for StartupXYZ\n• Team meeting preparation\n\n**Low Priority:**\n• Update client documentation\n\n[View all tasks →](/dashboard/tasks)',
        suggestions: [
          'Help me prioritize tasks',
          'Mark task as complete',
          'Create new task'
        ],
        actions: [
          { label: 'Manage Tasks', url: '/dashboard/tasks' }
        ]
      }
    }

    if (lowercaseMessage.includes('client performance') || lowercaseMessage.includes('client insights')) {
      return {
        message: 'Client Performance Summary 👥\n\n**Active Clients**: 4\n• Tech Corp: $87,000 revenue (↑ 15%)\n• StartupXYZ: $62,000 revenue (↑ 8%)\n• Retail Store LLC: $58,000 revenue (↑ 12%)\n• Fashion Brand Co.: $69,000 revenue (↓ 3%)\n\n**⚠️ Alert**: Fashion Brand shows declining performance. I recommend a strategy review.\n\n[View all clients →](/dashboard/clients)',
        suggestions: [
          'Show detailed client reports',
          'Optimize Fashion Brand campaigns',
          'Client meeting preparation'
        ],
        actions: [
          { label: 'View Clients', url: '/dashboard/clients' }
        ]
      }
    }

    if (lowercaseMessage.includes('create proposal') || lowercaseMessage.includes('new proposal')) {
      return {
        message: 'I can help you create a professional proposal! 📝\n\n**Recent Proposals:**\n• Tech Corp: Sent ($45,000) - Pending response\n• StartupXYZ: Accepted ($32,000)\n• Retail Store: Draft ($28,000)\n\n**Choose a template:**\n1. Full-Service Marketing Package\n2. Performance-Based Campaign\n3. Consulting Retainer\n\nWhich client and service type would you like to propose?',
        suggestions: [
          'Full-Service Marketing Package',
          'Performance-Based Campaign',
          'Consulting Retainer'
        ],
        actions: [
          { label: 'Create Proposal', url: '/dashboard/proposals' }
        ]
      }
    }

    if (lowercaseMessage.includes('financial status') || lowercaseMessage.includes('finance overview')) {
      return {
        message: 'Financial Overview 💰\n\n**This Month:**\n• Total Revenue: $276,000\n• Total Expenses: $89,500\n• Net Profit: $186,500\n• Profit Margin: 67.6%\n\n**Outstanding Invoices:**\n• Tech Corp: $45,000 (Due in 5 days)\n• Fashion Brand: $38,000 (⚠️ Overdue by 2 days)\n\n**Cash Flow**: Healthy with 3 months runway\n\n[View finance dashboard →](/dashboard/finance)',
        suggestions: [
          'Show payment schedule',
          'Generate invoice',
          'Profit analysis'
        ],
        actions: [
          { label: 'View Finance', url: '/dashboard/finance' }
        ]
      }
    }

    if (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do')) {
      return {
        message: 'I\'m your Cohorts AI assistant! 🤖\n\n**I can help you with:**\n\n📊 **Analytics** - Performance metrics, ROAS, campaign insights\n📋 **Task Management** - Track priorities, deadlines, assignments\n👥 **Client Management** - Performance summaries, client insights\n📝 **Proposals** - Create templates, track status, generate content\n💰 **Finance** - Revenue tracking, invoice management, profit analysis\n🤖 **AI Insights** - Get recommendations and predictions\n\n**Just ask me anything** about your marketing agency operations!',
        suggestions: [
          'Show me my analytics',
          'What are my upcoming tasks?',
          'Client performance summary',
          'Financial overview'
        ]
      }
    }

    try {
      const aiPrompt = `
        You are a helpful marketing agency assistant for Cohorts. The user is asking: "${userMessage}"
        
        Current context:
        - This is a marketing agency management platform
        - The user has access to analytics, client management, tasks, finance, and proposals
        - Provide helpful, actionable responses
        - Be conversational and friendly
        - Include relevant metrics and insights when appropriate
        - Format responses with markdown for readability
        
        If the question is about marketing strategies, provide expert advice.
        If it's about data, reference typical agency metrics.
        If it's about operations, suggest practical next steps.
      `
      
      const aiResponse = await geminiAI.generateContent(aiPrompt)
      return {
        message: aiResponse,
        suggestions: [
          'Tell me more',
          'How can I implement this?',
          'Show me related data'
        ]
      }
    } catch (error) {
      console.error('Chatbot AI service error:', error)
      
      return {
        message: `I understand you're asking about "${userMessage}". Let me help you with that!\n\nBased on your Cohorts data, I can provide insights and recommendations. Would you like me to:\n\n1. **Show relevant dashboard metrics**\n2. **Provide actionable insights**\n3. **Help you create a plan**\n\nWhat would be most helpful right now?`,
        suggestions: [
          'Show analytics',
          'Review tasks',
          'Check finances',
          'Client insights'
        ]
      }
    }
  }

  async getInsights(platform?: string) {
    const prompt = `Provide 3 key insights and recommendations for a marketing agency${platform ? ` focusing on ${platform} ads` : ''}. Include specific metrics and actionable advice.`
    
    try {
      return await geminiAI.generateContent(prompt)
    } catch (error) {
      return "I'm unable to generate AI insights right now, but here are some general recommendations:\n\n• Focus on improving ROAS across all platforms\n• Review underperforming campaigns\n• Optimize ad spend allocation\n• Test new creatives and audiences"
    }
  }

  async generateSummary(data: any, type: 'client' | 'campaign' | 'financial') {
    let prompt = `Generate a concise summary for ${type} performance: ${JSON.stringify(data)}`
    
    try {
      return await geminiAI.generateContent(prompt)
    } catch (error) {
      return `Summary: Based on the data provided, performance shows room for improvement. Key areas to focus include optimization and strategic adjustments.`
    }
  }
}

export const chatbotService = new ChatbotService()
