import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewFinanceSummary, getPreviewMetrics } from '@/lib/preview-data'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { MetricRecord, ClientComparisonSummary, ComparisonInsight } from '@/types/dashboard'
import {
    resolveJson,
    buildClientComparisonSummary,
    groupMetricsByClient,
    formatRoas,
    formatCpa,
    getErrorMessage,
} from '@/lib/dashboard-utils'
import { formatCurrency } from '@/lib/utils'
import { Trophy, ArrowUpRight, TriangleAlert } from 'lucide-react'
import type { ClientRecord } from '@/types/clients'

export interface UseComparisonDataOptions {
    clients: ClientRecord[]
    selectedClientId: string | null
    comparisonClientIds: string[]
    comparisonPeriodDays: number
}

export interface UseComparisonDataReturn {
    comparisonSummaries: ClientComparisonSummary[]
    comparisonLoading: boolean
    comparisonError: string | null
    comparisonInsights: ComparisonInsight[]
    comparisonAggregate: ComparisonAggregate | null
    comparisonTargets: string[]
    comparisonHasSelection: boolean
}

export interface ComparisonAggregate {
    totalRevenue: number
    totalAdSpend: number
    totalOutstanding: number
    avgRoas: number | null
    selectionCount: number
    currency: string | null
    mixedCurrencies: boolean
}

