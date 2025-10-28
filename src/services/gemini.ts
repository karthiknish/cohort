import { AIAnalysis, CampaignMetrics } from '@/types'

export interface GeminiPrompt {
  type: 'performance' | 'recommendations' | 'summary' | 'forecast'
  context: {
    clientId?: string
    campaignIds?: string[]
    metrics?: CampaignMetrics[]
    dateRange?: { start: Date; end: Date }
    platform?: string
  }
}

export class GeminiAIService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate content with Gemini AI')
    }
  }

  async analyzePerformance(context: GeminiPrompt['context']): Promise<AIAnalysis> {
    const prompt = this.buildPerformancePrompt(context)
    
    try {
      const content = await this.generateContent(prompt)
      
      return {
        id: `analysis-${Date.now()}`,
        type: 'performance',
        content,
        clientId: context.clientId,
        campaignIds: context.campaignIds,
        generatedAt: new Date(),
        confidence: 0.85 // Mock confidence score
      }
    } catch (error) {
      throw new Error('Failed to analyze performance with Gemini AI')
    }
  }

  async generateRecommendations(context: GeminiPrompt['context']): Promise<AIAnalysis> {
    const prompt = this.buildRecommendationsPrompt(context)
    
    try {
      const content = await this.generateContent(prompt)
      
      return {
        id: `recommendations-${Date.now()}`,
        type: 'recommendations',
        content,
        clientId: context.clientId,
        campaignIds: context.campaignIds,
        generatedAt: new Date(),
        confidence: 0.82
      }
    } catch (error) {
      throw new Error('Failed to generate recommendations with Gemini AI')
    }
  }

  async generateSummary(context: GeminiPrompt['context']): Promise<AIAnalysis> {
    const prompt = this.buildSummaryPrompt(context)
    
    try {
      const content = await this.generateContent(prompt)
      
      return {
        id: `summary-${Date.now()}`,
        type: 'summary',
        content,
        clientId: context.clientId,
        campaignIds: context.campaignIds,
        generatedAt: new Date(),
        confidence: 0.90
      }
    } catch (error) {
      throw new Error('Failed to generate summary with Gemini AI')
    }
  }

  async generateForecast(context: GeminiPrompt['context']): Promise<AIAnalysis> {
    const prompt = this.buildForecastPrompt(context)
    
    try {
      const content = await this.generateContent(prompt)
      
      return {
        id: `forecast-${Date.now()}`,
        type: 'forecast',
        content,
        clientId: context.clientId,
        campaignIds: context.campaignIds,
        generatedAt: new Date(),
        confidence: 0.75
      }
    } catch (error) {
      throw new Error('Failed to generate forecast with Gemini AI')
    }
  }

  private buildPerformancePrompt(context: GeminiPrompt['context']): string {
    const { metrics, platform, dateRange } = context
    
    return `
      As a digital marketing expert, analyze the following campaign performance data:
      
      Platform: ${platform || 'Multiple platforms'}
      Date Range: ${dateRange?.start.toLocaleDateString()} to ${dateRange?.end.toLocaleDateString()}
      
      Performance Metrics:
      ${metrics?.map(m => `
      Campaign ID: ${m.campaignId}
      Spend: $${m.spend}
      Revenue: $${m.revenue}
      ROAS: ${m.roas}
      Clicks: ${m.clicks}
      Conversions: ${m.conversions}
      CPC: $${m.cpc}
      Conversion Rate: ${(m.conversionRate * 100).toFixed(2)}%
      `).join('\n')}
      
      Please provide a comprehensive analysis including:
      1. Overall performance assessment
      2. Key strengths and weaknesses
      3. Areas of concern
      4. Performance trends
      5. Comparison with industry benchmarks (where applicable)
      
      Format the response in a clear, actionable manner suitable for a marketing agency dashboard.
    `
  }

  private buildRecommendationsPrompt(context: GeminiPrompt['context']): string {
    const { metrics, platform, dateRange } = context
    
    return `
      As a digital marketing strategist, review the campaign performance data and provide actionable recommendations:
      
      Platform: ${platform || 'Multiple platforms'}
      Date Range: ${dateRange?.start.toLocaleDateString()} to ${dateRange?.end.toLocaleDateString()}
      
      Current Performance:
      ${metrics?.map(m => `
      Campaign: ${m.campaignId}
      Spend: $${m.spend}, Revenue: $${m.revenue}, ROAS: ${m.roas}
      Clicks: ${m.clicks}, Conversions: ${m.conversions}
      CPC: $${m.cpc}, Conversion Rate: ${(m.conversionRate * 100).toFixed(2)}%
      `).join('\n')}
      
      Provide specific recommendations for:
      1. Budget optimization
      2. Bid adjustments
      3. Targeting improvements
      4. Creative suggestions
      5. Platform-specific optimizations
      6. Testing opportunities
      
      Prioritize recommendations by potential impact and ease of implementation.
    `
  }

  private buildSummaryPrompt(context: GeminiPrompt['context']): string {
    const { metrics, platform, dateRange } = context
    
    return `
      Create a concise executive summary of the campaign performance for stakeholders:
      
      Platform: ${platform || 'Multiple platforms'}
      Period: ${dateRange?.start.toLocaleDateString()} to ${dateRange?.end.toLocaleDateString()}
      
      Key Metrics:
      Total Spend: $${metrics?.reduce((sum, m) => sum + m.spend, 0).toFixed(2)}
      Total Revenue: $${metrics?.reduce((sum, m) => sum + m.revenue, 0).toFixed(2)}
      Average ROAS: ${metrics ? (metrics.reduce((sum, m) => sum + m.roas, 0) / metrics.length).toFixed(2) : '0.00'}
      Total Clicks: ${metrics?.reduce((sum, m) => sum + m.clicks, 0)}
      Total Conversions: ${metrics?.reduce((sum, m) => sum + m.conversions, 0)}
      
      Create a 2-3 paragraph summary suitable for client presentation, highlighting:
      1. Overall performance and key achievements
      2. Notable insights or trends
      3. Business impact and ROI
      4. Next steps or areas of focus
      
      Keep it professional, data-driven, and easy to understand.
    `
  }

  private buildForecastPrompt(context: GeminiPrompt['context']): string {
    const { metrics, platform, dateRange } = context
    
    return `
      Based on the historical campaign data, provide a performance forecast for the next 30-90 days:
      
      Platform: ${platform || 'Multiple platforms'}
      Historical Period: ${dateRange?.start.toLocaleDateString()} to ${dateRange?.end.toLocaleDateString()}
      
      Historical Data:
      ${metrics?.map(m => `
      Date: ${m.date.toLocaleDateString()}
      Spend: $${m.spend}, Revenue: $${m.revenue}, ROAS: ${m.roas}
      `).join('\n')}
      
      Provide forecasts for:
      1. Expected revenue and conversions
      2. Recommended budget levels
      3. Seasonal trends or patterns
      4. Risk factors and opportunities
      5. Confidence levels for predictions
      
      Include specific metrics and confidence intervals where possible.
    `
  }
}

export const geminiAI = new GeminiAIService(process.env.GEMINI_API_KEY || '')
