"use node"

import { action } from './_generated/server'
import { v } from 'convex/values'
import { api } from './_generated/api'

import { geminiAI } from '../src/services/gemini'
import { formatCurrency } from '../src/lib/utils'
import {
  calculateAlgorithmicInsights,
  getGlobalBudgetSuggestions,
  enrichSummaryWithMetrics,
  type AdMetricsSummary,
  type AlgorithmicInsight,
} from '../src/lib/ad-algorithms'

interface MetricRecord {
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  createdAt?: string | null
  clientId?: string | null
}

interface ProviderSummary {
  providerId: string
  totalSpend: number
  totalRevenue: number
  totalClicks: number
  totalConversions: number
  totalImpressions: number
  averageRoaS: number
  averageCpc: number
  averageCtr: number
  averageConvRate: number
  period: string
  dayCount: number
}

function toISO(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null
  return new Date(value).toISOString()
}

function summarizeByProvider(records: MetricRecord[], periodDays: number): ProviderSummary[] {
  const map = new Map<string, ProviderSummary>()

  records.forEach((metric) => {
    if (!map.has(metric.providerId)) {
      map.set(metric.providerId, {
        providerId: metric.providerId,
        totalSpend: 0,
        totalRevenue: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalImpressions: 0,
        averageRoaS: 0,
        averageCpc: 0,
        averageCtr: 0,
        averageConvRate: 0,
        period: `${periodDays}d`,
        dayCount: 0,
      })
    }

    const summary = map.get(metric.providerId)!
    summary.totalSpend += metric.spend
    summary.totalRevenue += metric.revenue ?? 0
    summary.totalClicks += metric.clicks
    summary.totalConversions += metric.conversions
    summary.totalImpressions += metric.impressions
  })

  const uniqueDates = new Set(records.map(r => r.date))

  map.forEach((summary) => {
    summary.averageRoaS = summary.totalSpend > 0 ? summary.totalRevenue / summary.totalSpend : 0
    summary.averageCpc = summary.totalClicks > 0 ? summary.totalSpend / summary.totalClicks : 0
    summary.averageCtr = summary.totalImpressions > 0 ? (summary.totalClicks / summary.totalImpressions) * 100 : 0
    summary.averageConvRate = summary.totalClicks > 0 ? (summary.totalConversions / summary.totalClicks) * 100 : 0
    summary.dayCount = uniqueDates.size
  })

  return Array.from(map.values())
}

function buildInsightPrompt(summary: any) {
  return `You are an expert marketing analyst. Provide a concise, actionable summary for the following ad platform.

Platform: ${summary.providerId}
Period: ${summary.period}
Total Spend: ${summary.totalSpend.toFixed(2)}
Total Revenue: ${summary.totalRevenue.toFixed(2)}
Total Clicks: ${summary.totalClicks}
Total Conversions: ${summary.totalConversions}
Average ROAS: ${summary.averageRoaS.toFixed(2)}
Average CPC: ${summary.averageCpc.toFixed(2)}
AOV: ${summary.aov?.toFixed(2)}
ROI: ${(summary.roi ?? 0 * 100).toFixed(1)}%
Efficiency Score: ${summary.efficiencyScore}/100

Include:
- Overall performance assessment
- Notable changes or risks
- One actionable recommendation
Keep it under 120 words.`
}

function buildComparisonPrompt(google: any, meta: any) {
  return `You are an expert marketing analyst. Compare the performance of Google Ads and Meta (Facebook) Ads based on the following data.

Google Ads:
- Spend: ${google.totalSpend.toFixed(2)}
- Revenue: ${google.totalRevenue.toFixed(2)}
- ROAS: ${google.averageRoaS.toFixed(2)}
- CPC: ${google.averageCpc.toFixed(2)}
- Efficiency Score: ${google.efficiencyScore}/100

Meta Ads:
- Spend: ${meta.totalSpend.toFixed(2)}
- Revenue: ${meta.totalRevenue.toFixed(2)}
- ROAS: ${meta.averageRoaS.toFixed(2)}
- CPC: ${meta.averageCpc.toFixed(2)}
- Efficiency Score: ${meta.efficiencyScore}/100

Provide a concise comparison highlighting which platform is performing better and why. Suggest where to allocate more budget. Keep it under 120 words.`
}

