import { formatCurrency } from './utils'

export interface AdMetricsSummary {
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

export interface AlgorithmicInsight {
  type: 'efficiency' | 'budget' | 'creative' | 'audience'
  level: 'success' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  suggestion: string
  score?: number
}

export function calculateAlgorithmicInsights(summary: AdMetricsSummary): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const {
    totalSpend,
    totalRevenue,
    totalClicks,
    totalConversions,
    averageRoaS,
    averageCpc,
  } = summary

  if (totalSpend === 0) return []

  const cpa = totalConversions > 0 ? totalSpend / totalConversions : Infinity
  const ctr = summary.totalImpressions > 0 ? (totalClicks / summary.totalImpressions) * 100 : 0
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  // 1. ROAS Analysis
  if (averageRoaS > 4) {
    insights.push({
      type: 'efficiency',
      level: 'success',
      title: 'High Performance Detected',
      message: `Your ROAS is exceptional at ${averageRoaS.toFixed(2)}x.`,
      suggestion: 'Consider scaling the budget for this platform by 15-20% to capture more high-value traffic.',
      score: 90,
    })
  } else if (averageRoaS < 1.5 && totalSpend > 100) {
    insights.push({
      type: 'efficiency',
      level: 'critical',
      title: 'Low Efficiency Warning',
      message: `ROAS is currently ${averageRoaS.toFixed(2)}x, which may be below break-even.`,
      suggestion: 'Pause underperforming ad sets and re-evaluate your value proposition or offer.',
      score: 30,
    })
  }

  // 2. CPC & CTR Analysis (Ad Relevance)
  if (averageCpc > 5 && convRate < 1) {
    insights.push({
      type: 'creative',
      level: 'warning',
      title: 'High Acquisition Cost',
      message: `Average CPC is high (${formatCurrency(averageCpc)}) while conversion rate is low (${convRate.toFixed(2)}%).`,
      suggestion: 'Test new ad creatives with stronger calls-to-action to improve click quality.',
      score: 45,
    })
  }

  // 3. Conversion Rate Analysis (Landing Page)
  if (totalClicks > 500 && convRate < 0.5) {
    insights.push({
      type: 'audience',
      level: 'warning',
      title: 'Landing Page Friction',
      message: `You have significant traffic (${totalClicks} clicks) but a very low conversion rate (${convRate.toFixed(2)}%).`,
      suggestion: 'Audit your landing page load speed and mobile responsiveness. Ensure the ad promise matches the page content.',
      score: 40,
    })
  }

  // 4. CPA Analysis
  if (cpa !== Infinity && cpa > 50 && averageRoaS < 2) {
    insights.push({
      type: 'budget',
      level: 'info',
      title: 'CPA Optimization Opportunity',
      message: `Current CPA is ${formatCurrency(cpa)}.`,
      suggestion: 'Switch to a "Target CPA" bidding strategy if available to let the algorithm optimize for conversions.',
      score: 60,
    })
  }

  return insights
}

export function getGlobalBudgetSuggestions(summaries: AdMetricsSummary[]): AlgorithmicInsight[] {
  if (summaries.length < 2) return []

  const insights: AlgorithmicInsight[] = []
  
  // Sort by ROAS descending
  const sortedByRoas = [...summaries].sort((a, b) => b.averageRoaS - a.averageRoaS)
  const best = sortedByRoas[0]
  const worst = sortedByRoas[sortedByRoas.length - 1]

  if (best.averageRoaS > worst.averageRoaS * 1.5 && worst.totalSpend > 0) {
    insights.push({
      type: 'budget',
      level: 'info',
      title: 'Cross-Platform Reallocation',
      message: `${best.providerId} is outperforming ${worst.providerId} by ${(best.averageRoaS / worst.averageRoaS).toFixed(1)}x in ROAS.`,
      suggestion: `Shift 10-15% of the budget from ${worst.providerId} to ${best.providerId} to maximize overall return.`,
    })
  }

  return insights
}
