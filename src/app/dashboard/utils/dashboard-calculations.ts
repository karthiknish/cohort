import { useMemo } from 'react'
import {
    TriangleAlert,
    BarChart3,
    Clock3,
    DollarSign,
    ListChecks,
    Megaphone,
    TrendingUp,
    Shield,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { MetricRecord, SummaryStat } from '@/types/dashboard'
import {
    sumOutstanding,
    formatNextDueLabel,
    selectTopStatsByRole,
    type TaskSummary,
} from '../components'

export interface BuildStatsOptions {
    financeSummary: FinanceSummaryResponse | null
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
    const { financeSummary, metrics, taskSummary, userRole } = options

    const revenueRecords = Array.isArray(financeSummary?.revenue) ? financeSummary.revenue : []
    const costs = Array.isArray(financeSummary?.costs) ? financeSummary.costs : []
    const payments = financeSummary?.payments
    const metricsArray = Array.isArray(metrics) ? metrics : []

    const totalRevenue = revenueRecords.reduce((sum, record) => sum + (record.revenue || 0), 0)
    const totalOperatingExpenses = revenueRecords.reduce((sum, record) => sum + (record.operatingExpenses || 0), 0)
    const totalCompanyCosts = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    const totalAdSpend = metricsArray.reduce((sum, record) => sum + (record.spend || 0), 0)
    const providerCount = metricsArray.length > 0 ? new Set(metricsArray.map((record) => record.providerId)).size : 0
    const combinedExpenses = totalOperatingExpenses + totalCompanyCosts + totalAdSpend
    const netMargin = totalRevenue - combinedExpenses
    const roas = totalAdSpend > 0 && totalRevenue > 0 ? totalRevenue / totalAdSpend : null
    const totalConversions = metricsArray.reduce((sum, record) => sum + (record.conversions || 0), 0)
    const totalOutstanding = sumOutstanding(financeSummary?.payments?.totals ?? [])
    const overdueInvoices = payments?.overdueCount ?? 0
    const openInvoices = payments?.openCount ?? 0
    const nextDueLabel = formatNextDueLabel(payments?.nextDueAt)

    // Detect currency from records
    const currencies = new Set([
        ...revenueRecords.map((r) => r.currency).filter(Boolean),
        ...costs.map((c) => c.currency).filter(Boolean),
        ...(Array.isArray(payments?.totals) ? payments.totals : []).map((entry) => entry.currency).filter(Boolean),
    ])
    const displayCurrency = currencies.size === 1 ? (Array.from(currencies)[0] as string) : 'USD'

    const stats: SummaryStat[] = [
        {
            id: 'total-revenue',
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue, displayCurrency),
            helper:
                revenueRecords.length > 0
                    ? revenueRecords.length === 1
                        ? 'Based on the latest billing period'
                        : `Based on ${revenueRecords.length} billing periods`
                    : 'Add revenue records to track income',
            icon: DollarSign,
            emphasis: totalRevenue > 0 ? 'positive' : 'neutral',
            urgency: totalRevenue <= 0 ? 'medium' : 'low',
        },
        {
            id: 'net-margin',
            label: 'Net Margin',
            value: formatCurrency(netMargin, displayCurrency),
            helper: 'Money left after marketing and operating costs',
            icon: TrendingUp,
            emphasis: netMargin > 0 ? 'positive' : netMargin < 0 ? 'negative' : 'neutral',
            urgency: netMargin < 0 ? 'high' : netMargin === 0 ? 'medium' : 'low',
        },
        {
            id: 'roas',
            label: 'ROAS',
            value: roas ? `${roas.toFixed(2)}x` : '—',
            helper: roas ? 'Shows revenue versus ad spend' : 'Need revenue and ad spend data',
            icon: BarChart3,
            emphasis: roas && roas < 1 ? 'negative' : roas && roas >= 1.5 ? 'positive' : 'neutral',
            urgency: roas && roas < 1 ? 'high' : roas && roas < 1.5 ? 'medium' : 'low',
        },
        {
            id: 'ad-spend',
            label: 'Ad Spend',
            value: formatCurrency(totalAdSpend, displayCurrency),
            helper: providerCount > 0 ? `Data from ${providerCount} ad platforms` : 'Connect ad accounts to see spend',
            icon: Megaphone,
            emphasis: 'neutral',
            urgency: providerCount === 0 ? 'medium' : 'low',
        },
        {
            id: 'outstanding',
            label: 'Outstanding',
            value: formatCurrency(totalOutstanding, displayCurrency),
            helper: totalOutstanding > 0 ? `${openInvoices} open invoice${openInvoices === 1 ? '' : 's'}` : 'No outstanding balances',
            icon: Shield,
            emphasis: totalOutstanding > 0 ? 'negative' : 'neutral',
            urgency: overdueInvoices > 0 ? 'high' : totalOutstanding > 0 ? 'medium' : 'low',
        },
        {
            id: 'overdue-invoices',
            label: 'Overdue invoices',
            value: overdueInvoices.toString(),
            helper: overdueInvoices > 0 ? 'Follow up on late payments' : 'All invoices on track',
            icon: TriangleAlert,
            emphasis: overdueInvoices > 0 ? 'negative' : 'neutral',
            urgency: overdueInvoices > 0 ? 'high' : 'low',
        },
        {
            id: 'next-due',
            label: 'Next due',
            value: nextDueLabel ?? 'None scheduled',
            helper: openInvoices > 0 ? `${openInvoices} open invoice${openInvoices === 1 ? '' : 's'}` : 'No invoices currently open',
            icon: Clock3,
            emphasis: nextDueLabel?.includes('overdue') ? 'negative' : 'neutral',
            urgency: nextDueLabel?.includes('overdue') ? 'high' : openInvoices > 0 ? 'medium' : 'low',
        },
        {
            id: 'open-tasks',
            label: 'Open tasks',
            value: taskSummary.total.toString(),
            helper: `${taskSummary.highPriority} high priority · ${taskSummary.overdue} overdue`,
            icon: ListChecks,
            emphasis: taskSummary.overdue > 0 ? 'negative' : taskSummary.highPriority > 0 ? 'neutral' : 'positive',
            urgency: taskSummary.overdue > 0 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
        },
        {
            id: 'due-soon',
            label: 'Due soon (3d)',
            value: taskSummary.dueSoon.toString(),
            helper: taskSummary.dueSoon > 0 ? 'Focus on short-term deliverables' : 'No tasks due in the next 3 days',
            icon: Clock3,
            emphasis: taskSummary.dueSoon > 3 ? 'negative' : taskSummary.dueSoon > 0 ? 'neutral' : 'positive',
            urgency: taskSummary.dueSoon > 3 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
        },
        {
            id: 'conversions',
            label: 'Conversions',
            value: totalConversions.toLocaleString('en-US'),
            helper: providerCount > 0 ? `From ${providerCount} channels` : 'Connect ad platforms to track conversions',
            icon: TrendingUp,
            emphasis: totalConversions === 0 ? 'neutral' : 'positive',
            urgency: totalConversions === 0 ? 'medium' : 'low',
        },
        {
            id: 'active-channels',
            label: 'Active channels',
            value: providerCount.toString(),
            helper: providerCount > 0 ? 'Ad platforms connected' : 'Connect ad platforms to see spend',
            icon: Megaphone,
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

export function useDashboardStats(options: BuildStatsOptions): StatsResult {
    return useMemo(() => buildDashboardStats(options), [
        options.financeSummary,
        options.metrics,
        options.taskSummary,
        options.userRole,
    ])
}

export function buildChartData(
    metrics: MetricRecord[],
    financeSummary: FinanceSummaryResponse | null
): Array<{ date: string; revenue: number; spend: number }> {
    const dailyMap = new Map<string, { revenue: number; spend: number }>()

    if (Array.isArray(metrics)) {
        metrics.forEach((m) => {
            if (!m || typeof m.date !== 'string') return
            const date = m.date.split('T')[0]!
            const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
            dailyMap.set(date, {
                ...current,
                spend: current.spend + (Number(m.spend) || 0),
            })
        })
    }

    const revenueRecords = Array.isArray(financeSummary?.revenue)
        ? financeSummary!.revenue
        : []

    if (Array.isArray(revenueRecords)) {
        revenueRecords.forEach((r) => {
            if (!r) return
            let date = ''
            if (typeof r.period === 'string' && r.period.length === 7) {
                // YYYY-MM -> YYYY-MM-01
                date = `${r.period}-01`
            } else if (r.createdAt) {
                date = typeof r.createdAt === 'string' ? r.createdAt.split('T')[0]! : ''
            }

            if (date) {
                const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
                dailyMap.set(date, {
                    ...current,
                    revenue: current.revenue + (Number(r.revenue) || 0),
                })
            }
        })
    }

    return Array.from(dailyMap.entries())
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date))
}