async function generateAllInsights(summaries: ProviderSummary[]) {
  const insights = [] as Array<{ providerId: string; summary: string }>
  const algorithmic = [] as Array<{ providerId: string; suggestions: AlgorithmicInsight[] }>
  const enrichedSummaries = summaries.map(s => enrichSummaryWithMetrics(s as AdMetricsSummary))

  // 1. Generate Algorithmic Insights
  enrichedSummaries.forEach(summary => {
    const suggestions = calculateAlgorithmicInsights(summary)
    if (suggestions.length > 0) {
      algorithmic.push({
        providerId: summary.providerId,
        suggestions
      })
    }
  })

  // Global budget suggestions & MER
  const globalSuggestions = getGlobalBudgetSuggestions(enrichedSummaries)

  // Calculate Global MER
  const totalGlobalSpend = enrichedSummaries.reduce((sum, s) => sum + s.totalSpend, 0)
  const totalGlobalRevenue = enrichedSummaries.reduce((sum, s) => sum + s.totalRevenue, 0)
  const globalMer = totalGlobalSpend > 0 ? totalGlobalRevenue / totalGlobalSpend : 0

  if (globalMer > 0) {
    algorithmic.push({
      providerId: 'global',
      suggestions: [
        {
          id: 'global-mer-insight',
          type: 'efficiency',
          level: globalMer > 3 ? 'success' : globalMer > 1.5 ? 'info' : 'warning',
          category: 'System Performance',
          title: 'Global Marketing Efficiency (MER)',
          message: `Your blended MER across all platforms is ${globalMer.toFixed(2)}x.`,
          suggestion: globalMer > 3
            ? 'Your overall marketing is healthy. You have room to test new channels.'
            : 'Focus on optimizing your highest-performing channel to pull up the blended average.',
        },
        ...globalSuggestions
      ]
    })
  } else if (globalSuggestions.length > 0) {
    algorithmic.push({
      providerId: 'global',
      suggestions: globalSuggestions
    })
  }

  // 2. Generate AI Insights
  for (const summary of enrichedSummaries) {
    const prompt = buildInsightPrompt(summary)
    try {
      const content = await geminiAI.generateContent(prompt)
      insights.push({ providerId: summary.providerId, summary: content })
    } catch (error) {
      console.error('[analyticsInsights] gemini failed', error)
      insights.push({
        providerId: summary.providerId,
        summary: `Unable to generate AI insight. Spend ${formatCurrency(summary.totalSpend)}, revenue ${formatCurrency(summary.totalRevenue)}, ROAS ${summary.averageRoaS.toFixed(2)}x.`,
      })
    }
  }

  const googleSummary = summaries.find((s) => s.providerId === 'google')
  const metaSummary = summaries.find((s) => s.providerId === 'facebook')

  if (googleSummary && metaSummary) {
    const prompt = buildComparisonPrompt(
      enrichedSummaries.find(s => s.providerId === 'google'),
      enrichedSummaries.find(s => s.providerId === 'facebook')
    )
    try {
      const content = await geminiAI.generateContent(prompt)
      insights.push({ providerId: 'google_vs_facebook', summary: content })
    } catch (error) {
      console.error('[analyticsInsights] comparison prompt failed', error)
      insights.push({
        providerId: 'google_vs_facebook',
        summary: `Comparison insight unavailable. Google ROAS ${googleSummary.averageRoaS.toFixed(2)}x vs Meta ${metaSummary.averageRoaS.toFixed(2)}x.`,
      })
    }
  }

  return { insights, algorithmic }
}

// Convex value schema for AlgorithmicInsight
const algorithmicInsightSchema = v.object({
  id: v.string(),
  type: v.string(),
  level: v.string(),
  category: v.string(),
  title: v.string(),
  message: v.string(),
  suggestion: v.string(),
  score: v.optional(v.number()),
  impact: v.optional(v.string()),
  effort: v.optional(v.string()),
  metrics: v.optional(v.record(v.string(), v.number())),
  relatedProviders: v.optional(v.array(v.string())),
  chartData: v.optional(v.array(v.object({
    label: v.string(),
    value: v.number(),
    color: v.optional(v.string()),
    secondaryValue: v.optional(v.number()),
  }))),
})

/**
 * Generate analytics insights using AI and algorithmic analysis.
 * Fetches metrics from Convex and generates both AI-powered and algorithmic insights.
 */
export const generateInsights = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.string()),
    periodDays: v.optional(v.number()),
  },
  returns: v.object({
    insights: v.array(v.object({
      providerId: v.string(),
      summary: v.string(),
    })),
    algorithmic: v.array(v.object({
      providerId: v.string(),
      suggestions: v.array(algorithmicInsightSchema),
    })),
  }),
  handler: async (ctx, args) => {
    const periodDays = args.periodDays ?? 30
    const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000

    // Fetch metrics from Convex
    const metrics = await ctx.runQuery(api.adsMetrics.listMetrics, {
      workspaceId: args.workspaceId,
      clientId: args.clientId ?? null,
      limit: 150,
    })

    const records: MetricRecord[] = (metrics as any[])
      .map((row) => ({
        providerId: typeof row.providerId === 'string' ? row.providerId : 'unknown',
        date: typeof row.date === 'string' ? row.date : 'unknown',
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        conversions: Number(row.conversions ?? 0),
        revenue: row.revenue !== undefined && row.revenue !== null ? Number(row.revenue) : null,
        createdAt: toISO(row.createdAtMs ?? null),
        clientId: typeof row.clientId === 'string' ? row.clientId : null,
      }))
      .filter((metric) => {
        if (!metric.date) return false
        const metricDate = new Date(metric.date).getTime()
        return Number.isFinite(metricDate) ? metricDate >= cutoff : true
      })

    if (records.length === 0) {
      return { insights: [], algorithmic: [] }
    }

    const summaries = summarizeByProvider(records, periodDays)
    const { insights, algorithmic } = await generateAllInsights(summaries)

    return { insights, algorithmic }
  },
})
