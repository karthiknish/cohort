// =============================================================================
// AD ALGORITHMS - Core Types
// =============================================================================

/**
 * Core metric data for a single day/provider combination
 */
export interface MetricDataPoint {
  date: string
  providerId: string
  accountId?: string | null
  spend: number
  revenue: number
  clicks: number
  conversions: number
  impressions: number
}

/**
 * Aggregated summary for a provider/account
 */
export interface AdMetricsSummary {
  providerId: string
  accountId?: string | null
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

/**
 * Enriched summary with calculated metrics
 */
export interface EnrichedMetricsSummary extends AdMetricsSummary {
  // Industry Standard Metrics
  mer: number           // Marketing Efficiency Ratio
  aov: number           // Average Order Value
  rpc: number           // Revenue Per Click
  roi: number           // Return on Investment
  cpa: number           // Cost Per Acquisition
  cpm: number           // Cost Per Mille
  // Custom Scores
  efficiencyScore: number
  healthScore: number
  growthPotential: number
}

/**
 * Time series data for trend analysis
 */
export interface TimeSeriesPoint {
  date: string
  value: number
  metric: string
}

/**
 * Trend analysis result
 */
export interface TrendResult {
  metric: string
  direction: 'up' | 'down' | 'stable'
  velocity: number          // Rate of change per day
  acceleration: number      // Change in velocity
  momentum: number          // Weighted recent trend strength (0-100)
  forecast7Day: number      // Predicted value in 7 days
  confidence: number        // Confidence in the prediction (0-1)
  seasonalityDetected: boolean
  anomalies: AnomalyPoint[]
}

/**
 * Anomaly detection result
 */
export interface AnomalyPoint {
  date: string
  value: number
  expectedValue: number
  deviation: number         // Standard deviations from mean
  severity: 'low' | 'medium' | 'high'
}

/**
 * Funnel stage metrics
 */
export interface FunnelStage {
  name: string
  value: number
  percentage: number
  dropOffRate: number
  costPerStage: number
}

/**
 * Funnel analysis result
 */
export interface FunnelAnalysis {
  stages: FunnelStage[]
  overallConversionRate: number
  bottleneckStage: string | null
  biggestDropOff: { stage: string; rate: number } | null
  recommendations: string[]
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparison {
  metric: string
  currentValue: number
  benchmarkValue: number
  percentile: number        // Where current value falls (0-100)
  status: 'below' | 'average' | 'above' | 'excellent'
  gap: number               // Difference from benchmark
  gapPercent: number
}

/**
 * Industry benchmarks by platform
 */
export interface IndustryBenchmarks {
  providerId: string
  ctr: number
  cpc: number
  conversionRate: number
  cpa: number
  roas: number
  cpm: number
}

/**
 * Algorithmic insight with rich metadata
 */
export interface AlgorithmicInsight {
  id: string
  type: 'efficiency' | 'budget' | 'creative' | 'audience' | 'trend' | 'funnel' | 'benchmark'
  level: 'success' | 'warning' | 'info' | 'critical'
  category: string
  title: string
  message: string
  suggestion: string
  score?: number
  impact?: 'high' | 'medium' | 'low'
  effort?: 'high' | 'medium' | 'low'
  metrics?: Record<string, number>
  relatedProviders?: string[]
  chartData?: ChartDataPoint[]
}

/**
 * Chart data point for visualizations
 */
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  secondaryValue?: number
}

/**
 * Provider comparison data for charts
 */
export interface ProviderComparisonData {
  providerId: string
  displayName: string
  color: string
  metrics: {
    spend: number
    revenue: number
    roas: number
    ctr: number
    cpc: number
    conversionRate: number
    efficiencyScore: number
  }
}

/**
 * Efficiency breakdown for radar/polar charts
 */
export interface EfficiencyBreakdown {
  dimension: string
  score: number
  weight: number
  benchmark: number
}

/**
 * Budget allocation recommendation
 */
export interface BudgetAllocation {
  providerId: string
  currentSpend: number
  recommendedSpend: number
  changePercent: number
  reason: string
  expectedRoasChange: number
}
