"use node"

import { v } from 'convex/values'

import { api } from './_generated/api'
import { action } from './_generated/server'

import { geminiAI } from '../src/services/gemini'
import { formatCurrency } from '../src/lib/utils'
import { withErrorHandling } from './errors'
import {
  calculateAlgorithmicInsights,
  getGlobalBudgetSuggestions,
  enrichSummaryWithMetrics,
  type AdMetricsSummary,
  type AlgorithmicInsight,
  type EnrichedMetricsSummary,
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

function isGoogleAnalyticsProvider(providerId: string) {
  return providerId === 'google-analytics'
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

    const summary = map.get(metric.providerId)
    if (!summary) return
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

function buildInsightPrompt(summary: EnrichedMetricsSummary) {
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

function buildGoogleAnalyticsPrompt(summary: ProviderSummary) {
  const totalUsers = summary.totalImpressions
  const totalSessions = summary.totalClicks
  const revenuePerSession = totalSessions > 0 ? summary.totalRevenue / totalSessions : 0
  const sessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0

  return `You are an expert web analytics strategist. Provide a concise, actionable summary for a Google Analytics property.

Property: Google Analytics
Period: ${summary.period}
Total Users: ${totalUsers}
Total Sessions: ${totalSessions}
Total Conversions: ${summary.totalConversions}
Total Revenue: ${summary.totalRevenue.toFixed(2)}
Conversion Rate: ${summary.averageConvRate.toFixed(2)}%
Revenue Per Session: ${revenuePerSession.toFixed(2)}
Sessions Per User: ${sessionsPerUser.toFixed(2)}

Include:
- Overall traffic quality assessment
- What looks healthy or weak
- One concrete optimization idea for acquisition or landing-page performance
Keep it under 120 words.`
}

function buildGoogleAnalyticsFallback(summary: ProviderSummary) {
  const totalUsers = summary.totalImpressions
  const totalSessions = summary.totalClicks
  const revenuePerSession = totalSessions > 0 ? summary.totalRevenue / totalSessions : 0
  return `Google Analytics recorded ${totalUsers.toLocaleString()} users, ${totalSessions.toLocaleString()} sessions, ${summary.totalConversions.toLocaleString()} conversions, and ${formatCurrency(summary.totalRevenue)} in revenue. Conversion rate was ${summary.averageConvRate.toFixed(2)}% with ${formatCurrency(revenuePerSession)} revenue per session.`
}

function generateGoogleAnalyticsSuggestions(summary: ProviderSummary): AlgorithmicInsight[] {
  const users = summary.totalImpressions
  const sessions = summary.totalClicks
  const conversions = summary.totalConversions
  const revenue = summary.totalRevenue
  const conversionRate = summary.averageConvRate
  const sessionsPerUser = users > 0 ? sessions / users : 0
  const revenuePerSession = sessions > 0 ? revenue / sessions : 0

  const suggestions: AlgorithmicInsight[] = []

  suggestions.push({
    id: `ga-conversion-${summary.period}`,
    type: 'trend',
    level: conversionRate >= 4 ? 'success' : conversionRate >= 2 ? 'info' : 'warning',
    category: 'Conversion Quality',
    title: conversionRate >= 4 ? 'Healthy conversion efficiency' : conversionRate >= 2 ? 'Stable conversion efficiency' : 'Conversion efficiency can improve',
    message: `The property converted ${conversionRate.toFixed(2)}% of sessions into conversions over ${summary.period}.`,
    suggestion: conversionRate >= 4
      ? 'Use the top-performing landing pages and channels from this period as your baseline for future experiments.'
      : 'Review your landing pages and acquisition sources to identify where sessions are dropping before conversion.',
    score: Math.max(35, Math.min(95, Math.round(conversionRate * 18))),
  })

  suggestions.push({
    id: `ga-engagement-${summary.period}`,
    type: 'audience',
    level: sessionsPerUser >= 1.4 ? 'success' : sessionsPerUser >= 1.1 ? 'info' : 'warning',
    category: 'Engagement Depth',
    title: sessionsPerUser >= 1.4 ? 'Users are returning' : sessionsPerUser >= 1.1 ? 'Engagement is steady' : 'Engagement depth is shallow',
    message: `Sessions per user is ${sessionsPerUser.toFixed(2)}x across ${users.toLocaleString()} users.`,
    suggestion: sessionsPerUser >= 1.4
      ? 'Double down on the channels and content journeys that are bringing users back for multiple sessions.'
      : 'Audit the first-session experience and key navigation paths to encourage more repeat sessions.',
    score: Math.max(30, Math.min(92, Math.round(sessionsPerUser * 55))),
  })

  if (sessions > 0 && (revenue > 0 || conversions > 0)) {
    suggestions.push({
      id: `ga-value-${summary.period}`,
      type: 'efficiency',
      level: revenuePerSession >= 3 ? 'success' : revenuePerSession >= 1 ? 'info' : 'warning',
      category: 'Session Value',
      title: revenuePerSession >= 3 ? 'Sessions are monetizing well' : revenuePerSession >= 1 ? 'Sessions are generating value' : 'Session value is low',
      message: `Revenue per session is ${formatCurrency(revenuePerSession)} with ${conversions.toLocaleString()} recorded conversions.`,
      suggestion: revenuePerSession >= 3
        ? 'Use this period as a benchmark and isolate the acquisition sources behind your highest-value sessions.'
        : 'Break out sessions by source or landing page to identify where low-value traffic is entering the funnel.',
      score: Math.max(28, Math.min(96, Math.round(revenuePerSession * 18))),
    })
  }

  return suggestions
}

function buildComparisonPrompt(google: EnrichedMetricsSummary, meta: EnrichedMetricsSummary) {
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
  const adSummaries = summaries.filter((summary) => !isGoogleAnalyticsProvider(summary.providerId))
  const enrichedSummaries = adSummaries.map((summary) => enrichSummaryWithMetrics(summary as AdMetricsSummary))

  // 1. Generate Algorithmic Insights
  summaries.forEach((summary) => {
    const suggestions = isGoogleAnalyticsProvider(summary.providerId)
      ? generateGoogleAnalyticsSuggestions(summary)
      : calculateAlgorithmicInsights(summary as AdMetricsSummary)

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
  for (const summary of summaries) {
    const prompt = isGoogleAnalyticsProvider(summary.providerId)
      ? buildGoogleAnalyticsPrompt(summary)
      : buildInsightPrompt(enrichSummaryWithMetrics(summary as AdMetricsSummary))

    try {
      const content = await geminiAI.generateContent(prompt)
      insights.push({ providerId: summary.providerId, summary: content })
    } catch (error) {
      console.error('[analyticsInsights] gemini failed', error)
      insights.push({
        providerId: summary.providerId,
        summary: isGoogleAnalyticsProvider(summary.providerId)
          ? buildGoogleAnalyticsFallback(summary)
          : `Unable to generate AI insight. Spend ${formatCurrency(summary.totalSpend)}, revenue ${formatCurrency(summary.totalRevenue)}, ROAS ${summary.averageRoaS.toFixed(2)}x.`,
      })
    }
  }

  const googleSummary = summaries.find((s) => s.providerId === 'google')
  const metaSummary = summaries.find((s) => s.providerId === 'facebook')
  const googleEnrichedSummary = enrichedSummaries.find((s) => s.providerId === 'google')
  const metaEnrichedSummary = enrichedSummaries.find((s) => s.providerId === 'facebook')

  if (googleSummary && metaSummary && googleEnrichedSummary && metaEnrichedSummary) {
    const prompt = buildComparisonPrompt(googleEnrichedSummary, metaEnrichedSummary)
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
    providerIds: v.optional(v.array(v.string())),
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
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const periodDays = args.periodDays ?? 30
      const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000

      // Fetch metrics from Convex
      const metrics = await ctx.runQuery(api.adsMetrics.listMetrics, {
        workspaceId: args.workspaceId,
        clientId: args.clientId ?? null,
        providerIds: args.providerIds,
        limit: 150,
      })

      const metricRows = Array.isArray(metrics) ? metrics : []

      const records: MetricRecord[] = metricRows
        .map((row) => {
          const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
          return {
            providerId: typeof record?.providerId === 'string' ? record.providerId : 'unknown',
            date: typeof record?.date === 'string' ? record.date : 'unknown',
            spend: Number(record?.spend ?? 0),
            impressions: Number(record?.impressions ?? 0),
            clicks: Number(record?.clicks ?? 0),
            conversions: Number(record?.conversions ?? 0),
            revenue: record?.revenue !== undefined && record.revenue !== null ? Number(record.revenue) : null,
            createdAt: toISO(typeof record?.createdAtMs === 'number' ? record.createdAtMs : null),
            clientId: typeof record?.clientId === 'string' ? record.clientId : null,
          }
        })
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
    }, 'analyticsInsights:generateInsights'),
})
