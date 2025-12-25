import { NextRequest } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { AuthenticationError } from '@/lib/server-auth'
import { geminiAI } from '@/services/gemini'
import { formatCurrency, toISO } from '@/lib/utils'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, ValidationError } from '@/lib/api-errors'
import { calculateAlgorithmicInsights, getGlobalBudgetSuggestions, AdMetricsSummary, enrichSummaryWithMetrics } from '@/lib/ad-algorithms'

const insightsQuerySchema = z.object({
  userId: z.string().optional(),
  clientId: z.string().optional(),
  periodDays: z.string().optional(),
})

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
  period: string
}

export const GET = createApiHandler(
  {
    querySchema: insightsQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, query }) => {
    let userId: string | null = null
    if (auth.isCron) {
      userId = query.userId ?? null
      if (!userId) {
        throw new ValidationError('Cron requests must specify userId')
      }
    } else {
      userId = auth.uid ?? null
    }

    if (!userId) {
      throw new UnauthorizedError('Unable to resolve user context')
    }

    const clientIdFilter = query.clientId?.trim() ?? null
    const periodParam = query.periodDays
    const periodDays = periodParam ? Math.max(Number(periodParam) || 30, 1) : 30
    const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000

    const metricsQuery = adminDb
      .collection('users')
      .doc(userId)
      .collection('adMetrics')
      .orderBy('createdAt', 'desc')
      .limit(150)
    const snapshot = await metricsQuery.get()

    const records: MetricRecord[] = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>
        return {
          providerId: typeof data.providerId === 'string' ? data.providerId : 'unknown',
          date: typeof data.date === 'string' ? data.date : 'unknown',
          spend: Number(data.spend ?? 0),
          impressions: Number(data.impressions ?? 0),
          clicks: Number(data.clicks ?? 0),
          conversions: Number(data.conversions ?? 0),
          revenue: data.revenue !== undefined ? Number(data.revenue) : null,
          createdAt: toISO(data.createdAt ?? null),
          clientId: typeof data.clientId === 'string' ? data.clientId : null,
        }
      })
      .filter((metric) => {
        if (clientIdFilter) {
          if (metric.clientId) {
            if (metric.clientId !== clientIdFilter) {
              return false
            }
          } else {
            return false
          }
        }
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
  }
)

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
        period: `${periodDays}d`,
      })
    }

    const summary = map.get(metric.providerId)!
    summary.totalSpend += metric.spend
    summary.totalRevenue += metric.revenue ?? 0
    summary.totalClicks += metric.clicks
    summary.totalConversions += metric.conversions
    summary.totalImpressions += metric.impressions
  })

  map.forEach((summary) => {
    summary.averageRoaS = summary.totalSpend > 0 ? summary.totalRevenue / summary.totalSpend : 0
    summary.averageCpc = summary.totalClicks > 0 ? summary.totalSpend / summary.totalClicks : 0
  })

  return Array.from(map.values())
}

async function generateAllInsights(summaries: ProviderSummary[]) {
  const insights = [] as Array<{ providerId: string; summary: string }>
  const algorithmic = [] as Array<{ providerId: string; suggestions: any[] }>
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
          type: 'efficiency',
          level: globalMer > 3 ? 'success' : globalMer > 1.5 ? 'info' : 'warning',
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
      console.error('[analytics/insights] gemini failed', error)
      insights.push({
        providerId: summary.providerId,
        summary: `Unable to generate AI insight. Spend ${formatCurrency(summary.totalSpend)}, revenue ${formatCurrency(summary.totalRevenue)}, ROAS ${summary.averageRoaS.toFixed(2)}x.`,
      })
    }
  }

  const googleSummary = summaries.find((s) => s.providerId === 'google')
  const metaSummary = summaries.find((s) => s.providerId === 'facebook')

  if (googleSummary && metaSummary) {
    const prompt = buildComparisonPrompt(googleSummary, metaSummary)
    try {
      const content = await geminiAI.generateContent(prompt)
      insights.push({ providerId: 'google_vs_facebook', summary: content })
    } catch (error) {
      console.error('[analytics/insights] comparison prompt failed', error)
      insights.push({
        providerId: 'google_vs_facebook',
        summary: `Comparison insight unavailable. Google ROAS ${googleSummary.averageRoaS.toFixed(2)}x vs Meta ${metaSummary.averageRoaS.toFixed(2)}x.`,
      })
    }
  }

  return { insights, algorithmic }
}

function buildInsightPrompt(summary: AdMetricsSummary) {
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

function buildComparisonPrompt(google: AdMetricsSummary, meta: AdMetricsSummary) {
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
