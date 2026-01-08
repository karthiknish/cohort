export interface MetricRecord {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  creatives?: Array<{
    id: string
    name: string
    type: string
    url?: string
    spend?: number
    impressions?: number
    clicks?: number
    conversions?: number
    revenue?: number
  }>
}

export interface MetricsResponse {
  metrics?: MetricRecord[]
  nextCursor?: string | null
}

export interface ProviderInsight {
  providerId: string
  summary: string
}

export interface AlgorithmicSuggestion {
  type: 'efficiency' | 'budget' | 'creative' | 'audience'
  level: 'success' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  suggestion: string
  score?: number
}

export interface AlgorithmicInsight {
  providerId: string
  suggestions: AlgorithmicSuggestion[]
}

export const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Ads',
  'google-analytics': 'Google Analytics',
  facebook: 'Meta Ads',
  linkedin: 'LinkedIn Ads',
  tiktok: 'TikTok Ads',
}

export const PERIOD_OPTIONS = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '90d', label: '90 days', days: 90 },
] as const

export const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All platforms' },
  { value: 'google', label: 'Google Ads' },
  { value: 'google-analytics', label: 'Google Analytics' },
  { value: 'facebook', label: 'Meta Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
] as const
