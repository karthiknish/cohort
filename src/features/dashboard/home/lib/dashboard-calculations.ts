import { useMemo } from 'react'
import {
    BarChart3,
    Clock3,
    DollarSign,
    MousePointer,
    ListChecks,
    Megaphone,
    TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { MetricRecord, SummaryStat } from '@/types/dashboard'
import {
    selectTopStatsByRole,
    type TaskSummary,
} from '../components'

export interface BuildStatsOptions {
    metrics: MetricRecord[]
    taskSummary: TaskSummary
    userRole?: string | null
}

export interface StatsResult {
    primaryStats: SummaryStat[]
    secondaryStats: SummaryStat[]
    orderedStats: SummaryStat[]
}

export function buildDashboardStats(options: BuildStatsOptions): StatsResult {
    const { metrics, taskSummary, userRole } = options

    const metricsArray = Array.isArray(metrics) ? metrics : []

    const totalRevenue = metricsArray.reduce((sum, record) => sum + (record.revenue || 0), 0)
    const totalAdSpend = metricsArray.reduce((sum, record) => sum + (record.spend || 0), 0)
    const totalClicks = metricsArray.reduce((sum, record) => sum + (record.clicks || 0), 0)
    const totalImpressions = metricsArray.reduce((sum, record) => sum + (record.impressions || 0), 0)
    const providerCount = metricsArray.length > 0 ? new Set(metricsArray.map((record) => record.providerId)).size : 0
    const netMargin = totalRevenue - totalAdSpend
    const roas = totalAdSpend > 0 && totalRevenue > 0 ? totalRevenue / totalAdSpend : null
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null
    const totalConversions = metricsArray.reduce((sum, record) => sum + (record.conversions || 0), 0)
    const displayCurrency = 'USD'

    const stats: SummaryStat[] = [
        {
            id: 'total-revenue',
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue, displayCurrency),
            helper:
                metricsArray.length > 0
                    ? `${metricsArray.length} synced metric ${metricsArray.length === 1 ? 'record' : 'records'}`
                    : 'Add revenue records to track income',
            icon: DollarSign,
            href: '/dashboard/analytics',
            featureLabel: 'Open analytics',
            emphasis: totalRevenue > 0 ? 'positive' : 'neutral',
            urgency: totalRevenue <= 0 ? 'medium' : 'low',
        },
        {
            id: 'net-margin',
            label: 'Net Margin',
            value: formatCurrency(netMargin, displayCurrency),
            helper: 'Revenue minus ad spend for the selected window',
            icon: TrendingUp,
            href: '/dashboard/analytics',
            featureLabel: 'Open analytics',
            emphasis: netMargin > 0 ? 'positive' : netMargin < 0 ? 'negative' : 'neutral',
            urgency: netMargin < 0 ? 'high' : netMargin === 0 ? 'medium' : 'low',
        },
        {
            id: 'roas',
            label: 'ROAS',
            value: roas ? `${roas.toFixed(2)}x` : '—',
            helper: roas ? 'Shows revenue versus ad spend' : 'Need revenue and ad spend data',
            icon: BarChart3,
            href: '/dashboard/analytics',
            featureLabel: 'Open analytics',
            emphasis: roas && roas < 1 ? 'negative' : roas && roas >= 1.5 ? 'positive' : 'neutral',
            urgency: roas && roas < 1 ? 'high' : roas && roas < 1.5 ? 'medium' : 'low',
        },
        {
            id: 'ad-spend',
            label: 'Ad Spend',
            value: formatCurrency(totalAdSpend, displayCurrency),
            helper: providerCount > 0 ? `Data from ${providerCount} ad platforms` : 'Connect ad accounts to see spend',
            icon: Megaphone,
            href: '/dashboard/ads',
            featureLabel: 'Open ads',
            emphasis: 'neutral',
            urgency: providerCount === 0 ? 'medium' : 'low',
        },
        {
            id: 'ctr',
            label: 'CTR',
            value: ctr === null ? '—' : `${ctr.toFixed(2)}%`,
            helper: totalImpressions > 0 ? `${totalClicks.toLocaleString('en-US')} clicks from ads` : 'Need impression data',
            icon: MousePointer,
            href: '/dashboard/ads',
            featureLabel: 'Open ads',
            emphasis: ctr && ctr >= 1 ? 'positive' : ctr && ctr > 0 ? 'neutral' : 'negative',
            urgency: ctr === null ? 'medium' : ctr < 0.6 ? 'high' : ctr < 1 ? 'medium' : 'low',
        },
        {
            id: 'open-tasks',
            label: 'Open tasks',
            value: taskSummary.total.toString(),
            helper: `${taskSummary.highPriority} high priority · ${taskSummary.overdue} overdue`,
            icon: ListChecks,
            href: '/dashboard/tasks',
            featureLabel: 'Open tasks',
            emphasis: taskSummary.overdue > 0 ? 'negative' : taskSummary.highPriority > 0 ? 'neutral' : 'positive',
            urgency: taskSummary.overdue > 0 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
        },
        {
            id: 'due-soon',
            label: 'Due soon (3d)',
            value: taskSummary.dueSoon.toString(),
            helper: taskSummary.dueSoon > 0 ? 'Focus on short-term deliverables' : 'No tasks due in the next 3 days',
            icon: Clock3,
            href: '/dashboard/tasks',
            featureLabel: 'Open tasks',
            emphasis: taskSummary.dueSoon > 3 ? 'negative' : taskSummary.dueSoon > 0 ? 'neutral' : 'positive',
            urgency: taskSummary.dueSoon > 3 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
        },
        {
            id: 'conversions',
            label: 'Conversions',
            value: totalConversions.toLocaleString('en-US'),
            helper: providerCount > 0 ? `From ${providerCount} channels` : 'Connect ad platforms to track conversions',
            icon: TrendingUp,
            href: '/dashboard/analytics',
            featureLabel: 'Open analytics',
            emphasis: totalConversions === 0 ? 'neutral' : 'positive',
            urgency: totalConversions === 0 ? 'medium' : 'low',
        },
        {
            id: 'active-channels',
            label: 'Active channels',
            value: providerCount.toString(),
            helper: providerCount > 0 ? 'Ad platforms connected' : 'Connect ad platforms to see spend',
            icon: Megaphone,
            href: '/dashboard/ads',
            featureLabel: providerCount > 0 ? 'Open ads' : 'Connect ads',
            emphasis: providerCount === 0 ? 'negative' : 'neutral',
            urgency: providerCount === 0 ? 'medium' : 'low',
        },
    ]

    const { primary, secondary } = selectTopStatsByRole(stats, userRole)

    return {
        primaryStats: primary,
        secondaryStats: secondary,
        orderedStats: [...primary, ...secondary],
    }
}

export function useDashboardStats({ metrics, taskSummary, userRole }: BuildStatsOptions): StatsResult {
    return useMemo(
        () =>
            buildDashboardStats({
                metrics,
                taskSummary,
                userRole,
            }),
        [metrics, taskSummary, userRole]
    )
}

export function buildChartData(metrics: MetricRecord[]): Array<{ date: string; revenue: number; spend: number }> {
    const dailyMap = new Map<string, { revenue: number; spend: number }>()

    if (Array.isArray(metrics)) {
        metrics.forEach((m) => {
            if (!m || typeof m.date !== 'string') return
            const date = m.date.split('T')[0]
            if (!date) return
            const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
            dailyMap.set(date, {
                ...current,
                spend: current.spend + (Number(m.spend) || 0),
                revenue: current.revenue + (Number(m.revenue) || 0),
            })
        })
    }

    return Array.from(dailyMap.entries())
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date))
}
