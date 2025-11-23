import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { geminiAI } from '@/services/gemini'
import { formatCurrency } from '@/lib/utils'

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
  averageRoaS: number
  averageCpc: number
  period: string
}

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)

    let userId: string | null = null
    if (authResult.isCron) {
      userId = request.nextUrl.searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ error: 'Cron requests must specify userId' }, { status: 400 })
      }
    } else {
      userId = authResult.uid
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to resolve user context' }, { status: 401 })
    }

    const clientIdFilter = request.nextUrl.searchParams.get('clientId')?.trim() ?? null
    const periodParam = request.nextUrl.searchParams.get('periodDays')
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
      return NextResponse.json({ insights: [] })
    }

    const summaries = summarizeByProvider(records, periodDays)
    const insights = await generateInsightsFromGemini(summaries)

    return NextResponse.json({ insights })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[analytics/insights] failed to load', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
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
  })

  map.forEach((summary) => {
    summary.averageRoaS = summary.totalSpend > 0 ? summary.totalRevenue / summary.totalSpend : 0
    summary.averageCpc = summary.totalClicks > 0 ? summary.totalSpend / summary.totalClicks : 0
  })

  return Array.from(map.values())
}

async function generateInsightsFromGemini(summaries: ProviderSummary[]) {
  const insights = [] as Array<{ providerId: string; summary: string }>

  for (const summary of summaries) {
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

  return insights
}

function buildInsightPrompt(summary: ProviderSummary) {
  return `You are an expert marketing analyst. Provide a concise, actionable summary for the following ad platform.

Platform: ${summary.providerId}
Period: ${summary.period}
Total Spend: ${summary.totalSpend.toFixed(2)}
Total Revenue: ${summary.totalRevenue.toFixed(2)}
Total Clicks: ${summary.totalClicks}
Total Conversions: ${summary.totalConversions}
Average ROAS: ${summary.averageRoaS.toFixed(2)}
Average CPC: ${summary.averageCpc.toFixed(2)}

Include:
- Overall performance assessment
- Notable changes or risks
- One actionable recommendation
Keep it under 120 words.`
}

function buildComparisonPrompt(google: ProviderSummary, meta: ProviderSummary) {
  return `You are an expert marketing analyst. Compare the performance of Google Ads and Meta (Facebook) Ads based on the following data.

Google Ads:
- Spend: ${google.totalSpend.toFixed(2)}
- Revenue: ${google.totalRevenue.toFixed(2)}
- ROAS: ${google.averageRoaS.toFixed(2)}
- CPC: ${google.averageCpc.toFixed(2)}

Meta Ads:
- Spend: ${meta.totalSpend.toFixed(2)}
- Revenue: ${meta.totalRevenue.toFixed(2)}
- ROAS: ${meta.averageRoaS.toFixed(2)}
- CPC: ${meta.averageCpc.toFixed(2)}

Provide a concise comparison highlighting which platform is performing better and why. Suggest where to allocate more budget. Keep it under 120 words.`
}
