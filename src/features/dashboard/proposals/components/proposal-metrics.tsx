'use client';
import { useMemo } from 'react';
import { ProposalMetricsGrid, ProposalMetricsLoadingGrid, } from './proposal-metrics-sections';
import { logError } from '@/lib/convex-errors';
import type { ProposalDraft } from '@/types/proposals';
import { formatPipelineValue, parseProposalPipelineValue } from '../utils/pipeline-value';
import type { ProposalMetricStat } from './proposal-metrics-sections';
interface ProposalMetricsProps {
    proposals: ProposalDraft[];
    isLoading?: boolean;
}
function getDefaultStats() {
    return [
        {
            label: 'Total Proposals',
            value: '0',
            description: 'Drafts and submitted',
            color: 'text-info',
            bg: 'bg-info/10',
        },
        {
            label: 'Ready for Pitch',
            value: '0',
            description: 'Generated decks',
            color: 'text-success',
            bg: 'bg-success/10',
        },
        {
            label: 'Sent to Clients',
            value: '0',
            description: 'Awaiting approval',
            color: 'text-warning',
            bg: 'bg-warning/10',
        },
        {
            label: 'Pipeline Value',
            value: '$0',
            description: 'Estimated total',
            color: 'text-info',
            bg: 'bg-info/10',
        },
    ] satisfies ProposalMetricStat[];
}
export function ProposalMetrics({ proposals, isLoading = false }: ProposalMetricsProps) {
    const stats = (() => {
        // Early return if proposals is not a valid array
        if (!proposals || !Array.isArray(proposals)) {
            return getDefaultStats();
        }
        try {
            // Filter out null/undefined proposals or those with missing formData
            const validProposals = proposals.filter((p): p is ProposalDraft => p != null && typeof p === 'object');
            const total = validProposals.length;
            const ready = validProposals.filter((p) => p.status === 'ready').length;
            const sent = validProposals.filter((p) => p.status === 'sent').length;
            // Sum upper-bound values from proposalSize (e.g. "£5,000 – £10,000" or "$10k - $25k")
            let totalValue = 0;
            for (const p of validProposals) {
                totalValue += parseProposalPipelineValue(p?.formData?.value?.proposalSize);
            }
            return [
                {
                    label: 'Total Proposals',
                    value: total.toString(),
                    description: 'Drafts and submitted',
                    color: 'text-info',
                    bg: 'bg-info/10',
                },
                {
                    label: 'Ready for Pitch',
                    value: ready.toString(),
                    description: 'Generated decks',
                    color: 'text-success',
                    bg: 'bg-success/10',
                },
                {
                    label: 'Sent to Clients',
                    value: sent.toString(),
                    description: 'Awaiting approval',
                    color: 'text-warning',
                    bg: 'bg-warning/10',
                },
                {
                    label: 'Pipeline Value',
                    value: formatPipelineValue(totalValue),
                    description: 'Estimated total',
                    color: 'text-info',
                    bg: 'bg-info/10',
                },
            ];
        }
        catch (error) {
            logError(error, 'ProposalMetrics:stats');
            return getDefaultStats();
        }
    })();
    // Safe length check
    const proposalCount = Array.isArray(proposals) ? proposals.length : 0;
    if (isLoading && proposalCount === 0) {
        return <ProposalMetricsLoadingGrid />;
    }
    return <ProposalMetricsGrid stats={stats}/>;
}
