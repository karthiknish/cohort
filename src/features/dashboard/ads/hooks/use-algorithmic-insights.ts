'use client';
import { useMemo } from 'react';
import { analyzeAdPerformance, type AlgorithmicInsight, type MetricDataPoint, type PerformanceAnalysis, } from '@/lib/ad-algorithms';
import { normalizeProviderId } from '@/lib/themes';
import { providerSummariesToSyntheticMetrics } from '../components/insights-chart-utils';
import type { MetricRecord, ProviderSummary } from '../components/types';
// =============================================================================
// TYPES
// =============================================================================
export interface UseAlgorithmicInsightsOptions {
    /** Processed metrics from useAdsMetrics */
    metrics: MetricRecord[];
    /** Provider summaries calculated from metrics */
    providerSummaries: Record<string, ProviderSummary>;
    /** Whether metrics are currently loading */
    loading?: boolean;
}
export interface UseAlgorithmicInsightsReturn {
    /** Full performance analysis with all algorithms */
    analysis: PerformanceAnalysis | null;
    /** All generated insights across platforms */
    insights: AlgorithmicInsight[];
    /** Per-provider insights */
    providerInsights: Record<string, AlgorithmicInsight[]>;
    /** Cross-platform budget reallocation suggestions */
    budgetSuggestions: AlgorithmicInsight[];
    /** Overall efficiency score (0-100) */
    globalEfficiencyScore: number;
    /** Per-provider efficiency scores */
    providerEfficiencyScores: Record<string, number>;
    /** Whether there are critical insights */
    hasCriticalInsights: boolean;
    /** Whether there are warning insights */
    hasWarningInsights: boolean;
    /** Count of insights by level */
    insightCounts: {
        success: number;
        warning: number;
        info: number;
        critical: number;
    };
}
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function convertToDataPoints(metrics: MetricRecord[]): MetricDataPoint[] {
    return metrics.map(m => ({
        date: m.date,
        providerId: normalizeProviderId(m.providerId),
        accountId: m.accountId,
        spend: m.spend,
        revenue: m.revenue ?? 0,
        clicks: m.clicks,
        conversions: m.conversions,
        impressions: m.impressions,
    }));
}
// =============================================================================
// HOOK
// =============================================================================
/**
 * Hook for calculating algorithmic insights from ad metrics
 * Uses the modular ad-algorithms library to generate comprehensive performance analysis
 */
export function useAlgorithmicInsights(options: UseAlgorithmicInsightsOptions): UseAlgorithmicInsightsReturn {
    const { metrics, providerSummaries, loading } = options;
    const metricsForAnalysis = (() => {
        if (metrics.length > 0)
            return metrics;
        return providerSummariesToSyntheticMetrics(providerSummaries);
    })();
    // Run the full performance analysis
    const analysis = (() => {
        if (loading || metricsForAnalysis.length === 0)
            return null;
        const dataPoints = convertToDataPoints(metricsForAnalysis);
        return analyzeAdPerformance(dataPoints);
    })();
    // Extract insights
    const insights = analysis?.insights || [];
    // Group insights by provider
    const providerInsights = (() => {
        if (!analysis)
            return {};
        const grouped: Record<string, AlgorithmicInsight[]> = {};
        for (const insight of insights) {
            const providers = insight.relatedProviders || ['global'];
            for (const provider of providers) {
                if (!grouped[provider])
                    grouped[provider] = [];
                grouped[provider].push(insight);
            }
        }
        return grouped;
    })();
    // Extract budget suggestions
    const budgetSuggestions = insights.filter(i => i.type === 'budget');
    // Get efficiency scores
    const globalEfficiencyScore = analysis?.globalEfficiencyScore || 0;
    const providerEfficiencyScores = analysis?.providerEfficiencyScores || {};
    // Check for critical/warning insights
    const hasCriticalInsights = insights.some(i => i.level === 'critical');
    const hasWarningInsights = insights.some(i => i.level === 'warning');
    // Count insights by level
    const insightCounts = (() => {
        const counts = { success: 0, warning: 0, info: 0, critical: 0 };
        for (const insight of insights) {
            if (insight.level in counts) {
                counts[insight.level as keyof typeof counts]++;
            }
        }
        return counts;
    })();
    return {
        analysis,
        insights,
        providerInsights,
        budgetSuggestions,
        globalEfficiencyScore,
        providerEfficiencyScores,
        hasCriticalInsights,
        hasWarningInsights,
        insightCounts,
    };
}