export function useComparisonData(options: UseComparisonDataOptions): UseComparisonDataReturn {
    const { clients, selectedClientId, comparisonClientIds, comparisonPeriodDays } = options
    const { user, getIdToken } = useAuth()
    const { isPreviewMode } = usePreview()

    const [comparisonSummaries, setComparisonSummaries] = useState<ClientComparisonSummary[]>([])
    const [comparisonLoading, setComparisonLoading] = useState(false)
    const [comparisonError, setComparisonError] = useState<string | null>(null)

    const comparisonTargets = comparisonClientIds.length > 0
        ? comparisonClientIds
        : selectedClientId
            ? [selectedClientId]
            : []

    const comparisonHasSelection = comparisonTargets.length > 0

    useEffect(() => {
        let isCancelled = false

        if (!user?.id) {
            setComparisonSummaries([])
            setComparisonError(null)
            setComparisonLoading(false)
            return () => {
                isCancelled = true
            }
        }

        if (isPreviewMode) {
            const targets = comparisonClientIds.length > 0 ? comparisonClientIds : selectedClientId ? [selectedClientId] : []

            if (targets.length === 0) {
                setComparisonSummaries([])
                setComparisonError(null)
                setComparisonLoading(false)
                return () => {
                    isCancelled = true
                }
            }

            setComparisonLoading(true)
            setComparisonError(null)

            try {
                const summaries = targets.map((clientId) => {
                    const name = clients.find((c) => c.id === clientId)?.name ?? 'Client'
                    return buildClientComparisonSummary({
                        clientId,
                        clientName: name,
                        finance: getPreviewFinanceSummary(clientId),
                        metrics: getPreviewMetrics(clientId),
                        periodDays: comparisonPeriodDays,
                    })
                })

                if (!isCancelled) {
                    setComparisonSummaries(summaries)
                    setComparisonLoading(false)
                }
            } catch (error) {
                if (!isCancelled) {
                    setComparisonSummaries([])
                    setComparisonError(getErrorMessage(error, 'Unable to load comparison'))
                    setComparisonLoading(false)
                }
            }

            return () => {
                isCancelled = true
            }
        }

        const targets = comparisonClientIds.length > 0 ? comparisonClientIds : selectedClientId ? [selectedClientId] : []

        if (targets.length === 0) {
            setComparisonSummaries([])
            setComparisonError(null)
            setComparisonLoading(false)
            return () => {
                isCancelled = true
            }
        }

        const loadComparison = async () => {
            setComparisonLoading(true)
            setComparisonError(null)
            try {
                const token = await getIdToken()

                const params = new URLSearchParams()
                targets.forEach((clientId) => {
                    if (clientId) {
                        params.append('clientIds', clientId)
                    }
                })
                params.set('pageSize', '250')

                const financeRequests = targets.map((clientId) => {
                    const financeParams = new URLSearchParams()
                    if (clientId) {
                        financeParams.set('clientId', clientId)
                    }
                    const endpoint = financeParams.toString() ? `/api/finance?${financeParams.toString()}` : '/api/finance'
                    return fetch(endpoint, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: 'no-store',
                    }).then((response) => resolveJson(response, 'Unable to load finance data for comparison') as Promise<FinanceSummaryResponse>)
                })

                const metricsEndpoint = params.toString() ? `/api/metrics?${params.toString()}` : '/api/metrics'
                const metricsPromise = fetch(metricsEndpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                }).then((response) => resolveJson(response, 'Unable to load metrics for comparison') as Promise<{ metrics?: MetricRecord[] }>)

                const [financeEnvelopes, metricsEnvelope] = await Promise.all([Promise.all(financeRequests), metricsPromise])

                // Extract data from envelopes
                const financeResponses = financeEnvelopes.map(env => (env as Record<string, unknown>)?.data || env) as FinanceSummaryResponse[]
                const metricsData = ((metricsEnvelope as Record<string, unknown>)?.data || metricsEnvelope) as { metrics?: MetricRecord[] }

                const groupedMetrics = groupMetricsByClient(metricsData.metrics ?? [])

                const summaries = targets.map((clientId, index) => {
                    const financeData = financeResponses[index] ?? null
                    const metricsForClient = groupedMetrics.get(clientId) ?? []
                    const clientName = clients.find((client) => client.id === clientId)?.name ?? 'Workspace'

                    return buildClientComparisonSummary({
                        clientId,
                        clientName,
                        finance: financeData,
                        metrics: metricsForClient,
                        periodDays: comparisonPeriodDays,
                    })
                })

                if (!isCancelled) {
                    const ordered = [...summaries].sort((a, b) => {
                        if (a.totalRevenue === b.totalRevenue) {
                            return b.totalAdSpend - a.totalAdSpend
                        }
                        return b.totalRevenue - a.totalRevenue
                    })
                    setComparisonSummaries(ordered)
                }
            } catch (error) {
                if (!isCancelled) {
                    setComparisonSummaries([])
                    setComparisonError(getErrorMessage(error, 'Unable to build comparison view'))
                }
            } finally {
                if (!isCancelled) {
                    setComparisonLoading(false)
                }
            }
        }

        void loadComparison()

        return () => {
            isCancelled = true
        }
    }, [clients, comparisonClientIds, comparisonPeriodDays, getIdToken, selectedClientId, user?.id, isPreviewMode])

    const comparisonInsights = useMemo<ComparisonInsight[]>(() => {
        if (comparisonSummaries.length === 0) {
            return []
        }

        const roasLeader = [...comparisonSummaries]
            .filter((summary) => Number.isFinite(summary.roas) && summary.roas !== 0)
            .sort((a, b) => (b.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : b.roas) - (a.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : a.roas))[0]

        const spendLeader = [...comparisonSummaries].sort((a, b) => b.totalAdSpend - a.totalAdSpend)[0]
        const cpaRisk = [...comparisonSummaries]
            .filter((summary) => summary.cpa !== null)
            .sort((a, b) => (b.cpa ?? 0) - (a.cpa ?? 0))[0]

        const insights: ComparisonInsight[] = []

        if (roasLeader) {
            insights.push({
                id: 'roas-leader',
                title: 'Top ROAS performer',
                highlight: roasLeader.clientName,
                body: `${formatRoas(roasLeader.roas)} over the past ${roasLeader.periodDays} days`,
                tone: 'positive',
                icon: Trophy,
            })
        }

        if (spendLeader) {
            insights.push({
                id: 'spend-leader',
                title: 'Highest ad investment',
                highlight: spendLeader.clientName,
                body: `${formatCurrency(spendLeader.totalAdSpend, spendLeader.currency)} spent`,
                tone: 'neutral',
                icon: ArrowUpRight,
            })
        }

        if (cpaRisk) {
            insights.push({
                id: 'cpa-risk',
                title: 'Rising CPA risk',
                highlight: cpaRisk.clientName,
                body: `${formatCpa(cpaRisk.cpa, cpaRisk.currency)} per conversion`,
                tone: 'warning',
                icon: TriangleAlert,
            })
        }

        return insights
    }, [comparisonSummaries])

    const comparisonAggregate = useMemo<ComparisonAggregate | null>(() => {
        if (comparisonSummaries.length === 0) {
            return null
        }
        const totalRevenue = comparisonSummaries.reduce((sum, summary) => sum + summary.totalRevenue, 0)
        const totalAdSpend = comparisonSummaries.reduce((sum, summary) => sum + summary.totalAdSpend, 0)
        const totalOutstanding = comparisonSummaries.reduce((sum, summary) => sum + summary.outstanding, 0)
        const currencySet = new Set(comparisonSummaries.map((summary) => summary.currency))
        const singleCurrency = currencySet.size === 1 ? comparisonSummaries[0].currency : null
        const avgRoas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : totalRevenue > 0 ? Number.POSITIVE_INFINITY : null

        return {
            totalRevenue,
            totalAdSpend,
            totalOutstanding,
            avgRoas,
            selectionCount: comparisonSummaries.length,
            currency: singleCurrency,
            mixedCurrencies: singleCurrency === null,
        }
    }, [comparisonSummaries])

    return {
        comparisonSummaries,
        comparisonLoading,
        comparisonError,
        comparisonInsights,
        comparisonAggregate,
        comparisonTargets,
        comparisonHasSelection,
    }
}
