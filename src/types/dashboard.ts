import type { LucideIcon } from 'lucide-react'

export interface MetricRecord {
  id: string
  providerId: string
  date: string
  clientId?: string | null
  createdAt?: string | null
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
}

export type SummaryStat = {
  id: string
  label: string
  value: string
  helper: string
  icon: LucideIcon
  emphasis?: 'positive' | 'negative' | 'neutral'
  urgency?: 'high' | 'medium' | 'low'
}

export type DashboardTaskItem = {
  id: string
  title: string
  dueLabel: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  clientName: string
  sortValue?: number
}

export type ClientComparisonSummary = {
  clientId: string
  clientName: string
  totalRevenue: number
  totalOperatingExpenses: number
  totalAdSpend: number
  totalConversions: number
  roas: number
  cpa: number | null
  outstanding: number
  currency: string
  periodDays: number
}

export type ComparisonInsight = {
  id: string
  title: string
  highlight: string
  body: string
  tone: 'positive' | 'warning' | 'neutral'
  icon: LucideIcon
}
