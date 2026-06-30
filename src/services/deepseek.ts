import type { AIAnalysis, CampaignMetrics } from '@/types';

export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';

export function resolveDeepSeekApiKey(): string {
    const processEnv = typeof process !== 'undefined' ? process.env : undefined;
    return (processEnv?.DEEPSEEK_API_KEY || '').trim();
}

export function resolveDeepSeekModel(): string {
    const processEnv = typeof process !== 'undefined' ? process.env : undefined;
    return processEnv?.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL;
}

export interface DeepSeekPrompt {
    type: 'performance' | 'recommendations' | 'summary' | 'forecast';
    context: {
        clientId?: string;
        campaignIds?: string[];
        metrics?: CampaignMetrics[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        platform?: string;
    };
}

export type DeepSeekRequestPart = {
    text: string;
} | {
    inlineData: {
        mimeType: string;
        data: string;
    };
};

export type DeepSeekSafetySetting = {
    category: string;
    threshold: string;
};

export type DeepSeekContentGenerationOptions = {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    safetySettings?: DeepSeekSafetySetting[];
};

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekAIService {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey.trim();
        this.model = resolveDeepSeekModel();
    }

    async generateContent(prompt: string): Promise<string> {
        return this.generateContentWithParts([{ text: prompt }]);
    }

    async generateContentWithOptions(prompt: string, options?: DeepSeekContentGenerationOptions): Promise<string> {
        return this.generateContentWithParts([{ text: prompt }], options);
    }

    async generateContentWithParts(parts: DeepSeekRequestPart[], options?: DeepSeekContentGenerationOptions): Promise<string> {
        const apiKey = this.resolveApiKey();
        if (!apiKey) {
            throw new Error('DEEPSEEK_API_KEY is not configured');
        }
        if (parts.length === 0) {
            throw new Error('DeepSeek request requires at least one content part');
        }
        try {
            const userContent = parts.map((part) => 'text' in part ? part.text : '').join('\n');
            const messages: Array<{ role: string; content: string }> = [];
            if (options?.systemInstruction) {
                messages.push({ role: 'system', content: options.systemInstruction });
            }
            messages.push({ role: 'user', content: userContent });

            const body: Record<string, unknown> = {
                model: this.model,
                messages,
                stream: false,
            };
            if (options?.temperature !== undefined) {
                body.temperature = options.temperature;
            }
            if (options?.maxOutputTokens !== undefined) {
                body.max_tokens = options.maxOutputTokens;
            }

            const response = await fetch(DEEPSEEK_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const details = await response.text();
                throw new Error(`DeepSeek API error ${response.status}: ${details}`);
            }
            const data = await response.json();
            const text = this.extractTextFromResponse(data);
            if (!text) {
                throw new Error('DeepSeek API returned an empty response');
            }
            return text;
        }
        catch (error) {
            console.error('DeepSeek API error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to generate content with DeepSeek AI');
        }
    }

    getModel(): string {
        return this.model;
    }

    isConfigured(): boolean {
        return Boolean(this.resolveApiKey());
    }

    private extractTextFromResponse(payload: unknown): string | null {
        if (!payload || typeof payload !== 'object') {
            return null;
        }
        const root = payload as {
            choices?: Array<{
                message?: { content?: string };
                text?: string;
            }>;
        };
        const choices = Array.isArray(root.choices) ? root.choices : [];
        for (const choice of choices) {
            const content = choice?.message?.content;
            if (typeof content === 'string' && content.trim()) {
                return content.trim();
            }
            if (typeof choice?.text === 'string' && choice.text.trim()) {
                return choice.text.trim();
            }
        }
        return null;
    }

    private resolveApiKey(): string {
        if (this.apiKey) {
            return this.apiKey;
        }
        const candidate = resolveDeepSeekApiKey();
        if (candidate) {
            this.apiKey = candidate;
            return candidate;
        }
        return '';
    }

    async analyzePerformance(context: DeepSeekPrompt['context']): Promise<AIAnalysis> {
        const prompt = this.buildPerformancePrompt(context);
        try {
            const content = await this.generateContent(prompt);
            return {
                id: `analysis-${Date.now()}`,
                type: 'performance',
                content,
                clientId: context.clientId,
                campaignIds: context.campaignIds,
                generatedAt: new Date(),
                confidence: 0.85,
            };
        }
        catch {
            throw new Error('Failed to analyze performance with DeepSeek AI');
        }
    }

    async generateRecommendations(context: DeepSeekPrompt['context']): Promise<AIAnalysis> {
        const prompt = this.buildRecommendationsPrompt(context);
        try {
            const content = await this.generateContent(prompt);
            return {
                id: `recommendations-${Date.now()}`,
                type: 'recommendations',
                content,
                clientId: context.clientId,
                campaignIds: context.campaignIds,
                generatedAt: new Date(),
                confidence: 0.82,
            };
        }
        catch {
            throw new Error('Failed to generate recommendations with DeepSeek AI');
        }
    }

    async generateSummary(context: DeepSeekPrompt['context']): Promise<AIAnalysis> {
        const prompt = this.buildSummaryPrompt(context);
        try {
            const content = await this.generateContent(prompt);
            return {
                id: `summary-${Date.now()}`,
                type: 'summary',
                content,
                clientId: context.clientId,
                campaignIds: context.campaignIds,
                generatedAt: new Date(),
                confidence: 0.90,
            };
        }
        catch {
            throw new Error('Failed to generate summary with DeepSeek AI');
        }
    }

    async generateForecast(context: DeepSeekPrompt['context']): Promise<AIAnalysis> {
        const prompt = this.buildForecastPrompt(context);
        try {
            const content = await this.generateContent(prompt);
            return {
                id: `forecast-${Date.now()}`,
                type: 'forecast',
                content,
                clientId: context.clientId,
                campaignIds: context.campaignIds,
                generatedAt: new Date(),
                confidence: 0.75,
            };
        }
        catch {
            throw new Error('Failed to generate forecast with DeepSeek AI');
        }
    }

    private buildPerformancePrompt(context: DeepSeekPrompt['context']): string {
        const { metrics, platform, dateRange } = context;
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
    `;
    }

    private buildRecommendationsPrompt(context: DeepSeekPrompt['context']): string {
        const { metrics, platform, dateRange } = context;
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
    `;
    }

    private buildSummaryPrompt(context: DeepSeekPrompt['context']): string {
        const { metrics, platform, dateRange } = context;
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
    `;
    }

    private buildForecastPrompt(context: DeepSeekPrompt['context']): string {
        const { metrics, platform, dateRange } = context;
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
    `;
    }
}

export const deepseekAI = new DeepSeekAIService(process.env.DEEPSEEK_API_KEY || '');
